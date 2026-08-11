import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  UserPreferencesEntity,
  AcademicScoreEntity,
  RecommendationEntity,
} from '../database/entities';

const PREF_FIELDS = [
  'intendedMajor',
  'degreeLevel',
  'preferredRegions',
  'preferredCountries',
  'budget',
  'gpa',
  'languageRequirements',
  'extracurriculars',
  'studyMode',
  'startDate',
  'surveyCompleted',
] as const;

@Controller('preferences')
export class PreferencesController {
  constructor(
    @InjectRepository(UserPreferencesEntity)
    private readonly prefs: Repository<UserPreferencesEntity>,
    @InjectRepository(AcademicScoreEntity)
    private readonly scores: Repository<AcademicScoreEntity>,
    @InjectRepository(RecommendationEntity)
    private readonly recommendations: Repository<RecommendationEntity>,
  ) {}

  /** Everything about a user in one call: preferences, academic scores, recent AI recommendations. */
  @Get()
  async get(@Query('email') email?: string) {
    const e = (email || '').trim().toLowerCase();
    const [preferences, scores, recommendations] = await Promise.all([
      e ? this.prefs.findOne({ where: { userEmail: e } }) : null,
      e ? this.scores.find({ where: { userEmail: e }, order: { id: 'ASC' } }) : [],
      e
        ? this.recommendations.find({ where: { userEmail: e }, order: { id: 'DESC' }, take: 20 })
        : [],
    ]);
    return { preferences, scores, recommendations };
  }

  /** Upsert a user's survey/settings preferences (only provided fields are written). */
  @Put()
  async upsert(@Body() body: any) {
    const email = (body.email || '').trim().toLowerCase();
    if (!email) throw new BadRequestException('email is required');

    const patch: Record<string, unknown> = {};
    for (const f of PREF_FIELDS) {
      if (body[f] !== undefined) patch[f] = body[f];
    }

    let row = await this.prefs.findOne({ where: { userEmail: email } });
    if (row) {
      Object.assign(row, patch);
      return this.prefs.save(row);
    }
    try {
      return await this.prefs.save({ userEmail: email, ...patch } as any);
    } catch {
      // Two tabs saving for the same new user can race on the unique email
      // constraint — fall back to updating the row the winner created.
      const existing = await this.prefs.findOne({ where: { userEmail: email } });
      if (existing) {
        Object.assign(existing, patch);
        return this.prefs.save(existing);
      }
      throw new BadRequestException('Could not save preferences');
    }
  }

  /** Replace a user's academic scores (e.g. GPA, SAT, IELTS) with the given list. */
  @Put('scores')
  async replaceScores(@Body() body: any) {
    const email = (body.email || '').trim().toLowerCase();
    if (!email) throw new BadRequestException('email is required');

    await this.scores.delete({ userEmail: email });
    const rows = (Array.isArray(body.scores) ? body.scores : []).map((s: any) => ({
      userEmail: email,
      name: String(s.name || '').slice(0, 100),
      score: s.score !== undefined ? String(s.score).slice(0, 1000) : '',
      scale: String(s.scale || '').slice(0, 50),
      status: String(s.status || '').slice(0, 50),
    }));
    if (rows.length) return this.scores.save(rows);
    return [];
  }
}

@Controller('recommendations')
export class RecommendationsController {
  constructor(
    @InjectRepository(RecommendationEntity)
    private readonly recommendations: Repository<RecommendationEntity>,
  ) {}

  @Get()
  list(@Query('email') email?: string) {
    const e = (email || '').trim().toLowerCase();
    if (!e) return [];
    return this.recommendations.find({ where: { userEmail: e }, order: { id: 'DESC' }, take: 50 });
  }

  /** Remove one of the user's saved recommendation results. */
  @Delete(':id')
  async remove(@Param('id') id: string, @Body() body: any) {
    const email = (body?.email || '').trim().toLowerCase();
    const rec = await this.recommendations.findOne({ where: { id: parseInt(id, 10) } });
    if (!rec) throw new NotFoundException('Recommendation not found');
    if (rec.userEmail !== email) {
      throw new ForbiddenException('You can only delete your own recommendations');
    }
    await this.recommendations.delete(rec.id);
    return { ok: true };
  }

  /** Persist an AI recommendation result (query + response) for a user. */
  @Post()
  async create(@Body() body: any) {
    const email = (body.email || '').trim().toLowerCase();
    if (!email) throw new BadRequestException('email is required');
    const saved = await this.recommendations.save({
      userEmail: email,
      source: String(body.source || 'chat').slice(0, 50),
      query: String(body.query || '').slice(0, 4000),
      response: String(body.response || '').slice(0, 20000),
      results: body.results || null,
    } as any);

    // Keep the table bounded: retain only the latest 100 per user
    try {
      const latest = await this.recommendations.find({
        where: { userEmail: email },
        order: { id: 'DESC' },
        take: 100,
      });
      if (latest.length >= 100) {
        const ids = latest.map((r) => r.id);
        await this.recommendations
          .createQueryBuilder()
          .delete()
          .where('userEmail = :email AND id NOT IN (:...ids)', { email, ids })
          .execute();
      }
    } catch {
      // Pruning is best-effort
    }
    return saved;
  }
}
