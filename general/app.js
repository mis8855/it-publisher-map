// 일반 출판사 시장 지도: 로그인, 상단 막대, Supabase에서 데이터 읽기(다섯 화면이 함께 쓴다)
(function () {
  const SB_URL = 'https://uerntgyxjeerbdetomlk.supabase.co';
  const SB_KEY = 'sb_publishable_8EjqrDRU-NTU3cHGyGln9w_NOLtzmTp';   // 공개해도 되는 열쇠. 읽기는 로그인과 허용 목록이 막는다
  const GRP = 'gen', PRE = 'gen/';
  const sb = window.sb = supabase.createClient(SB_URL, SB_KEY);
  // 비공개 이미지 주소. 아직 받지 못한 그림은 빈 주소를 돌려준다
  window.MEDIA = p => (window.__media && window.__media[PRE + p]) || '';
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // ---------- 상단 막대와 로그인 화면 ----------
  const PAGES = [['home', './', '개요', ''], ['cover', 'cover.html', '표지', '1'], ['promo', 'promo.html', '상세페이지', '2'], ['sns', 'sns.html', 'SNS', '3'], ['report', 'report.html', '전략 보고서', '4']];
  const style = document.createElement('style');
  style.textContent = `
body.locked>*:not(.gx-gate){display:none!important}
.gx-bar{display:flex;align-items:center;gap:16px;min-height:52px;padding:0 max(20px,env(safe-area-inset-right,0px)) 0 max(20px,env(safe-area-inset-left,0px));background:var(--surface);border-bottom:1px solid var(--line)}
.gx-logo{font:700 16px/1.2 var(--serif,"Noto Serif KR",serif);color:var(--ink);white-space:nowrap;text-decoration:none;letter-spacing:-.01em}
.gx-logo span{font:500 12px/1 var(--sans,system-ui,sans-serif);color:var(--ink3);margin-left:6px}
.gx-nav{display:flex;gap:2px;margin-left:auto;overflow-x:auto;scrollbar-width:none;min-width:0}
.gx-nav::-webkit-scrollbar{display:none}
.gx-nav a{padding:6px 12px 6px 8px;border-radius:999px;color:var(--ink2);font-weight:500;font-size:13.5px;white-space:nowrap;display:flex;align-items:center;gap:7px;text-decoration:none}
.gx-nav a.home{padding-left:12px}
.gx-nav a:hover{color:var(--ink);background:var(--bg)}
.gx-nav i{font-style:normal;font-size:11px;font-weight:700;width:19px;height:19px;border-radius:50%;display:grid;place-items:center;border:1px solid var(--line);color:var(--ink3)}
.gx-nav a[aria-current="page"]{background:var(--accent);color:var(--on-accent)}
.gx-nav a[aria-current="page"] i{border-color:currentColor;color:inherit}
.gx-nav a.other{color:var(--ink3);font-size:12.5px}
@media (max-width:640px){.gx-logo{display:none}.gx-bar{gap:6px}.gx-nav a{padding:6px 9px 6px 6px}}
.gx-gate{min-height:100vh;min-height:100dvh;display:grid;place-items:center;padding:24px 16px;box-sizing:border-box;background:var(--bg);color:var(--ink);font:14px/1.5 var(--sans,system-ui,sans-serif)}
.gx-card{width:100%;max-width:360px;background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:26px 24px;display:flex;flex-direction:column;gap:8px;box-sizing:border-box}
.gx-card h1{font-size:19px;margin:0 0 2px}
.gx-card p{margin:0 0 10px;color:var(--ink2);font-size:13px;line-height:1.55}
.gx-card label{font-size:12.5px;color:var(--ink2);font-weight:600;margin-top:6px}
.gx-card input{padding:10px 12px;border:1px solid var(--line);border-radius:8px;background:var(--bg);color:var(--ink);font:inherit;min-width:0}
.gx-card button.pri{margin-top:12px;padding:11px 12px;border:0;border-radius:8px;background:var(--accent);color:var(--on-accent);font:inherit;font-weight:600;cursor:pointer}
.gx-msg{min-height:1.5em;margin:6px 0 0!important;font-size:12.5px}
.gx-link{border:0;background:none;padding:4px 0;color:var(--accent);font:inherit;font-size:12.5px;cursor:pointer;text-decoration:underline;text-underline-offset:3px}
.gx-foot{margin:28px max(20px,env(safe-area-inset-right,0px)) 28px max(20px,env(safe-area-inset-left,0px));color:var(--ink3);font-size:12px}
#dlZip{display:none!important}`;
  document.head.appendChild(style);

  function chrome(page) {
    const bar = document.createElement('header');
    bar.className = 'gx-bar';
    bar.innerHTML = '<a class="gx-logo" href="./">일반 출판사 시장 지도<span>2026</span></a><nav class="gx-nav" aria-label="지도 고르기">' +
      PAGES.map(([k, h, t, n]) => '<a href="' + h + '"' + (k === 'home' ? ' class="home"' : '') + (k === page ? ' aria-current="page"' : '') + '>' + (n ? '<i>' + n + '</i>' : '') + t + '</a>').join('') +
      '<a class="other" href="../">IT 출판사 지도</a></nav>';
    document.body.insertBefore(bar, document.body.firstChild);
    const gate = document.createElement('div');
    gate.className = 'gx-gate'; gate.id = 'gx-gate';
    gate.innerHTML = '<form class="gx-card" id="gx-form" novalidate hidden><h1>일반 출판사 시장 지도</h1><p>허용 목록에 있는 계정으로 로그인하면 자료를 불러옵니다. IT 출판사 지도와 같은 계정을 씁니다.</p>' +
      '<label for="gx-email">이메일</label><input id="gx-email" type="email" autocomplete="username"><label for="gx-pw">비밀번호</label><input id="gx-pw" type="password" autocomplete="current-password">' +
      '<button type="submit" class="pri">로그인</button><p class="gx-msg" id="gx-msg" role="status"></p></form><p class="gx-msg" id="gx-wait">자료를 불러오는 중입니다…</p>';
    document.body.insertBefore(gate, bar);
  }

  // ---------- 읽기 ----------
  const all = async (table, cols, orders) => {
    let out = [];
    for (let off = 0; ; off += 1000) {
      let q = sb.from(table).select(cols).eq('grp', GRP);
      orders.forEach(([c, asc]) => { q = q.order(c, { ascending: asc !== false }); });
      const { data, error } = await q.range(off, off + 999);
      if (error) throw error;
      out = out.concat(data);
      if (data.length < 1000) return out;
    }
  };
  // 비공개 이미지 주소를 받아 둔다(6일 동안 같은 주소를 써서 브라우저가 그림을 다시 받지 않게 한다)
  const sign = async (paths, uid) => {
    const KEY = 'genmap-media-v1', now = Date.now();
    let c = null; try { c = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (_) { }
    if (!c || c.uid !== uid || !(c.exp > now)) c = { uid, exp: now + 6 * 864e5, urls: {} };
    const need = paths.map(p => PRE + p).filter(p => !c.urls[p]);
    for (let i = 0; i < need.length; i += 200) {
      const { data, error } = await sb.storage.from('media').createSignedUrls(need.slice(i, i + 200), 7 * 86400);
      if (error) throw error;
      data.forEach(d => { if (d.signedUrl && d.path) c.urls[d.path] = d.signedUrl; });
    }
    if (need.length) { try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (_) { } }
    window.__media = c.urls;
  };
  const meta = async () => { const { data, error } = await sb.from('app_meta').select('key,value').eq('grp', GRP); if (error) throw error; return Object.fromEntries(data.map(r => [r.key, r.value])); };
  const books = async M => {
    const P = M.cover.pubs, rows = await all('books', 'data', [['pub_date', false], ['id']]);
    return rows.map(r => r.data).sort((a, b) => P.indexOf(a.pub) - P.indexOf(b.pub) || b.date.localeCompare(a.date) || (a.id < b.id ? -1 : 1));
  };
  const cover = (M, B) => { const C = Object.assign({}, M.cover, { books: B }); C.styles.forEach(s => { s.count = B.filter(b => b.style === s.id).length; }); return C; };
  const promo = async (M, B) => {
    const I = (await all('promo_images', 'data', [['file']])).map(r => r.data);
    const has = new Set(); I.forEach(x => x.books.forEach(id => has.add(id)));
    const by = Object.fromEntries(B.map(b => [b.id, b])); I.sort((a, b) => (by[b.books[0]] || {}).date > (by[a.books[0]] || {}).date ? 1 : -1);
    const D = Object.assign({}, M.promo, { imgs: I, books: Object.fromEntries(B.filter(b => has.has(b.id)).map(b => [b.id, b])) });
    D.coverage = Object.fromEntries(M.cover.pubs.map(p => { const L = B.filter(b => b.pub === p); return [p, { total: L.length, with: L.filter(b => has.has(b.id)).length }]; }));
    return D;
  };
  const reports = async () => { const { data, error } = await sb.from('reports').select('report_date,title,findings,profiles,doc_url').eq('grp', GRP).order('report_date', { ascending: false }); if (error) throw error; return data; };

  const LOAD = {
    async cover(uid) {
      const M = await meta(), B = await books(M);
      if (!B.length) return false;
      window.DATA = cover(M, B);
      await sign(B.map(b => 'covers/' + b.id + '.jpg'), uid);
      return true;
    },
    async promo(uid) {
      const M = await meta(), B = await books(M);
      if (!B.length) return false;
      const D = await promo(M, B); D.labels.cstyle = Object.fromEntries(M.cover.styles.map(s => [s.id, s.ko]));
      window.DATA = D;
      window.PROMO_SRC = f => MEDIA('promo/' + f); window.THUMB_SRC = f => MEDIA('thumbs/' + f); window.COVER_SRC = id => MEDIA('covers/' + id + '.jpg');
      await sign(D.imgs.flatMap(x => ['thumbs/' + x.file, 'promo/' + x.file]).concat(Object.keys(D.books).map(id => 'covers/' + id + '.jpg')), uid);
      return true;
    },
    async sns(uid) {
      const M = await meta(), B = await books(M);
      if (!B.length) return false;
      const [acc, rows] = await Promise.all([sb.from('sns_accounts').select('data').eq('grp', GRP), all('sns_posts', 'data', [['seq'], ['url']])]);
      if (acc.error) throw acc.error;
      const P = M.cover.pubs, PL = ['ig', 'x', 'th'];
      window.SNS = {
        books: B.map(b => ({ id: b.id, pub: b.pub, title: b.title, author: b.author, date: b.date, cat: b.catTop, style: b.style })),
        posts: rows.map(r => r.data),
        accounts: acc.data.map(r => r.data).sort((a, b) => P.indexOf(a.pub) - P.indexOf(b.pub) || PL.indexOf(a.plat) - PL.indexOf(b.plat) || (a.acct < b.acct ? -1 : 1)),
        meta: M.sns.meta,
      };
      // 내려받기 단추가 쓰는 저장 기능(브라우저 내려받기)
      window.claude = window.claude || { use: async n => n === 'downloads' ? { save: async ({ filename, data }) => { const b = data instanceof Blob ? data : new Blob([data]); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = filename; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 4000); } } : null };
      await sign(B.map(b => 'covers_s/' + b.id + '.jpg'), uid);
      return true;
    },
    async home(uid) {
      const M = await meta(), B = await books(M);
      if (!B.length) return false;
      const [D, sum, R] = await Promise.all([promo(M, B), sb.rpc('sns_summary', { g: GRP }), reports()]);
      if (sum.error) throw sum.error;
      window.HOME = { cover: cover(M, B), promo: D, sns: sum.data, snsMeta: M.sns.meta, reports: R };
      const top = [...B].sort((a, b) => b.sp - a.sp).filter((b, i, a) => a.findIndex(x => x.pub === b.pub) === i).slice(0, 4);
      const th = D.imgs.filter((x, i, a) => a.findIndex(y => y.pub === x.pub) === i).slice(0, 3);
      window.HOME.top = top; window.HOME.th = th;
      await sign(top.map(b => 'covers_s/' + b.id + '.jpg').concat(th.map(x => 'thumbs/' + x.file)), uid);
      return true;
    },
    async report() {
      const R = await reports();
      if (!R.length) return false;
      window.REPORTS = R;
      await window.loadReport(R[0].report_date);
      return true;
    },
  };
  window.loadReport = async d => {
    const { data, error } = await sb.from('reports').select('report_date,title,lead,body,toc,doc_url').eq('grp', GRP).eq('report_date', d).single();
    if (error) throw error;
    window.REPORT = { title: data.title, asof: data.report_date, lead: data.lead || '', body: data.body, toc: data.toc || [], doc_url: data.doc_url };
  };

  // ---------- 시작 ----------
  window.APPX = {
    esc,
    start(page, run) {
      document.body.classList.add('locked');
      chrome(page);
      const form = $('gx-form'), wait = $('gx-wait');
      const say = t => { $('gx-msg').textContent = t; };
      const KO = { 'Invalid login credentials': '이메일이나 비밀번호가 맞지 않습니다.', 'Email not confirmed': '메일로 받은 확인 링크를 먼저 눌러 주세요.' };
      let started = false;
      const go = async user => {
        if (started) return; started = true;
        form.hidden = true; wait.hidden = false; wait.textContent = '자료를 불러오는 중입니다…';
        try {
          const ok = await LOAD[page](user.id);
          if (!ok) { started = false; await sb.auth.signOut(); wait.hidden = true; form.hidden = false; say(user.email + ' 계정은 허용 목록에 없습니다.'); return; }
        } catch (e) { started = false; wait.hidden = true; form.hidden = false; say('자료를 불러오지 못했습니다. 잠시 뒤 다시 시도해 주세요. (' + ((e && e.message) || e) + ')'); return; }
        $('gx-gate').remove(); document.body.classList.remove('locked');
        const main = $('app-main');
        if (main) { const s = document.createElement('script'); s.textContent = main.textContent; document.body.appendChild(s); }
        if (run) run();
        const foot = document.createElement('p'); foot.className = 'gx-foot';
        foot.innerHTML = esc(user.email) + ' 로그인 중 · <button type="button" class="gx-link" id="gx-out">로그아웃</button>';
        document.body.appendChild(foot);
        $('gx-out').onclick = () => sb.auth.signOut().then(() => location.reload());
      };
      form.addEventListener('submit', async e => {
        e.preventDefault();
        const email = $('gx-email').value.trim(), pw = $('gx-pw').value;
        if (!email || !pw) { say('이메일과 비밀번호를 넣어 주세요.'); return; }
        say('확인하는 중입니다…');
        const { data, error } = await sb.auth.signInWithPassword({ email, password: pw });
        if (error) { say(KO[error.message] || ('문제가 생겼습니다: ' + error.message)); return; }
        say(''); go(data.user);
      });
      sb.auth.getSession().then(({ data }) => { if (data.session) go(data.session.user); else { wait.hidden = true; form.hidden = false; } });
    },
  };
})();
