import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';



const educations = [
  {
    img: '/images/hust_emblem.jpg',
    school: '华中科技大学',
    degree: '工学学士',
    major: '通信工程',
    period: '2022- 2025',
    location: '武汉 中国',
    en: {
      school: 'Huazhong University of Science and Technology',
      degree: 'B.Eng.',
      major: 'Communication Engineering',
      period: '2022 - 2025',
      location: 'Wuhan China',
    }
  },
  {
    img: '/images/ucsb_emblem.png',
    school: '加州大学圣塔芭芭拉分校',
    degree: '访问学生',
    major: '电子与计算机工程',
    period: '2025 - 2026',
    location: '圣塔芭芭拉 美国',
    en: {
      school: 'University of California, Santa Barbara',
      degree: 'Visiting Student',
      major: 'Electronic and Computer Engineering',
      period: '2025 - 2026',
      location: 'Santa Barbara USA',
    }
  }
];

const blogs = [
  { category: 'reading', slug: 'neural-receiver', title: { zh: '神经网络接收器', en: 'Neural Receiver' }, featured: false},
  { category: 'tech', slug: 'react-latex', title: { zh: 'React中支持LaTeX', en: 'LaTeX in React' }, featured: false},
  { category: 'life', slug: 'my-story', title: { zh: '我的故事', en: 'My Story' }, featured: false },
  { category: 'reading', slug: 'book', title: { zh: '好书推荐', en: 'Book Recommendation' }, featured: true },
  { category: 'tech', slug: 'wandb-init', title: { zh: 'wandb的初始配置', en: 'wandb init' }, featured: false},
];

