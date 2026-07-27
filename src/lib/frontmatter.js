// 极简 frontmatter 解析：只支持文件开头的 `--- ... ---` 块和 `key: value` 平铺字段。
// 浏览器端（BlogList/BlogPost）与 Node 端（vite.config.js 生成私有索引）共用这一份。

export function parseFrontmatter(raw) {
  const text = typeof raw === 'string' ? raw : '';
  const m = /^﻿?---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text);
  if (!m) return { data: {}, body: text };
  const data = {};
  for (const line of m[1].split(/\r?\n/)) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    if (!key) continue;
    data[key] = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
  }
  return { data, body: text.slice(m[0].length) };
}

export function stripFrontmatter(raw) {
  return parseFrontmatter(raw).body;
}
