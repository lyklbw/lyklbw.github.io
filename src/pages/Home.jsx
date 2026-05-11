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
      degree: 'Exchange Student',
      major: 'Electronic and Computer Engineering',
      period: '2025 - 2026',
      location: 'Santa Barbara USA',
    }
  },
  {
    img: '/images/rit_avatar.png',
    school: '罗切斯特理工学院',
    degree: 'PhD Student',
    major: 'Computing Information and Science',
    period: '2025 - 2026',
    location: '圣塔芭芭拉 美国',
    en: {
      school: 'Rochester Institute of Technology',
      degree: 'PhD Student',
      major: 'Computing Information and Science',
      period: '2026 - ?',
      location: 'Rochester USA',
    }
  }
];

const blogs = [
];

export default function Home() {
  const { t, i18n } = useTranslation();
  const isZh = i18n.language === 'zh';
  return (
    <div className="card" style={{ textAlign: 'center' }}>
      <div className="profile-row">
        <img src="/images/profile_pic.jpg" alt="avatar" className="avatar-img" style={{ width: 150, height: 150, borderRadius: 6, objectFit: 'cover', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginLeft: '2vw' }} />
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
              href="mailto:lyklbw@gmail.com" 
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
            <div style={{ fontSize: '15px', margin: '2px 0', wordBreak: 'break-word' }}>{isZh ? '研究助理 王旭东教授指导' : 'Research Assistant, supervised by Prof. Xudong Wang'}</div>
            <div style={{ color: '#888', fontSize: '14px' }}>{isZh ? '2025.7 - 2025.9' : 'Jul. 2025 - Sep. 2025'}</div>
            <div style={{ color: '#888', fontSize: '14px' }}>{isZh ? '研究方向：联邦学习' : 'Research Field: Federated Learning'}</div>
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
            <div style={{ color: '#888', fontSize: '14px' }}>{isZh ? '2024.4-2025.3' : 'Apr. 2024 - Mar. 2025'}</div>
            <div style={{ color: '#888', fontSize: '14px' }}>{isZh ? '研究方向：无线室内定位' : 'Research: Wireless Indoor Positioning'}</div>
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
            <div style={{ fontWeight: 'bold', fontSize: '18px', wordBreak: 'break-word' }}>{isZh ? '国家多光谱信息处理重点实验室' : 'National Key Laboratory of Science and Technology on Multi-Spectral Information Processing, EIC HUST'}</div>
            <div style={{ fontSize: '15px', margin: '2px 0', wordBreak: 'break-word' }}>{isZh ? '本科研究员 朱冬教授指导' : 'Undergraduate Researcher, supervised by Prof. Dong Zhu'}</div>
            <div style={{ color: '#888', fontSize: '14px' }}>{isZh ? '2025.1-present' : 'Jan. 2025 - Present'}</div>
            <div style={{ color: '#888', fontSize: '14px' }}>{isZh ? '研究方向：机器学习，信号处理' : 'Research: Machine Learning, Signal Processing'}</div>
            <div style={{ color: '#888', fontSize: '14px' }}>
              {isZh ? '出版：' : 'Publication: '}
              <a href="https://arxiv.org/abs/2604.01531" target="_blank" rel="noopener noreferrer">
                A Conditional Denoising Diffusion Probabilistic Model for RFI Mitigation in Synthetic Aperture Interferometric Radiometer
              </a>
            </div>
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
      {/* <div style={{ margin: '0 0 24px 0' }}>
        <h2 className="section-title">{isZh ? '最近博客' : 'Featured Blogs'}</h2>
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
      </div> */}
    </div>
  );
} 