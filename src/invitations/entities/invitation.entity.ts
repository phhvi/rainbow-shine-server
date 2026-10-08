import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Space } from '../../spaces/entities/space.entity';
import { User } from '../../users/entities/user.entity';

@Entity('invitations')
export class Invitation {
  // Generate a unique UUID for each invitation
  // This will be part of the invitation link
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Foreign key to the space being invited to
  @Column()
  spaceId: string;

  // Foreign key to the user who sent the invitation
  @Column()
  inviterId: string;

  // Email of the person being invited
  // Store this even if they don't have an account yet
  @Column()
  inviteeEmail: string;

  // Unique token for the invitation link
  // This is what we'll send in the email
  // Adding @Index makes lookups faster
  @Column({ unique: true })
  @Index()
  token: string;

  // Track if invitation has been accepted
  @Column({ default: false })
  isAccepted: boolean;

  // When the invitation expires (7 days from creation is reasonable)
  @Column()
  expiresAt: Date;

  // Track when invitation was actually accepted
  @Column({ nullable: true })
  acceptedAt: Date;

  // Track when invitation was sent
  @CreateDateColumn()
  createdAt: Date;

  // RELATIONSHIPS

  // Each invitation belongs to one space
  @ManyToOne(() => Space, (space) => space.invitations)
  @JoinColumn({ name: 'spaceId' })
  space: Space;

  // Each invitation is sent by one user
  @ManyToOne(() => User, (user) => user.sentInvitations)
  @JoinColumn({ name: 'inviterId' })
  inviter: User;
}
