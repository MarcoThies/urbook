import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseLoggerService } from "./database-logger.service";
import { LogEntity } from "./entities/log.entity";

@Module({
  imports: [ TypeOrmModule.forFeature([LogEntity]) ],
  providers: [ DatabaseLoggerService ],
  exports: [ DatabaseLoggerService ],
})
export class DatabaseLoggerModule {}
