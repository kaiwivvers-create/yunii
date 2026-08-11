import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  UserPreferencesEntity,
  AcademicScoreEntity,
  RecommendationEntity,
} from '../database/entities';
import { PreferencesController, RecommendationsController } from './preferences.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserPreferencesEntity,
      AcademicScoreEntity,
      RecommendationEntity,
    ]),
  ],
  controllers: [PreferencesController, RecommendationsController],
})
export class PreferencesModule {}
