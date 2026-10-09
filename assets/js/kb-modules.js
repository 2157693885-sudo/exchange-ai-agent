/* =========================================================================
   来华交流全程助手 · 模块内容层 KBM v3.0
   ---------------------------------------------------------------------------
   职责：把已有 KB.MATTERS(27 条全周期事项) 重组进「学生端 5 板块」与
        「机构端 6 功能」，并补齐 KB 中缺失的校园/生活条目。
   入库规则（沿用 KB 约定）：
     1) 每条必须带 src（来源键），指向 KBM.SRC 或 KB.SRC
     2) S1＝法规/政府一手；S2＝官方发布转载；S3＝公开办事指引（需属地复核）
     3) 无来源不入库；S3 级一律显示「待属地复核」
     4) 涉及签证/医疗/心理支持的内容必须提供官方渠道，不做替代式决策
   多语种约定（沿用项目既有）：
     - 中文为权威源，英文同步；非中英语种回退英文并标注「待人工复核」
     - 因此每条长文本同时提供 中文 / 英文 两个字段
   ========================================================================= */

window.KBM = (function () {
  "use strict";

  var UPDATED = "2026-09-27";

  /* ---------- 来源 ---------- */
  var SRC = {
    moe_intl: { name: "教育部 · 来华留学相关规范", name_en: "MOE · Regulations on international students in China", org: "教育部", org_en: "Ministry of Education", url: "http://www.moe.gov.cn/", level: "S1", checked: UPDATED },
    csc_intl: { name: "国家留学网 · 来华留学", name_en: "CSC · Study in China", org: "国家留学基金管理委员会", org_en: "China Scholarship Council", url: "https://www.csc.edu.cn/", level: "S1", checked: UPDATED },
    nia_plat: { name: "国家移民管理局政务服务平台", name_en: "NIA government service platform", org: "国家移民管理局", org_en: "National Immigration Administration", url: "https://s.nia.gov.cn/", level: "S1", checked: UPDATED },
    nia_12367: { name: "国家移民管理局 12367 服务平台", name_en: "NIA 12367 service platform", org: "国家移民管理局", org_en: "National Immigration Administration", url: "https://www.nia.gov.cn/", level: "S1", checked: UPDATED },
    pbc_pay: { name: "中国人民银行 · 境外来华人员支付服务指引", name_en: "PBoC · Payment service guide for overseas visitors", org: "中国人民银行", org_en: "People's Bank of China", url: "https://www.pbc.gov.cn/", level: "S1", checked: UPDATED },
    customs: { name: "海关总署 · 进出境旅客通关指南", name_en: "GACC · Customs guide for travellers", org: "海关总署", org_en: "General Administration of Customs", url: "https://www.customs.gov.cn/", level: "S1", checked: UPDATED },
    ncha: { name: "国家卫生健康委员会 · 出入境健康要求", name_en: "NHC · Health requirements for entry and exit", org: "国家卫健委", org_en: "National Health Commission", url: "http://www.nhc.gov.cn/", level: "S1", checked: UPDATED },
    school_iso: { name: "所在高校国际学生办公室办事指引", name_en: "Your university's International Student Office guide", org: "所在高校", org_en: "Your university", url: "", level: "S3", checked: UPDATED, note: "由机构端在「知识库管理」中录入本校口径后生效" },
    school_reg: { name: "所在高校教务处 / 学籍管理公开信息", name_en: "Your university's academic affairs / records information", org: "所在高校", org_en: "Your university", url: "", level: "S3", checked: UPDATED, note: "课表、校历、学籍异动以本校门户为准" },
    school_lib: { name: "所在高校图书馆公开服务说明", name_en: "Your university library's public service guide", org: "所在高校", org_en: "Your university", url: "", level: "S3", checked: UPDATED },
    city_gov: { name: "所在城市人民政府 / 政务服务网公开信息", name_en: "Your city government / government service portal", org: "属地政府", org_en: "Local government", url: "", level: "S3", checked: UPDATED, note: "交通、租房、公共服务属地口径" },
    public_110: { name: "公安 / 消防 / 急救 / 涉外服务热线", name_en: "Police / fire / ambulance / foreign-affairs hotlines", org: "公安部等", org_en: "Ministry of Public Security and others", url: "https://www.gov.cn/", level: "S1", checked: UPDATED, note: "110 报警 · 119 火警 · 120 急救 · 12367 移民服务" }
  };

  /* =======================================================================
     一、学生端 · 5 个板块
     ======================================================================= */
  var MODULES = [
    { id: "home", icon: "home", nav: "mHome" },
    { id: "guide", icon: "plane", nav: "mGuide" },
    { id: "campus", icon: "book2", nav: "mCampus" },
    { id: "daily", icon: "heart", nav: "mDaily" },
    { id: "mine", icon: "users", nav: "mMine" }
  ];

  /* ---------- 板块 2 · 访华指南：把 27 条事项按「入境前后」重组 ---------- */
  var GUIDE_GROUPS = [
    { id: "g1", icon: "doc",
      title: "签证与行前文件", title_en: "Visa and pre-departure documents",
      desc: "出发前必须拿到的许可与凭证", desc_en: "Permits and certificates you must obtain before departure",
      matters: ["pre_visa", "pre_physical", "pre_insurance", "pre_money", "pre_luggage"] },
    { id: "g2", icon: "key",
      title: "入境 24 小时与报到", title_en: "First 24 hours and enrolment",
      desc: "落地后最紧张的时间窗口", desc_en: "The tightest window right after landing",
      matters: ["arr_reg24", "arr_school", "arr_safety"] },
    { id: "g3", icon: "shield",
      title: "居留许可与体检核验", title_en: "Residence permit and health checks",
      desc: "决定你能合法待多久的一步", desc_en: "This step decides how long you may legally stay",
      matters: ["arr_residence", "arr_physical_cn"] },
    { id: "g4", icon: "wallet",
      title: "落地生活开通", title_en: "Getting set up to live",
      desc: "钱、号码、卡、网络", desc_en: "Money, phone number, cards and network",
      matters: ["arr_bank", "arr_sim", "arr_campus"] },
    { id: "g5", icon: "clock",
      title: "在学期间的续办与变更", title_en: "Renewals and changes during your studies",
      desc: "延期、变更、出行、实习边界", desc_en: "Extensions, changes, travel and internship limits",
      matters: ["stu_renew", "stu_change", "stu_travel", "stu_intern"] },
    { id: "g6", icon: "right",
      title: "离境前后", title_en: "Before and after departure",
      desc: "离校、证书、账户与再次来华", desc_en: "Leaving school, certificates, accounts and returning",
      matters: ["exi_prepare", "exi_cert", "exi_bank", "exi_visa", "exi_return"] }
  ];

  /* ---------- 板块 3 · 校园学习 ---------- */
  /* 设计原则：不宣称已打通各校教务系统。分三层，产品内如实标注当前所处层级。 */
  var CAMPUS_TIERS = [
    { id: "t1", level: 1, status: "已实现", status_en: "Implemented",
      name: "轻量演示版", name_en: "Lightweight demo",
      desc: "提供各官方系统入口链接，助手说明「每个入口怎么用、先办哪个」",
      desc_en: "Provides official entry links and explains what each portal does and which to use first" },
    { id: "t2", level: 2, status: "待合作", status_en: "Pending partnership",
      name: "试点授权版", name_en: "Pilot authorised",
      desc: "与本校国际学生事务部门合作，经单点登录或授权链接跳转",
      desc_en: "Cooperation with your university's international office, via single sign-on or authorised links" },
    { id: "t3", level: 3, status: "待授权", status_en: "Pending authorisation",
      name: "接口对接版", name_en: "API integration",
      desc: "获授权后只读必要的公开或个人状态信息（报到进度 / 校历 / 通知），不改动教务数据",
      desc_en: "With authorisation, read-only access to necessary public or personal status (enrolment progress, calendar, notices); never modifies academic records" }
  ];

  var CAMPUS = [
    { id: "c_reg", icon: "building", tier: 1, src: "school_iso",
      title: "报到注册与学籍", title_en: "Enrolment and student records",
      desc: "新生报到、学期注册、学籍异动。助手指明办理顺序与所需证件，并跳转本校门户。",
      desc_en: "New-student check-in, term registration and record changes. The assistant gives the order and required documents, then links to your university portal.",
      links: [{ name: "本校国际学生办公室", name_en: "International Student Office", url: "" }, { name: "本校教务处 / 研究生院", name_en: "Academic Affairs / Graduate School", url: "" }] },
    { id: "c_course", icon: "list", tier: 1, src: "school_reg",
      title: "课表与选课", title_en: "Timetable and course selection",
      desc: "查看培养方案、选课入口、调课流程。课程数据以本校系统为准，助手只做入口导航。",
      desc_en: "Curriculum, course selection and schedule changes. Course data lives in your university system; the assistant only navigates you there.",
      links: [{ name: "本校教务系统选课入口", name_en: "Course selection portal", url: "" }] },
    { id: "c_card", icon: "wallet", tier: 1, src: "school_iso",
      title: "校园卡", title_en: "Campus card",
      desc: "办卡、充值、挂失、门禁与食堂消费。部分高校校园卡与图书馆借阅、宿舍门禁一体。",
      desc_en: "Issuing, topping up, reporting lost, door access and canteen payment. At some universities the campus card also covers library borrowing and dormitory access.",
      links: [{ name: "本校校园卡服务中心", name_en: "Campus card service centre", url: "" }] },
    { id: "c_lib", icon: "book", tier: 1, src: "school_lib",
      title: "图书馆", title_en: "Library",
      desc: "借阅规则、电子资源访问、座位预约。留学生常见问题：校外访问数据库需先激活统一身份认证。",
      desc_en: "Borrowing rules, e-resource access and seat booking. Common issue for international students: off-campus database access requires activating unified identity authentication first.",
      links: [{ name: "本校图书馆", name_en: "University library", url: "" }] },
    { id: "c_cal", icon: "clock", tier: 1, src: "school_reg",
      title: "校历与假期", title_en: "Academic calendar and holidays",
      desc: "学期起止、考试周、法定节假日与寒暑假。签证/居留许可的时间安排要与校历对齐，避免假期窗口办不了业务。",
      desc_en: "Term dates, exam weeks, public holidays and breaks. Align your visa or permit timeline with the calendar, since offices may be closed during holidays.",
      links: [{ name: "本校校历", name_en: "Academic calendar", url: "" }] },
    { id: "c_rule", icon: "doc", tier: 1, src: "school_reg",
      title: "学术规范与考纪", title_en: "Academic integrity and exam rules",
      desc: "引用规范、独立完成要求、缺勤与缓考、学术不端后果。涉及学籍处理，务必以本校规定原文为准。",
      desc_en: "Citation rules, independent-work requirements, absence and deferred exams, and consequences of misconduct. These affect your student status, so always follow your university's original regulations.",
      links: [{ name: "本校学生手册 / 学术规范", name_en: "Student handbook / academic rules", url: "" }] },
    { id: "c_cn", icon: "translate", tier: 1, src: "school_iso",
      title: "中文学习", title_en: "Learning Chinese",
      desc: "校内汉语课程、HSK 考点与分级建议，以及办事场景常用句（挂号、报警、办证）。",
      desc_en: "On-campus Chinese courses, HSK test centres and level advice, plus practical phrases for registration, police and medical visits.",
      links: [{ name: "本校国际教育学院 / 汉语中心", name_en: "Chinese language centre", url: "" }, { name: "HSK 官方考试服务", name_en: "HSK official test service", url: "https://www.chinesetest.cn/" }] }
  ];

  /* ---------- 板块 4 · 日常生活（refs 指向 KB.MATTERS 的 id）---------- */
  var DAILY = [
    { id: "d_diet", icon: "heart", src: "school_iso", refs: ["stu_diet"],
      title: "饮食与特殊需求", title_en: "Diet and special needs",
      desc: "清真、素食、忌口与过敏的沟通方式，食堂与外卖的标注习惯。",
      desc_en: "How to communicate halal, vegetarian, dietary restrictions and allergies; how canteens and delivery apps label food." },
    { id: "d_faith", icon: "globe", src: "school_iso", refs: ["stu_faith"],
      title: "宗教习俗与合法场所", title_en: "Religious practice and lawful venues",
      desc: "礼拜场所的合法渠道、宗教活动边界、校园内的饮食与作息适配。",
      desc_en: "Lawful places of worship, the boundaries of religious activity on campus, and adapting diet and schedules." },
    { id: "d_med", icon: "hospital", src: "ncha", refs: ["stu_medical"],
      title: "就医与费用结算", title_en: "Seeing a doctor and settling bills",
      desc: "校医院→属地医院的就诊顺序、挂号方式、保险理赔材料、常用就医语句。",
      desc_en: "Order of visits from campus clinic to local hospital, how to register, insurance claim documents and useful medical phrases." },
    { id: "d_pay", icon: "wallet", src: "pbc_pay", refs: ["arr_bank", "pre_money"],
      title: "支付与银行", title_en: "Payments and banking",
      desc: "境外卡绑定、移动支付开通、取现与跨境汇款。",
      desc_en: "Linking foreign cards, activating mobile payment, cash withdrawal and cross-border transfers." },
    { id: "d_sim", icon: "globe", src: "school_iso", refs: ["arr_sim"],
      title: "手机号与网络", title_en: "Phone number and internet",
      desc: "实名开卡所需证件、套餐选择、校园网认证。",
      desc_en: "Documents needed for a real-name SIM, choosing a plan and campus network authentication." },
    { id: "d_travel", icon: "plane", src: "city_gov", refs: ["stu_travel"],
      title: "交通与出行", title_en: "Transport and travel",
      desc: "地铁公交、实名购票、打车软件、共享出行。远行前注意居留许可与证件状态。",
      desc_en: "Metro and buses, real-name ticketing, ride-hailing and shared bikes. Check your permit and document status before travelling far." },
    { id: "d_rent", icon: "building", src: "city_gov", refs: ["arr_reg24"],
      title: "租房与住宿", title_en: "Renting and accommodation",
      desc: "校外租房须办理住宿登记；签约前确认房东配合登记、合同期限与退租条款。",
      desc_en: "Off-campus renting requires accommodation registration. Before signing, confirm the landlord will cooperate with registration, and check the term and exit clauses." },
    { id: "d_psych", icon: "chat", src: "school_iso", refs: ["stu_psych"],
      title: "心理支持与跨文化适应", title_en: "Mental health and cultural adjustment",
      desc: "校内心理咨询预约、常见适应期反应、可用的多语种支持渠道。",
      desc_en: "Booking campus counselling, common adjustment reactions and available multilingual support channels." },
    { id: "d_safe", icon: "alert", src: "public_110", refs: ["arr_safety", "stu_lostpass"],
      title: "安全与防骗", title_en: "Safety and scams",
      desc: "常见诈骗话术（冒充使领馆 / 公检法 / 换汇）、紧急联系方式、护照遗失应急。",
      desc_en: "Common scam scripts (fake embassies, police or currency exchange), emergency contacts and what to do if your passport is lost." },
    { id: "d_social", icon: "users", src: "school_iso", refs: [],
      title: "社团与社交", title_en: "Clubs and social life",
      desc: "国际学生社团、语伴项目、志愿活动与城市文化体验。",
      desc_en: "International student societies, language partner programmes, volunteering and city culture." }
  ];

  /* ---------- 板块 5 · 我的 ---------- */
  var MINE = {
    actions: [
      { id: "m_id", icon: "doc", title: "证件有效期", title_en: "Document expiry", desc: "护照、签证、居留许可到期日与提醒设置", desc_en: "Expiry dates and reminders for your passport, visa and residence permit" },
      { id: "m_list", icon: "list", title: "我的清单", title_en: "My checklist", desc: "全部待办与已完成事项，可导出 PDF", desc_en: "All open and completed tasks; exportable to PDF" },
      { id: "m_star", icon: "heart", title: "收藏", title_en: "Saved", desc: "收藏的指南、问答与链接", desc_en: "Guides, answers and links you saved" },
      { id: "m_lang", icon: "globe", title: "语言", title_en: "Language", desc: "界面语言：中 / 英 / 俄 / 阿 / 法 / 西", desc_en: "Interface language: Chinese, English, Russian, Arabic, French, Spanish" },
      { id: "m_notify", icon: "bell", title: "通知与提醒", title_en: "Notifications", desc: "到期提醒、材料更新提醒的开关与提前量", desc_en: "Toggle expiry and content-update reminders and set how early" },
      { id: "m_privacy", icon: "lock", title: "隐私与授权", title_en: "Privacy and authorisation", desc: "数据存储位置、清除本地数据、AI 生成内容标识说明", desc_en: "Where data lives, how to erase it, and how AI-generated content is labelled" }
    ]
  };

  /* ---------- 紧急联系（首页常驻）---------- */
  var EMERGENCY = [
    { label: "报警", label_en: "Police", num: "110", note: "刑事案件、被盗、人身安全", note_en: "Crime, theft, personal safety" },
    { label: "急救", label_en: "Ambulance", num: "120", note: "突发疾病、受伤", note_en: "Sudden illness or injury" },
    { label: "火警", label_en: "Fire", num: "119", note: "火灾、被困", note_en: "Fire or being trapped" },
    { label: "移民管理服务", label_en: "Immigration service", num: "12367", note: "签证、居留许可、住宿登记政策咨询", note_en: "Visa, permit and accommodation-registration enquiries" },
    { label: "领事保护（本国使领馆）", label_en: "Consular protection (your embassy)", num: "—", note: "护照遗失、重大事故时联系本国驻华使领馆", note_en: "Contact your embassy in China if your passport is lost or in a serious incident" },
    { label: "校内应急（国际学生办公室）", label_en: "Campus emergency (International Office)", num: "—", note: "由机构端录入本校 24 小时值班电话", note_en: "Entered by staff as the university's 24-hour duty line" }
  ];

  /* ---------- 今日待办生成规则 ----------
     anchor: arrival | enroll | permit  —— permit 必须由用户提供到期日，不做推算
     offset 相对 anchor 的天数（negative 表示提前） */
  var TODO_RULES = [
    { id: "t_reg24", refs: ["arr_reg24"], anchor: "arrival", offset: 1, pri: "high" },
    { id: "t_school", refs: ["arr_school"], anchor: "enroll", offset: 0, pri: "high" },
    { id: "t_perm", refs: ["arr_residence"], anchor: "arrival", offset: 30, pri: "high" },
    { id: "t_med", refs: ["arr_physical_cn"], anchor: "arrival", offset: 30, pri: "mid" },
    { id: "t_bank", refs: ["arr_bank", "arr_sim", "arr_campus"], anchor: "arrival", offset: 14, pri: "mid" },
    { id: "t_renew", refs: ["stu_renew"], anchor: "permit", offset: -30, pri: "high" },
    { id: "t_exit", refs: ["exi_prepare", "exi_cert", "exi_bank", "exi_visa"], anchor: "arrival", offset: 300, pri: "mid" }
  ];

  /* =======================================================================
     二、机构端 · 6 个功能
     ======================================================================= */
  var ORG_FEATURES = [
    { id: "new", icon: "plus", title: "新建材料", title_en: "New material", desc: "选生源国 / 项目类型 / 语种，一键起稿", desc_en: "Pick source country, programme type and language; draft in one click" },
    { id: "country", icon: "globe", title: "国别指南生成器", title_en: "Country guide generator", desc: "生成某国学生来华指南，自动含签证、住宿、保险、饮食、宗教习俗、交通", desc_en: "Generate a country guide covering visas, housing, insurance, diet, religious customs and transport" },
    { id: "notice", icon: "bell", title: "清单与通知生成", title_en: "Checklist and notice generator", desc: "行前清单、报到提醒、居留许可提醒、放假通知、离境须知", desc_en: "Pre-departure checklists, enrolment and permit reminders, holiday notices and departure guides" },
    { id: "faq", icon: "chat", title: "FAQ 与回复生成", title_en: "FAQ and reply generator", desc: "依据本校官方材料生成常见问答，或起草多语种回复", desc_en: "Generate FAQs from your university's own materials, or draft multilingual replies" },
    { id: "kb", icon: "book", title: "知识库管理", title_en: "Knowledge base", desc: "录入本校通知与公开链接，设置来源、适用对象与有效期", desc_en: "Add university notices and public links with source, audience and validity window" },
    { id: "share", icon: "copy", title: "预览与分享", title_en: "Preview and share", desc: "学生视角预览 → 生成网页 / 二维码 / PDF → 教师确认后发布", desc_en: "Preview as a student, then export as a page, QR code or PDF; publish only after staff approval" }
  ];

  /* 材料类型：tpl 指向 KB.TEMPLATES 的既有模板 id，直接复用 Agent.renderMaterial */
  var MATERIAL_TYPES = [
    { id: "guide", tpl: "t_guide", icon: "globe", group: "country", title: "国别来华指南", title_en: "Country guide", desc: "面向某一生源国的完整适应指南", desc_en: "A complete adaptation guide for one source country" },
    { id: "preset", tpl: "t_checklist", icon: "list", group: "notice", title: "行前清单", title_en: "Pre-departure checklist", desc: "出发前需备齐的证件与物品", desc_en: "Documents and items to prepare before departure" },
    { id: "notice", tpl: "t_notice", icon: "bell", group: "notice", title: "通知公告", title_en: "Notice", desc: "报到、延期、放假、离境等通知", desc_en: "Notices for enrolment, extensions, holidays and departure" },
    { id: "faqdoc", tpl: "t_faq", icon: "chat", group: "faq", title: "常见问答（FAQ）", title_en: "Frequently asked questions", desc: "依据本校官方材料生成问答对", desc_en: "Q&A pairs generated from your university's materials" },
    { id: "brief", tpl: "t_brief", icon: "users", group: "faq", title: "迎新简报", title_en: "Orientation brief", desc: "迎新会与说明会的统一口径", desc_en: "A consistent script for orientation sessions" },
    { id: "emerg", tpl: "t_emergency", icon: "alert", group: "new", title: "应急处置卡", title_en: "Emergency card", desc: "护照遗失、就医、突发状况的一页指引", desc_en: "A one-page guide for lost passports, medical visits and emergencies" }
  ];

  /* 语种清单（与 KB.LANGS 对齐，此处只列出机构端可发布语种） */
  var PUBLISH_LANGS = ["zh", "en", "ru", "ar", "fr", "es", "vi", "th", "my", "ms"];

  /* 本地化取值：中文取原字段，其余语种取 _en（无则回退中文） */
  function L(obj, field) {
    if (!obj) return "";
    var isZh = String((window.L10N && window.L10N.current) || "zh").slice(0, 2) === "zh";
    if (isZh) return obj[field] || "";
    return obj[field + "_en"] || obj[field] || "";
  }

  return {
    UPDATED: UPDATED,
    SRC: SRC,
    MODULES: MODULES,
    GUIDE_GROUPS: GUIDE_GROUPS,
    CAMPUS_TIERS: CAMPUS_TIERS,
    CAMPUS: CAMPUS,
    DAILY: DAILY,
    MINE: MINE,
    EMERGENCY: EMERGENCY,
    TODO_RULES: TODO_RULES,
    ORG_FEATURES: ORG_FEATURES,
    MATERIAL_TYPES: MATERIAL_TYPES,
    PUBLISH_LANGS: PUBLISH_LANGS,
    L: L,
    src: function (key) {
      return SRC[key] || (window.KB && window.KB.SRC ? window.KB.SRC[key] : null) || null;
    }
  };
})();
