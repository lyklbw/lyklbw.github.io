import React, { useMemo, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// 仅包含【公开】文章。私有文章的元数据不放这里（否则会被打包进公开 JS），
// 而是存于 private-content/blogs/index.json，仅在本地开发模式经 /private 加载。
const blogs = [
  { category: 'reading', slug: 'Read-DDPM', title: { zh: '扩散模型阅读', en: 'Reading DDPM' }, date: '2025-11-6' },
  { category: 'life', slug: 'rugby', title: { zh: '英式橄榄球回忆', en: 'Rugby Memories'}, date: '2025-12-05' },
  { category: 'reading',slug: 'MU-MIMO', title: { zh: 'MU-MIMO', en: 'MU-MIMO' }, date: '2025-08-27' },
  { category: 'reading',slug: 'Neural-receiver', title: { zh: '神经网络接收器', en: 'Neural Receiver' }, date: '2025-08-20' },
  { category: 'tech', slug: 'Tool-init', title: { zh: '工具初始配置', en: 'tool Init' }, date: '2025-07-29' },
  { category: 'reading', slug: 'Book', title: { zh: '阅读', en: 'Books to be read' }, date: '2025-07-15' },
];

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
    // 生产环境只有公开文章；开发环境额外并入私有文章并按日期倒序
    const merged = import.meta.env.DEV
      ? [...blogs, ...privateBlogs].sort((a, b) => (a.date < b.date ? 1 : -1))
      : blogs;
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
                {isZh ? blog.title.zh : blog.title.en}
              </Link>
            </div>
            <span style={styles.dateText}>{blog.date}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}