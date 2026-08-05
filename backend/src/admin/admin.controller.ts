import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// ---------------------------------------------------------------------------
// File-backed persistence + admin systems. (data lives in backend/data/db.json)
// Data is stored in backend/data/db.json so changes survive server restarts.
// Includes: CRUD for universities/regions/users, soft-delete trash with
// revert/permanent-delete, per-university version history, activity log,
// settings, permissions, bookmark tracking, export/import and reports.
// Swap this for Postgres later — the API contract stays the same.
// ---------------------------------------------------------------------------

interface ActivityEntry {
  id: number;
  action: string; // created | edited | deleted | reverted | permanently_deleted | imported | restored
  entity: string; // university | region | user | settings
  entityId: string;
  entityName: string;
  actor: string;
  timestamp: string;
  meta?: any;
}

interface VersionEntry {
  version: number;
  snapshot: any;
  timestamp: string;
  actor: string;
  summary: string;
}

interface TrashItem {
  id: number;
  type: 'university' | 'user';
  item: any;
  deletedAt: string;
  deletedBy: string;
}

interface BookmarkEvent {
  id: number;
  universityId: number;
  universityName: string;
  region: string;
  action: 'save' | 'unsave';
  userEmail?: string;
  timestamp: string;
}

interface Role {
  id: number;
  name: string;
  permissions: string[];
  isSystem?: boolean;
}

interface DbShape {
  universities: any[];
  regions: string[];
  users: any[];
  roles: Role[];
  settings: { appName: string; appIcon: string };
  activityLog: ActivityEntry[];
  versions: Record<string, VersionEntry[]>;
  trash: TrashItem[];
  bookmarks: BookmarkEvent[];
}

export const ALL_PERMISSIONS = [
  'manage_content',
  'manage_users',
  'manage_settings',
  'view_reports',
  'manage_system',
];

const DATA_DIR = join(process.cwd(), 'data');
const DB_FILE = join(DATA_DIR, 'db.json');

