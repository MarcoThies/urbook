import { Injectable, CanActivate, ExecutionContext, HttpException, HttpStatus } from "@nestjs/common";
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './roles.decorator';
import { AuthService } from "../auth.service";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    console.log('Rollen regex', requiredRoles);
    if (!requiredRoles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    console.log('User from Passwort.JS',user);

    if (!user) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }

    // Assuming the `admin` property is a boolean indicating whether the user is an admin
    const isUserAdmin = user.admin;

    console.log("Die Nutzer-Rolle ist: "+user.admin);
    console.log("Admin rechte? "+isUserAdmin);

    // If the user is an admin, they can access any route
    if (isUserAdmin) {
      return true;
    }

    console.log("Required Roles are: ",requiredRoles);
    // Otherwise, check if the user role is included in the required roles
    return requiredRoles.includes('user');
  }
}
