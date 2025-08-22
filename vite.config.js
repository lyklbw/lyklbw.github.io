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

// 开发模式下的markdown文件监听插件
function watchMarkdownFiles() {
  return {
    name: 'watch-markdown-files',
    configureServer(server) {
      // 监听markdown文件变化
      const blogsDir = resolve(__dirname, 'src/blogs');
      
      const watchMarkdown = (dir) => {
        const files = fs.readdirSync(dir);
        files.forEach(file => {
          const filePath = resolve(dir, file);
          const stat = fs.statSync(filePath);
          
          if (stat.isDirectory()) {
            watchMarkdown(filePath);
          } else if (file.endsWith('.md')) {
            // 监听单个markdown文件变化
            fs.watchFile(filePath, (curr, prev) => {
              if (curr.mtime !== prev.mtime) {
                console.log(`Markdown file changed: ${filePath}`);
                // 触发客户端刷新
                server.ws.send({
                  type: 'full-reload',
                  path: '*'
                });
              }
            });
          }
        });
      };
      
      if (fs.existsSync(blogsDir)) {
        watchMarkdown(blogsDir);
        console.log('Markdown file watching enabled');
      }
    }
  };
}

export default defineConfig({
  plugins: [
    react(),
    copyMarkdownFiles(),
    watchMarkdownFiles()
  ],
  base: '/', // 用户主页仓库使用根路径
  server: {
    open: true,
    watch: {
      // 确保监听所有文件类型
      ignored: ['!**/*.md']
    }
  },
  assetsInclude: ['**/*.md']
}); 