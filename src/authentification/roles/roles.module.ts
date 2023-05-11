import { Module } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { AuthService } from "../auth.service";

@Module({
  providers: [RolesGuard],
  exports: [RolesGuard],
})
export class RolesModule {}