const seedDb: DbShape = {
  universities: [
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
          { name: 'Psychology', details: 'Study of mind and behavior' }
        ],
        requirements: ['High school diploma or equivalent', 'SAT/ACT scores', 'Letters of recommendation', 'Personal statement', 'Extracurricular activities'],
        prices: { undergraduate: '$57,261 per year', graduate: '$52,000 - $58,000 per year' }
      }
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
          { name: 'Physics', details: 'Study of matter and energy' }
        ],
        requirements: ['High school diploma with strong STEM focus', 'SAT/ACT scores (high math and science)', 'Letters of recommendation from math/science teachers', 'Personal statement', 'Research experience or projects'],
        prices: { undergraduate: '$57,986 per year', graduate: '$57,590 per year' }
      }
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
          { name: 'Medicine', details: 'Study of medical sciences' }
        ],
        requirements: ['High school diploma', 'SAT/ACT scores', 'Letters of recommendation', 'Personal statement', 'Extracurricular activities'],
        prices: { undergraduate: '$56,169 per year', graduate: '$54,315 per year' }
      }
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
          { name: 'English Literature', details: 'Study of English literature' }
        ],
        requirements: ['A-levels or equivalent', 'Personal statement', 'Academic references', 'Admissions test', 'Interview'],
        prices: { undergraduate: '£9,250 per year (UK)', graduate: '£10,000 - £40,000 per year' }
      }
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
        overview: 'Founded in 1209, Cambridge is one of the world\'s oldest and most prestigious universities',
        details: ['Located in Cambridge, England', 'Collegiate system with 31 colleges', 'Known for scientific research and academic excellence', 'Notable alumni include 120 Nobel laureates'],
        courses: [
          { name: 'Natural Sciences', details: 'Study of natural sciences' },
          { name: 'Engineering', details: 'Study of engineering disciplines' },
          { name: 'Mathematics', details: 'Study of mathematics' },
          { name: 'Computer Science', details: 'Study of computation and information' }
        ],
        requirements: ['A-levels or equivalent', 'Personal statement', 'Academic references', 'Admissions test', 'Interview'],
        prices: { undergraduate: '£9,250 per year (UK)', graduate: '£10,000 - £45,000 per year' }
      }
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
        overview: 'Founded in 1855, ETH Zurich is one of the world\'s leading technical universities',
        details: ['Located in Zurich, Switzerland', 'Known for engineering and technology', 'Strong industry connections', '21 Nobel laureates associated with the university'],
        courses: [
          { name: 'Computer Science', details: 'Study of computation and information' },
          { name: 'Mechanical Engineering', details: 'Study of mechanical systems' },
          { name: 'Electrical Engineering', details: 'Study of electrical systems' },
          { name: 'Architecture', details: 'Study of architecture and design' }
        ],
        requirements: ['High school diploma with strong math/science', 'Entrance exam', 'Personal statement', 'Letters of recommendation'],
        prices: { undergraduate: 'CHF 1,300 per semester', graduate: 'CHF 1,300 per semester' }
      }
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
          { name: 'Business', details: 'Study of business administration' }
        ],
        requirements: ['A-levels or equivalent', 'Personal statement', 'Academic references', 'Admissions test'],
        prices: { undergraduate: '£9,250 per year (UK)', graduate: '£15,000 - £35,000 per year' }
      }
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
        overview: 'Founded in 1905, NUS is Singapore\'s flagship university',
        details: ['Located in Singapore', 'Known for academic excellence in Asia', 'Strong research focus', 'International student body'],
        courses: [
          { name: 'Computer Science', details: 'Study of computation and information' },
          { name: 'Business', details: 'Study of business administration' },
          { name: 'Engineering', details: 'Study of engineering disciplines' },
          { name: 'Medicine', details: 'Study of medical sciences' }
        ],
        requirements: ['High school diploma', 'SAT/ACT or equivalent', 'Personal statement', 'Letters of recommendation'],
        prices: { undergraduate: 'SGD 38,000 per year', graduate: 'SGD 40,000 - $50,000 per year' }
      }
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
        overview: 'Founded in 1911, Tsinghua is one of China\'s most prestigious universities',
        details: ['Located in Beijing, China', 'Known for engineering and computer science', 'Strong government connections', 'Alumni include many Chinese leaders'],
        courses: [
          { name: 'Computer Science', details: 'Study of computation and information' },
          { name: 'Engineering', details: 'Study of engineering disciplines' },
          { name: 'Architecture', details: 'Study of architecture and design' },
          { name: 'Economics', details: 'Study of economics' }
        ],
        requirements: ['High school diploma', 'Gaokao exam', 'Personal statement', 'Interview'],
        prices: { undergraduate: 'CNY 5,000 per year', graduate: 'CNY 8,000 - $30,000 per year' }
      }
    },
    {
      id: 10,
      name: 'University of Tokyo',
      location: 'Tokyo, Japan',
      province: 'Tokyo',
      region: 'Asia',
      description: 'Japan\'s top university',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      details: {
        overview: 'Founded in 1877, the University of Tokyo is Japan\'s most prestigious university',
        details: ['Located in Tokyo, Japan', 'Known for research excellence', 'Strong in science and engineering', 'Many Nobel laureates among alumni'],
        courses: [
          { name: 'Engineering', details: 'Study of engineering disciplines' },
          { name: 'Science', details: 'Study of natural sciences' },
          { name: 'Medicine', details: 'Study of medical sciences' },
          { name: 'Economics', details: 'Study of economics' }
        ],
        requirements: ['High school diploma', 'Entrance exam', 'Personal statement', 'Interview'],
        prices: { undergraduate: 'JPY 535,800 per year', graduate: 'JPY 535,800 per year' }
      }
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
        overview: 'Founded in 1898, Peking University is one of China\'s oldest and most prestigious universities',
        details: ['Located in Beijing, China', 'Known for humanities and social sciences', 'Beautiful campus with traditional Chinese architecture', 'Alumni include many Chinese leaders'],
        courses: [
          { name: 'Chinese Literature', details: 'Study of Chinese literature' },
          { name: 'History', details: 'Study of history' },
          { name: 'Philosophy', details: 'Study of philosophy' },
          { name: 'Economics', details: 'Study of economics' }
        ],
        requirements: ['High school diploma', 'Gaokao exam', 'Personal statement', 'Interview'],
        prices: { undergraduate: 'CNY 5,000 per year', graduate: 'CNY 8,000 - $30,000 per year' }
      }
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
        overview: 'Founded in 1946, ANU is Australia\'s national university',
        details: ['Located in Canberra, Australia', 'Known for research excellence', 'Strong in science and policy', 'Beautiful campus'],
        courses: [
          { name: 'Science', details: 'Study of natural sciences' },
          { name: 'Engineering', details: 'Study of engineering disciplines' },
          { name: 'Law', details: 'Study of legal systems' },
          { name: 'Medicine', details: 'Study of medical sciences' }
        ],
        requirements: ['High school diploma', 'ATAR score', 'Personal statement', 'Letters of recommendation'],
        prices: { undergraduate: 'AUD 34,000 per year', graduate: 'AUD 37,000 - $45,000 per year' }
      }
    },
    {
      id: 13,
      name: 'University of Melbourne',
      location: 'Melbourne, Australia',
      province: 'Victoria',
      region: 'Oceania',
      description: 'Australia\'s top university',
      image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?w=800',
      details: {
        overview: 'Founded in 1853, the University of Melbourne is Australia\'s oldest university',
        details: ['Located in Melbourne, Australia', 'Known for academic excellence', 'Strong research focus', 'Beautiful campus'],
        courses: [
          { name: 'Arts', details: 'Study of humanities and arts' },
          { name: 'Science', details: 'Study of natural sciences' },
          { name: 'Engineering', details: 'Study of engineering disciplines' },
          { name: 'Medicine', details: 'Study of medical sciences' }
        ],
        requirements: ['High school diploma', 'ATAR score', 'Personal statement', 'Letters of recommendation'],
        prices: { undergraduate: 'AUD 30,000 - $45,000 per year', graduate: 'AUD 35,000 - $50,000 per year' }
      }
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
        overview: 'Founded in 1850, the University of Sydney is Australia\'s first university',
        details: ['Located in Sydney, Australia', 'Historic campus', 'Known for academic excellence', 'Strong research programs'],
        courses: [
          { name: 'Arts', details: 'Study of humanities and arts' },
          { name: 'Science', details: 'Study of natural sciences' },
          { name: 'Engineering', details: 'Study of engineering disciplines' },
          { name: 'Law', details: 'Study of legal systems' }
        ],
        requirements: ['High school diploma', 'ATAR score', 'Personal statement', 'Letters of recommendation'],
        prices: { undergraduate: 'AUD 32,000 - $48,000 per year', graduate: 'AUD 38,000 - $55,000 per year' }
      }
    },
    {
      id: 15,
      name: 'University of São Paulo',
      location: 'São Paulo, Brazil',
      province: 'São Paulo',
      region: 'South America',
      description: 'Brazil\'s largest university',
      image: 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=800',
      details: {
        overview: 'Founded in 1934, USP is Brazil\'s largest university',
        details: ['Located in São Paulo, Brazil', 'Public university with no tuition fees', 'Known for research excellence', 'Large student body'],
        courses: [
          { name: 'Engineering', details: 'Study of engineering disciplines' },
          { name: 'Medicine', details: 'Study of medical sciences' },
          { name: 'Law', details: 'Study of legal systems' },
          { name: 'Economics', details: 'Study of economics' }
        ],
        requirements: ['High school diploma', 'ENEM exam', 'Personal statement', 'Interview'],
        prices: { undergraduate: 'Free (public university)', graduate: 'Free (public university)' }
      }
    },
    {
      id: 16,
      name: 'University of Buenos Aires',
      location: 'Buenos Aires, Argentina',
      province: 'Buenos Aires',
      region: 'South America',
      description: 'Argentina\'s top university',
      image: 'https://images.unsplash.com/photo-1518391846015-55a9cc003b25?w=800',
      details: {
        overview: 'Founded in 1821, UBA is Argentina\'s largest and most prestigious university',
        details: ['Located in Buenos Aires, Argentina', 'Public university with no tuition fees', 'Known for academic excellence', 'Many Nobel laureates among alumni'],
        courses: [
          { name: 'Medicine', details: 'Study of medical sciences' },
          { name: 'Law', details: 'Study of legal systems' },
          { name: 'Engineering', details: 'Study of engineering disciplines' },
          { name: 'Economics', details: 'Study of economics' }
        ],
        requirements: ['High school diploma', 'Entrance exam', 'Personal statement'],
        prices: { undergraduate: 'Free (public university)', graduate: 'Free (public university)' }
      }
    },
    {
      id: 17,
      name: 'University of Cape Town',
      location: 'Cape Town, South Africa',
      province: 'Western Cape',
      region: 'Africa',
      description: 'Africa\'s leading university',
      image: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800',
      details: {
        overview: 'Founded in 1829, UCT is South Africa\'s oldest university',
        details: ['Located in Cape Town, South Africa', 'Beautiful campus with mountain views', 'Known for academic excellence', 'Strong research programs'],
        courses: [
          { name: 'Commerce', details: 'Study of business and commerce' },
          { name: 'Science', details: 'Study of natural sciences' },
          { name: 'Engineering', details: 'Study of engineering disciplines' },
          { name: 'Humanities', details: 'Study of humanities' }
        ],
        requirements: ['High school diploma', 'NSC exam results', 'Personal statement', 'Letters of recommendation'],
        prices: { undergraduate: 'ZAR 50,000 - $80,000 per year', graduate: 'ZAR 60,000 - $100,000 per year' }
      }
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
        overview: 'Founded in 1918, Stellenbosch University is one of South Africa\'s top universities',
        details: ['Located in Stellenbosch, South Africa', 'Known for wine research', 'Beautiful campus in wine region', 'Strong academic programs'],
        courses: [
          { name: 'Agricultural Sciences', details: 'Study of agriculture' },
          { name: 'Science', details: 'Study of natural sciences' },
          { name: 'Engineering', details: 'Study of engineering disciplines' },
          { name: 'Business', details: 'Study of business administration' }
        ],
        requirements: ['High school diploma', 'NSC exam results', 'Personal statement', 'Letters of recommendation'],
        prices: { undergraduate: 'ZAR 45,000 - $75,000 per year', graduate: 'ZAR 55,000 - $95,000 per year' }
      }
    },
  ],
  regions: ['North America', 'Europe', 'Asia', 'Oceania', 'South America', 'Africa'],
  users: [
    { id: 1, name: 'Kai', email: 'kai@example.com', role: 'admin', createdAt: '2024-01-01', permissions: [...ALL_PERMISSIONS] },
  ],
  roles: [
    { id: 1, name: 'admin', permissions: [...ALL_PERMISSIONS], isSystem: true },
    { id: 2, name: 'user', permissions: [], isSystem: true },
  ],
  settings: { appName: 'UniVerse', appIcon: '' },
  activityLog: [],
  versions: {},
  trash: [],
  bookmarks: [],
};

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

