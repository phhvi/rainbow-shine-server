import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export type UserInfo = {
  sub: string;
  email: string;
  firstName: string;
  lastName: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configServer: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configServer.get<string>('JWT_SECRET') || 'your_secret_key',
    });
  }
  validate(payload: UserInfo) {
    return {
      userId: payload.sub,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
    };
  }
}

// constructor(private configService: ConfigService) {
//   super({
//     // Extract JWT from the Authorization header
//     // Format: "Bearer <token>"
//     jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
//     // Use the secret key from environment variables
//     ignoreExpiration: false,
//     secretOrKey: configService.get<string>('JWT_SECRET') || 'your-secret-key',
//   });
// }
// This method is called after Passport verifies the JWT signature
// The payload is the decoded JWT
// validate(payload: UserInfo) {
//   // We return the user info that will be attached to the request object
//   // This is what gets returned when we use @Req() req.user
//   return {
//     userId: payload.sub,
//     email: payload.email,
//     firstName: payload.firstName,
//     lastName: payload.lastName,
//   };
// }
