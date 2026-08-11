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
import { DataSource, Repository } from 'typeorm';
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
} from '../database/entities';
import {
  ALL_PERMISSIONS,
  applyDbShape,
  deriveUniversityRelations,
  enrichUniversity,
  normalizeUser,
  rolePerms,
  SEED_SETTINGS,
} from '../database/seed';

// ---------------------------------------------------------------------------
// Audit helpers
// ---------------------------------------------------------------------------

function actorOf(body: any): string {
  return (body && body.actor) || 'admin';
}

function requireSuperAdmin(body: any) {
  const role = (body && body.actorRole) || '';
  if (role !== 'super_admin') {
    throw new ForbiddenException('Super Admin access required');
  }
}

function isSuperAdmin(body: any): boolean {
  return (body && body.actorRole) === 'super_admin';
}

/** Strips secrets from any object before it leaves the API. */
function stripSecrets(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  const { passwordHash: _ph, ...rest } = obj;
  return rest;
}

// ---------------------------------------------------------------------------
// Report time-series helpers (daily / weekly / monthly / yearly)
// ---------------------------------------------------------------------------

type Period = 'daily' | 'weekly' | 'monthly' | 'yearly';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function weekOf(d: Date): number {
  const start = new Date(d.getFullYear(), 0, 1);
  return Math.floor((d.getTime() - start.getTime()) / (7 * 86400000)) + 1;
}

function bucketKey(period: Period, d: Date): string {
  if (period === 'daily') return `d:${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  if (period === 'weekly') return `w:${d.getFullYear()}-${weekOf(d)}`;
  if (period === 'monthly') return `m:${d.getFullYear()}-${d.getMonth()}`;
  return `y:${d.getFullYear()}`;
}

function bucketLabel(period: Period, d: Date): string {
  if (period === 'daily') return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
  if (period === 'weekly') return `Wk ${weekOf(d)}`;
  if (period === 'monthly') return `${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
  return String(d.getFullYear());
}

function buildBuckets(period: Period) {
  const now = new Date();
  const count = period === 'yearly' ? 5 : 12;
  const buckets: { key: string; label: string }[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now);
    if (period === 'daily') d.setDate(now.getDate() - i);
    else if (period === 'weekly') d.setDate(now.getDate() - i * 7);
    else if (period === 'monthly') d.setMonth(now.getMonth() - i);
    else d.setFullYear(now.getFullYear() - i);
    buckets.push({ key: bucketKey(period, d), label: bucketLabel(period, d) });
  }
  return buckets;
}

@Controller('admin')
export class AdminController {
  constructor(
    @InjectRepository(UniversityEntity)
    private readonly universities: Repository<UniversityEntity>,
    @InjectRepository(RegionEntity)
    private readonly regions: Repository<RegionEntity>,
    @InjectRepository(UserEntity)
    private readonly users: Repository<UserEntity>,
    @InjectRepository(RoleEntity)
    private readonly rolesRepo: Repository<RoleEntity>,
    @InjectRepository(SettingsEntity)
    private readonly settings: Repository<SettingsEntity>,
    @InjectRepository(ActivityLogEntity)
    private readonly activity: Repository<ActivityLogEntity>,
    @InjectRepository(VersionEntity)
    private readonly versions: Repository<VersionEntity>,
    @InjectRepository(TrashItemEntity)
    private readonly trash: Repository<TrashItemEntity>,
    @InjectRepository(BookmarkEntity)
    private readonly bookmarks: Repository<BookmarkEntity>,
    @InjectRepository(ReviewEntity)
    private readonly reviews: Repository<ReviewEntity>,
    @InjectRepository(ApplicationEntity)
    private readonly applications: Repository<ApplicationEntity>,
    @InjectRepository(UserPreferencesEntity)
    private readonly preferences: Repository<UserPreferencesEntity>,
    @InjectRepository(AcademicScoreEntity)
    private readonly scores: Repository<AcademicScoreEntity>,
    @InjectRepository(RecommendationEntity)
    private readonly recommendations: Repository<RecommendationEntity>,
    @InjectRepository(ProgramEntity)
    private readonly programs: Repository<ProgramEntity>,
    @InjectRepository(UniversityRequirementEntity)
    private readonly requirements: Repository<UniversityRequirementEntity>,
    @InjectRepository(ScholarshipEntity)
    private readonly scholarships: Repository<ScholarshipEntity>,
    private readonly dataSource: DataSource,
  ) {}

