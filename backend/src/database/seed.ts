import { DataSource } from 'typeorm';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import * as bcrypt from 'bcryptjs';
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

// ---------------------------------------------------------------------------
// Permission catalog
// ---------------------------------------------------------------------------

export const ALL_PERMISSIONS = [
  'manage_content',
  'manage_users',
  'manage_settings',
  'view_reports',
  'manage_system',
];

export const SEED_ROLES = [
  { name: 'super_admin', permissions: [...ALL_PERMISSIONS], isSystem: true },
  { name: 'admin', permissions: [...ALL_PERMISSIONS], isSystem: true },
  { name: 'user', permissions: [], isSystem: true },
];

export const SEED_SETTINGS = {
  appName: 'UniVerse',
  appIcon: '',
  address: '',
  managerName: '',
  contactEmail: '',
  contactPhone: '',
};

export const SEED_REGIONS = [
  'North America',
  'Europe',
  'Asia',
  'Oceania',
  'South America',
  'Africa',
];

// ---------------------------------------------------------------------------
// Enrichment: deterministic defaults for ranking/scholarship/deadline/etc.
// ---------------------------------------------------------------------------

export function enrichUniversity(u: any): any {
  const id = u.id || 0;
  const courses = Array.isArray(u.details?.courses)
    ? u.details.courses.map((c: any) => c.name || '')
    : [];

  if (!u.rankings) {
    const programs: Record<string, number> = {};
    courses.slice(0, 4).forEach((name: string, i: number) => {
      programs[name] = ((i * 13 + id) % 55) + 1;
    });
    u.rankings = { overall: (id % 48) + 3, programs };
  }

  if (!u.pros) {
    const pool = [
      'World-class reputation and faculty',
      'Strong research output and funding',
      'Excellent global alumni network',
      'Prime location with great campus life',
      'Diverse, international community',
      'Generous scholarship opportunities',
    ];
    u.pros = [pool[id % pool.length], pool[(id + 2) % pool.length], pool[(id + 4) % pool.length]];
  }

  if (!u.cons) {
    const pool = [
      'High tuition and living costs',
      'Highly competitive admissions',
      'Large class sizes in popular programs',
      'Limited on-campus housing',
      'Heavy workload and academic pressure',
      'Expensive city to live in',
    ];
    u.cons = [pool[(id + 1) % pool.length], pool[(id + 3) % pool.length], pool[(id + 5) % pool.length]];
  }

  if (!u.scholarships) {
    u.scholarships = [
      { name: 'Merit Scholarship', amount: '$10,000 / year', eligibility: 'Top 10% academic performance' },
      { name: 'International Excellence Award', amount: 'Up to 50% tuition', eligibility: 'International students with strong grades' },
    ];
  }

  if (!u.applicationDeadlines) {
    u.applicationDeadlines = [
      { window: 'Fall 2027', deadline: '2027-01-05' },
      { window: 'Fall 2026', deadline: '2026-11-15' },
      { window: 'Spring 2027', deadline: '2026-08-01' },
    ];
  }

  if (!u.costOfLiving) {
    u.costOfLiving = { currency: 'USD', monthly: '$1,200 – $2,400' };
  }

  if (!u.visa) {
    u.visa = {
      processTime: '4–8 weeks',
      requirements: [
        'Valid passport (6+ months)',
        'Letter of admission',
        'Proof of financial support',
        'Visa application form and fee',
      ],
    };
  }

  return u;
}

// ---------------------------------------------------------------------------
// Normalized university catalog: programs / requirements / scholarships
// ---------------------------------------------------------------------------

/**
 * Best-effort classification of an admission requirement string so the
 * normalized requirements table stays queryable (academic, admission test,
 * language, documents).
 */
export function classifyRequirement(text: string): string {
  const t = text || '';
  if (/language|english|ielts|toefl|proficiency|french|german|japanese|chinese/i.test(t)) {
    return 'language';
  }
  if (/test|sat|act|exam|gaokao|atar|entrance|score|gpa|grade/i.test(t)) {
    return 'admission_test';
  }
  if (/passport|visa|financial|document|transcript|diploma|letter|recommendation|statement|portfolio|interview|reference/i.test(t)) {
    return 'documents';
  }
  return 'academic';
}

