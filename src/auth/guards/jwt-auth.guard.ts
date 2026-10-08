import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // This guard uses the JWT strategy we defined
  // It will:
  // 1. Extract the JWT from the Authorization header
  // 2. Verify the signature
  // 3. Validate the token isn't expired
  // 4. Attach the user payload to the request object
  //okay what is the use of this file? we have the strategies folder, the guards, the dto, ..
  //an then the service, the controller, ..... not to say we have auth and local auth
  // so far, we know that, auth is for jwt (check for each request)
  // and local auth for login into the web
  // there nothing here yet,
}
