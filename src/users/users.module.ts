import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { SpaceUser } from '../spaces/entities/space-user.entity';
import { Space } from '../spaces/entities/space.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, SpaceUser, Space])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}