/**
 * Extracts the normalized programs / requirements / scholarships rows that
 * live inside a university's JSON columns (details.courses,
 * details.requirements, scholarships).
 */
export function deriveUniversityRelations(u: any): {
  programs: any[];
  requirements: any[];
  scholarships: any[];
} {
  const id = u?.id;
  const courses = Array.isArray(u?.details?.courses) ? u.details.courses : [];
  const requirements = Array.isArray(u?.details?.requirements) ? u.details.requirements : [];
  const scholarships = Array.isArray(u?.scholarships) ? u.scholarships : [];

  const programs = courses.map((c: any, i: number) => ({
    universityId: id,
    name: typeof c === 'string' ? c : c.name || `Program ${i + 1}`,
    degreeLevel: '',
    description: typeof c === 'string' ? '' : c.details || '',
  }));

  const reqRows = requirements.map((r: any) => ({
    universityId: id,
    category: classifyRequirement(typeof r === 'string' ? r : r.name || ''),
    name: typeof r === 'string' ? r : r.name || '',
  }));

  const schRows = scholarships.map((s: any, i: number) => ({
    universityId: id,
    name: s.name || `Scholarship ${i + 1}`,
    amount: s.amount || '',
    eligibility: s.eligibility || '',
    deadline: s.deadline || '',
  }));

  return { programs, requirements: reqRows, scholarships: schRows };
}

/**
 * Rebuilds the normalized tables from a list of universities (each row must
 * already have its id assigned by the database).
 */
export async function rebuildUniversityRelations(
  dataSource: DataSource,
  universities: any[],
): Promise<void> {
  const programs: any[] = [];
  const requirements: any[] = [];
  const scholarships: any[] = [];
  universities.forEach((u: any) => {
    const rel = deriveUniversityRelations(u);
    programs.push(...rel.programs);
    requirements.push(...rel.requirements);
    scholarships.push(...rel.scholarships);
  });
  await dataSource.getRepository(ProgramEntity).clear();
  await dataSource.getRepository(UniversityRequirementEntity).clear();
  await dataSource.getRepository(ScholarshipEntity).clear();
  if (programs.length) await dataSource.getRepository(ProgramEntity).save(programs as any);
  if (requirements.length) await dataSource.getRepository(UniversityRequirementEntity).save(requirements as any);
  if (scholarships.length) await dataSource.getRepository(ScholarshipEntity).save(scholarships as any);
}

/**
 * One-time backfill for databases created before the normalized tables
 * existed: derives programs/requirements/scholarships from existing
 * universities when the programs table is empty.
 */
export async function backfillUniversityRelations(dataSource: DataSource): Promise<void> {
  const repo = dataSource.getRepository(ProgramEntity);
  const count = await repo.count();
  if (count > 0) return;
  const unis = await dataSource.getRepository(UniversityEntity).find();
  if (!unis.length) return;
  await rebuildUniversityRelations(dataSource, unis);
}

// ---------------------------------------------------------------------------
// User normalization
// ---------------------------------------------------------------------------

export function rolePerms(role: string, roles?: RoleEntity[]): string[] {
  const r = roles ? roles.find((x) => x.name === role) : undefined;
  return r ? [...(r.permissions || [])] : role === 'super_admin' || role === 'admin' ? [...ALL_PERMISSIONS] : [];
}

export function normalizeUser(u: any, roles?: RoleEntity[]) {
  const role = u.role && ['admin', 'user', 'super_admin'].includes(u.role) ? u.role : 'user';
  return {
    id: u.id ?? undefined,
    name: u.name || 'User',
    email: u.email || '',
    role,
    permissions: Array.isArray(u.permissions) ? u.permissions : rolePerms(role, roles),
    emailVerified: !!u.emailVerified,
    profilePicture: u.profilePicture || '',
  };
}

// ---------------------------------------------------------------------------
// Seed universities (same catalog as the original file-based backend)
// ---------------------------------------------------------------------------

