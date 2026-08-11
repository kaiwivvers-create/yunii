import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserEntity, RoleEntity, SettingsEntity } from '../database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, RoleEntity, SettingsEntity])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