function rolePerms(role: string, roles?: Role[]): string[] {
  const r = roles ? roles.find(x => x.name === role) : undefined;
  return r ? [...r.permissions] : (role === 'admin' ? [...ALL_PERMISSIONS] : []);
}

function normalizeUser(u: any, roles?: Role[]) {
  const known = roles ? roles.some(x => x.name === u.role) : (u.role === 'admin' || u.role === 'user');
  const role = known ? u.role : (u.role === 'admin' ? 'admin' : 'user');
  return {
    id: u.id ?? Date.now(),
    name: u.name || 'User',
    email: u.email || '',
    role,
    createdAt: u.createdAt || new Date().toISOString().slice(0, 10),
    permissions: Array.isArray(u.permissions) ? u.permissions : rolePerms(role, roles),
  };
}

function loadDb(): DbShape {
  try {
    if (existsSync(DB_FILE)) {
      const parsed = JSON.parse(readFileSync(DB_FILE, 'utf-8'));
      const seedRoles = clone(seedDb.roles);
      const parsedRoles = Array.isArray(parsed.roles) && parsed.roles.length ? parsed.roles : seedRoles;
      const rolesList: Role[] = parsedRoles.map((r: any) => ({
        id: r.id ?? Date.now(),
        name: r.name || 'role',
        permissions: Array.isArray(r.permissions) ? r.permissions : [],
        isSystem: !!r.isSystem,
      }));
      return {
        universities: (Array.isArray(parsed.universities) ? parsed.universities : clone(seedDb.universities)).map(enrichUniversity),
        regions: Array.isArray(parsed.regions) ? parsed.regions : [...seedDb.regions],
        users: (Array.isArray(parsed.users) ? parsed.users : clone(seedDb.users)).map(u => normalizeUser(u, rolesList)),
        roles: rolesList,
        settings: { ...seedDb.settings, ...(parsed.settings || {}) },
        activityLog: Array.isArray(parsed.activityLog) ? parsed.activityLog : [],
        versions: parsed.versions && typeof parsed.versions === 'object' ? parsed.versions : {},
        trash: Array.isArray(parsed.trash) ? parsed.trash : [],
        bookmarks: Array.isArray(parsed.bookmarks) ? parsed.bookmarks : [],
      };
    }
  } catch (err) {
    console.error('Failed to read data/db.json, using seed data:', err);
  }
  const seeded = clone(seedDb);
  seeded.universities = seeded.universities.map(enrichUniversity);
  return seeded;
}

