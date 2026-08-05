'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  ChevronDown,
  ChevronUp,
  Trophy,
  ThumbsUp,
  ThumbsDown,
  GraduationCap,
  Calendar,
  Wallet,
  Plane,
  Scale,
  Check,
  BookOpen,
} from 'lucide-react';

const universityData: Record<string, any> = {
  'harvard-university': {
    name: 'Harvard University',
    location: 'Cambridge, USA',
    description: 'Ivy League research university',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800',
    details: [
      'Founded in 1636, Harvard is the oldest institution of higher learning in the United States',
      'Located in Cambridge, Massachusetts',
      'Part of the prestigious Ivy League',
      'Known for its law, business, and medical schools',
      'Endowment of over $50 billion',
      'Notable alumni include 8 U.S. Presidents and numerous Nobel laureates'
    ],
    courses: ['Computer Science', 'Economics', 'Political Science', 'Psychology', 'Biology', 'History', 'English Literature', 'Mathematics'],
    requirements: [
      'High school diploma or equivalent',
      'SAT/ACT scores',
      'Letters of recommendation',
      'Personal statement',
      'Extracurricular activities',
      'English proficiency for international students'
    ],
    prices: { undergraduate: '$57,261 per year', graduate: '$52,000 - $58,000 per year' },
    undergraduate: ['Bachelor of Arts (BA)', 'Bachelor of Science (BS)', '4-year program', 'Liberal arts curriculum', 'Concentration in major field'],
    graduate: ['Master of Arts (MA)', 'Master of Science (MS)', 'Doctor of Philosophy (PhD)', 'Professional degrees (JD, MD, MBA)', 'Research-focused programs']
  },
  'mit': {
    name: 'MIT',
    location: 'Cambridge, USA',
    description: 'Leading technology and engineering school',
    image: 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=800',
    details: ['Founded in 1861', 'Located in Cambridge, Massachusetts', 'World-renowned for engineering, computer science, and physical sciences', 'Strong emphasis on innovation and entrepreneurship', 'Notable for developing key technologies like the internet and GPS', '96 Nobel laureates associated with the institute'],
    courses: ['Computer Science', 'Electrical Engineering', 'Mechanical Engineering', 'Physics', 'Mathematics', 'Chemistry', 'Biology', 'Architecture'],
    requirements: ['High school diploma with strong STEM focus', 'SAT/ACT scores (high math and science)', 'Letters of recommendation from math/science teachers', 'Personal statement', 'Research experience or projects', 'English proficiency for international students'],
    prices: { undergraduate: '$57,986 per year', graduate: '$57,590 per year' },
    undergraduate: ['Bachelor of Science (BS)', '4-year program', 'STEM-focused curriculum', 'Hands-on research opportunities', 'Interdisciplinary approach'],
    graduate: ['Master of Science (MS)', 'Doctor of Philosophy (PhD)', 'Professional degrees', 'Research-intensive programs', 'Industry partnerships']
  },
  'stanford-university': {
    name: 'Stanford University',
    location: 'Stanford, USA',
    description: 'Silicon Valley research university',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800',
    details: ['Founded in 1885 by Leland Stanford', 'Located in Stanford, California', 'Known for its entrepreneurial spirit and Silicon Valley connections', 'Strong programs in engineering, business, and computer science', 'One of the largest campuses in the United States', 'Birthplace of companies like Google, Yahoo, and Netflix'],
    courses: ['Computer Science', 'Business', 'Engineering', 'Medicine', 'Law', 'Humanities', 'Social Sciences', 'Earth Sciences'],
    requirements: ['High school diploma', 'SAT/ACT scores', 'Letters of recommendation', 'Personal essays', 'Extracurricular involvement', 'English proficiency for international students'],
    prices: { undergraduate: '$56,169 per year', graduate: '$54,000 - $60,000 per year' },
    undergraduate: ['Bachelor of Arts (BA)', 'Bachelor of Science (BS)', '4-year program', 'Flexible curriculum', 'Major and minor options'],
    graduate: ['Master of Arts (MA)', 'Master of Science (MS)', 'Doctor of Philosophy (PhD)', 'Professional degrees (JD, MD, MBA)', 'Interdisciplinary programs']
  },
  'yale-university': {
    name: 'Yale University',
    location: 'New Haven, USA',
    description: 'Ivy League liberal arts college',
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800',
    details: ['Founded in 1701', 'Located in New Haven, Connecticut', 'Third-oldest institution of higher education in the United States', 'Known for its strong liberal arts and law programs', 'Home to the prestigious Yale Law School', 'Notable alumni include 5 U.S. Presidents and numerous Supreme Court Justices'],
    courses: ['Political Science', 'Economics', 'History', 'English', 'Psychology', 'Biology', 'International Relations', 'Art History'],
    requirements: ['High school diploma', 'SAT/ACT scores', 'Letters of recommendation', 'Personal statement', 'Extracurricular activities', 'English proficiency for international students'],
    prices: { undergraduate: '$59,950 per year', graduate: '$45,000 - $58,000 per year' },
    undergraduate: ['Bachelor of Arts (BA)', 'Bachelor of Science (BS)', '4-year program', 'Liberal arts focus', 'Residential college system'],
    graduate: ['Master of Arts (MA)', 'Master of Science (MS)', 'Doctor of Philosophy (PhD)', 'Professional degrees (JD, MD, MBA, MFA)', 'Specialized programs']
  },
  'university-of-oxford': {
    name: 'University of Oxford',
    location: 'Oxford, UK',
    description: 'Oldest English-speaking university',
    image: 'https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?w=800',
    details: ['Founded in 1096, making it the oldest university in the English-speaking world', 'Located in Oxford, England', 'Collegiate system with 38 constituent colleges', 'World-renowned for humanities, sciences, and medicine', 'Notable alumni include 28 British Prime Ministers', 'Consistently ranked among the top universities globally'],
    courses: ['Philosophy, Politics and Economics (PPE)', 'Medicine', 'Law', 'Engineering', 'Mathematics', 'History', 'English Literature', 'Computer Science'],
    requirements: ['A-levels or equivalent', 'Admissions test', 'Interview', 'Personal statement', 'Academic references', 'English proficiency for international students'],
    prices: { undergraduate: '£9,250 per year (UK), £26,000-£38,000 (international)', graduate: '£10,000-£30,000 per year' },
    undergraduate: ['Bachelor of Arts (BA)', '3-4 year program', 'Tutorial system', 'College-based learning', 'Specialized focus'],
    graduate: ['Master of Philosophy (MPhil)', 'Doctor of Philosophy (DPhil)', 'Master of Science (MSc)', 'Professional degrees', 'Research programs']
  },
  'university-of-cambridge': {
    name: 'University of Cambridge',
    location: 'Cambridge, UK',
    description: 'Historic research university',
    image: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=800',
    details: ['Founded in 1209', 'Located in Cambridge, England', 'Collegiate system with 31 constituent colleges', 'Strong emphasis on research and innovation', 'Notable for discoveries in physics, mathematics, and biology', '120 Nobel laureates associated with the university'],
    courses: ['Natural Sciences', 'Engineering', 'Mathematics', 'Medicine', 'Computer Science', 'Law', 'Economics', 'History'],
    requirements: ['A-levels or equivalent', 'Admissions assessment', 'Interview', 'Personal statement', 'Academic references', 'English proficiency for international students'],
    prices: { undergraduate: '£9,250 per year (UK), £22,000-£58,000 (international)', graduate: '£11,000-£35,000 per year' },
    undergraduate: ['Bachelor of Arts (BA)', '3-4 year program', 'Supervision system', 'College-based education', 'Flexible Part II options'],
    graduate: ['Master of Philosophy (MPhil)', 'Doctor of Philosophy (PhD)', 'Master of Science (MSc)', 'Professional degrees', 'Research-focused']
  },
  'eth-zurich': {
    name: 'ETH Zurich',
    location: 'Zurich, Switzerland',
    description: 'Leading technical university',
    image: 'https://images.unsplash.com/photo-1568212958211-76b6db5c895e?w=800',
    details: ['Founded in 1855', 'Located in Zurich, Switzerland', 'Consistently ranked among the top technical universities worldwide', 'Strong programs in engineering, natural sciences, and architecture', '21 Nobel laureates associated with the university', 'Known for its cutting-edge research facilities'],
    courses: ['Mechanical Engineering', 'Computer Science', 'Electrical Engineering', 'Architecture', 'Physics', 'Mathematics', 'Chemistry', 'Environmental Sciences'],
    requirements: ['High school diploma with strong math/science', 'University entrance qualification', 'Letters of recommendation', 'Personal statement', 'Math/science entrance exam', 'English proficiency'],
    prices: { undergraduate: 'CHF 1,300 per semester', graduate: 'CHF 1,300 per semester' },
    undergraduate: ['Bachelor of Science (BSc)', '3-year program', 'German or English instruction', 'Strong technical focus', 'Foundation year available'],
    graduate: ['Master of Science (MSc)', 'Doctor of Sciences (Dr. sc.)', "Specialized master's programs", 'Research-oriented', 'English-taught programs']
  },
  'imperial-college-london': {
    name: 'Imperial College London',
    location: 'London, UK',
    description: 'Science-based institution',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800',
    details: ['Founded in 1907', 'Located in London, England', 'Specialized in science, engineering, medicine, and business', 'Part of the prestigious Russell Group', 'Known for its research output and industry connections', '14 Nobel laureates associated with the college'],
    courses: ['Engineering', 'Medicine', 'Computer Science', 'Physics', 'Mathematics', 'Chemistry', 'Business School', 'Life Sciences'],
    requirements: ['A-levels or equivalent', 'Admissions test for some courses', 'Personal statement', 'Academic references', 'Interview for some courses', 'English proficiency'],
    prices: { undergraduate: '£9,250 per year (UK), £35,000-£47,000 (international)', graduate: '£15,000-£40,000 per year' },
    undergraduate: ['Master of Engineering (MEng)', 'Bachelor of Science (BSc)', 'MBBS for Medicine', '4-year programs', "Integrated master's options"],
    graduate: ['Master of Science (MSc)', 'Master of Research (MRes)', 'Doctor of Philosophy (PhD)', 'MBA', 'Specialized programs']
  },
  'national-university-of-singapore': {
    name: 'National University of Singapore',
    location: 'Singapore',
    description: 'Leading Asian university',
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800',
    details: ['Founded in 1905', 'Located in Singapore', 'Consistently ranked as the top university in Asia', 'Strong programs in engineering, business, and medicine', 'Known for its research excellence and international outlook', 'Comprehensive university with 17 faculties'],
    courses: ['Engineering', 'Business', 'Medicine', 'Law', 'Computer Science', 'Arts and Social Sciences', 'Science', 'Design and Architecture'],
    requirements: ['High school diploma', 'SAT/ACT or national exams', 'Personal statement', 'Letters of recommendation', 'Extracurricular achievements', 'English proficiency'],
    prices: { undergraduate: 'SGD 8,200-53,000 per year', graduate: 'SGD 18,000-45,000 per year' },
    undergraduate: ['Bachelor of Arts (BA)', 'Bachelor of Science (BSc)', 'Bachelor of Engineering (BEng)', '3-4 year programs', 'Honors options available'],
    graduate: ['Master of Arts (MA)', 'Master of Science (MSc)', 'Doctor of Philosophy (PhD)', 'MBA', "Specialized master's"]
  },
  'tsinghua-university': {
    name: 'Tsinghua University',
    location: 'Beijing, China',
    description: 'Leading Chinese university',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=800',
    details: ['Founded in 1911', 'Located in Beijing, China', 'Often called the "MIT of China"', 'Strong programs in engineering and computer science', 'Known for producing many of China\u2019s political and business leaders', 'Part of the C9 League of elite Chinese universities'],
    courses: ['Computer Science', 'Engineering', 'Physics', 'Mathematics', 'Architecture', 'Economics', 'Management', 'Public Policy'],
    requirements: ['Gaokao (National College Entrance Exam)', 'High academic scores', 'Interview for some programs', 'Physical fitness test', 'Political assessment', 'Chinese language proficiency'],
    prices: { undergraduate: '\u00a55,000 per year', graduate: '\u00a58,000-30,000 per year' },
    undergraduate: ['Bachelor of Engineering (BEng)', 'Bachelor of Science (BSc)', '4-year program', 'Chinese language instruction', 'Specialized tracks'],
    graduate: ['Master of Engineering (MEng)', 'Master of Science (MSc)', 'Doctor of Philosophy (PhD)', 'Professional degrees', 'Research programs']
  },
  'university-of-tokyo': {
    name: 'University of Tokyo',
    location: 'Tokyo, Japan',
    description: 'Japan\u2019s top university',
    image: 'https://images.unsplash.com/photo-1574958269340-fa927503f3dd?w=800',
    details: ['Founded in 1877', 'Located in Tokyo, Japan', 'Japan\u2019s most prestigious university', 'Strong programs in sciences, humanities, and engineering', 'Known for its research contributions', 'Notable alumni include numerous Nobel laureates and Prime Ministers'],
    courses: ['Engineering', 'Science', 'Medicine', 'Law', 'Economics', 'Arts', 'Agriculture', 'Pharmaceutical Sciences'],
    requirements: ['National Center Test for University Admissions', 'University-specific entrance exams', 'Interview', 'High school diploma', 'Recommendation letters', 'Japanese language proficiency'],
    prices: { undergraduate: '\u00a5535,800 per year', graduate: '\u00a5535,800-\u00a51,000,000 per year' },
    undergraduate: ['Bachelor of Arts (BA)', 'Bachelor of Science (BSc)', 'Bachelor of Engineering (BEng)', '4-year program', 'Japanese instruction'],
    graduate: ['Master of Arts (MA)', 'Master of Science (MSc)', 'Doctor of Philosophy (PhD)', 'Professional degrees', 'Research-focused']
  },
  'peking-university': {
    name: 'Peking University',
    location: 'Beijing, China',
    description: 'Historic Chinese university',
    image: 'https://images.unsplash.com/photo-1564981797816-1043664bf78d?w=800',
    details: ['Founded in 1898', 'Located in Beijing, China', 'First modern national university in China', 'Strong programs in humanities, social sciences, and natural sciences', 'Known for its role in China\u2019s intellectual history', 'Part of the C9 League of elite Chinese universities'],
    courses: ['Chinese Literature', 'History', 'Philosophy', 'Economics', 'Law', 'Mathematics', 'Physics', 'Chemistry'],
    requirements: ['Gaokao (National College Entrance Exam)', 'Top-tier scores required', 'Interview for humanities', 'High school diploma', 'Political assessment', 'Chinese language proficiency'],
    prices: { undergraduate: '\u00a55,000 per year', graduate: '\u00a58,000-30,000 per year' },
    undergraduate: ['Bachelor of Arts (BA)', 'Bachelor of Science (BSc)', '4-year program', 'Chinese instruction', 'Liberal arts emphasis'],
    graduate: ['Master of Arts (MA)', 'Master of Science (MSc)', 'Doctor of Philosophy (PhD)', 'Professional degrees', 'Research programs']
  },
  'australian-national-university': {
    name: 'Australian National University',
    location: 'Canberra, Australia',
    description: 'National research university',
    image: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800',
    details: ['Founded in 1946', 'Located in Canberra, Australia', 'Australia\u2019s only national university', 'Known for its research intensity and academic excellence', 'Strong programs in Asia-Pacific studies, law, and sciences', 'Consistently ranked among the top universities in Australia'],
    courses: ['Asia-Pacific Studies', 'Law', 'Medicine', 'Science', 'Engineering', 'Arts', 'Business', 'Computer Science'],
    requirements: ['High school diploma (ATAR)', 'English proficiency (IELTS/TOEFL)', 'Personal statement', 'Letters of recommendation', 'Some courses require portfolios', 'Interview for some programs'],
    prices: { undergraduate: 'AUD 34,000-48,000 per year', graduate: 'AUD 36,000-50,000 per year' },
    undergraduate: ['Bachelor of Arts (BA)', 'Bachelor of Science (BSc)', 'Bachelor of Laws (LLB)', '3-4 year program', 'Flexible degree structure'],
    graduate: ['Master of Arts (MA)', 'Master of Science (MSc)', 'Doctor of Philosophy (PhD)', 'Juris Doctor (JD)', 'Specialized programs']
  },
  'university-of-melbourne': {
    name: 'University of Melbourne',
    location: 'Melbourne, Australia',
    description: 'Australia\u2019s top university',
    image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800',
    details: ['Founded in 1853', 'Located in Melbourne, Australia', 'Second-oldest university in Australia', 'Known for its research excellence and teaching quality', 'Strong programs in medicine, law, and arts', 'Consistently ranked among the top universities globally'],
    courses: ['Medicine', 'Law', 'Arts', 'Science', 'Engineering', 'Business', 'Music', 'Design'],
    requirements: ['High school diploma (ATAR)', 'English proficiency', 'Personal statement', 'Letters of recommendation', 'Interview for some courses', 'Portfolio for creative programs'],
    prices: { undergraduate: 'AUD 30,000-45,000 per year', graduate: 'AUD 35,000-50,000 per year' },
    undergraduate: ['Bachelor of Arts (BA)', 'Bachelor of Science (BSc)', 'Bachelor of Design (BDes)', '3-year program', 'Melbourne Model curriculum'],
    graduate: ['Master of Arts (MA)', 'Master of Science (MSc)', 'Doctor of Philosophy (PhD)', 'Professional degrees', 'Research programs']
  },
  'university-of-sydney': {
    name: 'University of Sydney',
    location: 'Sydney, Australia',
    description: 'Leading Australian university',
    image: 'https://images.unsplash.com/photo-1580537659466-0a9bfa916a54?w=800',
    details: ['Founded in 1850', 'Located in Sydney, Australia', 'Oldest university in Australia', 'Known for its beautiful campus and strong research programs', 'Strong programs in medicine, law, and business', 'Notable alumni include multiple Prime Ministers and Nobel laureates'],
    courses: ['Medicine', 'Law', 'Business', 'Arts', 'Science', 'Engineering', 'Architecture', 'Music'],
    requirements: ['High school diploma (ATAR)', 'English proficiency', 'Personal statement', 'Letters of recommendation', 'Interview for some courses', 'Portfolio for design programs'],
    prices: { undergraduate: 'AUD 32,000-48,000 per year', graduate: 'AUD 38,000-55,000 per year' },
    undergraduate: ['Bachelor of Arts (BA)', 'Bachelor of Science (BSc)', 'Bachelor of Laws (LLB)', '4-year program', 'Double degree options'],
    graduate: ['Master of Arts (MA)', 'Master of Science (MSc)', 'Doctor of Philosophy (PhD)', 'MBA', 'Professional degrees']
  },
  'university-of-são-paulo': {
    name: 'University of São Paulo',
    location: 'São Paulo, Brazil',
    description: 'Brazil\u2019s largest university',
    image: 'https://images.unsplash.com/photo-1592280771190-3e2e4d571952?w=800',
    details: ['Founded in 1934', 'Located in São Paulo, Brazil', 'Largest university in Brazil', 'Known for its research output and academic excellence', 'Strong programs in law, medicine, and engineering', 'Produces many of Brazil\u2019s political and business leaders'],
    courses: ['Law', 'Medicine', 'Engineering', 'Economics', 'Architecture', 'Pharmacy', 'Journalism', 'Arts'],
    requirements: ['High school diploma', 'ENEM exam', 'Vestibular entrance exam', 'Interview for some programs', 'Portuguese proficiency', 'Portfolio for arts programs'],
    prices: { undergraduate: 'Free (public university)', graduate: 'Free (public university)' },
    undergraduate: ['Bachelor of Laws (LLB)', 'Bachelor of Medicine (MBBS)', 'Bachelor of Engineering (BEng)', '4-5 year program', 'Portuguese instruction'],
    graduate: ['Master of Arts (MA)', 'Master of Science (MSc)', 'Doctor of Philosophy (PhD)', 'Professional degrees', 'Research programs']
  },
  'university-of-buenos-aires': {
    name: 'University of Buenos Aires',
    location: 'Buenos Aires, Argentina',
    description: 'Argentina\u2019s top university',
    image: 'https://images.unsplash.com/photo-1568212958211-76b6db5c895e?w=800',
    details: ['Founded in 1821', 'Located in Buenos Aires, Argentina', 'Largest and most prestigious university in Argentina', 'Known for its strong humanities and social sciences programs', 'Notable alumni include 5 Nobel laureates and numerous Presidents', 'Important center of intellectual and political life in Argentina'],
    courses: ['Law', 'Medicine', 'Economics', 'Architecture', 'Engineering', 'Philosophy', 'Literature', 'Social Sciences'],
    requirements: ['High school diploma', 'CBC (Common Basic Cycle)', 'Entrance exam for some programs', 'Interview', 'Spanish proficiency', 'Portfolio for arts'],
    prices: { undergraduate: 'Free (public university)', graduate: 'Free (public university)' },
    undergraduate: ['Bachelor of Laws (LLB)', 'Bachelor of Medicine (MBBS)', 'Bachelor of Economics', '4-6 year program', 'Spanish instruction'],
    graduate: ['Master of Arts (MA)', 'Master of Science (MSc)', 'Doctor of Philosophy (PhD)', 'Specialized programs', 'Research degrees']
  },
  'university-of-cape-town': {
    name: 'University of Cape Town',
    location: 'Cape Town, South Africa',
    description: 'Africa\u2019s leading university',
    image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800',
    details: ['Founded in 1829', 'Located in Cape Town, South Africa', 'Oldest university in South Africa', 'Known for its research excellence and social impact', 'Strong programs in medicine, law, and sciences', 'Notable alumni include 5 Nobel laureates'],
    courses: ['Medicine', 'Law', 'Commerce', 'Science', 'Engineering', 'Humanities', 'Health Sciences', 'African Studies'],
    requirements: ['National Senior Certificate', 'APS score requirements', 'English proficiency', 'Mathematics for science programs', 'Personal statement', 'Interview for some programs'],
    prices: { undergraduate: 'ZAR 50,000-80,000 per year', graduate: 'ZAR 60,000-100,000 per year' },
    undergraduate: ['Bachelor of Arts (BA)', 'Bachelor of Science (BSc)', 'Bachelor of Commerce (BCom)', '3-4 year program', 'Major/minor system'],
    graduate: ['Master of Arts (MA)', 'Master of Science (MSc)', 'Doctor of Philosophy (PhD)', 'Professional degrees', 'Research programs']
  },
  'stellenbosch-university': {
    name: 'Stellenbosch University',
    location: 'Stellenbosch, South Africa',
    description: 'Top South African university',
    image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800',
    details: ['Founded in 1918', 'Located in Stellenbosch, South Africa', 'Known for its research excellence and beautiful campus', 'Strong programs in agriculture, sciences, and humanities', 'Important center of Afrikaans language and culture', 'Consistently ranked among the top universities in Africa'],
    courses: ['Agriculture', 'Science', 'Engineering', 'Arts', 'Commerce', 'Law', 'Medicine', 'Theology'],
    requirements: ['National Senior Certificate', 'APS score requirements', 'English or Afrikaans proficiency', 'Mathematics for science programs', 'Personal statement', 'Interview for some programs'],
    prices: { undergraduate: 'ZAR 45,000-75,000 per year', graduate: 'ZAR 55,000-95,000 per year' },
    undergraduate: ['Bachelor of Arts (BA)', 'Bachelor of Science (BSc)', 'Bachelor of Commerce (BCom)', '3-4 year program', 'Bilingual instruction'],
    graduate: ['Master of Arts (MA)', 'Master of Science (MSc)', 'Doctor of Philosophy (PhD)', 'Professional degrees', 'Research programs']
  }
};

