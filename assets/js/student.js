/* 来华交流全程助手 · 学生端 v2.0 */
(function () {
  "use strict";
  var U = window.UI, A = window.Agent, KB = window.KB, t = function (k) { return U.L10N.t(k); };
  var CUR = function () { return (window.L10N && window.L10N.current) || "zh"; };
  var TR = function (v, vEn) { return CUR() === "zh" ? v : (vEn || v); };
  var $ = function (id) { return document.getElementById(id); };

  document.getElementById("chrome-top").innerHTML = U.header("student");
  document.getElementById("chrome-bottom").innerHTML = U.footer("");
  U.initTheme(); U.initLang(); U.bindChrome();

  ["iPrint", "iReset", "iSpark", "iDown", "iSend"].forEach(function (id, i) {
    var names = ["print", "refresh", "sparkle", "down", "chat"];
    var el = $(id); if (el) el.innerHTML = U.ICONS[names[i]];
  });
  $("privacyChip").innerHTML = '<span class="ico">' + U.ICONS.lock + "</span>本地存储 · 不上传";

  /* ================= 画像表单 ================= */
  var P = U.load("profile", Object.assign({}, A.DEFAULT_PROFILE, { arrival: "", enroll: "" }));
  var DONE = U.load("done", {});

  function opt(v, label, sel) { return '<option value="' + v + '"' + (sel ? " selected" : "") + ">" + label + "</option>"; }

  $("fCountry").innerHTML = Object.keys(KB.COUNTRY).map(function (k) {
    var _cc = KB.COUNTRY[k];
    return opt(k, CUR() === "zh" ? (_cc.zh + (_cc.en !== _cc.zh ? " · " + _cc.en : "")) : (_cc.en || _cc.zh), P.country === k);
  }).join("");
  $("fPurpose").innerHTML = [
    opt("degree", t("purposeDegree"), P.purpose === "degree"),
    opt("exchange", t("purposeExchange"), P.purpose === "exchange"),
    opt("visiting", t("purposeVisiting"), P.purpose === "visiting"),
    opt("short", t("purposeShort"), P.purpose === "short"),
    opt("transit", t("purposeTransit"), P.purpose === "transit")
  ].join("");
  $("fDuration").innerHTML = [
    opt("lt180", t("durLt180"), P.duration === "lt180"),
    opt("le180", t("durLe180"), P.duration === "le180"),
    opt("le240h", t("durLe240"), P.duration === "le240h")
  ].join("");
  $("fFaith").innerHTML = [
    opt("none", t("faithNone"), P.faith === "none"),
    opt("islam", t("faithIslam"), P.faith === "islam"),
    opt("buddhism", t("faithBuddhism"), P.faith === "buddhism"),
    opt("christianity", t("faithChristianity"), P.faith === "christianity"),
    opt("hinduism", t("faithHinduism"), P.faith === "hinduism"),
    opt("judaism", t("faithJudaism"), P.faith === "judaism"),
    opt("none2", t("faithNone2"), P.faith === "none2")
  ].join("");
  $("fArrival").value = P.arrival || "";
  $("fEnroll").value = P.enroll || "";

  var DIETS = [["halal", "dietHalal"], ["vegetarian", "dietVegetarian"], ["nopork", "dietNoPork"], ["nobeef", "dietNoBeef"], ["noalcohol", "dietNoAlcohol"], ["allergy", "dietAllergy"]];
  $("dietBox").innerHTML = DIETS.map(function (d) {
    var on = (P.diet || []).indexOf(d[0]) >= 0;
    return '<label class="chip' + (on ? " chip-jade" : " chip-line") + '" style="cursor:pointer"><input type="checkbox" data-diet="' + d[0] + '"' + (on ? " checked" : "") + ' style="margin-right:6px;accent-color:var(--jade-600)">' + t(d[1]) + "</label>";
  }).join("");
  $("dietBox").querySelectorAll("input").forEach(function (c) {
    c.addEventListener("change", function () {
      var v = c.getAttribute("data-diet");
      var arr = P.diet || [];
      if (c.checked) { if (arr.indexOf(v) < 0) arr.push(v); } else { arr = arr.filter(function (x) { return x !== v; }); }
      P.diet = arr;
      c.parentElement.className = "chip" + (c.checked ? " chip-jade" : " chip-line");
      save();
    });
  });

  function save() { U.save("profile", P); }

  /* ================= 生成 ================= */
  var CUR = { path: null, checklist: [], stage: "arrival", pri: "all" };

  function generate(showToast) {
    P.country = $("fCountry").value;
    P.purpose = $("fPurpose").value;
    P.duration = $("fDuration").value;
    P.faith = $("fFaith").value;
    P.arrival = $("fArrival").value;
    P.enroll = $("fEnroll").value;
    save();

    CUR.path = A.decidePath(P);
    CUR.checklist = A.buildChecklist(P);
    renderPath(); renderDeadlines(); renderCountry(); renderNews();
    renderStages(); renderChecklist();
    if (showToast) U.toast(t("pathResult") + " ✓");
    $("genHint").textContent = CUR() === "zh"
      ? "已按 " + KB.COUNTRY[P.country].zh + " · " + t("purpose" + P.purpose.charAt(0).toUpperCase() + P.purpose.slice(1)) + " 生成"
      : "Generated for " + (KB.COUNTRY[P.country].en || KB.COUNTRY[P.country].zh) + " · " + t("purpose" + P.purpose.charAt(0).toUpperCase() + P.purpose.slice(1));
  }

  function srcBadge(keys) {
    var lv = (keys || []).map(function (k) { return KB.SRC[k] ? KB.SRC[k].level : "S3"; });
    var worst = lv.indexOf("S3") >= 0 ? "S3" : (lv.indexOf("S2") >= 0 ? "S2" : "S1");
    return '<span class="badge-src src-' + worst + '">' + (worst === "S3" ? t("needReview") : worst) + "</span>";
  }
  function srcLinks(keys) {
    return KB.sources(keys).map(function (s) {
      return s.url ? '<a href="' + s.url + '" target="_blank" rel="noopener">' + TR(s.name, s.name_en) + "</a>" : "<span>" + TR(s.name, s.name_en) + "</span>";
    }).join(" · ");
  }

  function renderPath() {
    var pa = CUR.path;
    $("pathCard").innerHTML =
      '<div class="card-head"><div><div class="card-title">' + t("pathResult") + "</div>" +
      '<div class="card-sub">' + TR(KB.COUNTRY[P.country].zh, KB.COUNTRY[P.country].en) + " · " + t("purpose" + P.purpose.charAt(0).toUpperCase() + P.purpose.slice(1)) + " · " + t(P.duration === "lt180" ? "durLt180" : (P.duration === "le180" ? "durLe180" : "durLe240")) + "</div></div>" +
      '<span class="chip chip-brand">' + t("pathVisa") + "</span></div>" +
      '<div class="callout callout-info" style="margin-bottom:var(--sp-4)"><span class="ico note-ico">' + U.ICONS.key + "</span>" +
      "<div><div class=\"ct\">" + TR(pa.visa, pa.visa_en) + "</div><p class=\"small\" style=\"margin:0\">" + TR(pa.headline, pa.headline_en) + "</p></div></div>" +
      '<div class="row" style="align-items:flex-start;gap:10px;margin-bottom:var(--sp-4)"><span class="ico note-ico" style="color:var(--cinnabar-500)">' + U.ICONS.alert + "</span>" +
      "<div><div class=\"small strong\">" + t("pathRisk") + '</div><p class="small muted" style="margin:2px 0 0">' + TR(pa.key_risk, pa.key_risk_en) + "</p></div></div>" +
      '<div class="small strong" style="margin-bottom:8px">' + t("pathSteps") + "</div>" +
      '<div class="timeline">' + CUR.checklist.slice(0, 8).map(function (x, i) {
        var d = x.deadline;
        var cls = d.urgency === "urgent" ? " is-urgent" : "";
        return '<div class="tl-item' + cls + '"><div class="tl-date">' + (i + 1) + " · " + TR(x.matter.title, x.matter.title_en) + "</div>" +
          '<div class="tiny muted">' + (d.dateStr ? t("keyDeadline") + "：" + d.dateStr : TR(x.matter.deadline.label, x.matter.deadline.label_en)) + "</div></div>";
      }).join("") + "</div>" +
      '<p class="tiny muted" style="margin-top:var(--sp-4)">' + t("sourceLabel") + "：" + srcLinks(pa.source) + "</p>";
  }

  function renderDeadlines() {
    var withDate = CUR.checklist.filter(function (x) { return x.deadline.date; });
    var body = withDate.length
      ? withDate.map(function (x) {
        var d = x.deadline;
        var cls = d.urgency === "urgent" ? " is-urgent" : "";
        var tone = d.urgency === "urgent" ? "chip-cin" : (d.urgency === "soon" ? "chip-amber" : "chip-brand");
        return '<div class="tl-item' + cls + '"><div class="row-between" style="align-items:flex-start">' +
          "<div><div class=\"small strong\">" + x.matter.title + "</div>" +
          '<div class="tiny muted" style="margin-top:3px">' + x.matter.deadline.label + "</div></div>" +
          '<div style="text-align:right"><div class="small strong num">' + d.dateStr + "</div>" +
          '<span class="chip ' + tone + ' tiny" style="margin-top:4px">' + (d.urgency === "urgent" ? t("urgent") : (d.urgency === "soon" ? t("soon") : t("later"))) + (d.days !== null ? " · " + d.days + "d" : "") + "</span></div></div></div>";
      }).join("")
      : '<p class="small muted" style="margin:0">' + t("arrivalDate") + " — " + t("noData") + "</p>";
    $("deadlineCard").innerHTML =
      '<div class="card-head"><div><div class="card-title" style="font-size:1.05rem">' + t("reminder") + "</div>" +
      '<div class="card-sub">' + t("keyDeadline") + "</div></div><span class=\"chip chip-line\">" + withDate.length + "</span></div>" +
      '<div class="timeline">' + body + "</div>" +
      '<div class="callout callout-warn" style="margin-top:var(--sp-3)"><span class="ico note-ico">' + U.ICONS.alert + "</span>" +
      '<p class="small" style="margin:0">' + t("arrivalDate") + " 未填写时，仅显示规则口径（如「入境后 30 日内」），填写后自动推算具体日期。</p></div>";
  }

  function renderCountry() {
    var c = KB.COUNTRY[P.country] || KB.COUNTRY.OTHER;
    var dietNote = (P.diet || []).map(function (d) {
      var m = { halal: t("dietHalal"), vegetarian: t("dietVegetarian"), nopork: t("dietNoPork"), nobeef: t("dietNoBeef"), noalcohol: t("dietNoAlcohol"), allergy: t("dietAllergy") };
      return m[d] || d;
    });
    $("countryCard").innerHTML =
      '<div class="card-head"><div><div class="card-title" style="font-size:1.05rem">' + t("countryTitle") + "</div>" +
      '<div class="card-sub">' + (CUR() === "zh" ? c.zh + " · " + c.en : (c.en || c.zh)) + '</div></div><span class="badge-src src-S3">' + t("needReview") + "</span></div>" +
      '<div class="stack" style="gap:var(--sp-3)">' +
      '<div><div class="tiny muted">' + t("countryFaith") + '</div><div class="small">' + TR(c.faith, c.faith_en) + "</div></div>" +
      '<div><div class="tiny muted">' + t("countryDiet") + '</div><div class="small">' + TR(c.diet, c.diet_en) + "</div></div>" +
      (c.fest && c.fest.length ? '<div><div class="tiny muted">' + t("countryFest") + '</div><div class="small">' + TR(c.fest.join(" · "), (c.fest_en || []).join(" · ")) + "</div></div>" : "") +
      '<div><div class="tiny muted">' + t("countryLang") + '</div><div class="small">' + TR(c.lang, c.lang_en || c.lang) + "</div></div>" +
      '<div><div class="tiny muted">' + t("countryTips") + '</div><ul class="small" style="padding-left:1.1em;margin:4px 0 0">' + (TR(c.tips, c.tips_en) || []).map(function (x) { return "<li>" + x + "</li>"; }).join("") + "</ul></div>" +
      (dietNote.length ? '<div><div class="tiny muted">' + t("dietNeeds") + '</div><div class="wrapflex" style="margin-top:4px">' + dietNote.map(function (x) { return '<span class="chip chip-jade">' + x + "</span>"; }).join("") + "</div></div>" : "") +
      "</div>" +
      '<p class="tiny muted" style="margin-top:var(--sp-3)">' + t("countryNote") + "</p>";
  }

  function renderNews() {
    var tags = [P.purpose, P.duration, "all"];
    var list = KB.NEWS.filter(function (n) { return n.tags.some(function (x) { return tags.indexOf(x) >= 0; }); }).slice(0, 4);
    $("newsCard").innerHTML =
      '<div class="card-head"><div><div class="card-title" style="font-size:1.05rem">' + t("newsTitle") + '</div>' +
      '<div class="card-sub">' + t("newsAll") + '</div></div><span class="ico" style="color:var(--brand-600)">' + U.ICONS.bell + "</span></div>" +
      '<div class="stack" style="gap:var(--sp-3)">' + list.map(function (n) {
        return '<div style="padding-bottom:10px;border-bottom:1px dashed var(--line)">' +
          '<div class="row-between" style="gap:8px"><span class="tiny muted num">' + n.date + '</span><span class="badge-src src-' + n.level + '">' + n.level + "</span></div>" +
          '<div class="small strong" style="margin-top:4px">' + TR(n.title, n.title_en) + "</div>" +
          '<p class="tiny muted" style="margin:4px 0 0">' + TR(n.body, n.body_en) + "</p></div>";
      }).join("") + "</div>";
  }

  /* ================= 阶段与事项 ================= */
  var STAGES = [["pre", "stagePre", "stagePreDesc"], ["arrival", "stageArrival", "stageArrivalDesc"], ["study", "stageStudy", "stageStudyDesc"], ["exit", "stageExit", "stageExitDesc"]];
  $("priSeg").innerHTML = ["all", "P0", "P1", "P2"].map(function (p) {
    return '<button type="button" data-pri="' + p + '" aria-pressed="' + (p === "all") + '">' + (p === "all" ? t("all") : p) + "</button>";
  }).join("");

  function renderStages() {
    $("stageRail").innerHTML = STAGES.map(function (s, i) {
      var n = KB.mattersByStage(s[0]).length;
      return '<button class="stage" type="button" data-stage="' + s[0] + '" aria-pressed="' + (CUR.stage === s[0]) + '">' +
        '<div class="stage-n">STAGE ' + (i + 1) + "</div><div class=\"stage-t\">" + t(s[1]) + "</div>" +
        '<div class="stage-d">' + t(s[2]) + " · " + n + " " + t("items") + "</div></button>";
    }).join("");
    $("stageRail").querySelectorAll(".stage").forEach(function (b) {
      b.addEventListener("click", function () { CUR.stage = b.getAttribute("data-stage"); renderStages(); renderMatters(); });
    });
    renderMatters();
  }
  $("priSeg").querySelectorAll("button").forEach(function (b) {
    b.addEventListener("click", function () {
      CUR.pri = b.getAttribute("data-pri");
      $("priSeg").querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", x === b); });
      renderMatters();
    });
  });

  function matterCard(m) {
    var dl = A.computeDeadline(m, P);
    var id = "m_" + m.id;
    return '<div class="card card-hover reveal" data-m="' + m.id + '">' +
      '<div class="card-head" style="margin-bottom:var(--sp-3)">' +
      "<div><div class=\"row\" style=\"gap:8px;flex-wrap:wrap\"><span class=\"chip " + (m.pri === "P0" ? "chip-cin" : (m.pri === "P1" ? "chip-amber" : "chip-line")) + '">' + m.pri + "</span>" +
      '<span class="card-title" style="font-size:1rem">' + TR(m.title, m.title_en) + "</span></div>" +
      '<div class="tiny muted" style="margin-top:6px">' + t("deadline") + "：" + TR(m.deadline.label, m.deadline.label_en) + (dl.dateStr ? ' ｜ <span class="strong num">' + dl.dateStr + "</span>" : "") + "</div></div>" +
      srcBadge(m.source) + "</div>" +
      '<p class="small" style="margin:0 0 var(--sp-3)">' + TR(m.summary, m.summary_en) + "</p>" +
      '<button class="btn btn-ghost btn-sm" data-toggle="' + id + '"><span class="ico">' + U.ICONS.down + "</span>" + t("viewDetail") + "</button>" +
      '<div id="' + id + '" class="hidden" style="margin-top:var(--sp-4);border-top:1px dashed var(--line);padding-top:var(--sp-4)">' +
      '<div class="grid g2" style="gap:var(--sp-4)">' +
      "<div>" + ((m.docs && m.docs.length) ? '<div class="small strong" style="margin-bottom:6px">' + t("docsNeeded") + '</div><ul class="small" style="padding-left:1.1em;margin:0">' + (CUR() === "zh" ? m.docs : (m.docs_en || m.docs)).map(function (d) { return "<li>" + d + "</li>"; }).join("") + "</ul>" : "") + "</div>" +
      "<div>" + '<div class="small strong" style="margin-bottom:6px">' + t("channel") + '</div><p class="small muted" style="margin:0">' + TR(m.channel, m.channel_en) + "</p></div>" +
      "</div>" +
      '<div class="callout callout-warn" style="margin-top:var(--sp-3)"><span class="ico note-ico">' + U.ICONS.alert + "</span>" +
      "<div><div class=\"small strong\">" + t("riskTip") + '</div><p class="small" style="margin:2px 0 0">' + TR(m.risk, m.risk_en) + "</p></div></div>" +
      '<div class="row-between" style="margin-top:var(--sp-3);flex-wrap:wrap;gap:8px">' +
      '<p class="tiny muted" style="margin:0">' + t("sourceLabel") + "：" + srcLinks(m.source) + " ｜ " + t("checkedAt") + " " + KB.META.updated + "</p>" +
      '<span class="ai-tag">' + t("aiGenerated") + "</span></div></div></div>";
  }

  function renderMatters() {
    var list = KB.mattersByStage(CUR.stage).filter(function (m) { return CUR.pri === "all" || m.pri === CUR.pri; });
    $("matterList").innerHTML = list.map(matterCard).join("") || '<p class="muted">' + t("noData") + "</p>";
    $("matterList").querySelectorAll("[data-toggle]").forEach(function (b) {
      b.addEventListener("click", function () {
        var el = $(b.getAttribute("data-toggle"));
        el.classList.toggle("hidden");
        b.querySelector(".ico").style.transform = el.classList.contains("hidden") ? "" : "rotate(180deg)";
      });
    });
    U.initReveal();
  }

  /* ================= 办事清单 ================= */
  function renderChecklist() {
    var total = CUR.checklist.length;
    var done = CUR.checklist.filter(function (x) { return DONE[x.matter.id]; }).length;
    $("clSub").textContent = t("doneCount") + " " + done + " / " + t("totalCount") + " " + total + " " + t("items");
    $("clBar").style.width = (total ? (done / total * 100) : 0) + "%";
    $("clList").innerHTML = CUR.checklist.map(function (x) {
      var m = x.matter, d = x.deadline;
      var isDone = !!DONE[m.id];
      return '<label class="check" style="border-bottom:1px dashed var(--line);align-items:flex-start">' +
        '<input type="checkbox" data-done="' + m.id + '"' + (isDone ? " checked" : "") + ">" +
        '<span style="flex:1">' +
        '<span class="small strong" style="' + (isDone ? "text-decoration:line-through;opacity:.6" : "") + '">' + TR(m.title, m.title_en) + "</span>" +
        '<span class="tiny muted" style="display:block;margin-top:3px">' + t("deadline") + "：" + m.deadline.label + (d.dateStr ? " ｜ " + d.dateStr : "") + " ｜ " + m.pri + "</span>" +
        "</span>" +
        '<span class="badge-src src-' + (m.source.some(function (k) { return KB.SRC[k] && KB.SRC[k].level === "S3"; }) ? "S3" : "S1") + '">' + (m.source.some(function (k) { return KB.SRC[k] && KB.SRC[k].level === "S3"; }) ? t("needReview") : "S1") + "</span>" +
        "</label>";
    }).join("");
    $("clList").querySelectorAll("[data-done]").forEach(function (c) {
      c.addEventListener("change", function () {
        DONE[c.getAttribute("data-done")] = c.checked;
        U.save("done", DONE);
        renderChecklist();
      });
    });
  }

  $("btnExport").addEventListener("click", function () {
    var _cn = TR(KB.COUNTRY[P.country].zh, KB.COUNTRY[P.country].en);
    var lines = ["# " + t("checklist") + " · " + _cn + " · " + new Date().toLocaleDateString(), ""];
    CUR.checklist.forEach(function (x, i) {
      lines.push((i + 1) + ". [" + (DONE[x.matter.id] ? "x" : " ") + "] " + TR(x.matter.title, x.matter.title_en) + " ｜ " + TR(x.matter.deadline.label, x.matter.deadline.label_en) + (x.deadline.dateStr ? " ｜ " + x.deadline.dateStr : "") + " ｜ " + x.matter.pri);
      lines.push("   " + t("sourceLabel") + "：" + KB.sources(x.matter.source).map(function (s) { return TR(s.name, s.name_en) + "(" + s.level + ")"; }).join("；"));
    });
    lines.push("", "> " + TR(KB.META.disclaimer, KB.META.disclaimer_en));
    lines.push("> " + KB.META.updated + " ｜ " + t("aiGenerated"));
    U.download((CUR() === "zh" ? "办事清单_" : "checklist_") + P.country + "_" + new Date().toISOString().slice(0, 10) + ".md", lines.join("\n"), "text/markdown;charset=utf-8");
    U.toast(t("exportChecklist") + " ✓");
  });

  $("btnPrint").addEventListener("click", function () { window.print(); });
  $("btnReset").addEventListener("click", function () {
    P = Object.assign({}, A.DEFAULT_PROFILE, { arrival: "", enroll: "", diet: [] });
    DONE = {}; U.save("profile", P); U.save("done", DONE);
    location.reload();
  });
  $("btnGen").addEventListener("click", function () { generate(true); });
  ["fCountry", "fPurpose", "fDuration", "fFaith", "fArrival", "fEnroll"].forEach(function (id) {
    $(id).addEventListener("change", function () { generate(false); });
  });

  /* ================= Agent 问答 ================= */
  var chatBody = $("chatBody");
  function bubble(role, html) {
    var el = document.createElement("div");
    el.className = "msg msg-" + role;
    el.innerHTML = '<div class="msg-avatar">' + (role === "user" ? "ME" : "AI") + '</div><div class="msg-bubble">' + html + "</div>";
    chatBody.appendChild(el);
    chatBody.scrollTop = chatBody.scrollHeight;
    return el;
  }
  bubble("agent",
    "<p class='small' style='margin:0'>" + t("demoModeNote") + "</p>" +
    "<div class='trace'><div class='trace-line'><span class='k'>" + t("evidenceLevel") + "</span><span>" + t("levelS1") + " / " + t("levelS3") + "</span></div>" +
    "<div class='trace-line'><span class='k'>" + t("checkedAt") + "</span><span>" + KB.META.updated + "</span></div></div>");

  var QUICK = [
    "我住在校外，住宿登记谁办？多久内办？",
    "居留许可什么时候开始办？",
    "护照丢了怎么办？",
    "实习需要额外手续吗？",
    "过境免签 240 小时可以上课吗？",
    "银行卡刷不了怎么办？"
  ];
  $("quickBox").innerHTML = QUICK.map(function (q) {
    return '<button class="btn btn-ghost btn-sm" data-q="' + q + '" style="text-align:left;justify-content:flex-start;white-space:normal">' + q + "</button>";
  }).join("");
  $("quickBox").querySelectorAll("[data-q]").forEach(function (b) {
    b.addEventListener("click", function () { doAsk(b.getAttribute("data-q")); });
  });

  var asking = false;
  function doAsk(q) {
    if (!q || asking) return;
    asking = true;
    bubble("user", U.esc(q));
    var holder = bubble("agent", '<div class="row" style="gap:8px;align-items:center"><span class="dot busy"></span><span class="small muted">' + t("thinking") + "</span></div>");
    var traceBox = document.createElement("div");
    traceBox.className = "trace";
    traceBox.innerHTML = "<div class='tiny strong' style='margin-bottom:6px'>" + t("traceTitle") + "</div>";

    A.askAsync(q, P, U.L10N.current, function (i, step) {
      var line = document.createElement("div");
      line.className = "trace-line";
      line.innerHTML = "<span class='k'>" + step.n + " " + step.title + "</span><span>" + U.esc(step.detail) + "</span>";
      line.style.opacity = "0";
      traceBox.appendChild(line);
      requestAnimationFrame(function () { line.style.transition = "opacity .25s"; line.style.opacity = "1"; });
      holder.querySelector(".msg-bubble").innerHTML = traceBox.outerHTML +
        '<div class="row" style="gap:8px;align-items:center;margin-top:10px"><span class="dot busy"></span><span class="small muted">' + t("thinking") + "</span></div>";
    }).then(function (res) {
      holder.querySelector(".msg-bubble").innerHTML = res.html + traceBox.outerHTML;
      holder.querySelectorAll("[data-action='review']").forEach(function (b) {
        b.addEventListener("click", function () { U.toast(t("reviewSent")); });
      });
      asking = false;
    });
  }
  $("btnAsk").addEventListener("click", function () { var v = $("askInput").value.trim(); $("askInput").value = ""; doAsk(v); });
  $("askInput").addEventListener("keydown", function (e) { if (e.key === "Enter") { var v = $("askInput").value.trim(); $("askInput").value = ""; doAsk(v); } });

  $("faqBox").innerHTML = KB.FAQ.slice(0, 5).map(function (f, i) {
    var _q = TR(f.q, f.q_en), _a = TR(f.a, f.a_en);
    return '<div style="border-bottom:1px dashed var(--line);padding:10px 0">' +
      '<button class="btn btn-sm btn-ghost" data-faq="' + i + '" style="text-align:left;white-space:normal;width:100%;justify-content:flex-start">' + _q + "</button>" +
      '<div id="faq' + i + '" class="hidden" style="margin-top:8px"><p class="small" style="margin:0">' + _a + "</p>" +
      '<p class="tiny muted" style="margin:6px 0 0">' + srcLinks(f.src) + " ｜ " + f.level + "</p></div></div>";
  }).join("");
  $("faqBox").querySelectorAll("[data-faq]").forEach(function (b) {
    b.addEventListener("click", function () { $(b.getAttribute("data-faq").replace("faq", "faq")).classList.toggle("hidden"); });
  });

  /* ================= 初始化 ================= */
  generate(false);
  U.initReveal();

  document.addEventListener("langchange", function () {
    $("privacyChip").innerHTML = '<span class="ico">' + U.ICONS.lock + "</span>本地存储 · 不上传";
    generate(false);
    renderStages(); renderChecklist();
  });
})();
