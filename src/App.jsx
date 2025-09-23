import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Home from './pages/Home';
import BlogList from './pages/BlogList';
import BlogPost from './pages/BlogPost';
import './styles/global.css';

function App() {
  const { t, i18n } = useTranslation();
  const switchLang = () => {
    i18n.changeLanguage(i18n.language === 'zh' ? 'en' : 'zh');
  };
  return (
    <div style={{ maxWidth: 'min(800px, 95vw)', margin: '0 auto', padding: '24px 16px' }}>
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <Link to="/">{t('home')}</Link>
          <span style={{ margin: '0 12px' }}>|</span>
          <Link to="/blog">{t('blog')}</Link>
        </div>
        <button onClick={switchLang}>{t('switch_language')}</button>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/blog" element={<BlogList />} />
        <Route path="/blog/:category/:slug" element={<BlogPost />} />
      </Routes>
      <footer style={{ width: '100%', textAlign: 'center', margin: '24px 0 16px 0', fontFamily: 'Times New Roman, Times, serif', fontStyle: 'italic', fontSize: 18, color: '#5F4B3B', zIndex: 1, position: 'relative' }}>
        stay hungry, stay foolish
      </footer>
    </div>
  );
}

export default App; 