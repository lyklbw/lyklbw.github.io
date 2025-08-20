import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function BlogPost() {
  const { category, slug } = useParams();
  const [content, setContent] = useState('');

  const blogContentRef = useRef(null);

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

  return (
    <div className="blog-post" ref={blogContentRef}>
      <ReactMarkdown
        children={content}
        rehypePlugins={[rehypeRaw]}
        components={{
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
    </div>
  );
}