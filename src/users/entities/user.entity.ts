import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { SpaceUser } from '../../spaces/entities/space-user.entity';
import { Memory } from '../../memories/entities/memory.entity';
import { Invitation } from '../../invitations/entities/invitation.entity';

@Entity('users')
export class User {
  // PrimaryGeneratedColumn with 'uuid' generates a unique ID for each user
  // UUIDs are better than sequential numbers because they're globally unique
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Column with unique: true ensures no two users can have the same email
  @Column({ unique: true })
  email: string;

  // Store password (will be hashed with bcrypt before saving)
  // IMPORTANT: Never store plain text passwords!
  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  // Tracks if user has verified their email address
  // default: false means user starts unverified
  @Column({ default: false })
  isEmailVerified: boolean;

  // Stores token for email verification
  // nullable: true means it can be null (empty)
  @Column({ type: 'text', nullable: true })
  emailVerificationToken: string | null;

  // Stores token for password reset
  @Column({ type: 'text', nullable: true })
  passwordResetToken: string | null;

  // Stores when password reset token expires
  @Column({ type: 'timestamp', nullable: true })
  passwordResetExpires: Date | null;

  // Links to the space user is currently in
  // Users can only be in one space at a time
  @Column({ type: 'uuid', nullable: true })
  currentSpaceId: string | null;

  // CreateDateColumn automatically sets creation time
  @CreateDateColumn()
  createdAt: Date;

  // UpdateDateColumn automatically updates on any change
  @UpdateDateColumn()
  updatedAt: Date;

  // OneToMany relationship: One user can have many space memberships
  // This allows us to track all spaces a user has been in
  @OneToMany(() => SpaceUser, (spaceUser) => spaceUser.user)
  spaceUsers: SpaceUser[];

  // OneToMany relationship: One user can create many memories
  @OneToMany(() => Memory, (memory) => memory.createdByUser)
  memories: Memory[];

  // OneToMany relationship: One user can send many invitations
  @OneToMany(() => Invitation, (invitation) => invitation.inviter)
  sentInvitations: Invitation[];
}
