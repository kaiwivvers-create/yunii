import type { Guide } from './guides';

/**
 * Per-guide content translations (中文 & Bahasa Indonesia).
 *
 * Sections are indexed to match `guide.sections` order. Every field falls back
 * to the English original when a translation is missing, so admin-created
 * guides and incomplete entries still render fine.
 */
export type Lang = 'en' | 'zh' | 'id';

interface LocalizedSection {
  headingZh?: string;
  headingId?: string;
  bodyZh?: string;
  bodyId?: string;
  listZh?: string[];
  listId?: string[];
}

interface GuideTranslations {
  titleId?: string;
  excerptId?: string;
  sections: LocalizedSection[];
}

const translations: Record<string, GuideTranslations> = {
  'how-to-build-a-strong-application': {
    titleId: 'Cara Membangun Aplikasi Universitas yang Kuat',
    excerptId:
      'Dari pernyataan pribadi hingga surat rekomendasi — formula yang membuat aplikasi Anda diperhatikan universitas top.',
    sections: [
      {
        headingZh: '先制定策略，而不是先写文书',
        bodyZh:
          '顶尖大学拒绝大多数申请者，不是因为他们不够优秀，而是因为他们目标不明确。在写下一个字之前，先制定策略：哪些专业真正适合你、你有什么与众不同之处、申请材料的每一部分如何支撑同一个故事。',
        headingId: 'Mulai dengan strategi, bukan esai',
        bodyId:
          'Universitas top menolak sebagian besar pelamar bukan karena mereka lemah, tetapi karena mereka tidak fokus. Sebelum menulis satu kata pun, susun strategi: program mana yang benar-benar cocok dengan profil Anda, apa yang membuat Anda berbeda, dan bagaimana setiap bagian aplikasi memperkuat satu cerita.',
      },
      {
        headingZh: '有效的个人陈述',
        listZh: [
          '以一个具体的时刻开头，而不是关于热情的陈词滥调',
          '用细节展示，而非空谈——一个生动的故事胜过三个形容词',
          '把你的故事与具体的专业和大学联系起来',
          '最后展望未来：你将贡献什么、成为什么样的人',
        ],
        headingId: 'Pernyataan pribadi yang berhasil',
        listId: [
          'Mulai dengan momen yang spesifik, bukan klise tentang gairah',
          'Tunjukkan, jangan katakan — satu anekdot hidup mengalahkan tiga kata sifat',
          'Hubungkan cerita Anda dengan program dan universitas yang spesifik',
          'Akhiri dengan melihat ke depan: apa yang akan Anda kontribusikan dan jadi',
        ],
      },
      {
        headingZh: '写对推荐信',
        bodyZh:
          '选择真正了解你的老师，而不只是头衔响亮的人。给他们一份简短的材料清单，列出你的主要成就、课程和抱负。一位数学老师写的详细、私人的推荐信，胜过校长写的千篇一律的推荐信。',
        headingId: 'Surat rekomendasi yang tepat',
        bodyId:
          'Pilih guru yang mengenal Anda secara pribadi, bukan hanya yang bergelar mengesankan. Beri mereka catatan singkat tentang pencapaian terbaik, mata kuliah, dan ambisi Anda. Surat yang detail dan personal dari guru matematika mengalahkan surat generik dari kepala sekolah.',
      },
      {
        headingZh: '要避免的常见错误',
        listZh: [
          '把同一篇文书提交给每一所大学',
          '忽视每个项目的具体要求',
          '错过早期申请的截止优势（滚动录取 / 提前决定）',
          '活动过多——深度胜过广度',
        ],
        headingId: 'Kesalahan umum yang harus dihindari',
        listId: [
          'Mengirim esai yang sama ke setiap universitas',
          'Mengabaikan persyaratan spesifik setiap program',
          'Melewatkan keuntungan tenggat awal (rolling / early decision)',
          'Terlalu banyak aktivitas — kedalaman mengalahkan keluasan',
        ],
      },
    ],
  },

  'understanding-tuition-and-living-costs': {
    titleId: 'Biaya Kuliah & Hidup: Berapa yang Sebenarnya Anda Bayar',
    excerptId:
      'Rincian biaya kuliah dan biaya hidup bulanan per negara — serta biaya tersembunyi yang sering dilupakan mahasiswa.',
    sections: [
      {
        headingZh: '学费出乎意料便宜的留学地',
        bodyZh:
          '德国和挪威的公立大学对国际学生几乎不收费或收费极少。相比之下，美国私立大学每年可超过6万美元——但慷慨的助学金往往能让实际支出大幅降低。',
        listZh: [
          '德国：公立大学每年约0–1,500欧元',
          '挪威：公立大学免费',
          '英国：每年9,250–47,000英镑，视身份而定',
          '美国私立：标价5万–7万美元（可申请资助）',
        ],
        headingId: 'Tempat dengan biaya kuliah (mengejutkan) terjangkau',
        bodyId:
          'Jerman dan Norwegia hampir tidak memungut biaya untuk kuliah di universitas negeri, bahkan untuk mahasiswa internasional. Sebaliknya, universitas swasta AS dapat melebihi $60.000 per tahun — tetapi bantuan finansial yang murah hati sering menurunkan biaya aktual secara signifikan.',
        listId: [
          'Jerman: ~€0–1.500 / tahun (negeri)',
          'Norwegia: gratis di universitas negeri',
          'Inggris: £9.250–£47.000 / tahun tergantung status',
          'Swasta AS: harga tercantum $50.000–$70.000 (ada bantuan)',
        ],
      },
      {
        headingZh: '按城市等级划分的生活成本',
        bodyZh:
          '房租是预算的最大头。伦敦、纽约和新加坡等城市的月总开销可达1,800–3,000美元；柏林、吉隆坡和布宜诺斯艾利斯则宽容得多，大约700–1,300美元。',
        headingId: 'Biaya hidup menurut tingkat kota',
        bodyId:
          'Sewa mendominasi anggaran Anda. Kota seperti London, New York, dan Singapura dapat menghabiskan $1.800–$3.000 per bulan; Berlin, Kuala Lumpur, dan Buenos Aires jauh lebih ramah di angka $700–$1.300.',
      },
      {
        headingZh: '需要预算的隐性费用',
        listZh: [
          '医疗保险（许多国家强制要求）',
          '签证及居留许可费用',
          '书籍、软件授权和实验费',
          '回国机票和旅行',
          '住宿押金',
        ],
        headingId: 'Biaya tersembunyi untuk dianggarkan',
        listId: [
          'Asuransi kesehatan (wajib di banyak negara)',
          'Biaya visa & izin tinggal',
          'Buku, lisensi perangkat lunak, dan biaya laboratorium',
          'Tiket pulang dan perjalanan',
          'Uang jaminan akomodasi',
        ],
      },
    ],
  },

  'student-visa-guide-2027': {
    titleId: 'Panduan Visa Pelajar: Langkah demi Langkah',
    excerptId:
      'Dokumen, garis waktu, dan wawancara di balik visa pelajar untuk destinasi studi paling populer.',
    sections: [
      {
        headingZh: '通用文件清单',
        listZh: [
          '有效护照（有效期超过课程结束日期6个月以上）',
          '大学的正式录取通知书 / CAS / I-20',
          '资金证明（银行流水、奖学金证明）',
          '签证申请表和缴费收据',
          '护照照片和翻译文件',
          '医疗保险证明（多个国家要求）',
        ],
        headingId: 'Daftar periksa dokumen universal',
        listId: [
          'Paspor berlaku (6+ bulan melewati tanggal akhir program)',
          'Surat penerimaan resmi / CAS / I-20 dari universitas',
          'Bukti dukungan finansial (rekening bank, beasiswa)',
          'Formulir aplikasi visa dan bukti pembayaran',
          'Foto paspor dan dokumen terjemahan',
          'Bukti asuransi kesehatan (wajib di beberapa negara)',
        ],
      },
      {
        headingZh: '各目的地的典型办理时间',
        bodyZh:
          '美国F-1签证：在课程开始前120天内申请，需参加领事馆面签，预留2–6周。英国学生签证：可提前6个月申请，通常3周内出结果。申根/欧洲学生签证：尽早预约——夏季名额很快爆满。',
        headingId: 'Garis waktu khas per destinasi',
        bodyId:
          'Visa F-1 AS: ajukan 120 hari sebelum program dimulai, hadiri wawancara di konsulat, beri waktu 2–6 minggu. Visa pelajar Inggris: ajukan hingga 6 bulan sebelumnya, biasanya diputuskan dalam 3 minggu. Visa pelajar Schengen/Eropa: pesan janji temu lebih awal — slot musim panas cepat penuh.',
      },
      {
        headingZh: '面签技巧',
        bodyZh:
          '签证官要确认你是真正的学生、毕业后会离开。即使没被问到也带齐所有文件，用英语自信作答，并准备好解释你将如何支付学费以及为什么选择这所大学。',
        headingId: 'Tips wawancara',
        bodyId:
          'Petugas ingin memastikan Anda adalah pelajar sungguhan yang akan pulang setelah lulus. Bawa semua dokumen meski tidak diminta, jawab dengan percaya diri dalam bahasa Inggris, dan siap menjelaskan bagaimana Anda membiayai studi serta mengapa memilih universitas ini.',
      },
    ],
  },

  'scholarships-for-international-students': {
    titleId: 'Beasiswa yang Benar-Benar Membiayai Studi di Luar Negeri',
    excerptId:
      'Beasiswa prestasi, kebutuhan, dan pemerintah — serta cara menemukan yang benar-benar Anda kualifikasi.',
    sections: [
      {
        headingZh: '三大类别',
        listZh: [
          '优秀奖学金——顶尖成绩、考试成绩或作品集',
          '助学金——根据家庭收入计算',
          '政府/第三方项目——志奋领、富布赖特、DAAD、CSC',
        ],
        headingId: 'Tiga kategori utama',
        listId: [
          'Beasiswa prestasi — nilai bagus, skor tes, atau portofolio',
          'Bantuan berbasis kebutuhan — hibah dihitung dari pendapatan keluarga',
          'Program pemerintah/negara ketiga — Chevening, Fulbright, DAAD, CSC',
        ],
      },
      {
        headingZh: '先去哪里找',
        bodyZh:
          '从大学自己的奖学金页面开始——许多学校会自动考虑申请人的优秀奖学金，无需单独申请。然后查看本国教育部和留学目的国使馆的双边协议。',
        headingId: 'Ke mana mencari terlebih dahulu',
        bodyId:
          'Mulai dari halaman beasiswa universitas itu sendiri — banyak sekolah otomatis mempertimbangkan pelamar untuk penghargaan prestasi, tanpa aplikasi terpisah. Lalu periksa kementerian pendidikan negara Anda dan kedutaan negara tujuan untuk perjanjian bilateral.',
      },
      {
        headingZh: '申请技巧',
        bodyZh:
          '政府奖学金的截止日期通常在入学前8–12个月。用表格记录每项奖学金的截止日期、要求和状态。申请之间可以复用和改编文书，但每次都要量身定制"为什么是你"的部分。',
        headingId: 'Tips aplikasi',
        bodyId:
          'Tenggat beasiswa pemerintah sering jatuh 8–12 bulan sebelum masuk. Simpan spreadsheet setiap beasiswa dengan tenggat, persyaratan, dan statusnya. Gunakan kembali dan sesuaikan esai antar aplikasi, tetapi selalu sesuaikan bagian "mengapa Anda" setiap kali.',
      },
    ],
  },

  'application-deadlines-explained': {
    titleId: 'Tenggat Aplikasi, Dipecahkan',
    excerptId:
      'Early action, rolling admissions, dan perbedaan nyata antar jenis tenggat — dengan rencana waktu yang menjaga Anda tetap di jalur.',
    sections: [
      {
        headingZh: '截止类型详解',
        listZh: [
          '提前决定（ED）——有约束力，只能申请一所学校',
          '提前行动（EA）——无约束力，提前出结果',
          '常规申请（RD）——标准截止日期',
          '滚动录取——随到随审；尽早申请',
        ],
        headingId: 'Jenis tenggat dijelaskan',
        listId: [
          'Early Decision (ED) — mengikat, hanya berlaku untuk satu sekolah',
          'Early Action (EA) — tidak mengikat, keputusan lebih awal',
          'Regular Decision (RD) — tenggat standar',
          'Rolling admissions — ditinjau saat aplikasi masuk; ajukan lebih awal',
        ],
      },
      {
        headingZh: '为什么提前很重要',
        bodyZh:
          '一些大学录取提前申请者的比例明显更高，仅仅因为申请池更小、更强。滚动录取的学校会随着时间推移而满额——等到截止日期再申请，可能就要再等一年。',
        headingId: 'Mengapa lebih awal itu penting',
        bodyId:
          'Beberapa universitas menerima porsi pelamar awal yang jauh lebih tinggi hanya karena kumpulan pelamarnya lebih kecil dan lebih kuat. Sekolah dengan rolling admissions penuh seiring berjalannya tahun — menunggu hingga tenggat bisa berarti menunggu setahun lagi.',
      },
      {
        headingZh: '一个简单有效的时间表',
        listZh: [
          '提前18–12个月：调研并筛选大学',
          '提前12–9个月：参加标准化考试，索取推荐信',
          '提前9–6个月：起草个人陈述，注册截止日期',
          '提前6–3个月：提交早期申请',
          '提前3–1个月：提交常规申请，完成资助表格',
        ],
        headingId: 'Garis waktu sederhana yang berhasil',
        listId: [
          '18–12 bulan sebelumnya: riset dan saring universitas',
          '12–9 bulan sebelumnya: ikuti tes standar, minta surat rekomendasi',
          '9–6 bulan sebelumnya: buat draf pernyataan pribadi, catat tenggat',
          '6–3 bulan sebelumnya: kirim aplikasi awal',
          '3–1 bulan sebelumnya: kirim aplikasi reguler, lengkapi formulir bantuan finansial',
        ],
      },
    ],
  },

  'studying-in-north-america-vs-europe': {
    titleId: 'Amerika Utara vs Eropa: Ke Mana Anda Harus Pergi?',
    excerptId:
      'Empat tahun hidup Anda — bandingkan biaya, kurikulum, kehidupan kampus, dan prospek karier di dua wilayah studi terpopuler.',
    sections: [
      {
        headingZh: '课程与灵活性',
        bodyZh:
          '美国和加拿大大学推行广泛的通识教育课程：你可以在大二换专业。欧洲项目通常从第一天起就高度专业化——选择工程或经济就直接深入。追求探索选广泛灵活，追求专注选专业细化。',
        headingId: 'Kurikulum dan fleksibilitas',
        bodyId:
          'Universitas AS dan Kanada mendorong kurikulum liberal arts yang luas: Anda bisa ganti jurusan di tahun kedua. Program Eropa biasanya terspesialisasi sejak hari pertama — Anda pilih teknik atau ekonomi dan langsung mendalaminya. Pilih fleksibilitas luas untuk eksplorasi, spesialisasi untuk fokus.',
      },
      {
        headingZh: '费用对比',
        bodyZh:
          '美国私立大学是世界上最贵的，但提供最多的助学金。欧洲公立大学便宜得多，德国、挪威等几个国家甚至免学费——生活成本成为你的主要预算项。',
        headingId: 'Perbandingan biaya',
        bodyId:
          'Universitas swasta AS adalah yang termahal di dunia tetapi menawarkan bantuan finansial terbanyak. Universitas negeri Eropa jauh lebih murah, dan beberapa negara (Jerman, Norwegia) bebas biaya kuliah — biaya hidup menjadi garis anggaran utama Anda.',
      },
      {
        headingZh: '校园生活与文化',
        bodyZh:
          '北美是经典的校园体验：宿舍、体育、社团，以及毕业后帮你找工作的强大校友网络。欧洲则有历史名城、国家间更便捷的旅行，以及通常更短的学制（三年制本科）让你更早进入职场。',
        headingId: 'Kehidupan kampus dan budaya',
        bodyId:
          'Amerika Utara adalah pengalaman kampus klasik: asrama, olahraga, klub, dan jaringan alumni kuat yang membantu pekerjaan setelah lulus. Eropa menawarkan kota bersejarah, perjalanan antar negara yang lebih mudah, dan program yang sering lebih pendek (sarjana 3 tahun) yang membawa Anda lebih cepat ke dunia kerja.',
      },
      {
        headingZh: '职业前景',
        bodyZh:
          '美国学位通常附带毕业生的OPT工作许可和庞大的科技/商业就业市场。欧洲的毕业工作签证——尤其是德国和英国——已变得慷慨，欧盟学位也能方便在整个欧洲大陆流动。',
        headingId: 'Hasil karier',
        bodyId:
          'Gelar AS sering datang dengan izin kerja OPT untuk lulusan dan pasar kerja teknologi/bisnis yang besar. Visa kerja pasca-studi Eropa — terutama di Jerman dan Inggris — telah menjadi murah hati, dan gelar UE memudahkan mobilitas di seluruh benua.',
      },
    ],
  },
};

/** Returns a localized copy of a guide (English passes through unchanged). */
export function localizeGuide(guide: Guide, lang: Lang): Guide {
  if (lang === 'en') return guide;
  const tr = translations[guide.slug];
  if (!tr) return guide;
  const isZh = lang === 'zh';
  return {
    ...guide,
    title: (isZh ? guide.titleZh : tr.titleId) || guide.title,
    excerpt: (isZh ? guide.excerptZh : tr.excerptId) || guide.excerpt,
    sections: guide.sections.map((s, i) => {
      const st = tr.sections[i];
      if (!st) return s;
      return {
        heading: (isZh ? st.headingZh : st.headingId) || s.heading,
        body: (isZh ? st.bodyZh : st.bodyId) || s.body,
        list: (isZh ? st.listZh : st.listId) || s.list,
      };
    }),
  };
}