export const SEED_UNIVERSITIES: any[] = [
  {
    id: 1,
    name: 'Harvard University',
    location: 'Cambridge, USA',
    province: 'Massachusetts',
    region: 'North America',
    description: 'Ivy League research university',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800',
    details: {
      overview: 'Founded in 1636, Harvard is the oldest institution of higher learning in the United States',
      details: ['Located in Cambridge, Massachusetts', 'Part of the prestigious Ivy League', 'Known for its law, business, and medical schools', 'Endowment of over $50 billion', 'Notable alumni include 8 U.S. Presidents and numerous Nobel laureates'],
      courses: [
        { name: 'Computer Science', details: 'Study of computation and information' },
        { name: 'Economics', details: 'Study of production, consumption, and transfer of wealth' },
        { name: 'Political Science', details: 'Study of politics and government' },
        { name: 'Psychology', details: 'Study of mind and behavior' },
      ],
      requirements: ['High school diploma or equivalent', 'SAT/ACT scores', 'Letters of recommendation', 'Personal statement', 'Extracurricular activities'],
      prices: { undergraduate: '$57,261 per year', graduate: '$52,000 - $58,000 per year' },
    },
  },
  {
    id: 2,
    name: 'MIT',
    location: 'Cambridge, USA',
    province: 'Massachusetts',
    region: 'North America',
    description: 'Leading technology and engineering school',
    image: 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=800',
    details: {
      overview: 'Founded in 1861, MIT is world-renowned for engineering, computer science, and physical sciences',
      details: ['Located in Cambridge, Massachusetts', 'Strong emphasis on innovation and entrepreneurship', 'Notable for developing key technologies like the internet and GPS', '96 Nobel laureates associated with the institute'],
      courses: [
        { name: 'Computer Science', details: 'Study of computation and information' },
        { name: 'Electrical Engineering', details: 'Study of electrical systems' },
        { name: 'Mechanical Engineering', details: 'Study of mechanical systems' },
        { name: 'Physics', details: 'Study of matter and energy' },
      ],
      requirements: ['High school diploma with strong STEM focus', 'SAT/ACT scores (high math and science)', 'Letters of recommendation from math/science teachers', 'Personal statement', 'Research experience or projects'],
      prices: { undergraduate: '$57,986 per year', graduate: '$57,590 per year' },
    },
  },
  {
    id: 3,
    name: 'Stanford University',
    location: 'Stanford, USA',
    province: 'California',
    region: 'North America',
    description: 'Silicon Valley research university',
    image: 'https://images.unsplash.com/photo-1571269259264-5ccb2e888cbe?w=800',
    details: {
      overview: 'Founded in 1885, Stanford is known for its academic strength and proximity to Silicon Valley',
      details: ['Located in Stanford, California', 'Strong ties to Silicon Valley tech industry', 'Known for entrepreneurship and innovation', 'One of the largest university campuses in the US'],
      courses: [
        { name: 'Computer Science', details: 'Study of computation and information' },
        { name: 'Business', details: 'Study of business administration' },
        { name: 'Engineering', details: 'Study of engineering disciplines' },
        { name: 'Medicine', details: 'Study of medical sciences' },
      ],
      requirements: ['High school diploma', 'SAT/ACT scores', 'Letters of recommendation', 'Personal statement', 'Extracurricular activities'],
      prices: { undergraduate: '$56,169 per year', graduate: '$54,315 per year' },
    },
  },
  {
    id: 4,
    name: 'University of Oxford',
    location: 'Oxford, UK',
    province: 'England',
    region: 'Europe',
    description: 'Oldest English-speaking university',
    image: 'https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?w=800',
    details: {
      overview: 'Founded in 1096, Oxford is the oldest university in the English-speaking world',
      details: ['Located in Oxford, England', 'Collegiate system with 39 colleges', 'Known for academic excellence and research', 'Notable alumni include 28 British Prime Ministers'],
      courses: [
        { name: 'Philosophy, Politics and Economics', details: 'Interdisciplinary study of PPE' },
        { name: 'Medicine', details: 'Study of medical sciences' },
        { name: 'Law', details: 'Study of legal systems' },
        { name: 'English Literature', details: 'Study of English literature' },
      ],
      requirements: ['A-levels or equivalent', 'Personal statement', 'Academic references', 'Admissions test', 'Interview'],
      prices: { undergraduate: '£9,250 per year (UK)', graduate: '£10,000 - £40,000 per year' },
    },
  },
  {
    id: 5,
    name: 'University of Cambridge',
    location: 'Cambridge, UK',
    province: 'England',
    region: 'Europe',
    description: 'Historic research university',
    image: 'https://images.unsplash.com/photo-1592500565497-991d3e2e5f9a?w=800',
    details: {
      overview: "Founded in 1209, Cambridge is one of the world's oldest and most prestigious universities",
      details: ['Located in Cambridge, England', 'Collegiate system with 31 colleges', 'Known for scientific research and academic excellence', 'Notable alumni include 120 Nobel laureates'],
      courses: [
        { name: 'Natural Sciences', details: 'Study of natural sciences' },
        { name: 'Engineering', details: 'Study of engineering disciplines' },
        { name: 'Mathematics', details: 'Study of mathematics' },
        { name: 'Computer Science', details: 'Study of computation and information' },
      ],
      requirements: ['A-levels or equivalent', 'Personal statement', 'Academic references', 'Admissions test', 'Interview'],
      prices: { undergraduate: '£9,250 per year (UK)', graduate: '£10,000 - £45,000 per year' },
    },
  },
  {
    id: 6,
    name: 'ETH Zurich',
    location: 'Zurich, Switzerland',
    province: 'Zurich',
    region: 'Europe',
    description: 'Leading technical university',
    image: 'https://images.unsplash.com/photo-1555861496-0666c8981751?w=800',
    details: {
      overview: "Founded in 1855, ETH Zurich is one of the world's leading technical universities",
      details: ['Located in Zurich, Switzerland', 'Known for engineering and technology', 'Strong industry connections', '21 Nobel laureates associated with the university'],
      courses: [
        { name: 'Computer Science', details: 'Study of computation and information' },
        { name: 'Mechanical Engineering', details: 'Study of mechanical systems' },
        { name: 'Electrical Engineering', details: 'Study of electrical systems' },
        { name: 'Architecture', details: 'Study of architecture and design' },
      ],
      requirements: ['High school diploma with strong math/science', 'Entrance exam', 'Personal statement', 'Letters of recommendation'],
      prices: { undergraduate: 'CHF 1,300 per semester', graduate: 'CHF 1,300 per semester' },
    },
  },
  {
    id: 7,
    name: 'Imperial College London',
    location: 'London, UK',
    province: 'England',
    region: 'Europe',
    description: 'Science-based institution',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800',
    details: {
      overview: 'Founded in 1907, Imperial College London is a science-based university in London',
      details: ['Located in London, England', 'Specialized in science, engineering, medicine, and business', 'Known for research excellence', 'Strong industry partnerships'],
      courses: [
        { name: 'Computing', details: 'Study of computer science' },
        { name: 'Mechanical Engineering', details: 'Study of mechanical systems' },
        { name: 'Medicine', details: 'Study of medical sciences' },
        { name: 'Business', details: 'Study of business administration' },
      ],
      requirements: ['A-levels or equivalent', 'Personal statement', 'Academic references', 'Admissions test'],
      prices: { undergraduate: '£9,250 per year (UK)', graduate: '£15,000 - £35,000 per year' },
    },
  },
  {
    id: 8,
    name: 'National University of Singapore',
    location: 'Singapore',
    province: 'Singapore',
    region: 'Asia',
    description: 'Leading Asian university',
    image: 'https://images.unsplash.com/photo-1525635313341-29744db9f37d?w=800',
    details: {
      overview: "Founded in 1905, NUS is Singapore's flagship university",
      details: ['Located in Singapore', 'Known for academic excellence in Asia', 'Strong research focus', 'International student body'],
      courses: [
        { name: 'Computer Science', details: 'Study of computation and information' },
        { name: 'Business', details: 'Study of business administration' },
        { name: 'Engineering', details: 'Study of engineering disciplines' },
        { name: 'Medicine', details: 'Study of medical sciences' },
      ],
      requirements: ['High school diploma', 'SAT/ACT or equivalent', 'Personal statement', 'Letters of recommendation'],
      prices: { undergraduate: 'SGD 38,000 per year', graduate: 'SGD 40,000 - $50,000 per year' },
    },
  },
  {
    id: 9,
    name: 'Tsinghua University',
    location: 'Beijing, China',
    province: 'Beijing',
    region: 'Asia',
    description: 'Leading Chinese university',
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800',
    details: {
      overview: "Founded in 1911, Tsinghua is one of China's most prestigious universities",
      details: ['Located in Beijing, China', 'Known for engineering and computer science', 'Strong government connections', 'Alumni include many Chinese leaders'],
      courses: [
        { name: 'Computer Science', details: 'Study of computation and information' },
        { name: 'Engineering', details: 'Study of engineering disciplines' },
        { name: 'Architecture', details: 'Study of architecture and design' },
        { name: 'Economics', details: 'Study of economics' },
      ],
      requirements: ['High school diploma', 'Gaokao exam', 'Personal statement', 'Interview'],
      prices: { undergraduate: 'CNY 5,000 per year', graduate: 'CNY 8,000 - $30,000 per year' },
    },
  },
  {
    id: 10,
    name: 'University of Tokyo',
    location: 'Tokyo, Japan',
    province: 'Tokyo',
    region: 'Asia',
    description: "Japan's top university",
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    details: {
      overview: "Founded in 1877, the University of Tokyo is Japan's most prestigious university",
      details: ['Located in Tokyo, Japan', 'Known for research excellence', 'Strong in science and engineering', 'Many Nobel laureates among alumni'],
      courses: [
        { name: 'Engineering', details: 'Study of engineering disciplines' },
        { name: 'Science', details: 'Study of natural sciences' },
        { name: 'Medicine', details: 'Study of medical sciences' },
        { name: 'Economics', details: 'Study of economics' },
      ],
      requirements: ['High school diploma', 'Entrance exam', 'Personal statement', 'Interview'],
      prices: { undergraduate: 'JPY 535,800 per year', graduate: 'JPY 535,800 per year' },
    },
  },
  {
    id: 11,
    name: 'Peking University',
    location: 'Beijing, China',
    province: 'Beijing',
    region: 'Asia',
    description: 'Historic Chinese university',
    image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800',
    details: {
      overview: "Founded in 1898, Peking University is one of China's oldest and most prestigious universities",
      details: ['Located in Beijing, China', 'Known for humanities and social sciences', 'Beautiful campus with traditional Chinese architecture', 'Alumni include many Chinese leaders'],
      courses: [
        { name: 'Chinese Literature', details: 'Study of Chinese literature' },
        { name: 'History', details: 'Study of history' },
        { name: 'Philosophy', details: 'Study of philosophy' },
        { name: 'Economics', details: 'Study of economics' },
      ],
      requirements: ['High school diploma', 'Gaokao exam', 'Personal statement', 'Interview'],
      prices: { undergraduate: 'CNY 5,000 per year', graduate: 'CNY 8,000 - $30,000 per year' },
    },
  },
  {
    id: 12,
    name: 'Australian National University',
    location: 'Canberra, Australia',
    province: 'Australian Capital Territory',
    region: 'Oceania',
    description: 'National research university',
    image: 'https://images.unsplash.com/photo-1555861496-0666c8981751?w=800',
    details: {
      overview: "Founded in 1946, ANU is Australia's national university",
      details: ['Located in Canberra, Australia', 'Known for research excellence', 'Strong in science and policy', 'Beautiful campus'],
      courses: [
        { name: 'Science', details: 'Study of natural sciences' },
        { name: 'Engineering', details: 'Study of engineering disciplines' },
        { name: 'Law', details: 'Study of legal systems' },
        { name: 'Medicine', details: 'Study of medical sciences' },
      ],
      requirements: ['High school diploma', 'ATAR score', 'Personal statement', 'Letters of recommendation'],
      prices: { undergraduate: 'AUD 34,000 per year', graduate: 'AUD 37,000 - $45,000 per year' },
    },
  },
  {
    id: 13,
    name: 'University of Melbourne',
    location: 'Melbourne, Australia',
    province: 'Victoria',
    region: 'Oceania',
    description: "Australia's top university",
    image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800',
    details: {
      overview: "Founded in 1853, the University of Melbourne is Australia's oldest university",
      details: ['Located in Melbourne, Australia', 'Known for academic excellence', 'Strong research focus', 'Beautiful campus'],
      courses: [
        { name: 'Arts', details: 'Study of humanities and arts' },
        { name: 'Science', details: 'Study of natural sciences' },
        { name: 'Engineering', details: 'Study of engineering disciplines' },
        { name: 'Medicine', details: 'Study of medical sciences' },
      ],
      requirements: ['High school diploma', 'ATAR score', 'Personal statement', 'Letters of recommendation'],
      prices: { undergraduate: 'AUD 30,000 - $45,000 per year', graduate: 'AUD 35,000 - $50,000 per year' },
    },
  },
  {
    id: 14,
    name: 'University of Sydney',
    location: 'Sydney, Australia',
    province: 'New South Wales',
    region: 'Oceania',
    description: 'Leading Australian university',
    image: 'https://images.unsplash.com/photo-1555861496-0666c8981751?w=800',
    details: {
      overview: "Founded in 1850, the University of Sydney is Australia's first university",
      details: ['Located in Sydney, Australia', 'Historic campus', 'Known for academic excellence', 'Strong research programs'],
      courses: [
        { name: 'Arts', details: 'Study of humanities and arts' },
        { name: 'Science', details: 'Study of natural sciences' },
        { name: 'Engineering', details: 'Study of engineering disciplines' },
        { name: 'Law', details: 'Study of legal systems' },
      ],
      requirements: ['High school diploma', 'ATAR score', 'Personal statement', 'Letters of recommendation'],
      prices: { undergraduate: 'AUD 32,000 - $48,000 per year', graduate: 'AUD 38,000 - $55,000 per year' },
    },
  },
  {
    id: 15,
    name: 'University of São Paulo',
    location: 'São Paulo, Brazil',
    province: 'São Paulo',
    region: 'South America',
    description: "Brazil's largest university",
    image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800',
    details: {
      overview: "Founded in 1934, USP is Brazil's largest university",
      details: ['Located in São Paulo, Brazil', 'Public university with no tuition fees', 'Known for research excellence', 'Large student body'],
      courses: [
        { name: 'Engineering', details: 'Study of engineering disciplines' },
        { name: 'Medicine', details: 'Study of medical sciences' },
        { name: 'Law', details: 'Study of legal systems' },
        { name: 'Economics', details: 'Study of economics' },
      ],
      requirements: ['High school diploma', 'ENEM exam', 'Personal statement', 'Interview'],
      prices: { undergraduate: 'Free (public university)', graduate: 'Free (public university)' },
    },
  },
  {
    id: 16,
    name: 'University of Buenos Aires',
    location: 'Buenos Aires, Argentina',
    province: 'Buenos Aires',
    region: 'South America',
    description: "Argentina's top university",
    image: 'https://images.unsplash.com/photo-1518391846015-55a9cc003b25?w=800',
    details: {
      overview: "Founded in 1821, UBA is Argentina's largest and most prestigious university",
      details: ['Located in Buenos Aires, Argentina', 'Public university with no tuition fees', 'Known for academic excellence', 'Many Nobel laureates among alumni'],
      courses: [
        { name: 'Medicine', details: 'Study of medical sciences' },
        { name: 'Law', details: 'Study of legal systems' },
        { name: 'Engineering', details: 'Study of engineering disciplines' },
        { name: 'Economics', details: 'Study of economics' },
      ],
      requirements: ['High school diploma', 'Entrance exam', 'Personal statement'],
      prices: { undergraduate: 'Free (public university)', graduate: 'Free (public university)' },
    },
  },
  {
    id: 17,
    name: 'University of Cape Town',
    location: 'Cape Town, South Africa',
    province: 'Western Cape',
    region: 'Africa',
    description: "Africa's leading university",
    image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800',
    details: {
      overview: "Founded in 1829, UCT is South Africa's oldest university",
      details: ['Located in Cape Town, South Africa', 'Beautiful campus with mountain views', 'Known for academic excellence', 'Strong research programs'],
      courses: [
        { name: 'Commerce', details: 'Study of business and commerce' },
        { name: 'Science', details: 'Study of natural sciences' },
        { name: 'Engineering', details: 'Study of engineering disciplines' },
        { name: 'Humanities', details: 'Study of humanities' },
      ],
      requirements: ['High school diploma', 'NSC exam results', 'Personal statement', 'Letters of recommendation'],
      prices: { undergraduate: 'ZAR 50,000 - $80,000 per year', graduate: 'ZAR 60,000 - $100,000 per year' },
    },
  },
  {
    id: 18,
    name: 'Stellenbosch University',
    location: 'Stellenbosch, South Africa',
    province: 'Western Cape',
    region: 'Africa',
    description: 'Top South African university',
    image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800',
    details: {
      overview: "Founded in 1918, Stellenbosch University is one of South Africa's top universities",
      details: ['Located in Stellenbosch, South Africa', 'Known for wine research', 'Beautiful campus in wine region', 'Strong academic programs'],
      courses: [
        { name: 'Agricultural Sciences', details: 'Study of agriculture' },
        { name: 'Science', details: 'Study of natural sciences' },
        { name: 'Engineering', details: 'Study of engineering disciplines' },
        { name: 'Business', details: 'Study of business administration' },
      ],
      requirements: ['High school diploma', 'NSC exam results', 'Personal statement', 'Letters of recommendation'],
      prices: { undergraduate: 'ZAR 45,000 - $75,000 per year', graduate: 'ZAR 55,000 - $95,000 per year' },
    },
  },
];

