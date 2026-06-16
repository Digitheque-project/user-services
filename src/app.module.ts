import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { APP_GUARD } from '@nestjs/core';
import { UserModule } from './user/user.module';
import { UserServiceRoleModule } from './user-service-role/user-service-role.module';
import { UserServiceRole } from './user-service-role/entities/user-service-role.entity';
import { User } from './user/entities/user.entity';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { JwtStrategy } from './common/strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),

        autoLoadEntities: true,
        entities: [User, UserServiceRole],

        // === CORRECTION SSL ===
        ssl: configService.get('DB_SSL') === 'true'
          ? { rejectUnauthorized: false }
          : false,

        synchronize: process.env.NODE_ENV !== 'production', // Désactivé en prod (sécurité)
        migrationsRun: true,   // Recommandé
        // migrations: [__dirname + '/migrations/*{.ts,.js}'], // à activer plus tard
      }),
    }),
    UserModule,
    UserServiceRoleModule,
  ],
  providers: [
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule { }
