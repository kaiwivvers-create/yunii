'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Lang = 'en' | 'zh';

type Dict = Record<string, { en: string; zh: string }>;

const dict: Dict = {
  // Nav
  home: { en: 'Home', zh: '首页' },
  explore: { en: 'Explore', zh: '探索' },
  chat: { en: 'Chat', zh: '咨询' },
  compare: { en: 'Compare', zh: '对比' },
  guides: { en: 'Guides', zh: '指南' },
  login: { en: 'Login', zh: '登录' },
  signup: { en: 'Sign Up', zh: '注册' },
  signIn: { en: 'Sign In', zh: '登录' },
  getStarted: { en: 'Get Started', zh: '开始' },
  logout: { en: 'Logout', zh: '退出登录' },
  myProfile: { en: 'My Profile', zh: '我的主页' },
  settings: { en: 'Settings', zh: '设置' },
  admin: { en: 'Admin', zh: '管理后台' },
  welcomeBack: { en: 'Welcome', zh: '欢迎' },
  back: { en: 'Back', zh: '返回' },

  // Explore
  searchUniversities: { en: 'Search universities...', zh: '搜索大学...' },
  filterByMyPreferences: { en: 'Filter by my preferences', zh: '按我的偏好筛选' },
  noUniversitiesFound: { en: 'No universities found', zh: '未找到大学' },
  seeMore: { en: 'See More', zh: '查看更多' },
  rankFilter: { en: 'World Rank', zh: '世界排名' },
  all: { en: 'All', zh: '全部' },
  top10: { en: 'Top 10', zh: '前10名' },
  top25: { en: 'Top 25', zh: '前25名' },
  top50: { en: 'Top 50', zh: '前50名' },
  top100: { en: 'Top 100', zh: '前100名' },

  // University page
  overview: { en: 'Overview', zh: '学校概况' },
  details: { en: 'Details', zh: '详细信息' },
  courses: { en: 'Courses', zh: '专业课程' },
  requirements: { en: 'Requirements', zh: '入学要求' },
  prices: { en: 'Tuition', zh: '学费' },
  undergraduate: { en: 'Undergraduate', zh: '本科' },
  graduate: { en: 'Graduate', zh: '研究生' },
  undergraduatePrograms: { en: 'Undergraduate Programs', zh: '本科课程' },
  graduatePrograms: { en: 'Graduate Programs', zh: '研究生课程' },
  rankings: { en: 'Rankings', zh: '排名' },
  worldRank: { en: 'World Rank', zh: '世界排名' },
  programRankings: { en: 'Program Rankings', zh: '专业排名' },
  prosCons: { en: 'Pros & Cons', zh: '优势与不足' },
  pros: { en: 'Pros', zh: '优势' },
  cons: { en: 'Cons', zh: '不足' },
  scholarships: { en: 'Scholarships', zh: '奖学金' },
  deadlines: { en: 'Application Deadlines', zh: '申请截止日期' },
  applicationsOpen: { en: 'Applications open', zh: '申请开放' },
  deadline: { en: 'Deadline', zh: '截止' },
  costOfLiving: { en: 'Cost of Living', zh: '生活成本' },
  monthlyCost: { en: 'Monthly', zh: '每月' },
  currency: { en: 'Currency', zh: '货币' },
  visa: { en: 'Visa & Immigration', zh: '签证与移民' },
  processTime: { en: 'Processing time', zh: '办理时间' },
  visaRequirements: { en: 'Requirements', zh: '要求' },
  compare: { en: 'Compare', zh: '对比' },
  addToCompare: { en: 'Add to Compare', zh: '加入对比' },
  addedToCompare: { en: 'Added to Compare', zh: '已加入对比' },
  applyNow: { en: 'Apply Now', zh: '立即申请' },
  universityNotFound: { en: 'University not found', zh: '未找到该大学' },
  backToExplore: { en: 'Back to Explore', zh: '返回探索' },
  loading: { en: 'Loading...', zh: '加载中...' },
  seeInCompare: { en: 'View Compare', zh: '查看对比' },
  courseDetailsFor: { en: 'Course details for', zh: '课程详情：' },

  // Compare page
  compareTitle: { en: 'Compare Universities', zh: '大学对比' },
  compareSubtitle: { en: 'Select up to 4 universities to see them side by side', zh: '最多选择4所大学进行对比' },
  pickUniversities: { en: 'Pick universities', zh: '选择大学' },
  remove: { en: 'Remove', zh: '移除' },
  emptyCompare: { en: 'No universities selected. Pick some from the list to start comparing.', zh: '尚未选择大学，请从列表中选择以开始对比。' },
  attribute: { en: 'Attribute', zh: '项目' },
  universityCol: { en: 'University', zh: '大学' },
  location: { en: 'Location', zh: '所在地' },
  tuitionUG: { en: 'Undergrad tuition', zh: '本科学费' },
  tuitionG: { en: 'Graduate tuition', zh: '研究生学费' },
  viewDetails: { en: 'View Details', zh: '查看详情' },
  topPrograms: { en: 'Top programs', zh: '优势专业' },
  scholarshipsAvailable: { en: 'Scholarships', zh: '奖学金' },
  applicationsDeadline: { en: 'Next deadline', zh: '最近截止' },

  // Guides
  guidesTitle: { en: 'Study Abroad Guides', zh: '留学指南' },
  guidesSubtitle: { en: 'Practical guides to studying abroad — admissions, costs, visas and more', zh: '实用的留学指南——申请、费用、签证等' },
  readMore: { en: 'Read More', zh: '阅读全文' },
  backToGuides: { en: 'All Guides', zh: '全部指南' },
  relatedGuides: { en: 'Related Guides', zh: '相关指南' },
  category: { en: 'Category', zh: '分类' },
  readTime: { en: 'min read', zh: '分钟阅读' },
  admissions: { en: 'Admissions', zh: '申请' },
  costs: { en: 'Costs', zh: '费用' },
  visas: { en: 'Visas', zh: '签证' },
  scholarshipsGuide: { en: 'Scholarships', zh: '奖学金' },
  deadlinesGuide: { en: 'Deadlines', zh: '截止日期' },
  countryGuides: { en: 'Country Guides', zh: '国家指南' },

  // Admin
  adminDashboard: { en: 'Admin Dashboard', zh: '管理后台' },
};

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');

  useEffect(() => {
    const stored = localStorage.getItem('lang') as Lang | null;
    if (stored === 'en' || stored === 'zh') {
      setLang(stored);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key: string) => {
    const entry = dict[key];
    if (!entry) return key;
    return entry[lang];
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