// Deterministic client-side defaults for entries not present in the backend
function makeExtras(id: number, courseNames: string[]) {
  const programs: Record<string, number> = {};
  courseNames.slice(0, 4).forEach((name, i) => {
    programs[name] = ((i * 13 + id) % 55) + 1;
  });
  const prosPool = [
    'World-class reputation and faculty',
    'Strong research output and funding',
    'Excellent global alumni network',
    'Prime location with great campus life',
    'Diverse, international community',
    'Generous scholarship opportunities',
  ];
  const consPool = [
    'High tuition and living costs',
    'Highly competitive admissions',
    'Large class sizes in popular programs',
    'Limited on-campus housing',
    'Heavy workload and academic pressure',
    'Expensive city to live in',
  ];
  return {
    rankings: { overall: (id % 48) + 3, programs },
    pros: [prosPool[id % prosPool.length], prosPool[(id + 2) % prosPool.length], prosPool[(id + 4) % prosPool.length]],
    cons: [consPool[(id + 1) % consPool.length], consPool[(id + 3) % consPool.length], consPool[(id + 5) % consPool.length]],
    scholarships: [
      { name: 'Merit Scholarship', amount: '$10,000 / year', eligibility: 'Top 10% academic performance' },
      { name: 'International Excellence Award', amount: 'Up to 50% tuition', eligibility: 'International students with strong grades' },
    ],
    applicationDeadlines: [
      { window: 'Fall 2027', deadline: '2027-01-05' },
      { window: 'Fall 2026', deadline: '2026-11-15' },
      { window: 'Spring 2027', deadline: '2026-08-01' },
    ],
    costOfLiving: { currency: 'USD', monthly: '$1,200 – $2,400' },
    visa: {
      processTime: '4–8 weeks',
      requirements: ['Valid passport (6+ months)', 'Letter of admission', 'Proof of financial support', 'Visa application form and fee'],
    },
  };
}

