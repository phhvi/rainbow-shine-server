import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { SpaceUser } from './space-user.entity';
import { Memory } from '../../memories/entities/memory.entity';
import { Invitation } from '../../invitations/entities/invitation.entity';

@Entity('spaces')
export class Space {
  // Each space gets a unique UUID
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Name of the space (e.g., "John & Jane's Adventures")
  @Column()
  name: string;

  // Optional description of the space
  // nullable: true allows this field to be empty
  @Column({ nullable: true })
  description: string;

  // Note: No isActive field - we'll use hard delete
  // When both users leave, the space and its memories will be deleted
  // This honors the philosophy that memories live in the heart, not in databases

  // Track when this space was created
  @CreateDateColumn()
  createdAt: Date;

  // Track when this space was last modified
  @UpdateDateColumn()
  updatedAt: Date;

  // RELATIONSHIPS

  // One space can have multiple users (max 2, enforced in our business logic)
  @OneToMany(() => SpaceUser, (spaceUser) => spaceUser.space)
  users: SpaceUser[];

  // One space can have many memories
  @OneToMany(() => Memory, (memory) => memory.space)
  memories: Memory[];

  // One space can have multiple invitations
  @OneToMany(() => Invitation, (invitation) => invitation.space)
  invitations: Invitation[];
}
