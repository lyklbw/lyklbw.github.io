import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// 示例博客数据，增加 date 字段（与 Home.jsx 保持同步）
const blogs = [
  { category: 'reading',slug: 'neural-receiver', title: { zh: '神经网络接收器', en: 'Neural Receiver' }, date: '2025-08-20' },
  { category: 'tech', slug: 'wandb-init', title: { zh: 'wandb的初始配置', en: 'wandb Init' }, date: '2025-07-29' },
  { category: 'reading', slug: 'book', title: { zh: '好书推荐', en: 'Book Recommendation' }, date: '2025-07-15' },
  { category: 'life', slug: 'my-story', title: { zh: '我的故事', en: 'My Story' }, date: '2024-05-20' },
  { category: 'tech', slug: 'react-latex', title: { zh: 'React中支持LaTeX', en: 'LaTeX in React' }, date: '2024-02-01' },
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
  
  // 使用useMemo优化过滤逻辑
  const filtered = useMemo(() => {
    return currentCategory ? blogs.filter(b => b.category === currentCategory) : blogs;
  }, [currentCategory]);
  
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