export default function Home() {
  const { t, i18n } = useTranslation();
  const isZh = i18n.language === 'zh';
  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <div className="profile-row">
        <img src="/images/my_avatar.jpg" alt="avatar" className="avatar-img" style={{ width: 100, height: 100, borderRadius: 6, objectFit: 'cover', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginLeft: '2vw' }} />
        <div style={{ textAlign: 'left' }}>
          <h1 style={{ margin: '12px 0 8px 0' }} data-section="name">{isZh ? t('name_zh') : t('name_en')}</h1>
          <p style={{ fontSize: '1.1em', margin: '8px 0 16px 0' }}>
            {t('intro').split(/\\n|\n/).map((line, idx, arr) => (
              <React.Fragment key={idx}>
                {line}
                {idx !== arr.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
          <div style={{ margin: '16px 0' }}>
            <a 
              href="mailto:lyklbw@qq.com" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                backgroundColor: '#FAF3DD',
                transition: 'all 0.2s',
                textDecoration: 'none',
                color: '#5F4B3B',
                fontWeight: 'bold'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#FFE4B5';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#FAF3DD';
              }}
            >
              {t('email')}
            </a>
            <span style={{ margin: '0 8px' }}>|</span>
            <a 
              href="https://github.com/lyklbw" 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                backgroundColor: '#FAF3DD',
                transition: 'all 0.2s',
                textDecoration: 'none',
                color: '#5F4B3B',
                fontWeight: 'bold'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#FFE4B5';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#FAF3DD';
              }}
            >
              GitHub
            </a>
          </div>
        </div>
      </div>
      {/* 教育经历板块 */}
      <h2 className="section-title" data-section="education">{isZh ? '教育经历' : 'Education'}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center', marginBottom: 24 }}>
        {educations.map((edu, idx) => (
          <div key={idx} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            background: '#fff', 
            borderRadius: 8, 
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)', 
            padding: '16px', 
            width: '100%', 
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}>
            <img src={edu.img} alt={isZh ? edu.school : edu.en.school} style={{ 
              width: '78px', 
              height: '78px', 
              objectFit: 'contain', 
              marginRight: '20px', 
              background: '#f5f5f5', 
              borderRadius: 8,
              flexShrink: 0
            }} />
            <div style={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 'bold', fontSize: '18px', wordBreak: 'break-word' }}>{isZh ? edu.school : edu.en.school}</div>
              <div style={{ fontSize: '15px', margin: '2px 0', wordBreak: 'break-word' }}>{isZh ? edu.degree : edu.en.degree} · {isZh ? edu.major : edu.en.major}</div>
              <div style={{ color: '#888', fontSize: '14px' }}>{isZh ? edu.period : edu.en.period}</div>
              <div style={{ color: '#888', fontSize: '14px' }}>{isZh ? edu.location : edu.en.location}</div>
            </div>
          </div>
        ))}
      </div>
      {/* Research & Visiting 板块 */}
      <h2 className="section-title" data-section="research">{isZh ? '科研与访学' : 'Research & Visiting'}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center', marginBottom: 24 }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          background: '#fff', 
          borderRadius: 8, 
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)', 
          padding: '16px', 
          width: '100%', 
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}>
          <img src="/images/hkust_gz.png" alt="HKUST(GZ)" style={{ 
            width: '78px', 
            height: '78px', 
            objectFit: 'contain', 
            marginRight: '20px', 
            background: '#f5f5f5', 
            borderRadius: 8,
            flexShrink: 0
          }} />
          <div style={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 'bold', fontSize: '18px', wordBreak: 'break-word' }}>{isZh ? '香港科技大学（广州）' : 'The Hong Kong University of Science and Technology (Guangzhou)'}</div>
            <div style={{ fontSize: '15px', margin: '2px 0', wordBreak: 'break-word' }}>{isZh ? '访问学生 王旭东教授指导' : 'Visiting Student, supervised by Prof. Xudong Wang'}</div>
            <div style={{ color: '#888', fontSize: '14px' }}>{isZh ? '2025.7 - 至今' : 'Jul 2023 - Sep 2023'}</div>
            <div style={{ color: '#888', fontSize: '14px' }}>{isZh ? '研究方向：无线人工智能' : 'Research Field: AI for Wireless'}</div>
          </div>
        </div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          background: '#fff', 
          borderRadius: 8, 
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)', 
          padding: '16px', 
          width: '100%', 
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}>
          <img src="/images/eic.png" alt="HUST EIC" style={{ 
            width: '78px', 
            height: '78px', 
            objectFit: 'contain', 
            marginRight: '20px', 
            background: '#f5f5f5', 
            borderRadius: 8,
            flexShrink: 0
          }} />
          <div style={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 'bold', fontSize: '18px', wordBreak: 'break-word' }}>{isZh ? '华中科技大学电信学院' : 'School of Electronic Information and Communications, HUST'}</div>
            <div style={{ fontSize: '15px', margin: '2px 0', wordBreak: 'break-word' }}>{isZh ? '本科研究员 王巍教授指导' : 'Undergraduate Researcher, supervised by Prof. Wei Wang'}</div>
            <div style={{ color: '#888', fontSize: '14px' }}>{isZh ? '2024年4月-2025年3月' : 'Apr 2024 - Mar 2025'}</div>
            <div style={{ color: '#888', fontSize: '14px' }}>{isZh ? '研究方向：无线室内定位' : 'Research: Wireless Indoor Positioning'}</div>
          </div>
        </div>
      </div>

      {/* 其他活动板块 */}
      <h2 className="section-title" data-section="activity">{isZh ? '其他活动' : 'Other Activities'}</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24, alignItems: 'center', marginBottom: 24 }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          background: '#fff', 
          borderRadius: 8, 
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)', 
          padding: '16px', 
          width: '100%', 
          maxWidth: '100%',
          boxSizing: 'border-box'
        }}>
          <img src="/images/rugby.png" alt="Rugby" style={{ 
            width: '90px', 
            height: '90px', 
            objectFit: 'contain', 
            marginRight: '20px', 
            background: '#f5f5f5', 
            borderRadius: 8,
            flexShrink: 0
          }} />
          <div style={{ textAlign: 'left', flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 'bold', fontSize: '18px', wordBreak: 'break-word' }}>{isZh ? '英式橄榄球运动员' : 'Rugby Player'}</div>
            <div style={{ fontSize: '15px', margin: '2px 0', wordBreak: 'break-word' }}>{isZh ? '2023、2024湖北省橄榄球锦标赛冠军' : 'Champion of the 2023 and 2024 Hubei Provincial Rugby Championships'}</div>
            <div style={{ color: '#888', fontSize: '14px' }}>{isZh ? '2023.7-2025.2' : '2023.7-2025.2'}</div>
          </div>
        </div>
      </div>

      {/* 精选博客区块 */}
      <div style={{ margin: '0 0 24px 0' }}>
        <h2 className="section-title">{isZh ? '精选博客' : 'Featured Blogs'}</h2>
        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'center', margin: '20px 0 0 0' }}>
          {blogs.filter(b => b.featured).map(blog => (
            <li key={blog.slug} style={{ width: '100%', textAlign: 'center' }}>
              <Link 
                to={`/blog/${blog.category}/${blog.slug}`}
                style={{
                  textDecoration: 'none',
                  color: '#5F4B3B',
                  fontWeight: 'bold',
                  padding: '6px 12px',
                  borderRadius: 6,
                  backgroundColor: '#FAF3DD',
                  transition: 'all 0.2s',
                  display: 'inline-block'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#FFE4B5';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#FAF3DD';
                }}
              >
                {isZh ? blog.title.zh : blog.title.en}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 