// ---------------------------------------------------------------------------
// Database loading
// ---------------------------------------------------------------------------

/**
 * Populates an empty database with seed data. If a legacy backend/data/db.json
 * file exists, its contents are migrated instead of the static seed so existing
 * data is preserved.
 */
export async function seedDatabase(dataSource: DataSource): Promise<void> {
  const usersRepo = dataSource.getRepository(UserEntity);
  const count = await usersRepo.count();
  if (count > 0) return;

  const legacyFile = join(process.cwd(), 'data', 'db.json');
  if (existsSync(legacyFile)) {
    try {
      const shape = JSON.parse(readFileSync(legacyFile, 'utf-8'));
      await applyDbShape(dataSource, shape, true);
      return;
    } catch (err) {
      console.error('Failed to migrate legacy data/db.json, using seed data:', err);
    }
  }

  await applyDbShape(dataSource, {} as any, true);
}

/**
 * Postgres uses 32-bit `integer` ids. The legacy db.json backend used
 * epoch-millisecond timestamps as ids (e.g. 1785937641307), which overflow.
 * This drops any id that doesn't fit in a 32-bit int so the DB auto-assigns a
 * fresh one, and normalizes epoch-millis timestamps to ISO strings.
 */
function sanitizeLegacyRow(row: any): any {
  if (!row || typeof row !== 'object') return row;
  const copy = { ...row };
  if (typeof copy.id === 'number' && (!Number.isInteger(copy.id) || copy.id > 2147483647 || copy.id < -2147483648)) {
    delete copy.id;
  }
  ['timestamp', 'deletedAt', 'createdAt', 'updatedAt'].forEach((k) => {
    if (typeof copy[k] === 'number') {
      copy[k] = new Date(copy[k]).toISOString();
    }
  });
  return copy;
}

