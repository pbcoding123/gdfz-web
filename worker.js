export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // 1. 注册账号 API
      if (url.pathname === '/api/register' && request.method === 'POST') {
        const { username, password } = await request.json();
        if (!username || !password) {
          return Response.json({ success: false, msg: '账号密码不能为空' }, { headers: corsHeaders });
        }
        
        // 简单哈希加密密码（生产环境建议加盐）
        const passHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
        const hashArray = Array.from(new Uint8Array(passHash)).map(b => b.toString(16).padStart(2, '0')).join('');

        await env.DB.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)')
          .bind(username, hashArray)
          .run();

        return Response.json({ success: true, msg: '注册成功' }, { headers: corsHeaders });
      }

      // 2. 登录 API
      if (url.pathname === '/api/login' && request.method === 'POST') {
        const { username, password } = await request.json();
        const passHash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
        const hashArray = Array.from(new Uint8Array(passHash)).map(b => b.toString(16).padStart(2, '0')).join('');

        const user = await env.DB.prepare('SELECT id, username FROM users WHERE username = ? AND password_hash = ?')
          .bind(username, hashArray)
          .first();

        if (user) {
          return Response.json({ success: true, user: { id: user.id, username: user.username } }, { headers: corsHeaders });
        } else {
          return Response.json({ success: false, msg: '账号或密码错误' }, { headers: corsHeaders });
        }
      }

      // 3. 提交成绩 API
      if (url.pathname === '/api/score/submit' && request.method === 'POST') {
        const { userId, username, gameType, score } = await request.json();
        if (!userId || !gameType || score === undefined) {
          return Response.json({ success: false, msg: '参数不完整' }, { headers: corsHeaders });
        }

        await env.DB.prepare('INSERT INTO scores (user_id, username, game_type, score) VALUES (?, ?, ?, ?)')
          .bind(userId, username, gameType, score)
          .run();

        return Response.json({ success: true, msg: '成绩保存成功' }, { headers: corsHeaders });
      }

      // 4. 获取游戏排行榜 API (前 10 名)
      if (url.pathname === '/api/score/leaderboard' && request.method === 'GET') {
        const gameType = url.searchParams.get('game');
        const { results } = await env.DB.prepare(
          'SELECT username, score, created_at FROM scores WHERE game_type = ? ORDER BY score DESC LIMIT 10'
        ).bind(gameType).all();

        return Response.json({ success: true, data: results }, { headers: corsHeaders });
      }

      return Response.json({ success: false, msg: 'Endpoint Not Found' }, { status: 404, headers: corsHeaders });

    } catch (err) {
      return Response.json({ success: false, msg: err.message }, { status: 500, headers: corsHeaders });
    }
  }
};
