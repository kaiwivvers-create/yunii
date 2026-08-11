import { Injectable, Module, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { mkdirSync } from 'fs';
import { join } from 'path';

/**
 * Parses a connection string such as
 *   postgres://user:pass@host:5432/dbname
 *   postgresql://user:pass@host:5432/dbname?sslmode=require
 * into { host, port, username, password, database, ssl }.
 * Returns null when the value doesn't look like a URL.
 */
function parseConnectionUrl(raw: string | undefined): any | null {
  if (!raw) return null;
  const url = raw.trim();
  if (!/^postgres(ql)?:\/\//i.test(url) && !/^mysql:\/\//i.test(url)) return null;

  try {
    const parsed = new URL(url);
    const sslMode = (parsed.searchParams.get('sslmode') || '').toLowerCase();
    const wantsSsl = ['require', 'verify-ca', 'verify-full', 'prefer', 'true'].includes(sslMode);
    return {
      scheme: parsed.protocol.replace(':', ''), // 'postgres' | 'postgresql' | 'mysql'
      host: parsed.hostname,
      port: parsed.port ? parseInt(parsed.port, 10) : undefined,
      username: decodeURIComponent(parsed.username || 'postgres'),
      password: decodeURIComponent(parsed.password || ''),
      database: decodeURIComponent(parsed.pathname.replace(/^\//, '')) || 'universe',
      ssl: wantsSsl,
    };
  } catch {
    return null;
  }
}
import {
  UserEntity,
  RoleEntity,
  UniversityEntity,
  RegionEntity,
  SettingsEntity,
  ActivityLogEntity,
  VersionEntity,
  TrashItemEntity,
  BookmarkEntity,
  ReviewEntity,
  ApplicationEntity,
  UserPreferencesEntity,
  AcademicScoreEntity,
  RecommendationEntity,
  ProgramEntity,
  UniversityRequirementEntity,
  ScholarshipEntity,
} from './entities';
import { seedDatabase, backfillUniversityRelations } from './seed';

export const ALL_ENTITIES = [
  UserEntity,
  RoleEntity,
  UniversityEntity,
  RegionEntity,
  SettingsEntity,
  ActivityLogEntity,
  VersionEntity,
  TrashItemEntity,
  BookmarkEntity,
  ReviewEntity,
  ApplicationEntity,
  UserPreferencesEntity,
  AcademicScoreEntity,
  RecommendationEntity,
  ProgramEntity,
  UniversityRequirementEntity,
  ScholarshipEntity,
];

function sqliteFile(config: ConfigService): string {
  const file = config.get('DB_FILE') || 'data/universe.sqlite';
  mkdirSync(join(process.cwd(), 'data'), { recursive: true });
  return join(process.cwd(), file);
}

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(private readonly dataSource: DataSource) {}

  async onApplicationBootstrap() {
    try {
      await seedDatabase(this.dataSource);
      // For databases that already had universities before the normalized
      // tables existed, populate programs/requirements/scholarships.
      await backfillUniversityRelations(this.dataSource);
    } catch (err) {
      console.error('Seeding failed:', err);
    }
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        // A connection string (DATABASE_URL) overrides individual DB_* settings,
        // so you can paste a provider URL (Neon, Supabase, Railway...) and go.
        const rawUrl =
          config.get('DATABASE_URL') ||
          config.get('DB_POSTGRES_URL') ||
          config.get('DB_MYSQL_URL');
        const fromUrl = parseConnectionUrl(rawUrl);

        // Driver comes from DB_TYPE when explicitly set, otherwise we infer it
        // from the connection URL scheme so pasting a postgres:// URL "just works"
        // even if DB_TYPE is left at the template default.
        const explicitType = (config.get('DB_TYPE') || '').toLowerCase();
        const urlType =
          (fromUrl && /^postgres(ql)?:/i.test(fromUrl.scheme) ? 'postgres' : '') ||
          (fromUrl && /^mysql:/i.test(fromUrl.scheme) ? 'mysql' : '');
        // A URL is explicit intent: it wins over the placeholder 'sqlite' default,
        // but an explicit non-sqlite DB_TYPE still takes precedence.
        const type =
          (explicitType && explicitType !== 'sqlite' ? explicitType : '') || urlType || explicitType || 'sqlite';
        const common = {
          autoLoadEntities: true,
          synchronize: config.get('DB_SYNCHRONIZE', 'true') !== 'false',
        };
        const sslRequested = (config.get('DB_SSL') || '').toLowerCase() === 'true';
        const ssl =
          fromUrl?.ssl || sslRequested
            ? { rejectUnauthorized: false }
            : undefined;

        if (type === 'mysql') {
          return {
            type: 'mysql',
            host: fromUrl?.host || config.get('DB_HOST', 'localhost'),
            port: fromUrl?.port || parseInt(config.get('DB_PORT', '3306'), 10),
            username: fromUrl?.username || config.get('DB_USER', 'root'),
            password: fromUrl?.password ?? config.get('DB_PASSWORD', ''),
            database: fromUrl?.database || config.get('DB_NAME', 'universe'),
            ssl,
            ...common,
          };
        }

        if (type === 'postgres') {
          return {
            type: 'postgres',
            host: fromUrl?.host || config.get('DB_HOST', 'localhost'),
            port: fromUrl?.port || parseInt(config.get('DB_PORT', '5432'), 10),
            username: fromUrl?.username || config.get('DB_USER', 'postgres'),
            password: fromUrl?.password ?? config.get('DB_PASSWORD', ''),
            database: fromUrl?.database || config.get('DB_NAME', 'universe'),
            ssl,
            ...common,
          };
        }

        return {
          type: 'better-sqlite3' as const,
          database: sqliteFile(config),
          ...common,
        };
      },
    }),
    TypeOrmModule.forFeature(ALL_ENTITIES),
  ],
  providers: [SeedService],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
