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

// 构建完成后将 index.html 复制为 404.html，使 GitHub Pages 支持 SPA 直接 URL 访问
function generateSpa404() {
  return {
    name: 'generate-spa-404',
    closeBundle() {
      const distDir = resolve(__dirname, 'dist');
      const indexPath = resolve(distDir, 'index.html');
      const notFoundPath = resolve(distDir, '404.html');
      if (fs.existsSync(indexPath)) {
        fs.copyFileSync(indexPath, notFoundPath);
      }
    }
  };
}

// 开发模式下的markdown文件监听插件
function watchMarkdownFiles() {
  return {
    name: 'watch-markdown-files',
    configureServer(server) {
      // 使用 Vite 自带的文件监视器，可靠捕获新增/修改/删除
      const blogsGlob = resolve(__dirname, 'src/blogs/**/*.md');
      server.watcher.add(blogsGlob);

      const triggerReload = (file) => {
        if (file && file.endsWith('.md')) {
          console.log(`Markdown changed: ${file}`);
          server.ws.send({ type: 'full-reload' });
        }
      };

      server.watcher.on('change', triggerReload);
      server.watcher.on('add', triggerReload);
      server.watcher.on('unlink', triggerReload);

      console.log('Markdown file watching enabled via Vite watcher');
    }
  };
}

// 仅开发模式：把 private-content/ 挂到 /private，供本地预览私有笔记与私有配图。
// 该插件 apply:'serve'，构建(vite build)时完全不生效，私有内容绝不会进 dist。
function servePrivateContentInDev() {
  const mime = {
    '.md': 'text/markdown; charset=utf-8',
    '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
    '.gif': 'image/gif', '.svg': 'image/svg+xml', '.webp': 'image/webp',
    '.json': 'application/json; charset=utf-8',
  };
  return {
    name: 'serve-private-content-dev',
    apply: 'serve',
    configureServer(server) {
      const root = resolve(__dirname, 'private-content');
      server.middlewares.use('/private', (req, res, next) => {
        const rel = decodeURIComponent((req.url || '').split('?')[0]);
        const fp = resolve(root, '.' + rel);
        // 防目录穿越：必须落在 private-content 内
        if (!fp.startsWith(root) || !fs.existsSync(fp) || !fs.statSync(fp).isFile()) {
          return next();
        }
        const ext = fp.slice(fp.lastIndexOf('.')).toLowerCase();
        if (mime[ext]) res.setHeader('Content-Type', mime[ext]);
        fs.createReadStream(fp).pipe(res);
      });
    }
  };
}

export default defineConfig({
  plugins: [
    react(),
    copyMarkdownFiles(),
    generateSpa404(),
    watchMarkdownFiles(),
    servePrivateContentInDev()
  ],
  base: '/', // 用户主页仓库使用根路径
  server: {
    open: true,
    // 使用默认 watcher 设置即可；不需要特殊 ignored 配置
  },
  assetsInclude: ['**/*.md']
}); 