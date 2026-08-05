export interface GuideSection {
  heading: string;
  body?: string;
  list?: string[];
}

export interface Guide {
  slug: string;
  title: string;
  titleZh: string;
  category: 'Admissions' | 'Costs' | 'Visas' | 'Scholarships' | 'Deadlines' | 'Country Guides';
  readTime: number;
  excerpt: string;
  excerptZh: string;
  image: string;
  sections: GuideSection[];
}

export const guides: Guide[] = [
  {
    slug: 'how-to-build-a-strong-application',
    title: 'How to Build a Strong University Application',
    titleZh: '如何打造强有力的大学申请',
    category: 'Admissions',
    readTime: 8,
    excerpt:
      'From personal statements to recommendation letters — the exact formula that gets applications noticed by top universities.',
    excerptZh: '从个人陈述到推荐信——让顶尖大学注意到你的申请的关键要素。',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800',
    sections: [
      {
        heading: 'Start with strategy, not essays',
        body:
          'Top universities reject most applicants not because they are weak, but because they are unfocused. Before writing a single word, map out a strategy: which programs genuinely fit your profile, what makes you different, and how each part of your application reinforces one story.',
      },
      {
        heading: 'The personal statement that works',
        list: [
          'Open with a specific moment, not a cliché about passion',
          'Show, don\u2019t tell — one vivid anecdote beats three adjectives',
          'Connect your story to the specific program and university',
          'End by looking forward: what you will contribute and become',
        ],
      },
      {
        heading: 'Recommendation letters done right',
        body:
          'Choose teachers who know you personally, not just those with impressive titles. Give them a short brag sheet of your top achievements, coursework, and ambitions. A detailed, personal letter from a math teacher beats a generic one from the principal.',
      },
      {
        heading: 'Common mistakes to avoid',
        list: [
          'Submitting the same essay to every university',
          'Ignoring each program\u2019s specific requirements',
          'Missing early deadline advantages (rolling / early decision)',
          'Overloading with activities — depth beats breadth',
        ],
      },
    ],
  },
  {
    slug: 'understanding-tuition-and-living-costs',
    title: 'Tuition & Living Costs: What You\u2019ll Really Pay',
    titleZh: '学费与生活费：你实际要花多少钱',
    category: 'Costs',
    readTime: 6,
    excerpt:
      'A country-by-country breakdown of tuition and monthly living costs — and the hidden fees most students forget to budget for.',
    excerptZh: '各国学费与每月生活费详解——以及多数学生忘记预算的隐性费用。',
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
    sections: [
      {
        heading: 'Where tuition is (surprisingly) affordable',
        body:
          'Germany and Norway charge little or nothing for public university tuition even for international students. In contrast, US private universities can exceed $60,000 per year — but generous financial aid often brings the real price down substantially.',
        list: [
          'Germany: ~€0–1,500 / year (public)',
          'Norway: free at public universities',
          'UK: £9,250–£47,000 / year depending on status',
          'US private: $50,000–$70,000 list price (aid available)',
        ],
      },
      {
        heading: 'Living costs by city tier',
        body:
          'Rent dominates your budget. Cities like London, New York, and Singapore can cost $1,800–$3,000 per month in total; Berlin, Kuala Lumpur, and Buenos Aires are far more forgiving at $700–$1,300.',
      },
      {
        heading: 'Hidden costs to budget for',
        list: [
          'Health insurance (mandatory in many countries)',
          'Visa & residence permit fees',
          'Books, software licenses, and lab fees',
          'Flights home and travel',
          'Security deposit on accommodation',
        ],
      },
    ],
  },
  {
    slug: 'student-visa-guide-2027',
    title: 'The Student Visa Guide: Step by Step',
    titleZh: '学生签证指南：一步步搞定',
    category: 'Visas',
    readTime: 9,
    excerpt:
      'The documents, timelines, and interviews behind student visas for the most popular study destinations.',
    excerptZh: '最热门留学目的地的学生签证所需材料、时间线与面试。',
    image: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=800',
    sections: [
      {
        heading: 'The universal document checklist',
        list: [
          'Valid passport (6+ months beyond your program end date)',
          'Official admission / CAS / I-20 letter from the university',
          'Proof of financial support (bank statements, scholarships)',
          'Visa application form and fee receipt',
          'Passport photos and translated documents',
          'Health insurance proof (required in several countries)',
        ],
      },
      {
        heading: 'Typical timelines by destination',
        body:
          'US F-1 visas: apply 120 days before your program starts, attend a consulate interview, allow 2–6 weeks. UK Student visas: apply up to 6 months ahead, usually decided within 3 weeks. Schengen/European student visas: book appointments early — summer slots fill fast.',
      },
      {
        heading: 'Interview tips',
        body:
          'Officers want to confirm you are a genuine student who will leave after graduating. Bring every document even if unasked, answer in English confidently, and be ready to explain how you will fund your studies and why you chose this university.',
      },
    ],
  },
  {
    slug: 'scholarships-for-international-students',
    title: 'Scholarships That Actually Pay for Study Abroad',
    titleZh: '真正能资助留学的奖学金',
    category: 'Scholarships',
    readTime: 7,
    excerpt:
      'Merit, need-based, and government-funded scholarships — and how to find the ones you are actually eligible for.',
    excerptZh: '优秀奖学金、助学金与政府奖学金——以及如何找到真正符合条件的项目。',
    image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800',
    sections: [
      {
        heading: 'The big three categories',
        list: [
          'Merit scholarships — top grades, test scores, or portfolios',
          'Need-based aid — grants calculated from family income',
          'Government / third-country programs — Chevening, Fulbright, DAAD, CSC',
        ],
      },
      {
        heading: 'Where to look first',
        body:
          'Start with the university\u2019s own scholarship page — many schools automatically consider applicants for merit awards, no separate application needed. Then check your home country\u2019s education ministry and the destination country\u2019s embassy for bilateral agreements.',
      },
      {
        heading: 'Application tips',
        body:
          'Deadlines for government scholarships often fall 8–12 months before enrollment. Keep a spreadsheet of every scholarship with its deadline, requirements, and status. Reuse and adapt essays between applications, but tailor the "why you" section each time.',
      },
    ],
  },
  {
    slug: 'application-deadlines-explained',
    title: 'Application Deadlines, Decoded',
    titleZh: '申请截止日期全解析',
    category: 'Deadlines',
    readTime: 5,
    excerpt:
      'Early action, rolling admissions, and the real difference between deadline types — with a timing plan that keeps you on track.',
    excerptZh: '提前申请、滚动录取与不同截止类型的真实区别——附时间规划。',
    image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=800',
    sections: [
      {
        heading: 'Deadline types explained',
        list: [
          'Early Decision (ED) — binding, applies to one school only',
          'Early Action (EA) — non-binding, earlier decision',
          'Regular Decision (RD) — the standard deadline',
          'Rolling admissions — reviewed as applications arrive; apply early',
        ],
      },
      {
        heading: 'Why early matters',
        body:
          'Some universities admit a significantly higher share of early applicants simply because the applicant pool is smaller and stronger. Rolling admissions schools fill up as the year progresses — waiting until the deadline can mean waiting another year.',
      },
      {
        heading: 'A simple timeline that works',
        list: [
          '18–12 months out: research and shortlist universities',
          '12–9 months out: take standardized tests, request recommendation letters',
          '9–6 months out: draft personal statements, register for deadlines',
          '6–3 months out: submit early applications',
          '3–1 months out: submit regular applications, complete financial aid forms',
        ],
      },
    ],
  },
  {
    slug: 'studying-in-north-america-vs-europe',
    title: 'North America vs Europe: Where Should You Go?',
    titleZh: '北美还是欧洲：你该去哪里留学？',
    category: 'Country Guides',
    readTime: 10,
    excerpt:
      'Four years of your life — compare costs, curriculum, campus life, and career outcomes across the two most popular study regions.',
    excerptZh: '四年人生——比较两大最热门留学地区的费用、课程、校园生活与职业前景。',
    image: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=800',
    sections: [
      {
        heading: 'Curriculum and flexibility',
        body:
          'US and Canadian universities push a broad liberal-arts curriculum: you can change majors in year two. European programs are usually specialised from day one — you pick engineering or economics and dive straight in. Choose broad flexibility for exploration, specialisation for focus.',
      },
      {
        heading: 'Costs compared',
        body:
          'US private universities are the most expensive in the world but offer the most financial aid. Public European universities are dramatically cheaper, and several countries (Germany, Norway) are tuition-free — living costs become your main budget line.',
      },
      {
        heading: 'Campus life and culture',
        body:
          'North America is the classic campus experience: dorms, sports, clubs, and a strong alumni network that helps with jobs after graduation. Europe offers historic cities, easier travel between countries, and often shorter programs (3-year bachelors) that get you into the workforce sooner.',
      },
      {
        heading: 'Career outcomes',
        body:
          'US degrees often come with OPT work permission for graduates and a massive tech/business job market. Europe\u2019s post-study work visas — especially in Germany and the UK — have become generous, and EU degrees ease mobility across the continent.',
      },
    ],
  },
];

export function getGuide(slug: string): Guide | undefined {
  return guides.find((g) => g.slug === slug);
}
