import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs';

// 自定义插件：复制markdown文件到dist目录
function copyMarkdownFiles() {
  return {
    name: 'copy-markdown-files',
    generateBundle() {
      // 复制src/blogs目录下的所有markdown文件到dist/src/blogs
      const copyDir = (src, dest) => {
        if (!fs.existsSync(dest)) {
          fs.mkdirSync(dest, { recursive: true });
        }
        
        const files = fs.readdirSync(src);
        files.forEach(file => {
          const srcPath = resolve(src, file);
          const destPath = resolve(dest, file);
          const stat = fs.statSync(srcPath);
          
          if (stat.isDirectory()) {
            copyDir(srcPath, destPath);
          } else if (file.endsWith('.md')) {
            fs.copyFileSync(srcPath, destPath);
          }
        });
      };
      
      const blogsSrc = resolve(__dirname, 'src/blogs');
      const blogsDest = resolve(__dirname, 'dist/src/blogs');
      
      if (fs.existsSync(blogsSrc)) {
        copyDir(blogsSrc, blogsDest);
      }
    }
  };
}

export default defineConfig({
  plugins: [
    react(),
    copyMarkdownFiles()
  ],
  base: '/', // 用户主页仓库使用根路径
  server: {
    open: true,
  },
  assetsInclude: ['**/*.md']
}); 