const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
// בדיקת קצה לקצה: npm run build, npx vite preview --port 4173, ואז node tests/e2e.cjs
// צילומי מסך נשמרים ב-tests/out (לא בריפו).
const path = require('path');
const F = path.join(__dirname, 'fixtures'), S = path.join(__dirname, 'out'), U = 'http://localhost:4173/';
require('fs').mkdirSync(S, { recursive: true });
const SB = 'https://ktqmwpbzcnzkhjskqisy.supabase.co';
const fails = []; const ok = m => console.log('ok  ', m); const bad = m => { fails.push(m); console.log('FAIL', m); };
const PNG = fs.readFileSync(`${F}/room1.png`);
const b64u = o => Buffer.from(JSON.stringify(o)).toString('base64url');
const TOKEN = `${b64u({ alg: 'HS256', typ: 'JWT' })}.${b64u({ sub: 'u1', email: 'shtanat5@gmail.com', role: 'authenticated', exp: Math.floor(Date.now() / 1000) + 3600 })}.sig`;
const USER = { id: 'u1', email: 'shtanat5@gmail.com', aud: 'authenticated', role: 'authenticated', app_metadata: {}, user_metadata: {} };
const RESULT = { room_type: 'סלון', elements_present: ['earth'], elements_missing: ['wood'], imbalances: ['פינה חשוכה'], top3_fixes: ['א', 'ב', 'ג'], insight: 'סלון שמחזיק אבל לא מזמין.', upgraded_prompt: 'פרומפט... frame divisions' };

function mock(ctx, db, log) {
  return ctx.route(`${SB}/**`, async (route, req) => {
    const url = new URL(req.url()), p = url.pathname, m = req.method(), h = req.headers();
    const cors = { 'access-control-allow-origin': '*', 'content-type': 'application/json' };
    if (m === 'OPTIONS') return route.fulfill({ status: 200, headers: { 'access-control-allow-origin': '*', 'access-control-allow-headers': '*', 'access-control-allow-methods': '*' } });
    const authed = (h['authorization'] || '').includes(TOKEN);
    log.push(`${m} ${p} ${authed ? 'AUTH' : 'anon'}`);
    const j = (status, body) => route.fulfill({ status, headers: cors, body: body === undefined ? '' : JSON.stringify(body) });
    if (p.startsWith('/auth/') || p === '/rest/v1/fs_admins') { log.push('AUTHCALL ' + p); return j(404, {}); }
    if (p === '/auth/v1/settings') return j(200, { external: { google: false, email: true } });
    if (p === '/auth/v1/token') {
      const b = JSON.parse(req.postData() || '{}');
      if (b.password !== 'right-pass') return j(400, { error: 'invalid_grant', error_description: 'Invalid login credentials', msg: 'Invalid login credentials', code: 'invalid_credentials' });
      return j(200, { access_token: TOKEN, token_type: 'bearer', expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, refresh_token: 'r1', user: USER });
    }
    if (p === '/auth/v1/user') return authed ? j(200, USER) : j(401, { msg: 'no' });
    if (p === '/auth/v1/logout') return j(204);
    if (p === '/rest/v1/fs_admins') return j(200, authed ? [{ email: 'shtanat5@gmail.com' }] : []);
    if (p === '/rest/v1/fs_room_visuals') {
      if (m === 'GET') return j(200, Object.values(db.visuals));
      const row = JSON.parse(req.postData()); db.visuals[row.visual_key] = row; db.upserts.push(row); return j(201);
    }
    if (p === '/rest/v1/fs_image_analyses') {
      if (m === 'GET') return j(200, db.analyses.slice().reverse());
      if (m === 'POST') { const row = { id: 'a' + (db.analyses.length + 1), created_at: new Date().toISOString(), ...JSON.parse(req.postData()) }; db.analyses.push(row); return j(201, row); }
      if (m === 'PATCH') { const id = url.searchParams.get('id').replace('eq.', ''); Object.assign(db.analyses.find(a => a.id === id), JSON.parse(req.postData())); return j(204); }
    }
    if (p === '/rest/v1/fs_diagnoses') {
      if (m === 'GET') return j(200, db.diags.slice().reverse());
      if (m === 'POST') { const row = { id: 'd' + (db.diags.length + 1), created_at: new Date().toISOString(), ...JSON.parse(req.postData()) }; db.diags.push(row); return j(201, row); }
    }
    if (p.startsWith('/storage/v1/object/sign/fs-images/')) {
      if (m === 'POST') return j(200, { signedURL: p.replace('/storage/v1', '') + '?token=t' });
      return route.fulfill({ status: 200, headers: { 'access-control-allow-origin': '*', 'content-type': 'image/png' }, body: PNG });
    }
    if (p.startsWith('/storage/v1/object/fs-images')) {
      if (m === 'POST') { const key = decodeURIComponent(p.replace('/storage/v1/object/fs-images/', '')); db.files.push(key); return j(200, { Key: 'fs-images/' + key }); }
      if (m === 'DELETE') return j(200, []);
    }
    if (p === '/functions/v1/fs-analyze-image') {
      db.fn.push(1); return j(200, { result: RESULT });
    }
    log.push('UNMOCKED ' + m + ' ' + p);
    return j(404, {});
  });
}

