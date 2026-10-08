import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import {
  RegisterDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from './dto/auth.dto';
import { EmailService } from '../email/email.service';

export interface UserWithoutPassword {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isEmailVerified: boolean;
  emailVerificationToken?: string | null;
  passwordResetToken?: string | null;
  passwordResetExpires?: Date | null;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ message: string }> {
    const { email, password, firstName, lastName } = registerDto;

    //check if user already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('A user with this email already exists');
    }

    //hash the password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // create verification token
    const verificationToken = uuidv4();

    // create new user
    const user = this.usersRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      isEmailVerified: false,
      emailVerificationToken: verificationToken,
    });

    await this.usersRepository.save(user);

    // send verification email
    await this.emailService.sendVerificationEmail(email, verificationToken);
    return {
      message:
        'Registration succesful! Please check your email to verify your account',
    };
  }

  /**
   * valicate user credentials (used by local strategy)
   */
  async validateUser(
    email: string,
    password: string,
  ): Promise<UserWithoutPassword | null> {
    const user = await this.usersRepository.findOne({
      where: { email },
      select: [
        'id',
        'email',
        'password',
        'firstName',
        'lastName',
        'isEmailVerified',
      ],
    });

    if (!user) {
      return null;
    }

    //check if password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    //remove password from returned object
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as UserWithoutPassword;
  }

  /**
   * login user and return JWT
   */
  login(user: UserWithoutPassword): {
    access_token: string;
    user: Omit<
      UserWithoutPassword,
      'passwordResetToken' | 'passwordResetExpires' | 'emailVerificationToken'
    >;
  } {
    // check if email is verified
    if (!user.isEmailVerified) {
      throw new UnauthorizedException(
        'Please verify your email before logging in',
      );
    }

    // create jwt payload
    const payload = {
      sub: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };

    // generate jwt
    const access_token = this.jwtService.sign(payload);

    //remove sensitive info
    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      passwordResetToken,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      passwordResetExpires,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      emailVerificationToken,
      ...safeUser
    } = user;

    return { access_token, user: safeUser };
  }

  /**
   * verify user's email
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await this.usersRepository.findOne({
      where: { emailVerificationToken: token },
    });

    if (!user) {
      throw new BadRequestException('Invalid verification code');
    }

    // update user status
    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    await this.usersRepository.save(user);

    return { message: 'Email verified successfully! You can now log in.' };
  }

  /**
   * send password reset email
   * // normall, would send with the email right
   * // validate if there is one user with that email? if true, process to send the reset token, else throw error
   */
  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    // check if email valid
    const user = await this.usersRepository.findOne({
      where: { email: forgotPasswordDto.email },
    });

    if (!user) {
      // dont reveal if email exist or not for security
      return {
        message:
          'If an account with this email exists, a password reset link has been sent.',
      };
    }

    //generate reset password token (expires in 1 hour)
    const resetToken = uuidv4();
    const expiresAt = new Date(Date.now() + 3600000);

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = expiresAt;
    await this.usersRepository.save(user);

    //send reset email
    await this.emailService.sendPasswordResetEmail(
      forgotPasswordDto.email,
      resetToken,
    );

    return {
      message:
        'If an account with this email exists, a password reset link has been sent',
    };
  }

  /**
   * reset password with token
   */
  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const { password, token } = resetPasswordDto;

    const user = await this.usersRepository
      .createQueryBuilder('user')
      .where('user.passwordResetToken = :token', { token })
      .andWhere('user.passwordResetExpires > :now', { now: new Date() })
      .getOne();

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    //hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    //update user password
    user.password = hashedPassword;
    user.passwordResetExpires = null;
    user.passwordResetToken = null;
    await this.usersRepository.save(user);

    return {
      message:
        'Password reset sucessfully! You can now log in with your new password',
    };
  }
}

// export interface UserWithoutPassword {
//   id: string;
//   email: string;
//   firstName: string;
//   lastName: string;
//   isEmailVerified: boolean;
//   emailVerificationToken?: string | null;
//   passwordResetToken?: string | null;
//   passwordResetExpires?: Date | null;
// }

// @Injectable()
// export class AuthService {
//   constructor(
//     @InjectRepository(User)
//     private usersRepository: Repository<User>,
//     private jwtService: JwtService,
//     private emailService: EmailService,
//   ) {}

//   /**
//    * Register a new user
//    */
//   async register(registerDto: RegisterDto): Promise<{ message: string }> {
//     const { email, password, firstName, lastName } = registerDto;

//     // Check if user already exists
//     const existingUser = await this.usersRepository.findOne({
//       where: { email },
//     });

//     if (existingUser) {
//       throw new ConflictException('A user with this email already exists');
//     }
/**
 * Register a new user
 */

//     // Hash the password
//     const saltRounds = 12;
//     const hashedPassword = await bcrypt.hash(password, saltRounds);

