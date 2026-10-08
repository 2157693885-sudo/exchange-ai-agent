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
  /* 意图门控检索：命中明确意图时给对应事项加权；过境免签条目只在用户明确询问时召回，
     避免"学习签证"类问题被"240小时过境免签"等高相似文本干扰。 */
  function retrieve(query, topK, intent) {
    topK = topK || 4;
    var pool = [];
    var intentMatter = intent && intent.matter;
    var qHasTransit = TRANSIT_RE.test(query);
    window.KB.MATTERS.forEach(function (m) {
      var doc = [m.title, m.title_en, m.summary, m.summary_en, (m.docs || []).join(" "), (m.docs_en || []).join(" "), m.risk, m.risk_en, m.channel, m.channel_en].join(" ");
      var s = score(query, doc);
      if (intentMatter && m.id === intentMatter) s += 0.35;      /* 意图对应事项加权 */
      if (intentMatter && m.applies && (m.applies.purposes || []).indexOf("transit") >= 0 && !qHasTransit) s -= 0.5;
      if (m.id === "arr_reg24" && intentMatter && intentMatter !== "arr_reg24") s += 0.12; /* 住宿登记是全周期高频第一步 */
      pool.push({ type: "matter", id: m.id, item: m, s: s });
    });
    window.KB.FAQ.forEach(function (f, i) {
      var s = score(query, (f.q + " " + f.a + " " + (f.q_en || "") + " " + (f.a_en || "")));
      var isTransitFaq = TRANSIT_RE.test(f.q) || TRANSIT_RE.test(f.a);
      if (isTransitFaq && !qHasTransit) s = 0;                    /* 过境类问答不主动混入 */
      if (s > 0 && f.level === "S3" && !qHasTransit) s -= 0.05;   /* S3 待复核条目轻微降权 */
      pool.push({ type: "faq", id: "faq" + i, item: f, s: s });
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
    return { date: d, dateStr: d ? fmt(d) : "", urgency: urgency, days: days, label: zh ? m.deadline.label : (m.deadline.label_en || m.deadline.label) };
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
    ids.forEach(function (id) { if (!seen[id]) { seen[id] = 1; var m = window.KB.matter(id); if (m) list.push(m); } });
    return list.map(function (m) {
      return { matter: m, deadline: computeDeadline(m, p), done: false };
    }).sort(function (a, b) {
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
      title: zh ? m.title : (m.title_en || m.title),
      summary: zh ? m.summary : (m.summary_en || m.summary),
      docs: zh ? (m.docs || []) : (m.docs_en || m.docs || []),
      channel: zh ? m.channel : (m.channel_en || m.channel),
      risk: zh ? m.risk : (m.risk_en || m.risk),
      label: zh ? (m.deadline ? m.deadline.label : "") : (m.deadline ? (m.deadline.label_en || m.deadline.label) : "")
    };
  }

  function srcLine(keys) {
    var zh = !window.L10N || String(window.L10N.current).slice(0, 2) === "zh";
    return window.KB.sources(keys).map(function (s) {
      return (zh ? s.name : (s.name_en || s.name)) + " · " + (zh ? s.org : (s.org_en || s.org)) + (s.url ? (zh ? "（" + s.url + "）" : " (" + s.url + ")") : "") + " · " + t("checkedAt") + " " + s.checked + " · " + s.level;
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
      es: { head: "Título", sec: "Secciones", src: "Fuentes", note: "Generado por el estudio de contenido. Requiere revisión humana.", country: "Adaptación por país", deadline: "Plazo", contact: "Contacto", topic: "Tema", cf: "Contexto religioso", cd: "Alimentación", cfe: "Fiestas", cl: "Idiomas", ct: "Etiqueta", docs: "Documentos requeridos", channel: "Cómo tramitar", extra: "Requisitos adicionales" }
    }[lang] || null;
    if (!L) L = { head: "Title", sec: "Sections", src: "Sources", note: "", country: "Country adaptation", deadline: "Deadline", contact: "Contact", topic: "Topic", cf: "Religious background", cd: "Dietary notes", cfe: "Main festivals", cl: "Common languages", ct: "Communication & etiquette", docs: "Required documents", channel: "How to apply", extra: "Additional requirements" };
    var secs = isZh ? tpl.sections : (tpl.sections_en || tpl.sections);

    var title = (cfg.topic || tpl.name) + (cfg.country && cfg.country !== "OTHER" ? " · " + (isZh ? c.zh : c.en) : "");

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
    if (cfg.deadline) body.push("**" + L.deadline + "**：" + cfg.deadline);
    body.push("");
    body.push("### " + (isZh ? "一、事项说明" : "1. " + L.topic));
    body.push(isZh
      ? "本材料面向" + c.zh + "籍" + (cfg.audience || "国际学生") + "，就「" + (cfg.topic || tpl.name) + "」事项提供办理指引。所有信息来源于官方渠道，标注证据等级与核对日期，发布前请按本校口径复核。"
      : "This material provides procedural guidance on \"" + (cfg.topic || tpl.name) + "\" for students from " + c.en + ". All information is drawn from official channels with evidence levels and verification dates; please review against your institution's requirements before release.");
    body.push("");
    body.push("### " + (isZh ? "二、办理要点" : "2. Key steps"));
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
        body.push(isZh ? "- 请按本校与主管部门最新要求办理（可由机构端补充具体步骤）。" : "- Follow your institution's and the competent authority's latest requirements (specific steps may be added by the institution).");
      }
    });

    /* 国别与信仰适配 */
    if (c.diet || c.fest) {
      body.push("");
      body.push("### " + (isZh ? "三、" : "3. ") + L.country);
      body.push("- " + L.cf + "：" + (isZh ? c.faith : c.faith_en || c.faith));
      body.push("- " + L.cd + "：" + (isZh ? c.diet : c.diet_en || c.diet));
      if (c.fest && c.fest.length) body.push("- " + L.cfe + "：" + (isZh ? c.fest.join("、") : (c.fest_en || c.fest).join(", ")));
      if (c.lang) body.push("- " + L.cl + "：" + cLang(c, isZh));
      (c.tips_en && !isZh ? c.tips_en : (c.tips || [])).forEach(function (x) { body.push("- " + x); });
      body.push("");
      body.push("> " + (isZh ? "国别适配为跨文化沟通提示，不构成宗教或法律依据，请尊重个体差异。" : "Country adaptation is a cross-cultural communication aid, not a religious or legal reference. Respect individual differences."));
    }

    /* 所需材料 */
    var docs = [];
    usedMatters.forEach(function (m) {
      var _ds = isZh ? (m.docs || []) : (m.docs_en || m.docs || []);
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
      var _ch = isZh ? m.channel : (m.channel_en || m.channel);
      if (_ch && channels.indexOf(_ch) < 0) channels.push(_ch);
    });
    if (channels.length) {
      body.push("");
      body.push("### " + (isZh ? "五、" : "5. ") + L.channel);
      channels.slice(0, 4).forEach(function (ch) { body.push("- " + ch); });
    }

    /* 补充要求与联系方式 */
    if (cfg.extra) { body.push(""); body.push("### " + (isZh ? "六、" : "6. ") + L.extra); body.push(cfg.extra); }
    if (cfg.contact) { body.push(""); body.push("**" + L.contact + "**：" + cfg.contact); }
    body.push("");
    body.push("---");
    body.push("> " + L.note);
    body.push("> " + t("footerNote"));

    return {
      title: title, markdown: body.join("\n"),
      sources: srcLine(usedSrc),
      aiLabel: lang === "zh" || lang === "en" ? t("aiGenerated") : t("aiGenerated") + " / machine-translated",
      needsHuman: true, lang: lang, template: tpl.name
    };
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
  function buildAnswer(query, profile, lang, onStep) {
    var steps = [];
    var push = function (n, title, detail) {
      steps.push({ n: n, title: title, detail: detail });
      if (typeof onStep === "function") onStep(steps.length - 1, steps[steps.length - 1]);
    };
    var p = profile || DEFAULT_PROFILE;

    /* 步骤 1 意图识别 */
    var cls = classify(query);
    push(1, t("flow1"), cls.intent === "unknown" ? "未识别明确意图，转入通用检索" : ("intent=" + cls.intent + "，命中关键词 " + cls.hits.join(" / ")));

    /* 步骤 2 画像读取 */
    var c = window.KB.COUNTRY[p.country] || window.KB.COUNTRY.OTHER;
    push(2, t("flow2"), "purpose=" + p.purpose + "；duration=" + p.duration + "；country=" + (lang === "zh" ? c.zh : (c.en || c.zh)) + (p.arrival ? "；arrival=" + p.arrival : ""));

    /* 步骤 3 知识检索 */
    var hits = retrieve(query, 4, cls);
    push(3, t("flow3"), hits.length ? hits.map(function (h) { return (h.type === "matter" ? (lang === "zh" ? h.item.title : (h.item.title_en || h.item.title)) : (lang === "zh" ? h.item.q : (h.item.q_en || h.item.q))).slice(0, 22) + "(" + h.s.toFixed(3) + ")"; }).join("；") : "无命中条目");

    /* 步骤 4 规则判定 */
    var ruleNote = "—";
    if (hits.length && hits[0].type === "matter") {
      var dl = computeDeadline(hits[0].item, p);
      ruleNote = (lang === "zh" ? hits[0].item.deadline.label : (hits[0].item.deadline.label_en || hits[0].item.deadline.label)) + (dl.dateStr ? (lang === "zh" ? "（按你的抵达日推算：" : " (estimated from your arrival date: ") + dl.dateStr + ")" : "");
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
        if (h.type === "matter") {
          var mt = matterText(it, lang);
          var dl = computeDeadline(it, p);
          var badge = it.source.indexOf("school") >= 0 || it.source.some(function (k) { return window.KB.SRC[k] && window.KB.SRC[k].level === "S3"; }) ? '<span class="badge-src src-S3">' + t("needReview") + "</span>" : '<span class="badge-src src-S1">S1</span>';
          blocks.push(
            '<div style="margin-bottom:14px"><div class="row-between" style="gap:10px;align-items:flex-start">' +
            "<div><strong>" + mt.title + "</strong></div>" + badge + "</div>" +
            '<p class="small" style="margin:6px 0 0">' + mt.summary + "</p>" +
            (dl.dateStr ? '<p class="small muted" style="margin:6px 0 0">' + t("keyDeadline") + (lang === "zh" ? "：" : ": ") + dl.dateStr + (lang === "zh" ? "（" : " (") + (lang === "zh" ? it.deadline.label : (it.deadline.label_en || it.deadline.label)) + ")</p>" : '<p class="small muted" style="margin:6px 0 0">' + t("deadline") + (lang === "zh" ? "：" : ": ") + (lang === "zh" ? it.deadline.label : (it.deadline.label_en || it.deadline.label)) + "</p>") +
            '<p class="tiny muted" style="margin:6px 0 0">' + t("sourceLabel") + (lang === "zh" ? "：" : ": ") + window.KB.sources(it.source).map(function (s) { return lang === "zh" ? s.name : (s.name_en || s.name); }).join(lang === "zh" ? "；" : "; ") + "</p>" +
            "</div>"
          );
          it.source.forEach(function (k) { if (srcKeys.indexOf(k) < 0) srcKeys.push(k); });
          if (it.source.some(function (k) { return window.KB.SRC[k] && window.KB.SRC[k].level === "S3"; })) needReview = true;
        } else {
          blocks.push('<div style="margin-bottom:14px"><div><strong>' + it.q + "</strong></div><p class=\"small\" style=\"margin:6px 0 0\">" + it.a + "</p>" +
            '<p class="tiny muted" style="margin:6px 0 0">' + t("sourceLabel") + "：" + window.KB.sources(it.src).map(function (s) { return s.name; }).join("；") + "</p></div>");
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
        var it = h.item;
        var label, text, keys;
        if (h.type === "matter") { label = lang === "zh" ? it.title : (it.title_en || it.title); text = lang === "zh" ? it.summary : (it.summary_en || it.summary); keys = it.source; }
        else { label = lang === "zh" ? it.q : (it.q_en || it.q); text = lang === "zh" ? it.a : (it.a_en || it.a); keys = it.src; }
        ctx.push({ title: label, text: text, src: window.KB.sources(keys).map(function (s) { return lang === "zh" ? s.name : (s.name_en || s.name); }).join("；") });
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
            window.KB.sources(srcKeys).map(function (s) { return lang === "zh" ? s.name : (s.name_en || s.name); }).join(lang === "zh" ? "；" : "; ") + "</span></div></div>";
        }
        resolve({ steps: steps, html: html, sources: window.KB.sources(srcKeys), needReview: true, confidence: 0.85, llm: true, reply: reply });
      }).catch(function (e) { reject(e); });
    });
  }

  /* ================= 6d. 机构端材料生成（LLM 版） ================= */
  function genMaterialLLM(taskText, lang, onStep) {
    var steps = [];
    var push = function (n, title, detail) {
      steps.push({ n: n, title: title, detail: detail });
      if (typeof onStep === "function") onStep(steps.length - 1, steps[steps.length - 1]);
    };
    var fallback = function () {
      push(1, "任务解析", "离线模式 · 规则引擎兜底");
      push(2, "材料组装", "基于模板与知识库快速生成（未调用 LLM）");
      push(3, "合规复核", "AI 生成标识已附加，待人工复核");
      var cfg = { template: "t_guide", country: "KZ", lang: lang || "zh", topic: taskText, deadline: "", contact: "", extra: "", audience: "国际学生" };
      var r = renderMaterial(cfg);
      return { markdown: r.markdown, title: r.title, sources: r.sources, steps: steps, aiLabel: r.aiLabel, llm: false };
    };
    return new Promise(function (resolve) {
      if (!bridgeOk()) { resolve(fallback()); return; }
      var cls = classify(taskText);
      push(1, "任务解析", "intent=" + cls.intent + "；命中关键词 " + cls.hits.length + " 个");
      var countryKey = "OTHER";
      Object.keys(window.KB.COUNTRY).forEach(function (k) {
        var c = window.KB.COUNTRY[k];
        if (taskText.indexOf(c.zh) >= 0 || (c.en && taskText.toLowerCase().indexOf(c.en.toLowerCase()) >= 0)) countryKey = k;
      });
      var cname = window.KB.COUNTRY[countryKey];
      push(2, "国别与受众", "country=" + countryKey + "（" + (cname ? cname.zh : "") + "）· 机构端内容工作台");
      var hits = retrieve(taskText, 5, cls);
      var ctx = [], srcKeys = [];
      hits.slice(0, 5).forEach(function (h) {
        var it = h.item;
        var label, text, keys;
        if (h.type === "matter") { label = it.title; text = it.summary; keys = it.source; }
        else { label = it.q; text = it.a; keys = it.src; }
        ctx.push({ title: label, text: text, src: window.KB.sources(keys).map(function (s) { return s.name; }).join("；") });
        keys.forEach(function (k) { if (srcKeys.indexOf(k) < 0) srcKeys.push(k); });
      });
      push(3, "知识检索（RAG）", ctx.length ? ctx.map(function (x) { return x.title.slice(0, 18); }).join("；") : "无命中，提示以官方为准");
      var kbCtx = "【知识库条目（内容须以此为准，不得编造政策/时限/流程）】\n" +
        (ctx.length ? ctx.map(function (x, i) { return (i + 1) + ". " + x.title + "：" + x.text + "（来源：" + x.src + "）"; }).join("\n")
                    : "本主题暂无知识库条目，请按通用知识谨慎撰写，并注明以官方渠道为准。");
      push(4, "知识组装（RAG）", "注入知识条目 " + ctx.length + " 条 / " + kbCtx.length + " 字");
      push(5, "调用大模型", "MiniMax-Text-01 · 材料生成");
      var sys = "你是高校国际学生事务部门的助手。请把用户下达的任务编写成一份可直接发布的来华留学材料（Markdown 格式）。要求：1) 分节组织：背景与对象 / 办理事项与步骤 / 所需材料 / 时限与提示 / 紧急联系与来源；2) 内容严格基于知识库条目，不得编造政策、时限、机构与流程；3) 语言务实、可执行、面向留学生；4) 结尾标注「本文档由 AI 生成 · 待人工复核」。";
      llmChat([{ role: "user", content: "任务：" + taskText }], lang, sys + "\n" + kbCtx).then(function (res) {
        push(6, "合规复核", "AI 生成标识已附加；来源 " + srcKeys.length + " 条");
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
    classify: classify, retrieve: retrieve, decidePath: decidePath,
    computeDeadline: computeDeadline, buildChecklist: buildChecklist,
    renderMaterial: renderMaterial, askAsync: askAsync, buildAnswer: buildAnswer,
    glossaryTranslate: glossaryTranslate, efficiencyModel: efficiencyModel,
    bridgeOk: bridgeOk, setBridge: setBridge, ensureBridge: ensureBridge, askSmart: askSmart, buildLLMAnswer: buildLLMAnswer, genMaterialLLM: genMaterialLLM,
    DEFAULT_PROFILE: DEFAULT_PROFILE, LLM_ADAPTER: LLM_ADAPTER, fmt: fmt, srcLine: srcLine
  };
})();
