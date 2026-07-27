import React, { useMemo, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { parseFrontmatter } from '../lib/frontmatter';

// 公开文章列表：构建时自动扫描 src/blogs 下的所有 md，读取顶部 frontmatter 生成。
// 加新公开文章 = 放一个命名正确、带 frontmatter 的 md 文件即可，无需改这里。
// 分类(category)取自所在文件夹名；是否公开取决于文件放在 src/blogs 还是 private-content。
const publicModules = import.meta.glob('/src/blogs/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

function buildList(modules) {
  const map = new Map();
  for (const [path, raw] of Object.entries(modules)) {
    const m = /\/blogs\/([^/]+)\/([^/]+)\.(zh|en)\.md$/.exec(path);
    if (!m) continue;
    const [, category, slug] = m;
    const { data } = parseFrontmatter(raw);
    const key = `${category}/${slug}`;
    const entry = map.get(key) || { category, slug, date: '', title: { zh: '', en: '' } };
    if (data.title_zh) entry.title.zh = data.title_zh;
    if (data.title_en) entry.title.en = data.title_en;
    if (data.date) entry.date = data.date;
    map.set(key, entry);
  }
  return [...map.values()];
}

const blogs = buildList(publicModules);

const categories = {
  tech: { zh: '技术', en: 'Tech' },
  life: { zh: '生活', en: 'Life' },
  reading: { zh: '阅读', en: 'Reading' }
};

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

// 提取常用样式
const styles = {
  categoryButton: (isActive) => ({
    textDecoration: 'none',
    color: isActive ? '#5F4B3B' : '#888',
    fontWeight: isActive ? 'bold' : 'normal',
    fontSize: 16,
    padding: '8px 16px',
    borderRadius: 6,
    backgroundColor: isActive ? '#FAF3DD' : 'transparent',
    transition: 'all 0.2s'
  }),
  blogItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #eee',
    transition: 'background-color 0.2s'
  },
  categoryTag: {
    color: '#5F4B3B',
    fontSize: 12,
    backgroundColor: '#FFE4B5',
    padding: '4px 8px',
    borderRadius: 4,
    fontWeight: 'bold'
  },
  blogLink: {
    textDecoration: 'none',
    color: '#5F4B3B',
    fontWeight: 'bold',
    fontSize: 16,
    padding: '4px 8px',
    borderRadius: 4,
    backgroundColor: 'transparent',
    transition: 'all 0.2s'
  },
  dateText: {
    color: '#888',
    fontSize: 14
  }
};

export default function BlogList() {
  const query = useQuery();
  const { i18n } = useTranslation();
  const isZh = i18n.language === 'zh';
  const currentCategory = query.get('category');

  // 开发模式下加载私有文章列表（来自 private-content，构建时不含此逻辑的数据）
  const [privateBlogs, setPrivateBlogs] = useState([]);
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    fetch('/private/blogs/index.json')
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => setPrivateBlogs(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  const filtered = useMemo(() => {
    // 生产环境只有公开文章；开发环境额外并入私有文章。统一按日期倒序。
    const merged = (import.meta.env.DEV ? [...blogs, ...privateBlogs] : [...blogs])
      .sort((a, b) => (a.date < b.date ? 1 : -1));
    return currentCategory ? merged.filter((b) => b.category === currentCategory) : merged;
  }, [currentCategory, privateBlogs]);
  
  return (
    <div>
      <h2 className="section-title">{isZh ? '博客列表' : 'Blog List'}</h2>
      
      {/* 博客分类导航 */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 20 }}>
          <Link 
            to="/blog" 
            style={styles.categoryButton(!currentCategory)}
            onMouseEnter={(e) => {
              if (!currentCategory) {
                e.target.style.backgroundColor = '#FFE4B5';
              }
            }}
            onMouseLeave={(e) => {
              if (!currentCategory) {
                e.target.style.backgroundColor = '#FAF3DD';
              }
            }}
          >
            {isZh ? '全部' : 'All'}
          </Link>
          {Object.entries(categories).map(([key, value]) => (
            <Link 
              key={key}
              to={`/blog?category=${key}`} 
              style={styles.categoryButton(currentCategory === key)}
              onMouseEnter={(e) => {
                if (currentCategory !== key) {
                  e.target.style.backgroundColor = '#FFE4B5';
                }
              }}
              onMouseLeave={(e) => {
                if (currentCategory !== key) {
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
            >
              {isZh ? value.zh : value.en}
            </Link>
          ))}
        </div>
      </div>
      
      {/* 博客列表 */}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {filtered.map(blog => (
          <li key={blog.slug} style={styles.blogItem}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={styles.categoryTag}>
                {isZh ? categories[blog.category].zh : categories[blog.category].en}
              </span>
              <Link 
                to={`/blog/${blog.category}/${blog.slug}`} 
                style={styles.blogLink}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#FFE4B5';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                {isZh ? (blog.title.zh || blog.title.en) : (blog.title.en || blog.title.zh)}
              </Link>
            </div>
            <span style={styles.dateText}>{blog.date}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}