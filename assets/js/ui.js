/* =========================================================================
   来华交流全程助手 · 共享 UI 层 v2.0
   图标：内联 SVG（Heroicons/Lucide 风格线性图标，不使用 emoji 作图标）
   ========================================================================= */

window.UI = (function () {
  "use strict";

  /* ---------- SVG 图标集 ---------- */
  var P = function (d, extra) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"' + (extra || "") + ">" + d + "</svg>"; };
  var ICONS = {
    logo: P('<path d="M12 3l7 3.5v5c0 4.2-2.9 7.9-7 9-4.1-1.1-7-4.8-7-9v-5L12 3z"/><path d="M9.2 12.2l2 2 3.6-4"/>'),
    home: P('<path d="M4 10.5L12 4l8 6.5V20a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1v-9.5z"/>'),
    student: P('<path d="M12 4L3 8.5 12 13l9-4.5L12 4z"/><path d="M6 11v5c0 1.7 2.7 3 6 3s6-1.3 6-3v-5"/>'),
    org: P('<path d="M4 21V6a1 1 0 0 1 1-1h7v16"/><path d="M12 10h7a1 1 0 0 1 1 1v10"/><path d="M7 9h2M7 13h2M7 17h2M15 14h2M15 18h2"/>'),
    flow: P('<path d="M4 6h5v5H4zM15 13h5v5h-5z"/><path d="M9 8.5h3a2 2 0 0 1 2 2v5"/>'),
    chart: P('<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>'),
    shield: P('<path d="M12 3l7 3v5.5c0 4.2-2.9 7.9-7 9-4.1-1.1-7-4.8-7-9V6l7-3z"/><path d="M9.5 12.5l1.8 1.8 3.4-3.8"/>'),
    doc: P('<path d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h4"/>'),
    clock: P('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'),
    check: P('<path d="M4.5 12.5l5 5 10-11"/>'),
    alert: P('<path d="M12 4l8.5 15H3.5L12 4z"/><path d="M12 10v4M12 17h.01"/>'),
    info: P('<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8h.01"/>'),
    globe: P('<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5c2.5 2.4 3.8 5.4 3.8 8.5s-1.3 6.1-3.8 8.5c-2.5-2.4-3.8-5.4-3.8-8.5S9.5 5.9 12 3.5z"/>'),
    search: P('<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>'),
    sparkle: P('<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z"/><path d="M18.5 15.5l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2z"/>'),
    bell: P('<path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6z"/><path d="M10 19a2 2 0 0 0 4 0"/>'),
    list: P('<path d="M8 6h12M8 12h12M8 18h12"/><path d="M4 6h.01M4 12h.01M4 18h.01"/>'),
    chat: P('<path d="M20 12a7.5 7.5 0 0 1-10.9 6.7L4 20l1.3-4.1A7.5 7.5 0 1 1 20 12z"/>'),
    translate: P('<path d="M4 6h9M8.5 6c0 4-2 7-4.5 9"/><path d="M6.5 11.5c1.5 2 3.5 3.5 5.5 4.5"/><path d="M13 20l4-10 4 10M14.4 17h5.2"/>'),
    print: P('<path d="M7 9V4h10v5"/><path d="M6 9h12a2 2 0 0 1 2 2v5h-3v4H7v-4H4v-5a2 2 0 0 1 2-2z"/>'),
    sun: P('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19"/>'),
    moon: P('<path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/>'),
    down: P('<path d="M6 9l6 6 6-6"/>'),
    right: P('<path d="M9 6l6 6-6 6"/>'),
    close: P('<path d="M6 6l12 12M18 6L6 18"/>'),
    external: P('<path d="M14 5h5v5"/><path d="M19 5l-8 8"/><path d="M18 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h4"/>'),
    building: P('<path d="M4 21h16"/><path d="M6 21V5a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v16"/><path d="M14 10h4a1 1 0 0 1 1 1v10"/><path d="M9 8h2M9 12h2M9 16h2"/>'),
    users: P('<circle cx="9" cy="8" r="3.2"/><path d="M3.5 20c0-3 2.5-5 5.5-5s5.5 2 5.5 5"/><path d="M16 5.5a3 3 0 0 1 0 5.8M17.5 20c0-2-.7-3.6-1.8-4.7"/>'),
    target: P('<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r=".8" fill="currentColor"/>'),
    layers: P('<path d="M12 3l8 4.5-8 4.5-8-4.5L12 3z"/><path d="M4 12l8 4.5 8-4.5"/><path d="M4 16.5L12 21l8-4.5"/>'),
    bolt: P('<path d="M13 2L5 13h5l-1 9 8-11h-5l1-9z"/>'),
    lock: P('<rect x="4.5" y="10" width="15" height="10" rx="2"/><path d="M8 10V7.5a4 4 0 0 1 8 0V10"/>'),
    refresh: P('<path d="M20 11a8 8 0 0 0-13.7-5.3L4 8"/><path d="M4 4v4h4"/><path d="M4 13a8 8 0 0 0 13.7 5.3L20 16"/><path d="M20 20v-4h-4"/>'),
    plus: P('<path d="M12 5v14M5 12h14"/>'),
    save: P('<path d="M5 4h11l3 3v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"/><path d="M8 4v5h7V4M8 15h8v5H8z"/>'),
    copy: P('<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M15 5.5A1.5 1.5 0 0 0 13.5 4H6a2 2 0 0 0-2 2v7.5A1.5 1.5 0 0 0 5.5 15"/>'),
    heart: P('<path d="M12 20s-7-4.4-7-9.2A4.3 4.3 0 0 1 12 8a4.3 4.3 0 0 1 7 2.8C19 15.6 12 20 12 20z"/>'),
    book: P('<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v15H6.5A2.5 2.5 0 0 0 4 20.5V5.5z"/><path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H19v5H6.5"/>'),
    plane: P('<path d="M10 13.5L3 11V8.5l7 1.5V6a2 2 0 1 1 4 0v4l7-1.5V11l-7 2.5V17l2.5 1.5V20L12 19l-4.5 2v-1.5L10 17v-3.5z"/>'),
    key: P('<circle cx="8" cy="8" r="4"/><path d="M11 11l8 8M16 16l2-2M18.5 18.5l2-2"/>'),
    wallet: P('<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/><circle cx="17" cy="14" r="1.2" fill="currentColor"/>'),
    hospital: P('<path d="M4 21V5a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v16"/><path d="M12 8v6M9 11h6M4 21h16"/>'),
    book2: P('<path d="M12 6.5C10.5 5.2 8.4 4.5 6 4.5H3.5v13H6c2.4 0 4.5.7 6 2 1.5-1.3 3.6-2 6-2h2.5v-13H18c-2.4 0-4.5.7-6 2z"/><path d="M12 6.5V19.5"/>')
  };
  function icon(name, cls) {
    return '<span class="ico ' + (cls || "") + '" aria-hidden="true">' + (ICONS[name] || ICONS.info) + "</span>";
  }

  /* ---------- 状态持久化（本地化，不上云） ---------- */
  var KEY = "ea2_";
  function save(k, v) { try { localStorage.setItem(KEY + k, JSON.stringify(v)); } catch (e) { /* 忽略隐私模式下的写入失败 */ } }
  function load(k, d) { try { var v = localStorage.getItem(KEY + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }

  /* ---------- Toast ---------- */
  var toastEl = null, toastTimer = null;
  function toast(msg) {
    if (!toastEl) { toastEl = document.createElement("div"); toastEl.className = "toast"; document.body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { toastEl.classList.remove("show"); }, 2400);
  }

  /* ---------- 主题 ---------- */
  function initTheme() {
    var th = load("theme", "light");
    document.documentElement.setAttribute("data-theme", th);
    return th;
  }
  function toggleTheme() {
    var cur = document.documentElement.getAttribute("data-theme") || "light";
    var next = cur === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    save("theme", next);
    return next;
  }

  /* ---------- 语言 ---------- */
  function initLang() {
    var lg = load("lang", "zh");
    window.L10N.apply(lg);
    return lg;
  }
  function switchLang(code) {
    window.L10N.apply(code);
    save("lang", code);
    document.dispatchEvent(new CustomEvent("langchange", { detail: { lang: code } }));
    return code;
  }
  function langSwitcher(id) {
    var box = document.getElementById(id);
    if (!box) return;
    box.innerHTML = window.KB.LANGS.map(function (l) {
      return '<button type="button" data-lang="' + l.code + '" title="' + l.en + '">' + l.flag + "</button>";
    }).join("");
  }

  /* ---------- 进场动效（尊重 reduced-motion） ---------- */
  function initReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!els.length) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach(function (e) { e.classList.add("in"); }); return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: .12, rootMargin: "0px 0px -40px" });
    els.forEach(function (e) { io.observe(e); });
  }

  /* ---------- 页头 / 页脚 ---------- */
  function header(active, opts) {
    opts = opts || {};
    var nav = [
      { k: "home", href: "index.html", label: "navHome" },
      { k: "student", href: "student.html", label: "navStudent" },
      { k: "org", href: "institution.html", label: "navOrg" },
      /* 工作台与知识库实际位于机构端；原先指向已不存在的 index.html#flow/#data，属死链 */
      { k: "flow", href: "institution.html#studio", label: "navFlow" },
      { k: "data", href: "institution.html#kb", label: "navData" }
    ];
    return '' +
      '<a class="skip-link" href="#main" data-i18n="skipLink">跳到主要内容</a>' +
      '<header class="appbar"><div class="wrap appbar-inner">' +
      '<a class="brand" href="index.html"><span class="brand-mark">' + ICONS.logo + "</span>" +
      '<span class="brand-text"><span class="brand-name" data-i18n="appName">来华交流全程助手</span>' +
      '<span class="brand-sub">EXCHANGE AI AGENT FOR CHINA</span></span></a>' +
      '<nav class="nav" aria-label="主导航">' + nav.map(function (n) {
        return '<a href="' + n.href + '"' + (n.k === active ? ' aria-current="page"' : "") + ' data-i18n="' + n.label + '">' + window.L10N.t(n.label) + "</a>";
      }).join("") + "</nav>" +
      '<div class="appbar-tools">' +
      '<div class="seg" id="langSeg" role="group" aria-label="' + window.L10N.t("language") + '">' +
      window.KB.LANGS.map(function (l) { return '<button type="button" data-lang="' + l.code + '" aria-pressed="false">' + l.flag + "</button>"; }).join("") +
      "</div>" +
      '<button class="btn btn-ghost btn-sm" id="themeBtn" type="button" data-i18n-aria="theme" aria-label="' + window.L10N.t("theme") + '">' + ICONS.moon + "</button>" +
      "</div></div></header>";
  }

  function footer(extra) {
    return '<footer class="foot"><div class="wrap">' +
      '<div class="foot-grid">' +
      '<div><div class="brand" style="margin-bottom:12px"><span class="brand-mark">' + ICONS.logo + "</span>" +
      '<span class="brand-text"><span class="brand-name" data-i18n="appName">来华交流全程助手</span><span class="brand-sub">EXCHANGE AI AGENT FOR CHINA</span></span></div>' +
      '<p class="small muted" style="max-width:44ch" data-i18n="tagline"></p>' +
      '<p class="tiny muted ai-note" style="margin-top:10px"><span class="ai-note-ico">' + ICONS.shield + '</span><span data-i18n="aiLabelNote">' + window.L10N.t("aiLabelNote") + '</span></p></div>' +
      '<div><h4 data-i18n="sourceLabel">' + window.L10N.t("sourceLabel") + '</h4><ul>' +
      window.KB.META.channels.slice(0, 5).map(function (c) { return '<li><a href="' + c.url + '" target="_blank" rel="noopener">' + ((window.L10N && String(window.L10N.current).slice(0, 2) !== "zh") ? (c.name_en || c.name) : c.name) + "</a></li>"; }).join("") +
      "</ul></div>" +
      '<div><h4 data-i18n="toolSource">' + window.L10N.t("toolSource") + '</h4><ul>' +
      '<li data-i18n="footTool1">' + window.L10N.t("footTool1") + '</li>' +
      '<li data-i18n="footTool2">' + window.L10N.t("footTool2") + '</li>' +
      '<li data-i18n="footTool3">' + window.L10N.t("footTool3") + '</li>' +
      '<li data-i18n="footTool4">' + window.L10N.t("footTool4") + '</li>' +
      '<li data-i18n="footTool5">' + window.L10N.t("footTool5") + '</li>' +
      "</ul></div>" +
      "</div>" +
      '<div class="foot-note">' + (extra || "") +
      '<br><span data-i18n="footerNote">' + window.L10N.t("footerNote") + '</span><br>' +
      '© 2026 <span data-i18n="appName">' + window.L10N.t("appName") + '</span> · <span data-i18n="verLabel">' + window.L10N.t("verLabel") + '</span> · <span data-i18n="updLabel">' + window.L10N.t("updLabel") + '</span> ' + window.KB.META.updated +
      "</div></div></footer>";
  }

  /* ---------- 通用绑定 ---------- */
  function bindChrome() {
    document.querySelectorAll("#langSeg button").forEach(function (b) {
      b.addEventListener("click", function () {
        switchLang(b.getAttribute("data-lang"));
        document.querySelectorAll("#langSeg button").forEach(function (x) {
          x.setAttribute("aria-pressed", x.getAttribute("data-lang") === window.L10N.current ? "true" : "false");
        });
      });
      if (b.getAttribute("data-lang") === window.L10N.current) b.setAttribute("aria-pressed", "true");
    });
    var tb = document.getElementById("themeBtn");
    if (tb) tb.addEventListener("click", function () { toggleTheme(); });
  }

  function download(name, content, mime) {
    var blob = new Blob([content], { type: mime || "text/plain;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = name; a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
  }
  function copy(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(text);
    var ta = document.createElement("textarea"); ta.value = text; document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); } catch (e) {}
    document.body.removeChild(ta);
    return Promise.resolve();
  }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (m) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[m]; }); }
  function mdToHtml(md) {
    var h = esc(md);
    h = h.replace(/^### (.*)$/gm, "<h4>$1</h4>").replace(/^## (.*)$/gm, "<h3>$1</h3>").replace(/^# (.*)$/gm, "<h2>$1</h2>");
    h = h.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    h = h.replace(/^&gt; (.*)$/gm, '<div class="callout callout-info" style="margin:8px 0"><p class="small" style="margin:0">$1</p></div>');
    h = h.replace(/^(\d+)\. (.*)$/gm, "<li>$2</li>").replace(/(<li>[\s\S]*?<\/li>)(?!\s*<li>)/g, "<ol>$1</ol>");
    h = h.replace(/^- (.*)$/gm, "<li>$1</li>").replace(/(<li>[\s\S]*?<\/li>)(?!\s*<li>)/g, "<ul>$1</ul>");
    h = h.replace(/^---$/gm, "<hr>");
    h = h.split(/\n{2,}/).map(function (p) {
      if (/^\s*<(h\d|ol|ul|div|hr|li)/.test(p)) return p;
      return "<p>" + p.replace(/\n/g, "<br>") + "</p>";
    }).join("");
    return h;
  }

  return {
    L10N: window.L10N,
    ICONS: ICONS, icon: icon, save: save, load: load, toast: toast,
    initTheme: initTheme, toggleTheme: toggleTheme, initLang: initLang, switchLang: switchLang,
    initReveal: initReveal, header: header, footer: footer, bindChrome: bindChrome,
    download: download, copy: copy, esc: esc, mdToHtml: mdToHtml
  };
})();
