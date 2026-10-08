import { IsString, IsOptional, MinLength } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @IsOptional()
  currentPassword?: string; // Required for password change

  @IsString()
  @MinLength(6, { message: 'New password must be at least 6 characters long' })
  @IsOptional()
  newPassword?: string;
}