import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ChatModule } from './chat/chat.module';
import { AdminModule } from './admin/admin.module';
import { DatabaseModule } from './database/database.module';
import { PreferencesModule } from './preferences/preferences.module';

@Module({
  imports: [DatabaseModule, AuthModule, ChatModule, AdminModule, PreferencesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
