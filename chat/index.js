// src/index.js - GDFZ WEBS 完整 Worker 代码
// 包含：原有页面 + /chat 社交圈 + D1 数据库 API

// ================= 前端 HTML 模板 =================
const CHAT_HTML = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>社交圈 - GDFZ WEBS 社区</title>
    <link rel="icon" href="/favicon.ico" type="image/x-icon">
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8f9fa; color: #333; line-height: 1.6; display: flex; flex-direction: column; min-height: 100vh; }
        a { text-decoration: none; color: inherit; }
        .navbar { position: fixed; top: 0; left: 0; width: 100%; height: 70px; display: flex; justify-content: space-between; align-items: center; padding: 0 5%; background-color: rgba(255, 255, 255, 0.85); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); box-shadow: 0 1px 10px rgba(0, 0, 0, 0.05); z-index: 1000; }
        .nav-brand { display: flex; align-items: center; gap: 10px; font-size: 22px; font-weight: 700; color: #1a1a1a; letter-spacing: 1px; }
        .nav-brand img { height: 30px; width: auto; border-radius: 4px; }
        .nav-links { display: flex; gap: 30px; align-items: center; }
        .nav-links a { font-size: 15px; font-weight: 500; color: #555; transition: color 0.3s ease; cursor: pointer; }
        .nav-links a:hover, .nav-links a.active { color: #007aff; font-weight: 700; }
        .nav-links .btn-primary { background-color: #007aff; color: white; padding: 8px 20px; border-radius: 20px; transition: background-color 0.3s ease, transform 0.2s; border: none; font-size: 15px; cursor: pointer; }
        .nav-links .btn-primary:hover { background-color: #0056b3; transform: translateY(-2px); }
        .social-main { margin-top: 70px; padding: 40px 20px; flex: 1; max-width: 700px; width: 100%; margin-left: auto; margin-right: auto; }
        .post-box { background: white; padding: 20px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03); border: 1px solid #eaeaea; margin-bottom: 25px; }
        .post-box textarea { width: 100%; height: 90px; border: 1px solid #e1e4e8; border-radius: 10px; padding: 12px; font-size: 0.95rem; resize: none; outline: none; font-family: inherit; transition: border-color 0.2s; }
        .post-box textarea:focus { border-color: #007aff; }
        .post-box-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 10px; }
        .post-box-footer span { font-size: 0.85rem; color: #888; }
        .btn-post { background-color: #007aff; color: white; border: none; padding: 8px 20px; border-radius: 20px; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: background-color 0.2s, transform 0.2s; }
        .btn-post:hover { background-color: #0056b3; transform: translateY(-1px); }
        .btn-post:disabled { background-color: #ccc; cursor: not-allowed; transform: none; }
        .feed-list { display: flex; flex-direction: column; gap: 20px; }
        .feed-card { background: white; padding: 20px; border-radius: 16px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03); border: 1px solid #eaeaea; }
        .feed-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
        .avatar { width: 42px; height: 42px; background: linear-gradient(135deg, #007aff, #00c6ff); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 1.1rem; }
        .feed-user-info h4 { font-size: 1rem; color: #111; }
        .feed-user-info span { font-size: 0.8rem; color: #888; }
        .feed-content { font-size: 0.95rem; color: #333; margin-bottom: 15px; word-break: break-all; white-space: pre-wrap; }
        .feed-actions { display: flex; gap: 20px; border-top: 1px solid #f0f0f0; padding-top: 12px; }
        .action-btn { background: none; border: none; color: #666; font-size: 0.9rem; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: color 0.2s; }
        .action-btn:hover { color: #007aff; }
        .action-btn.liked { color: #ff3b30; }
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: none; align-items: center; justify-content: center; z-index: 2000; backdrop-filter: blur(4px); }
        .modal-overlay.active { display: flex; }
        .modal { background: white; padding: 30px; border-radius: 16px; width: 90%; max-width: 400px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); position: relative; }
        .modal h3 { margin-bottom: 20px; text-align: center; color: #1a1a1a; }
        .modal input { width: 100%; padding: 12px; margin-bottom: 15px; border: 1px solid #e1e4e8; border-radius: 8px; font-size: 1rem; outline: none; }
        .modal input:focus { border-color: #007aff; }
        .modal-btn { width: 100%; padding: 12px; background: #007aff; color: white; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; margin-bottom: 10px; }
        .modal-btn:hover { background: #0056b3; }
        .modal-switch { text-align: center; font-size: 0.9rem; color: #666; cursor: pointer; margin-top: 10px; }
        .modal-switch span { color: #007aff; font-weight: 600; }
        .modal-close { position: absolute; top: 15px; right: 20px; font-size: 1.5rem; cursor: pointer; color: #999; }
        .footer { background-color: #111; color: #a0a0a0; padding: 60px 5% 30px; font-size: 0.9rem; margin-top: 60px; }
        .footer-content { display: flex; flex-wrap: wrap; justify-content: space-between; max-width: 1200px; margin: 0 auto; border-bottom: 1px solid #333; padding-bottom: 40px; margin-bottom: 30px; }
        .footer-brand h2 { color: #fff; margin-bottom: 15px; font-size: 1.5rem; }
        .footer-brand p { max-width: 300px; margin-bottom: 20px; }
        .footer-links-group h4 { color: #fff; margin-bottom: 20px; font-size: 1.1rem; }
        .footer-links-group ul { list-style: none; }
        .footer-links-group ul li { margin-bottom: 12px; }
        .footer-links-group a { transition: color 0.3s; }
        .footer-links-group a:hover { color: #007aff; }
        .footer-bottom { text-align: center; max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 10px; align-items: center; }
    </style>
</head>
<body>
    <nav class="navbar">
        <a href="/" class="nav-brand">
            <img src="/favicon.ico" alt="Logo" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48cmVjdCB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIGZpbGw9IiMwMDdhZmYiIHJ4PSI4Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNiIgZmlsbD0iI2ZmZiIgZG9taW5hbnQtYmFzZWxpbmU9ImNlbnRyYWwiIHRleHQtYW5jaG9yPSJtaWRkbGUiPkc8L3RleHQ+PC9zdmc+'">
            GDFZ WEBS
        </a>
        <div class="nav-links">
            <a href="/">首页</a>
            <a href="/games.html">Games</a>
            <a href="/chat" class="active">社交圈</a>
            <a href="https://github.com/pbcoding123/gdfz-web" target="_blank" class="btn-primary">GitHub</a>
            <button id="authBtn" class="btn-primary" style="padding: 6px 16px; font-size: 14px;">登录 / 注册</button>
        </div>
    </nav>

    <main class="social-main">
        <div class="post-box">
            <textarea id="postInput" placeholder="请先登录后发布动态..."></textarea>
            <div class="post-box-footer">
                <span id="charCount">还可以输入 200 字</span>
                <button id="postBtn" class="btn-post" disabled>发布动态</button>
            </div>
        </div>
        <div class="feed-list" id="feedList">
            <div style="text-align: center; color: #888; padding: 20px;">加载中...</div>
        </div>
    </main>

    <div class="modal-overlay" id="authModal">
        <div class="modal">
            <span class="modal-close" onclick="closeModal()">&times;</span>
            <h3 id="modalTitle">登录账号</h3>
            <input type="text" id="usernameInput" placeholder="用户名">
            <input type="password" id="passwordInput" placeholder="密码">
            <button class="modal-btn" id="modalActionBtn" onclick="handleAuth()">登录</button>
            <div class="modal-switch" onclick="toggleAuthMode()">
                <span id="switchText">还没有账号？去注册</span>
            </div>
        </div>
    </div>

    <footer class="footer">
        <div class="footer-content">
            <div class="footer-brand">
                <h2>GDFZ WEBS</h2>
                <p>由一群热爱编程与游戏的开发者组成的社区。致力于创造有趣、实用的网络体验。</p>
            </div>
            <div class="footer-links-group">
                <h4>快速链接</h4>
                <ul>
                    <li><a href="/">主页</a></li>
                    <li><a href="/games.html">Games 频道</a></li>
                    <li><a href="/chat">社交圈</a></li>
                </ul>
            </div>
            <div class="footer-links-group">
                <h4>联系我们 (DevTeam)</h4>
                <ul>
                    <li><a href="mailto:pbcoding123@163.com">pbcoding123@163.com</a></li>
                    <li><a href="https://github.com/pbcoding123/gdfz-web" target="_blank">GitHub 仓库</a></li>
                </ul>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2026 <a href="https://github.com/pbcoding123/gdfz-web" style="color: #fff;">GDFZ WEBS DevTeam</a> 保留所有权利.</p>
        </div>
    </footer>

    <script>
        let currentUser = JSON.parse(localStorage.getItem('gdfz_user')) || null;
        let isLoginMode = true;

        const postInput = document.getElementById('postInput');
        const postBtn = document.getElementById('postBtn');
        const feedList = document.getElementById('feedList');
        const charCount = document.getElementById('charCount');
        const authBtn = document.getElementById('authBtn');
        const authModal = document.getElementById('authModal');

        window.addEventListener('DOMContentLoaded', () => {
            updateAuthUI();
            loadPosts();
        });

        function updateAuthUI() {
            if (currentUser) {
                authBtn.textContent = currentUser.username + ' (退出)';
                postBtn.disabled = false;
                postInput.placeholder = currentUser.username + '，分享新鲜事...';
            } else {
                authBtn.textContent = '登录 / 注册';
                postBtn.disabled = true;
                postInput.placeholder = '请先登录后发布动态...';
            }
        }

        authBtn.addEventListener('click', () => {
            if (currentUser) {
                if (confirm('确定要退出登录吗？')) {
                    localStorage.removeItem('gdfz_user');
                    currentUser = null;
                    updateAuthUI();
                }
            } else {
                authModal.classList.add('active');
            }
        });

        function closeModal() { authModal.classList.remove('active'); }
        function toggleAuthMode() {
            isLoginMode = !isLoginMode;
            document.getElementById('modalTitle').textContent = isLoginMode ? '登录账号' : '注册账号';
            document.getElementById('modalActionBtn').textContent = isLoginMode ? '登录' : '注册';
            document.getElementById('switchText').textContent = isLoginMode ? '还没有账号？去注册' : '已有账号？去登录';
        }

        async function handleAuth() {
            const username = document.getElementById('usernameInput').value.trim();
            const password = document.getElementById('passwordInput').value.trim();
            if (!username || !password) return alert('请填写完整信息');

            const endpoint = isLoginMode ? '/api/login' : '/api/register';
            const btn = document.getElementById('modalActionBtn');
            btn.textContent = '处理中...';
            btn.disabled = true;

            try {
                const res = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                const data = await res.json();
                if (data.success) {
                    if (isLoginMode) {
                        currentUser = { token: data.token, username: data.username };
                        localStorage.setItem('gdfz_user', JSON.stringify(currentUser));
                        updateAuthUI();
                        closeModal();
                        loadPosts();
                    } else {
                        alert('注册成功！请登录。');
                        toggleAuthMode();
                    }
                } else {
                    alert(data.message || '操作失败');
                }
            } catch (e) {
                alert('网络错误');
            } finally {
                btn.textContent = isLoginMode ? '登录' : '注册';
                btn.disabled = false;
            }
        }

        postInput.addEventListener('input', () => {
            const len = postInput.value.length;
            const left = 200 - len;
            charCount.textContent = '还可以输入 ' + Math.max(0, left) + ' 字';
            charCount.style.color = len > 200 ? '#ff3b30' : '#888';
        });

        postBtn.addEventListener('click', async () => {
            const content = postInput.value.trim();
            if (!content) return alert('动态内容不能为空！');
            if (content.length > 200) return alert('字数不能超过 200 字！');
            if (!currentUser) return alert('请先登录！');

            postBtn.disabled = true;
            postBtn.textContent = '发布中...';

            try {
                const res = await fetch('/api/posts', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': currentUser.token
                    },
                    body: JSON.stringify({ content })
                });
                
                if (res.ok) {
                    postInput.value = '';
                    charCount.textContent = '还可以输入 200 字';
                    loadPosts();
                } else {
                    alert('发布失败，请重新登录');
                    localStorage.removeItem('gdfz_user');
                    currentUser = null;
                    updateAuthUI();
                }
            } catch (e) {
                alert('网络错误');
            } finally {
                postBtn.disabled = false;
                postBtn.textContent = '发布动态';
            }
        });

        async function loadPosts() {
            feedList.innerHTML = '<div style="text-align: center; color: #888; padding: 20px;">加载中...</div>';
            try {
                const res = await fetch('/api/posts');
                const data = await res.json();
                feedList.innerHTML = '';
                
                if (data.posts && data.posts.length > 0) {
                    data.posts.forEach(post => {
                        const card = document.createElement('div');
                        card.className = 'feed-card';
                        const initial = post.username.charAt(0).toUpperCase();
                        card.innerHTML = '<div class="feed-header"><div class="avatar" style="background: linear-gradient(135deg, #007aff, #00c6ff);">' + initial + '</div><div class="feed-user-info"><h4>' + escapeHtml(post.username) + '</h4><span>刚刚</span></div></div><div class="feed-content">' + escapeHtml(post.content) + '</div><div class="feed-actions"><button class="action-btn" onclick="likePost(this, ' + post.id + ')">👍 <span>' + post.likes + '</span></button><button class="action-btn">💬 评论 (0)</button></div>';
                        feedList.appendChild(card);
                    });
                } else {
                    feedList.innerHTML = '<div style="text-align: center; color: #888; padding: 20px;">暂无动态，快来发第一条吧！</div>';
                }
            } catch (e) {
                feedList.innerHTML = '<div style="text-align: center; color: #ff3b30; padding: 20px;">加载失败，请检查网络</div>';
            }
        }

        async function likePost(btn, postId) {
            if (btn.classList.contains('liked')) return;
            try {
                const res = await fetch('/api/posts/' + postId + '/like', { method: 'POST' });
                if (res.ok) {
                    btn.classList.add('liked');
                    const span = btn.querySelector('span');
                    span.textContent = parseInt(span.textContent) + 1;
                }
            } catch (e) { console.error("点赞失败", e); }
        }

        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }
    </script>
</body>
</html>`;

// ================= Worker 主逻辑 =================
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // ================= 原有路由 (保留你之前的逻辑) =================
    // 如果你之前有处理 / 或 /games.html 等路由的代码，放在这里
    // 例如：
    // if (path === '/') { return new Response('首页内容...'); }
    // if (path === '/games.html') { return new Response('游戏页面...'); }
    // ============================================================

    // ================= 新增：社交圈 (/chat) 页面 =================
    if (path === '/chat' || path === '/chat/') {
      return new Response(CHAT_HTML, {
        headers: { 'Content-Type': 'text/html;charset=UTF-8' }
      });
    }

    // ================= 新增：API 路由 =================
    
    // 注册
    if (path === '/api/register' && request.method === 'POST') {
      const { username, password } = await request.json();
      if (!username || !password) {
        return new Response(JSON.stringify({ success: false, message: "缺少字段" }), { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' } 
        });
      }

      const encoder = new TextEncoder();
      const data = encoder.encode(password + "gdfz_secret_salt_2026");
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const password_hash = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      try {
        await env.DB.prepare("INSERT INTO users (username, password_hash) VALUES (?, ?)")
          .bind(username, password_hash)
          .run();
        return new Response(JSON.stringify({ success: true, message: "注册成功" }), { 
          headers: { 'Content-Type': 'application/json' } 
        });
      } catch (e) {
        if (e.message.includes("UNIQUE constraint failed")) {
          return new Response(JSON.stringify({ success: false, message: "用户名已存在" }), { 
            status: 409, 
            headers: { 'Content-Type': 'application/json' } 
          });
        }
        return new Response(JSON.stringify({ success: false, message: "数据库错误" }), { 
          status: 500, 
          headers: { 'Content-Type': 'application/json' } 
        });
      }
    }

    // 登录
    if (path === '/api/login' && request.method === 'POST') {
      const { username, password } = await request.json();
      const encoder = new TextEncoder();
      const data = encoder.encode(password + "gdfz_secret_salt_2026");
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const password_hash = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      const user = await env.DB.prepare("SELECT id, username FROM users WHERE username = ? AND password_hash = ?")
        .bind(username, password_hash)
        .first();

      if (user) {
        const token = btoa(`${user.id}:${user.username}`);
        return new Response(JSON.stringify({ success: true, token, username: user.username }), { 
          headers: { 'Content-Type': 'application/json' } 
        });
      } else {
        return new Response(JSON.stringify({ success: false, message: "用户名或密码错误" }), { 
          status: 401, 
          headers: { 'Content-Type': 'application/json' } 
        });
      }
    }

    // 获取动态列表
    if (path === '/api/posts' && request.method === 'GET') {
      const posts = await env.DB.prepare("SELECT id, username, content, likes, created_at FROM posts ORDER BY created_at DESC LIMIT 50")
        .all();
      return new Response(JSON.stringify({ success: true, posts: posts.results }), { 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // 发布动态
    if (path === '/api/posts' && request.method === 'POST') {
      const token = request.headers.get("Authorization");
      if (!token) {
        return new Response(JSON.stringify({ success: false, message: "未授权" }), { 
          status: 401, 
          headers: { 'Content-Type': 'application/json' } 
        });
      }

      try {
        const [userId, username] = atob(token).split(":");
        const { content } = await request.json();
        if (!content || content.length > 200) {
          return new Response(JSON.stringify({ success: false, message: "内容无效" }), { 
            status: 400, 
            headers: { 'Content-Type': 'application/json' } 
          });
        }

        await env.DB.prepare("INSERT INTO posts (user_id, username, content) VALUES (?, ?, ?)")
          .bind(userId, username, content)
          .run();
        return new Response(JSON.stringify({ success: true }), { 
          headers: { 'Content-Type': 'application/json' } 
        });
      } catch (e) {
        return new Response(JSON.stringify({ success: false, message: "Token 无效" }), { 
          status: 401, 
          headers: { 'Content-Type': 'application/json' } 
        });
      }
    }

    // 点赞
    if (path.match(/^\/api\/posts\/\d+\/like$/) && request.method === 'POST') {
      const postId = path.split("/")[3];
      await env.DB.prepare("UPDATE posts SET likes = likes + 1 WHERE id = ?")
        .bind(postId)
        .run();
      return new Response(JSON.stringify({ success: true }), { 
        headers: { 'Content-Type': 'application/json' } 
      });
    }

    // ================= 默认 404 =================
    return new Response("Not Found", { status: 404 });
  }
};