//     // Create verification token
//     const verificationToken = uuidv4();

//     // Create new user
//     const user = this.usersRepository.create({
//       email,
//       password: hashedPassword,
//       firstName,
//       lastName,
//       isEmailVerified: false,
//       emailVerificationToken: verificationToken,
//     });

//     await this.usersRepository.save(user);

//     // Send verification email
//     await this.emailService.sendVerificationEmail(email, verificationToken);

//     return {
//       message:
//         'Registration successful! Please check your email to verify your account.',
//     };
//   }

//   /**
//    * Validate user credentials (used by local strategy)
//    */
//   async validateUser(
//     email: string,
//     password: string,
//   ): Promise<UserWithoutPassword | null> {
//     const user = await this.usersRepository.findOne({
//       where: { email },
//       select: [
//         'id',
//         'email',
//         'password',
//         'firstName',
//         'lastName',
//         'isEmailVerified',
//       ],
//     });

//     if (!user) {
//       return null;
//     }

//     // Check if password is correct
//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) {
//       return null;
//     }

//     // Remove password from returned object
//     // eslint-disable-next-line @typescript-eslint/no-unused-vars
//     const { password: _, ...userWithoutPassword } = user;

//     return userWithoutPassword as UserWithoutPassword;
//   }

//   /**
//    * Login user and return JWT
//    */
//   login(user: UserWithoutPassword): {
//     access_token: string;
//     user: Omit<
//       UserWithoutPassword,
//       'passwordResetToken' | 'passwordResetExpires' | 'emailVerificationToken'
//     >;
//   } {
//     // Check if email is verified
//     if (!user.isEmailVerified) {
//       throw new UnauthorizedException(
//         'Please verify your email before logging in',
//       );
//     }

//     // Create JWT payload
//     const payload = {
//       sub: user.id,
//       email: user.email,
//       firstName: user.firstName,
//       lastName: user.lastName,
//     };

//     // Generate JWT
//     const access_token = this.jwtService.sign(payload);

//     // Remove sensitive info
//     const {
//       passwordResetToken, // eslint-disable-line @typescript-eslint/no-unused-vars
//       passwordResetExpires, // eslint-disable-line @typescript-eslint/no-unused-vars
//       emailVerificationToken, // eslint-disable-line @typescript-eslint/no-unused-vars
//       ...safeUser
//     } = user;

//     return {
//       access_token,
//       user: safeUser,
//     };
//   }

//   /**
//    * Verify user's email
//    */
//   async verifyEmail(token: string): Promise<{ message: string }> {
//     const user = await this.usersRepository.findOne({
//       where: { emailVerificationToken: token },
//     });

//     if (!user) {
//       throw new BadRequestException('Invalid verification token');
//     }

//     // Update user status
//     user.isEmailVerified = true;
//     user.emailVerificationToken = null;
//     await this.usersRepository.save(user);

//     return { message: 'Email verified successfully! You can now log in.' };
//   }

//   /**
//    * Send password reset email
//    */
//   async forgotPassword(
//     forgotPasswordDto: ForgotPasswordDto,
//   ): Promise<{ message: string }> {
//     const { email } = forgotPasswordDto;

//     const user = await this.usersRepository.findOne({ where: { email } });
//     if (!user) {
//       // Don't reveal if email exists or not (security)
//       return {
//         message:
//           'If an account with this email exists, a password reset link has been sent.',
//       };
//     }

//     // Generate reset token (expires in 1 hour)
//     const resetToken = uuidv4();
//     const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

//     user.passwordResetToken = resetToken;
//     user.passwordResetExpires = expiresAt;
//     await this.usersRepository.save(user);

//     // Send reset email
//     await this.emailService.sendPasswordResetEmail(email, resetToken);

//     return {
//       message:
//         'If an account with this email exists, a password reset link has been sent.',
//     };
//   }

//   /**
//    * Reset password with token
//    */
//   async resetPassword(
//     resetPasswordDto: ResetPasswordDto,
//   ): Promise<{ message: string }> {
//     const { token, password } = resetPasswordDto;

//     const user = await this.usersRepository
//       .createQueryBuilder('user')
//       .where('user.passwordResetToken = :token', { token })
//       .andWhere('user.passwordResetExpires > :now', { now: new Date() })
//       .getOne();

//     if (!user) {
//       throw new BadRequestException('Invalid or expired reset token');
//     }

//     // Hash new password
//     const saltRounds = 12;
//     const hashedPassword = await bcrypt.hash(password, saltRounds);

//     // Update user password
//     user.password = hashedPassword;
//     user.passwordResetToken = null;
//     user.passwordResetExpires = null;
//     await this.usersRepository.save(user);

//     return {
//       message:
//         'Password reset successfully! You can now log in with your new password.',
//     };
//   }
// }