const slugify = (name: string) => name.toLowerCase().replace(/\s+/g, '-');

function normalizeUni(u: any): any {
  const live = !!(u.details && !Array.isArray(u.details));
  const id = u.id || 0;
  const courses: { name: string; details: string }[] = live
    ? (u.details.courses || []).map((c: any) => ({ name: c.name || '', details: c.details || '' }))
    : (u.courses || []).map((c: any) => (typeof c === 'string' ? { name: c, details: '' } : { name: c.name, details: c.details || '' }));

  const extras = u.rankings
    ? { rankings: u.rankings, pros: u.pros || [], cons: u.cons || [], scholarships: u.scholarships || [], applicationDeadlines: u.applicationDeadlines || [], costOfLiving: u.costOfLiving || {}, visa: u.visa || {} }
    : makeExtras(id, courses.map((c) => c.name));

  const undergrad = Array.isArray(u.undergraduate)
    ? u.undergraduate
    : [
        ...courses.slice(0, 3).map((c) => (c.name ? `Bachelor\u2019s program in ${c.name}` : "Bachelor's programs")),
        '4-year full-time study',
      ];
  const graduate = Array.isArray(u.graduate)
    ? u.graduate
    : ["Master's degree programs", 'Doctoral (PhD) programs', 'Research opportunities'];

  return {
    id,
    name: u.name || 'University',
    location: u.location || '',
    region: u.region || '',
    description: u.description || '',
    image: u.image || '',
    overview: live ? u.details.overview || '' : '',
    details: live ? u.details.details || [] : u.details || [],
    courses,
    requirements: live ? u.details.requirements || [] : u.requirements || [],
    prices: live ? u.details.prices || {} : u.prices || {},
    undergraduate: undergrad,
    graduate,
    ...extras,
  };
}

