/* 来华交流全程助手 · 机构端 v2.0 */
(function () {
  "use strict";
  var U = window.UI, A = window.Agent, KB = window.KB;
  var t = function (k) { return U.L10N.t(k); };
  var $ = function (id) { return document.getElementById(id); };

  document.getElementById("chrome-top").innerHTML = U.header("org").replace(
    /<nav class="nav"[\s\S]*?<\/nav>/,
    '<nav class="nav" data-i18n-aria="navAria" aria-label="主导航">' +
      '<a href="institution.html" aria-current="page" data-i18n="navOrg">' + t("navOrg") + "</a>" +
      '<a href="institution.html#studio" data-i18n="navFlow">' + t("navFlow") + "</a>" +
      '<a href="institution.html#kb" data-i18n="navData">' + t("navData") + "</a>" +
      '<a href="student.html" data-i18n="navStudent">' + t("navStudent") + "</a>" +
      '<a href="index.html" data-i18n="navHome">' + t("navHome") + "</a></nav>"
  );
  document.getElementById("chrome-bottom").innerHTML = U.footer("");
  U.initTheme(); U.initLang(); U.bindChrome();

  [["ioPrint", "print"], ["ioSpark", "sparkle"], ["ioReset", "refresh"], ["ioWarn", "alert"],
  ["ioWarn2", "alert"], ["ioPublish", "org"], ["ioTrans", "translate"], ["ioExp", "doc"],
  ["ioCopy", "copy"], ["ioPlus", "plus"], ["ioSave", "save"], ["ioScope", "info"]].forEach(function (p) {
    var el = $(p[0]); if (el) el.innerHTML = U.ICONS[p[1]];
  });

  /* ================= 看板 =================
     校本库优先取用户自建数据；无自建时自动预置试点示例库（中山大学）并落盘，
     机构端可统一查看、修改、删除。 */
  var LOCAL_KB = (function () {
    if (window.Agent && window.Agent.localKbItems) {
      var primed = window.Agent.localKbItems();
      if (primed && primed.length) return primed;
    }
    return U.load("localKb", []);
  })();
  function allMatters() { return KB.MATTERS.concat(LOCAL_KB); }

  var charts = [];
  function chart(id, opt) {
    var el = $(id); if (!el || !window.echarts) return;
    var c = window.echarts.init(el, null, { renderer: "svg" });
    c.setOption(opt); charts.push(c);
  }
  var PAL = ["#174E8C", "#12977F", "#C2402C", "#B45309", "#6B4C9A", "#4A8CD0"];
  var base = { textStyle: { fontFamily: 'Inter, "Noto Sans SC", "Microsoft YaHei", sans-serif', color: "#45566E" } };

  function drawBoard() {
    charts.forEach(function (c) { try { c.dispose(); } catch (e) { } });
    charts = [];

    /* KPI 与副标题：随语种与知识库变动重算 */
    $("b1").textContent = allMatters().length + KB.FAQ.length;
    $("b2").textContent = allMatters().filter(function (m) { return m.source.some(function (k) { return KB.SRC[k] && KB.SRC[k].level === "S3"; }); }).length;
    $("b3").textContent = KB.LANGS.length;
    $("b4").textContent = Math.round(A.efficiencyModel({}).cut * 100) + "%";
    $("b4n").textContent = t("boardAssumeNote");

    /* 咨询热点 Top 6 —— 由知识库条目 + 演示命中权重推导，可解释 */
    var hot = allMatters().slice(0).map(function (m, i) {
      var baseW = { P0: 120, P1: 70, P2: 34 }[m.pri] || 40;
      return { name: KB.L(m, "title"), w: baseW + ((i * 37) % 40) };
    }).sort(function (a, b) { return b.w - a.w; }).slice(0, 6);
    chart("chConsult", Object.assign({}, base, {
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      grid: { left: 128, right: 42, top: 12, bottom: 24 },
      xAxis: { type: "value", splitLine: { lineStyle: { color: "#EBF0F6" } }, axisLabel: { fontSize: 11 } },
      yAxis: { type: "category", inverse: true, data: hot.map(function (h) { return h.name.length > 12 ? h.name.slice(0, 12) + "…" : h.name; }), axisLine: { lineStyle: { color: "#D8E0EA" } }, axisLabel: { fontSize: 11 } },
      series: [{ type: "bar", barWidth: 15, itemStyle: { color: PAL[0], borderRadius: [0, 5, 5, 0] }, label: { show: true, position: "right", fontSize: 11 }, data: hot.map(function (h) { return h.w; }) }]
    }));

    /* 时限分布：按阶段统计 P0/P1/P2 */
    var stages = [["pre", t("stagePre")], ["arrival", t("stageArrival")], ["study", t("stageStudy")], ["exit", t("stageExit")]];
    var series = ["P0", "P1", "P2"].map(function (p, i) {
      return {
        name: p, type: "bar", stack: "x", barWidth: 26, itemStyle: { color: PAL[i] },
        data: stages.map(function (s) { return allMatters().filter(function (m) { return m.stage === s[0] && m.pri === p; }).length; })
      };
    });
    chart("chDeadline", Object.assign({}, base, {
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      legend: { bottom: 0, itemWidth: 9, itemHeight: 9, textStyle: { fontSize: 11 } },
      grid: { left: 40, right: 16, top: 16, bottom: 44 },
      xAxis: { type: "category", data: stages.map(function (s) { return s[1]; }), axisLine: { lineStyle: { color: "#D8E0EA" } }, axisLabel: { fontSize: 11 } },
      yAxis: { type: "value", splitLine: { lineStyle: { color: "#EBF0F6" } }, axisLabel: { fontSize: 11 } },
      series: series
    }));

    /* 覆盖度：阶段 × 证据等级 */
    var s1 = [], s3 = [];
    stages.forEach(function (s) {
      var ms = allMatters().filter(function (m) { return m.stage === s[0]; });
      var a = 0, b = 0;
      ms.forEach(function (m) { if (m.source.some(function (k) { return KB.SRC[k] && KB.SRC[k].level === "S3"; })) b++; else a++; });
      s1.push(a); s3.push(b);
    });
    chart("chCoverage", Object.assign({}, base, {
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      legend: { bottom: 0, itemWidth: 9, itemHeight: 9, textStyle: { fontSize: 11 } },
      grid: { left: 40, right: 16, top: 16, bottom: 44 },
      xAxis: { type: "category", data: stages.map(function (s) { return s[1]; }), axisLine: { lineStyle: { color: "#D8E0EA" } }, axisLabel: { fontSize: 11 } },
      yAxis: { type: "value", splitLine: { lineStyle: { color: "#EBF0F6" } }, axisLabel: { fontSize: 11 } },
      series: [
        { name: "S1/S2", type: "bar", stack: "y", barWidth: 26, itemStyle: { color: PAL[1] }, data: s1 },
        { name: t("chartS3"), type: "bar", stack: "y", barWidth: 26, itemStyle: { color: PAL[3], borderRadius: [4, 4, 0, 0] }, data: s3 }
      ]
    }));
  }
  drawBoard();

  /* ================= 内容工作台 ================= */
  /* 生成器三个选择器：
     注意：早期版本这三行是「裸初始化」，没挂进 langchange 重绘列表，
     导致切到俄/阿/法…后仍显示中文态文案（已修）。现抽成函数并纳入重绘。 */
  function renderGenSelectors() {
    var keepC = $("gCountry").value, keepL = $("gLang").value, keepT = $("gTpl").value;
    $("gTpl").innerHTML = KB.TEMPLATES.map(function (x) {
      var lab = isZh() ? (x.name + " · " + x.name_en) : KB.L(x, "name");
      return '<option value="' + x.id + '">' + U.esc(lab) + "</option>";
    }).join("");
    $("gCountry").innerHTML = Object.keys(KB.COUNTRY).map(function (k) {
      return '<option value="' + k + '">' + U.esc(countryName(k)) + "</option>";
    }).join("");
    $("gLang").innerHTML = KB.LANGS.map(function (l) {
      return '<option value="' + l.code + '">' + U.esc(l.name) + ((isZh() && l.en && l.en !== l.name) ? " · " + U.esc(l.en) : "") + "</option>";
    }).join("");
    if (keepT) $("gTpl").value = keepT;
    if (keepC) $("gCountry").value = keepC; else $("gCountry").value = "PK";
    if (keepL) $("gLang").value = keepL; else $("gLang").value = "zh";
  }
  renderGenSelectors();
  var TPL_ICONS = { t_guide: "book", t_checklist: "list", t_notice: "bell", t_faq: "chat", t_brief: "clock", t_emergency: "alert" };
  var TPL_PICK = { t_guide: "tplPickGuide", t_checklist: "tplPickChecklist", t_notice: "tplPickNotice", t_faq: "tplPickFaq", t_brief: "tplPickBrief", t_emergency: "tplPickEmergency" };
  function isZh() { return String(window.L10N.current || "zh").slice(0, 2) === "zh"; }
  /* 导出件与来源行的连接符须跟随「材料语种」而非界面语种，否则外文材料里会夹中文标点 */
  function mIsZh() { return String(($("gLang") && $("gLang").value) || "zh").slice(0, 2) === "zh"; }
  function mSep() { return mIsZh() ? "：" : ": "; }
  function mJoin() { return mIsZh() ? "；" : "; "; }
  /* 国名取值：中文态双语并示，非中文态取本语种译文（缺失回退英文）—— 供界面控件使用 */
  function countryName(k) {
    var c = KB.COUNTRY[k];
    if (!c) return "";
    if (isZh()) return c.zh + (c.en && c.en !== c.zh ? " · " + c.en : "");
    return c["name_" + KB.lang()] || c.en || c.zh || "";
  }
  /* 国名取值（跟随「材料语种」）—— 材料预览 meta 专用，避免中文界面生成外文材料时夹中文国名 */
  function mCountryName(k) {
    var c = KB.COUNTRY[k];
    if (!c) return "";
    if (mIsZh()) return c.zh + (c.en && c.en !== c.zh ? " · " + c.en : "");
    var ml = String(($("gLang") && $("gLang").value) || "zh").slice(0, 2);
    return c["name_" + ml] || c.en || c.zh || "";
  }
  function renderTplCards() {
    var sel = $("gTpl").value;
    var zh = isZh();
    $("tplCards").innerHTML = KB.TEMPLATES.map(function (x) {
      var ic = U.icon(TPL_ICONS[x.id] || "doc");
      var pick = t(TPL_PICK[x.id] || "genTemplate");
      var nm = zh ? (U.esc(x.name) + ' <span class="tpl-e">' + U.esc(x.name_en) + "</span>") : U.esc(KB.L(x, "name"));
      return '<button type="button" class="tpl-card' + (x.id === sel ? " on" : "") + '" data-tpl="' + x.id + '">' +
        '<span class="tpl-ic">' + ic + "</span>" +
        '<div><div class="tpl-n">' + nm + "</div>" +
        '<div class="tpl-p">' + U.esc(pick) + "</div></div></button>";
    }).join("");
    Array.prototype.forEach.call($("tplCards").querySelectorAll(".tpl-card"), function (b) {
      b.addEventListener("click", function () {
        $("gTpl").value = b.getAttribute("data-tpl");
        Array.prototype.forEach.call($("tplCards").querySelectorAll(".tpl-card"), function (x) { x.classList.remove("on"); });
        b.classList.add("on");
        tplDesc(); genContent();
      });
    });
  }
  renderTplCards();
  /* 旧版此处还有两处裸初始化（gCountry / gLang），已合并进 renderGenSelectors() */

  function tplDesc() {
    var id = $("gTpl").value;
    var zh = isZh();
    KB.TEMPLATES.forEach(function (x) {
      if (x.id !== id) return;
      var d = window.KB.L(x, "desc");
      var sec = (window.KB.L(x, "sections") || []).join(" / ");
      $("gTplDesc").textContent = d + t("tplDescChapter") + sec;
    });
  }
  tplDesc();

  var LAST = null;
  function genContent() {
    var cfg = {
      template: $("gTpl").value, country: $("gCountry").value, lang: $("gLang").value,
      topic: $("gTopic").value, deadline: $("gDeadline").value, contact: $("gContact").value,
      extra: $("gExtra").value, audience: "国际学生"
    };
    LAST = A.renderMaterial(cfg);
    var _bar = mIsZh() ? " ｜ " : " | ";
    $("pvMeta").textContent = LAST.template + _bar + mCountryName(cfg.country) + _bar + cfg.lang.toUpperCase() + _bar + new Date().toLocaleString();
    $("pvAI").textContent = LAST.aiLabel;
    $("pvBody").innerHTML = U.mdToHtml(LAST.markdown);
    $("pvSrc").innerHTML = '<div class="small strong" style="margin-bottom:6px">' + U.L10N.t("sourceLabel", cfg.lang) + "</div>" +
      '<ul class="tiny muted" style="padding-left:1.1em;margin:0">' + LAST.sources.map(function (s) { return "<li>" + s + "</li>"; }).join("") + "</ul>";
    U.toast(t("genPreview") + " ✓");
  }
  /* ============ 国别 → 输出语种（用于材料语种自动跟随） ============ */
  var C2LANG = {
    KR:"ko", JP:"ja", DE:"de", RU:"ru", KZ:"ru", SA:"ar", EG:"ar", FR:"fr",
    US:"en", TH:"th", VN:"vi", MY:"ms", ID:"ms", MM:"my", PK:"en", IN:"en", BD:"en"
  };
  var langTouched = false;   /* 用户手动改过「目标语种」后不再自动覆盖 */

  function langName(code) {
    var n = code;
    (window.KB.LANGS || []).forEach(function (l) {
      if (l.code === code) n = isZh() ? (l.name || code) : (l.en || l.name || code);
    });
    return n;
  }

  /* AI 任务状态灯：idle 隐藏 / run 生成中 / ok 已完成 */
  function setAiState(st) {
    var el = $("aiState");
    if (!el) return;
    el.setAttribute("data-s", st);
    var tx = el.querySelector(".ai-state-tx");
    if (tx) tx.textContent = (st === "run") ? t("generating") : "";
  }

  /* 本地预识别（毫秒级、不联网）：国别 → 语种 → 模板 → 事项，并回写表单。
     放在调用大模型「之前」执行，所以点下按钮界面立刻有反应，
     而且材料语种能跟着国别走（韩国 → 韩文）。 */
  function prefillFromTask(task) {
    var t0 = String(task || ""), q = t0.toLowerCase();
    var parts = [], els = [];
    var ck = (typeof A.detectCountry === "function") ? A.detectCountry(t0) : "";

    /* ① 目标国别 */
    if (ck && ck !== "OTHER" && $("gCountry").value !== ck) {
      $("gCountry").value = ck;
      parts.push(t("genCountry") + " " + countryName(ck));
      els.push($("gCountry"));
    }

    /* ② 目标语种：跟随国别；用户手改过就不再覆盖 */
    if (!langTouched && ck && C2LANG[ck]) {
      var code = C2LANG[ck];
      if ($("gLang").value !== code && $("gLang").querySelector('option[value="' + code + '"]')) {
        $("gLang").value = code;
        parts.push(t("genLang") + " " + langName(code));
        els.push($("gLang"));
      }
    }

    /* ③ 选择模板：按任务用词归类；无明确信号用「国别化来华指南」 */
    var tpl = "t_guide";
    if (/问答|答疑|faq|常见问题/.test(q)) tpl = "t_faq";
    else if (/应急|紧急|突发|emergency/.test(q)) tpl = "t_emergency";
    else if (/通知|公告|notice/.test(q)) tpl = "t_notice";
    else if (/简报|brief|迎新|orientation/.test(q)) tpl = "t_brief";
    else if (/清单|checklist|要准备|材料清单/.test(q)) tpl = "t_checklist";
    if ($("gTpl").value !== tpl) {
      $("gTpl").value = tpl;
      renderTplCards(); tplDesc();
      var tn = tpl;
      KB.TEMPLATES.forEach(function (x) { if (x.id === tpl) tn = isZh() ? x.name : KB.L(x, "name"); });
      parts.push(t("genTemplate") + " " + tn);
      els.push($("tplCards"));
    }

    /* ④ 事项/主题：任务里明确点到某条办事事项才覆盖，没点到不猜 */
    var hit = null;
    allMatters().forEach(function (m) {
      var ti = window.KB.L(m, "title") || m.title || "";
      if (ti && ti.length >= 4 && t0.indexOf(ti) >= 0) hit = m;
    });
    if (hit) {
      var tv = window.KB.L(hit, "title") || hit.title;
      if (tv && $("gTopic").value !== tv) {
        $("gTopic").value = tv; parts.push(t("genTopic") + " " + tv); els.push($("gTopic"));
      }
    }
    return { parts: parts, els: els, country: ck };
  }

  /* 把预识别/回填的结果呈现出来：绿色提示条 + 控件高亮 + 轻提示 */
  function showFillResult(res) {
    var parts = (res && res.parts) || [], els = (res && res.els) || [];
    var note = $("autoFillNote");
    if (note) {
      if (parts.length) {
        note.hidden = false;
        note.innerHTML = "<b>" + U.esc(t("aiGenDone")) + "</b>" +
          '<div class="af-list">' + U.esc(parts.join(" · ")) + "</div>";
      } else {
        note.hidden = true;
      }
    }
    els.forEach(function (el) {
      if (!el || !el.classList) return;
      el.classList.remove("af-flash");
      void el.offsetWidth;
      el.classList.add("af-flash");
      setTimeout(function () { el.classList.remove("af-flash"); }, 2600);
    });
    if (parts.length) U.toast(t("aiGenDone") + " · " + parts.join(" · "));
  }

  /* ================= 一句话任务 → 同步表单 =================
     背景：Agent 生成内容时内部已识别国别（detectCountry）与意图（classify），
          但从未回写到「目标国别 / 选择模板 / 事项主题」三个控件，
          导致「内容按韩国生成、目标国别却仍显示巴基斯坦」这类前后不一致。
     做法：复用 Agent 同一套识别逻辑回写控件。注意用直接赋值（不派发 change），
          否则会触发 genContent() 把刚生成的 AI 预览覆盖掉。 */
  function syncGenFormFromTask(task) {
    /* 兼容入口：预识别已在点击时执行过，这里只负责呈现结果 */
    showFillResult(prefillFromTask(task));
  }

  /* ================= AI Agent 一句话生成 ================= */
  $("btnAiGen").addEventListener("click", function () {
    var task = $("aiTask").value.trim();
    if (!task) { U.toast(t("aiTaskEmpty")); return; }
    var btnTxt = $("btnAiGen");
    btnTxt.disabled = true;
    btnTxt.querySelector("span:last-child").textContent = t("generating");
    setAiState("run");
    $("aiTrace").innerHTML = '<div class="ai-working">' + U.esc(t("agentRunning")) + '</div>';

    /* 先做本地预识别并回填（毫秒级）：点下按钮界面立刻有反应，
       且材料语种能随国别自动切换（韩国 → 韩文）。 */
    var pre = { parts: [], els: [], country: "" };
    try { pre = prefillFromTask(task); showFillResult(pre); } catch (e) { }

    A.genMaterialLLM(task, $("gLang").value).then(function (r) {
      LAST = r;
      /* 把 Agent 已识别出的国别/模板/事项回写表单，保证界面与内容一致 */
      try { syncGenFormFromTask(task); } catch (e) { }
      var _mBar = mIsZh() ? " ｜ " : " | ";
      var _mLang = $("gLang").value;
      $("pvMeta").textContent = "AI Agent · " + task.slice(0, 34) + _mBar + new Date().toLocaleString();
      $("pvAI").textContent = U.L10N.t("aiGenerated", _mLang);
      $("pvBody").innerHTML = U.mdToHtml(r.markdown);
      $("pvSrc").innerHTML = '<div class="small strong" style="margin-bottom:6px">' + U.L10N.t("sourceLabel", _mLang) + "</div>" +
        '<ul class="tiny muted" style="padding-left:1.1em;margin:0">' + (r.sources.length ? r.sources.map(function (s) { return "<li>" + s + "</li>"; }).join("") : "<li>" + U.esc(U.L10N.t("aiReviewPublish", _mLang)) + "</li>") + "</ul>";
      if (r.steps && r.steps.length) {
        $("aiTrace").innerHTML = "<div class='trace-card'><div class='trace-head' role='button' tabindex='0'>" + U.esc(t("agentTraceSteps").replace("{n}", r.steps.length)) + " <span class='trace-arrow'>▾</span></div><div class='trace-body'>" +
          r.steps.map(function (s) { return "<div class='trace-step'><span class='n'>" + s.n + "</span><div><b>" + U.esc(s.title) + "</b><p class='tiny muted'>" + U.esc(s.detail) + "</p></div></div>"; }).join("") + "</div></div>";
        var head = $("aiTrace").querySelector(".trace-head");
        head.addEventListener("click", function () { $("aiTrace").querySelector(".trace-body").classList.toggle("open"); });
      } else {
        $("aiTrace").innerHTML = "";
      }
      btnTxt.querySelector("span:last-child").textContent = t("regenerate");
      $("btnAiGen").disabled = false;
      setAiState("ok");
      U.toast(t("aiGenDone"));
    }).catch(function () {
      btnTxt.querySelector("span:last-child").textContent = t("aiGenBtn");
      $("btnAiGen").disabled = false;
      setAiState("idle");
    });
  });
  /* 用户手动改过语种后，后续不再被国别自动覆盖 */
  $("gLang").addEventListener("change", function () { langTouched = true; });

  /* 任务描述一改，状态灯回到待命：暗示"内容变了，可再次生成" */
  $("aiTask").addEventListener("input", function () { if (!$("btnAiGen").disabled) setAiState("idle"); });

  $("btnGenContent").addEventListener("click", genContent);
  $("gTpl").addEventListener("change", function () { tplDesc(); genContent(); });
  ["gCountry", "gLang"].forEach(function (id) {
    $(id).addEventListener("change", function () { applyGenDefaults(false); genContent(); });
  });

  /* 生成器表单默认值（十三语）：默认值会写进生成材料，必须随「材料语种」切换，
     否则俄文/阿文材料里会残留中文默认值。用户手改过的字段不再覆盖。
     演示用的截止日期按「下一个 10 月 15 日」动态计算，避免任何时间打开都显示过期日期。 */
  var DEMO_YEAR = (function () {
    var d = new Date(), y = d.getFullYear(), md = (d.getMonth() + 1) * 100 + d.getDate();
    return md > 1015 ? y + 1 : y;
  })();
  var DEMO_DL = DEMO_YEAR + "-10-15";
  var GEN_DEFAULTS = {
    topic: {
      zh: "秋季学期居留许可集中办理", en: "Fall-semester residence permit processing",
      ru: "Оформление вида на жительство на осенний семестр", ar: "إنجاز تصريح الإقامة للفصل الخريفي",
      fr: "Traitement des permis de séjour du semestre d'automne", es: "Tramitación del permiso de residencia del semestre de otoño",
      vi: "Xử lý giấy phép cư trú học kỳ thu", th: "การดำเนินการใบอนุญาตพำนักภาคเรียนฤดูใบไม้ร่วง",
      my: "ဆောင်းဦးစာသင်နှစ် နေထိုင်ခွင့်လက်မှတ် စုပေါင်းဆောင်ရွက်ခြင်း", ms: "Pemprosesan permit kediaman semester luruh",
      ja: "秋季学期の在留許可集中手続き", ko: "가을학기 체류허가 일괄 처리", de: "Konzentrierte Bearbeitung der Aufenthaltsgenehmigung im Herbstsemester"
    },
    deadline: {
      zh: DEMO_DL + " 前", en: "by " + DEMO_DL, ru: "до " + DEMO_DL, ar: "قبل " + DEMO_DL,
      fr: "avant le " + DEMO_DL, es: "antes del " + DEMO_DL, vi: "trước " + DEMO_DL,
      th: "ภายใน " + DEMO_DL, my: DEMO_DL + " မတိုင်မီ", ms: "sebelum " + DEMO_DL,
      ja: DEMO_DL + " まで", ko: DEMO_DL + " 이전", de: "bis " + DEMO_DL
    },
    contact: {
      zh: "国际学生办公室 · 电话 0000-0000000", en: "International Student Office · Tel 0000-0000000",
      ru: "Офис иностранных студентов · тел. 0000-0000000", ar: "مكتب الطلاب الدوليين · هاتف 0000-0000000",
      fr: "Bureau des étudiants internationaux · tél. 0000-0000000", es: "Oficina de Estudiantes Internacionales · tel. 0000-0000000",
      vi: "Văn phòng sinh viên quốc tế · ĐT 0000-0000000", th: "สำนักงานนักศึกษานานาชาติ · โทร 0000-0000000",
      my: "နိုင်ငံတကာ ကျောင်းသား ရုံး · ဖုန်း 0000-0000000", ms: "Pejabat Pelajar Antarabangsa · Tel 0000-0000000",
      ja: "留学生課 · 電話 0000-0000000", ko: "국제학생처 · 전화 0000-0000000", de: "International Office · Tel. 0000-0000000"
    }
  };
  var GEN_FIELDS = [["gTopic", "topic"], ["gDeadline", "deadline"], ["gContact", "contact"]];
  /* 字段仍是任一语种的默认值（= 用户未改动）时才覆盖 */
  function genDefaultUntouched(el, key) {
    var v = el.value, d = GEN_DEFAULTS[key];
    if (v === "") return true;
    for (var k in d) { if (d[k] === v) return true; }
    return false;
  }
  /* force=true 无条件重置为默认值（重置按钮）；否则只覆盖未被改动的字段 */
  function applyGenDefaults(force) {
    var sel = $("gLang");
    var lang = String((sel && sel.value) || (window.L10N && window.L10N.current) || "zh").slice(0, 2);
    GEN_FIELDS.forEach(function (p) {
      var el = $(p[0]); if (!el) return;
      if (!force && !genDefaultUntouched(el, p[1])) return;
      el.value = GEN_DEFAULTS[p[1]][lang] || GEN_DEFAULTS[p[1]].en;
    });
  }

  $("btnTplReset").addEventListener("click", function () {
    applyGenDefaults(true);
    $("gExtra").value = ""; genContent();
  });

  $("btnPublish").addEventListener("click", function () {
    var pub = U.load("published", []);
    pub.unshift({ ts: new Date().toISOString(), title: LAST.title, lang: $("gLang").value });
    U.save("published", pub.slice(0, 30));
    U.toast(t("published"));
  });
  $("btnTranslate").addEventListener("click", function () {
    var codes = KB.LANGS.map(function (l) { return l.code; });
    var cur = $("gLang").value;
    var next = codes[(codes.indexOf(cur) + 1) % codes.length];
    $("gLang").value = next; genContent();
    U.toast(t("genTranslate") + " → " + next.toUpperCase() + t("mtPending"));
  });
  $("btnExpHtml").addEventListener("click", function () {
    var html = '<!DOCTYPE html><html lang="' + $("gLang").value + '"><head><meta charset="utf-8"><title>' + U.esc(LAST.title) + "</title>" +
      "<style>body{font-family:Inter,'Noto Sans SC','Microsoft YaHei',sans-serif;max-width:820px;margin:40px auto;padding:0 20px;line-height:1.8;color:#16243A}" +
      "h2{color:#0E2B52}h3{color:#123A6B;margin-top:1.6em}blockquote{border-left:3px solid #174E8C;margin:0;padding:8px 14px;background:#F2F7FD;color:#45566E;font-size:.92em}" +
      "li{margin:.3em 0}.meta{color:#64748B;font-size:.85em;border-top:1px solid #E1E8F1;padding-top:12px;margin-top:24px}</style></head><body>" +
      U.mdToHtml(LAST.markdown) +
      '<div class="meta">' + LAST.aiLabel + (mIsZh() ? " ｜ " : " | ") + U.L10N.t("sourceLabel", $("gLang").value) + mSep() + LAST.sources.join(mJoin()) + (mIsZh() ? " ｜ " : " | ") + KB.META.updated + "</div></body></html>";
    U.download(t("fileNamePrefix") + $("gTpl").value + "_" + $("gLang").value + "_" + new Date().toISOString().slice(0, 10) + ".html", html, "text/html;charset=utf-8");
    U.toast(t("genExport") + " ✓");
  });
  $("btnCopy").addEventListener("click", function () {
    U.copy(LAST.markdown).then(function () { U.toast(t("copied")); });
  });

  /* ================= 效率测算 ================= */
  var M = U.load("effParams", { minPerCase: 12, cases: 260, cut: 55 });
  $("mA").value = M.minPerCase; $("mB").value = M.cases; $("mC").value = M.cut;
  function renderEff() {
    M = { minPerCase: +$("mA").value, cases: +$("mB").value, cut: +$("mC").value };
    U.save("effParams", M);
    $("mAVal").textContent = M.minPerCase + t("unitMinute");
    $("mBVal").textContent = M.cases + t("unitTimes");
    $("mCVal").textContent = M.cut + "%";
    var r = A.efficiencyModel({ minPerCase: M.minPerCase, cases: M.cases, cut: M.cut / 100, hourly: 60 });
    $("b4").textContent = Math.round(r.cut * 100) + "%";
    var el = $("chEff");
    if (!el || !window.echarts) return;
    var old = window.echarts.getInstanceByDom(el);
    if (old) old.dispose();
    var c = window.echarts.init(el, null, { renderer: "svg" });
    c.setOption(Object.assign({}, base, {
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, formatter: function (ps) { return ps[0].axisValue + "：" + ps[0].value + " h"; } },
      grid: { left: 52, right: 24, top: 18, bottom: 44 },
      xAxis: { type: "category", data: [t("calcNow"), t("calcWith")], axisLine: { lineStyle: { color: "#D8E0EA" } }, axisLabel: { fontSize: 11 } },
      yAxis: [
        { type: "value", name: t("chartHoursMonth"), nameTextStyle: { fontSize: 10 }, max: function (v) { return Math.ceil(v.max / 20) * 20; }, splitLine: { lineStyle: { color: "#EBF0F6" } }, axisLabel: { fontSize: 11 } },
        { type: "value", show: false, max: function (v) { return Math.ceil(v.max / 1000) * 1000; } }
      ],
      series: [
        { name: t("chartManualHours"), type: "bar", barWidth: 44, itemStyle: { color: PAL[0], borderRadius: [6, 6, 0, 0] }, label: { show: true, position: "top", fontSize: 11, formatter: "{c} h" }, data: [r.manualHours.toFixed(1), r.agentHours.toFixed(1)] },
        { name: t("chartCost"), type: "line", yAxisIndex: 1, symbolSize: 0, lineStyle: { width: 0 }, itemStyle: { color: PAL[1] }, label: { show: true, position: "top", fontSize: 10, formatter: "¥{c}" }, data: [r.manualCost.toFixed(0), r.agentCost.toFixed(0)] }
      ]
    }));
  }
  ["mA", "mB", "mC"].forEach(function (id) { $(id).addEventListener("input", renderEff); });
  renderEff();

  /* ================= 知识库维护 ================= */
  function levelOf(m) {
    var lv = m.source.map(function (k) { return KB.SRC[k] ? KB.SRC[k].level : "S3"; });
    return lv.indexOf("S3") >= 0 ? "S3" : (lv.indexOf("S2") >= 0 ? "S2" : "S1");
  }
  function renderKbTable() {
    var stName = { pre: t("stagePre"), arrival: t("stageArrival"), study: t("stageStudy"), exit: t("stageExit") };
    var rows = allMatters().map(function (m) {
      var lv = levelOf(m);
      return "<tr><td>" + (stName[m.stage] || m.stage) + "</td><td><span class=\"chip " + (m.pri === "P0" ? "chip-cin" : (m.pri === "P1" ? "chip-amber" : "chip-line")) + '">' + m.pri + "</span></td>" +
        "<td>" + U.esc(KB.L(m, "title")) + (m._local ? ' <span class="chip chip-jade tiny">' + U.esc(t("schoolLocal")) + '</span>' : "") + "</td>" +
        "<td class=\"small muted\">" + U.esc(KB.L(m.deadline, "label")) + "</td>" +
        '<td><span class="badge-src src-' + lv + '">' + (lv === "S3" ? U.esc(t("s3Review")) : lv) + "</span></td>" +
        '<td class="small muted">' + KB.sources(m.source).map(function (s) { return KB.L(s, "name"); }).join(isZh() ? "；" : "; ") + "</td></tr>";
    }).join("");
    $("kbTable").querySelector("tbody").innerHTML = rows;
    $("kbMeta").textContent = t("kbTotal") + " " + allMatters().length + " ｜ " + t("kbLastUpdate") + " " + KB.META.updated + t("metaLocalItems") + LOCAL_KB.length;
  }
  renderKbTable();

  $("btnAddKb").addEventListener("click", function () { $("kbAddBox").classList.toggle("hidden"); });
  $("btnCancelKb").addEventListener("click", function () { $("kbAddBox").classList.add("hidden"); });

  /* AI 提炼导入：粘贴官方原文 → LLM 结构化 → 预填表单 → 人工核对后保存 */
  $("btnKbAi").addEventListener("click", function () {
    var raw = $("kbRaw").value.trim();
    if (!raw) { U.toast(t("kbRawEmpty")); return; }
    if (raw.length < 20) { U.toast(t("kbRawTooShort")); return; }
    var btn = $("btnKbAi");
    btn.disabled = true;
    var old = btn.innerHTML;
    btn.innerHTML = U.esc(t("kbExtracting"));
    window.Agent.extractKb(raw, "zh", function () {}).then(function (r) {
      $("kbT").value = r.title || "";
      $("kbS").value = r.stage || "arrival";
      $("kbP").value = r.pri || "P1";
      $("kbD").value = r.deadline || "";
      $("kbX").value = r.summary || "";
      $("kbU").value = (r.sourceNote ? r.sourceNote + " ｜ " : "") + "S2 ｜ " + new Date().toISOString().slice(0, 10);
      $("kbRaw").value = "";
      U.toast(t("kbExtractDone"));
      btn.disabled = false;
      btn.innerHTML = old;
    }).catch(function () {
      U.toast(t("kbExtractFail"));
      btn.disabled = false;
      btn.innerHTML = old;
    });
  });

  $("btnSaveKb").addEventListener("click", function () {
    var title = $("kbT").value.trim();
    if (!title) { U.toast(t("kbTitleRequired")); return; }
    var item = {
      id: "local_" + Date.now(), _local: true, stage: $("kbS").value, order: 99, pri: $("kbP").value,
      title: title, title_en: title, summary: $("kbX").value.trim() || t("localKbDefaultSummary"),
      summary_en: $("kbX").value.trim() || "", deadline: { kind: "none", from: "none", label: $("kbD").value.trim() || t("localKbDefaultDeadline") },
      docs: [], channel: t("localKbDefaultChannel"), risk: t("localKbDefaultRisk"),
      source: ["school"], applies: { purposes: [], durations: [] }, _srcNote: $("kbU").value.trim()
    };
    LOCAL_KB.push(item);
    /* 只持久化用户自建条目：预置条目始终从 kb-school-sysu.js 读最新版，
       否则会把「当前这份快照」冻结进缓存，后续补的译文无法生效。 */
    U.save("localKb", LOCAL_KB.filter(function (x) { return x && !x._preset; }));
    $("kbT").value = ""; $("kbD").value = ""; $("kbX").value = ""; $("kbU").value = "";
    $("kbAddBox").classList.add("hidden");
    renderKbTable(); drawBoard();
    U.toast(t("kbSaved"));
  });

  /* ================= 打印与语言 ================= */
  $("btnPrintOrg").addEventListener("click", function () { window.print(); });

  U.initReveal();
  applyGenDefaults(false);
  genContent();

  /* 预探测本地 LLM 代理（AI Agent 双模式：LLM 在线 / 离线兜底） */
  setTimeout(function () {
    if (window.Agent && window.Agent.ensureBridge) window.Agent.ensureBridge();
    setTimeout(function () {
      try {
        if (window.Agent.bridgeOk()) document.body.classList.add("llm-on");
      } catch (e) {}
    }, 700);
  }, 400);

  document.addEventListener("langchange", function () {
    renderGenSelectors();
    /* 页脚渠道名由 KB.META.channels 生成，不带 data-i18n，必须重绘；
       旧版漏了这一步，导致本页页脚在非中文语种下仍是中文。 */
    document.getElementById("chrome-bottom").innerHTML = U.footer("");
    renderTplCards(); drawBoard(); renderEff(); renderKbTable(); tplDesc(); applyGenDefaults(false); genContent();
  });
  window.addEventListener("resize", function () { charts.forEach(function (c) { try { c.resize(); } catch (e) { } }); });
})();
