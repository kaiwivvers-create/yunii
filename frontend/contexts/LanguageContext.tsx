'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useBrand } from './BrandContext';
import { subBrand } from '@/utils/brand';

export type Lang = 'en' | 'zh' | 'id';

export const LANG_OPTIONS: { value: Lang; label: string; short: string }[] = [
  { value: 'en', label: 'English', short: 'EN' },
  { value: 'zh', label: '中文', short: '中文' },
  { value: 'id', label: 'Bahasa Indonesia', short: 'ID' },
];

type Dict = Record<string, { en: string; zh: string; id: string }>;

const dict: Dict = {
  // Nav
  home: { en: 'Home', zh: '首页', id: 'Beranda' },
  explore: { en: 'Explore', zh: '探索', id: 'Jelajahi' },
  chat: { en: 'Chat', zh: '咨询', id: 'Obrolan' },
  compare: { en: 'Compare', zh: '对比', id: 'Bandingkan' },
  guides: { en: 'Guides', zh: '指南', id: 'Panduan' },
  login: { en: 'Login', zh: '登录', id: 'Masuk' },
  signup: { en: 'Sign Up', zh: '注册', id: 'Daftar' },
  signIn: { en: 'Sign In', zh: '登录', id: 'Masuk' },
  getStarted: { en: 'Get Started', zh: '开始', id: 'Mulai' },
  logout: { en: 'Logout', zh: '退出登录', id: 'Keluar' },
  myProfile: { en: 'My Profile', zh: '我的主页', id: 'Profil Saya' },
  settings: { en: 'Settings', zh: '设置', id: 'Pengaturan' },
  admin: { en: 'Admin', zh: '管理后台', id: 'Admin' },
  welcomeBack: { en: 'Welcome', zh: '欢迎', id: 'Selamat Datang' },
  back: { en: 'Back', zh: '返回', id: 'Kembali' },

  // Explore
  searchUniversities: { en: 'Search universities...', zh: '搜索大学...', id: 'Cari universitas...' },
  filterByMyPreferences: { en: 'Filter by my preferences', zh: '按我的偏好筛选', id: 'Saring sesuai preferensi saya' },
  noUniversitiesFound: { en: 'No universities found', zh: '未找到大学', id: 'Tidak ada universitas ditemukan' },
  seeMore: { en: 'See More', zh: '查看更多', id: 'Lihat Selengkapnya' },
  rankFilter: { en: 'World Rank', zh: '世界排名', id: 'Peringkat Dunia' },
  all: { en: 'All', zh: '全部', id: 'Semua' },
  top10: { en: 'Top 10', zh: '前10名', id: '10 Besar' },
  top25: { en: 'Top 25', zh: '前25名', id: '25 Besar' },
  top50: { en: 'Top 50', zh: '前50名', id: '50 Besar' },
  top100: { en: 'Top 100', zh: '前100名', id: '100 Besar' },
  regions: { en: 'Regions', zh: '地区', id: 'Wilayah' },
  allRegions: { en: 'All Regions', zh: '全部地区', id: 'Semua Wilayah' },
  universitiesFound: { en: 'universities', zh: '所大学', id: 'universitas' },
  noRegionsMatch: { en: 'No regions match your filters', zh: '没有符合筛选的地区', id: 'Tidak ada wilayah yang cocok dengan filter Anda' },
  filters: { en: 'Filters', zh: '筛选', id: 'Filter' },
  majorFilter: { en: 'Major / Program', zh: '专业/课程', id: 'Jurusan / Program' },
  allMajors: { en: 'All majors', zh: '全部专业', id: 'Semua jurusan' },
  allBudgets: { en: 'Any budget', zh: '任意预算', id: 'Anggaran apa pun' },
  programsN: { en: '{n} programs', zh: '{n}个专业', id: '{n} program' },
  scholarshipsN: { en: '{n} scholarships', zh: '{n}项奖学金', id: '{n} beasiswa' },
  preferenceFiltersApplied: {
    en: 'Filtering by your saved preferences (regions, budget, major)',
    zh: '根据您的已保存偏好筛选（地区、预算、专业）',
    id: 'Menyaring berdasarkan preferensi tersimpan Anda (wilayah, anggaran, jurusan)',
  },

  // University page
  overview: { en: 'Overview', zh: '学校概况', id: 'Ringkasan' },
  details: { en: 'Details', zh: '详细信息', id: 'Detail' },
  courses: { en: 'Courses', zh: '专业课程', id: 'Program Studi' },
  requirements: { en: 'Requirements', zh: '入学要求', id: 'Persyaratan' },
  prices: { en: 'Tuition', zh: '学费', id: 'Biaya Kuliah' },
  undergraduate: { en: 'Undergraduate', zh: '本科', id: 'Sarjana' },
  graduate: { en: 'Graduate', zh: '研究生', id: 'Pascasarjana' },
  undergraduatePrograms: { en: 'Undergraduate Programs', zh: '本科课程', id: 'Program Sarjana' },
  graduatePrograms: { en: 'Graduate Programs', zh: '研究生课程', id: 'Program Pascasarjana' },
  rankings: { en: 'Rankings', zh: '排名', id: 'Peringkat' },
  worldRank: { en: 'World Rank', zh: '世界排名', id: 'Peringkat Dunia' },
  programRankings: { en: 'Program Rankings', zh: '专业排名', id: 'Peringkat Program' },
  prosCons: { en: 'Pros & Cons', zh: '优势与不足', id: 'Kelebihan & Kekurangan' },
  pros: { en: 'Pros', zh: '优势', id: 'Kelebihan' },
  cons: { en: 'Cons', zh: '不足', id: 'Kekurangan' },
  scholarships: { en: 'Scholarships', zh: '奖学金', id: 'Beasiswa' },
  deadlines: { en: 'Application Deadlines', zh: '申请截止日期', id: 'Batas Waktu Pendaftaran' },
  applicationsOpen: { en: 'Applications open', zh: '申请开放', id: 'Pendaftaran dibuka' },
  deadline: { en: 'Deadline', zh: '截止', id: 'Batas Waktu' },
  costOfLiving: { en: 'Cost of Living', zh: '生活成本', id: 'Biaya Hidup' },
  monthlyCost: { en: 'Monthly', zh: '每月', id: 'Bulanan' },
  currency: { en: 'Currency', zh: '货币', id: 'Mata Uang' },
  visa: { en: 'Visa & Immigration', zh: '签证与移民', id: 'Visa & Imigrasi' },
  processTime: { en: 'Processing time', zh: '办理时间', id: 'Waktu Proses' },
  visaRequirements: { en: 'Requirements', zh: '要求', id: 'Persyaratan' },
  addToCompare: { en: 'Add to Compare', zh: '加入对比', id: 'Tambahkan ke Perbandingan' },
  addedToCompare: { en: 'Added to Compare', zh: '已加入对比', id: 'Ditambahkan ke Perbandingan' },
  applyNow: { en: 'Apply Now', zh: '立即申请', id: 'Daftar Sekarang' },
  universityNotFound: { en: 'University not found', zh: '未找到该大学', id: 'Universitas tidak ditemukan' },
  backToExplore: { en: 'Back to Explore', zh: '返回探索', id: 'Kembali ke Jelajah' },
  loading: { en: 'Loading...', zh: '加载中...', id: 'Memuat...' },
  seeInCompare: { en: 'View Compare', zh: '查看对比', id: 'Lihat Perbandingan' },
  courseDetailsFor: { en: 'Course details for', zh: '课程详情：', id: 'Detail program untuk' },

  // Compare page
  compareTitle: { en: 'Compare Universities', zh: '大学对比', id: 'Bandingkan Universitas' },
  compareSubtitle: {
    en: 'Select up to 4 universities to see them side by side',
    zh: '最多选择4所大学进行对比',
    id: 'Pilih hingga 4 universitas untuk dibandingkan secara berdampingan',
  },
  pickUniversities: { en: 'Pick universities', zh: '选择大学', id: 'Pilih universitas' },
  remove: { en: 'Remove', zh: '移除', id: 'Hapus' },
  emptyCompare: {
    en: 'No universities selected. Pick some from the list to start comparing.',
    zh: '尚未选择大学，请从列表中选择以开始对比。',
    id: 'Belum ada universitas dipilih. Pilih dari daftar untuk mulai membandingkan.',
  },
  attribute: { en: 'Attribute', zh: '项目', id: 'Atribut' },
  universityCol: { en: 'University', zh: '大学', id: 'Universitas' },
  location: { en: 'Location', zh: '所在地', id: 'Lokasi' },
  tuitionUG: { en: 'Undergrad tuition', zh: '本科学费', id: 'Biaya Sarjana' },
  tuitionG: { en: 'Graduate tuition', zh: '研究生学费', id: 'Biaya Pascasarjana' },
  viewDetails: { en: 'View Details', zh: '查看详情', id: 'Lihat Detail' },
  topPrograms: { en: 'Top programs', zh: '优势专业', id: 'Program Unggulan' },
  scholarshipsAvailable: { en: 'Scholarships', zh: '奖学金', id: 'Beasiswa' },
  applicationsDeadline: { en: 'Next deadline', zh: '最近截止', id: 'Batas Waktu Berikutnya' },

  // Guides
  guidesTitle: { en: 'Study Abroad Guides', zh: '留学指南', id: 'Panduan Kuliah di Luar Negeri' },
  guidesSubtitle: {
    en: 'Practical guides to studying abroad — admissions, costs, visas and more',
    zh: '实用的留学指南——申请、费用、签证等',
    id: 'Panduan praktis kuliah di luar negeri — penerimaan, biaya, visa, dan lainnya',
  },
  readMore: { en: 'Read More', zh: '阅读全文', id: 'Baca Selengkapnya' },
  backToGuides: { en: 'All Guides', zh: '全部指南', id: 'Semua Panduan' },
  relatedGuides: { en: 'Related Guides', zh: '相关指南', id: 'Panduan Terkait' },
  category: { en: 'Category', zh: '分类', id: 'Kategori' },
  readTime: { en: 'min read', zh: '分钟阅读', id: 'menit baca' },
  admissions: { en: 'Admissions', zh: '申请', id: 'Penerimaan' },
  costs: { en: 'Costs', zh: '费用', id: 'Biaya' },
  visas: { en: 'Visas', zh: '签证', id: 'Visa' },
  scholarshipsGuide: { en: 'Scholarships', zh: '奖学金', id: 'Beasiswa' },
  deadlinesGuide: { en: 'Deadlines', zh: '截止日期', id: 'Batas Waktu' },
  countryGuides: { en: 'Country Guides', zh: '国家指南', id: 'Panduan Negara' },
  newGuide: { en: 'New Guide', zh: '新建指南', id: 'Panduan Baru' },
  edit: { en: 'Edit', zh: '编辑', id: 'Edit' },
  guideNotFound: { en: 'Guide not found', zh: '未找到指南', id: 'Panduan tidak ditemukan' },
  signInToReadGuide: { en: 'Sign in to read this guide', zh: '登录后阅读指南', id: 'Masuk untuk membaca panduan ini' },
  createFreeAccountUnlock: {
    en: 'Create a free account to unlock our full library of study guides, tips, and checklists.',
    zh: '创建免费账户以解锁我们的完整学习指南、技巧和清单库。',
    id: 'Buat akun gratis untuk membuka seluruh koleksi panduan belajar, tips, dan daftar periksa kami.',
  },
  createAccount: { en: 'Create an Account', zh: '创建账户', id: 'Buat Akun' },
  maybeLater: { en: 'Maybe later — back to guides', zh: '稍后再说——返回指南', id: 'Nanti saja — kembali ke panduan' },

  // Admin
  adminDashboard: { en: 'Admin Dashboard', zh: '管理后台', id: 'Dasbor Admin' },

  // Home page
  heroTitle: { en: 'Find Your Perfect University', zh: '找到你的理想大学', id: 'Temukan Universitas Impianmu' },
  heroSubtitle: {
    en: 'Discover universities and programs from around the world. Your journey to higher education starts here.',
    zh: '探索世界各地的大学与课程。你的高等教育之旅从这里开始。',
    id: 'Temukan universitas dan program dari seluruh dunia. Perjalanan pendidikan tinggimu dimulai di sini.',
  },
  searchPlaceholder: {
    en: 'Search universities, programs, or locations...',
    zh: '搜索大学、课程或地点...',
    id: 'Cari universitas, program, atau lokasi...',
  },
  search: { en: 'Search', zh: '搜索', id: 'Cari' },
  countriesStat: { en: 'Countries', zh: '国家', id: 'Negara' },
  universitiesStat: { en: 'Universities', zh: '大学', id: 'Universitas' },
  programsStat: { en: 'Programs', zh: '课程', id: 'Program' },
  studentsStat: { en: 'Students', zh: '学生', id: 'Mahasiswa' },
  exploreUniversities: { en: 'Explore Universities', zh: '探索大学', id: 'Jelajahi Universitas' },
  whyUniverse: { en: 'Why {appName}?', zh: '为什么选择 {appName}？', id: 'Mengapa {appName}?' },
  whyUniverseSubtitle: {
    en: 'Everything you need to find your perfect university',
    zh: '找到理想大学所需的一切',
    id: 'Semua yang Anda butuhkan untuk menemukan universitas impian',
  },
  smartSearch: { en: 'Smart Search', zh: '智能搜索', id: 'Pencarian Cerdas' },
  smartSearchDesc: {
    en: 'Advanced filters to find universities that match your specific needs, location, and budget',
    zh: '高级筛选，找到符合你特定需求、地点和预算的大学',
    id: 'Filter lanjutan untuk menemukan universitas yang sesuai dengan kebutuhan, lokasi, dan anggaran Anda',
  },
  detailedInsights: { en: 'Detailed Insights', zh: '详细信息', id: 'Wawasan Mendetail' },
  detailedInsightsDesc: {
    en: 'Comprehensive data on rankings, programs, tuition, and student life',
    zh: '排名、课程、学费和学生生活的全面数据',
    id: 'Data lengkap tentang peringkat, program, biaya kuliah, dan kehidupan mahasiswa',
  },
  globalNetwork: { en: 'Global Network', zh: '全球网络', id: 'Jaringan Global' },
  globalNetworkDesc: {
    en: 'Connect with students and alumni from universities around the world',
    zh: '与世界各地的大学学生和校友建立联系',
    id: 'Terhubung dengan mahasiswa dan alumni dari universitas di seluruh dunia',
  },
  readyToStart: { en: 'Ready to Start Your Journey?', zh: '准备好开始你的旅程了吗？', id: 'Siap Memulai Perjalanan Anda?' },
  readyToStartDesc: {
    en: 'Join millions of students who found their perfect university through {appName}',
    zh: '加入数百万通过 {appName} 找到理想大学的学生',
    id: 'Bergabunglah dengan jutaan mahasiswa yang menemukan universitas impian melalui {appName}',
  },
  createFreeAccount: { en: 'Create Free Account', zh: '创建免费账户', id: 'Buat Akun Gratis' },
  footerTagline: { en: 'Your gateway to universities worldwide.', zh: '通往世界大学的门户。', id: 'Gerbang Anda menuju universitas di seluruh dunia.' },
  platform: { en: 'Platform', zh: '平台', id: 'Platform' },
  searchUniversitiesLink: { en: 'Search Universities', zh: '搜索大学', id: 'Cari Universitas' },
  browsePrograms: { en: 'Browse Programs', zh: '浏览课程', id: 'Jelajahi Program' },
  compareLink: { en: 'Compare', zh: '对比', id: 'Bandingkan' },
  resources: { en: 'Resources', zh: '资源', id: 'Sumber Daya' },
  blog: { en: 'Blog', zh: '博客', id: 'Blog' },
  guidesLink: { en: 'Guides', zh: '指南', id: 'Panduan' },
  faqs: { en: 'FAQs', zh: '常见问题', id: 'FAQ' },
  company: { en: 'Company', zh: '公司', id: 'Perusahaan' },
  aboutUs: { en: 'About Us', zh: '关于我们', id: 'Tentang Kami' },
  contact: { en: 'Contact', zh: '联系我们', id: 'Hubungi Kami' },
  privacyPolicy: { en: 'Privacy Policy', zh: '隐私政策', id: 'Kebijakan Privasi' },
  tellUsAboutYourself: { en: 'Tell us about yourself', zh: '介绍一下你自己', id: 'Ceritakan tentang dirimu' },
  thisHelpsUsFind: {
    en: 'This helps us find the best universities for you',
    zh: '这有助于我们为你找到最好的大学',
    id: 'Ini membantu kami menemukan universitas terbaik untukmu',
  },

  // Login / Signup
  welcomeBackTitle: { en: 'Welcome back', zh: '欢迎回来', id: 'Selamat Datang Kembali' },
  signInToContinue: { en: 'Sign in to your account to continue', zh: '登录您的账户以继续', id: 'Masuk ke akun Anda untuk melanjutkan' },
  dontHaveAccount: { en: "Don't have an account?", zh: '还没有账户？', id: 'Belum punya akun?' },
  signInToUniverse: { en: 'Sign in to {appName}', zh: '登录 {appName}', id: 'Masuk ke {appName}' },
  welcomeBackDetails: {
    en: 'Welcome back! Please enter your details',
    zh: '欢迎回来！请输入您的详细信息',
    id: 'Selamat datang kembali! Silakan masukkan detail Anda',
  },
  email: { en: 'Email', zh: '邮箱', id: 'Email' },
  password: { en: 'Password', zh: '密码', id: 'Kata Sandi' },
  rememberMe: { en: 'Remember me', zh: '记住我', id: 'Ingat saya' },
  forgotPassword: { en: 'Forgot password?', zh: '忘记密码？', id: 'Lupa kata sandi?' },
  signingIn: { en: 'Signing in...', zh: '登录中...', id: 'Sedang masuk...' },
  loginFailed: { en: 'Login failed', zh: '登录失败', id: 'Gagal masuk' },
  alreadyHaveAccount: { en: 'Already have an account?', zh: '已有账户？', id: 'Sudah punya akun?' },
  createAnAccount: { en: 'Create an account', zh: '创建账户', id: 'Buat akun' },
  startYourJourney: {
    en: 'Start your journey to find the perfect university',
    zh: '开始寻找理想大学的旅程',
    id: 'Mulai perjalanan Anda menemukan universitas impian',
  },
  signUpForUniverse: { en: 'Sign up for {appName}', zh: '注册 {appName}', id: 'Daftar ke {appName}' },
  createYourAccount: { en: 'Create your account to get started', zh: '创建您的账户以开始', id: 'Buat akun Anda untuk memulai' },
  fullName: { en: 'Full Name', zh: '姓名', id: 'Nama Lengkap' },
  confirmPassword: { en: 'Confirm Password', zh: '确认密码', id: 'Konfirmasi Kata Sandi' },
  iAgreeTo: { en: 'I agree to the', zh: '我同意', id: 'Saya setuju dengan' },
  iAgree: { en: 'I Agree', zh: '我同意', id: 'Saya Setuju' },
  gotIt: { en: 'Got it', zh: '知道了', id: 'Baiklah' },
  termsOfService: { en: 'Terms of Service', zh: '服务条款', id: 'Ketentuan Layanan' },
  and: { en: 'and', zh: '和', id: 'dan' },
  creatingAccount: { en: 'Creating account...', zh: '正在创建账户...', id: 'Membuat akun...' },
  createAccountBtn: { en: 'Create account', zh: '创建账户', id: 'Buat Akun' },
  passwordsDoNotMatch: { en: 'Passwords do not match', zh: '密码不匹配', id: 'Kata sandi tidak cocok' },
  signupFailed: { en: 'Signup failed', zh: '注册失败', id: 'Pendaftaran gagal' },

  // Forgot password page
  forgotPasswordTitle: { en: 'Reset your password', zh: '重置密码', id: 'Atur Ulang Kata Sandi' },
  forgotPasswordDesc: {
    en: "Enter the email you signed up with and we'll send you a link to reset your password.",
    zh: '请输入您注册时使用的邮箱，我们将向您发送重置密码的链接。',
    id: 'Masukkan email yang Anda gunakan saat mendaftar dan kami akan mengirimkan tautan untuk mengatur ulang kata sandi Anda.',
  },
  sendResetLink: { en: 'Send reset link', zh: '发送重置链接', id: 'Kirim Tautan Reset' },
  resetLinkSent: {
    en: 'If an account exists for {email}, a password reset link has been sent to that address.',
    zh: '如果 {email} 对应的账户存在，重置链接已发送至该邮箱。',
    id: 'Jika akun untuk {email} ada, tautan reset kata sandi telah dikirim ke alamat tersebut.',
  },
  backToLogin: { en: 'Back to login', zh: '返回登录', id: 'Kembali ke Login' },
  captchaRequired: {
    en: 'Please complete the security check first.',
    zh: '请先完成安全验证。',
    id: 'Silakan selesaikan pemeriksaan keamanan terlebih dahulu.',
  },

  // Profile
  username: { en: 'Username', zh: '用户名', id: 'Nama Pengguna' },
  myRecommendations: { en: 'My Recommendations', zh: '我的推荐', id: 'Rekomendasi Saya' },
  recommendationsTitle: { en: 'My AI Recommendations', zh: '我的 AI 推荐', id: 'Rekomendasi AI Saya' },
  recommendationsSubtitle: {
    en: 'Universities and advice the AI suggested based on your preferences',
    zh: 'AI 根据您的偏好推荐的大学与建议',
    id: 'Universitas dan saran yang disarankan AI berdasarkan preferensi Anda',
  },
  noRecommendations: {
    en: 'No recommendations yet. Ask the AI for university suggestions with “Based on my preferences” turned on, and they will appear here.',
    zh: '还没有推荐。开启“根据我的偏好”向 AI 咨询大学建议，推荐会显示在这里。',
    id: 'Belum ada rekomendasi. Minta saran universitas ke AI dengan mengaktifkan “Berdasarkan preferensi saya”, dan rekomendasinya akan muncul di sini.',
  },
  askAiNow: { en: 'Ask the AI now', zh: '立即咨询 AI', id: 'Tanyakan ke AI sekarang' },
  deleteRecommendation: { en: 'Delete recommendation', zh: '删除推荐', id: 'Hapus rekomendasi' },
  sourceChat: { en: 'Chat', zh: '聊天', id: 'Obrolan' },
  sourceSurvey: { en: 'Survey', zh: '问卷', id: 'Survei' },
  sourceExplore: { en: 'Explore', zh: '探索', id: 'Jelajahi' },
  save: { en: 'Save', zh: '保存', id: 'Simpan' },
  cancel: { en: 'Cancel', zh: '取消', id: 'Batal' },
  editProfile: { en: 'Edit Profile', zh: '编辑资料', id: 'Edit Profil' },
  savedUniversities: { en: 'Saved Universities', zh: '收藏的大学', id: 'Universitas Tersimpan' },
  noSavedUniversities: {
    en: 'No saved universities yet. Click the bookmark icon on universities to save them.',
    zh: '还没有收藏的大学。点击大学上的书签图标即可收藏。',
    id: 'Belum ada universitas tersimpan. Klik ikon penanda pada universitas untuk menyimpannya.',
  },
  view: { en: 'View', zh: '查看', id: 'Lihat' },
  cropProfilePicture: { en: 'Crop Profile Picture', zh: '裁剪头像', id: 'Potong Foto Profil' },
  reCropPhoto: { en: 'Re-crop photo', zh: '重新裁剪照片', id: 'Potong ulang foto' },
  removePhoto: { en: 'Remove photo', zh: '删除照片', id: 'Hapus foto' },

  // Survey
  whatToStudy: { en: 'What do you want to study?', zh: '你想学什么？', id: 'Apa yang ingin Anda pelajari?' },
  whatDegreeLevel: { en: 'What degree level?', zh: '什么学历？', id: 'Jenjang pendidikan apa?' },
  selectDegreeLevel: { en: 'Select degree level', zh: '选择学历', id: 'Pilih jenjang' },
  bachelorsDegree: { en: "Bachelor's Degree", zh: '学士学位', id: 'Gelar Sarjana' },
  mastersDegree: { en: "Master's Degree", zh: '硕士学位', id: 'Gelar Magister' },
  phdDoctorate: { en: 'PhD / Doctorate', zh: '博士', id: 'PhD / Doktor' },
  associateDegree: { en: 'Associate Degree', zh: '副学士学位', id: 'Gelar Associate' },
  certificateDiploma: { en: 'Certificate / Diploma', zh: '证书/文凭', id: 'Sertifikat / Diploma' },
  preferredRegions: { en: 'Preferred Regions', zh: '首选地区', id: 'Wilayah yang Diinginkan' },
  annualBudget: { en: 'Annual Budget (USD)', zh: '年度预算（美元）', id: 'Anggaran Tahunan (USD)' },
  selectBudgetRange: { en: 'Select budget range', zh: '选择预算范围', id: 'Pilih kisaran anggaran' },
  budgetUnder10k: { en: 'Under $10,000', zh: '低于 10,000 美元', id: 'Di bawah $10.000' },
  budget10to20k: { en: '$10,000 - $20,000', zh: '10,000 - 20,000 美元', id: '$10.000 - $20.000' },
  budget20to30k: { en: '$20,000 - $30,000', zh: '20,000 - 30,000 美元', id: '$20.000 - $30.000' },
  budget30to40k: { en: '$30,000 - $40,000', zh: '30,000 - 40,000 美元', id: '$30.000 - $40.000' },
  budget40to50k: { en: '$40,000 - $50,000', zh: '40,000 - 50,000 美元', id: '$40.000 - $50.000' },
  budgetOver50k: { en: '$50,000+', zh: '50,000 美元以上', id: '$50.000+' },
  gpaPerformance: { en: 'GPA / Academic Performance', zh: 'GPA / 学业成绩', id: 'IPK / Prestasi Akademik' },
  gpaPlaceholder: { en: 'e.g., 3.5, 85%, A', zh: '例如：3.5, 85%, A', id: 'mis., 3.5, 85%, A' },
  languageRequirements: { en: 'Language Requirements', zh: '语言要求', id: 'Persyaratan Bahasa' },
  studyMode: { en: 'Study Mode', zh: '学习模式', id: 'Mode Belajar' },
  selectStudyMode: { en: 'Select study mode', zh: '选择学习模式', id: 'Pilih mode belajar' },
  onCampus: { en: 'On-campus', zh: '在校', id: 'Di Kampus' },
  online: { en: 'Online', zh: '在线', id: 'Daring' },
  hybrid: { en: 'Hybrid', zh: '混合', id: 'Hibrida' },
  anyMode: { en: 'Any mode', zh: '任意模式', id: 'Mode apa pun' },
  preferredStartDate: { en: 'Preferred Start Date', zh: '首选入学时间', id: 'Tanggal Mulai yang Diinginkan' },
  selectStartDate: { en: 'Select start date', zh: '选择开始日期', id: 'Pilih tanggal mulai' },
  asSoonAsPossible: { en: 'As soon as possible', zh: '尽快', id: 'Sesegera mungkin' },
  flexible: { en: 'Flexible', zh: '灵活', id: 'Fleksibel' },
  extracurriculars: {
    en: 'Extracurricular Activities / Interests (optional)',
    zh: '课外活动/兴趣（可选）',
    id: 'Kegiatan Ekstrakurikuler / Minat (opsional)',
  },
  extracurricularsPlaceholder: {
    en: 'Tell us about your hobbies, sports, clubs, volunteer work, etc.',
    zh: '告诉我们你的爱好、运动、社团、志愿工作等',
    id: 'Ceritakan tentang hobi, olahraga, klub, kerja sukarela, dll.',
  },
  skipForNow: { en: 'Skip for now', zh: '暂时跳过', id: 'Lewati untuk saat ini' },
  previous: { en: 'Previous', zh: '上一步', id: 'Sebelumnya' },
  next: { en: 'Next', zh: '下一步', id: 'Berikutnya' },
  complete: { en: 'Complete', zh: '完成', id: 'Selesai' },
  skip: { en: 'Skip', zh: '跳过', id: 'Lewati' },
  submit: { en: 'Submit', zh: '提交', id: 'Kirim' },
  specificCountries: { en: 'Specific Countries (optional)', zh: '特定国家（可选）', id: 'Negara Tertentu (opsional)' },
  specificCountriesPlaceholder: {
    en: 'e.g., USA, UK, Canada, Australia',
    zh: '例如：美国、英国、加拿大、澳大利亚',
    id: 'mis., AS, Inggris, Kanada, Australia',
  },
  majorPlaceholder: {
    en: 'e.g., Computer Science, Business, Medicine',
    zh: '例如：计算机科学、商业、医学',
    id: 'mis., Ilmu Komputer, Bisnis, Kedokteran',
  },

  // Settings
  settingsTitle: { en: 'Settings', zh: '设置', id: 'Pengaturan' },
  settingsSubtitle: { en: 'Update your study preferences', zh: '更新您的学习偏好', id: 'Perbarui preferensi belajar Anda' },
  myPreferences: { en: 'My Preferences', zh: '我的偏好', id: 'Preferensi Saya' },
  hide: { en: 'Hide', zh: '隐藏', id: 'Sembunyikan' },
  showMyPreferences: { en: 'Show My Preferences', zh: '显示我的偏好', id: 'Tampilkan Preferensi Saya' },
  majorsLabel: { en: 'Majors', zh: '专业', id: 'Jurusan' },
  regionsLabel: { en: 'Regions', zh: '地区', id: 'Wilayah' },
  countriesLabel: { en: 'Countries', zh: '国家', id: 'Negara' },
  languagesLabel: { en: 'Languages', zh: '语言', id: 'Bahasa' },
  noPreferencesSelected: { en: 'No preferences selected yet', zh: '尚未选择偏好', id: 'Belum ada preferensi dipilih' },
  academicPreferences: { en: 'Academic Preferences', zh: '学术偏好', id: 'Preferensi Akademik' },
  yourGpa: { en: 'Your GPA (optional)', zh: '您的GPA（可选）', id: 'IPK Anda (opsional)' },
  locationPreferences: { en: 'Location Preferences', zh: '位置偏好', id: 'Preferensi Lokasi' },
  selectRegionsFirst: {
    en: 'Select regions above to see available countries',
    zh: '请先选择地区以查看可用国家',
    id: 'Pilih wilayah di atas untuk melihat negara yang tersedia',
  },
  financialPracticalPreferences: {
    en: 'Financial & Practical Preferences',
    zh: '财务与实用偏好',
    id: 'Preferensi Keuangan & Praktis',
  },
  languageOther: { en: 'Language & Other', zh: '语言与其他', id: 'Bahasa & Lainnya' },
  appSettings: { en: 'App Settings', zh: '应用设置', id: 'Pengaturan Aplikasi' },
  appLanguage: { en: 'App Language', zh: '应用语言', id: 'Bahasa Aplikasi' },
  appLanguageHint: {
    en: 'Switches the whole app between English, 中文 and Bahasa Indonesia.',
    zh: '在英语、中文和印尼语之间切换整个应用。',
    id: 'Ganti seluruh aplikasi antara Inggris, 中文, dan Bahasa Indonesia.',
  },
  theme: { en: 'Theme', zh: '主题', id: 'Tema' },
  light: { en: 'Light', zh: '浅色', id: 'Terang' },
  dark: { en: 'Dark', zh: '深色', id: 'Gelap' },
  systemDefault: { en: 'System Default', zh: '系统默认', id: 'Default Sistem' },
  notifications: { en: 'Notifications', zh: '通知', id: 'Notifikasi' },
  emailNotifications: { en: 'Email Notifications', zh: '邮件通知', id: 'Notifikasi Email' },
  emailNotificationsDesc: {
    en: 'Receive updates about universities and programs',
    zh: '接收大学和课程的最新信息',
    id: 'Terima pembaruan tentang universitas dan program',
  },
  verified: { en: 'verified', zh: '已验证', id: 'terverifikasi' },
  notVerified: {
    en: 'Not verified — verify to enable notifications',
    zh: '未验证——验证以启用通知',
    id: 'Belum terverifikasi — verifikasi untuk mengaktifkan notifikasi',
  },
  changeEmailSupport: {
    en: 'Contact support to change your email',
    zh: '联系客服更改邮箱',
    id: 'Hubungi dukungan untuk mengubah email',
  },
  changePassword: { en: 'Change Password', zh: '修改密码', id: 'Ubah Kata Sandi' },
  dangerZone: { en: 'Danger Zone', zh: '危险区域', id: 'Zona Berbahaya' },
  dangerZoneDesc: {
    en: 'Once you delete your account, there is no going back. Please be certain.',
    zh: '删除账户后无法恢复，请谨慎操作。',
    id: 'Setelah akun dihapus, tidak bisa kembali. Pastikan Anda yakin.',
  },
  deleteAccount: { en: 'Delete Account', zh: '删除账户', id: 'Hapus Akun' },
  saveChanges: { en: 'Save Changes', zh: '保存更改', id: 'Simpan Perubahan' },
  settingsSaved: { en: 'Settings saved successfully!', zh: '设置已成功保存！', id: 'Pengaturan berhasil disimpan!' },
  verifyYourEmail: { en: 'Verify your email', zh: '验证您的邮箱', id: 'Verifikasi email Anda' },
  close: { en: 'Close', zh: '关闭', id: 'Tutup' },
  verifyEmailDesc: {
    en: "We'll send a one-time 6-digit code to {email}. Enter it below to enable email notifications.",
    zh: '我们将向 {email} 发送一次性6位验证码。请在下方输入以启用邮件通知。',
    id: 'Kami akan mengirim kode 6 digit sekali pakai ke {email}. Masukkan di bawah untuk mengaktifkan notifikasi email.',
  },
  sending: { en: 'Sending...', zh: '发送中...', id: 'Mengirim...' },
  sendVerificationCode: { en: 'Send verification code', zh: '发送验证码', id: 'Kirim kode verifikasi' },
  demoEmail: { en: '📧 Demo email — sent to {email}', zh: '📧 演示邮件——已发送至 {email}', id: '📧 Email demo — dikirim ke {email}' },
  subjectVerify: { en: 'Subject: Verify your email', zh: '主题：验证您的邮箱', id: 'Subjek: Verifikasi email Anda' },
  verificationCodeIs: {
    en: 'Your {appName} verification code is',
    zh: '您的 {appName} 验证码是',
    id: 'Kode verifikasi {appName} Anda adalah',
  },
  sixDigitCode: { en: '6-digit code', zh: '6位验证码', id: 'Kode 6 digit' },
  verifying: { en: 'Verifying...', zh: '验证中...', id: 'Memverifikasi...' },
  verifyEnableNotifications: {
    en: 'Verify & enable notifications',
    zh: '验证并启用通知',
    id: 'Verifikasi & aktifkan notifikasi',
  },
  resendCode: { en: 'Resend code', zh: '重新发送验证码', id: 'Kirim ulang kode' },
  emailVerifiedEnabled: {
    en: 'Email verified — notifications enabled',
    zh: '邮箱已验证——通知已启用',
    id: 'Email terverifikasi — notifikasi diaktifkan',
  },
  codeExpired: { en: 'That code has expired. Send a new one.', zh: '验证码已过期，请重新发送。', id: 'Kode tersebut kedaluwarsa. Kirim yang baru.' },
  incorrectCode: { en: 'Incorrect code. Check the code and try again.', zh: '验证码错误，请检查后重试。', id: 'Kode salah. Periksa kode dan coba lagi.' },
  serverUnreachable: {
    en: 'Could not reach the server. Is the backend running?',
    zh: '无法连接服务器。后端是否在运行？',
    id: 'Tidak dapat terhubung ke server. Apakah backend berjalan?',
  },
  failedToSendCode: { en: 'Failed to send the code. Try again.', zh: '发送验证码失败，请重试。', id: 'Gagal mengirim kode. Coba lagi.' },
  deleteConfirm: {
    en: 'Are you sure you want to delete your account? This action cannot be undone.',
    zh: '确定要删除您的账户吗？此操作无法撤销。',
    id: 'Yakin ingin menghapus akun Anda? Tindakan ini tidak dapat dibatalkan.',
  },
  whenToStart: { en: 'When do you want to start?', zh: '你打算什么时候开始？', id: 'Kapan Anda ingin mulai?' },
  account: { en: 'Account', zh: '账户', id: 'Akun' },
  accountDeletionRequested: {
    en: 'Account deletion request sent. You will receive an email confirmation.',
    zh: '账户删除请求已发送。您将收到邮件确认。',
    id: 'Permintaan penghapusan akun terkirim. Anda akan menerima konfirmasi email.',
  },
  emailAddress: { en: 'Email', zh: '邮箱', id: 'Email' },
  passwordResetSent: {
    en: 'Password reset link sent to your email',
    zh: '密码重置链接已发送至您的邮箱',
    id: 'Tautan reset kata sandi terkirim ke email Anda',
  },

  // Region page
  backToRegions: { en: 'Back to regions', zh: '返回地区', id: 'Kembali ke wilayah' },
  universitiesIn: { en: 'Universities in {region}', zh: '{region}的大学', id: 'Universitas di {region}' },
  provincesIn: { en: 'Provinces in {region}', zh: '{region}的省份', id: 'Provinsi di {region}' },
  noUniversitiesFoundForRegion: {
    en: 'No universities found for this region.',
    zh: '该地区未找到大学。',
    id: 'Tidak ada universitas ditemukan untuk wilayah ini.',
  },

  // Chat
  newChat: { en: 'New Chat', zh: '新建聊天', id: 'Obrolan Baru' },
  searchChats: { en: 'Search chats...', zh: '搜索聊天...', id: 'Cari obrolan...' },
  signInToStartChatting: {
    en: 'Sign in to start chatting with the AI assistant',
    zh: '登录后开始与AI助手聊天',
    id: 'Masuk untuk mulai mengobrol dengan asisten AI',
  },
  howCanIHelp: { en: 'How can I help you today?', zh: '今天我能帮你什么？', id: 'Ada yang bisa saya bantu hari ini?' },
  chatSubtitle: {
    en: 'I can help you find universities, explore courses, and navigate your academic journey.',
    zh: '我可以帮你查找大学、探索课程并规划学业。',
    id: 'Saya dapat membantu Anda menemukan universitas, menjelajahi program studi, dan menjalani perjalanan akademik Anda.',
  },
  promptCS: {
    en: 'What are the top universities for computer science?',
    zh: '计算机科学最好的大学有哪些？',
    id: 'Apa universitas terbaik untuk ilmu komputer?',
  },
  promptEssay: {
    en: 'How do I write a strong college application essay?',
    zh: '如何写出强有力的大学申请文书？',
    id: 'Bagaimana cara menulis esai aplikasi kuliah yang kuat?',
  },
  promptScholarships: {
    en: 'What scholarships are available for international students?',
    zh: '国际学生有哪些奖学金？',
    id: 'Beasiswa apa saja yang tersedia untuk mahasiswa internasional?',
  },
  promptMajor: {
    en: 'What should I consider when choosing a major?',
    zh: '选择专业时应该考虑什么？',
    id: 'Apa yang harus saya pertimbangkan saat memilih jurusan?',
  },
  typeYourOwnQuestion: { en: 'Or type your own question...', zh: '或者输入你自己的问题...', id: 'Atau ketik pertanyaan Anda sendiri...' },
  send: { en: 'Send', zh: '发送', id: 'Kirim' },
  startConversation: {
    en: 'Start a conversation by typing a message below.',
    zh: '在下方输入消息开始对话。',
    id: 'Mulai percakapan dengan mengetik pesan di bawah.',
  },
  thinking: { en: 'Thinking...', zh: '思考中...', id: 'Berpikir...' },
  askAbout: {
    en: 'Ask about universities, courses, admissions...',
    zh: '询问大学、课程、申请...',
    id: 'Tanyakan tentang universitas, program studi, penerimaan...',
  },
  chatError: { en: 'Sorry, I encountered an error. Please try again.', zh: '抱歉，出现错误，请重试。', id: 'Maaf, terjadi kesalahan. Silakan coba lagi.' },

  // Floating chatbot
  aiAssistant: { en: 'AI Assistant', zh: 'AI 助手', id: 'Asisten AI' },
  aiWelcome: { en: "Hi! I'm your {appName} AI assistant.", zh: '你好！我是 {appName} 的 AI 助手。', id: 'Hai! Saya asisten AI {appName}.' },
  aiWelcomeUni: {
    en: 'I can answer questions about this university, its programs, admissions, and help you compare it with other options.',
    zh: '我可以回答关于这所大学、专业、申请的问题，并帮你与其他选择进行对比。',
    id: 'Saya dapat menjawab pertanyaan tentang universitas ini, programnya, penerimaannya, dan membantu membandingkannya dengan opsi lain.',
  },
  aiWelcomeExplore: {
    en: 'I can help you find universities based on your preferences, answer questions about specific universities, or give advice on your study choices.',
    zh: '我可以根据你的偏好帮你找到大学，回答关于特定大学的问题，或为你的学习选择提供建议。',
    id: 'Saya dapat membantu Anda menemukan universitas sesuai preferensi, menjawab pertanyaan tentang universitas tertentu, atau memberi saran tentang pilihan studi Anda.',
  },
  aiWelcomeChat: {
    en: 'I can help you with university-related questions, program information, admissions advice, and more.',
    zh: '我可以帮你解答与大学相关的问题、提供专业信息和申请建议等。',
    id: 'Saya dapat membantu pertanyaan terkait universitas, informasi program, saran penerimaan, dan lainnya.',
  },
  aiWelcomeDefault: {
    en: 'I can help you navigate the app, find universities, and answer questions about studying abroad.',
    zh: '我可以帮你浏览应用、查找大学并回答留学相关的问题。',
    id: 'Saya dapat membantu Anda menjelajahi aplikasi, menemukan universitas, dan menjawab pertanyaan tentang kuliah di luar negeri.',
  },
  typeYourMessage: { en: 'Type your message...', zh: '输入你的消息...', id: 'Ketik pesan Anda...' },

  // Login modal
  signInToContinueFeature: { en: 'Sign in to continue', zh: '登录以继续', id: 'Masuk untuk melanjutkan' },
  needAccountToUseFeature: {
    en: 'You need an account to use this feature. It only takes a minute to create one.',
    zh: '使用此功能需要账户。创建账户只需一分钟。',
    id: 'Anda memerlukan akun untuk menggunakan fitur ini. Hanya butuh satu menit untuk membuatnya.',
  },
  maybeLaterShort: { en: 'Maybe later', zh: '稍后再说', id: 'Nanti saja' },

  // Chat preferences toggle
  basedOnMyPreferences: { en: 'Based on my preferences', zh: '根据我的偏好', id: 'Berdasarkan preferensi saya' },
  noPreferencesSet: {
    en: '(No preferences set - go to Settings to add them)',
    zh: '（未设置偏好——请前往设置添加）',
    id: '(Belum ada preferensi - buka Pengaturan untuk menambahkannya)',
  },

  // Reset password page
  resetPasswordTitle: { en: 'Set a new password', zh: '设置新密码', id: 'Atur Kata Sandi Baru' },
  resetPasswordDesc: {
    en: 'Choose a new password for your account. It must be at least 6 characters.',
    zh: '为您的账户设置新密码。密码至少需要6个字符。',
    id: 'Pilih kata sandi baru untuk akun Anda. Minimal 6 karakter.',
  },
  newPassword: { en: 'New password', zh: '新密码', id: 'Kata Sandi Baru' },
  confirmNewPassword: { en: 'Confirm new password', zh: '确认新密码', id: 'Konfirmasi Kata Sandi Baru' },
  resetPasswordBtn: { en: 'Reset password', zh: '重置密码', id: 'Atur Ulang Kata Sandi' },
  resetSuccess: {
    en: 'Password updated! You can now sign in with your new password.',
    zh: '密码已更新！您现在可以使用新密码登录。',
    id: 'Kata sandi diperbarui! Anda sekarang dapat masuk dengan kata sandi baru.',
  },
  resetFailed: { en: 'Reset failed', zh: '重置失败', id: 'Reset gagal' },
  resetTokenInvalid: {
    en: 'This reset link is invalid or has expired. Please request a new one.',
    zh: '此重置链接无效或已过期。请重新申请。',
    id: 'Tautan reset ini tidak valid atau telah kedaluwarsa. Silakan minta yang baru.',
  },
  passwordTooShort: {
    en: 'Password must be at least 6 characters',
    zh: '密码至少需要6个字符',
    id: 'Kata sandi minimal 6 karakter',
  },
  invalidToken: {
    en: 'Missing reset token. Please request a new link from the login page.',
    zh: '缺少重置令牌。请从登录页面重新申请链接。',
    id: 'Token reset tidak ada. Silakan minta tautan baru dari halaman masuk.',
  },
  demoResetLink: { en: 'Demo mode — reset link', zh: '演示模式——重置链接', id: 'Mode demo — tautan reset' },
  somethingWentWrong: {
    en: 'Something went wrong. Please try again.',
    zh: '出了点问题，请重试。',
    id: 'Terjadi kesalahan. Silakan coba lagi.',
  },

  // Reviews & ratings
  reviews: { en: 'Reviews', zh: '评价', id: 'Ulasan' },
  averageRating: { en: 'Average rating', zh: '平均评分', id: 'Rata-rata Penilaian' },
  noReviewsYet: {
    en: 'No reviews yet. Be the first to share your experience!',
    zh: '还没有评价。成为第一个分享体验的人吧！',
    id: 'Belum ada ulasan. Jadilah yang pertama berbagi pengalaman Anda!',
  },
  signInToReview: {
    en: 'Sign in to write a review',
    zh: '登录后写评价',
    id: 'Masuk untuk menulis ulasan',
  },
  writeAReview: { en: 'Write a review', zh: '写评价', id: 'Tulis Ulasan' },
  yourRating: { en: 'Your rating', zh: '您的评分', id: 'Penilaian Anda' },
  yourReview: { en: 'Your review', zh: '您的评价', id: 'Ulasan Anda' },
  reviewPlaceholder: {
    en: 'Share your experience — academics, campus life, location...',
    zh: '分享您的体验——学术、校园生活、地理位置……',
    id: 'Bagikan pengalaman Anda — akademik, kehidupan kampus, lokasi...',
  },
  submitReview: { en: 'Submit review', zh: '提交评价', id: 'Kirim Ulasan' },
  submitting: { en: 'Submitting...', zh: '提交中...', id: 'Mengirim...' },
  reviewSubmitted: { en: 'Review submitted — thank you!', zh: '评价已提交——谢谢！', id: 'Ulasan terkirim — terima kasih!' },
  reviewFailed: { en: 'Could not submit review. Please try again.', zh: '无法提交评价，请重试。', id: 'Tidak dapat mengirim ulasan. Silakan coba lagi.' },
  deleteReview: { en: 'Delete review', zh: '删除评价', id: 'Hapus Ulasan' },
  verifiedReviewer: { en: 'Verified', zh: '已认证', id: 'Terverifikasi' },
  ratingOutOf5: { en: 'out of 5', zh: '满分5分', id: 'dari 5' },

  // Application tracker
  applicationTracker: { en: 'Application Tracker', zh: '申请跟踪', id: 'Pelacak Aplikasi' },
  myApplications: { en: 'My Applications', zh: '我的申请', id: 'Aplikasi Saya' },
  noApplications: {
    en: 'No applications yet. Add universities you are applying to and track your progress.',
    zh: '还没有申请。添加您正在申请的大学并跟踪进度。',
    id: 'Belum ada aplikasi. Tambahkan universitas yang Anda lamar dan pantau progresnya.',
  },
  addApplication: { en: 'Add application', zh: '添加申请', id: 'Tambah Aplikasi' },
  selectUniversity: { en: 'Select a university...', zh: '选择大学...', id: 'Pilih universitas...' },
  selectStatus: { en: 'Select status', zh: '选择状态', id: 'Pilih status' },
  status: { en: 'Status', zh: '状态', id: 'Status' },
  notes: { en: 'Notes', zh: '备注', id: 'Catatan' },
  notesPlaceholder: {
    en: 'Deadlines, requirements, contacts...',
    zh: '截止日期、要求、联系方式……',
    id: 'Tenggat waktu, persyaratan, kontak...',
  },
  deleteApplication: { en: 'Delete application', zh: '删除申请', id: 'Hapus Aplikasi' },
  statusResearching: { en: 'Researching', zh: '调研中', id: 'Meneliti' },
  statusApplying: { en: 'Applying', zh: '申请中', id: 'Mendaftar' },
  statusSubmitted: { en: 'Submitted', zh: '已提交', id: 'Terkirim' },
  statusAccepted: { en: 'Accepted', zh: '已录取', id: 'Diterima' },
  statusRejected: { en: 'Rejected', zh: '被拒', id: 'Ditolak' },
  statusWaitlisted: { en: 'Waitlisted', zh: '候补名单', id: 'Daftar Tunggu' },
  daysLeft: { en: '{n} days left', zh: '还剩{n}天', id: '{n} hari lagi' },
  daysOverdue: { en: '{n} days overdue', zh: '已逾期{n}天', id: 'Terlambat {n} hari' },
  noDeadlineSet: { en: 'No deadline set', zh: '未设置截止日期', id: 'Belum ada tenggat waktu' },
  updatedOn: { en: 'Updated {date}', zh: '更新于{date}', id: 'Diperbarui {date}' },

  // Share
  share: { en: 'Share', zh: '分享', id: 'Bagikan' },
  copyLink: { en: 'Copy link', zh: '复制链接', id: 'Salin Tautan' },
  shareCompare: { en: 'Share this comparison', zh: '分享此对比', id: 'Bagikan Perbandingan Ini' },
  shareUniversity: { en: 'Share this university', zh: '分享此大学', id: 'Bagikan Universitas Ini' },
  linkCopied: { en: 'Link copied to clipboard!', zh: '链接已复制到剪贴板！', id: 'Tautan disalin ke papan klip!' },
};

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string, vars?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { appName } = useBrand();
  const [lang, setLang] = useState<Lang>('en');

  useEffect(() => {
    const stored = localStorage.getItem('lang') as Lang | null;
    if (stored === 'en' || stored === 'zh' || stored === 'id') {
      setLang(stored);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key: string, vars?: Record<string, string>) => {
    const entry = dict[key];
    if (!entry) return key;
    let text = entry[lang];
    if (vars) {
      Object.entries(vars).forEach(([k, v]) => {
        text = text.split(`{${k}}`).join(v);
      });
    }
    // Inject the configured brand name so UI strings never hardcode it.
    return subBrand(text, appName);
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
