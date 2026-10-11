/* audit_data.js — 审计内容层十语种翻译完整度
   用真实加载的方式，检查 32 条事项（内置 27 + 校本预设 5）
   在 10 个语种下的六个字段是否都有译文。
   运行：node "_i18n工具/1_审计内容翻译完整度.js"（须在项目根执行） */
const fs = require("fs");
const vm = require("vm");
const path = require("path");

const ROOT = process.cwd(); /* 项目根 */
const JS = path.join(ROOT, "assets", "js");
const LANGS = ["zh", "en", "ru", "ar", "fr", "es", "vi", "th", "my", "ms"];
const FIELDS = { title: "标题", summary: "摘要", label: "时限", docs: "材料", channel: "渠道", risk: "风险" };

/* ---- 最小浏览器环境，按页面真实顺序加载 ---- */
const ctx = { console };
ctx.window = ctx;
ctx.document = { documentElement: {}, querySelectorAll: () => [], addEventListener() {} };
ctx.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
ctx.navigator = { language: "zh" };

const ORDER = ["kb.js", "i18n.js", "i18n-v3.js", "kb-i18n.js",
  "kb-i18n-ru.js", "kb-i18n-ar.js", "kb-i18n-fr.js", "kb-i18n-es.js",
  "kb-i18n-vi.js", "kb-i18n-th.js", "kb-i18n-my.js", "kb-i18n-ms.js",
  "kb-school-sysu.js", "agent.js"];

ORDER.forEach((f) => {
  const p = path.join(JS, f);
  if (!fs.existsSync(p)) return;
  try {
    vm.runInNewContext(fs.readFileSync(p, "utf8"), ctx, { filename: f });
  } catch (e) {
    console.log("载入失败 " + f + ": " + e.message);
  }
});

const KB = ctx.window.KB;
const PRESETS = ctx.window.SYSU_PRESET_KB || [];
const all = (KB.MATTERS || []).concat(PRESETS);

console.log("=== 事项总数 " + all.length + "（内置 " + (KB.MATTERS || []).length +
  " + 校本预设 " + PRESETS.length + "）===\n");

/* 该条在该语种下是否存在某字段的译文（源字段为空则该字段不要求译文） */
function hasField(m, f, lang) {
  if (lang === "zh") return true; /* 中文是源语言 */
  const src = f === "label" ? m.deadline : m;
  if (!src) return true;
  const base = src[f];
  const needDocs = f === "docs" && Array.isArray(base) && base.length;
  const need = (f === "docs") ? needDocs : !!base;
  if (!need) return true;
  const key = lang === "en" ? f + "_en" : f + "_" + lang;
  return !!src[key];
}

console.log(["语种", ...Object.values(FIELDS)].map((h, i) => (i ? h.padStart(8) : h.padEnd(6))).join(""));

const gaps = [];
LANGS.forEach((lang) => {
  let line = lang.padEnd(6);
  Object.keys(FIELDS).forEach((f) => {
    const missIds = all.filter((m) => !hasField(m, f, lang)).map((m) => m.id);
    line += (missIds.length ? String(missIds.length) : "✓").padStart(8);
    if (missIds.length) {
      gaps.push(lang + " / " + FIELDS[f] + " 缺 " + missIds.length + "：" + missIds.slice(0, 5).join(", "));
    }
  });
  console.log(line);
});

console.log("\n=== 缺口明细 ===");
if (!gaps.length) {
  console.log("  ✅ 十语种 × 六字段全部齐全");
} else {
  gaps.forEach((g) => console.log("  [缺] " + g));
}

/* ---- 抽检两条看实际译文 ---- */
["preset_sysu_res", "preset_sysu_guide"].forEach((id) => {
  const m = all.filter((x) => x.id === id)[0];
  if (!m) return;
  console.log("\n=== 抽检 " + id + " · 标题 ===");
  LANGS.forEach((l) => {
    const v = m[l === "zh" ? "title" : "title_" + l];
    console.log("  " + l.padEnd(4) + (v ? v.slice(0, 66) : "— 缺（会回退）"));
  });
});
