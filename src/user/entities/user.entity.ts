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

  // Ordre professionnel (ONM, ONIM...) : une catégorie partagée par de
  // nombreux soignants, donc PAS unique (seul le numéro d'inscription l'est).
  @Column({ nullable: false })
  professional_order: string;

  @Column({ unique: true })
  email: string;

  @Column()
  phone: string;

  @Column()
  password: string;

  @Column({ default: true })
  isActive: boolean;

  /** Photo de profil (petite image JPEG/PNG/WebP), jamais chargée dans les listes. */
  @Column({ type: 'bytea', nullable: true, select: false })
  photo: Buffer | null;

  @Column({ type: 'varchar', length: 40, nullable: true, select: false })
  photoType: string | null;

  /** Date de la photo actuelle (null = pas de photo) : sert aussi à rafraîchir le cache. */
  @Column({ type: 'timestamptz', nullable: true })
  photoMaj: Date | null;

  @OneToMany(() => UserServiceRole, (usr) => usr.user)
  serviceRoles: UserServiceRole[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