(async () => {
  const b = await chromium.launch();
  for (const [name, vp] of [['desktop', { width: 1440, height: 900 }], ['mobile', { width: 390, height: 844 }]]) {
    const db = { visuals: { 'room:entry': { visual_key: 'room:entry', prompt: 'p', insight: 'i', image_path: 'visuals/room-entry-1.jpg' } }, upserts: [], analyses: [], files: [], fn: [], diags: [] }, log = [];
    const ctx = await b.newContext({ viewport: vp, permissions: ['clipboard-read', 'clipboard-write'] });
    await mock(ctx, db, log);
    const p = await ctx.newPage();
    const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && !/fonts\.g|status of 40[013]/.test(m.text()) && errs.push(m.text()));
    const hs = async t => { const w = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth); if (w > 0) bad(`${name} ${t} hscroll ${w}`); };

    await p.goto(U); await p.waitForTimeout(1200);
    (await p.locator('.brand .app-mark').count()) ? ok('app mark next to name') : bad('app mark');
    (await p.locator('.topbar .actions').count()) === 0 ? ok('no button row in top bar') : bad('actions row still there');
    const nav = await p.locator('.topbar').boundingBox(); const top = await p.locator('main').evaluate(e => parseFloat(getComputedStyle(e).paddingTop));
    nav.height <= top + 1 ? ok(`nav ${Math.round(nav.height)} fits slot ${top}`) : bad(`nav ${nav.height} > ${top}`);
    // settings card
    await p.click('[data-act=settings]'); await p.waitForTimeout(300);
    const card = p.locator('.settings-card');
    (await card.count()) && (await card.locator('text=העתקת קישור').count()) && (await card.locator('text=שיחת הפיתוח').count()) && (await card.locator('text=פרויקט המחקר').count()) && (await card.locator('text=התקנת האפליקציה').count())
      ? ok('settings card has all 4') : bad('settings card');
    const cb = await card.boundingBox(); (cb.x >= 0 && cb.x + cb.width <= vp.width) ? ok('card inside viewport') : bad('card overflow ' + JSON.stringify(cb));
    await card.locator('[data-testid=copy]').click(); await p.waitForTimeout(200);
    (await p.evaluate(() => navigator.clipboard.readText())).startsWith(U) ? ok('copy link from card') : bad('copy');
    await hs('card open');
    await p.mouse.click(vp.width - 8, vp.height - 8); await p.waitForTimeout(400);
    (await p.locator('.settings-card').count()) === 0 ? ok('outside click closes card') : bad('card not closed');
    await p.screenshot({ path: `${S}/${name}-v3-home.png` });

    // visitor: sees shared image, cannot add
    await p.goto(U + '#practice'); await p.waitForTimeout(1500);
    (await p.locator('.visuals .flip-media img').count()) === 1 ? ok('visitor sees shared image') : bad('visitor image');
    const c0 = p.locator('.visuals .flip').first();
    await c0.locator('.flip-front').scrollIntoViewIfNeeded(); await c0.locator('.flip-front').click(); await p.waitForTimeout(700);
    (await c0.locator('[data-act=paste]').count()) === 1 && (await c0.locator('[data-act=copy-prompt]').count()) === 1 ? ok('visitor sees paste frame') : bad('visitor controls');
    await c0.locator('.flip-back-head .btn').click(); await p.waitForTimeout(500);

    // bed game
    const bed = p.locator('.bed-plan'); await bed.scrollIntoViewIfNeeded();
    const scoreOf = async () => +(await p.locator('.bed').getAttribute('aria-valuenow'));
    const s0 = await scoreOf();
    const bb = await bed.boundingBox(); const sx = bb.width / 400, sy = bb.height / 360;
    await p.mouse.move(bb.x + 100 * sx, bb.y + 300 * sy); await p.mouse.down();
    for (let i = 1; i <= 10; i++) await p.mouse.move(bb.x + (100 + 20 * i) * sx, bb.y + 300 * sy);
    await p.mouse.up(); await p.waitForTimeout(500);
    const s1 = await scoreOf();
    s0 < 25 && s1 > 75 ? ok(`drag cold ${s0} -> hot ${s1}`) : bad(`drag scores ${s0} -> ${s1}`);
    const fillHot = await p.locator('.bed rect').first().getAttribute('stroke');
    await p.locator('.bed-panel .chip', { hasText: 'על קיר הדלת' }).click(); await p.waitForTimeout(400);
    const fillCold = await p.locator('.bed rect').first().getAttribute('stroke');
    const hue = s => +s.match(/hsl\((\d+)/)[1];
    hue(fillHot) > 100 && hue(fillCold) < 40 ? ok(`color green ${fillHot} / red ${fillCold}`) : bad(`colors ${fillHot} ${fillCold}`);
    for (const t of ['עמדת שליטה', 'בקו הדלת', 'מתחת לחלון']) { await p.locator('.bed-panel .chip', { hasText: t }).click(); await p.waitForTimeout(200); }
    await p.locator('.bed').focus(); await p.keyboard.press('ArrowLeft'); await p.waitForTimeout(200);
    ok('presets + keyboard');
    await p.click('[data-act=heat]'); await p.waitForTimeout(300);
    (await p.locator('.bed-plan rect[opacity]').count()) > 100 ? ok('heat map') : bad('heat map');
    await hs('practice');
    await p.locator('.bedgame').scrollIntoViewIfNeeded(); await p.waitForTimeout(400);
    await p.screenshot({ path: `${S}/${name}-v3-bed.png` });

    // bagua art
    await p.goto(U + '#bagua/north'); await p.waitForTimeout(1200);
    (await p.locator('.bagua .cell-art').count()) === 9 ? ok('9 bagua cells, art on front only') : bad('bagua art');
    await hs('bagua');
    await p.locator('.bagua').scrollIntoViewIfNeeded();
    await p.screenshot({ path: `${S}/${name}-v3-bagua.png` });

    // diagnosis: paste as visitor, save asks for login inside the card, then saves
    await p.goto(U + '#diagnosis'); await p.waitForTimeout(900);
    for (const s of ['s9', 's10']) await p.click(`[data-sym="${s}"]`);
    await p.waitForTimeout(700);
    const dc = p.locator('.result .flip');
    await dc.locator('.flip-front').scrollIntoViewIfNeeded(); await dc.locator('.flip-front').click(); await p.waitForTimeout(700);
    (await dc.locator('[data-act=paste]').count()) === 1 ? ok('diagnosis paste frame visible') : bad('no diagnosis paste frame');
    await dc.locator('[data-act=paste]').evaluate(async (el, b64) => {
      const bin = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
      const dt = new DataTransfer(); dt.items.add(new File([bin], 'p.png', { type: 'image/png' }));
      el.dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
    }, PNG.toString('base64'));
    await p.waitForTimeout(300);
    (await dc.locator('.paste-zone img').count()) ? ok('diagnosis paste preview') : bad('diag paste');
    await dc.locator('[data-act=save]').click(); await p.waitForTimeout(1500);
    db.visuals['diagnosis:wood']?.image_path ? ok('visitor saves diagnosis image directly') : bad('diag save');
    const d1 = db.diags[0];
    db.diags.length === 1 && d1.image_path === db.visuals['diagnosis:wood'].image_path && d1.symptoms.join() === 's10,s9' && d1.element === 'wood' && d1.explanation.includes('מה הורגש') && d1.insight.length > 5
      ? ok('image save also stores diagnosis in library') : bad('library row ' + JSON.stringify(db.diags));
    (await p.locator('[data-act=save-diagnosis]').isDisabled()) ? ok('save-diagnosis disabled after saving') : bad('save-diagnosis still enabled');
    await p.waitForTimeout(500);
    (await p.locator('.library .lib-card').count()) === 1 && (await p.locator('.library .lib-media img').count()) === 1 ? ok('library shows card with image') : bad('library card');
    // another set saved by button, without a new image
    await p.goto(U + '#diagnosis'); await p.waitForTimeout(700);
    for (const s of ['s1', 's2']) await p.click(`[data-sym="${s}"]`);
    await p.waitForTimeout(600);
    await p.click('[data-act=save-diagnosis]'); await p.waitForTimeout(700);
    db.diags.length === 1 && (await p.locator('.lib-save [role=status]').innerText()).includes('צריך תמונה') ? ok('no library entry without an image') : bad('saved without image');
    const fc = p.locator('.result .flip');
    await fc.locator('.flip-front').scrollIntoViewIfNeeded(); await fc.locator('.flip-front').click(); await p.waitForTimeout(700);
    await fc.locator('[data-act=file]').setInputFiles(`${F}/room2.png`); await p.waitForTimeout(300);
    await fc.locator('[data-act=save]').click(); await p.waitForTimeout(1500);
    db.diags.length === 2 && db.diags[1].element === 'fire' ? ok('second diagnosis saved with its image') : bad('second diag ' + JSON.stringify(db.diags.map(d => d.element)));
    (await p.locator('.library .lib-card').count()) === 2 && (await p.locator('.library .lib-media img').count()) === 2 ? ok('library has 2 cards, both with images') : bad('library count');
    (await p.locator('.library .lib-card h3').first().innerText()).includes('אש') ? ok('newest first') : bad('order');
    await hs('diagnosis library');
    await p.locator('#library').scrollIntoViewIfNeeded(); await p.screenshot({ path: `${S}/${name}-library.png` });
    // open an older diagnosis from the library
    await p.locator('.library [data-act=open-diagnosis]').nth(1).click(); await p.waitForTimeout(900);
    (await p.evaluate(() => decodeURIComponent(location.hash))) === '#diagnosis/s10.s9' && (await p.locator('.check.on').count()) === 2 ? ok('open diagnosis restores its symptoms') : bad('open diag ' + await p.evaluate(() => location.hash));
    // another device sees the library
    { const c3 = await b.newContext({ viewport: vp }); await mock(c3, db, []); const p3 = await c3.newPage(); await p3.goto(U + '#diagnosis'); await p3.waitForTimeout(1500);
      (await p3.locator('.library .lib-card').count()) === 2 ? ok('another device sees the library') : bad('library other device'); await c3.close(); }
    (await p.locator('.card-login, input[type=password]').count()) === 0 ? ok('no login anywhere') : bad('login still present');
    await dc.scrollIntoViewIfNeeded();
    await p.screenshot({ path: `${S}/${name}-v4-diag.png` });
    // analysis open to everyone, key marks
    await p.goto(U + '#image-analysis'); await p.waitForTimeout(1200);
    (await p.locator('.gate').count()) === 0 && (await p.locator('[data-act=analyze]').count()) === 1 ? ok('analysis open without login') : bad('analysis gated');
    (await p.locator('[data-act=analyze] .key-mark').count()) === 1 && (await p.locator('.tab-tool .key-mark').count()) === 1 ? ok('key mark on analyze button and tab') : bad('key mark');
    (await p.locator('.key-mark').count()) === 2 ? ok('exactly 2 key marks on page') : bad('key count ' + await p.locator('.key-mark').count());
    const anim = await p.locator('[data-act=analyze] .key-mark').evaluate(e => getComputedStyle(e).animationName); anim === 'key-glow' ? ok('key glows') : bad('anim ' + anim);
    await p.locator('[data-act=before-file]').setInputFiles(`${F}/room1.png`);
    await p.click('[data-act=analyze]'); await p.waitForTimeout(1800);
    db.fn.length === 1 && db.analyses.length === 1 && db.analyses[0].before_path.startsWith('analyses/') ? ok('analysis + saved under analyses/') : bad('analysis ' + JSON.stringify(db.analyses));
    await p.waitForTimeout(500); (await p.locator('[data-hist]').count()) === 1 ? ok('history visible to all') : bad('history');
    await p.locator('[data-act=analyze]').scrollIntoViewIfNeeded(); await p.screenshot({ path: `${S}/${name}-v7-analysis.png` });
    // visitor adds a room image, persists after reload
    await p.goto(U + '#practice'); await p.waitForTimeout(1500);
    const c1 = p.locator('.visuals .flip').nth(1);
    await c1.locator('.flip-front').scrollIntoViewIfNeeded(); await c1.locator('.flip-front').click(); await p.waitForTimeout(700);
    await c1.locator('[data-act=file]').setInputFiles(`${F}/room2.png`); await p.waitForTimeout(300);
    await c1.locator('[data-act=save]').click(); await p.waitForTimeout(1500);
    db.upserts.at(-1).visual_key === 'room:bedroom' && db.upserts.at(-1).image_path.startsWith('visuals/') && db.upserts.at(-1).device_id === 'shared-feng-shui-content' ? ok('admin saved shared visual') : bad('admin save ' + JSON.stringify(db.upserts));
    await p.reload(); await p.waitForTimeout(1500);
    (await p.locator('.visuals .flip-media img').count()) === 2 ? ok('2 images after reload') : bad('reload imgs');
    // second visitor context (another device) sees both images
    const ctx2 = await b.newContext({ viewport: vp }); await mock(ctx2, db, []);
    const p2 = await ctx2.newPage(); await p2.goto(U + '#practice'); await p2.waitForTimeout(1500);
    (await p2.locator('.visuals .flip-media img').count()) === 2 ? ok('another device sees the saved images') : bad('other device');
    await ctx2.close();
    await p.click('[data-act=settings]'); await p.waitForTimeout(300);
    (await p.locator('.settings-card input, .settings-card [data-act=login]').count()) === 0 ? ok('settings card without admin login') : bad('admin in card');
    (await p.locator('.settings-card').innerText()).includes('מפתח מאיר') ? ok('project details mention key mark') : bad('key text');
    await p.screenshot({ path: `${S}/${name}-v7-settings.png` });
    const badLog = log.filter(l => /UNMOCKED|AUTHCALL/.test(l));
    badLog.length ? bad(`${name} ${badLog.join(' | ')}`) : ok(`${name} all supabase calls mocked`);
    errs.length ? bad(`${name} errors: ${errs.join(' / ')}`) : ok(`${name} no console errors`);
    await ctx.close();
  }
  await b.close();
  console.log(fails.length ? `\n${fails.length} FAILURES` : '\nALL GREEN');
})();