  // ---------------- Universities ----------------

  @Get('universities')
  async getUniversities() {
    return this.universities.find({ order: { id: 'ASC' } });
  }

  @Post('universities')
  async createUniversity(@Body() body: any) {
    const actor = actorOf(body);
    const university = enrichUniversity({
      name: body.name || 'Untitled University',
      location: body.location || '',
      province: body.province || '',
      region: body.region || '',
      description: body.description || '',
      image: body.image || '',
      details: body.details || {
        overview: '',
        details: [],
        courses: [],
        requirements: [],
        prices: { undergraduate: '', graduate: '' },
      },
      createdBy: actor,
      updatedBy: actor,
    });
    const saved = await this.universities.save(university);
    await this.syncUniversityRelations(saved);
    await this.pushVersion(saved, actor, 'Created');
    await this.logActivity('created', 'university', saved.id, saved.name, actor);
    return saved;
  }

  @Put('universities/:id')
  async updateUniversity(@Param('id') id: string, @Body() body: any) {
    const actor = actorOf(body);
    const existing = await this.universities.findOne({ where: { id: parseInt(id, 10) } });
    if (!existing) throw new NotFoundException('University not found');

    const { _summary, id: _id, createdAt: _createdAt, ...rest } = body;
    const merged = enrichUniversity({
      ...existing,
      ...rest,
      updatedBy: actor,
    });
    const saved = await this.universities.save(merged);
    await this.syncUniversityRelations(saved);
    await this.pushVersion(saved, actor, _summary || 'Edited');
    await this.logActivity('edited', 'university', id, saved.name, actor, { version: saved.updatedAt });
    return saved;
  }

  @Delete('universities/:id')
  async deleteUniversity(@Param('id') id: string, @Body() body: any) {
    const actor = actorOf(body);
    const existing = await this.universities.findOne({ where: { id: parseInt(id, 10) } });
    if (!existing) throw new NotFoundException('University not found');

    await this.trash.save({
      type: 'university',
      item: { ...existing },
      deletedBy: actor,
    });
    await this.universities.delete(existing.id);
    await this.logActivity('deleted', 'university', id, existing.name, actor);
    return existing;
  }

  @Post('universities/:id/revert/:version')
  async revertUniversity(
    @Param('id') id: string,
    @Param('version') version: string,
    @Body() body: any,
  ) {
    const actor = actorOf(body);
    const uniId = parseInt(id, 10);
    const existing = await this.universities.findOne({ where: { id: uniId } });
    if (!existing) throw new NotFoundException('University not found');

    const target = await this.versions.findOne({
      where: { universityId: uniId, version: parseInt(version, 10) },
    });
    if (!target) throw new NotFoundException('Version not found');

    // Keep a copy of the current state as the newest version before reverting
    await this.pushVersion(existing, actor, 'Auto-saved before revert');

    const restored = enrichUniversity({
      ...existing,
      ...target.snapshot,
      updatedBy: actor,
    });
    const saved = await this.universities.save(restored);
    await this.syncUniversityRelations(saved);
    await this.logActivity('reverted', 'university', id, saved.name, actor, { version: target.version });
    return saved;
  }

  // ---------------- Versions ----------------

  @Get('versions')
  async getVersions() {
    const rows = await this.versions.find({ order: { id: 'ASC' } });
    const unis = await this.universities.find();
    const names = new Map(unis.map((u) => [u.id, u.name]));
    const grouped = new Map<number, any[]>();
    rows.forEach((row) => {
      if (!grouped.has(row.universityId)) grouped.set(row.universityId, []);
      grouped.get(row.universityId)!.push(row);
    });
    const result: any[] = [];
    grouped.forEach((list, uniId) => {
      result.push({
        universityId: uniId,
        universityName: names.get(uniId) || `University ${uniId}`,
        versions: list,
      });
    });
    return result.sort((a, b) => b.universityId - a.universityId);
  }

  // ---------------- Trash (soft-deleted items) ----------------

  @Get('trash')
  async getTrash() {
    const rows = await this.trash.find({ order: { id: 'DESC' } });
    return rows.map((r) => ({ ...r, item: stripSecrets(r.item) }));
  }

