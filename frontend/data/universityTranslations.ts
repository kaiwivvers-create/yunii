/**
 * Per-university content translations (中文 & Bahasa Indonesia).
 *
 * Covers the two prominent English strings on every university page:
 * `description` (the one-liner) and `overview` (the lead paragraph).
 * All other fields fall back to English.
 */
export type Lang = 'en' | 'zh' | 'id';

interface UniTranslation {
  descriptionZh?: string;
  descriptionId?: string;
  overviewZh?: string;
  overviewId?: string;
}

const byName: Record<string, UniTranslation> = {
  'Harvard University': {
    descriptionZh: '常春藤联盟研究型大学',
    descriptionId: 'Universitas riset Ivy League',
    overviewZh: '哈佛大学创立于1636年，是美国最古老的高等学府。',
    overviewId: 'Didirikan tahun 1636, Harvard adalah institusi pendidikan tinggi tertua di Amerika Serikat.',
  },
  MIT: {
    descriptionZh: '顶尖科技与工程学院',
    descriptionId: 'Sekolah teknologi dan teknik terkemuka',
    overviewZh: '麻省理工学院创立于1861年，以工程、计算机科学和自然科学闻名于世。',
    overviewId: 'Didirikan tahun 1861, MIT terkenal di dunia untuk teknik, ilmu komputer, dan sains fisik.',
  },
  'Stanford University': {
    descriptionZh: '硅谷研究型大学',
    descriptionId: 'Universitas riset Silicon Valley',
    overviewZh: '斯坦福大学创立于1885年，以学术实力和毗邻硅谷而闻名。',
    overviewId: 'Didirikan tahun 1885, Stanford dikenal karena kekuatan akademik dan kedekatannya dengan Silicon Valley.',
  },
  'University of Oxford': {
    descriptionZh: '最古老的英语授课大学',
    descriptionId: 'Universitas berbahasa Inggris tertua',
    overviewZh: '牛津大学创立于1096年，是英语世界最古老的大学。',
    overviewId: 'Didirikan tahun 1096, Oxford adalah universitas tertua di dunia berbahasa Inggris.',
  },
  'University of Cambridge': {
    descriptionZh: '历史悠久的科研大学',
    descriptionId: 'Universitas riset bersejarah',
    overviewZh: '剑桥大学创立于1209年，是世界上最古老、最负盛名的大学之一。',
    overviewId: 'Didirikan tahun 1209, Cambridge adalah salah satu universitas tertua dan paling bergengsi di dunia.',
  },
  'ETH Zurich': {
    descriptionZh: '顶尖理工大学',
    descriptionId: 'Universitas teknik terkemuka',
    overviewZh: '苏黎世联邦理工学院创立于1855年，是全球顶尖理工大学之一。',
    overviewId: 'Didirikan tahun 1855, ETH Zurich adalah salah satu universitas teknik terkemuka di dunia.',
  },
  'Imperial College London': {
    descriptionZh: '以科学为基础的高等学府',
    descriptionId: 'Institusi berbasis sains',
    overviewZh: '伦敦帝国理工学院创立于1907年，是位于伦敦的一所以科学为基础的大学。',
    overviewId: 'Didirikan tahun 1907, Imperial College London adalah universitas berbasis sains di London.',
  },
  'National University of Singapore': {
    descriptionZh: '亚洲顶尖大学',
    descriptionId: 'Universitas Asia terkemuka',
    overviewZh: '新加坡国立大学创立于1905年，是新加坡的旗舰大学。',
    overviewId: 'Didirikan tahun 1905, NUS adalah universitas unggulan Singapura.',
  },
  'Tsinghua University': {
    descriptionZh: '中国顶尖大学',
    descriptionId: 'Universitas China terkemuka',
    overviewZh: '清华大学创立于1911年，是中国最负盛名的大学之一。',
    overviewId: 'Didirikan tahun 1911, Tsinghua adalah salah satu universitas paling bergengsi di China.',
  },
  'University of Tokyo': {
    descriptionZh: '日本顶尖大学',
    descriptionId: 'Universitas terbaik Jepang',
    overviewZh: '东京大学创立于1877年，是日本最负盛名的大学。',
    overviewId: 'Didirikan tahun 1877, Universitas Tokyo adalah universitas paling bergengsi di Jepang.',
  },
  'Peking University': {
    descriptionZh: '历史悠久的名牌大学',
    descriptionId: 'Universitas China bersejarah',
    overviewZh: '北京大学创立于1898年，是中国历史最悠久、最负盛名的大学之一。',
    overviewId: 'Didirikan tahun 1898, Universitas Peking adalah salah satu universitas tertua dan paling bergengsi di China.',
  },
  'Australian National University': {
    descriptionZh: '国立研究型大学',
    descriptionId: 'Universitas riset nasional',
    overviewZh: '澳大利亚国立大学创立于1946年，是澳大利亚的国家大学。',
    overviewId: 'Didirikan tahun 1946, ANU adalah universitas nasional Australia.',
  },
  'University of Melbourne': {
    descriptionZh: '澳大利亚顶尖大学',
    descriptionId: 'Universitas terbaik Australia',
    overviewZh: '墨尔本大学创立于1853年，是澳大利亚历史最悠久的大学。',
    overviewId: 'Didirikan tahun 1853, Universitas Melbourne adalah universitas tertua di Australia.',
  },
  'University of Sydney': {
    descriptionZh: '澳大利亚领先大学',
    descriptionId: 'Universitas Australia terkemuka',
    overviewZh: '悉尼大学创立于1850年，是澳大利亚的第一所大学。',
    overviewId: 'Didirikan tahun 1850, Universitas Sydney adalah universitas pertama di Australia.',
  },
  'University of São Paulo': {
    descriptionZh: '巴西规模最大的大学',
    descriptionId: 'Universitas terbesar di Brasil',
    overviewZh: '圣保罗大学创立于1934年，是巴西规模最大的大学。',
    overviewId: 'Didirikan tahun 1934, USP adalah universitas terbesar di Brasil.',
  },
  'University of Buenos Aires': {
    descriptionZh: '阿根廷顶尖大学',
    descriptionId: 'Universitas terbaik Argentina',
    overviewZh: '布宜诺斯艾利斯大学创立于1821年，是阿根廷规模最大、最负盛名的大学。',
    overviewId: 'Didirikan tahun 1821, UBA adalah universitas terbesar dan paling bergengsi di Argentina.',
  },
  'University of Cape Town': {
    descriptionZh: '非洲领先大学',
    descriptionId: 'Universitas terkemuka Afrika',
    overviewZh: '开普敦大学创立于1829年，是南非历史最悠久的大学。',
    overviewId: 'Didirikan tahun 1829, UCT adalah universitas tertua di Afrika Selatan.',
  },
  'Stellenbosch University': {
    descriptionZh: '南非顶尖大学',
    descriptionId: 'Universitas top Afrika Selatan',
    overviewZh: '斯泰伦博斯大学创立于1918年，是南非顶尖大学之一。',
    overviewId: 'Didirikan tahun 1918, Universitas Stellenbosch adalah salah satu universitas terbaik di Afrika Selatan.',
  },
};

/** Returns a localized copy of a university (English passes through unchanged). */
export function localizeUniversity<T extends { name: string; description?: string; overview?: string }>(
  uni: T,
  lang: Lang,
): T {
  if (lang === 'en') return uni;
  const tr = byName[uni.name];
  if (!tr) return uni;
  const isZh = lang === 'zh';
  return {
    ...uni,
    description: (isZh ? tr.descriptionZh : tr.descriptionId) || uni.description,
    overview: (isZh ? tr.overviewZh : tr.overviewId) || uni.overview,
  };
}
