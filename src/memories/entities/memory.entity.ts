import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Space } from '../../spaces/entities/space.entity';
import { User } from '../../users/entities/user.entity';

@Entity('memories')
export class Memory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column()
  date: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  latitude: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  longitude: number | null;

  // NEW: Which space this memory belongs to
  // Every memory must be in a space (nullable for migration)
  @Column({ nullable: true })
  spaceId: string | null;

  // NEW: Which user created this memory
  // We track who created each memory for attribution
  @Column({ nullable: true })
  createdByUserId: string | null;

  // Note: No soft delete for memories
  // When a memory is deleted or its space is deleted, it's permanently removed
  // This respects the philosophy that true memories exist in the heart, not in storage

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // RELATIONSHIPS

  // Each memory belongs to one space
  // When a space is deleted, all memories in it are also deleted
  @ManyToOne(() => Space, (space) => space.memories, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'spaceId' })
  space: Space;

  // Each memory is created by one user
  // When a user is deleted, their memories remain (belong to the space)
  @ManyToOne(() => User, (user) => user.memories)
  @JoinColumn({ name: 'createdByUserId' })
  createdByUser: User;
}
