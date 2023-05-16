import { CanActivate, ExecutionContext, HttpException, HttpStatus, Injectable, Type } from "@nestjs/common";

export const UserTypeGuard: (...types: string[]) => Type<CanActivate> = createUserTypeGuard;


function createUserTypeGuard(...types: string[]) : Type<CanActivate> {
  class MixinUserTypeGuard implements CanActivate {
    canActivate(context: ExecutionContext) {
      const user = context.switchToHttp().getRequest().user;

      if (!user) {
        throw new HttpException('Invalid user', HttpStatus.UNAUTHORIZED);
      }

      if (user.admin) return true; // Admin darf alles

      if(!types.includes('user')) {
        throw new HttpException('No access rights', HttpStatus.UNAUTHORIZED);
      }

      return true;
    }
  }

  return MixinUserTypeGuard;
}