  @Post('trash/:id/restore')
  async restoreTrashItem(@Param('id') id: string, @Body() body: any) {
    requireSuperAdmin(body);
    const actor = actorOf(body);
    const entry = await this.trash.findOne({ where: { id: parseInt(id, 10) } });
    if (!entry) throw new NotFoundException('Trash item not found');

    if (entry.type === 'user') {
      // normalizeUser drops secrets — restore the stored password hash so the
      // account keeps working after a revert.
      const restored = normalizeUser(entry.item, await this.rolesRepo.find());
      await this.users.save({
        ...restored,
        ...(entry.item?.passwordHash ? { passwordHash: entry.item.passwordHash } : {}),
      });
    } else {
      const restoredUni = await this.universities.save(enrichUniversity({ ...entry.item }));
      await this.syncUniversityRelations(restoredUni);
    }
    await this.trash.delete(entry.id);
    await this.logActivity(
      'reverted',
      entry.type,
      entry.item?.id ?? '',
      entry.item?.name || entry.item?.email || 'item',
      actor,
      { restored: true },
    );
    return stripSecrets(entry.item);
  }

  @Delete('trash/:id')
  async permanentlyDeleteTrashItem(@Param('id') id: string, @Body() body: any) {
    requireSuperAdmin(body);
    const actor = actorOf(body);
    const entry = await this.trash.findOne({ where: { id: parseInt(id, 10) } });
    if (!entry) throw new NotFoundException('Trash item not found');

    if (entry.type === 'university') {
      await this.versions.delete({ universityId: entry.item?.id });
    }
    await this.trash.delete(entry.id);
    await this.logActivity(
      'permanently_deleted',
      entry.type,
      entry.item?.id ?? '',
      entry.item?.name || entry.item?.email || 'item',
      actor,
    );
    return entry.item;
  }

  // ---------------- Regions ----------------

  @Get('regions')
  async getRegions() {
    const rows = await this.regions.find({ order: { id: 'ASC' } });
    return rows.map((r) => r.name);
  }

  @Post('regions')
  async createRegion(@Body() body: any) {
    const actor = actorOf(body);
    const name = (body.name || '').trim();
    if (!name) throw new BadRequestException('Region name cannot be empty');
    const exists = await this.regions.findOne({ where: { name } });
    if (exists) throw new BadRequestException('Region already exists');

    await this.regions.save({ name });
    await this.logActivity('created', 'region', name, name, actor);
    return { name };
  }

  @Put('regions/:name')
  async renameRegion(@Param('name') name: string, @Body() body: any) {
    const actor = actorOf(body);
    const row = await this.regions.findOne({ where: { name } });
    if (!row) throw new NotFoundException('Region not found');

    const newName = (body.name || '').trim();
    if (!newName) throw new BadRequestException('Region name cannot be empty');
    if (newName !== name) {
      const clash = await this.regions.findOne({ where: { name: newName } });
      if (clash) throw new BadRequestException('Region already exists');
    }

    row.name = newName;
    await this.regions.save(row);
    await this.universities.update({ region: name }, { region: newName });
    await this.logActivity('edited', 'region', newName, newName, actor, { from: name });
    return this.getRegions();
  }

  @Delete('regions/:name')
  async deleteRegion(@Param('name') name: string, @Body() body: any) {
    const actor = actorOf(body);
    const row = await this.regions.findOne({ where: { name } });
    if (!row) throw new NotFoundException('Region not found');

    await this.regions.delete(row.id);
    await this.logActivity('deleted', 'region', name, name, actor);
    return { name };
  }

  // ---------------- Users ----------------

  @Get('users')
  async getUsers() {
    return this.users.find({ order: { id: 'ASC' } });
  }

  @Post('users')
  async createUser(@Body() body: any) {
    const actor = actorOf(body);
    const roles = await this.rolesRepo.find();
    // Only a Super Admin may create privileged (non-user) accounts
    if (body.role && body.role !== 'user' && !isSuperAdmin(body)) {
      throw new ForbiddenException('Only Super Admins can create privileged accounts');
    }
    const role = body.role && roles.some((r) => r.name === body.role) ? body.role : 'user';
    const user = normalizeUser(
      { name: body.name || 'User', email: body.email || '', role, permissions: rolePerms(role, roles) },
      roles,
    );
    const clash = await this.users.findOne({ where: { email: user.email } });
    if (clash) throw new BadRequestException('User with this email already exists');

    const saved = await this.users.save(user);
    await this.logActivity('created', 'user', saved.id, saved.email || saved.name, actor);
    return saved;
  }

