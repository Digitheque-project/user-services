import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, Unique } from 'typeorm';

import { User } from '../../user/entities/user.entity';

@Entity('user_service_roles')
@Unique(['user', 'serviceId', 'roleId'])
export class UserServiceRole {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.serviceRoles, {
    onDelete: 'CASCADE',
  })
  user: User;

  @Column({ type: 'uuid' })
  serviceId: string;

  @Column({ type: 'uuid' })
  roleId: string;
}
