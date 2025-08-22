import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function BlogPost() {
  const { category, slug } = useParams();
  const [content, setContent] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [touchStart, setTouchStart] = useState(null);

  const blogContentRef = useRef(null);
  const [tocItems, setTocItems] = useState([]);

  useEffect(() => {
    fetch(`/src/blogs/${category}/${slug}.md`)
      .then(response => response.text())
      .then(text => {
        setContent(text);
      })
      .catch(error => {
        console.error('Error loading markdown file:', error);
        setContent('# 文件加载失败\n\n抱歉，无法加载此博客文章。');
      });
  }, [category, slug]);

  // 使用MathJax渲染LaTeX公式
  useEffect(() => {
    if (content && blogContentRef.current) {
      // 动态加载MathJax
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';
      script.async = true;
      script.id = 'MathJax-script';
      
      // 配置MathJax
      window.MathJax = {
        tex: {
          inlineMath: [['$', '$']],
          displayMath: [['$$', '$$']]
        },
        svg: {
          fontCache: 'global'
        },
        startup: {
          typeset: false // 初始不渲染，等待内容加载完成后手动渲染
        }
      };
      
      // 添加脚本到文档
      document.head.appendChild(script);
      
      // 等待MathJax加载完成后渲染公式
      script.onload = () => {
        if (window.MathJax && window.MathJax.typeset) {
          window.MathJax.typeset();
        }
      };
      
      return () => {
        // 清理脚本
        if (document.getElementById('MathJax-script')) {
          document.head.removeChild(script);
        }
      };
    }
  }, [content]);

  // 复制函数 - 使用useCallback优化
  const handleCopy = useCallback((text, e) => {
    navigator.clipboard.writeText(text);
    e.target.innerText = '已复制!';
    setTimeout(() => {
      e.target.innerText = '复制';
    }, 1200);
  }, []);

  // 简单的 slug 生成函数（支持中英文与数字），保持稳定、可读
  const slugify = useCallback((inputText) => {
    if (!inputText) return '';
    const normalized = String(inputText)
      .toLowerCase()
      // 去掉 HTML 标签
      .replace(/<[^>]*>/g, '')
      // 链接与图片的文字保留
      .replace(/!\[[^\]]*\]\([^\)]*\)/g, '')
      .replace(/\[[^\]]*\]\([^\)]*\)/g, (m) => m.replace(/^\[|\]\([^\)]*\)$/g, ''))
      // 去掉行内代码与强调符号
      .replace(/`+/g, '')
      .replace(/[\*_|~]/g, '')
      // 保留中英文、数字、空白与短横，避免使用 Unicode 属性在部分环境不兼容
      .replace(/[^a-z0-9\u4e00-\u9fa5\s-]/gi, '')
      .trim()
      .replace(/\s+/g, '-');
    return normalized;
  }, []);

  // 渲染后从 DOM 生成 TOC，并赋予标题稳定 id
  useEffect(() => {
    const buildTocFromDom = () => {
      const container = blogContentRef.current;
      if (!container) return;
      const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const counts = {};
      const items = [];
      headings.forEach((el) => {
        const text = (el.textContent || '').trim();
        const base = slugify(text);
        if (!base) return;
        const c = counts[base] || 0;
        const id = c === 0 ? base : `${base}-${c}`;
        counts[base] = c + 1;
        el.id = id;
        const depth = Number(el.tagName.replace('H', ''));
        items.push({ depth, text, slug: id });
      });
      setTocItems(items);
    };
    const id = requestAnimationFrame(buildTocFromDom);
    return () => cancelAnimationFrame(id);
  }, [content, slugify]);

  // 处理 hash 跳转（页面加载或点击 TOC）
  useEffect(() => {
    const scrollToHash = () => {
      const hash = decodeURIComponent(window.location.hash || '').replace(/^#/, '');
      if (!hash) return;
      const el = document.getElementById(hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };
    // 初始渲染后尝试一次
    const id = requestAnimationFrame(scrollToHash);
    // 监听 hash 变化
    const onHashChange = () => scrollToHash();
    window.addEventListener('hashchange', onHashChange);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener('hashchange', onHashChange);
    };
  }, [tocItems]);
  
  // 触摸事件处理函数
  const handleTouchStart = (e) => {
    setTouchStart({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    });
  };

  const handleTouchMove = (e) => {
    if (!touchStart) return;
    
    const touchEnd = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
    
    const deltaX = touchEnd.x - touchStart.x;
    const deltaY = touchEnd.y - touchStart.y;
    
    // 如果垂直滑动距离大于水平滑动距离，且超过50px，则关闭图片
    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 50) {
      setSelectedImage(null);
      setTouchStart(null);
    }
  };

  const handleTouchEnd = () => {
    setTouchStart(null);
  };

  // 键盘事件处理
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && selectedImage) {
        setSelectedImage(null);
      }
    };

    if (selectedImage) {
      document.addEventListener('keydown', handleKeyDown);
      // 禁用页面滚动
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [selectedImage]);

  return (
    <div className="blog-post" ref={blogContentRef}>
      {tocItems.length > 0 && (
        <nav
          aria-label="文章目录"
          style={{
            backgroundColor: '#fff',
            border: '1px solid #eee',
            borderRadius: 8,
            padding: '12px 16px',
            marginBottom: 16,
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: 8 }}>目录</div>
          <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {tocItems.map((item, idx) => (
              <li key={`${item.slug}-${idx}`} style={{ margin: '4px 0', paddingLeft: (item.depth - 1) * 12 }}>
                <a
                  href={`#${item.slug}`}
                  style={{ textDecoration: 'none', color: '#5F4B3B' }}
                  onClick={(e) => {
                    e.preventDefault();
                    const target = document.getElementById(item.slug);
                    if (target) {
                      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      history.replaceState(null, '', `#${encodeURIComponent(item.slug)}`);
                    }
                  }}
                >
                  {item.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
      <ReactMarkdown
        children={content}
        rehypePlugins={[rehypeRaw]}
        components={{
          img({ node, src, alt, ...props }) {
            return (
              <div style={{ 
                textAlign: 'center', 
                margin: '16px 0',
                position: 'relative'
              }}>
                <img
                  src={src}
                  alt={alt}
                  style={{
                    maxWidth: '100%',
                    height: 'auto',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer'
                  }}
                  onClick={() => setSelectedImage({ src, alt })}
                  onLoad={(e) => {
                    // 图片加载完成后添加加载完成样式
                    e.target.style.opacity = '1';
                  }}
                  onError={(e) => {
                    // 图片加载失败时显示错误信息
                    e.target.style.display = 'none';
                    const errorDiv = e.target.nextSibling;
                    if (errorDiv) {
                      errorDiv.style.display = 'block';
                    }
                  }}
                  {...props}
                />
                {alt && (
                  <div style={{
                    marginTop: '8px',
                    fontSize: '0.9em',
                    color: '#666',
                    fontStyle: 'italic'
                  }}>
                    {alt}
                  </div>
                )}
                <div style={{
                  display: 'none',
                  color: '#999',
                  fontSize: '0.9em',
                  fontStyle: 'italic'
                }}>
                  图片加载失败
                </div>
              </div>
            );
          },
          blockquote({ node, children, ...props }) {
            return (
              <div className="custom-blockquote" style={{
                backgroundColor: '#fefefe',
                borderLeft: '4px solid #5F4B3B',
                borderTop: '1px solid #e8e8e8',
                borderRight: '1px solid #e8e8e8',
                borderBottom: '1px solid #e8e8e8',
                padding: '8px 20px',
                margin: '2px 0',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                fontSize: '0.95em',
                lineHeight: '1.7',
                position: 'relative',
                fontStyle: 'italic',
                color: '#4a4a4a',
                background: 'linear-gradient(135deg, #fefefe 0%, #f8f9fa 100%)'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-8px',
                  left: '12px',
                  fontSize: '24px',
                  color: '#5F4B3B',
                  opacity: '0.6',
                  fontFamily: 'Georgia, serif'
                }}>
                  "
                </div>
                {children}
              </div>
            );
          },
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            let language = match ? match[1] : '';
            
            // 语言映射 - 统一处理常见的shell语言
            if (language === 'zsh' || language === 'shell' || language === 'bash') {
              language = 'bash';
            }
            
            if (inline) {
              return <code className={className} {...props}>{children}</code>;
            }
            
            // 处理代码内容，统一格式
            let codeContent = String(children);
            
            // 移除开头和结尾的空白字符
            codeContent = codeContent.replace(/^\s+|\s+$/g, '');
            
            // 如果代码块没有指定语言，尝试自动检测
            if (!language) {
              // 根据内容特征自动检测语言
              if (codeContent.includes('pip') || codeContent.includes('python') || codeContent.includes('pyenv')) {
                language = 'bash';
              } else if (codeContent.includes('import') || codeContent.includes('def ') || codeContent.includes('class ')) {
                language = 'python';
              } else if (codeContent.includes('npm') || codeContent.includes('yarn')) {
                language = 'bash';
              } else if (codeContent.includes('git')) {
                language = 'bash';
              } else {
                language = 'text'; // 默认使用text
              }
            }
            
            // 块级代码
            return (
              <div style={{ position: 'relative' }}>
                <button
                  className="copy-btn"
                  onClick={e => handleCopy(codeContent, e)}
                  type="button"
                >
                  复制
                </button>
                <SyntaxHighlighter
                  style={tomorrow}
                  language={language}
                  PreTag="div"
                  customStyle={{
                    margin: 0,
                    borderRadius: '8px',
                    fontSize: '0.9em',
                    padding: '16px',
                    lineHeight: '1.5'
                  }}
                  showLineNumbers={false}
                  wrapLines={true}
                  {...props}
                >
                  {codeContent}
                </SyntaxHighlighter>
              </div>
            );
          }
        }}
      />
      
      {/* 图片查看模态框 */}
      {selectedImage && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={() => setSelectedImage(null)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div style={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
            <img
              src={selectedImage.src}
              alt={selectedImage.alt}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                borderRadius: '8px'
              }}
              onClick={(e) => e.stopPropagation()}
            />
            {selectedImage.alt && (
              <div style={{
                position: 'absolute',
                bottom: '-40px',
                left: '50%',
                transform: 'translateX(-50%)',
                color: 'white',
                fontSize: '14px',
                textAlign: 'center',
                maxWidth: '80vw'
              }}>
                {selectedImage.alt}
              </div>
            )}
            <button
              style={{
                position: 'absolute',
                top: '-50px',
                right: '0',
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                color: 'white',
                fontSize: '24px',
                cursor: 'pointer',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={() => setSelectedImage(null)}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
}