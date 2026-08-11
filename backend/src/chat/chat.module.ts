import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { SettingsEntity } from '../database/entities';

@Module({
  imports: [TypeOrmModule.forFeature([SettingsEntity])],
  controllers: [ChatController],
  providers: [ChatService],
})
export class ChatModule {}
