import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';
import { SpaceUser } from '../spaces/entities/space-user.entity';
import { Space } from '../spaces/entities/space.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(SpaceUser)
    private spaceUserRepository: Repository<SpaceUser>,
    @InjectRepository(Space)
    private spaceRepository: Repository<Space>,
  ) {}

  /**
   * Get user profile by ID
   */
  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Remove sensitive information by destructuring
    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      password,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      emailVerificationToken,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      passwordResetToken,
      ...userWithoutSensitive
    } = user;

    return userWithoutSensitive as User;
  }

  /**
   * Update user profile
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Handle password change
    if (updateUserDto.currentPassword && updateUserDto.newPassword) {
      const isCurrentPasswordValid = await bcrypt.compare(
        updateUserDto.currentPassword,
        user.password,
      );

      if (!isCurrentPasswordValid) {
        throw new BadRequestException('Current password is incorrect');
      }

      // Hash new password
      const saltRounds = 12;
      user.password = await bcrypt.hash(updateUserDto.newPassword, saltRounds);
    }

    // Update other fields
    if (updateUserDto.firstName) {
      user.firstName = updateUserDto.firstName;
    }
    if (updateUserDto.lastName) {
      user.lastName = updateUserDto.lastName;
    }

    await this.usersRepository.save(user);

    // Remove sensitive information before returning
    const {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      password,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      emailVerificationToken,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      passwordResetToken,
      ...userWithoutSensitive
    } = user;

    return userWithoutSensitive as User;
  }

  /**
   * Delete user account and all related data
   * Implements our philosophy of clean breaks
   */
  async deleteUser(id: string): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['spaceUsers'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if user is in any space
    const spaceUsers = await this.spaceUserRepository.find({
      where: { userId: id, isActive: true },
      relations: ['space'],
    });

    for (const spaceUser of spaceUsers) {
      // Check if this is the last user in the space
      const activeUsersCount = await this.spaceUserRepository.count({
        where: { spaceId: spaceUser.spaceId, isActive: true },
      });

      if (activeUsersCount === 1) {
        // This is the last user - delete the space and all its memories
        // Clean break - no digital anchors left behind
        await this.spaceRepository.delete(spaceUser.spaceId);
      } else {
        // Mark this user as left the space
        spaceUser.isActive = false;
        spaceUser.leftAt = new Date();
        await this.spaceUserRepository.save(spaceUser);
      }
    }

    // Delete the user
    await this.usersRepository.delete(id);
  }

  /**
   * Get user with their current space information
   */
  async getUserWithSpace(
    id: string,
  ): Promise<Partial<User> & { currentSpace?: Space | null }> {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let currentSpace: Space | null = null;

    if (user.currentSpaceId) {
      currentSpace = await this.spaceRepository
        .createQueryBuilder('space')
        .leftJoinAndSelect('space.users', 'spaceUser')
        .leftJoinAndSelect('spaceUser.user', 'user')
        .where('space.id = :spaceId', { spaceId: user.currentSpaceId })
        .andWhere('spaceUser.isActive = :isActive', { isActive: true })
        .getOne();
    }

    // Remove sensitive info by destructuring
    const { password, emailVerificationToken, passwordResetToken, ...userWithoutSensitive } = user;

    return {
      ...userWithoutSensitive,
      currentSpace,
    };
  }
}