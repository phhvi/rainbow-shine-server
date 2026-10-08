import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Space } from './space.entity';

@Entity('space_users')
export class SpaceUser {
  // Regular auto-incrementing ID for join tables is fine
  @PrimaryGeneratedColumn()
  id: number;

  // Foreign key reference to the space
  @Column()
  spaceId: string;

  // Foreign key reference to the user
  @Column()
  userId: string;

  // Tracks whether this user is the owner of the space
  // The owner is the one who created the space
  @Column({ default: false })
  isOwner: boolean;

  // Track when this user joined the space
  @CreateDateColumn()
  joinedAt: Date;

  // Track when this user left the space (null if still active)
  // This allows us to keep historical records
  @Column({ nullable: true })
  leftAt: Date;

  // Whether this membership is currently active
  // We use soft delete for space memberships so we can track history
  @Column({ default: true })
  isActive: boolean;

  // RELATIONSHIPS

  // Many-to-One: Many space_users can belong to one space
  // When a space is deleted, all related space_users are also deleted
  @ManyToOne(() => Space, (space) => space.users, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'spaceId' }) // Tells TypeORM which column to use for the join
  space: Space;

  // Many-to-One: Many space_users can belong to one user
  // When a user is deleted, their space memberships are also deleted
  @ManyToOne(() => User, (user) => user.spaceUsers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;
}