function saveDb() {
  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

let db: DbShape = loadDb();

// ---------------------------------------------------------------------------
// Enrichment: deterministic defaults for ranking/scholarship/deadline/etc.
// so every university has full public-page data without hand-writing it.
// ---------------------------------------------------------------------------

function enrichUniversity(u: any): any {
  const id = u.id || 0;
  const courses = Array.isArray(u.details?.courses) ? u.details.courses.map((c: any) => c.name || '') : [];

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
// Helpers
// ---------------------------------------------------------------------------

let logId = Date.now();
let trashId = Date.now() + 100000;
let bookmarkId = Date.now() + 200000;

function now() {
  return new Date().toISOString();
}

function actorOf(body: any): string {
  return (body && body.actor) || 'admin';
}

function logActivity(action: string, entity: string, entityId: string | number, entityName: string, actor: string, meta?: any) {
  db.activityLog.unshift({
    id: ++logId,
    action,
    entity,
    entityId: String(entityId),
    entityName,
    actor,
    timestamp: now(),
    meta,
  });
  if (db.activityLog.length > 300) db.activityLog.length = 300;
}

function pushVersion(uni: any, actor: string, summary: string) {
  const key = String(uni.id);
  const list = db.versions[key] || [];
  const nextVersion = list.length ? list[list.length - 1].version + 1 : 1;
  list.push({
    version: nextVersion,
    snapshot: clone(uni),
    timestamp: now(),
    actor,
    summary,
  });
  if (list.length > 20) list.splice(0, list.length - 20);
  db.versions[key] = list;
  return nextVersion;
}

@Controller('admin')
export class AdminController {
  // ---------------- Universities ----------------
  @Get('universities')
  getUniversities() {
    return db.universities;
  }

  @Post('universities')
  createUniversity(@Body() body: any) {
    const actor = actorOf(body);
    const newUni = {
      id: Date.now(),
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
    };
    db.universities.push(newUni);
    pushVersion(newUni, actor, 'Created');
    logActivity('created', 'university', newUni.id, newUni.name, actor);
    saveDb();
    return newUni;
  }

  @Put('universities/:id')
  updateUniversity(@Param('id') id: string, @Body() body: any) {
    const actor = actorOf(body);
    const index = db.universities.findIndex(u => u.id === parseInt(id));
    if (index === -1) {
      throw new Error('University not found');
    }
    const previous = db.universities[index];
    db.universities[index] = { ...previous, ...body };
    const version = pushVersion(db.universities[index], actor, body._summary || 'Edited');
    logActivity('edited', 'university', id, db.universities[index].name, actor, { version });
    saveDb();
    return db.universities[index];
  }

  @Delete('universities/:id')
  deleteUniversity(@Param('id') id: string, @Body() body: any) {
    const actor = actorOf(body);
    const index = db.universities.findIndex(u => u.id === parseInt(id));
    if (index === -1) {
      throw new Error('University not found');
    }
    const [deleted] = db.universities.splice(index, 1);
    const tid = ++trashId;
    db.trash.push({
      id: tid,
      type: 'university',
      item: deleted,
      deletedAt: now(),
      deletedBy: actor,
    });
    logActivity('deleted', 'university', id, deleted.name, actor, { trashId: tid });
    saveDb();
    return deleted;
  }

  @Post('universities/:id/revert/:version')
  revertUniversity(@Param('id') id: string, @Param('version') version: string, @Body() body: any) {
    const actor = actorOf(body);
    const key = String(parseInt(id));
    const list = db.versions[key] || [];
    const target = list.find(v => v.version === parseInt(version));
    if (!target) {
      throw new Error('Version not found');
    }
    const index = db.universities.findIndex(u => u.id === parseInt(id));
    if (index === -1) {
      throw new Error('University not found');
    }
    // Keep a copy of the current state as the newest version before reverting
    pushVersion(db.universities[index], actor, 'Auto-saved before revert');
    const restored = { ...db.universities[index], ...clone(target.snapshot) };
    db.universities[index] = restored;
    logActivity('reverted', 'university', id, restored.name, actor, { version: target.version });
    saveDb();
    return restored;
  }

  // ---------------- Versions ----------------
  @Get('versions')
  getVersions() {
    const names = new Map(db.universities.map(u => [String(u.id), u.name]));
    const result: any[] = [];
    Object.keys(db.versions).forEach(key => {
      result.push({
        universityId: parseInt(key),
        universityName: names.get(key) || `University ${key}`,
        versions: db.versions[key],
      });
    });
    return result.sort((a, b) => b.universityId - a.universityId);
  }

  // ---------------- Trash (soft-deleted items) ----------------
  @Get('trash')
  getTrash() {
    return db.trash;
  }

  @Post('trash/:id/restore')
  restoreTrashItem(@Param('id') id: string, @Body() body: any) {
    const actor = actorOf(body);
    const index = db.trash.findIndex(t => t.id === parseInt(id));
    if (index === -1) {
      throw new Error('Trash item not found');
    }
    const [entry] = db.trash.splice(index, 1);
    if (entry.type === 'user') {
      db.users.push(normalizeUser(entry.item));
    } else {
      db.universities.push(entry.item);
    }
    logActivity('reverted', entry.type, entry.item.id, entry.item.name || entry.item.email || 'item', actor, { restored: true });
    saveDb();
    return entry.item;
  }

  @Delete('trash/:id')
  permanentlyDeleteTrashItem(@Param('id') id: string, @Body() body: any) {
    const actor = actorOf(body);
    const index = db.trash.findIndex(t => t.id === parseInt(id));
    if (index === -1) {
      throw new Error('Trash item not found');
    }
    const [entry] = db.trash.splice(index, 1);
    // Drop version history for permanently deleted content
    if (entry.type === 'university') {
      delete db.versions[String(entry.item.id)];
    }
    logActivity('permanently_deleted', entry.type, entry.item.id, entry.item.name || entry.item.email || 'item', actor);
    saveDb();
    return entry.item;
  }

  // ---------------- Regions ----------------
  @Get('regions')
  getRegions() {
    return db.regions;
  }

  @Post('regions')
  createRegion(@Body() body: any) {
    const actor = actorOf(body);
    const name = (body.name || '').trim();
    if (!name) {
      throw new Error('Region name cannot be empty');
    }
    if (db.regions.includes(name)) {
      throw new Error('Region already exists');
    }
    db.regions.push(name);
    logActivity('created', 'region', name, name, actor);
    saveDb();
    return { name };
  }

  @Put('regions/:name')
  renameRegion(@Param('name') name: string, @Body() body: any) {
    const actor = actorOf(body);
    const index = db.regions.indexOf(name);
    if (index === -1) {
      throw new Error('Region not found');
    }
    const newName = (body.name || '').trim();
    if (!newName) {
      throw new Error('Region name cannot be empty');
    }
    if (newName !== name && db.regions.includes(newName)) {
      throw new Error('Region already exists');
    }
    db.regions[index] = newName;
    db.universities.forEach(u => {
      if (u.region === name) {
        u.region = newName;
      }
    });
    logActivity('edited', 'region', newName, newName, actor, { from: name });
    saveDb();
    return db.regions;
  }

  @Delete('regions/:name')
  deleteRegion(@Param('name') name: string, @Body() body: any) {
    const actor = actorOf(body);
    const index = db.regions.indexOf(name);
    if (index === -1) {
      throw new Error('Region not found');
    }
    const [deleted] = db.regions.splice(index, 1);
    logActivity('deleted', 'region', name, name, actor);
    saveDb();
    return { name: deleted };
  }

  // ---------------- Users ----------------
  @Get('users')
  getUsers() {
    return db.users;
  }

  @Post('users')
  createUser(@Body() body: any) {
    const actor = actorOf(body);
    const role = body.role && db.roles.some(r => r.name === body.role) ? body.role : 'user';
    const user = normalizeUser(
      {
        name: body.name || 'User',
        email: body.email || '',
        role,
        permissions: rolePerms(role, db.roles),
      },
      db.roles
    );
    if (db.users.some(u => u.email && u.email === user.email)) {
      throw new Error('User with this email already exists');
    }
    db.users.push(user);
    logActivity('created', 'user', user.id, user.email || user.name, actor);
    saveDb();
    return user;
  }

  @Put('users/:id')
  updateUser(@Param('id') id: string, @Body() body: any) {
    const actor = actorOf(body);
    const index = db.users.findIndex(u => u.id === parseInt(id));
    if (index === -1) {
      throw new Error('User not found');
    }
    const previous = db.users[index];
    if (body.role !== undefined && !db.roles.some(r => r.name === body.role)) {
      throw new Error('Unknown role: ' + body.role);
    }
    const merged = {
      ...previous,
      ...(body.name !== undefined ? { name: body.name } : {}),
      ...(body.email !== undefined ? { email: body.email } : {}),
      ...(body.role !== undefined ? { role: body.role } : {}),
    };
    db.users[index] = normalizeUser({ ...merged, permissions: rolePerms(merged.role, db.roles) }, db.roles);
    const changed = ['name', 'email', 'role'].filter(k => body[k] !== undefined && body[k] !== previous[k]);
    logActivity('edited', 'user', id, db.users[index].email || db.users[index].name, actor, { changed });
    saveDb();
    return db.users[index];
  }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string, @Body() body: any) {
    const actor = actorOf(body);
    const index = db.users.findIndex(u => u.id === parseInt(id));
    if (index === -1) {
      throw new Error('User not found');
    }
    const [deleted] = db.users.splice(index, 1);
    const tid = ++trashId;
    db.trash.push({
      id: tid,
      type: 'user',
      item: deleted,
      deletedAt: now(),
      deletedBy: actor,
    });
    logActivity('deleted', 'user', id, deleted.email || deleted.name, actor, { trashId: tid });
    saveDb();
    return deleted;
  }

  // ---------------- Roles ----------------
  @Get('roles')
  getRoles() {
    return {
      roles: db.roles.map(r => ({ ...r, userCount: db.users.filter(u => u.role === r.name).length })),
      users: db.users,
    };
  }

  @Post('roles')
  createRole(@Body() body: any) {
    const actor = actorOf(body);
    const name = (body.name || '').trim();
    if (!name) {
      throw new Error('Role name cannot be empty');
    }
    if (db.roles.some(r => r.name === name)) {
      throw new Error('Role already exists');
    }
    const role: Role = {
      id: Date.now(),
      name,
      permissions: Array.isArray(body.permissions) ? body.permissions : [],
      isSystem: false,
    };
    db.roles.push(role);
    logActivity('created', 'role', role.id, name, actor);
    saveDb();
    return role;
  }

  @Put('roles/:id')
  updateRole(@Param('id') id: string, @Body() body: any) {
    const actor = actorOf(body);
    const index = db.roles.findIndex(r => r.id === parseInt(id));
    if (index === -1) {
      throw new Error('Role not found');
    }
    const role = db.roles[index];
    const oldName = role.name;
    if (body.name !== undefined) {
      const newName = String(body.name).trim();
      if (!newName) {
        throw new Error('Role name cannot be empty');
      }
      if (newName !== role.name && db.roles.some(r => r.name === newName)) {
        throw new Error('Role already exists');
      }
      role.name = newName;
    }
    if (body.permissions !== undefined) {
      role.permissions = body.permissions;
    }
    db.roles[index] = role;
    // Keep users of this role in sync (both name and permissions)
    db.users.forEach(u => {
      if (u.role === oldName) {
        u.role = role.name;
        u.permissions = [...role.permissions];
      }
    });
    logActivity('edited', 'role', role.id, role.name, actor);
    saveDb();
    return role;
  }

  @Delete('roles/:id')
  deleteRole(@Param('id') id: string, @Body() body: any) {
    const actor = actorOf(body);
    const index = db.roles.findIndex(r => r.id === parseInt(id));
    if (index === -1) {
      throw new Error('Role not found');
    }
    const role = db.roles[index];
    if (role.isSystem) {
      throw new Error('System roles cannot be deleted');
    }
    const inUse = db.users.filter(u => u.role === role.name).length;
    if (inUse > 0) {
      throw new Error(`Cannot delete a role that ${inUse} user(s) have`);
    }
    const [deleted] = db.roles.splice(index, 1);
    logActivity('deleted', 'role', role.id, role.name, actor);
    saveDb();
    return deleted;
  }

  // ---------------- Settings ----------------
  @Get('settings')
  getSettings() {
    return db.settings;
  }

  @Put('settings')
  updateSettings(@Body() body: any) {
    const actor = actorOf(body);
    const previous = { ...db.settings };
    db.settings = {
      appName: (body.appName || '').trim() || previous.appName,
      appIcon: body.appIcon !== undefined ? String(body.appIcon).trim() : previous.appIcon,
    };
    logActivity('edited', 'settings', 'settings', db.settings.appName, actor, { from: previous.appName });
    saveDb();
    return db.settings;
  }

  // ---------------- Permissions ----------------
  @Get('permissions')
  getPermissions() {
    return {
      all: ALL_PERMISSIONS,
      roles: db.roles.map(r => ({ ...r, userCount: db.users.filter(u => u.role === r.name).length })),
    };
  }

  // ---------------- Bookmarks / Save events ----------------
  @Post('bookmarks')
  recordBookmark(@Body() body: any) {
    const event: BookmarkEvent = {
      id: ++bookmarkId,
      universityId: Number(body.universityId),
      universityName: body.universityName || 'Unknown',
      region: body.region || 'Unknown',
      action: body.action === 'unsave' ? 'unsave' : 'save',
      userEmail: body.userEmail,
      timestamp: now(),
    };
    db.bookmarks.push(event);
    if (db.bookmarks.length > 5000) db.bookmarks.splice(0, db.bookmarks.length - 5000);
    saveDb();
    return event;
  }

  // ---------------- Activity Log ----------------
  @Get('activity')
  getActivity() {
    return { log: db.activityLog, trash: db.trash };
  }

  // ---------------- Reports ----------------
  @Get('reports')
  getReports() {
    const perUni = new Map<number, number>();
    const perRegion = new Map<string, number>();
    db.bookmarks.forEach(b => {
      const delta = b.action === 'save' ? 1 : -1;
      perUni.set(b.universityId, (perUni.get(b.universityId) || 0) + delta);
      perRegion.set(b.region, (perRegion.get(b.region) || 0) + delta);
    });

    const uniNames = new Map(db.universities.map(u => [u.id, u.name]));
    const topSavedUniversities = Array.from(perUni.entries())
      .map(([id, count]) => ({ id, name: uniNames.get(id) || 'Unknown', count: Math.max(0, count) }))
      .filter(r => r.count > 0)
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const savesByRegion = Array.from(perRegion.entries())
      .map(([region, count]) => ({ region, count: Math.max(0, count) }))
      .filter(r => r.count > 0)
      .sort((a, b) => b.count - a.count);

    const regionCounts = new Map<string, number>();
    db.universities.forEach(u => {
      regionCounts.set(u.region, (regionCounts.get(u.region) || 0) + 1);
    });
    const universitiesByRegion = Array.from(regionCounts.entries())
      .map(([region, count]) => ({ region, count }))
      .sort((a, b) => b.count - a.count);

    const actionCounts = new Map<string, number>();
    db.activityLog.forEach(a => {
      actionCounts.set(a.action, (actionCounts.get(a.action) || 0) + 1);
    });
    const activityBreakdown = Array.from(actionCounts.entries())
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count);

    const programCount = db.universities.reduce((sum, u) => sum + (u.details?.courses?.length || 0), 0);

    return {
      totals: {
        universities: db.universities.length,
        regions: db.regions.length,
        users: db.users.length,
        admins: db.users.filter(u => u.role === 'admin').length,
        programs: programCount,
        trash: db.trash.length,
        bookmarks: db.bookmarks.filter(b => b.action === 'save').length,
        versions: Object.values(db.versions).reduce((s, v) => s + v.length, 0),
      },
      topSavedUniversities,
      savesByRegion,
      universitiesByRegion,
      activityBreakdown,
    };
  }

  // ---------------- Export / Import ----------------
  @Get('export')
  exportDb() {
    return {
      exportedAt: now(),
      app: db.settings.appName,
      data: db,
    };
  }

  @Post('import')
  importDb(@Body() body: any) {
    const actor = actorOf(body);
    const incoming = body.data || body;
    if (!incoming || typeof incoming !== 'object') {
      throw new Error('Invalid import data');
    }
    const incomingRoles: Role[] = (Array.isArray(incoming.roles) && incoming.roles.length ? incoming.roles : clone(seedDb.roles)).map((r: any) => ({
      id: r.id ?? Date.now(),
      name: r.name || 'role',
      permissions: Array.isArray(r.permissions) ? r.permissions : [],
      isSystem: !!r.isSystem,
    }));
    db = {
      universities: (Array.isArray(incoming.universities) ? incoming.universities : []).map(enrichUniversity),
      regions: Array.isArray(incoming.regions) ? incoming.regions : [],
      users: (Array.isArray(incoming.users) ? incoming.users : []).map(u => normalizeUser(u, incomingRoles)),
      roles: incomingRoles,
      settings: { ...seedDb.settings, ...(incoming.settings || {}) },
      activityLog: Array.isArray(incoming.activityLog) ? incoming.activityLog : [],
      versions: incoming.versions && typeof incoming.versions === 'object' ? incoming.versions : {},
      trash: Array.isArray(incoming.trash) ? incoming.trash : [],
      bookmarks: Array.isArray(incoming.bookmarks) ? incoming.bookmarks : [],
    };
    logActivity('imported', 'settings', 'db', 'Database import', actor, {
      universities: db.universities.length,
      regions: db.regions.length,
      users: db.users.length,
    });
    saveDb();
    return {
      ok: true,
      totals: {
        universities: db.universities.length,
        regions: db.regions.length,
        users: db.users.length,
      },
    };
  }
}
