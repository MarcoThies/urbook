import { Injectable, HttpException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDto } from './dto/user.dto';
import { CreateUserDto } from './dto/user.create.dto';
import { LoginUserDto } from './dto/user-login.dto';
import { comparePasswords } from "../shared/utils";
import { UserEntity } from "./entities/user.entity";
import { toUserDto } from "../shared/mapper";
import { randomBytes } from "crypto";
import { ExceptionHandler } from "@nestjs/core/errors/exception-handler";

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
  ) {}

  async findOne(options?: object): Promise<UserDto> {
    const user = await this.userRepo.findOne(options);
    return toUserDto(user);
  }

  async findByLogin({ username, password }: LoginUserDto): Promise<UserDto> {
    const user = await this.userRepo.createQueryBuilder("users")
      .where("users.username = :username", { username: username })
      .orWhere("users.email = :email", { email: username })
      .getOne();

    if (!user) throw new HttpException("User not found", 301);

    // compare passwords
    const areEqual = await comparePasswords(user.password, password);
    if (!areEqual) throw new HttpException("Invalid password", 302);

    return toUserDto(user);
  }

  async findByPayload({ username }: any): Promise<UserDto> {
    return await this.findOne({ where: { username: username } });
  }

  async create(userDto: CreateUserDto) {
    const { username, password, email } = userDto;

    // check if the user exists in the db
    const userInDb = await this.userRepo.findOne({ where: { username } });
    if (userInDb) throw new HttpException("username not available", 301);

    const mailInDb = await this.userRepo.findOne({ where: { email } });
    if (mailInDb) throw new HttpException("email already in use", 302);

    // save E-Mail ID to User DB
    const user: UserEntity = await this.userRepo.create({
      username,
      password,
      email
    });
    await this.userRepo.save(user);

  }
}