const sections: { id: string; labelKey: string; icon: any }[] = [
  { id: 'overview', labelKey: 'overview', icon: GraduationCap },
  { id: 'details', labelKey: 'details', icon: Check },
  { id: 'rankings', labelKey: 'rankings', icon: Trophy },
  { id: 'proscons', labelKey: 'prosCons', icon: ThumbsUp },
  { id: 'scholarships', labelKey: 'scholarships', icon: Wallet },
  { id: 'deadlines', labelKey: 'deadlines', icon: Calendar },
  { id: 'courses', labelKey: 'courses', icon: BookOpen },
  { id: 'requirements', labelKey: 'requirements', icon: Check },
  { id: 'prices', labelKey: 'prices', icon: Wallet },
  { id: 'costvisa', labelKey: 'costOfLiving', icon: Plane },
  { id: 'undergraduate', labelKey: 'undergraduate', icon: GraduationCap },
  { id: 'graduate', labelKey: 'graduate', icon: GraduationCap },
];

export default function UniversityPage() {
  const params = useParams();
  const universityName = params.name as string;
  const { t, lang } = useLanguage();
  const [university, setUniversity] = useState<any>(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [inCompare, setInCompare] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch('/api/admin/universities')
      .then((r) => (r.ok ? r.json() : []))
      .then((list: any[]) => {
        const live = list.find((u) => slugify(u.name) === universityName);
        const raw = live || universityData[universityName];
        setUniversity(raw ? normalizeUni(raw) : null);
      })
      .catch(() => {
        setUniversity(universityData[universityName] ? normalizeUni(universityData[universityName]) : null);
      })
      .finally(() => setLoading(false));
  }, [universityName]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('compareList');
      if (stored && university) {
        setInCompare(JSON.parse(stored).includes(university.id));
      }
    } catch {}
  }, [university]);

  const toggleCompare = () => {
    if (!university) return;
    let list: number[] = [];
    try {
      const stored = localStorage.getItem('compareList');
      if (stored) list = JSON.parse(stored);
    } catch {}
    if (list.includes(university.id)) {
      list = list.filter((id) => id !== university.id);
    } else {
      list = [...list, university.id].slice(-4);
    }
    localStorage.setItem('compareList', JSON.stringify(list));
    setInCompare(list.includes(university.id));
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const toggleCourse = (course: string) => {
    setExpandedCourse(expandedCourse === course ? null : course);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E8E8F0] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-10 h-10 border-4 border-[#9370DB] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-slate-600">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (!university) {
    return (
      <div className="min-h-screen bg-[#E8E8F0] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">{t('universityNotFound')}</h1>
          <Link href="/explore" className="text-[#9370DB] hover:underline">
            {t('backToExplore')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E8E8F0]">
      <Navbar currentPage="university" />

      <section className="pt-16">
        <div className="flex gap-0 h-[calc(100vh-4rem)]">
          {/* Left side - Sidebar Navigation */}
          <div className="w-64 bg-[#C8C8E0] p-4 h-full overflow-y-auto shrink-0">
            <div className="space-y-2">
              {sections.map(({ id, labelKey, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => scrollToSection(id)}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    activeSection === id
                      ? 'bg-[#9370DB] text-white'
                      : 'bg-[#E8E8F0] text-slate-800 hover:bg-[#D8D8E8]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {t(labelKey)}
                </button>
              ))}
            </div>
          </div>

          {/* Right side - Content */}
          <div className="flex-1 overflow-y-auto p-8">
            <div id="overview" className="mb-12 scroll-mt-4">
              <img
                src={university.image}
                alt={university.name}
                className="w-full h-96 object-cover rounded-lg mb-6"
              />
              <div className="bg-[#C8C8E0] border border-[#A8A8C8] rounded-lg p-8">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                  <h1 className="text-5xl font-bold text-slate-900 font-serif">{university.name}</h1>
                  {university.rankings?.overall && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#9370DB] text-white rounded-full text-sm font-semibold">
                      <Trophy className="w-4 h-4" />
                      {t('worldRank')} #{university.rankings.overall}
                    </span>
                  )}
                </div>
                <p className="text-2xl text-slate-800 mb-4 font-light">{university.location}</p>
                <p className="text-xl text-slate-800 font-light">{university.description}</p>
                {university.overview && (
                  <p className="text-slate-800 mt-4">{university.overview}</p>
                )}
                <div className="flex flex-wrap gap-3 mt-6">
                  <button
                    onClick={toggleCompare}
                    className={`inline-flex items-center gap-2 px-6 py-3 rounded font-medium transition-colors ${
                      inCompare
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                        : 'bg-white text-[#9370DB] border border-[#9370DB] hover:bg-[#9370DB]/10'
                    }`}
                  >
                    <Scale className="w-4 h-4" />
                    {inCompare ? t('addedToCompare') : t('addToCompare')}
                  </button>
                  {inCompare && (
                    <Link
                      href="/compare"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#9370DB] border border-[#9370DB] rounded font-medium hover:bg-[#9370DB]/10 transition-colors"
                    >
                      {t('seeInCompare')}
                    </Link>
                  )}
                  <button className="inline-flex items-center gap-2 px-6 py-3 bg-[#9370DB] text-white rounded font-medium hover:bg-[#7B68EE] transition-colors">
                    {t('applyNow')}
                  </button>
                </div>
              </div>
            </div>

            <div id="details" className="mb-12 scroll-mt-4">
              <div className="bg-[#C8C8E0] border border-[#A8A8C8] rounded-lg p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('details')}</h2>
                <ul className="space-y-3">
                  {university.details.map((detail: string, index: number) => (
                    <li key={index} className="text-slate-800 flex items-start">
                      <span className="text-[#9370DB] mr-2">•</span>
                      {detail}
                    </li>
                  ))}
                  {university.details.length === 0 && <li className="text-slate-500">—</li>}
                </ul>
              </div>
            </div>

            <div id="rankings" className="mb-12 scroll-mt-4">
              <div className="bg-[#C8C8E0] border border-[#A8A8C8] rounded-lg p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-[#9370DB]" />
                  {t('rankings')}
                </h2>
                <div className="mb-5">
                  <div className="inline-flex flex-col items-center px-8 py-6 bg-[#E8E8F0] border border-[#A8A8C8] rounded-xl">
                    <span className="text-xs uppercase tracking-wider text-slate-500 mb-1">{t('worldRank')}</span>
                    <span className="text-4xl font-bold text-[#9370DB]">#{university.rankings?.overall || '—'}</span>
                    <span className="text-xs text-slate-500 mt-1">UniVerse 2027</span>
                  </div>
                </div>
                <h3 className="font-semibold text-slate-900 mb-3">{t('programRankings')}</h3>
                <div className="space-y-2">
                  {Object.entries(university.rankings?.programs || {}).map(([program, rank]) => (
                    <div key={program} className="flex items-center justify-between bg-[#E8E8F0] border border-[#A8A8C8] rounded-lg px-4 py-2.5">
                      <span className="text-slate-800">{program}</span>
                      <span className="px-2.5 py-1 bg-[#9370DB]/10 text-[#9370DB] rounded-full text-sm font-semibold">
                        #{rank} {lang === 'zh' ? '名' : ''}
                      </span>
                    </div>
                  ))}
                  {Object.keys(university.rankings?.programs || {}).length === 0 && (
                    <p className="text-slate-500">—</p>
                  )}
                </div>
              </div>
            </div>

            <div id="proscons" className="mb-12 scroll-mt-4">
              <div className="bg-[#C8C8E0] border border-[#A8A8C8] rounded-lg p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-5 flex items-center gap-2">
                  <ThumbsUp className="w-6 h-6 text-emerald-500" />
                  {t('prosCons')}
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-emerald-600 mb-3 flex items-center gap-1.5">
                      <ThumbsUp className="w-4 h-4" /> {t('pros')}
                    </h3>
                    <ul className="space-y-2">
                      {university.pros.map((p: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2.5 text-slate-800 text-sm">
                          <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shrink-0">+</span>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-red-500 mb-3 flex items-center gap-1.5">
                      <ThumbsDown className="w-4 h-4" /> {t('cons')}
                    </h3>
                    <ul className="space-y-2">
                      {university.cons.map((c: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-slate-800 text-sm">
                          <span className="w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold shrink-0">−</span>
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div id="scholarships" className="mb-12 scroll-mt-4">
              <div className="bg-[#C8C8E0] border border-[#A8A8C8] rounded-lg p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-5 flex items-center gap-2">
                  <Wallet className="w-6 h-6 text-amber-500" />
                  {t('scholarships')}
                </h2>
                <div className="space-y-3">
                  {university.scholarships.map((s: any, i: number) => (
                    <div key={i} className="bg-[#E8E8F0] border border-[#A8A8C8] rounded-lg p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                        <h3 className="font-semibold text-slate-900">{s.name}</h3>
                        <span className="px-2.5 py-1 bg-amber-500/10 text-amber-600 rounded-full text-xs font-semibold">{s.amount}</span>
                      </div>
                      <p className="text-sm text-slate-600">{s.eligibility}</p>
                    </div>
                  ))}
                  {university.scholarships.length === 0 && <p className="text-slate-500">—</p>}
                </div>
              </div>
            </div>

            <div id="deadlines" className="mb-12 scroll-mt-4">
              <div className="bg-[#C8C8E0] border border-[#A8A8C8] rounded-lg p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-5 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-[#9370DB]" />
                  {t('deadlines')}
                </h2>
                <div className="space-y-2">
                  {university.applicationDeadlines.map((d: any, i: number) => (
                    <div key={i} className="flex items-center justify-between bg-[#E8E8F0] border border-[#A8A8C8] rounded-lg px-4 py-3">
                      <span className="text-slate-800">{d.window}</span>
                      <span className="text-sm font-semibold text-slate-900">{d.deadline}</span>
                    </div>
                  ))}
                  {university.applicationDeadlines.length === 0 && <p className="text-slate-500">—</p>}
                </div>
              </div>
            </div>

            <div id="courses" className="mb-12 scroll-mt-4">
              <div className="bg-[#C8C8E0] border border-[#A8A8C8] rounded-lg p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('courses')}</h2>
                <div className="space-y-2">
                  {university.courses.map((course: any, index: number) => (
                    <div key={index}>
                      <button
                        onClick={() => toggleCourse(course.name)}
                        className="w-full bg-[#E8E8F0] border border-[#A8A8C8] rounded-lg p-3 hover:border-[#9370DB] hover:bg-[#D8D8E8] transition-colors cursor-pointer text-left flex justify-between items-center"
                      >
                        <p className="text-slate-800">{course.name}</p>
                        <span className="text-slate-800">
                          {expandedCourse === course.name ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </span>
                      </button>
                      {expandedCourse === course.name && (
                        <div className="ml-4 mt-2 p-3 bg-[#D8D8E8] rounded-lg animate-fade-in-down">
                          <p className="text-slate-800 text-sm">
                            {t('courseDetailsFor')} {course.name}
                            {course.details ? ` — ${course.details}` : ''}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div id="requirements" className="mb-12 scroll-mt-4">
              <div className="bg-[#C8C8E0] border border-[#A8A8C8] rounded-lg p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('requirements')}</h2>
                <ul className="space-y-3">
                  {university.requirements.map((req: string, index: number) => (
                    <li key={index} className="text-slate-800 flex items-start">
                      <span className="text-[#9370DB] mr-2">•</span>
                      {req}
                    </li>
                  ))}
                  {university.requirements.length === 0 && <li className="text-slate-500">—</li>}
                </ul>
              </div>
            </div>

            <div id="prices" className="mb-12 scroll-mt-4">
              <div className="bg-[#C8C8E0] border border-[#A8A8C8] rounded-lg p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('prices')}</h2>
                <div className="space-y-4">
                  <div className="bg-[#E8E8F0] border border-[#A8A8C8] rounded-lg p-4">
                    <h3 className="font-semibold text-slate-900 mb-2">{t('undergraduate')}</h3>
                    <p className="text-slate-800">{university.prices.undergraduate}</p>
                  </div>
                  <div className="bg-[#E8E8F0] border border-[#A8A8C8] rounded-lg p-4">
                    <h3 className="font-semibold text-slate-900 mb-2">{t('graduate')}</h3>
                    <p className="text-slate-800">{university.prices.graduate}</p>
                  </div>
                </div>
              </div>
            </div>

            <div id="costvisa" className="mb-12 scroll-mt-4">
              <div className="bg-[#C8C8E0] border border-[#A8A8C8] rounded-lg p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-5 flex items-center gap-2">
                  <Plane className="w-6 h-6 text-sky-500" />
                  {t('costOfLiving')} & {t('visa')}
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-[#E8E8F0] border border-[#A8A8C8] rounded-lg p-4">
                    <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-1.5">
                      <Wallet className="w-4 h-4 text-[#9370DB]" /> {t('costOfLiving')}
                    </h3>
                    <p className="text-slate-800 text-sm">
                      {t('monthlyCost')}: <span className="font-semibold">{university.costOfLiving?.monthly || '—'}</span>
                    </p>
                    <p className="text-slate-800 text-sm mt-1">
                      {t('currency')}: <span className="font-semibold">{university.costOfLiving?.currency || '—'}</span>
                    </p>
                  </div>
                  <div className="bg-[#E8E8F0] border border-[#A8A8C8] rounded-lg p-4">
                    <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-1.5">
                      <Plane className="w-4 h-4 text-sky-500" /> {t('visa')}
                    </h3>
                    <p className="text-slate-800 text-sm mb-2">
                      {t('processTime')}: <span className="font-semibold">{university.visa?.processTime || '—'}</span>
                    </p>
                    <ul className="space-y-1.5">
                      {(university.visa?.requirements || []).map((r: string, i: number) => (
                        <li key={i} className="text-slate-700 text-sm flex items-start">
                          <span className="text-[#9370DB] mr-2">•</span>
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div id="undergraduate" className="mb-12 scroll-mt-4">
              <div className="bg-[#C8C8E0] border border-[#A8A8C8] rounded-lg p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('undergraduatePrograms')}</h2>
                <ul className="space-y-3">
                  {university.undergraduate.map((prog: string, index: number) => (
                    <li key={index} className="text-slate-800 flex items-start">
                      <span className="text-[#9370DB] mr-2">•</span>
                      {prog}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div id="graduate" className="mb-12 scroll-mt-4">
              <div className="bg-[#C8C8E0] border border-[#A8A8C8] rounded-lg p-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('graduatePrograms')}</h2>
                <ul className="space-y-3">
                  {university.graduate.map((prog: string, index: number) => (
                    <li key={index} className="text-slate-800 flex items-start">
                      <span className="text-[#9370DB] mr-2">•</span>
                      {prog}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
