import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

// ---------------------------------------------------------------------------
// Users & roles
// ---------------------------------------------------------------------------

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: '' })
  name: string;

  @Index({ unique: true })
  @Column({ unique: true })
  email: string;

  @Column({ select: false, default: '' })
  passwordHash: string;

  @Column({ default: 'user' })
  role: string;

  @Column({ type: 'simple-json', nullable: true })
  permissions: string[] | null;

  @Column({ default: false })
  emailVerified: boolean;

  // Text (not varchar) so cropped data-URL avatars fit
  @Column({ type: 'text', default: '' })
  profilePicture: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('roles')
export class RoleEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ unique: true })
  name: string;

  @Column({ type: 'simple-json', nullable: true })
  permissions: string[] | null;

  @Column({ default: false })
  isSystem: boolean;
}

// ---------------------------------------------------------------------------
// Content: universities, regions, site settings
// ---------------------------------------------------------------------------

@Entity('universities')
export class UniversityEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: '' })
  name: string;

  @Column({ default: '' })
  location: string;

  @Column({ default: '' })
  province: string;

  @Column({ default: '' })
  region: string;

  @Column({ default: '' })
  description: string;

  @Column({ default: '' })
  image: string;

  @Column({ type: 'simple-json', nullable: true })
  details: any;

  @Column({ type: 'simple-json', nullable: true })
  rankings: any;

  @Column({ type: 'simple-json', nullable: true })
  pros: string[] | null;

  @Column({ type: 'simple-json', nullable: true })
  cons: string[] | null;

  @Column({ type: 'simple-json', nullable: true })
  scholarships: any;

  @Column({ type: 'simple-json', nullable: true })
  applicationDeadlines: any;

  @Column({ type: 'simple-json', nullable: true })
  costOfLiving: any;

  @Column({ type: 'simple-json', nullable: true })
  visa: any;

  @Column({ default: '' })
  createdBy: string;

  @Column({ default: '' })
  updatedBy: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('regions')
export class RegionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ unique: true })
  name: string;
}

@Entity('settings')
export class SettingsEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'UniVerse' })
  appName: string;

  @Column({ default: '' })
  appIcon: string;

  @Column({ default: '' })
  address: string;

  @Column({ default: '' })
  managerName: string;

  @Column({ default: '' })
  contactEmail: string;

  @Column({ default: '' })
  contactPhone: string;
}

// ---------------------------------------------------------------------------
// Audit trail: activity log, version history, trash, bookmarks
// ---------------------------------------------------------------------------

@Entity('activity_log')
export class ActivityLogEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: '' })
  action: string; // created | edited | deleted | reverted | permanently_deleted | imported | restored

  @Column({ default: '' })
  entity: string; // university | region | user | settings | role

  @Column({ default: '' })
  entityId: string;

  @Column({ default: '' })
  entityName: string;

  @Column({ default: 'admin' })
  actor: string;

  @Column({ type: 'simple-json', nullable: true })
  meta: any;

  @CreateDateColumn()
  timestamp: Date;
}

@Entity('versions')
export class VersionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  universityId: number;

  @Column({ default: 1 })
  version: number;

  @Column({ type: 'simple-json', nullable: true })
  snapshot: any;

  @Column({ default: 'admin' })
  actor: string;

  @Column({ default: '' })
  summary: string;

  @CreateDateColumn()
  timestamp: Date;
}

@Entity('trash')
export class TrashItemEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 'university' })
  type: string; // university | user

  @Column({ type: 'simple-json', nullable: true })
  item: any;

  @Column({ default: 'admin' })
  deletedBy: string;

  @CreateDateColumn()
  deletedAt: Date;
}

@Entity('bookmarks')
export class BookmarkEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0 })
  universityId: number;

  @Column({ default: '' })
  universityName: string;

  @Column({ default: '' })
  region: string;

  @Column({ default: 'save' })
  action: string; // save | unsave

  @Column({ default: '' })
  userEmail: string;

  @CreateDateColumn()
  timestamp: Date;
}

@Entity('reviews')
export class ReviewEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 0 })
  universityId: number;

  @Column({ default: '' })
  universityName: string;

  @Column({ default: '' })
  userEmail: string;

  @Column({ default: '' })
  userName: string;

  @Column({ default: 5 })
  rating: number; // 1-5

  @Column({ default: '', type: 'text' })
  comment: string;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('applications')
export class ApplicationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: '' })
  userEmail: string;

  @Column({ default: 0 })
  universityId: number;

  @Column({ default: '' })
  universityName: string;

  @Column({ default: '' })
  status: string; // researching | applying | submitted | accepted | rejected | waitlisted

  @Column({ default: '', type: 'text' })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// User profile data: preferences, academic scores, AI recommendation results
// ---------------------------------------------------------------------------

@Entity('user_preferences')
export class UserPreferencesEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index({ unique: true })
  @Column({ unique: true })
  userEmail: string;

  // Desired major(s) — kept as string | string[] for backward compat with the
  // survey (string) and settings (array) pages.
  @Column({ type: 'simple-json', nullable: true })
  intendedMajor: string[] | string | null;

  @Column({ default: '' })
  degreeLevel: string; // bachelor | master | phd | associate | certificate

  @Column({ type: 'simple-json', nullable: true })
  preferredRegions: string[] | null;

  @Column({ type: 'simple-json', nullable: true })
  preferredCountries: string[] | null;

  @Column({ default: '' })
  budget: string; // e.g. '20000-30000'

  @Column({ default: '' })
  gpa: string;

  @Column({ type: 'simple-json', nullable: true })
  languageRequirements: string[] | null;

  @Column({ default: '', type: 'text' })
  extracurriculars: string;

  @Column({ default: '' })
  studyMode: string; // on-campus | online | hybrid | any

  @Column({ default: '' })
  startDate: string;

  @Column({ default: false })
  surveyCompleted: boolean;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('academic_scores')
export class AcademicScoreEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  userEmail: string;

  @Column({ default: '' })
  name: string; // e.g. 'GPA', 'SAT Math', 'IELTS'

  @Column({ default: '', type: 'text' })
  score: string;

  @Column({ default: '' })
  scale: string; // e.g. '4.0', '1600', '9.0'

  @Column({ default: '' })
  status: string; // achieved | predicted | required

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('recommendations')
export class RecommendationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  userEmail: string;

  @Column({ default: 'chat' })
  source: string; // chat | survey | explore

  @Column({ default: '', type: 'text' })
  query: string;

  @Column({ default: '', type: 'text' })
  response: string;

  @Column({ type: 'simple-json', nullable: true })
  results: any; // optional parsed list of recommended universities

  @CreateDateColumn()
  createdAt: Date;
}

// ---------------------------------------------------------------------------
// University catalog (normalized views of the university JSON): programs,
// requirements, scholarships
// ---------------------------------------------------------------------------

@Entity('programs')
export class ProgramEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  universityId: number;

  @Column({ default: '' })
  name: string;

  @Column({ default: '' })
  degreeLevel: string;

  @Column({ default: '', type: 'text' })
  description: string;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('university_requirements')
export class UniversityRequirementEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  universityId: number;

  @Column({ default: 'academic' })
  category: string; // academic | admission_test | language | documents

  @Column({ default: '', type: 'text' })
  name: string;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity('scholarships')
export class ScholarshipEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  universityId: number;

  @Column({ default: '' })
  name: string;

  @Column({ default: '' })
  amount: string;

  @Column({ default: '', type: 'text' })
  eligibility: string;

  @Column({ default: '' })
  deadline: string;

  @UpdateDateColumn()
  updatedAt: Date;
}
