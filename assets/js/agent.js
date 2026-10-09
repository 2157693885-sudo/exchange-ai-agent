/* =========================================================================
   来华交流全程助手 · Agent 能力层 v2.0
   ---------------------------------------------------------------------------
   架构（可解释、可复核、可替换）：
     接入层  → 意图识别 Intent
     画像层  → 画像读取 Profile
     知识层  → 知识检索 Retrieval（来源锚定，无来源不入库）
     规则层  → 规则判定 Rule Engine（法定时限 → 你的关键日期）
     生成层  → 内容生成 Generation（路径 / 清单 / 多语种材料）
     合规层  → 合规复核 Compliance（证据等级 + AI 标识 + 人工复核入口）
   说明：本演示版将"Agent 能力"实现为可解释流水线；接口层预留大模型接入点
        （Agent.LLM_ADAPTER），替换实现不影响上层调用。
   ========================================================================= */

window.Agent = (function () {
  "use strict";

  var LLM_ADAPTER = null; /* 预留：接入大模型时注入 { complete: function(prompt){ return Promise } } */
  /* HTML 转义（本模块内统一使用；UI.esc 亦可用但此处保持模块自足） */
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (m) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[m]; }); }

  /* ================= 0. LLM 桥（本地代理 · 真模型问答） =================
     说明：线上静态版默认走下方规则引擎；本机运行 agent-bridge 代理时自动
           切换到真实大模型（MiniMax），知识检索结果作为 RAG 上下文注入，
           回答仍带来源与「待人工复核」标识。 */
  var BRIDGE = "http://127.0.0.1:8787";
  var _bridgeOk = null;
  var _bridgeAt = 0;
  function setBridge(url) { if (url) BRIDGE = url; _bridgeOk = null; }
  /* 异步探测（file:// 页面禁止同步跨源 XHR，必须用异步） */
  function bridgeProbe() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", BRIDGE + "/health", true);
    xhr.timeout = 2500;
    xhr.onreadystatechange = function () {
      if (xhr.readyState !== 4) return;
      if (xhr.status === 200) {
        try { var j = JSON.parse(xhr.responseText); _bridgeOk = !!(j && j.ok); } catch (e) { _bridgeOk = false; }
      } else { _bridgeOk = false; }
      _bridgeAt = Date.now();
    };
    xhr.onerror = function () { _bridgeOk = false; _bridgeAt = Date.now(); };
    xhr.ontimeout = function () { _bridgeOk = false; _bridgeAt = Date.now(); };
    try { xhr.send(null); } catch (e) { _bridgeOk = false; _bridgeAt = Date.now(); }
  }
  function ensureBridge() {
    if (_bridgeOk === null) bridgeProbe();
    else if (Date.now() - _bridgeAt > 8000) bridgeProbe();
  }
  function bridgeOk() {
    if (_bridgeOk !== null && Date.now() - _bridgeAt < 8000) return _bridgeOk;
    if (_bridgeOk === null) { bridgeProbe(); return false; } /* 首次探测中，先按离线兜底 */
    return _bridgeOk;
  }
  function llmChat(messages, lang, systemExtra) {
    return new Promise(function (resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open("POST", BRIDGE + "/chat", true);
      xhr.setRequestHeader("Content-Type", "application/json");
      xhr.timeout = 60000;
      xhr.onreadystatechange = function () {
        if (xhr.readyState !== 4) return;
        if (xhr.status === 200) {
          try { resolve(JSON.parse(xhr.responseText)); } catch (e) { reject(e); }
        } else { reject(new Error("bridge http " + xhr.status)); }
      };
      xhr.onerror = function () { reject(new Error("bridge unreachable")); };
      xhr.ontimeout = function () { reject(new Error("bridge timeout")); };
      xhr.send(JSON.stringify({ messages: messages, lang: lang, systemExtra: systemExtra || "" }));
    });
  }

  /* ================= 1. 意图识别 ================= */
  var INTENTS = [
    { id: "register", kw: ["住宿登记", "登记", "报备", "派出所", "24小时", "24 小时", "留宿", "register", "accommodation", "police", "address"], matter: "arr_reg24" },
    { id: "residence", kw: ["居留许可", "居留", "签证延期", "延期", "续签", "30天", "residence permit", "extend", "visa"], matter: "stu_renew" },
    { id: "enroll", kw: ["报到", "注册", "入学", "新生", "学生证", "enrol", "register at", "student card"], matter: "arr_school" },
    { id: "medical", kw: ["体检", "医疗", "就医", "医院", "看病", "医保", "medical", "hospital", "doctor", "health"], matter: "stu_medical" },
    { id: "insurance", kw: ["保险", "理赔", "insurance", "claim"], matter: "pre_insurance" },
    { id: "payment", kw: ["支付", "银行卡", "开户", "汇款", "绑定", "扫码", "payment", "bank", "card", "remittance"], matter: "arr_bank" },
    { id: "sim", kw: ["手机号", "电话卡", "sim", "漫游", "esim", "网络"], matter: "arr_sim" },
    { id: "work", kw: ["实习", "兼职", "打工", "勤工", "就业", "intern", "part-time", "work permit", "job"], matter: "stu_intern" },
    { id: "faith", kw: ["宗教", "信仰", "清真寺", "礼拜", "religion", "faith", "mosque", "prayer", "church", "temple"], matter: "stu_faith" },
    { id: "diet", kw: ["饮食", "吃", "清真", "素食", "过敏", "餐厅", "食堂", "food", "diet", "halal", "vegetarian", "allergy"], matter: "stu_diet" },
    { id: "psych", kw: ["心理", "情绪", "焦虑", "孤独", "适应", "咨询", "mental", "anxiety", "lonely", "counsel"], matter: "stu_psych" },
    { id: "lostpass", kw: ["护照丢", "遗失", "被盗", "报案", "lost passport", "stolen", "report"], matter: "stu_lostpass" },
    { id: "travel", kw: ["火车", "机票", "出行", "旅游", "交通", "travel", "train", "flight", "ticket"], matter: "stu_travel" },
    { id: "exit", kw: ["离校", "退宿", "离境", "毕业", "证书", "成绩单", "认证", "graduation", "departure", "transcript", "diploma"], matter: "exi_prepare" },
    { id: "visa_apply", kw: ["签证", "x1", "x2", "jw201", "jw202", "邀请函", "visa", "invitation"], matter: "pre_visa" },
    { id: "transit", kw: ["过境免签", "240", "免签", "transit", "visa-free"], matter: "arr_reg24" },
    { id: "change", kw: ["变更", "换护照", "地址变更", "转学", "change", "new passport"], matter: "stu_change" },
    { id: "emergency", kw: ["紧急", "报警", "急救", "110", "120", "emergency", "urgent"], matter: "arr_safety" },
    { id: "safety", kw: ["安全", "注意", "防骗", "诈骗", "safety", "fraud", "scam"], matter: "arr_safety" }
  ];

  function classify(text) {
    var q = (text || "").toLowerCase().trim();
    if (!q) return { intent: "unknown", score: 0, hits: [] };
    var best = { intent: "unknown", score: 0, hits: [], matter: null };
    INTENTS.forEach(function (it) {
      var hits = it.kw.filter(function (k) { return q.indexOf(k.toLowerCase()) >= 0; });
      var s = hits.length;
      /* 长关键词加权，避免"吃"这类单字误命中 */
      hits.forEach(function (h) { if (h.length >= 4) s += 0.8; });
      if (s > best.score) best = { intent: it.id, score: s, hits: hits, matter: it.matter };
    });
    /* 程序性提问兜底 */
    if (best.score === 0) {
      var proc = ["怎么办", "怎么", "如何", "需要", "多久", "什么时候", "材料", "流程", "how", "what", "when", "need", "process"];
      if (proc.some(function (k) { return q.indexOf(k) >= 0; })) best.intent = "procedure";
    }
    return best;
  }

  /* ================= 2. 知识检索（来源锚定的轻量打分） ================= */
  var TRANSIT_RE = /过境|免签|240|transit|visa[\s-]*free/;
  function bigrams(s) {
    s = (s || "").replace(/[\s，。、？：；（）()「」"'"',.!?;:\[\]]/g, "").toLowerCase();
    var out = [];
    for (var i = 0; i < s.length - 1; i++) out.push(s.substr(i, 2));
    return out;
  }
  function score(query, doc) {
    var qb = bigrams(query), db = bigrams(doc);
    if (!qb.length || !db.length) return 0;
    var dset = {};
    db.forEach(function (b) { dset[b] = (dset[b] || 0) + 1; });
    var hit = 0;
    qb.forEach(function (b) { if (dset[b]) hit++; });
    var norm = Math.sqrt(qb.length * db.length) || 1;
    return hit / norm;
  }
  /* ================= 1.5 校本库（机构端「AI 提炼导入」维护，localStorage ea2_localKb） =================
     学生端检索时并入校本条目并加权优先：机构上传的本校口径优先于内置通用口径，
     回答带「校本」标识与机构来源，满足"机构传了就从机构数据取"的优先级链路。 */
  function localKbItems() {
    /* 归一化：校本条目统一补 S3 哨兵来源（school），供统计/渲染复用；
       无 source 的旧条目与预置条目均由此补齐。 */
    function ensure(arr) {
      return arr.map(function (x) {
        if (!x || x.source) return x;
        var c = {};
        for (var k in x) c[k] = x[k];
        c.source = ["school"];
        return c;
      });
    }
    try {
      var v = localStorage.getItem("ea2_localKb");
      var arr = v ? JSON.parse(v) : [];
      if (Array.isArray(arr) && arr.length) return ensure(arr);
    } catch (e) {}
    /* 未自建校本库时：预置试点示例库（中山大学，S3 待复核）并落盘，供机构端统一管理；
       机构端一旦通过「AI 提炼导入」保存自有数据，localStorage 有值即自动让位。 */
    if (window.SYSU_PRESET_KB && window.SYSU_PRESET_KB.length) {
      var presets = ensure(window.SYSU_PRESET_KB);
      try { localStorage.setItem("ea2_localKb", JSON.stringify(presets)); } catch (e2) {}
      return presets;
    }
    return [];
  }

  /* 意图门控检索：命中明确意图时给对应事项加权；过境免签条目只在用户明确询问时召回，
     避免"学习签证"类问题被"240小时过境免签"等高相似文本干扰。 */
  function retrieve(query, topK, intent) {
    topK = topK || 4;
    var pool = [];
    var intentMatter = intent && intent.matter;
    var qHasTransit = TRANSIT_RE.test(query);
    window.KB.MATTERS.forEach(function (m) {
      var doc = [];
      Object.keys(m).forEach(function (k) {
        if (!/^(title|summary|docs|risk|channel)(_|$)/.test(k)) return;
        var v = m[k];
        if (v) doc.push(Array.isArray(v) ? v.join(" ") : v);
      });
      doc = doc.join(" ");
      var s = score(query, doc);
      if (intentMatter && m.id === intentMatter) s += 0.35;      /* 意图对应事项加权 */
      if (intentMatter && m.applies && (m.applies.purposes || []).indexOf("transit") >= 0 && !qHasTransit) s -= 0.5;
      if (m.id === "arr_reg24" && intentMatter && intentMatter !== "arr_reg24") s += 0.12; /* 住宿登记是全周期高频第一步 */
      pool.push({ type: "matter", id: m.id, item: m, s: s });
    });
    window.KB.FAQ.forEach(function (f, i) {
      var fdoc = [];
      Object.keys(f).forEach(function (k) { if (/^(q|a)(_|$)/.test(k) && f[k]) fdoc.push(f[k]); });
      var s = score(query, fdoc.join(" "));
      var isTransitFaq = TRANSIT_RE.test(f.q) || TRANSIT_RE.test(f.a);
      if (isTransitFaq && !qHasTransit) s = 0;                    /* 过境类问答不主动混入 */
      if (s > 0 && f.level === "S3" && !qHasTransit) s -= 0.05;   /* S3 待复核条目轻微降权 */
      pool.push({ type: "faq", id: "faq" + i, item: f, s: s });
    });
    /* 校本条目并入候选池：机构端维护的本校口径加权优先（+0.5），意图命中再强化 */
    localKbItems().forEach(function (lm) {
      var doc = [lm.title, lm.title_en, lm.summary, lm.summary_en, lm.channel, lm.risk].filter(function (x) { return x; }).join(" ");
      if (!doc) return;
      var s = score(query, doc);
      if (s <= 0) return;
      s += 0.5;
      if (intentMatter) s += 0.25;
      pool.push({ type: "local", id: lm.id, item: lm, s: s });
    });
    pool.sort(function (a, b) { return b.s - a.s; });
    return pool.filter(function (p) { return p.s > 0.055; }).slice(0, topK);
  }

  /* ================= 3. 画像与路径判定 ================= */
  var DEFAULT_PROFILE = {
    country: "PK", purpose: "degree", duration: "lt180",
    arrival: "", enroll: "", faith: "none", diet: []
  };

  function decidePath(p) {
    var best = null;
    window.KB.PATHS.forEach(function (pa) {
      var m = pa.match;
      var okP = !m.purposes || m.purposes.indexOf(p.purpose) >= 0;
      var okD = !m.durations || m.durations.indexOf(p.duration) >= 0;
      var sc = (okP ? 2 : 0) + (okD ? 1 : 0);
      if (okP && okD && (!best || sc > best.sc)) best = { path: pa, sc: sc };
    });
    return best ? best.path : window.KB.PATHS[window.KB.PATHS.length - 1];
  }

  /* ================= 4. 规则判定：法定时限 → 你的关键日期 ================= */
  function addDays(d, n) { var x = new Date(d.getTime()); x.setDate(x.getDate() + n); return x; }
  function addHours(d, n) { var x = new Date(d.getTime()); x.setHours(x.getHours() + n); return x; }
  function fmt(d) {
    if (!d) return "—";
    var y = d.getFullYear(), m = ("0" + (d.getMonth() + 1)).slice(-2), dd = ("0" + d.getDate()).slice(-2);
    return y + "-" + m + "-" + dd;
  }
  function computeDeadline(m, p) {
    var base = null;
    if (m.deadline.from === "arrival" && p.arrival) base = new Date(p.arrival + "T09:00:00");
    if (m.deadline.from === "enroll" && p.enroll) base = new Date(p.enroll + "T09:00:00");
    var d = null, kind = m.deadline.kind;
    if (base && kind === "hours") d = addHours(base, m.deadline.value);
    if (base && kind === "days" && m.deadline.value >= 0) d = addDays(base, m.deadline.value);
    var urgency = "later", days = null;
    if (d) {
      days = Math.round((d - new Date()) / 86400000);
      urgency = days <= 3 ? "urgent" : (days <= 30 ? "soon" : "later");
    } else if (kind === "days" && m.deadline.value < 0) {
      urgency = "later"; /* 相对到期日的提醒，需用户提供到期日才能计算 */
    }
    var zh = !window.L10N || String(window.L10N.current).slice(0, 2) === "zh";
    return { date: d, dateStr: d ? fmt(d) : "", urgency: urgency, days: days, label: window.KB.L(m.deadline, "label") };
  }

  function buildChecklist(p) {
    var path = decidePath(p);
    var ids = path.steps.slice();
    /* 依据画像补充事项 */
    if (p.duration === "lt180") ids.push("pre_physical");
    if (p.purpose === "short" || p.purpose === "transit") { /* 短期：去掉长期类事项 */ }
    if (p.diet && p.diet.length) ids.push("stu_diet");
    if (p.faith && p.faith !== "none" && p.faith !== "none2") ids.push("stu_faith");
    if (p.country) ids.push("stu_diet");
    /* 去重保序 */
    var seen = {}, list = [];
    ids.forEach(function (id) {
      if (seen[id]) return;
      seen[id] = 1;
      var m = window.KB.matter(id);
      if (m) list.push({ matter: m, deadline: computeDeadline(m, p), done: false, local: false });
    });
    /* 校本条目按阶段并入并置顶（机构端维护的本校口径优先展示，标注 local） */
    var stageRank = { pre: 0, arrival: 1, study: 2, exit: 3 };
    var localSeen = {};
    localKbItems().slice().sort(function (a, b) {
      return (stageRank[a.stage] || 1) - (stageRank[b.stage] || 1);
    }).forEach(function (lm) {
      if (localSeen[lm.id]) return;
      localSeen[lm.id] = 1;
      list.unshift({ matter: lm, deadline: computeDeadline(lm, p), done: false, local: true });
    });
    return list.map(function (m) {
      return { matter: m.matter, deadline: m.deadline, done: m.done, local: !!m.local };
    }).sort(function (a, b) {
      if (a.local !== b.local) return a.local ? -1 : 1;
      var rank = { P0: 0, P1: 1, P2: 2 };
      var ra = rank[a.matter.pri], rb = rank[b.matter.pri];
      if (ra !== rb) return ra - rb;
      return (a.deadline.date ? a.deadline.date.getTime() : Infinity) - (b.deadline.date ? b.deadline.date.getTime() : Infinity);
    });
  }

  /* ================= 5. 内容生成 ================= */
  function t(key) { return window.L10N.t(key); }

  function matterText(m, lang) {
    var zh = lang === "zh";
    return {
      title: window.KB.L(m, "title", lang),
      summary: window.KB.L(m, "summary", lang),
      docs: window.KB.L(m, "docs", lang) || [],
      channel: window.KB.L(m, "channel", lang),
      risk: window.KB.L(m, "risk", lang),
      label: m.deadline ? window.KB.L(m.deadline, "label", lang) : ""
    };
  }

  /* lang 省略时取界面语种；机构端生成材料时传入材料语种，保证来源行随材料语言 */
  function srcLine(keys, lang) {
    var lg = String(lang || (window.L10N && window.L10N.current) || "zh").slice(0, 2);
    var zh = lg === "zh";
    return window.KB.sources(keys).map(function (s) {
      return window.KB.L(s, "name", lg) + " · " + window.KB.L(s, "org", lg) + (s.url ? (zh ? "（" + s.url + "）" : " (" + s.url + ")") : "") + " · " + window.L10N.t("checkedAt", lg) + " " + s.checked + " · " + s.level;
    });
  }

  /* 模板章节 → 知识库事项映射（机构端生成材料自动填充真实要点，而非通用套话） */
  var TPL_MATTERS = {
    t_guide: [
      { sec: 0, ids: ["pre_visa", "pre_physical", "pre_insurance", "pre_money"] },
      { sec: 1, ids: ["arr_reg24", "arr_school"] },
      { sec: 2, ids: ["arr_residence", "arr_physical_cn"] },
      { sec: 3, ids: ["stu_renew", "stu_diet", "stu_faith", "stu_psych"] },
      { sec: 4, ids: ["arr_safety"] }
    ],
    t_checklist: [
      { sec: 0, ids: ["pre_visa", "exi_cert"] },
      { sec: 1, ids: ["pre_physical", "pre_insurance"] },
      { sec: 2, ids: ["pre_money", "arr_sim", "arr_bank"] },
      { sec: 3, ids: ["pre_luggage", "arr_reg24"] }
    ],
    t_notice: [],
    t_faq: [],
    t_brief: [
      { sec: 0, ids: ["arr_reg24", "arr_school", "arr_safety"] },
      { sec: 1, ids: ["arr_residence", "arr_physical_cn", "arr_bank", "arr_sim"] },
      { sec: 2, ids: ["stu_renew", "stu_intern"] }
    ],
    t_emergency: [
      { sec: 0, ids: ["stu_lostpass"] },
      { sec: 1, ids: ["stu_medical", "arr_safety"] },
      { sec: 2, ids: ["arr_safety"] }
    ]
  };
  var COUNTRY_LANG_EN = {
    "乌尔都语 / 英语": "Urdu / English", "印地语 / 英语": "Hindi / English", "印尼语": "Indonesian",
    "马来语 / 英语 / 中文": "Malay / English / Chinese", "孟加拉语 / 英语": "Bengali / English",
    "阿拉伯语": "Arabic", "俄语": "Russian", "哈萨克语 / 俄语": "Kazakh / Russian", "韩语": "Korean",
    "日语": "Japanese", "泰语": "Thai", "越南语": "Vietnamese", "阿姆哈拉语 / 英语": "Amharic / English",
    "英语": "English", "法语": "French", "德语": "German", "—": "—"
  };
  function cLang(c, isZh) { return isZh ? c.lang : (COUNTRY_LANG_EN[c.lang] || c.lang); }

  /* 生成结构化材料（机构端与学生端共用） */
  function renderMaterial(cfg) {
    var lang = cfg.lang || "zh";
    var isZh = lang === "zh";
    /* 材料取值跟随「材料语种」而非界面语种：
       否则中文骨架会填进俄文/阿文取值，形成混排。 */
    window.KB_LANG_OVERRIDE = lang;
    var tpl = null;
    window.KB.TEMPLATES.forEach(function (x) { if (x.id === cfg.template) tpl = x; });
    if (!tpl) tpl = window.KB.TEMPLATES[0];
    var c = window.KB.COUNTRY[cfg.country] || window.KB.COUNTRY.OTHER;
    var L = {
      zh: { head: "标题", sec: "章节", src: "依据来源", note: "本材料由机构端内容工作台生成，AI 生成内容需人工复核后发布。", country: "国别适配提示", deadline: "时限", contact: "联系方式", topic: "事项", cf: "宗教背景", cd: "饮食要点", cfe: "主要节日", cl: "常用语言", ct: "沟通与礼仪提示", docs: "所需材料", channel: "办理渠道", extra: "补充要求" },
      en: { head: "Title", sec: "Sections", src: "Sources", note: "Generated by the institution content studio. AI output requires human review before release.", country: "Country adaptation", deadline: "Deadline", contact: "Contact", topic: "Topic", cf: "Religious background", cd: "Dietary notes", cfe: "Main festivals", cl: "Common languages", ct: "Communication & etiquette", docs: "Required documents", channel: "How to apply", extra: "Additional requirements" },
      ru: { head: "Заголовок", sec: "Разделы", src: "Источники", note: "Создано студией контента. Требуется проверка человеком.", country: "Адаптация по стране", deadline: "Срок", contact: "Контакты", topic: "Тема", cf: "Религиозный фон", cd: "Питание", cfe: "Праздники", cl: "Языки", ct: "Этикет", docs: "Документы", channel: "Как оформить", extra: "Дополнительно" },
      ar: { head: "العنوان", sec: "الأقسام", src: "المصادر", note: "أُنشئ في استوديو المحتوى. يتطلب مراجعة بشرية.", country: "التوافق الثقافي", deadline: "الموعد", contact: "التواصل", topic: "الموضوع", cf: "الخلفية الدينية", cd: "ملاحظات غذائية", cfe: "الأعياد", cl: "اللغات", ct: "الآداب", docs: "المستندات المطلوبة", channel: "طريقة التقديم", extra: "متطلبات إضافية" },
      fr: { head: "Titre", sec: "Sections", src: "Sources", note: "Généré par le studio de contenu. Validation humaine requise.", country: "Adaptation pays", deadline: "Échéance", contact: "Contact", topic: "Sujet", cf: "Contexte religieux", cd: "Alimentation", cfe: "Fêtes", cl: "Langues", ct: "Étiquette", docs: "Documents requis", channel: "Démarches", extra: "Exigences supplémentaires" },
      es: { head: "Título", sec: "Secciones", src: "Fuentes", note: "Generado por el estudio de contenido. Requiere revisión humana.", country: "Adaptación por país", deadline: "Plazo", contact: "Contacto", topic: "Tema", cf: "Contexto religioso", cd: "Alimentación", cfe: "Fiestas", cl: "Idiomas", ct: "Etiqueta", docs: "Documentos requeridos", channel: "Cómo tramitar", extra: "Requisitos adicionales" },
      vi: { head: "Tiêu đề", sec: "Mục", src: "Nguồn", note: "Được tạo bởi xưởng nội dung. Nội dung AI cần được kiểm duyệt trước khi phát hành.", country: "Thích ứng quốc gia", deadline: "Thời hạn", contact: "Liên hệ", topic: "Nội dung", cf: "Nền tảng tôn giáo", cd: "Lưu ý ăn uống", cfe: "Ngày lễ chính", cl: "Ngôn ngữ thông dụng", ct: "Giao tiếp và lễ nghi", docs: "Giấy tờ cần thiết", channel: "Cách thực hiện", extra: "Yêu cầu bổ sung" },
      th: { head: "หัวข้อ", sec: "หมวด", src: "แหล่งอ้างอิง", note: "สร้างโดยสตูดิโอเนื้อหา เนื้อหาจาก AI ต้องผ่านการตรวจสอบก่อนเผยแพร่", country: "การปรับตามประเทศ", deadline: "กำหนดเวลา", contact: "ติดต่อ", topic: "เรื่อง", cf: "ภูมิหลังทางศาสนา", cd: "ข้อควรทราบด้านอาหาร", cfe: "เทศกาลสำคัญ", cl: "ภาษาที่ใช้", ct: "การสื่อสารและมารยาท", docs: "เอกสารที่ต้องใช้", channel: "วิธีดำเนินการ", extra: "ข้อกำหนดเพิ่มเติม" },
      my: { head: "ခေါင်းစဉ်", sec: "အပိုင်းများ", src: "ရင်းမြစ်များ", note: "အကြောင်းအရာ စတူဒီယိုမှ ဖန်တီးသည်။ AI ထုတ်ကုန်ကို လူက စစ်ဆေးပြီးမှ ထုတ်ပြန်ရမည်။", country: "နိုင်ငံအလိုက် ကိုက်ညီမှု", deadline: "နောက်ဆုံးရက်", contact: "ဆက်သွယ်ရန်", topic: "အကြောင်းအရာ", cf: "ဘာသာရေး နောက်ခံ", cd: "အစားအသောက် မှတ်ချက်", cfe: "အဓိက ပွဲတော်များ", cl: "အသုံးများသော ဘာသာစကားများ", ct: "ဆက်သွယ်ရေးနှင့် ကျင့်ဝတ်", docs: "လိုအပ်သော စာရွက်စာတမ်းများ", channel: "လျှောက်ထားနည်း", extra: "ထပ်ဆောင်း လိုအပ်ချက်များ" },
      ms: { head: "Tajuk", sec: "Bahagian", src: "Sumber", note: "Dijana oleh studio kandungan. Output AI perlu disemak manusia sebelum diterbitkan.", country: "Penyesuaian negara", deadline: "Tarikh akhir", contact: "Hubungan", topic: "Topik", cf: "Latar belakang agama", cd: "Nota pemakanan", cfe: "Perayaan utama", cl: "Bahasa lazim", ct: "Komunikasi & adab", docs: "Dokumen diperlukan", channel: "Cara memohon", extra: "Keperluan tambahan" },
    }[lang] || null;
    if (!L) L = { head: "Title", sec: "Sections", src: "Sources", note: "", country: "Country adaptation", deadline: "Deadline", contact: "Contact", topic: "Topic", cf: "Religious background", cd: "Dietary notes", cfe: "Main festivals", cl: "Common languages", ct: "Communication & etiquette", docs: "Required documents", channel: "How to apply", extra: "Additional requirements" };
    /* 段落级文案（十语）：L 表只覆盖字段标签，此处覆盖成句模板与标点，杜绝英文兜底 */
    var S = {
      zh: { steps: "办理要点", aud: "国际学生", sep: "：", intro: "本材料面向{c}籍{a}，就「{t}」事项提供办理指引。所有信息来源于官方渠道，标注证据等级与核对日期，发布前请按本校口径复核。", empty: "请按本校与主管部门最新要求办理（可由机构端补充具体步骤）。", disc: "国别适配为跨文化沟通提示，不构成宗教或法律依据，请尊重个体差异。" },
      en: { steps: "Key steps", aud: "international students", sep: ": ", intro: "This material provides procedural guidance on \u201c{t}\u201d for students from {c}. All information is drawn from official channels with evidence levels and verification dates; please review against your institution's requirements before release.", empty: "Follow your institution's and the competent authority's latest requirements (specific steps may be added by the institution).", disc: "Country adaptation is a cross-cultural communication aid, not a religious or legal reference. Respect individual differences." },
      ru: { steps: "Ключевые шаги", aud: "иностранные студенты", sep: ": ", intro: "В материале изложен порядок действий по теме «{t}» для студентов из страны: {c}. Все сведения взяты из официальных источников с указанием уровня достоверности и даты проверки; перед публикацией сверьтесь с требованиями вашего вуза.", empty: "Действуйте по последним требованиям вашего вуза и компетентного органа (конкретные шаги может добавить вуз).", disc: "Адаптация по стране — подсказка для межкультурного общения, а не религиозная или правовая норма. Уважайте индивидуальные различия." },
      ar: { steps: "الخطوات الأساسية", aud: "الطلاب الدوليون", sep: ": ", intro: "يقدّم هذا المستند إرشادات إجرائية بشأن «{t}» للطلاب القادمين من {c}. جميع المعلومات مأخوذة من مصادر رسمية مع بيان درجة الموثوقية وتاريخ التحقق؛ يُرجى مراجعتها وفق متطلبات مؤسستكم قبل النشر.", empty: "اتبع أحدث متطلبات مؤسستكم والجهة المختصة (يمكن للمؤسسة إضافة الخطوات التفصيلية).", disc: "التوافق الثقافي إرشاد للتواصل بين الثقافات، وليس مرجعًا دينيًا أو قانونيًا. يُرجى احترام الفروق الفردية." },
      fr: { steps: "Étapes clés", aud: "étudiants internationaux", sep: " : ", intro: "Ce document fournit des indications de procédure sur « {t} » aux étudiants originaires de {c}. Toutes les informations proviennent de sources officielles, avec niveau de preuve et date de vérification ; veuillez les valider selon les règles de votre établissement avant publication.", empty: "Suivez les prescriptions les plus récentes de votre établissement et de l'autorité compétente (les étapes précises peuvent être ajoutées par l'établissement).", disc: "L'adaptation pays est une aide à la communication interculturelle, et non une référence religieuse ou juridique. Respectez les différences individuelles." },
      es: { steps: "Pasos clave", aud: "estudiantes internacionales", sep: ": ", intro: "Este documento ofrece orientación procedimental sobre «{t}» para estudiantes procedentes de {c}. Toda la información procede de fuentes oficiales, con nivel de evidencia y fecha de verificación; revísela según los criterios de su institución antes de publicarla.", empty: "Siga los requisitos más recientes de su institución y de la autoridad competente (la institución puede añadir los pasos concretos).", disc: "La adaptación por país es una ayuda para la comunicación intercultural, no una referencia religiosa ni jurídica. Respete las diferencias individuales." },
      vi: { steps: "Các bước chính", aud: "sinh viên quốc tế", sep: ": ", intro: "Tài liệu này hướng dẫn quy trình về «{t}» cho sinh viên đến từ {c}. Mọi thông tin đều lấy từ nguồn chính thức, có ghi mức độ tin cậy và ngày kiểm tra; vui lòng đối chiếu với quy định của nhà trường trước khi phát hành.", empty: "Thực hiện theo yêu cầu mới nhất của nhà trường và cơ quan có thẩm quyền (nhà trường có thể bổ sung các bước cụ thể).", disc: "Phần thích ứng quốc gia chỉ là gợi ý giao tiếp đa văn hóa, không phải căn cứ tôn giáo hay pháp lý. Hãy tôn trọng sự khác biệt của mỗi cá nhân." },
      th: { steps: "ขั้นตอนสำคัญ", aud: "นักศึกษานานาชาติ", sep: ": ", intro: "เอกสารนี้ให้แนวทางขั้นตอนเรื่อง «{t}» สำหรับนักศึกษาจาก{c} ข้อมูลทั้งหมดมาจากแหล่งทางการ พร้อมระบุระดับความน่าเชื่อถือและวันที่ตรวจสอบ โปรดทบทวนตามข้อกำหนดของสถาบันก่อนเผยแพร่", empty: "โปรดดำเนินการตามข้อกำหนดล่าสุดของสถาบันและหน่วยงานที่มีอำนาจ (สถาบันสามารถเพิ่มขั้นตอนเฉพาะได้)", disc: "การปรับตามประเทศเป็นเพียงคำแนะนำด้านการสื่อสารข้ามวัฒนธรรม ไม่ใช่ข้ออ้างอิงทางศาสนาหรือกฎหมาย โปรดเคารพความแตกต่างของแต่ละบุคคล" },
      my: { steps: "အဓိက အဆင့်များ", aud: "နိုင်ငံတကာ ကျောင်းသားများ", sep: ": ", intro: "ဤစာရွက်စာတမ်းသည် {c} မှ ကျောင်းသားများအတွက် «{t}» နှင့်ပတ်သက်သော လုပ်ငန်းစဉ် လမ်းညွှန်ချက် ဖြစ်သည်။ အချက်အလက်အားလုံးကို တရားဝင် ရင်းမြစ်များမှ ရယူထားပြီး သက်သေအဆင့်နှင့် စစ်ဆေးသည့်ရက်စွဲ တွဲဖက်ဖော်ပြထားသည်။ ထုတ်ပြန်မီ ကျောင်း၏ သတ်မှတ်ချက်များနှင့် ပြန်လည်စစ်ဆေးပါ။", empty: "သင့်ကျောင်းနှင့် သက်ဆိုင်ရာ အာဏာပိုင်၏ နောက်ဆုံး သတ်မှတ်ချက်များအတိုင်း ဆောင်ရွက်ပါ (အဆင့်အသေးစိတ်ကို ကျောင်းမှ ဖြည့်စွက်နိုင်သည်)။", disc: "နိုင်ငံအလိုက် ကိုက်ညီမှုသည် ယဉ်ကျေးမှုဖြတ်ကျော် ဆက်သွယ်ရေး အကြံပြုချက်သာ ဖြစ်ပြီး ဘာသာရေး သို့မဟုတ် ဥပဒေဆိုင်ရာ အထောက်အထား မဟုတ်ပါ။ တစ်ဦးချင်း ကွဲပြားမှုကို လေးစားပါ။" },
      ms: { steps: "Langkah utama", aud: "pelajar antarabangsa", sep: ": ", intro: "Bahan ini memberi panduan prosedur tentang «{t}» untuk pelajar dari {c}. Semua maklumat diambil daripada sumber rasmi bersama tahap bukti dan tarikh semakan; sila semak semula mengikut keperluan institusi anda sebelum diterbitkan.", empty: "Ikut keperluan terkini institusi anda dan pihak berkuasa (langkah khusus boleh ditambah oleh institusi).", disc: "Penyesuaian negara hanyalah panduan komunikasi antara budaya, bukan rujukan agama atau undang-undang. Hormati perbezaan individu." }
    }[lang] || { steps: "Key steps", aud: "international students", sep: ": ", intro: "This material provides procedural guidance on \u201c{t}\u201d for students from {c}. All information is drawn from official channels with evidence levels and verification dates; please review against your institution's requirements before release.", empty: "Follow your institution's and the competent authority's latest requirements.", disc: "Country adaptation is a cross-cultural communication aid, not a religious or legal reference. Respect individual differences." };
    /* 模板占位符填充：{c} 国别 / {a} 受众 / {t} 事项 */
    var fill = function (s, o) {
      return String(s || "").replace(/\{(\w+)\}/g, function (_, k) {
        return (o && o[k] !== undefined && o[k] !== null) ? o[k] : "";
      });
    };
    /* 材料内取词一律跟随「材料语种」：页脚免责声明、来源核对日期、AI 标识
       都走界面 t() 曾导致中文界面下生成俄文材料时夹中文。 */
    var mt = function (k) { return window.L10N.t(k, lang); };
    var secs = window.KB.L(tpl, "sections") || [];

    var title = (cfg.topic || window.KB.L(tpl, "name")) + (cfg.country && cfg.country !== "OTHER" ? " · " + KB.countryName(c) : "");

    /* 收集模板映射到的知识库事项，用于填充真实要点、材料与渠道 */
    var usedMatters = [], usedSrc = [];
    (TPL_MATTERS[tpl.id] || []).forEach(function (g) {
      g.ids.forEach(function (id) {
        var m = window.KB.matter(id);
        if (m && usedMatters.indexOf(m) < 0) { usedMatters.push(m); }
      });
    });
    usedMatters.forEach(function (m) { m.source.forEach(function (k) { if (usedSrc.indexOf(k) < 0) usedSrc.push(k); }); });
    if (usedSrc.indexOf("school") < 0) usedSrc.push("school");

    var body = [];
    body.push("## " + title);
    if (cfg.deadline) body.push("**" + L.deadline + "**" + S.sep + cfg.deadline);
    body.push("");
    body.push("### " + (isZh ? "一、事项说明" : "1. " + L.topic));
    body.push(fill(S.intro, {
      c: window.KB.countryName(c) || c.en || "",
      a: cfg.audience || S.aud,
      t: cfg.topic || window.KB.L(tpl, "name")
    }));
    body.push("");
    body.push("### " + (isZh ? "二、办理要点" : "2. " + S.steps));
    secs.forEach(function (s, i) {
      body.push("**" + (i + 1) + ". " + s + "**");
      var mapped = [];
      (TPL_MATTERS[tpl.id] || []).forEach(function (g) { if (g.sec === i) g.ids.forEach(function (id) { var m = window.KB.matter(id); if (m) mapped.push(m); }); });
      if (mapped.length) {
        mapped.forEach(function (m) {
          var mt = matterText(m, lang);
          body.push("- **" + mt.title + "**" + (isZh ? "：" : ": ") + mt.summary + (mt.label ? (isZh ? "（" + mt.label + "）" : " (" + mt.label + ")") : ""));
        });
      } else {
        body.push("- " + S.empty);
      }
    });

    /* 国别与信仰适配 */
    if (c.diet || c.fest) {
      body.push("");
      body.push("### " + (isZh ? "三、" : "3. ") + L.country);
      body.push("- " + L.cf + S.sep + window.KB.L(c, "faith"));
      body.push("- " + L.cd + S.sep + window.KB.L(c, "diet"));
      if (c.fest && c.fest.length) body.push("- " + L.cfe + S.sep + (window.KB.L(c, "fest") || []).join(isZh ? "、" : ", "));
      if (c.lang) body.push("- " + L.cl + S.sep + window.KB.L(c, "lang"));
      (window.KB.L(c, "tips") || []).forEach(function (x) { body.push("- " + x); });
      body.push("");
      body.push("> " + S.disc);
    }

    /* 所需材料 */
    var docs = [];
    usedMatters.forEach(function (m) {
      var _ds = window.KB.L(m, "docs") || [];
      _ds.forEach(function (d) { if (docs.indexOf(d) < 0) docs.push(d); });
    });
    if (docs.length) {
      body.push("");
      body.push("### " + (isZh ? "四、" : "4. ") + L.docs);
      docs.slice(0, 8).forEach(function (d) { body.push("- " + d); });
    }

    /* 办理渠道 */
    var channels = [];
    usedMatters.forEach(function (m) {
      var _ch = window.KB.L(m, "channel");
      if (_ch && channels.indexOf(_ch) < 0) channels.push(_ch);
    });
    if (channels.length) {
      body.push("");
      body.push("### " + (isZh ? "五、" : "5. ") + L.channel);
      channels.slice(0, 4).forEach(function (ch) { body.push("- " + ch); });
    }

    /* 补充要求与联系方式 */
    if (cfg.extra) { body.push(""); body.push("### " + (isZh ? "六、" : "6. ") + L.extra); body.push(cfg.extra); }
    if (cfg.contact) { body.push(""); body.push("**" + L.contact + "**" + S.sep + cfg.contact); }
    body.push("");
    body.push("---");
    body.push("> " + L.note);
    body.push("> " + mt("footerNote"));

    var _res = {
      title: title, markdown: body.join("\n"),
      sources: srcLine(usedSrc, lang),
      aiLabel: lang === "zh" || lang === "en" ? mt("aiGenerated") : mt("aiGenerated") + " / machine-translated",
      needsHuman: true, lang: lang, template: window.KB.L(tpl, "name") || tpl.name
    };
    window.KB_LANG_OVERRIDE = null;
    return _res;
  }

  /* 多语种术语表（用于"一键多语种"的演示：结构多语种 + 关键术语映射） */
  var GLOSSARY = {
    "住宿登记": { en: "accommodation registration", ru: "регистрация адреса", ar: "تسجيل العنوان", fr: "enregistrement du domicile", es: "registro de domicilio" },
    "居留许可": { en: "residence permit", ru: "вид на жительство", ar: "تصريح الإقامة", fr: "titre de séjour", es: "permiso de residencia" },
    "签证": { en: "visa", ru: "виза", ar: "تأشيرة", fr: "visa", es: "visado" },
    "报到注册": { en: "enrolment", ru: "зачисление", ar: "التسجيل الجامعي", fr: "inscription", es: "matrícula" },
    "体检": { en: "medical examination", ru: "медосмотр", ar: "الفحص الطبي", fr: "visite médicale", es: "examen médico" },
    "保险": { en: "insurance", ru: "страховка", ar: "تأمين", fr: "assurance", es: "seguro" },
    "办理时限": { en: "processing deadline", ru: "срок оформления", ar: "الموعد النهائي", fr: "délai de traitement", es: "plazo de tramitación" },
    "所需材料": { en: "required documents", ru: "необходимые документы", ar: "المستندات المطلوبة", fr: "documents requis", es: "documentos requeridos" },
    "紧急联系": { en: "emergency contact", ru: "экстренный контакт", ar: "جهة اتصال للطوارئ", fr: "contact d'urgence", es: "contacto de emergencia" }
  };
  function glossaryTranslate(text, lang) {
    var out = text;
    Object.keys(GLOSSARY).forEach(function (k) {
      if (out.indexOf(k) >= 0 && GLOSSARY[k][lang]) out = out.split(k).join(GLOSSARY[k][lang]);
    });
    return out;
  }

  /* ================= 6. 问答（含推理轨迹） ================= */
  /* 会话类问题离线兜底（打招呼/身份/能力介绍）：任何引擎（含离线规则引擎）都能答 */
  var CHAT = {
    zh: { title: "你好，我是来华交流全程助手", body: "我按你来华交流的四个阶段——行前准备、抵达初期、在学日常、离境——帮你理清签证、住宿登记、居留、就医、保险这些事：该办什么、什么时候办、去哪儿办，答案都带官方来源。下面这些问题可以直接问我。", chips: ["拿到学习签证后先做什么", "住宿登记要多久内办", "居留许可到期怎么办"],
      greet: "你好！有什么可以帮你？", welcome: "不客气，很高兴帮到你。还有其他来华问题随时问我。" },
    en: { title: "Hi, I'm your Exchange AI Agent for China", body: "I guide you through the four stages of your exchange — before arrival, first weeks, daily life and departure — covering visas, accommodation registration, residence permits, medical care and insurance: what to do, when and where, with official sources attached. Try one of the questions below.", chips: ["What should I do after getting my study visa?", "How soon must I register my accommodation?", "My residence permit is expiring — what now?"],
      greet: "Hello! How can I help you?", welcome: "You're welcome — glad to help. Ask me anytime about your stay in China." },
    ru: { title: "Здравствуйте, я ваш помощник по поездке в Китай", body: "Я провожу вас через четыре этапа — подготовка, первые недели, учёба и отъезд — и помогаю с визой, регистрацией проживания, видом на жительство, медициной и страховкой: что делать, когда и куда идти, со ссылками на официальные источники.", chips: ["Что делать после получения учебной визы?", "В какой срок зарегистрировать проживание?", "Заканчивается вид на жительство — что делать?"],
      greet: "Здравствуйте! Чем могу помочь?", welcome: "Пожалуйста, рад помочь. Спрашивайте в любое время." },
    ar: { title: "مرحبًا، أنا مساعدك طوال فترة إقامتك في الصين", body: "أرشدك خلال المراحل الأربع — التحضير، الوصول، الدراسة والمغادرة — لترتيب التأشيرة، تسجيل الإقامة، تصريح الإقامة، العلاج والتأمين: ماذا تفعل ومتى وأين، مع مصادر رسمية.", chips: ["ماذا أفعل بعد الحصول على تأشيرة الدراسة؟", "خلال كم يوم يجب تسجيل محل الإقامة؟", "تصريح الإقامة ينتهي — ماذا أفعل؟"],
      greet: "مرحبًا! كيف يمكنني مساعدتك؟", welcome: "على الرحب والسعة، يسعدني مساعدتك." },
    fr: { title: "Bonjour, je suis votre assistant pour votre séjour en Chine", body: "Je vous accompagne sur les quatre étapes — avant l'arrivée, à l'arrivée, pendant les études et au départ — pour gérer visa, enregistrement du logement, titre de séjour, soins et assurance : quoi faire, quand et où, avec sources officielles.", chips: ["Que faire après l'obtention du visa d'études ?", "Sous combien de jours enregistrer mon logement ?", "Mon titre de séjour expire — que faire ?"],
      greet: "Bonjour ! Comment puis-je vous aider ?", welcome: "Avec plaisir, ravi de vous aider." },
    es: { title: "Hola, soy tu asistente para tu estancia en China", body: "Te acompaño en las cuatro etapas — antes de llegar, a la llegada, durante los estudios y al salir — con visado, registro de alojamiento, permiso de residencia, atención médica y seguro: qué hacer, cuándo y dónde, con fuentes oficiales.", chips: ["¿Qué hago tras obtener el visado de estudios?", "¿En cuántos días debo registrar mi alojamiento?", "Mi permiso de residencia vence — ¿qué hago?"],
      greet: "¡Hola! ¿Cómo puedo ayudarte?", welcome: "De nada, encantado de ayudar." },
    vi: { title: "Chào bạn, mình là trợ lý hành trình đến Trung Quốc của bạn", body: "Mình đồng hành qua bốn giai đoạn — chuẩn bị, mới đến, học tập và khởi hành — giúp bạn xử lý thị thực, đăng ký lưu trú, giấy phép cư trú, khám chữa bệnh và bảo hiểm: làm gì, khi nào, ở đâu, kèm nguồn chính thức.", chips: ["Sau khi có visa học thì làm gì trước?", "Đăng ký lưu trú cần làm trong bao lâu?", "Giấy phép cư trú sắp hết hạn thì sao?"],
      greet: "Chào bạn! Mình có thể giúp gì?", welcome: "Không có gì, rất vui được giúp bạn." },
    th: { title: "สวัสดี ฉันคือผู้ช่วยตลอดการเดินทางของคุณในจีน", body: "ฉันพาคุณผ่านสี่ช่วง — เตรียมตัว, ถึงจีน, เรียน และกลับประเทศ — จัดการเรื่องวีซ่า, ลงทะเบียนที่พัก, ใบอนุญาตพำนัก, การรักษาพยาบาล และประกัน: ต้องทำอะไร เมื่อไร ที่ไหน พร้อมแหล่งอ้างอิงทางการ", chips: ["หลังได้วีซ่านักเรียน ต้องทำอะไรก่อน", "ต้องลงทะเบียนที่พักภายในกี่วัน", "ใบอนุญาตพำนักใกล้หมดอายุ ทำอย่างไร"],
      greet: "สวัสดี! มีอะไรให้ฉันช่วยไหม?", welcome: "ด้วยความยินดี ยินดีช่วยเหลือเสมอ" },
    my: { title: "မင်္ဂလာပါ၊ ကျွန်ုပ်သည် သင့်တရုတ်ပြည်ခရီးအတွက် အကူအညီပေးသူ ဖြစ်ပါသည်", body: "ကျွန်ုပ်သည် အဆင့်လေးဆင့် — ပြင်ဆင်ချိန်၊ ရောက်ချိန်၊ ကျောင်းတက်ချိန်နှင့် ထွက်ခွာချိန် — တစ်လျှောက် ဗီဇာ၊ နေထိုင်မှုမှတ်ပုံတင်၊ နေထိုင်ခွင့်၊ ကုသမှုနှင့် အာမခံကိစ္စများကို ဘာလုပ်ရမည်၊ မည်သည့်အချိန်၊ မည်သည့်နေရာတွင် လမ်းညွှန်ပေးပြီး တရားဝင် ရင်းမြစ်များ ပူးတွဲဖော်ပြပါသည်။", chips: ["ကျောင်းသားဗီဇာ ရပြီးနောက် ဘာဦးစားပေးလုပ်ရမလဲ", "နေထိုင်မှုမှတ်ပုံတင်ကို ရက်မည်မျှအတွင်း ပြုလုပ်ရမလဲ", "နေထိုင်ခွင့် သက်တမ်းကုန်ခါနီး ဖြစ်နေလျှင်"],
      greet: "မင်္ဂလာပါ! ဘာကူညီပေးရမလဲ?", welcome: "ရပါတယ်၊ ကူညီပေးရတာ ဝမ်းသာပါတယ်။" },
    ms: { title: "Hai, saya pembantu perjalanan anda ke China", body: "Saya membimbing anda melalui empat fasa — persediaan, ketibaan, pengajian dan pemergian — untuk visa, pendaftaran penginapan, permit kediaman, rawatan perubatan dan insurans: apa yang perlu dibuat, bila dan di mana, dengan sumber rasmi.", chips: ["Apa yang perlu dilakukan selepas mendapat visa pelajar?", "Berapa lama masa untuk mendaftar penginapan?", "Permit kediaman hampir tamat — apa yang perlu dibuat?"],
      greet: "Hai! Apa yang saya boleh bantu?", welcome: "Sama-sama, gembira dapat membantu." }
  };
  function matchChatIntent(q) {
    q = (q || "").trim();
    if (!q) return null;
    var greet = /^(hi|hello|hey|你好|您好|哈喽|嗨|привет|здравствуйте|مرحبا|اهلا|salut|bonjour|hola|buenos días|chào|xin chào|สวัสดี|မင်္ဂလာပါ|halo|selamat|안녕)[\s!?。！？.…]*$/i;
    var who = /你是谁|你是什么|你是哪位|介绍一下你自己|你是谁的助手|what are you|who are you|tell me about yourself|кто ты|من أنت|ما أنت|qui es-tu|qué eres|quién eres|bạn là ai|bạn là gì|คุณคือใคร|မင်းက ဘယ်သူလဲ|awak siapa|kamu siapa/i;
    var cap = /你能做什么|能帮我什么|你会什么|what can you do|what do you do|can you help|что ты умеешь|ماذا يمكنك أن تفعل|que peux-tu faire|qué puedes hacer|bạn có thể làm gì|giúp được gì|คุณช่วยอะไรได้บ้าง|မင်း ဘာတွေ လုပ်ပေးနိုင်လဲ|awak boleh buat apa/i;
    var thx = /^(谢谢|感谢|thanks|thank you|danke|спасибо|شكرا|merci|gracias|cảm ơn|ขอบคุณ|ကျေးဇူးတင်ပါတယ်|terima kasih)[\s!?。！？.…]*$/i;
    if (greet.test(q)) return "greet";
    if (who.test(q)) return "who";
    if (cap.test(q)) return "cap";
    if (thx.test(q)) return "thx";
    return null;
  }
  function buildAnswer(query, profile, lang, onStep) {
    var steps = [];
    var push = function (n, title, detail) {
      steps.push({ n: n, title: title, detail: detail });
      if (typeof onStep === "function") onStep(steps.length - 1, steps[steps.length - 1]);
    };
    /* 0. 会话类问题（打招呼/身份/能力）：规则引擎与 LLM 均可答 */
    var chatKind = matchChatIntent(query);
    if (chatKind) {
      var R = CHAT[lang] || CHAT.en;
      var intro;
      if (chatKind === "who" || chatKind === "cap") {
        intro = '<div class="chat-intro"><h4 style="margin-top:0">' + esc(R.title) + "</h4><p>" + esc(R.body) + "</p>" +
          '<div class="chips" style="margin-top:10px">' + R.chips.map(function (c) { return '<button class="chip-q" data-q="' + esc(c) + '">' + esc(c) + "</button>"; }).join("") + "</div></div>";
      } else if (chatKind === "greet") {
        intro = '<div class="chat-intro"><p style="margin:0">' + esc(R.greet) + "</p></div>";
      } else {
        intro = '<div class="chat-intro"><p style="margin:0">' + esc(R.welcome) + "</p></div>";
      }
      return { steps: [], html: intro, sources: [], needReview: false, confidence: 1, llm: false, chat: true };
    }
    var p = profile || DEFAULT_PROFILE;

    /* 步骤 1 意图识别 */
    var cls = classify(query);
    push(1, t("flow1"), cls.intent === "unknown" ? "未识别明确意图，转入通用检索" : ("intent=" + cls.intent + "，命中关键词 " + cls.hits.join(" / ")));

    /* 步骤 2 画像读取 */
    var c = window.KB.COUNTRY[p.country] || window.KB.COUNTRY.OTHER;
    push(2, t("flow2"), "purpose=" + p.purpose + "；duration=" + p.duration + "；country=" + (lang === "zh" ? c.zh : (c.en || c.zh)) + (p.arrival ? "；arrival=" + p.arrival : ""));

    /* 步骤 3 知识检索 */
    var hits = retrieve(query, 4, cls);
    push(3, t("flow3"), hits.length ? hits.map(function (h) { return (h.type === "matter" ? window.KB.L(h.item, "title") : window.KB.L(h.item, "q")).slice(0, 22) + "(" + h.s.toFixed(3) + ")"; }).join("；") : "无命中条目");

    /* 步骤 4 规则判定 */
    var ruleNote = "—";
    if (hits.length && hits[0].type === "matter") {
      var dl = computeDeadline(hits[0].item, p);
      ruleNote = window.KB.L(hits[0].item.deadline, "label") + (dl.dateStr ? (lang === "zh" ? "（按你的抵达日推算：" : " (estimated from your arrival date: ") + dl.dateStr + ")" : "");
    } else if (hits.length) {
      ruleNote = "按 FAQ 条目直接答复，未触发时限规则";
    }
    push(4, t("flow4"), ruleNote);

    /* 步骤 5 内容生成 */
    var blocks = [], srcKeys = [], needReview = false, conf = 0;
    if (!hits.length) {
      blocks.push("<p>" + t("noAnswer") + "</p>");
      blocks.push('<p><a class="btn btn-sm btn-ghost" href="#review">' + t("transferHuman") + "</a></p>");
    } else {
      hits.slice(0, 3).forEach(function (h) {
        var it = h.item;
        if (h.type === "local") {
          /* 校本条目：机构端导入的本校口径，置顶展示并标注校本徽标 */
          blocks.push(
            '<div style="margin-bottom:10px"><div class="row-between" style="gap:10px;align-items:flex-start">' +
            "<div><strong>" + (lang === "zh" ? it.title : (it.title_en || it.title)) + "</strong></div>" +
            '<span class="badge-src src-S3">' + t("schoolLocal") + "</span></div>" +
            '<p class="small" style="margin:6px 0 0">' + (lang === "zh" ? it.summary : (it.summary_en || it.summary)) + "</p>" +
            (it.channel ? '<p class="tiny muted" style="margin:6px 0 0">' + t("sourceLabel") + (lang === "zh" ? "：" : ": ") + it.channel + "</p>" : "") +
            "</div>"
          );
          needReview = true;
        } else if (h.type === "matter") {
          var mt = matterText(it, lang);
          var dl = computeDeadline(it, p);
          var badge = it.source.indexOf("school") >= 0 || it.source.some(function (k) { return window.KB.SRC[k] && window.KB.SRC[k].level === "S3"; }) ? '<span class="badge-src src-S3">' + t("needReview") + "</span>" : '<span class="badge-src src-S1">S1</span>';
          blocks.push(
            '<div style="margin-bottom:10px"><div class="row-between" style="gap:10px;align-items:flex-start">' +
            "<div><strong>" + mt.title + "</strong></div>" + badge + "</div>" +
            '<p class="small" style="margin:6px 0 0">' + mt.summary + "</p>" +
            (dl.dateStr ? '<p class="small muted" style="margin:6px 0 0">' + t("keyDeadline") + (lang === "zh" ? "：" : ": ") + dl.dateStr + (lang === "zh" ? "（" : " (") + window.KB.L(it.deadline, "label") + ")</p>" : '<p class="small muted" style="margin:6px 0 0">' + t("deadline") + (lang === "zh" ? "：" : ": ") + window.KB.L(it.deadline, "label") + "</p>") +
            "</div>"
          );
          it.source.forEach(function (k) { if (srcKeys.indexOf(k) < 0) srcKeys.push(k); });
          if (it.source.some(function (k) { return window.KB.SRC[k] && window.KB.SRC[k].level === "S3"; })) needReview = true;
        } else {
          blocks.push('<div style="margin-bottom:10px"><div><strong>' + it.q + "</strong></div><p class=\"small\" style=\"margin:6px 0 0\">" + it.a + "</p></div>");
          it.src.forEach(function (k) { if (srcKeys.indexOf(k) < 0) srcKeys.push(k); });
          if (it.level === "S3") needReview = true;
        }
      });
      conf = Math.min(0.95, 0.55 + hits[0].s * 2.2);
    }
    push(5, t("flow5"), "生成 " + blocks.length + " 个回答区块；来源 " + srcKeys.length + " 条");

    /* 步骤 6 合规复核 */
    push(6, t("flow6"), "证据等级 " + (needReview ? "含 S3（待属地复核）" : "S1/S2") + "；AI 生成标识已附加" + (needReview ? "；建议人工复核" : ""));

    var html = blocks.join("");
    html += '<div class="trace"><div class="trace-line"><span class="k">' + t("confidence") + '</span><span>' + (conf ? (conf * 100).toFixed(0) + "%" : "—") + "</span></div>";
    html += '<div class="trace-line"><span class="k">' + t("evidenceLevel") + '</span><span>' + (needReview ? t("levelS3") : t("levelS1")) + "</span></div>";
    html += '<div class="trace-line"><span class="k">' + t("checkedAt") + '</span><span>' + window.KB.META.updated + "</span></div></div>";
    html += '<div class="sugg"><span class="ai-tag">' + t("aiGenerated") + "</span>" +
      '<button class="btn btn-sm btn-ghost" data-action="review">' + t("submitReview") + "</button></div>";

    if (lang !== "zh") html = glossaryTranslate(html, lang);

    return { steps: steps, html: html, sources: window.KB.sources(srcKeys), needReview: needReview, confidence: conf };
  }

  /* 模拟逐步推理（用于演示动效） */
  function askAsync(query, profile, lang, onStep) {
    return new Promise(function (resolve) {
      var result = buildAnswer(query, profile, lang, onStep);
      resolve(result);
    });
  }

  /* ================= 6c. LLM 问答（真模型 + RAG + 轨迹） ================= */
  function buildLLMAnswer(query, profile, lang, history, onStep) {
    var steps = [];
    var push = function (n, title, detail) {
      steps.push({ n: n, title: title, detail: detail });
      if (typeof onStep === "function") onStep(steps.length - 1, steps[steps.length - 1]);
    };
    var p = profile || DEFAULT_PROFILE;
    return new Promise(function (resolve, reject) {
      var cls = classify(query);
      push(1, t("flow1"), cls.intent === "unknown" ? "未识别明确意图，转 LLM 自由回答" : ("intent=" + cls.intent + "，命中关键词 " + cls.hits.length + " 个"));

      var c = window.KB.COUNTRY[p.country] || window.KB.COUNTRY.OTHER;
      push(2, t("flow2"), "purpose=" + p.purpose + "；duration=" + p.duration + "；country=" + (lang === "zh" ? c.zh : (c.en || c.zh)));

      var hits = retrieve(query, 4, cls);
      var ctx = [], srcKeys = [];
      hits.slice(0, 4).forEach(function (h) {
        var it = h.item, label, text, keys, srcText;
        if (h.type === "local") {
          label = it.title; text = it.summary || ""; keys = []; srcText = it.channel || it.sourceNote || "校本口径";
        } else if (h.type === "matter") {
          label = window.KB.L(it, "title"); text = window.KB.L(it, "summary"); keys = it.source;
          srcText = window.KB.sources(keys).map(function (s) { return window.KB.L(s, "name"); }).join("；");
        } else {
          label = window.KB.L(it, "q"); text = window.KB.L(it, "a"); keys = it.src;
          srcText = window.KB.sources(keys).map(function (s) { return window.KB.L(s, "name"); }).join("；");
        }
        ctx.push({ title: label, text: text, src: srcText });
        keys.forEach(function (k) { if (srcKeys.indexOf(k) < 0) srcKeys.push(k); });
      });
      push(3, t("flow3"), ctx.length ? ctx.map(function (x) { return x.title.slice(0, 20); }).join("；") : "无知识条目命中，提示以官方渠道为准");

      var kbCtx = "【知识库条目（回答须以此为准，不得编造政策/时限/流程）】\n" +
        (ctx.length ? ctx.map(function (x, i) { return (i + 1) + ". " + x.title + "：" + x.text + "（来源：" + x.src + "）"; }).join("\n")
                    : "本主题暂无知识库条目，请按通用知识谨慎作答，并明确提示用户以官方渠道为准。");
      push(4, "知识组装（RAG）", "注入知识条目 " + ctx.length + " 条 / " + kbCtx.length + " 字");

      push(5, "调用大模型", "MiniMax-Text-01 · 多轮上下文 " + (history ? history.length : 0) + " 条");
      var msgs = (history || []).slice(-12);
      msgs.push({ role: "user", content: query });
      llmChat(msgs, lang, kbCtx).then(function (res) {
        var reply = (res && res.reply) || "";
        push(6, t("flow6"), "LLM 输出已附加「AI 生成 · 待人工复核」标识；来源 " + srcKeys.length + " 条");
        var html = '<div class="ai-md">' + (window.UI && window.UI.mdToHtml ? window.UI.mdToHtml(reply) : "<p>" + esc(reply) + "</p>") + "</div>";
        if (srcKeys.length) {
          html += '<div class="trace"><div class="trace-line"><span class="k">' + t("sourceLabel") + '</span><span>' +
            window.KB.sources(srcKeys).map(function (s) { return window.KB.L(s, "name"); }).join(lang === "zh" ? "；" : "; ") + "</span></div></div>";
        }
        resolve({ steps: steps, html: html, sources: window.KB.sources(srcKeys), needReview: true, confidence: 0.85, llm: true, reply: reply });
      }).catch(function (e) { reject(e); });
    });
  }

  /* ================= 6d. 机构端材料生成（LLM 版） ================= */
  var trTrace = function (k) {
    return (window.UI && window.UI.L10N && window.UI.L10N.t) ? window.UI.L10N.t(k) : k;
  };
  /* 从任务文本中识别目标国别（中/英文名匹配），无命中返回 OTHER */
  function detectCountry(text) {
    var k = "OTHER";
    if (!text) return k;
    Object.keys(window.KB.COUNTRY).forEach(function (key) {
      var c = window.KB.COUNTRY[key];
      if (text.indexOf(c.zh) >= 0 || (c.en && text.toLowerCase().indexOf(c.en.toLowerCase()) >= 0)) k = key;
    });
    return k;
  }
  function genMaterialLLM(taskText, lang, onStep) {
    var steps = [];
    var push = function (n, title, detail) {
      steps.push({ n: n, title: title, detail: detail });
      if (typeof onStep === "function") onStep(steps.length - 1, steps[steps.length - 1]);
    };
    var fallback = function () {
      push(1, trTrace("traceParse"), trTrace("traceOffline"));
      push(2, trTrace("traceAssemble"), trTrace("traceNoLLM"));
      push(3, trTrace("traceReview"), trTrace("traceAiLabel"));
      var cfg = { template: "t_guide", country: detectCountry(taskText), lang: lang || "zh", topic: taskText, deadline: "", contact: "", extra: "", audience: "国际学生" };
      var r = renderMaterial(cfg);
      return { markdown: r.markdown, title: r.title, sources: r.sources, steps: steps, aiLabel: r.aiLabel, llm: false };
    };
    return new Promise(function (resolve) {
      if (!bridgeOk()) { resolve(fallback()); return; }
      var cls = classify(taskText);
      push(1, trTrace("traceParse"), "intent=" + cls.intent + "；命中关键词 " + cls.hits.length + " 个");
      var countryKey = detectCountry(taskText);
      var cname = window.KB.COUNTRY[countryKey];
      push(2, trTrace("traceCountry"), "country=" + countryKey + "（" + (cname ? cname.zh : "") + "）· 机构端内容工作台");
      var hits = retrieve(taskText, 5, cls);
      var ctx = [], srcKeys = [];
      hits.slice(0, 5).forEach(function (h) {
        var it = h.item;
        var label, text, keys, srcText;
        if (h.type === "local") { label = it.title; text = it.summary || ""; keys = []; srcText = it.channel || it.sourceNote || "校本口径"; }
        else if (h.type === "matter") { label = it.title; text = it.summary; keys = it.source; srcText = window.KB.sources(keys).map(function (s) { return s.name; }).join("；"); }
        else { label = it.q; text = it.a; keys = it.src; srcText = window.KB.sources(keys).map(function (s) { return s.name; }).join("；"); }
        ctx.push({ title: label, text: text, src: srcText });
        keys.forEach(function (k) { if (srcKeys.indexOf(k) < 0) srcKeys.push(k); });
      });
      push(3, trTrace("traceRetrieve"), ctx.length ? ctx.map(function (x) { return x.title.slice(0, 18); }).join("；") : "无命中，提示以官方为准");
      var kbCtx = "【知识库条目（内容须以此为准，不得编造政策/时限/流程）】\n" +
        (ctx.length ? ctx.map(function (x, i) { return (i + 1) + ". " + x.title + "：" + x.text + "（来源：" + x.src + "）"; }).join("\n")
                    : "本主题暂无知识库条目，请按通用知识谨慎撰写，并注明以官方渠道为准。");
      push(4, trTrace("traceCompose"), "注入知识条目 " + ctx.length + " 条 / " + kbCtx.length + " 字");
      push(5, trTrace("traceModel"), "MiniMax-Text-01 · " + trTrace("traceMaterialGen"));
      var cc = window.KB.COUNTRY[countryKey];
      var countryLine = "目标对象：来华" + (cc && cc.zh ? cc.zh : "国际学生") + "留学生；材料须包含该国别的饮食/宗教/节日/礼仪适配提示。";
      var sys = "你是高校国际学生事务部门的助手。请把用户下达的任务编写成一份可直接发布的来华留学材料（Markdown 格式）。要求：1) 分节组织：背景与对象 / 办理事项与步骤 / 所需材料 / 时限与提示 / 紧急联系与来源；2) 内容严格基于知识库条目，不得编造政策、时限、机构与流程；3) 语言务实、可执行、面向留学生；4) 结尾标注「本文档由 AI 生成 · 待人工复核」。";
      llmChat([{ role: "user", content: "任务：" + taskText }], lang, sys + "\n" + countryLine + "\n" + kbCtx).then(function (res) {
        push(6, trTrace("traceReview"), "AI 生成标识已附加；来源 " + srcKeys.length + " 条");
        var md = (res && res.reply) || "";
        var title = taskText.length > 34 ? taskText.slice(0, 34) + "…" : taskText;
        resolve({
          markdown: md, title: title,
          sources: window.KB.sources(srcKeys).map(function (s) { return s.name + "（" + s.org + "）"; }),
          steps: steps, aiLabel: "AI 生成 · 待人工复核", llm: true
        });
      }).catch(function () { resolve(fallback()); });
    });
  }

  /* 知识提炼：粘贴官方原文 → LLM 结构化 → 人工核对入库（机构端知识库） */
  function extractKb(rawText, lang, onStep) {
    var steps = [];
    var push = function (n, title, detail) {
      steps.push({ n: n, title: title, detail: detail });
      if (typeof onStep === "function") onStep(steps.length - 1, steps[steps.length - 1]);
    };
    var fallback = function () {
      push(1, trTrace("traceExtract"), trTrace("traceOfflineExtract"));
      push(2, trTrace("traceExtractSuggest"), trTrace("traceNoLLMFill"));
      return { title: rawText.slice(0, 22), stage: "arrival", pri: "P1", deadline: "以官方/本校公布为准", summary: rawText.slice(0, 80), sourceNote: "", steps: steps, llm: false };
    };
    return new Promise(function (resolve) {
      if (!bridgeOk()) { resolve(fallback()); return; }
      push(1, trTrace("traceExtract"), trTrace("traceInputChars").replace("{n}", rawText.length));
      push(2, trTrace("traceModel"), "MiniMax-Text-01 · " + trTrace("traceStructured"));
      var sys = "你是高校国际学生事务部门的知识库编辑助手。请把用户粘贴的官方原文（国家政策、出入境规定或学校通知）提炼为一条结构化知识条目。只输出严格 JSON：{\"title\":\"事项标题（20字内）\",\"stage\":\"pre|arrival|study|exit 之一\",\"pri\":\"P0|P1|P2\",\"deadline\":\"时限口径，如：报到后7日内（以本校规定为准）；原文无时限则写：以官方/本校公布为准\",\"summary\":\"办理方式、所需材料与注意事项，80-150字，忠实原文不得编造\",\"sourceNote\":\"原文发布机构名称（如：国家移民管理局 / 本校国际学生办公室；无明确机构写：官方公开渠道）\"}。不得编造原文没有的信息。";
      llmChat([{ role: "user", content: "官方原文：\n" + rawText }], lang || "zh", sys).then(function (res) {
        push(3, trTrace("traceExtractSuggest"), trTrace("traceReady"));
        var reply = (res && res.reply) || "";
        var parsed = null;
        var m = reply.match(/\{[\s\S]*\}/);
        if (m) { try { parsed = JSON.parse(m[0]); } catch (e) { parsed = null; } }
        if (parsed && parsed.title) {
          resolve({
            title: String(parsed.title).slice(0, 60), stage: parsed.stage || "arrival", pri: parsed.pri || "P1",
            deadline: parsed.deadline || "以官方/本校公布为准", summary: parsed.summary || "",
            sourceNote: parsed.sourceNote || "官方公开渠道", steps: steps, llm: true
          });
        } else { resolve(fallback()); }
      }).catch(function () { resolve(fallback()); });
    });
  }

  /* 智能问答：代理在线 → 真 LLM；离线 → 规则引擎（双模式，任何环境可演示） */
  function askSmart(query, profile, lang, onStep, history) {
    return new Promise(function (resolve) {
      if (bridgeOk()) {
        buildLLMAnswer(query, profile, lang, history, onStep).then(resolve).catch(function () {
          var r = buildAnswer(query, profile, lang, onStep);
          resolve(r);
        });
      } else {
        var r = buildAnswer(query, profile, lang, onStep);
        resolve(r);
      }
    });
  }

  /* ================= 7. 效率测算（可核查口径） ================= */
  function efficiencyModel(a) {
    a = a || {};
    var minPerCase = a.minPerCase || 12;      /* 单次咨询人工耗时（分钟） */
    var cases = a.cases || 260;               /* 每月重复咨询量（次） */
    var cut = a.cut || 0.55;                  /* 可自助解决比例 */
    var hourly = a.hourly || 60;              /* 综合人力成本（元/小时，含社保与间接成本） */
    var manualH = cases * minPerCase / 60;
    var agentH = cases * (1 - cut) * minPerCase / 60 + cases * 0.6 / 60; /* 剩余人工 + 复核抽检 */
    return {
      manualHours: manualH, agentHours: agentH, savedHours: manualH - agentH,
      manualCost: manualH * hourly, agentCost: agentH * hourly, savedCost: (manualH - agentH) * hourly,
      cut: cut, cases: cases, minPerCase: minPerCase, hourly: hourly
    };
  }

  return {
    classify: classify, retrieve: retrieve, decidePath: decidePath, localKbItems: localKbItems,
    computeDeadline: computeDeadline, buildChecklist: buildChecklist,
    renderMaterial: renderMaterial, askAsync: askAsync, buildAnswer: buildAnswer,
    glossaryTranslate: glossaryTranslate, efficiencyModel: efficiencyModel,
    bridgeOk: bridgeOk, setBridge: setBridge, ensureBridge: ensureBridge, askSmart: askSmart, buildLLMAnswer: buildLLMAnswer, genMaterialLLM: genMaterialLLM, extractKb: extractKb,
    DEFAULT_PROFILE: DEFAULT_PROFILE, LLM_ADAPTER: LLM_ADAPTER, fmt: fmt, srcLine: srcLine
  };
})();
