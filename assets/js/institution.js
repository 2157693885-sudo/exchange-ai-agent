/* 来华交流全程助手 · 机构端 v2.0 */
(function () {
  "use strict";
  var U = window.UI, A = window.Agent, KB = window.KB;
  var t = function (k) { return U.L10N.t(k); };
  var $ = function (id) { return document.getElementById(id); };

  document.getElementById("chrome-top").innerHTML = U.header("org").replace(
    /<nav class="nav"[\s\S]*?<\/nav>/,
    '<nav class="nav" aria-label="主导航">' +
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

  /* ================= 看板 ================= */
  var LOCAL_KB = U.load("localKb", []);
  function allMatters() { return KB.MATTERS.concat(LOCAL_KB); }

  var total = allMatters().length + KB.FAQ.length;
  var s3n = allMatters().filter(function (m) { return m.source.some(function (k) { return KB.SRC[k] && KB.SRC[k].level === "S3"; }); }).length;
  $("b1").textContent = total;
  $("b2").textContent = s3n;
  $("b3").textContent = KB.LANGS.length;
  var eff0 = A.efficiencyModel({});
  $("b4").textContent = Math.round(eff0.cut * 100) + "%";
  $("b4n").textContent = "假设自助解决比例（可在下方调整）";

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

    /* 咨询热点 Top 6 —— 由知识库条目 + 演示命中权重推导，可解释 */
    var hot = allMatters().slice(0).map(function (m, i) {
      var baseW = { P0: 120, P1: 70, P2: 34 }[m.pri] || 40;
      return { name: m.title, w: baseW + ((i * 37) % 40) };
    }).sort(function (a, b) { return b.w - a.w; }).slice(0, 6);
    chart("chConsult", Object.assign({}, base, {
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      grid: { left: 128, right: 42, top: 12, bottom: 24 },
      xAxis: { type: "value", splitLine: { lineStyle: { color: "#EBF0F6" } }, axisLabel: { fontSize: 11 } },
      yAxis: { type: "category", inverse: true, data: hot.map(function (h) { return h.name.length > 12 ? h.name.slice(0, 12) + "…" : h.name; }), axisLine: { lineStyle: { color: "#D8E0EA" } }, axisLabel: { fontSize: 11 } },
      series: [{ type: "bar", barWidth: 15, itemStyle: { color: PAL[0], borderRadius: [0, 5, 5, 0] }, label: { show: true, position: "right", fontSize: 11 }, data: hot.map(function (h) { return h.w; }) }]
    }));

    /* 时限分布：按阶段统计 P0/P1/P2 */
    var stages = [["pre", "来华前"], ["arrival", "抵达初期"], ["study", "在学日常"], ["exit", "离境前后"]];
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
        { name: "含 S3", type: "bar", stack: "y", barWidth: 26, itemStyle: { color: PAL[3], borderRadius: [4, 4, 0, 0] }, data: s3 }
      ]
    }));
  }
  drawBoard();

  /* ================= 内容工作台 ================= */
  $("gTpl").innerHTML = KB.TEMPLATES.map(function (x, i) { return '<option value="' + x.id + '"' + (i === 0 ? " selected" : "") + ">" + x.name + " · " + x.name_en + "</option>"; }).join("");
  /* 模板卡片（参考模板画廊的直观选择） */
  var TPL_ICONS = { t_guide: "book", t_checklist: "list", t_notice: "bell", t_faq: "chat", t_brief: "clock", t_emergency: "alert" };
  var TPL_PICK = { t_guide: "国别指南", t_checklist: "行前清单", t_notice: "公告", t_faq: "FAQ", t_brief: "迎新简报", t_emergency: "应急卡" };
  function renderTplCards() {
    var sel = $("gTpl").value;
    $("tplCards").innerHTML = KB.TEMPLATES.map(function (x) {
      var ic = U.icon(TPL_ICONS[x.id] || "doc");
      var pick = TPL_PICK[x.id] || "";
      return '<button type="button" class="tpl-card' + (x.id === sel ? " on" : "") + '" data-tpl="' + x.id + '">' +
        '<span class="tpl-ic">' + ic + "</span>" +
        "<div><div class=\"tpl-n\">" + U.esc(x.name) + " <span class=\"tpl-e\">" + U.esc(x.name_en) + "</span></div>" +
        '<div class="tpl-p">' + pick + "</div></div></button>";
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
  $("gCountry").innerHTML = Object.keys(KB.COUNTRY).map(function (k) {
    var c = KB.COUNTRY[k];
    return '<option value="' + k + '"' + (k === "PK" ? " selected" : "") + ">" + c.zh + (c.en !== c.zh ? " · " + c.en : "") + "</option>";
  }).join("");
  $("gLang").innerHTML = KB.LANGS.map(function (l) { return '<option value="' + l.code + '"' + (l.code === "zh" ? " selected" : "") + ">" + l.name + (l.en && l.en !== l.name ? " · " + l.en : "") + "</option>"; }).join("");

  function tplDesc() {
    var id = $("gTpl").value;
    KB.TEMPLATES.forEach(function (x) { if (x.id === id) $("gTplDesc").textContent = x.desc + " ｜ 章节：" + x.sections.join(" / "); });
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
    $("pvMeta").textContent = LAST.template + " ｜ " + (KB.COUNTRY[cfg.country] ? KB.COUNTRY[cfg.country].zh : "") + " ｜ " + cfg.lang.toUpperCase() + " ｜ " + new Date().toLocaleString();
    $("pvAI").textContent = LAST.aiLabel;
    $("pvBody").innerHTML = U.mdToHtml(LAST.markdown);
    $("pvSrc").innerHTML = '<div class="small strong" style="margin-bottom:6px">' + t("sourceLabel") + "</div>" +
      '<ul class="tiny muted" style="padding-left:1.1em;margin:0">' + LAST.sources.map(function (s) { return "<li>" + s + "</li>"; }).join("") + "</ul>";
    U.toast(t("genPreview") + " ✓");
  }
  /* ================= AI Agent 一句话生成 ================= */
  $("btnAiGen").addEventListener("click", function () {
    var task = $("aiTask").value.trim();
    if (!task) { U.toast("请输入任务描述，例如：为哈萨克斯坦研学团生成行前手册"); return; }
    $("btnAiGen").disabled = true;
    var btnTxt = $("btnAiGen");
    btnTxt.querySelector("span:last-child").textContent = "生成中…";
    $("aiTrace").innerHTML = '<div class="ai-working">AI Agent 正在执行任务：任务解析 → 知识检索 → 大模型生成 → 合规复核</div>';
    A.genMaterialLLM(task, $("gLang").value).then(function (r) {
      LAST = r;
      $("pvMeta").textContent = "AI Agent · " + task.slice(0, 34) + " ｜ " + new Date().toLocaleString();
      $("pvAI").textContent = r.aiLabel || "AI 生成 · 待人工复核";
      $("pvBody").innerHTML = U.mdToHtml(r.markdown);
      $("pvSrc").innerHTML = '<div class="small strong" style="margin-bottom:6px">' + t("sourceLabel") + "</div>" +
        '<ul class="tiny muted" style="padding-left:1.1em;margin:0">' + (r.sources.length ? r.sources.map(function (s) { return "<li>" + s + "</li>"; }).join("") : "<li>AI 生成内容，请人工复核后发布</li>") + "</ul>";
      if (r.steps && r.steps.length) {
        $("aiTrace").innerHTML = "<div class='trace-card'><div class='trace-head' role='button' tabindex='0'>Agent 运行轨迹 · " + r.steps.length + " 步 <span class='trace-arrow'>▾</span></div><div class='trace-body'>" +
          r.steps.map(function (s) { return "<div class='trace-step'><span class='n'>" + s.n + "</span><div><b>" + U.esc(s.title) + "</b><p class='tiny muted'>" + U.esc(s.detail) + "</p></div></div>"; }).join("") + "</div></div>";
        var head = $("aiTrace").querySelector(".trace-head");
        head.addEventListener("click", function () { $("aiTrace").querySelector(".trace-body").classList.toggle("open"); });
      } else {
        $("aiTrace").innerHTML = "";
      }
      btnTxt.querySelector("span:last-child").textContent = "AI 生成";
      $("btnAiGen").disabled = false;
      U.toast("AI 生成完成 ✓（请复核后发布）");
    });
  });

  $("btnGenContent").addEventListener("click", genContent);
  $("gTpl").addEventListener("change", function () { tplDesc(); genContent(); });
  ["gCountry", "gLang"].forEach(function (id) { $(id).addEventListener("change", genContent); });
  $("btnTplReset").addEventListener("click", function () {
    $("gTopic").value = "秋季学期居留许可集中办理";
    $("gDeadline").value = "2026-10-15 前";
    $("gContact").value = "国际学生办公室 · 电话 0000-0000000";
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
    U.toast(t("genTranslate") + " → " + next.toUpperCase() + "（机器翻译 · 待人工复核）");
  });
  $("btnExpHtml").addEventListener("click", function () {
    var html = '<!DOCTYPE html><html lang="' + $("gLang").value + '"><head><meta charset="utf-8"><title>' + U.esc(LAST.title) + "</title>" +
      "<style>body{font-family:Inter,'Noto Sans SC','Microsoft YaHei',sans-serif;max-width:820px;margin:40px auto;padding:0 20px;line-height:1.8;color:#16243A}" +
      "h2{color:#0E2B52}h3{color:#123A6B;margin-top:1.6em}blockquote{border-left:3px solid #174E8C;margin:0;padding:8px 14px;background:#F2F7FD;color:#45566E;font-size:.92em}" +
      "li{margin:.3em 0}.meta{color:#64748B;font-size:.85em;border-top:1px solid #E1E8F1;padding-top:12px;margin-top:24px}</style></head><body>" +
      U.mdToHtml(LAST.markdown) +
      '<div class="meta">' + LAST.aiLabel + " ｜ " + t("sourceLabel") + "：" + LAST.sources.join("；") + " ｜ " + KB.META.updated + "</div></body></html>";
    U.download("材料_" + $("gTpl").value + "_" + $("gLang").value + "_" + new Date().toISOString().slice(0, 10) + ".html", html, "text/html;charset=utf-8");
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
    $("mAVal").textContent = M.minPerCase + " 分钟";
    $("mBVal").textContent = M.cases + " 次";
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
        { type: "value", name: "小时 / 月", nameTextStyle: { fontSize: 10 }, max: function (v) { return Math.ceil(v.max / 20) * 20; }, splitLine: { lineStyle: { color: "#EBF0F6" } }, axisLabel: { fontSize: 11 } },
        { type: "value", show: false, max: function (v) { return Math.ceil(v.max / 1000) * 1000; } }
      ],
      series: [
        { name: "人工工时", type: "bar", barWidth: 44, itemStyle: { color: PAL[0], borderRadius: [6, 6, 0, 0] }, label: { show: true, position: "top", fontSize: 11, formatter: "{c} h" }, data: [r.manualHours.toFixed(1), r.agentHours.toFixed(1)] },
        { name: "折算成本（元）", type: "line", yAxisIndex: 1, symbolSize: 0, lineStyle: { width: 0 }, itemStyle: { color: PAL[1] }, label: { show: true, position: "top", fontSize: 10, formatter: "¥{c}" }, data: [r.manualCost.toFixed(0), r.agentCost.toFixed(0)] }
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
    var stName = { pre: "来华前", arrival: "抵达初期", study: "在学日常", exit: "离境前后" };
    var rows = allMatters().map(function (m) {
      var lv = levelOf(m);
      return "<tr><td>" + (stName[m.stage] || m.stage) + "</td><td><span class=\"chip " + (m.pri === "P0" ? "chip-cin" : (m.pri === "P1" ? "chip-amber" : "chip-line")) + '">' + m.pri + "</span></td>" +
        "<td>" + m.title + (m._local ? ' <span class="chip chip-jade tiny">校本</span>' : "") + "</td>" +
        "<td class=\"small muted\">" + m.deadline.label + "</td>" +
        '<td><span class="badge-src src-' + lv + '">' + (lv === "S3" ? "S3 待复核" : lv) + "</span></td>" +
        '<td class="small muted">' + KB.sources(m.source).map(function (s) { return s.name; }).join("；") + "</td></tr>";
    }).join("");
    $("kbTable").querySelector("tbody").innerHTML = rows;
    $("kbMeta").textContent = t("kbTotal") + " " + allMatters().length + " ｜ " + t("kbLastUpdate") + " " + KB.META.updated + " ｜ 校本条目 " + LOCAL_KB.length;
  }
  renderKbTable();

  $("btnAddKb").addEventListener("click", function () { $("kbAddBox").classList.toggle("hidden"); });
  $("btnCancelKb").addEventListener("click", function () { $("kbAddBox").classList.add("hidden"); });
  $("btnSaveKb").addEventListener("click", function () {
    var title = $("kbT").value.trim();
    if (!title) { U.toast("请填写事项标题"); return; }
    var item = {
      id: "local_" + Date.now(), _local: true, stage: $("kbS").value, order: 99, pri: $("kbP").value,
      title: title, title_en: title, summary: $("kbX").value.trim() || "（校本条目，说明待补充）",
      summary_en: $("kbX").value.trim() || "", deadline: { kind: "none", from: "none", label: $("kbD").value.trim() || "以本校规定为准" },
      docs: [], channel: "本校国际学生办公室（校本口径）", risk: "以本校最新规定为准。",
      source: ["school"], applies: { purposes: [], durations: [] }, _srcNote: $("kbU").value.trim()
    };
    LOCAL_KB.push(item); U.save("localKb", LOCAL_KB);
    $("kbT").value = ""; $("kbD").value = ""; $("kbX").value = ""; $("kbU").value = "";
    $("kbAddBox").classList.add("hidden");
    renderKbTable(); drawBoard();
    U.toast(t("kbSaved"));
  });

  /* ================= 打印与语言 ================= */
  $("btnPrintOrg").addEventListener("click", function () { window.print(); });

  U.initReveal();
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
    drawBoard(); renderEff(); renderKbTable(); tplDesc(); genContent();
  });
  window.addEventListener("resize", function () { charts.forEach(function (c) { try { c.resize(); } catch (e) { } }); });
})();