  @Put('users/:id')
  async updateUser(@Param('id') id: string, @Body() body: any) {
    const actor = actorOf(body);
    const existing = await this.users.findOne({ where: { id: parseInt(id, 10) } });
    if (!existing) throw new NotFoundException('User not found');

    // Only a Super Admin may touch a Super Admin account
    if (existing.role === 'super_admin' && !isSuperAdmin(body)) {
      throw new ForbiddenException('Only Super Admins can modify Super Admin accounts');
    }
    // Only a Super Admin may grant the Super Admin role
    if (body.role === 'super_admin' && !isSuperAdmin(body)) {
      throw new ForbiddenException('Only Super Admins can grant the Super Admin role');
    }

    const roles = await this.rolesRepo.find();
    if (body.role !== undefined && !roles.some((r) => r.name === body.role)) {
      throw new BadRequestException('Unknown role: ' + body.role);
    }
    // Only a Super Admin may assign roles at all (prevents creating an
    // all-permissions role and self-assigning it)
    if (body.role !== undefined && !isSuperAdmin(body)) {
      throw new ForbiddenException('Only Super Admins can change user roles');
    }
    const role = body.role !== undefined ? body.role : existing.role;
    const merged = normalizeUser(
      {
        ...existing,
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.email !== undefined ? { email: body.email } : {}),
        role,
        permissions: rolePerms(role, roles),
      },
      roles,
    );
    const saved = await this.users.save(merged);
    const changed = ['name', 'email', 'role'].filter(
      (k) => body[k] !== undefined && body[k] !== (existing as any)[k],
    );
    await this.logActivity('edited', 'user', id, saved.email || saved.name, actor, { changed });
    return saved;
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string, @Body() body: any) {
    const actor = actorOf(body);
    const existing = await this.users
      .createQueryBuilder('u')
      .addSelect('u.passwordHash')
      .where('u.id = :id', { id: parseInt(id, 10) })
      .getOne();
    if (!existing) throw new NotFoundException('User not found');

    // Only a Super Admin may delete a Super Admin account
    if (existing.role === 'super_admin' && !isSuperAdmin(body)) {
      throw new ForbiddenException('Only Super Admins can delete Super Admin accounts');
    }

    await this.trash.save({
      type: 'user',
      item: { ...existing },
      deletedBy: actor,
    });
    await this.users.delete(existing.id);
    // Clean up the user's personal data (preferences, scores, recommendations)
    await this.preferences.delete({ userEmail: existing.email });
    await this.scores.delete({ userEmail: existing.email });
    await this.recommendations.delete({ userEmail: existing.email });
    await this.logActivity('deleted', 'user', id, existing.email || existing.name, actor);
    return stripSecrets(existing);
  }

  // ---------------- Roles ----------------

  @Get('roles')
  async getRoles() {
    const roles = await this.rolesRepo.find({ order: { id: 'ASC' } });
    const users = await this.users.find();
    return {
      roles: roles.map((r) => ({
        ...r,
        userCount: users.filter((u) => u.role === r.name).length,
      })),
      users,
    };
  }

  @Post('roles')
  async createRole(@Body() body: any) {
    requireSuperAdmin(body);
    const actor = actorOf(body);
    const name = (body.name || '').trim();
    if (!name) throw new BadRequestException('Role name cannot be empty');
    const exists = await this.rolesRepo.findOne({ where: { name } });
    if (exists) throw new BadRequestException('Role already exists');

    const role = await this.rolesRepo.save({
      name,
      permissions: Array.isArray(body.permissions) ? body.permissions : [],
      isSystem: false,
    });
    await this.logActivity('created', 'role', role.id, name, actor);
    return role;
  }

  @Put('roles/:id')
  async updateRole(@Param('id') id: string, @Body() body: any) {
    // Permission changes on roles are system-level — Super Admin only
    if (body.permissions !== undefined && !isSuperAdmin(body)) {
      throw new ForbiddenException('Only Super Admins can edit role permissions');
    }
    const actor = actorOf(body);
    const role = await this.rolesRepo.findOne({ where: { id: parseInt(id, 10) } });
    if (!role) throw new NotFoundException('Role not found');

    const oldName = role.name;
    if (body.name !== undefined) {
      const newName = String(body.name).trim();
      if (!newName) throw new BadRequestException('Role name cannot be empty');
      if (newName !== role.name) {
        const clash = await this.rolesRepo.findOne({ where: { name: newName } });
        if (clash) throw new BadRequestException('Role already exists');
      }
      role.name = newName;
    }
    if (body.permissions !== undefined) {
      role.permissions = body.permissions;
    }
    await this.rolesRepo.save(role);

    // Keep users of this role in sync (name + permissions)
    const users = await this.users.find({ where: { role: oldName } });
    if (users.length) {
      await this.users.save(
        users.map((u) => ({ ...u, role: role.name, permissions: [...(role.permissions || [])] })),
      );
    }
    await this.logActivity('edited', 'role', role.id, role.name, actor);
    return role;
  }

  @Delete('roles/:id')
  async deleteRole(@Param('id') id: string, @Body() body: any) {
    requireSuperAdmin(body);
    const actor = actorOf(body);
    const role = await this.rolesRepo.findOne({ where: { id: parseInt(id, 10) } });
    if (!role) throw new NotFoundException('Role not found');
    if (role.isSystem) throw new BadRequestException('System roles cannot be deleted');

    const inUse = await this.users.count({ where: { role: role.name } });
    if (inUse > 0) {
      throw new BadRequestException(`Cannot delete a role that ${inUse} user(s) have`);
    }
    await this.rolesRepo.delete(role.id);
    await this.logActivity('deleted', 'role', role.id, role.name, actor);
    return role;
  }

  // ---------------- Catalog: programs / requirements / scholarships ----------------
  // These tables are normalized views of the university JSON (details.courses,
  // details.requirements, scholarships) and are rebuilt whenever a university
  // is created, edited, reverted or restored.

  @Get('programs')
  async getPrograms(@Query('universityId') universityId?: string) {
    const where = universityId ? { universityId: parseInt(universityId, 10) } : {};
    return this.programs.find({ where, order: { universityId: 'ASC', id: 'ASC' } });
  }

  @Get('requirements')
  async getRequirements(@Query('universityId') universityId?: string) {
    const where = universityId ? { universityId: parseInt(universityId, 10) } : {};
    return this.requirements.find({ where, order: { universityId: 'ASC', id: 'ASC' } });
  }

  @Get('scholarships')
  async getScholarships(@Query('universityId') universityId?: string) {
    const where = universityId ? { universityId: parseInt(universityId, 10) } : {};
    return this.scholarships.find({ where, order: { universityId: 'ASC', id: 'ASC' } });
  }

  // ---------------- Settings ----------------

  @Get('settings')
  async getSettings() {
    const row = await this.settings.find({ order: { id: 'ASC' } });
    return row[0] || { ...SEED_SETTINGS };
  }

  @Put('settings')
  async updateSettings(@Body() body: any) {
    const actor = actorOf(body);
    const rows = await this.settings.find({ order: { id: 'ASC' } });
    const previous = rows[0] || { ...SEED_SETTINGS };
    const merged = {
      ...previous,
      ...(body.appName !== undefined ? { appName: String(body.appName).trim() } : {}),
      ...(body.appIcon !== undefined ? { appIcon: String(body.appIcon).trim() } : {}),
      ...(body.address !== undefined ? { address: String(body.address).trim() } : {}),
      ...(body.managerName !== undefined ? { managerName: String(body.managerName).trim() } : {}),
      ...(body.contactEmail !== undefined ? { contactEmail: String(body.contactEmail).trim() } : {}),
      ...(body.contactPhone !== undefined ? { contactPhone: String(body.contactPhone).trim() } : {}),
    };
    const saved = rows[0] ? await this.settings.save({ ...rows[0], ...merged }) : await this.settings.save(merged);
    await this.logActivity('edited', 'settings', 'settings', saved.appName, actor, {
      from: previous.appName,
    });
    return saved;
  }

  // ---------------- Permissions ----------------

  @Get('permissions')
  async getPermissions() {
    const roles = await this.rolesRepo.find({ order: { id: 'ASC' } });
    const users = await this.users.find();
    return {
      all: ALL_PERMISSIONS,
      roles: roles.map((r) => ({
        ...r,
        userCount: users.filter((u) => u.role === r.name).length,
      })),
    };
  }

  // ---------------- Bookmarks / Save events ----------------

  @Post('bookmarks')
  async recordBookmark(@Body() body: any) {
    return this.bookmarks.save({
      universityId: Number(body.universityId),
      universityName: body.universityName || 'Unknown',
      region: body.region || 'Unknown',
      action: body.action === 'unsave' ? 'unsave' : 'save',
      userEmail: body.userEmail,
    });
  }

  // ---------------- Reviews ----------------

  @Get('reviews')
  async getReviews(@Query('universityId') universityId?: string) {
    const where = universityId ? { universityId: parseInt(universityId, 10) } : {};
    const rows = await this.reviews.find({ where, order: { id: 'DESC' } });
    const average = rows.length
      ? rows.reduce((sum, r) => sum + r.rating, 0) / rows.length
      : 0;
    return {
      reviews: rows,
      average: Math.round(average * 10) / 10,
      count: rows.length,
    };
  }

  @Post('reviews')
  async createReview(@Body() body: any) {
    const rating = Math.max(1, Math.min(5, parseInt(body.rating, 10) || 5));
    const review = await this.reviews.save({
      universityId: Number(body.universityId),
      universityName: body.universityName || 'University',
      userEmail: body.userEmail || 'guest',
      userName: body.userName || body.userEmail || 'Guest',
      rating,
      comment: String(body.comment || '').slice(0, 2000),
    });
    return review;
  }

  @Delete('reviews/:id')
  async deleteReview(@Param('id') id: string, @Body() body: any) {
    const review = await this.reviews.findOne({ where: { id: parseInt(id, 10) } });
    if (!review) throw new NotFoundException('Review not found');
    const isOwner = review.userEmail === (body && body.userEmail);
    const isAdmin = (body && body.actorRole) === 'admin' || (body && body.actorRole) === 'super_admin';
    if (!isOwner && !isAdmin) {
      throw new ForbiddenException('You can only delete your own reviews');
    }
    await this.reviews.delete(review.id);
    return { ok: true };
  }

  // ---------------- Application tracker ----------------

  @Get('applications')
  async getApplications(@Query('userEmail') userEmail?: string) {
    const where = userEmail ? { userEmail } : {};
    return this.applications.find({ where, order: { updatedAt: 'DESC' } });
  }

  @Post('applications')
  async createApplication(@Body() body: any) {
    if (!body.userEmail) throw new BadRequestException('userEmail is required');
    const existing = await this.applications.findOne({
      where: { userEmail: body.userEmail, universityId: Number(body.universityId) },
    });
    if (existing) {
      existing.status = body.status || existing.status;
      existing.notes = body.notes !== undefined ? body.notes : existing.notes;
      return this.applications.save(existing);
    }
    return this.applications.save({
      userEmail: body.userEmail,
      universityId: Number(body.universityId),
      universityName: body.universityName || 'University',
      status: body.status || 'researching',
      notes: String(body.notes || '').slice(0, 2000),
    });
  }

  @Put('applications/:id')
  async updateApplication(@Param('id') id: string, @Body() body: any) {
    const app = await this.applications.findOne({ where: { id: parseInt(id, 10) } });
    if (!app) throw new NotFoundException('Application not found');
    const isAdmin = (body && (body.actorRole === 'admin' || body.actorRole === 'super_admin'));
    if (!isAdmin && (!body || body.userEmail !== app.userEmail)) {
      throw new ForbiddenException('You can only edit your own applications');
    }
    if (body.status !== undefined) app.status = body.status;
    if (body.notes !== undefined) app.notes = String(body.notes).slice(0, 2000);
    return this.applications.save(app);
  }

  @Delete('applications/:id')
  async deleteApplication(@Param('id') id: string, @Body() body: any) {
    const app = await this.applications.findOne({ where: { id: parseInt(id, 10) } });
    if (!app) throw new NotFoundException('Application not found');
    const isAdmin = (body && (body.actorRole === 'admin' || body.actorRole === 'super_admin'));
    if (!isAdmin && (!body || body.userEmail !== app.userEmail)) {
      throw new ForbiddenException('You can only delete your own applications');
    }
    await this.applications.delete(app.id);
    return { ok: true };
  }

  // ---------------- Activity Log ----------------

  @Get('activity')
  async getActivity() {
    const [log, trashRows] = await Promise.all([
      this.activity.find({ order: { id: 'DESC' } }),
      this.trash.find({ order: { id: 'DESC' } }),
    ]);
    return {
      log,
      trash: trashRows.map((r) => ({ ...r, item: stripSecrets(r.item) })),
    };
  }

  // ---------------- Reports ----------------

  @Get('reports')
  async getReports(@Query('period') period?: string) {
    const [unis, regions, users, trashItems, bookmarkRows, activityRows, versionRows] =
      await Promise.all([
        this.universities.find(),
        this.regions.find(),
        this.users.find(),
        this.trash.find(),
        this.bookmarks.find(),
        this.activity.find(),
        this.versions.find(),
      ]);

    const perUni = new Map<number, number>();
    const perRegion = new Map<string, number>();
    bookmarkRows.forEach((b) => {
      const delta = b.action === 'save' ? 1 : -1;
      perUni.set(b.universityId, (perUni.get(b.universityId) || 0) + delta);
      perRegion.set(b.region, (perRegion.get(b.region) || 0) + delta);
    });

    const uniNames = new Map(unis.map((u) => [u.id, u.name]));
    const topSavedUniversities = Array.from(perUni.entries())
      .map(([id, count]) => ({ id, name: uniNames.get(id) || 'Unknown', count: Math.max(0, count) }))
      .filter((r) => r.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const savesByRegion = Array.from(perRegion.entries())
      .map(([region, count]) => ({ region, count: Math.max(0, count) }))
      .filter((r) => r.count > 0)
      .sort((a, b) => b.count - a.count);

    const regionCounts = new Map<string, number>();
    unis.forEach((u) => regionCounts.set(u.region, (regionCounts.get(u.region) || 0) + 1));
    const universitiesByRegion = Array.from(regionCounts.entries())
      .map(([region, count]) => ({ region, count }))
      .sort((a, b) => b.count - a.count);

    const actionCounts = new Map<string, number>();
    activityRows.forEach((a) => actionCounts.set(a.action, (actionCounts.get(a.action) || 0) + 1));
    const activityBreakdown = Array.from(actionCounts.entries())
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count);

    const programCount = unis.reduce((sum, u) => sum + (u.details?.courses?.length || 0), 0);

    // Time-series buckets when a period is requested
    const validPeriods: Period[] = ['daily', 'weekly', 'monthly', 'yearly'];
    const p = validPeriods.includes(period as Period) ? (period as Period) : null;
    let bookmarksByPeriod: { label: string; saves: number; unsaves: number }[] = [];
    let activityByPeriod: { label: string; count: number }[] = [];

    if (p) {
      const buckets = buildBuckets(p);
      const index = new Map(buckets.map((b, i) => [b.key, i]));
      bookmarksByPeriod = buckets.map((b) => ({ label: b.label, saves: 0, unsaves: 0 }));
      activityByPeriod = buckets.map((b) => ({ label: b.label, count: 0 }));

      bookmarkRows.forEach((b) => {
        const idx = index.get(bucketKey(p, new Date(b.timestamp)));
        if (idx !== undefined) {
          if (b.action === 'save') bookmarksByPeriod[idx].saves++;
          else bookmarksByPeriod[idx].unsaves++;
        }
      });
      activityRows.forEach((a) => {
        const idx = index.get(bucketKey(p, new Date(a.timestamp)));
        if (idx !== undefined) activityByPeriod[idx].count++;
      });
    }

    return {
      totals: {
        universities: unis.length,
        regions: regions.length,
        users: users.length,
        admins: users.filter((u) => u.role === 'admin' || u.role === 'super_admin').length,
        programs: programCount,
        trash: trashItems.length,
        bookmarks: bookmarkRows.filter((b) => b.action === 'save').length,
        versions: versionRows.length,
      },
      topSavedUniversities,
      savesByRegion,
      universitiesByRegion,
      activityBreakdown,
      period: p || 'all',
      bookmarksByPeriod,
      activityByPeriod,
    };
  }

  // ---------------- Export / Import / Reset ----------------

  @Get('export')
  async exportDb() {
    const [unis, regions, users, roles, settingsRows, activityRows, versionRows, trashRows, bookmarkRows, reviewRows, appRows, prefRows, scoreRows, recRows, programRows, reqRows, schRows] =
      await Promise.all([
        this.universities.find(),
        this.regions.find(),
        this.users.find(),
        this.rolesRepo.find(),
        this.settings.find(),
        this.activity.find(),
        this.versions.find(),
        this.trash.find(),
        this.bookmarks.find(),
        this.reviews.find(),
        this.applications.find(),
        this.preferences.find(),
        this.scores.find(),
        this.recommendations.find(),
        this.programs.find(),
        this.requirements.find(),
        this.scholarships.find(),
      ]);

    const versions: Record<string, any[]> = {};
    versionRows.forEach((v) => {
      const key = String(v.universityId);
      if (!versions[key]) versions[key] = [];
      versions[key].push({ ...v });
    });

    return {
      exportedAt: new Date().toISOString(),
      app: (settingsRows[0] || SEED_SETTINGS).appName,
      data: {
        universities: unis,
        regions: regions.map((r) => r.name),
        users,
        roles,
        settings: settingsRows[0] || SEED_SETTINGS,
        activityLog: activityRows,
        versions,
        trash: trashRows.map((r) => ({ ...r, item: stripSecrets(r.item) })),
        bookmarks: bookmarkRows,
        reviews: reviewRows,
        applications: appRows,
        userPreferences: prefRows,
        academicScores: scoreRows,
        recommendations: recRows,
        programs: programRows,
        requirements: reqRows,
        scholarships: schRows,
      },
    };
  }

  @Post('import')
  async importDb(@Body() body: any) {
    const actor = actorOf(body);
    const incoming = body.data || body;
    if (!incoming || typeof incoming !== 'object') {
      throw new BadRequestException('Invalid import data');
    }

    await applyDbShape(this.dataSource, incoming);
    await this.logActivity('imported', 'settings', 'db', 'Database import', actor, {
      universities: incoming.universities?.length || 0,
      regions: incoming.regions?.length || 0,
      users: incoming.users?.length || 0,
    });

    const [unis, regions, users] = await Promise.all([
      this.universities.count(),
      this.regions.count(),
      this.users.count(),
    ]);
    return { ok: true, totals: { universities: unis, regions, users } };
  }

  /** Wipes all data and re-seeds defaults. Super Admin only. */
  @Post('reset')
  async resetDatabase(@Body() body: any) {
    requireSuperAdmin(body);
    const actor = actorOf(body);

    await applyDbShape(this.dataSource, {} as any, true);
    await this.logActivity('restored', 'settings', 'db', 'Database reset', actor);

    const [unis, regions, users] = await Promise.all([
      this.universities.count(),
      this.regions.count(),
      this.users.count(),
    ]);
    return { ok: true, totals: { universities: unis, regions, users } };
  }

  // ---------------- Private helpers ----------------

  /**
   * Rebuilds the normalized programs / requirements / scholarships rows for a
   * single university from its JSON columns.
   */
  private async syncUniversityRelations(uni: any) {
    if (!uni || !uni.id) return;
    const { programs, requirements, scholarships } = deriveUniversityRelations(uni);
    await this.programs.delete({ universityId: uni.id });
    await this.requirements.delete({ universityId: uni.id });
    await this.scholarships.delete({ universityId: uni.id });
    if (programs.length) await this.programs.save(programs as any);
    if (requirements.length) await this.requirements.save(requirements as any);
    if (scholarships.length) await this.scholarships.save(scholarships as any);
  }

  private async pushVersion(uni: any, actor: string, summary: string) {
    const rows = await this.versions.find({ where: { universityId: uni.id } });
    const nextVersion = rows.length ? Math.max(...rows.map((r) => r.version)) + 1 : 1;
    await this.versions.save({
      universityId: uni.id,
      version: nextVersion,
      snapshot: { ...uni },
      actor,
      summary,
    });
  }

  private async logActivity(
    action: string,
    entity: string,
    entityId: string | number,
    entityName: string,
    actor: string,
    meta?: any,
  ) {
    await this.activity.save({
      action,
      entity,
      entityId: String(entityId),
      entityName,
      actor,
      meta,
    });
    // Keep the log bounded (latest 300)
    const count = await this.activity.count();
    if (count > 300) {
      const extra = await this.activity.find({ order: { id: 'ASC' }, take: count - 300 });
      if (extra.length) await this.activity.remove(extra);
    }
  }
}
