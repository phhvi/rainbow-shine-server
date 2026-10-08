import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MemoriesModule } from './memories/memories.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { Memory } from './memories/entities/memory.entity';
import { Space } from './spaces/entities/space.entity';
import { SpaceUser } from './spaces/entities/space-user.entity';
import { User } from './users/entities/user.entity';
import { Invitation } from './invitations/entities/invitation.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [Memory, Space, SpaceUser, User, Invitation],
      synchronize: true, // Set to false in production
      ssl:
        process.env.DATABASE_SSL === 'true'
          ? { rejectUnauthorized: false }
          : false,
    }),
    MemoriesModule,
    AuthModule,
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