/**
 * Writes a full database shape (same contract as /admin/export) into the DB,
 * replacing all existing rows. Used by seeding, import, and database reset.
 */
export async function applyDbShape(
  dataSource: DataSource,
  shape: any,
  isSeed = false,
): Promise<void> {
  const repos = {
    universities: dataSource.getRepository(UniversityEntity),
    regions: dataSource.getRepository(RegionEntity),
    users: dataSource.getRepository(UserEntity),
    roles: dataSource.getRepository(RoleEntity),
    settings: dataSource.getRepository(SettingsEntity),
    activity: dataSource.getRepository(ActivityLogEntity),
    versions: dataSource.getRepository(VersionEntity),
    trash: dataSource.getRepository(TrashItemEntity),
    bookmarks: dataSource.getRepository(BookmarkEntity),
    reviews: dataSource.getRepository(ReviewEntity),
    applications: dataSource.getRepository(ApplicationEntity),
    preferences: dataSource.getRepository(UserPreferencesEntity),
    scores: dataSource.getRepository(AcademicScoreEntity),
    recommendations: dataSource.getRepository(RecommendationEntity),
    programs: dataSource.getRepository(ProgramEntity),
    requirements: dataSource.getRepository(UniversityRequirementEntity),
    scholarships: dataSource.getRepository(ScholarshipEntity),
  };

  const roles = (Array.isArray(shape.roles) && shape.roles.length
    ? shape.roles
    : SEED_ROLES
  ).map((r: any) => ({
    name: r.name || 'role',
    permissions: Array.isArray(r.permissions) ? r.permissions : [],
    isSystem: !!r.isSystem,
  }));

  const settings = { ...SEED_SETTINGS, ...(shape.settings || {}) };

  const users = (Array.isArray(shape.users) && shape.users.length
    ? shape.users
    : [{ name: 'Kai', email: 'kai@example.com', role: 'super_admin' }]
  ).map((u: any) => normalizeUser(u, roles as any));

  const universities = (Array.isArray(shape.universities)
    ? shape.universities
    : SEED_UNIVERSITIES
  ).map((u: any) => enrichUniversity({ ...u }));

  const regions = Array.isArray(shape.regions) && shape.regions.length
    ? shape.regions
    : SEED_REGIONS;

  const activity = (Array.isArray(shape.activityLog) ? shape.activityLog : []).map(sanitizeLegacyRow);
  const trash = (Array.isArray(shape.trash) ? shape.trash : []).map(sanitizeLegacyRow);
  const bookmarks = (Array.isArray(shape.bookmarks) ? shape.bookmarks : []).map(sanitizeLegacyRow);
  const reviews = (Array.isArray(shape.reviews) ? shape.reviews : []).map(sanitizeLegacyRow);
  const applications = (Array.isArray(shape.applications) ? shape.applications : []).map(sanitizeLegacyRow);
  const preferences = (Array.isArray(shape.userPreferences) ? shape.userPreferences : []).map(sanitizeLegacyRow);
  const scores = (Array.isArray(shape.academicScores) ? shape.academicScores : []).map(sanitizeLegacyRow);
  const recommendations = (Array.isArray(shape.recommendations) ? shape.recommendations : []).map(sanitizeLegacyRow);
  const versions: any[] = [];
  if (shape.versions && typeof shape.versions === 'object') {
    Object.entries(shape.versions).forEach(([uniId, list]: any) => {
      (list || []).forEach((v: any) => {
        versions.push(
          sanitizeLegacyRow({
            universityId: parseInt(uniId, 10),
            version: v.version,
            snapshot: v.snapshot,
            actor: v.actor || 'admin',
            summary: v.summary || '',
            timestamp: v.timestamp,
          }),
        );
      });
    });
  }

  // Clear in dependency order
  await repos.preferences.clear();
  await repos.scores.clear();
  await repos.recommendations.clear();
  await repos.reviews.clear();
  await repos.applications.clear();
  await repos.bookmarks.clear();
  await repos.versions.clear();
  await repos.activity.clear();
  await repos.trash.clear();
  await repos.programs.clear();
  await repos.requirements.clear();
  await repos.scholarships.clear();
  await repos.universities.clear();
  await repos.regions.clear();
  await repos.users.clear();
  await repos.roles.clear();
  await repos.settings.clear();

  await repos.roles.save(roles as any);
  await repos.settings.save(settings as any);
  await repos.regions.save(regions.map((r: string) => ({ name: r })) as any);
  const savedUniversities = (await repos.universities.save(universities as any)) as any[];
  // Rebuild the normalized catalog from the (now id-assigned) universities
  await rebuildUniversityRelations(dataSource, savedUniversities);
  await repos.users.save(users as any);
  await repos.activity.save(activity as any);
  await repos.trash.save(trash as any);
  await repos.bookmarks.save(bookmarks as any);
  await repos.versions.save(versions as any);
  await repos.reviews.save(reviews as any);
  await repos.applications.save(applications as any);
  await repos.preferences.save(preferences as any);
  await repos.scores.save(scores as any);
  await repos.recommendations.save(recommendations as any);

  if (isSeed) {
    // Ensure all system roles exist (e.g. super_admin) even when migrating
    // from a legacy db.json that predates them.
    const rolesRepo = dataSource.getRepository(RoleEntity);
    const existingRoles = await rolesRepo.find();
    for (const r of SEED_ROLES) {
      if (!existingRoles.some((x) => x.name === r.name)) {
        await rolesRepo.save({ ...r } as any);
      }
    }

    // Make sure the known demo admin has a working password and holds the
    // Super Admin role (it is the account the owner uses).
    const admin = await dataSource
      .getRepository(UserEntity)
      .findOne({ where: { email: 'kai@example.com' } });
    if (admin) {
      if (!admin.passwordHash) {
        admin.passwordHash = await bcrypt.hash('250510', 10);
      }
      if (admin.role !== 'super_admin') {
        admin.role = 'super_admin';
        admin.permissions = [...ALL_PERMISSIONS];
      }
      await dataSource.getRepository(UserEntity).save(admin);
    }
  }
}
