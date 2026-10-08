/* =========================================================================
   来华交流全程助手 · 学生端 v3
   五板块（首页 / 访华指南 / 校园学习 / 日常生活 / 我的）+ 全局悬浮助手
   依赖：KB · KBM · Agent · UI · L10N
   ========================================================================= */

(function () {
  "use strict";

  var T = function (k) { return window.L10N.t(k); };
  var I = window.UI.ICONS;
  var ic = function (n) { return window.UI.icon(n); };
  var esc = window.UI.esc;

  var S = {
    mod: "home",
    profile: window.UI.load("v3_profile", null),
    done: window.UI.load("v3_done", []),
    star: window.UI.load("v3_star", []),
    open: {}
  };
  window.__S = S;     /* 便于验收脚本检查 */

  /* =====================================================================
     0. 工具
     ===================================================================== */
  function days(fromStr) {
    if (!fromStr) return null;
    var d = new Date(fromStr + "T09:00:00");
    if (isNaN(d)) return null;
    return Math.round((d - new Date()) / 86400000);
  }
  function addDaysStr(s, n) {
    if (!s) return null;
    var d = new Date(s + "T09:00:00");
    if (isNaN(d)) return null;
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
  }
  function fmtDate(s) { return s ? String(s).replace(/-/g, ".") : "—"; }

  function stageOf(p) {
    if (!p || !p.arrival) return "pre";
    var a = days(p.arrival);
    if (a > 0) return "pre";
    if (a >= -30) return "arrival";
    var e = p.enroll ? days(p.enroll) : null;
    if (e !== null && e >= -30) return "arrival";
    if (a < -30) return "study";
    return "study";
  }

  /* 高频推荐条目标题：非中英语种内联翻译（长句超出术语表能力，这里显式提供） */
  var REC_T = {
    "判定并申请来华签证类型": {ru: "Определение и подача на визу нужного типа", ar: "تحديد نوع التأشيرة الصحيحة والتقديم عليها", fr: "Déterminer et demander le bon type de visa", es: "Determinar y solicitar el tipo de visado correcto"},
    "体检与《外国人体格检查记录》": {ru: "Медосмотр и «Запись иностранца о медобследовании»", ar: "الفحص الطبي و«سجل الفحص الطبي للأجانب»", fr: "Visite médicale et «Formulaire d'examen médical des étrangers»", es: "Reconocimiento médico y «Registro de examen médico para extranjeros»"},
    "落实来华期间的医疗保障": {ru: "Медицинская страховка на время пребывания", ar: "التغطية الطبية خلال الإقامة في الصين", fr: "Couverture médicale pendant le séjour", es: "Cobertura médica durante la estancia"},
    "支付准备：境外卡绑定与应急现金": {ru: "Оплата: привязка зарубежной карты и наличные на экстренный случай", ar: "الاستعداد للدفع: ربط بطاقة خارجية والاحتفاظ بنقود للطوارئ", fr: "Paiements : lier une carte étrangère et garder du liquide", es: "Pagos: vincular una tarjeta del extranjero y llevar efectivo de reserva"}
  };

  function matterById(id) { return window.KB.matter(id); }
  function matterText(m) {
    var zh = isZh();
    var tr = REC_T[m.title];
    var cur = window.L10N.current;
    return { title: kbText(zh ? m.title : ((tr && tr[cur]) || m.title_en || m.title)),
             desc: kbText(zh ? m.summary : (m.summary_en || m.summary)),
             label: zh ? (m.deadline ? m.deadline.label : "") : (m.deadline ? (m.deadline.label_en || m.deadline.label) : ""),
             docs: zh ? (m.docs || []) : (m.docs_en || m.docs || []),
             channel: zh ? m.channel : (m.channel_en || m.channel),
             risk: zh ? m.risk : (m.risk_en || m.risk) };
  }
  /* 知识内容以中文为权威源。非中英语种：有 _en 用 _en，
     无 _en 的字段走术语表翻译，并在卡片上标注「待人工复核」。 */
  function isZh() { return String(window.L10N.current).slice(0, 2) === "zh"; }
  function kbText(s) {
    if (!s || isZh()) return s || "";
    try { return window.Agent.glossaryTranslate(s, window.L10N.current); } catch (e) { return s; }
  }
  function reviewTag() {
    if (isZh()) return "";
    return '<span class="badge badge-warn" style="margin-top:11px;display:inline-block">' + T("stNeedReview") + "</span>";
  }

  function srcPill(srcKey) {
    var s = window.KBM.src(srcKey);
    if (!s) return "";
    var L = window.KBM.L;
    var cls = s.level === "S3" ? "src s3" : "src";
    /* KB.SRC 与 KBM.SRC 均以中文为权威源；非中英语种走术语表翻译并标待复核 */
    var nmTxt = esc(L(s, "name")), orgTxt = esc(L(s, "org"));
    if (!isZh()) { nmTxt = esc(kbText(s.name_en || s.name)); orgTxt = esc(kbText(s.org_en || s.org)); }
    var nm = s.url ? '<a href="' + esc(s.url) + '" target="_blank" rel="noopener">' + nmTxt + "</a>" : nmTxt;
    var note = isZh() ? "" : " · " + T("stNeedReview");
    return '<span class="' + cls + '">' + I.shield + "<span>" + nm + " · " + orgTxt +
      " · " + T("checkedAt") + " " + esc(s.checked) + " · " + esc(s.level) + note + "</span></span>";
  }
  function linksRow(links) {
    if (!links || !links.length) return "";
    var L = window.KBM.L;
    return '<div class="row">' + links.map(function (l) {
      var nm = esc(L(l, "name"));
      if (l.url) return '<a class="link" href="' + esc(l.url) + '" target="_blank" rel="noopener">' + I.external + nm + "</a>";
      return '<span class="link dis" title="' + T("stNoAuth") + '">' + I.lock + nm + " · " + T("stNoAuth") + "</span>";
    }).join("") + "</div>";
  }

  /* =====================================================================
     1. 骨架：页头 / 页脚 / 标签栏
     ===================================================================== */
  function buildChrome() {
    /* 学生端已独立成应用：页头不再挂机构端/工作流/数据等入口，只留返回入口页 */
    document.getElementById("chrome-top").innerHTML = window.UI.header("student").replace(
      /<nav class="nav"[\s\S]*?<\/nav>/,
      '<nav class="nav" aria-label="主导航"><a href="index.html" data-i18n="backHome">' + T("backHome") + "</a></nav>"
    );
    document.getElementById("chrome-bottom").innerHTML = window.UI.footer("");
    /* header/footer 模板为中文占位，渲染后按当前语言即时翻译 */
    window.L10N.apply(window.L10N.current);

    document.getElementById("iFab").innerHTML = I.sparkle;
    document.getElementById("iX").innerHTML = I.close;
    document.getElementById("iTl").innerHTML = I.flow;
    document.getElementById("iRec").innerHTML = I.sparkle;
    document.getElementById("iEmg").innerHTML = I.alert;
    var sb = document.getElementById("sbIco");
    if (sb) sb.innerHTML = I.search;
    document.getElementById("iTier").innerHTML = I.layers;
    document.getElementById("iProf").innerHTML = I.users;
    document.getElementById("iSet").innerHTML = I.target;
    document.getElementById("iCl").innerHTML = I.list;
    document.getElementById("iPriv").innerHTML = I.shield;
  }

  function buildTabs() {
    var box = document.getElementById("tabbar");
    box.innerHTML = window.KBM.MODULES.map(function (m) {
      return '<button class="tab" role="tab" data-mod="' + m.id + '" aria-selected="false">' +
        '<span class="ico">' + I[m.icon] + "</span>" +
        '<span class="lb">' + esc(T(m.nav)) + "</span></button>";
    }).join("");
    box.querySelectorAll(".tab").forEach(function (b) {
      b.addEventListener("click", function () { go(b.getAttribute("data-mod")); });
    });
  }

  function go(mod, noScroll) {
    S.mod = mod;
    document.querySelectorAll(".mod").forEach(function (s) {
      s.classList.toggle("active", s.getAttribute("data-mod") === mod);
    });
    document.querySelectorAll("#tabbar .tab").forEach(function (b) {
      b.setAttribute("aria-selected", b.getAttribute("data-mod") === mod ? "true" : "false");
    });
    if (!noScroll) window.scrollTo({ top: 0, behavior: "smooth" });
  }

  /* =====================================================================
     2. 首页
     ===================================================================== */
  function renderHome() {
    var p = S.profile;
    var hasP = !!(p && p.country && p.purpose);

    /* 问候语 */
    var h = new Date().getHours();
    var gk = h < 6 ? "greetNight" : h < 11 ? "greetMorning" : h < 14 ? "greetNoon" : h < 18 ? "greetAfternoon" : "greetEvening";
    document.getElementById("homeWelcome").textContent = hasP
      ? T("homeWelcomeTpl").replace("{greet}", T(gk)).replace("{stage}", T("stage" + cap(stageOf(p))))
      : T("homeBuildProfile");

    /* 未建档引导 */
    document.getElementById("homeNoProfile").innerHTML = hasP ? "" :
      '<div class="card card-pad-lg" style="border-color:var(--brand-200);background:var(--surface);box-shadow:var(--sh-1)">' +
      '<div class="card-title">' + esc(T("homeNoProfile")) + "</div>" +
      '<p class="small muted" style="margin:8px 0 16px;line-height:1.7">' + esc(T("homeBuildProfile")) + "</p>" +
      '<button class="btn" id="goProfile">' + ic("plus") + esc(T("generate")) + "</button></div>";

    /* 行程卡：倒计时 + 今日待办合并为一张卡 */
    var cd = [];
    if (hasP) {
      if (p.arrival) cd.push({ k: "daysToArrival", d: days(p.arrival) });
      if (p.enroll) cd.push({ k: "daysToEnroll", d: days(p.enroll) });
    if (hasP && p.permitExpiry) cd.push({ k: "daysToExpire", d: days(p.permitExpiry), note: fmtDate(p.permitExpiry) });
    }
    var todos = buildTodos(p);
    var cur = stageOf(p);
    var order2 = ["pre", "arrival", "study", "exit"];
    var ci2 = order2.indexOf(cur);
    var trip = document.getElementById("homeTripBox");
    if (!trip) { throw new Error("no homeTripBox"); }
    if (!hasP) {
      trip.innerHTML = "";
    }
    else {
      var cdHtml = cd.map(function (x) {
        var cls = "cd", v;
        if (x.d === null) { cls += " none"; v = T("daysNotSet"); }
        else if (x.d < 0) { cls += " overdue"; v = T("daysOverdue"); }
        else { if (x.d <= 7) cls += " urgent"; v = x.d + "<small>" + T("daysUnit") + "</small>"; }
        return '<div class="' + cls + '"><div class="k">' + esc(T(x.k)) + "</div><div class=\"v\">" + v + "</div>" +
          (x.note ? '<div class="mt tiny muted" style="margin-top:6px">' + esc(x.note) + "</div>" : "") + "</div>";
      }).join("");
      var todoHtml = todos.length ? todos.map(function (x) {
        return '<div class="todo pri-' + x.pri + '">' +
          '<span class="bar"></span>' +
          "<div><div class=\"tx\">" + esc(x.text) + "</div>" +
          '<div class="mt">' + esc(x.meta) + "</div></div>" +
          '<button class="go" data-jump="' + esc(x.group) + '">' + T("viewDetail") + "</button></div>";
      }).join("") : '<p class="small muted" style="margin:2px 0 0;line-height:1.6">' + esc(T("homeTodayEmpty")) + "</p>";
      trip.innerHTML =
        '<div class="trip">' +
          '<div class="trip-head">' +
            '<span class="trip-cur"><span class="th">' + esc(T("tripStage")) + "</span><b>" + esc(T("stage" + cap(cur))) + "</b></span>" +
            '<span class="trip-prog"><span class="bar"><i style="width:' + Math.round((ci2 + 1) / 4 * 100) + '%"></i></span><em>' + (ci2 + 1) + "/4</em></span>" +
          "</div>" +
          '<div class="trip-cd">' + cdHtml + "</div>" +
          '<div class="trip-todo"><span class="th">' + esc(T("homeToday")) + "</span>" + todoHtml + "</div>" +
        "</div>";
    }

    /* 阶段时间轴 */
    var cur = stageOf(p);
    var order = ["pre", "arrival", "study", "exit"];
    var ci = order.indexOf(cur);
    document.getElementById("tlBox").innerHTML = order.map(function (st, i) {
      var cls = "tl-item" + (i === ci ? " on" : (i < ci ? " past" : ""));
      var icon = ["plane", "key", "book2", "right"][i];
      return '<div class="' + cls + '"><div class="tl-dot">' + I[icon] + "</div>" +
        '<div class="nm">' + esc(T("stage" + cap(st))) + "</div>" +
        '<div class="ds">' + esc(T("stage" + cap(st) + "Desc")) + "</div></div>";
    }).join("");

    /* 推荐 */
    var ms = window.KB.mattersByStage(cur).slice(0, 3);
    document.getElementById("recBox").innerHTML = ms.map(function (m) { return accCard(m); }).join("");

    /* 紧急联系 */
    var LE = window.KBM.L;
    document.getElementById("emgBox").innerHTML = window.KBM.EMERGENCY.map(function (e) {
      var isNum = /^\d+$/.test(e.num);
      var inner = '<span class="num">' + esc(e.num) + '</span><span><span class="lb">' + esc(LE(e, "label")) +
        '</span><div class="nt">' + esc(LE(e, "note")) + "</div></span>";
      return isNum ? '<a href="tel:' + e.num + '">' + inner + "</a>" : '<div class="em">' + inner + "</div>";
    }).join("");

    bindAcc();
    var gp = document.getElementById("goProfile");
    if (gp) gp.addEventListener("click", function () { go("mine"); });
  }

  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

  function buildTodos(p) {
    if (!p || !p.arrival) return [];
    var out = [];
    window.KBM.TODO_RULES.forEach(function (r) {
      var anchor = r.anchor === "arrival" ? p.arrival
        : r.anchor === "enroll" ? (p.enroll || p.arrival)
        : r.anchor === "permit" ? p.permitExpiry
        : p.arrival;
      if (!anchor) return;                     /* 未提供居留许可到期日则不推算延期提醒 */
      var target = addDaysStr(anchor, r.offset);
      var d = days(target);
      if (d === null) return;
      if (d > 30) return;                     /* 只看 30 天内 */
      var refs = r.refs.map(matterById).filter(Boolean);
      if (!refs.length) return;
      var mt = matterText(refs[0]);
      var meta = T("deadline") + " " + fmtDate(target);
      if (d < 0) meta = T("daysOverdue") + " · " + fmtDate(target);
      else if (d === 0) meta = "今天 · " + fmtDate(target);
      else meta = meta + " · " + d + " " + T("daysUnit");
      out.push({ pri: d < 0 ? "high" : r.pri, text: mt.title, meta: meta, group: refs[0].id });
    });
    out.sort(function (a, b) { return (a.pri === "high" ? 0 : 1) - (b.pri === "high" ? 0 : 1); });
    return out;
  }

  /* =====================================================================
     3. 访华指南
     ===================================================================== */
  function accCard(m, extra) {
    var mt = matterText(m);
    var open = !!S.open["m_" + m.id];
    return '<div class="acc' + (open ? " open" : "") + '" data-acc="m_' + esc(m.id) + '">' +
      '<div class="acc-h"><span class="acc-ico">' + ic(extra && extra.icon || "doc") + "</span>" +
      "<div><h3>" + esc(mt.title) + "</h3><p>" + esc(extra && extra.sub || T("matter" + cap(m.stage) + "Hint")) + "</p></div>" +
      '<span class="cv">' + I.down + "</span></div>" +
      '<div class="acc-b"><p class="desc">' + esc(mt.desc) + "</p>" +
      (m.deadline && m.deadline.label ? '<div class="dl">' + ic("clock") + " " + esc(mt.label || m.deadline.label) + "</div>" : "") +
      (m.channel ? '<div class="dl">' + ic("external") + " " + esc(mt.channel || m.channel) + "</div>" : "") +
      (m.risk ? '<div class="dl" style="color:var(--amber-700)">' + ic("alert") + " " + esc(mt.risk || m.risk) + "</div>" : "") +
      srcPill(m.source) + reviewTag() +
      "</div></div>";
  }

  function renderGuide() {
    var L = window.KBM.L;
    document.getElementById("guideBox").innerHTML = window.KBM.GUIDE_GROUPS.map(function (g) {
      var ms = g.matters.map(matterById).filter(Boolean);
      return '<div class="sec-title"><span class="ico">' + ic(g.icon) + "</span><span>" + esc(L(g, "title")) +
        '</span><span class="count">' + ms.length + " " + T("guideItems") + "</span></div>" +
        '<p class="small muted" style="margin:-8px 0 16px">' + esc(L(g, "desc")) + "</p>" +
        '<div class="cards">' + ms.map(function (m) { return accCard(m, { sub: L(g, "desc") }); }).join("") + "</div>";
    }).join("");
    bindAcc();
  }

  /* =====================================================================
     4. 校园学习
     ===================================================================== */
  function renderCampus() {
    var L = window.KBM.L;
    document.getElementById("tierBox").innerHTML = window.KBM.CAMPUS_TIERS.map(function (x) {
      var cur = x.level === 1;
      return '<div class="t' + (cur ? " cur" : "") + '"><div class="lv">' + esc(T("campusTier")) + " " + x.level + "</div>" +
        "<h4>" + esc(L(x, "name")) + '<span class="badge ' + (cur ? "badge-now" : "badge-wait") + '">' +
        esc(cur ? T("campusTierNow") : L(x, "status")) + "</span></h4>" +
        "<p>" + esc(L(x, "desc")) + "</p></div>";
    }).join("");

    document.getElementById("campusBox").innerHTML = window.KBM.CAMPUS.map(function (c) {
      var open = !!S.open["c_" + c.id];
      var t = L(c, "title"), d = L(c, "desc");
      return '<div class="acc' + (open ? " open" : "") + '" data-acc="c_' + esc(c.id) + '">' +
        '<div class="acc-h"><span class="acc-ico">' + ic(c.icon) + "</span>" +
        "<div><h3>" + esc(t) + "</h3><p>" + esc(d.slice(0, 34)) + "…</p></div>" +
        '<span class="cv">' + I.down + "</span></div>" +
        '<div class="acc-b"><p class="desc">' + esc(d) + "</p>" +
        linksRow(c.links) + srcPill(c.src) + "</div></div>";
    }).join("");
    bindAcc();
  }

  /* =====================================================================
     5. 日常生活
     ===================================================================== */
  function renderDaily() {
    var L = window.KBM.L;
    document.getElementById("dailyBox").innerHTML = window.KBM.DAILY.map(function (d) {
      var open = !!S.open["d_" + d.id];
      var refs = (d.refs || []).map(matterById).filter(Boolean);
      var more = refs.map(function (m) {
        var mt = matterText(m);
        return '<div class="dl" style="margin-top:10px">' + ic("info") + " <b>" + esc(mt.title) + "</b><br>" + esc(mt.desc.slice(0, 150)) + "…</div>";
      }).join("");
      var t = L(d, "title"), ds = L(d, "desc");
      return '<div class="acc' + (open ? " open" : "") + '" data-acc="d_' + esc(d.id) + '">' +
        '<div class="acc-h"><span class="acc-ico">' + ic(d.icon) + "</span>" +
        "<div><h3>" + esc(t) + "</h3><p>" + esc(ds.slice(0, 34)) + "…</p></div>" +
        '<span class="cv">' + I.down + "</span></div>" +
        '<div class="acc-b"><p class="desc">' + esc(ds) + "</p>" + more +
        srcPill(d.src) + "</div></div>";
    }).join("");
    bindAcc();
  }

  /* =====================================================================
     6. 我的
     ===================================================================== */
  function renderMine() {
    var p = S.profile || {};

    /* 画像表单 */
    document.getElementById("profileCard").innerHTML =
      '<div class="card-head"><div><div class="card-title">' + esc(T("profileTitle")) + "</div>" +
      '<div class="card-sub">' + esc(T("profileHint")) + "</div></div>" +
      '<span class="chip chip-jade">' + I.lock + " " + esc(T("mineStorageVal")) + "</span></div>" +
      '<div class="grid g3" style="gap:var(--sp-5)">' +
      field("fCountry", T("nationality"), selectHTML("fCountry", countryOptions(), p.country)) +
      field("fPurpose", T("purpose"), selectHTML("fPurpose", purposeOptions(), p.purpose)) +
      field("fDuration", T("duration"), selectHTML("fDuration", durationOptions(), p.duration)) +
      field("fArrival", T("arrivalDate"), '<input class="input" type="date" id="fArrival" value="' + esc(p.arrival || "") + '">') +
      field("fEnroll", T("enrollDate"), '<input class="input" type="date" id="fEnroll" value="' + esc(p.enroll || "") + '">') +
      field("fFaith", T("faith"), selectHTML("fFaith", faithOptions(), p.faith)) +
      field("fPermit", T("permitExpiry"), '<input class="input" type="date" id="fPermit" value="' + esc(p.permitExpiry || "") + '">') +
      "</div>" +
      '<div class="wrapflex" style="margin-top:var(--sp-4)">' +
      '<button class="btn btn-lg" id="btnGen">' + ic("sparkle") + esc(T("generate")) + "</button>" +
      '<button class="btn btn-ghost" id="btnReset2">' + esc(T("reset")) + "</button>" +
      "</div>";

    /* 设置项 */
    var LM = window.KBM.L;
    document.getElementById("mineBox").innerHTML = window.KBM.MINE.actions.map(function (a) {
      return '<button class="mine-item" data-act="' + esc(a.id) + '">' +
        '<span class="mi">' + ic(a.icon) + "</span>" +
        "<div><h4>" + esc(LM(a, "title")) + "</h4><p>" + esc(LM(a, "desc")) + "</p></div></button>";
    }).join("");

    /* 清单（含完成进度：已完成 x / y，进度条实时联动） */
    var list = p.country ? window.Agent.buildChecklist(p) : [];
    var doneN = list.filter(function (it) { return S.done.indexOf(it.matter.id) >= 0; }).length;
    var pct = list.length ? Math.round(doneN / list.length * 100) : 0;
    document.getElementById("clCard").innerHTML = list.length ? (
      '<div class="card-head"><div><div class="card-title">' + esc(T("checklist")) + "</div>" +
      '<div class="card-sub">' + doneN + " / " + list.length + " " + T("guideItems") + " · " + pct + "%</div></div>" +
      '<button class="btn btn-ghost btn-sm" id="btnExport">' + ic("down") + esc(T("exportChecklist")) + "</button></div>" +
      '<div style="height:8px;background:var(--ink-100);border-radius:99px;overflow:hidden;margin-bottom:var(--sp-5)">' +
      '<div id="clBar" style="height:100%;width:' + pct + '%;background:linear-gradient(90deg,var(--brand-500),var(--brand-700));transition:width .4s var(--ease)"></div></div>' +
      list.map(clRow).join("")
    ) : '<p class="small muted" style="margin:0">' + esc(T("homeBuildProfile")) + "</p>";

    /* 隐私 */
    var total = window.I18N.__v3Keys || 0;
    document.getElementById("privCard").innerHTML =
      '<div class="kv"><span class="k">' + esc(T("mineStorage")) + '</span><span class="v">' + esc(T("mineStorageVal")) + "</span></div>" +
      '<div class="kv"><span class="k">' + esc(T("mineAiNotice")) + '</span><span class="v">' + esc(T("mineAiNoticeVal")) + "</span></div>" +
      '<div class="kv"><span class="k">' + esc(T("disclaimer")) + '</span><span class="v" style="max-width:60%;font-weight:400;color:var(--ink-600)">' + esc(isZh() ? window.KB.META.disclaimer : (window.KB.META.disclaimer_en || window.KB.META.disclaimer)) + "</span></div>" +
      '<div class="wrapflex" style="margin-top:var(--sp-5)">' +
      '<button class="btn btn-ghost btn-sm" id="btnExportData">' + ic("save") + esc(T("mineExport")) + "</button>" +
      '<button class="btn btn-ghost btn-sm" id="btnClear">' + ic("alert") + esc(T("mineClearData")) + "</button></div>";

    bindProfile();
    bindMine();
  }

  function field(id, label, ctrl) {
    return '<div class="field"><label class="label" for="' + id + '">' + esc(label) + "</label>" + ctrl + "</div>";
  }
  function selectHTML(id, opts, val) {
    return '<select class="select" id="' + id + '">' + opts.map(function (o) {
      return '<option value="' + esc(o.v) + '"' + (o.v === val ? " selected" : "") + ">" + esc(o.t) + "</option>";
    }).join("") + "</select>";
  }
  function countryOptions() {
    var cur = (window.L10N && window.L10N.current) || "zh";
    var out = [{ v: "", t: "—" }];
    Object.keys(window.KB.COUNTRY).forEach(function (k) {
      var c = window.KB.COUNTRY[k];
      if (c && (c.zh || c.name)) out.push({ v: k, t: cur === "zh" ? (c.zh || c.name) : (c.en || c.zh || c.name) });
    });
    return out;
  }
  function purposeOptions() {
    return [
      { v: "degree", t: T("purposeDegree") }, { v: "exchange", t: T("purposeExchange") },
      { v: "visiting", t: T("purposeVisiting") }, { v: "short", t: T("purposeShort") },
      { v: "transit", t: T("purposeTransit") }
    ];
  }
  function durationOptions() {
    return [{ v: "le180", t: T("durLe180") }, { v: "lt180", t: T("durLt180") }, { v: "le240", t: T("durLe240") }];
  }
  function faithOptions() {
    return [
      { v: "none", t: T("faithNone") }, { v: "islam", t: T("faithIslam") }, { v: "buddhism", t: T("faithBuddhism") },
      { v: "christianity", t: T("faithChristianity") }, { v: "hinduism", t: T("faithHinduism") },
      { v: "judaism", t: T("faithJudaism") }, { v: "none2", t: T("faithNone2") }
    ];
  }

  function clRow(item) {
    var m = item.matter, mt = matterText(m);
    var isDone = S.done.indexOf(m.id) >= 0;
    var dl = item.deadline || {};
    var dtag = dl.dateStr ? '<span class="chip chip-line tiny">' + esc(dl.dateStr) + "</span>" : "";
    var u = dl.urgency === "urgent" ? "badge-warn" : (dl.urgency === "soon" ? "badge-now" : "badge-wait");
    return '<div class="todo' + (isDone ? " done" : "") + '" style="align-items:center">' +
      '<button class="go" data-done="' + esc(m.id) + '" aria-pressed="' + isDone + '" style="padding:4px 8px">' +
      ic(isDone ? "check" : "list") + "</button>" +
      '<div style="flex:1"><div class="tx">' + esc(mt.title) + "</div>" +
      '<div class="mt">' + dtag + ' <span class="badge ' + u + '">' + esc(m.pri) + "</span> " +
      esc(m.stage ? T("stage" + cap(m.stage)) : "") + "</div></div></div>";
  }

  function bindProfile() {
    var g = document.getElementById("btnGen");
    if (g) g.addEventListener("click", function () {
      S.profile = {
        country: val("fCountry"), purpose: val("fPurpose"), duration: val("fDuration"),
        arrival: val("fArrival"), enroll: val("fEnroll"), faith: val("fFaith"),
        permitExpiry: val("fPermit"), diet: []
      };
      window.UI.save("v3_profile", S.profile);
      window.UI.toast(T("stOk"));
      renderAll();
      go("home");
    });
    var r = document.getElementById("btnReset2");
    if (r) r.addEventListener("click", function () {
      S.profile = null; S.done = [];
      window.UI.save("v3_profile", null); window.UI.save("v3_done", []);
      renderAll(); window.UI.toast(T("reset"));
    });
  }
  function val(id) { var e = document.getElementById(id); return e ? e.value : ""; }

  function bindMine() {
    document.querySelectorAll("#mineBox .mine-item").forEach(function (b) {
      b.addEventListener("click", function () {
        var a = b.getAttribute("data-act");
        if (a === "m_lang") { window.scrollTo({ top: 0, behavior: "smooth" }); window.UI.toast(T("language")); }
        else if (a === "m_list") { document.getElementById("clCard").scrollIntoView({ behavior: "smooth", block: "center" }); }
        else if (a === "m_clear" || a === "m_privacy") { document.getElementById("privCard").scrollIntoView({ behavior: "smooth", block: "center" }); }
        else window.UI.toast(T("stNoAuth"));
      });
    });
    document.querySelectorAll("[data-done]").forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-done");
        var i = S.done.indexOf(id);
        if (i >= 0) S.done.splice(i, 1); else S.done.push(id);
        window.UI.save("v3_done", S.done);
        renderMine(); renderHome();
      });
    });
    var ex = document.getElementById("btnExport");
    if (ex) ex.addEventListener("click", exportChecklist);
    var ec = document.getElementById("btnClear");
    if (ec) ec.addEventListener("click", function () {
      if (!window.confirm(T("mineClearConfirm"))) return;
      ["v3_profile", "v3_done", "v3_star"].forEach(function (k) { try { localStorage.removeItem("ea2_" + k); } catch (e) { /* 隐私模式忽略 */ } });
      S.profile = null; S.done = []; S.star = [];
      renderAll(); window.UI.toast(T("stOk"));
    });
    var ed = document.getElementById("btnExportData");
    if (ed) ed.addEventListener("click", function () {
      window.UI.download("来华助手-我的数据.json", JSON.stringify({ profile: S.profile, done: S.done, star: S.star }, null, 2), "application/json");
    });
  }

  function exportChecklist() {
    var list = window.Agent.buildChecklist(S.profile);
    var lines = ["# " + T("checklist"), "", T("profileTitle") + ": " + (S.profile.country || "—") + " / " + (S.profile.purpose || "—"), ""];
    list.forEach(function (it, i) {
      lines.push((i + 1) + ". [" + (S.done.indexOf(it.matter.id) >= 0 ? "x" : " ") + "] " + it.matter.title +
        (it.deadline.dateStr ? "  (" + it.deadline.dateStr + ")" : ""));
    });
    window.UI.download("办事清单.md", lines.join("\n"), "text/markdown;charset=utf-8");
  }

  /* =====================================================================
     7. 全局悬浮助手
     ===================================================================== */
  function bindSheet() {
    var sheet = document.getElementById("sheet");
    document.getElementById("fab").addEventListener("click", openSheet);
    var hs = document.getElementById("homeSearch");
    if (hs) hs.addEventListener("click", openSheet);
    document.getElementById("sheetClose").addEventListener("click", closeSheet);
    document.getElementById("sheetMask").addEventListener("click", closeSheet);
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeSheet(); });
    document.getElementById("btnAsk").addEventListener("click", ask);
    document.getElementById("askInput").addEventListener("keydown", function (e) { if (e.key === "Enter") ask(); });
  }
  function openSheet() {
    document.getElementById("sheet").classList.add("open");
    if (!document.getElementById("chatBody").dataset.init) {
      document.getElementById("chatBody").dataset.init = "1";
      aiMsg(esc(T("agentWelcome")), null, false);
      quickChips();
    }
    setTimeout(function () {
      updateAiStatus(window.Agent.bridgeOk());
    }, 300);
  }
  function closeSheet() { document.getElementById("sheet").classList.remove("open"); }

  function quickChips() {
    var qs = [
      { zh: "拿到学习签证后先做什么", en: "What do I do first after getting my study visa?" },
      { zh: "住宿登记要多久内办", en: "How soon must I register my accommodation?" },
      { zh: "居留许可到期怎么办", en: "My residence permit is expiring, what now?" },
      { zh: "护照丢了怎么办", en: "I lost my passport, what should I do?" },
      { zh: "实习需要额外手续吗", en: "Do I need extra procedures for an internship?" }
    ];
    var isZh = String(window.L10N.current).slice(0, 2) === "zh";
    var box = document.createElement("div");
    box.className = "chips";
    box.innerHTML = qs.map(function (q) {
      var txt = isZh ? q.zh : q.en;
      return '<button class="chip-q">' + esc(txt) + "</button>";
    }).join("");
    box.querySelectorAll(".chip-q").forEach(function (b) {
      b.addEventListener("click", function () {
        document.getElementById("askInput").value = b.textContent;
        ask();
      });
    });
    document.getElementById("chatBody").appendChild(box);
  }

  function myMsg(text) {
    var d = document.createElement("div");
    d.className = "msg me";
    d.textContent = text;
    document.getElementById("chatBody").appendChild(d);
    scrollBottom();
  }
  function aiMsg(html, sources, needReview) {
    var d = document.createElement("div");
    d.className = "msg ai";
    d.innerHTML = html;
    if (sources && sources.length) {
      var s = document.createElement("div");
      s.className = "srcs";
      s.innerHTML = "<b>" + esc(T("agentSources")) + "</b><br>" + sources.map(function (x) {
        return esc(x.name) + " · " + esc(x.org) + (x.url ? ' · <a href="' + esc(x.url) + '" target="_blank" rel="noopener">' + esc(x.url) + "</a>" : "") + " · " + esc(x.level);
      }).join("<br>");
      d.appendChild(s);
    }
    if (needReview !== false) {
      var r = document.createElement("div");
      r.className = "rev";
      r.innerHTML = I.alert + esc(T("agentReview"));
      d.appendChild(r);
    }
    document.getElementById("chatBody").appendChild(d);
    scrollBottom();
    return d;
  }
  function think() {
    var d = document.createElement("div");
    d.className = "think";
    d.innerHTML = "<i></i><i></i><i></i>";
    document.getElementById("chatBody").appendChild(d);
    scrollBottom();
    return d;
  }
  function scrollBottom() {
    var b = document.getElementById("chatBody");
    b.scrollTop = b.scrollHeight;
  }

  function ask() {
    var input = document.getElementById("askInput");
    var q = (input.value || "").trim();
    if (!q) return;
    input.value = "";
    myMsg(q);
    var ph = think();
    var lang = window.L10N.current;
    S.chatHist = S.chatHist || [];
    S.chatHist.push({ role: "user", content: q });
    if (S.chatHist.length > 24) S.chatHist = S.chatHist.slice(-24);

    window.Agent.askSmart(q, S.profile || window.Agent.DEFAULT_PROFILE, lang, null, S.chatHist).then(function (res) {
      ph.remove();
      if (!res || !res.html) { aiMsg(esc(T("stNoAnswer")), null, false); return; }
      if (res.confidence !== undefined && res.confidence < 0.2) {
        aiMsg('<p>' + esc(T("stNoAnswer")) + "</p><p>" + esc(T("agentTransferDesc")) + "</p>", res.sources, true);
        return;
      }
      aiMsg(res.html, res.sources, res.needReview);
      if (res.reply) S.chatHist.push({ role: "assistant", content: res.reply });
      if (res.steps && res.steps.length) traceMsg(res.steps, lang);
      updateAiStatus(res.llm);
    });
  }

  /* Agent 运行轨迹卡片（可折叠） */
  function traceMsg(steps, lang) {
    var zh = String(lang || "zh").slice(0, 2) === "zh";
    var d = document.createElement("div");
    d.className = "trace-card";
    d.innerHTML = "<div class='trace-head' role='button' tabindex='0'>" + esc(zh ? "Agent 运行轨迹" : "Agent trace") + " · " +
      steps.length + " 步 <span class='trace-arrow'>▾</span></div><div class='trace-body'>" +
      steps.map(function (s) {
        return "<div class='trace-step'><span class='n'>" + s.n + "</span><div><b>" + esc(s.title) + "</b>" +
          "<p class='tiny muted'>" + esc(s.detail) + "</p></div></div>";
      }).join("") + "</div>";
    var head = d.querySelector(".trace-head");
    var body = d.querySelector(".trace-body");
    head.addEventListener("click", function () { body.classList.toggle("open"); });
    head.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { body.classList.toggle("open"); e.preventDefault(); } });
    document.getElementById("chatBody").appendChild(d);
    scrollBottom();
  }

  /* 顶部 AI 引擎状态徽标（LLM 在线 / 离线兜底） */
  function updateAiStatus(llm) {
    var wrap = document.getElementById("aiStatus");
    if (!wrap) {
      var h = document.querySelector(".sheet-h");
      if (!h) return;
      wrap = document.createElement("span");
      wrap.id = "aiStatus";
      h.appendChild(wrap);
    }
    var zh = String(window.L10N.current || "zh").slice(0, 2) === "zh";
    var on = !!llm;
    wrap.className = "ai-status" + (on ? " on" : "");
    wrap.textContent = on ? (zh ? "LLM 在线" : "LLM live") : (zh ? "离线兜底引擎" : "local engine");
  }

  /* =====================================================================
     8. 手风琴
     ===================================================================== */
  function bindAcc() {
    document.querySelectorAll(".acc-h").forEach(function (h) {
      h.onclick = function () {
        var card = h.parentElement;
        var key = card.getAttribute("data-acc");
        var isOpen = card.classList.toggle("open");
        S.open[key] = isOpen;
      };
    });
  }

  /* =====================================================================
     9. 渲染总控
     ===================================================================== */
  function renderAll() {
    buildChrome();
    buildTabs();
    renderHome();
    renderGuide();
    renderCampus();
    renderDaily();
    renderMine();
    if (typeof window.UI.bindChrome === "function") window.UI.bindChrome();
    go(S.mod, true);
    window.UI.initReveal();
  }

  /* =====================================================================
     10. 启动
     ===================================================================== */
  function init() {
    window.UI.initTheme();
    window.UI.initLang();
    renderAll();
    bindSheet();
    window.UI.bindChrome();
    window.UI.initReveal();
    /* 预探测本地 LLM 代理（file:// 下需异步，页面加载后稍候再探） */
    setTimeout(function () {
      if (window.Agent && window.Agent.ensureBridge) window.Agent.ensureBridge();
      setTimeout(function () {
        try { updateAiStatus(window.Agent.bridgeOk()); } catch (e) {}
      }, 700);
    }, 400);

    document.addEventListener("langchange", function () {
      /* 语言切换后重建文案；表单值从 S.profile 回填，无需另行保存 */
      renderAll();
    });

    /* 待办与推荐里的「查看详情」跳转到访华指南 */
    document.addEventListener("click", function (e) {
      var b = e.target.closest && e.target.closest("[data-jump]");
      if (!b) return;
      go("guide");
      var id = b.getAttribute("data-jump");
      setTimeout(function () {
        var el = document.querySelector('[data-acc="m_' + id + '"]');
        if (el) { el.classList.add("open"); S.open["m_" + id] = true; el.scrollIntoView({ behavior: "smooth", block: "center" }); }
      }, 120);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
