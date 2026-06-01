import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { UserServiceRole } from '../../user-service-role/entities/user-service-role.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: true })
  firstname: string;

  @Column({ nullable: false })
  job: string;

  @Column({ nullable: true, unique: true })
  matricule: string;

  @Column({ nullable: false, unique: true })
  registration_number_professional_order: string;

  @Column({ nullable: false, unique: true })
  professional_order: string;

  @Column({ unique: true })
  email: string;

  @Column()
  phone: string;

  @Column()
  password: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => UserServiceRole, (usr) => usr.user)
  serviceRoles: UserServiceRole[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
