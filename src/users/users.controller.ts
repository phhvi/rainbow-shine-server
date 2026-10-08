import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard) // Protect all user routes
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * Get current user's profile
   * GET /users/me
   */
  @Get('me')
  async getProfile(@Request() req: any) {
    // req.user comes from JWT guard
    const userWithSpace = await this.usersService.getUserWithSpace(req.user.userId);
    return {
      user: userWithSpace,
      message: 'User profile retrieved successfully',
    };
  }

  /**
   * Update current user's profile
   * PUT /users/me
   */
  @Put('me')
  @HttpCode(HttpStatus.OK)
  async updateProfile(
    @Request() req: any,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const updatedUser = await this.usersService.update(
      req.user.userId,
      updateUserDto,
    );
    return {
      user: updatedUser,
      message: 'Profile updated successfully',
    };
  }

  /**
   * Delete current user's account
   * DELETE /users/me
   * Implements the clean break philosophy
   */
  @Delete('me')
  @HttpCode(HttpStatus.OK)
  async deleteAccount(@Request() req: any) {
    await this.usersService.deleteUser(req.user.userId);
    return {
      message:
        'Account deleted successfully. All associated spaces and memories have been removed.',
    };
  }

  /**
   * Get user by ID (for internal use or future features)
   * GET /users/:id
   */
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    return {
      user,
      message: 'User retrieved successfully',
    };
  }
}