/* =========================================================
   mini 小程序体验版 · 壳交互（Tab 切换 + 状态栏时间）
   ========================================================= */
(function () {
  "use strict";

  /* 状态栏时钟 */
  var clock = document.querySelector(".sb-time");
  function tick() {
    var d = new Date();
    var h = d.getHours(), m = d.getMinutes();
    clock.textContent = (h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m;
  }
  tick();
  setInterval(tick, 30000);

  /* Tab 切换：iframe 常驻保状态，仅切显隐 */
  var tabbar = document.getElementById("tabbar");
  var frames = {};
  Array.prototype.forEach.call(document.querySelectorAll(".screen iframe"), function (f) {
    frames[f.getAttribute("data-page")] = f;
  });

  function activate(page) {
    Array.prototype.forEach.call(tabbar.querySelectorAll("button"), function (b) {
      b.classList.toggle("on", b.getAttribute("data-page") === page);
    });
    Object.keys(frames).forEach(function (k) {
      frames[k].classList.toggle("on", k === page);
    });
    var lb = tabbar.querySelector('button[data-page="' + page + '"] .tb-lb');
    if (lb) lb.textContent = lb.getAttribute("data-zh");
    window.scrollTo(0, 0);
  }

  Array.prototype.forEach.call(tabbar.querySelectorAll("button"), function (b) {
    b.addEventListener("click", function () { activate(b.getAttribute("data-page")); });
  });

  /* 「助手」Tab：加载后自动唤起学生端 AI 会话面板 */
  var assistant = frames["assistant"];
  assistant.addEventListener("load", function () {
    try {
      var w = assistant.contentWindow;
      if (w && w.document) {
        var fab = w.document.getElementById("iFab");
        if (fab) setTimeout(function () { fab.click(); }, 600);
      }
    } catch (e) { /* 同源内不应触发 */ }
  });

  /* Tab 标签双语（跟随系统语言粗略切换，壳内内容以 iframe 内语言为准） */
  var lang = (navigator.language || "zh").slice(0, 2);
  if (lang !== "zh") {
    Array.prototype.forEach.call(tabbar.querySelectorAll(".tb-lb"), function (lb) {
      if (lb.getAttribute("data-en")) lb.textContent = lb.getAttribute("data-en");
    });
    document.title = "Exchange AI Agent for China · Mini App Preview";
  }
})();
