// import { Injectable } from '@nestjs/common';
// import { PassportStrategy } from '@nestjs/passport';
// import { Strategy } from 'passport-local';
// import { AuthService } from '../auth.service';

import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { Injectable } from '@nestjs/common';

// @Injectable()
// export class LocalStrategy extends PassportStrategy(Strategy) {
//   constructor(private authService: AuthService) {
//     super({
//       // Passport-local expects 'username' by default
//       // We're using email instead, so we need to tell it to look for 'email' field
//       usernameField: 'email',
//     });
//   }

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'email',
    });
  }
  async validate(email: string, password: string) {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new Error('Invalid email or password');
    }
    return user;
  }
}

//   // This method validates the user's credentials
//   // Passport calls this method with the email and password from the request
//   async validate(email: string, password: string): Promise<any> {
//     // Try to validate the user with these credentials
//     const user = await this.authService.validateUser(email, password);

//     // If validation fails, throw an error
//     if (!user) {
//       throw new Error('Invalid email or password');
//     }

//     // If successful, return the user object
//     // Passport will attach this to the request object
//     return user;
//   }
// }
