import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { UserWithoutPassword } from '../auth.service';

export const GetUser = createParamDecorator(
  (
    data: string | undefined,
    ctx: ExecutionContext,
    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  ): UserWithoutPassword | any => {
    const request = ctx.switchToHttp().getRequest<Request>();

    const user = request.user as UserWithoutPassword;
    return data ? (user?.[data] as any) : user;
  },
);
