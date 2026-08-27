import React, { useMemo } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Home from './pages/Home';
import BlogList from './pages/BlogList';
import BlogPost from './pages/BlogPost';
import VisitorMap from './components/VisitorMap';
import './styles/global.css';

const blogMarkdownFiles = import.meta.glob('./blogs/**/*.md');

function App() {
  const { t, i18n } = useTranslation();
  const location = useLocation();

  const switchLang = () => {
    i18n.changeLanguage(i18n.language === 'zh' ? 'en' : 'zh');
  };

  const targetLang = i18n.language === 'zh' ? 'en' : 'zh';

  const hasTargetLanguageVersion = useMemo(() => {
    const pathParts = location.pathname.split('/').filter(Boolean);

    if (location.pathname === '/' || location.pathname === '/blog') {
      return true;
    }

    if (pathParts[0] === 'blog' && pathParts.length >= 3) {
      const category = decodeURIComponent(pathParts[1]);
      const slug = decodeURIComponent(pathParts.slice(2).join('/'));
      const candidatePaths = [
        `./blogs/${category}/${slug}.${targetLang}.md`,
        `./blogs/${targetLang}/${category}/${slug}.md`,
        `./blogs/${category}/${targetLang}/${slug}.md`,
      ];

      return candidatePaths.some((path) => Boolean(blogMarkdownFiles[path]));
    }

    return true;
  }, [location.pathname, targetLang]);

  const unavailableSuffix = targetLang === 'zh' ? '（本页面无对应中文）' : '（本页面无对应英文）';

  return (
    <div style={{ maxWidth: 'min(800px, 95vw)', margin: '0 auto', padding: '24px 16px' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <Link to="/">{t('home')}</Link>
          <span style={{ margin: '0 12px' }}>|</span>
          <Link to="/blog">{t('blog')}</Link>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/blog" element={<BlogList />} />
        <Route path="/blog/:category/:slug" element={<BlogPost />} />
      </Routes>
      <footer style={{ width: '100%', textAlign: 'center', margin: '24px 0 16px 0', fontFamily: 'Times New Roman, Times, serif', fontStyle: 'italic', fontSize: 18, color: '#5F4B3B', zIndex: 1, position: 'relative' }}>
        <div style={{ marginBottom: 10 }}>
          <button
            onClick={switchLang}
            style={{
              background: 'none',
              border: 'none',
              borderRadius: 0,
              padding: 0,
              margin: 0,
              color: '#5F4B3B',
              fontFamily: 'Times New Roman, Times, serif',
              fontStyle: 'italic',
              fontSize: 18,
              lineHeight: 1.4,
              textDecoration: 'underline',
              textUnderlineOffset: '3px',
              cursor: 'pointer',
            }}
            aria-label="switch language"
          >
            {t('switch_language')}
            {!hasTargetLanguageVersion ? ` ${unavailableSuffix}` : ''}
          </button>
        </div>
        stay hungry, stay foolish <br />
        日拱一卒，功不唐捐
        <VisitorMap />
      </footer>
    </div>
  );
}

export default App; 