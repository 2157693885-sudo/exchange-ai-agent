/* 来华交流全程助手 · 门户页交互 v2.0 */
(function () {
  "use strict";
  var U = window.UI, A = window.Agent, KB = window.KB;

  /* ---------- 骨架注入 ---------- */
  document.getElementById("chrome-top").innerHTML = U.header("home");
  document.getElementById("chrome-bottom").innerHTML = U.footer("");
  U.initTheme(); U.initLang(); U.bindChrome();

  /* 图标注入 */
  var IC = {
    icoS: "student", icoO: "org", icoWarn: "alert", icoPain: "target", icoSol: "layers",
    icoFlow: "flow", icoData: "chart", icoOpc: "bolt", icoComp: "shield",
    pico1: "clock", pico2: "layers", pico3: "globe", pico4: "users",
    sico1: "student", sico2: "org",
    cico1: "book", cico2: "shield", cico3: "lock", cico4: "target"
  };
  Object.keys(IC).forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.innerHTML = U.ICONS[IC[id]];
  });

  /* Hero 信任标签（随语言重绘） */
  function portalZh() { var c = (window.L10N && window.L10N.current) || "zh"; return String(c).slice(0, 2) === "zh"; }
  function setPortalText() {
    var zh = portalZh();
    document.getElementById("chip1").innerHTML = '<span class="ico">' + U.ICONS.book + "</span>" + (zh ? "来源锚定 · 无来源不入库" : "Source-anchored · nothing enters without a source");
    document.getElementById("chip2").innerHTML = '<span class="ico">' + U.ICONS.shield + "</span>" + (zh ? "AI 生成标识 + 人工复核" : "AI-labelled · human review before release");
    document.getElementById("chip3").innerHTML = '<span class="ico">' + U.ICONS.lock + "</span>" + (zh ? "数据本地化 · 零后端依赖" : "Local-first · zero backend dependency");
    document.getElementById("chip4").innerHTML = '<span class="ico">' + U.ICONS.globe + "</span>" + (zh ? "十语界面 · 含 RTL" : "10-language UI · RTL ready");
    document.getElementById("painLead").textContent = zh
      ? "2024—2025 学年已有来自 191 个国家和地区的 38 万名国际学生在华学习交流；240 小时过境免签适用国家达 57 国、单方面免签达 50 国。规模与政策红利同时释放，但办事指引仍停留在「自己找、反复问」的阶段。"
      : "In the 2024–2025 academic year, over 380,000 international students from 191 countries studied in China. 240-hour visa-free transit now covers 57 countries, and unilateral visa exemption 50. Policy dividends keep expanding, yet guidance still means \u201csearch on your own, ask repeatedly.\u201d";
  }
  setPortalText();
  document.getElementById("flowEyebrow").textContent = U.L10N.t("flowTitle");
  document.getElementById("opcEyebrow").textContent = U.L10N.t("opcSub");

  /* ---------- Hero 迷你路径演示 ---------- */
  var heroSteps = ["意图识别", "画像读取", "知识检索", "规则判定", "内容生成", "合规复核"];
  var heroStepsEn = ["Intent", "Profile", "Knowledge", "Rules", "Generate", "Review"];
  function renderHeroFlow() {
    var zh = portalZh();
    heroFlow.innerHTML = (zh ? heroSteps : heroStepsEn).map(function (s, i) {
      return '<div class="flow-step" data-i="' + i + '"><div class="fs-n">STEP ' + (i + 1) + '</div><div class="fs-t">' + s + "</div></div>";
    }).join("");
  }
  var heroFlow = document.getElementById("artFlow");
  renderHeroFlow();

  var heroOut = document.getElementById("artOut");
  function renderHeroOut() {
    var zh = portalZh();
    var p = { country: "PK", purpose: "degree", duration: "lt180", arrival: "2026-09-01" };
    var list = A.buildChecklist(p).filter(function (x) { return x.matter.pri === "P0"; }).slice(0, 3);
    heroOut.innerHTML = list.map(function (x) {
      var m = x.matter, d = x.deadline;
      var tone = d.urgency === "urgent" ? "callout-danger" : (d.urgency === "soon" ? "callout-warn" : "callout-info");
      return '<div class="callout ' + tone + '" style="padding:10px 14px"><span class="ico note-ico">' + U.ICONS.clock + "</span>" +
        '<div><div class="ct" style="font-size:.86rem">' + (zh ? m.title : (m.title_en || m.title)) + "</div>" +
        '<p class="tiny" style="margin:0">' + (zh ? m.deadline.label : (m.deadline.label_en || m.deadline.label)) + (d.dateStr ? (zh ? " ｜ 按你的抵达日推算：" : " ｜ estimated from your arrival date: ") + d.dateStr : "") + "</p></div></div>";
    }).join("");
  }
  renderHeroOut();

  var hIdx = 0;
  function heroTick() {
    var nodes = heroFlow.querySelectorAll(".flow-step");
    nodes.forEach(function (n) { n.classList.remove("is-active", "is-done"); });
    for (var i = 0; i < hIdx; i++) nodes[i] && nodes[i].classList.add("is-done");
    nodes[hIdx] && nodes[hIdx].classList.add("is-active");
    hIdx = (hIdx + 1) % (heroSteps.length + 1);
  }
  heroTick();
  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) setInterval(heroTick, 900);

  /* ---------- Agent 工作流 ---------- */
  var FLOW = [
    { t: "flow1", d: "flow1d", n: "1", body: "把用户的一句话或一次选择，映射到明确的意图标签（如「住宿登记」「居留许可延期」「实习合规」）。采用关键词加权 + 程序性提问兜底，避免把「怎么办」这类泛问误判为无关内容。" },
    { t: "flow2", d: "flow2d", n: "2", body: "读取身份、来华事由、预计停留时长、抵达日期、国别与信仰/饮食需求。画像仅存于浏览器本地，用于改变输出内容与时限推算，不用于识别个人身份。" },
    { t: "flow3", d: "flow3d", n: "3", body: "在来源锚定的知识库中做轻量检索打分（字符二元组重合度），召回事项与问答条目，并返回命中分值供用户查看。无来源的条目不会被召回。" },
    { t: "flow4", d: "flow4d", n: "4", body: "把法定时限规则套用到用户的关键日期上：24 小时（住宿登记）、30 日（居留许可）、到期前 30 天（延期启动）、离校前 3—4 周等，输出带具体日期的提醒与紧迫度分级。" },
    { t: "flow5", d: "flow5d", n: "5", body: "生成办理路径、办事清单、机构侧内容材料与多语种版本。结构多语种，关键术语走术语表；非中英语种标注「机器翻译 · 待人工复核」。" },
    { t: "flow6", d: "flow6d", n: "6", body: "为每一条输出附加证据等级（S1/S2/S3）、核对日期、AI 生成标识与人工复核入口；命中 S3 条目时强制显示「待属地复核」，并引导转人工。" }
  ];
  var flowRail = document.getElementById("flowRail");
  var flowDetail = document.getElementById("flowDetail");
  function renderFlow(active) {
    flowRail.innerHTML = FLOW.map(function (f, i) {
      return '<button type="button" class="flow-step' + (i === active ? " is-active" : "") + '" data-i="' + i + '" style="text-align:left;cursor:pointer">' +
        '<div class="fs-n">STEP ' + f.n + "</div><div class=\"fs-t\">" + U.L10N.t(f.t) + '</div><div class="fs-d">' + U.L10N.t(f.d) + "</div></button>";
    }).join("");
    var f = FLOW[active];
    flowDetail.innerHTML = '<div class="row" style="align-items:flex-start;gap:var(--sp-4)">' +
      '<span class="pill-num">' + f.n + "</span>" +
      "<div><h3 style=\"margin-bottom:8px\">" + U.L10N.t(f.t) + " · " + U.L10N.t(f.d) + "</h3>" +
      '<p class="small muted" style="margin:0;max-width:76ch">' + f.body + "</p></div></div>";
    flowRail.querySelectorAll(".flow-step").forEach(function (b) {
      b.addEventListener("click", function () { renderFlow(parseInt(b.getAttribute("data-i"), 10)); });
    });
  }
  renderFlow(0);

  /* ---------- 图表 ---------- */
  var charts = [];
  function chart(id, opt) {
    var el = document.getElementById(id);
    if (!el || !window.echarts) return;
    var c = window.echarts.init(el, null, { renderer: "svg" });
    c.setOption(opt); charts.push(c);
  }
  var PALETTE = ["#174E8C", "#12977F", "#C2402C", "#B45309", "#6B4C9A", "#4A8CD0"];

  function drawCharts() {
    charts.forEach(function (c) { try { c.dispose(); } catch (e) {} });
    charts = [];
    var base = { textStyle: { fontFamily: 'Inter, "Noto Sans SC", "Microsoft YaHei", sans-serif', color: "#45566E" } };

    chart("chartOrigin", Object.assign({}, base, {
      tooltip: { trigger: "item", formatter: "{b}: {c}%（占比）" },
      legend: { bottom: 0, itemWidth: 9, itemHeight: 9, textStyle: { fontSize: 11 } },
      series: [{
        type: "pie", radius: ["52%", "74%"], center: ["50%", "44%"], avoidLabelOverlap: true,
        itemStyle: { borderColor: "#fff", borderWidth: 2, borderRadius: 4 },
        label: { formatter: "{d}%", fontSize: 11, color: "#26374F" },
        data: [
          { name: "亚洲", value: 61.1, itemStyle: { color: PALETTE[0] } },
          { name: "非洲", value: 16.2, itemStyle: { color: PALETTE[1] } },
          { name: "欧洲", value: 15.6, itemStyle: { color: PALETTE[2] } },
          { name: "美洲与大洋洲", value: 7.1, itemStyle: { color: PALETTE[3] } }
        ]
      }]
    }));

    chart("chartPolicy", Object.assign({}, base, {
      tooltip: { trigger: "axis" },
      legend: { bottom: 0, itemWidth: 9, itemHeight: 9, textStyle: { fontSize: 11 } },
      grid: { left: 46, right: 46, top: 18, bottom: 44 },
      xAxis: { type: "category", data: ["北京", "上海", "广州"], axisLine: { lineStyle: { color: "#D8E0EA" } }, axisLabel: { fontSize: 11 } },
      yAxis: [
        { type: "value", name: "万人次", nameTextStyle: { fontSize: 10 }, splitLine: { lineStyle: { color: "#EBF0F6" } }, axisLabel: { fontSize: 11 } },
        { type: "value", name: "%", max: 100, nameTextStyle: { fontSize: 10 }, splitLine: { show: false }, axisLabel: { fontSize: 11 } }
      ],
      series: [
        { name: "入境外国人（万人次）", type: "bar", barWidth: 26, itemStyle: { color: PALETTE[0], borderRadius: [5, 5, 0, 0] }, data: [340, 534.6, 320] },
        { name: "其中免签占比（%）", type: "line", yAxisIndex: 1, smooth: true, symbolSize: 7, lineStyle: { width: 3, color: PALETTE[2] }, itemStyle: { color: PALETTE[2] }, data: [55, 56, 57] }
      ]
    }));

    /* 知识库覆盖：按阶段 × 是否含 S3 来源 */
    var stages = [["pre", "来华前"], ["arrival", "抵达初期"], ["study", "在学日常"], ["exit", "离境前后"]];
    var s1 = [], s3 = [];
    stages.forEach(function (s) {
      var ms = KB.mattersByStage(s[0]);
      var a = 0, b = 0;
      ms.forEach(function (m) {
        var hasS3 = m.source.some(function (k) { return KB.SRC[k] && KB.SRC[k].level === "S3"; });
        if (hasS3) b++; else a++;
      });
      s1.push(a); s3.push(b);
    });
    chart("chartKB", Object.assign({}, base, {
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      legend: { bottom: 0, itemWidth: 9, itemHeight: 9, textStyle: { fontSize: 11 } },
      grid: { left: 40, right: 16, top: 18, bottom: 44 },
      xAxis: { type: "category", data: stages.map(function (s) { return s[1]; }), axisLine: { lineStyle: { color: "#D8E0EA" } }, axisLabel: { fontSize: 11 } },
      yAxis: { type: "value", name: "条目", nameTextStyle: { fontSize: 10 }, splitLine: { lineStyle: { color: "#EBF0F6" } }, axisLabel: { fontSize: 11 } },
      series: [
        { name: "S1/S2 来源", type: "bar", stack: "a", barWidth: 30, itemStyle: { color: PALETTE[1] }, data: s1 },
        { name: "含 S3（待属地复核）", type: "bar", stack: "a", barWidth: 30, itemStyle: { color: PALETTE[3], borderRadius: [4, 4, 0, 0] }, data: s3 }
      ]
    }));

    chart("chartCost", Object.assign({}, base, {
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, formatter: "{b}: ¥{c}" },
      grid: { left: 108, right: 40, top: 12, bottom: 24 },
      xAxis: { type: "value", splitLine: { lineStyle: { color: "#EBF0F6" } }, axisLabel: { fontSize: 11, formatter: "¥{value}" } },
      yAxis: { type: "category", data: ["大模型调用（按演示用量）", "域名与静态托管", "合规与安全自查", "设计素材与字体（开源）"], axisLine: { lineStyle: { color: "#D8E0EA" } }, axisLabel: { fontSize: 11 } },
      series: [{
        type: "bar", barWidth: 18, itemStyle: { color: PALETTE[0], borderRadius: [0, 5, 5, 0] },
        label: { show: true, position: "right", fontSize: 11, formatter: "¥{c}" },
        data: [120, 15, 20, 0]
      }]
    }));

    chart("chartHours", Object.assign({}, base, {
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" }, formatter: "{b}: {c} 小时/周" },
      grid: { left: 118, right: 40, top: 12, bottom: 24 },
      xAxis: { type: "value", splitLine: { lineStyle: { color: "#EBF0F6" } }, axisLabel: { fontSize: 11 } },
      yAxis: { type: "category", data: ["产品开发与调试", "知识库核验与录入", "需求调研与场景访谈", "内容与多语种生产", "测试与合规复核"], axisLine: { lineStyle: { color: "#D8E0EA" } }, axisLabel: { fontSize: 11 } },
      series: [{
        type: "bar", barWidth: 18, itemStyle: { color: PALETTE[1], borderRadius: [0, 5, 5, 0] },
        label: { show: true, position: "right", fontSize: 11, formatter: "{c} h" },
        data: [10, 8, 6, 4, 4]
      }]
    }));
  }
  drawCharts();

  /* ---------- OPC 看板 ---------- */
  document.getElementById("roleTitle").textContent = U.L10N.t("opcRoles");
  document.getElementById("iterTitle").textContent = U.L10N.t("opcIter");
  document.getElementById("effTitle").textContent = U.L10N.t("opcMeasureTitle");

  var ROLES = [
    ["产品与场景设计", "负责人：场景调研、功能取舍、验收标准"],
    ["知识运营与来源核验", "负责人：条目入库与来源核对；AI 辅助初筛与归类"],
    ["前端与 Agent 实现", "负责人：交互与引擎；AI 辅助代码生成与调试"],
    ["内容与多语种生产", "AI 生成初稿与多语种版本，负责人逐条复核"],
    ["测试与合规复核", "负责人：证据等级校验与边界审查；AI 辅助回归测试"]
  ];
  document.getElementById("roleList").innerHTML = ROLES.map(function (r) {
    return '<div style="padding:10px 0;border-bottom:1px dashed var(--line)"><div class="strong small">' + r[0] + '</div><div class="tiny muted" style="margin-top:3px">' + r[1] + "</div></div>";
  }).join("");

  var ITERS = [
    ["v0.1", "2026-08 上旬", "场景调研与问题定义：确认四阶段框架与时限性痛点"],
    ["v0.5", "2026-08 下旬", "知识库与规则引擎：27 条事项、8 条问答、来源锚定机制"],
    ["v1.0", "2026-09 上旬", "学生端：路径判定、办事清单、到期提醒、可解释问答"],
    ["v1.5", "2026-09 中旬", "机构端：六类内容模板、发布闭环、服务看板"],
    ["v2.0", "2026-09 下旬", "六语界面（含 RTL）、国别适配层、合规复核与 AI 标识"]
  ];
  document.getElementById("iterList").innerHTML = '<div class="timeline">' + ITERS.map(function (it) {
    return '<div class="tl-item"><div class="tl-date">' + it[0] + " · " + it[1] + '</div><div class="small">' + it[2] + "</div></div>";
  }).join("") + "</div>";

  var eff = A.efficiencyModel({ minPerCase: 12, cases: 260, cut: 0.55, hourly: 60 });
  document.getElementById("effBox").innerHTML =
    '<div class="stack">' +
    '<div class="row-between small"><span class="muted">' + U.L10N.t("planA") + '</span><span class="strong num">' + eff.minPerCase + " 分钟</span></div>" +
    '<div class="row-between small"><span class="muted">' + U.L10N.t("planB") + '</span><span class="strong num">' + eff.cases + " 次</span></div>" +
    '<div class="row-between small"><span class="muted">' + U.L10N.t("planC") + '</span><span class="strong num">' + Math.round(eff.cut * 100) + "%</span></div>" +
    '<hr style="margin:10px 0">' +
    '<div class="row-between small"><span class="muted">' + U.L10N.t("calcNow") + '</span><span class="strong num">' + eff.manualHours.toFixed(1) + " h</span></div>" +
    '<div class="row-between small"><span class="muted">' + U.L10N.t("calcWith") + '</span><span class="strong num">' + eff.agentHours.toFixed(1) + " h</span></div>" +
    '<div class="row-between"><span class="strong">' + U.L10N.t("calcSaved") + '</span><span class="strong num" style="color:var(--jade-600);font-size:1.15rem">' + eff.savedHours.toFixed(1) + " h / ¥" + Math.round(eff.savedCost) + "</span></div>" +
    "</div>";
  document.getElementById("effNote").innerHTML =
    '<span class="ico note-ico">' + U.ICONS.alert + "</span><div><div class=\"ct\">" + U.L10N.t("measureTitle") + "</div>" +
    '<p class="small" style="margin:0">' + U.L10N.t("measureNote") +
    " 测算口径：单次重复咨询人工耗时 12 分钟、每月重复咨询 260 次、可自助解决比例 55%、综合人力成本 60 元/小时（含社保与间接成本）。参数可在机构端调整。</p></div>";

  U.initReveal();

  /* 语言切换后重绘 */
  document.addEventListener("langchange", function () {
    document.getElementById("flowEyebrow").textContent = U.L10N.t("flowTitle");
    document.getElementById("opcEyebrow").textContent = U.L10N.t("opcSub");
    document.getElementById("roleTitle").textContent = U.L10N.t("opcRoles");
    document.getElementById("iterTitle").textContent = U.L10N.t("opcIter");
    document.getElementById("effTitle").textContent = U.L10N.t("opcMeasureTitle");
    setPortalText(); renderHeroFlow();
    document.getElementById("chrome-bottom").innerHTML = U.footer("");
    renderHeroOut(); renderFlow(0); drawCharts();
  });

  window.addEventListener("resize", function () {
    charts.forEach(function (c) { try { c.resize(); } catch (e) {} });
  });
})();
