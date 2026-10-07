/* =========================================================================
   ui.js — 轻量 DOM 渲染工具
   ---------------------------------------------------------------------------
   小程序用 WXML 声明式模板，网页版用「模板字符串 + innerHTML」渲染。
   两者数据来源完全相同（同一个 K.KB / K.Agent），因此行为一致。
   ========================================================================= */
(function (global) {
  "use strict";

  var UI = {};

  /* ---------- DOM 快捷 ---------- */
  UI.$ = function (sel, root) { return (root || document).querySelector(sel); };
  UI.$$ = function (sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  };

  /* ---------- 转义 ---------- */
  UI.esc = function (s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  };

  /* ---------- 轻提示 ---------- */
  var toastTimer = null;
  UI.toast = function (msg) {
    var old = UI.$(".toast");
    if (old) old.remove();
    if (toastTimer) clearTimeout(toastTimer);
    var el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    document.body.appendChild(el);
    toastTimer = setTimeout(function () { el.remove(); }, 1900);
  };

  /* ---------- 复制 ---------- */
  UI.copy = function (text, okMsg) {
    var done = function () { UI.toast(okMsg || "已复制"); };
    var fail = function () { UI.toast("复制失败，请手动选择"); };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done).catch(fail);
    } else {
      try {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.style.cssText = "position:fixed;left:-9999px;top:0;opacity:0";
        document.body.appendChild(ta);
        ta.select();
        var ok = document.execCommand("copy");
        ta.remove();
        ok ? done() : fail();
      } catch (e) { fail(); }
    }
  };

  /* ---------- 选中态绑定（多选 chip） ---------- */
  UI.bindChips = function (root, sel, onToggle) {
    UI.$$(sel, root).forEach(function (el) {
      el.addEventListener("click", function () {
        el.classList.toggle("chip-on");
        onToggle(el.dataset.v, el.classList.contains("chip-on"));
      });
    });
  };

  /* ---------- 事件委托 ---------- */
  /**
   * 在 root 上做事件委托。
   * 用 data-uid 做一次性守卫，避免 render() 反复调用时重复绑定同一处理器，
   * 否则同一次点击会被触发多次（列表项状态错乱）。
   */
  UI.delegate = function (root, evt, sel, fn, uid) {
    var key = "__dlg_" + (uid || sel);
    if (root[key]) return;          /* 已绑过，直接返回 */
    root[key] = true;

    root.addEventListener(evt, function (e) {
      var t = e.target.closest(sel);
      if (t && root.contains(t)) fn(e, t);
    });
  };

  /* ---------- 语言条渲染 ---------- */
  UI.LANGS = [
    { code: "zh", label: "中文" }, { code: "en", label: "EN" },
    { code: "ru", label: "RU" }, { code: "ar", label: "AR" },
    { code: "fr", label: "FR" }, { code: "es", label: "ES" }
  ];

  /** 返回完整的 .lang-bar 容器（含外层包裹，与小程序 wxml 结构一致） */
  UI.langBar = function (cur) {
    return '<div class="lang-bar">' + UI.LANGS.map(function (l) {
      return '<button type="button" class="lang-chip' + (l.code === cur ? " on" : "") +
        '" data-code="' + l.code + '">' + UI.esc(l.label) + "</button>";
    }).join("") + "</div>";
  };

  UI.bindLangBar = function (onPick) {
    UI.delegate(document.body, "click", ".lang-chip", function (e, el) {
      onPick(el.dataset.code);
    });
  };

  /* ---------- 底部 tabBar ---------- */
  UI.TABS = [
    { href: "index.html", key: "index", label: "首页", ico: "⌂" },
    { href: "student.html", key: "student", label: "学生端", ico: "🎒" },
    { href: "institution.html", key: "institution", label: "机构端", ico: "🏛" }
  ];

  UI.tabbar = function (active) {
    return '<nav class="tabbar" aria-label="主导航">' + UI.TABS.map(function (it) {
      return '<a class="tab' + (active === it.key ? " on" : "") + '" href="' + it.href + '">' +
        '<span class="tab-ico" aria-hidden="true">' + it.ico + "</span>" +
        "<span>" + it.label + "</span></a>";
    }).join("") + "</nav>";
  };

  /**
   * 挂载底部 tabBar。
   * 幂等：先移除旧的再挂新的，避免语言切换重绘时重复插入。
   */
  UI.mountTab = function (active) {
    var old = document.querySelector(".tabbar");
    if (old) old.remove();
    document.body.insertAdjacentHTML("beforeend", UI.tabbar(active));
  };

  /* ---------- 来源卡渲染 ---------- */
  UI.sources = function (list) {
    if (!list || !list.length) return "";
    return list.map(function (s) {
      return '<div class="src" data-url="' + UI.esc(s.url || "") + '">' +
        '<div class="row-between"><span class="src-name">' + UI.esc(s.name) + "</span>" +
        '<span class="badge badge-src src-' + UI.esc(s.level || "S1") + '">' + UI.esc(s.level || "S1") + "</span></div>" +
        '<div class="tiny" style="margin-top:3px">' + UI.esc(s.org) +
        (s.checked ? " · " + UI.esc(s.checked) : "") + "</div></div>";
    }).join("");
  };

  UI.bindSources = function (root) {
    UI.delegate(root, "click", ".src", function (e, el) {
      var u = el.dataset.url;
      if (u) window.open(u, "_blank", "noopener");
    });
  };

  global.UI = UI;
})(window);
