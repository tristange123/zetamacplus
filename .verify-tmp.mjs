import { chromium } from '@playwright/test';
import { execFileSync } from 'node:child_process';

const base = 'http://localhost:3123';
const DB = process.env.TEST_DATABASE_URL;
const U1 = 'verifyruns@example.com', U2 = 'verifysettings@example.com';
let failures = 0;
const check = (label, ok, detail = '') => { if (!ok) failures++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}${detail ? '  — ' + detail : ''}`); };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function snap(email) {
  const out = execFileSync('psql', [DB, '-AtF,', '-c', `
    select (select count(*) from "Test" t where t."userId"=p."userId"),
           (select count(*) from "Problem" pr join "Test" t on pr."testId"=t.id where t."userId"=p."userId"),
           p."testsAttempted", p."sprintTotalTests", p."standardTotalTests", p."rapidTotalTests", p."dailyTotalTests", p."dailyCompleted"
    from "Profile" p where p.email='${email}'`]).toString().trim().split(',');
  const [tests, problems, attempted, sprint, standard, rapid, daily, dailyCompleted] = out;
  return { tests: +tests, problems: +problems, attempted: +attempted, sprint: +sprint, standard: +standard, rapid: +rapid, daily: +daily, dailyCompleted };
}
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const diff = (a, b) => Object.keys(a).filter((k) => a[k] !== b[k]).map((k) => `${k}: ${a[k]}→${b[k]}`).join(', ') || 'no change';

const gcd = (a, b) => b ? gcd(b, a % b) : a;
function solve(s) {
  let m = s.match(/^(gcd|lcm)\((\d+), (\d+)\)/);
  if (m) { const a = +m[2], b = +m[3]; return m[1] === 'gcd' ? gcd(a, b) : a * b / gcd(a, b); }
  m = s.match(/^(\d+)\s*([+\-×÷])\s*(\d+)/);
  const [l, o, r] = [+m[1], m[2], +m[3]];
  return o === '+' ? l + r : o === '-' ? l - r : o === '×' ? l * r : l / r;
}

const browser = await chromium.launch({ channel: 'chrome', headless: true });
async function login(email) {
  const context = await browser.newContext({ baseURL: base });
  const res = await context.request.post('/api/auth/sign-in/email', { headers: { origin: 'http://localhost:3000' }, data: { email, password: 'pizza2122' } });
  if (!res.ok()) throw new Error('login failed ' + res.status() + ' ' + await res.text());
  return context;
}
function trackWrites(page) {
  const writes = [];
  page.on('request', (r) => { if (r.method() !== 'GET' && !new URL(r.url()).pathname.startsWith('/_next') && !r.url().includes('/api/auth')) writes.push(`${r.method()} ${new URL(r.url()).pathname}`); });
  page.on('pageerror', (e) => console.log('  pageerror on', page.url(), ':', e.message.slice(0, 200)));
  return writes;
}
const problemHeading = (page) => page.getByRole('heading', { level: 2 }).filter({ hasText: /=/ });
async function solveN(page, n, useKeyboard = false) {
  for (let i = 0; i < n; i++) {
    const h = problemHeading(page);
    await h.waitFor();
    const answer = String(solve((await h.textContent()) ?? ''));
    if (useKeyboard) for (const d of answer) await page.getByRole('button', { name: d, exact: true }).click();
    else await page.getByLabel('Game answer').pressSequentially(answer);
  }
}
const resultsHeading = (page) => page.getByRole('heading', { name: /^Score:/ });
const saved = (page, timeout = 30000) => page.waitForResponse((r) => r.request().method() === 'POST' && new URL(r.url()).pathname === '/api/problem', { timeout });

// ---------- Normal modes: writes only at run end ----------
console.log('\n== Normal modes (verifyruns) ==');
const c1 = await login(U1);
const p1 = await c1.newPage();
const w1 = trackWrites(p1);

let before = snap(U1);
await p1.goto('/game/sprint');
await solveN(p1, 2);
await sleep(1500);
check('sprint mid-run: no DB change', same(before, snap(U1)), diff(before, snap(U1)));
check('sprint mid-run: no write requests', w1.length === 0, w1.join(' | '));
let done = saved(p1);
await resultsHeading(p1).waitFor({ timeout: 15000 });
await done; await sleep(500);
let after = snap(U1);
check('sprint end: results shown at /game/sprint', new URL(p1.url()).pathname === '/game/sprint');
check('sprint end: +1 test, +2 problems, sprintTotalTests +1, testsAttempted +1',
  after.tests === before.tests + 1 && after.problems === before.problems + 2 && after.sprint === before.sprint + 1 && after.attempted === before.attempted + 1, diff(before, after));
check('sprint end: writes are POST test, PATCH profile, POST problem', same(w1, ['POST /api/test', 'PATCH /api/profile', 'POST /api/problem']), w1.join(' | '));
check('sprint end: first-place crown shown', await p1.getByLabel('First best score').isVisible());

// reload on results page → new run, no duplicate save
w1.length = 0; before = snap(U1);
await p1.reload();
await problemHeading(p1).waitFor();
await sleep(1500);
check('reload on results: new game starts (board, score 0)', (await p1.getByText(/^Score: 0$/).count()) === 1);
check('reload on results: no duplicate save', same(before, snap(U1)) && w1.length === 0, diff(before, snap(U1)) + ' ' + w1.join(' | '));
// let this run end with 0 points
done = saved(p1);
await resultsHeading(p1).waitFor({ timeout: 15000 }); await done; await sleep(500);
after = snap(U1);
check('reloaded run ends: saved once (score 0 run)', after.tests === before.tests + 1 && after.sprint === before.sprint + 1, diff(before, after));

// restart from results → another run, saved once at its end
w1.length = 0; before = snap(U1);
await p1.getByRole('button', { name: 'Restart' }).click();
await solveN(p1, 1);
await sleep(1000);
check('restart from results: no write mid-run', same(before, snap(U1)) && w1.length === 0, diff(before, snap(U1)));
done = saved(p1);
await resultsHeading(p1).waitFor({ timeout: 15000 }); await done; await sleep(500);
after = snap(U1);
check('restarted run ends: +1 test, +1 problem', after.tests === before.tests + 1 && after.problems === before.problems + 1, diff(before, after));

// mid-run reload on standard → nothing saved; then leave via link
w1.length = 0; before = snap(U1);
await p1.goto('/game/standard');
await solveN(p1, 2);
await p1.reload();
await problemHeading(p1).waitFor();
check('standard mid-run reload: restarts at score 0', (await p1.getByText(/^Score: 0$/).count()) === 1);
await solveN(p1, 1);
await p1.goto('/');
await sleep(1500);
check('standard abandoned via reload/navigation: no DB change, no writes', same(before, snap(U1)) && w1.length === 0, diff(before, snap(U1)) + ' ' + w1.join(' | '));

// mid-run restart button on board: no write
w1.length = 0; before = snap(U1);
await p1.goto('/game/rapid');
await solveN(p1, 1);
await p1.getByRole('button', { name: 'Restart' }).click();
await sleep(1000);
check('rapid mid-run Restart button: no writes', same(before, snap(U1)) && w1.length === 0, diff(before, snap(U1)) + ' ' + w1.join(' | '));
// Back button mid-run (existing behaviour: reports abandoned attempts)
await p1.getByRole('button', { name: 'Back' }).click();
await sleep(1500);
after = snap(U1);
console.log(`INFO  rapid mid-run Back button: writes=[${w1.join(' | ')}], ${diff(before, after)}`);

// ---------- Extra modes + daily, run in parallel (120s each) ----------
console.log('\n== Extra modes + daily, 120s runs in parallel (verifyruns) ==');
before = snap(U1);
const pg = await c1.newPage(), pl = await c1.newPage(), pc = await c1.newPage(), pd = await c1.newPage();
const wg = trackWrites(pg), wl = trackWrites(pl), wc = trackWrites(pc), wd = trackWrites(pd);
const customUrl = '/game/custom?t=10&ops=' + encodeURIComponent(JSON.stringify({ '*': { first: [2, 9], second: [2, 9] } }));
await Promise.all([pg.goto('/game/gcd'), pl.goto('/game/lcm'), pc.goto(customUrl), pd.goto('/game/daily')]);
const dailyClaim = snap(U1);
console.log(`INFO  daily page load claims today's play: ${diff(before, dailyClaim)}`);
await Promise.all([solveN(pg, 3), solveN(pl, 3), solveN(pc, 3), solveN(pd, 3)]);
const customStatements = [];
await resultsHeading(pc).waitFor({ timeout: 20000 });
for (const row of await pc.locator('tbody tr td:nth-child(2)').allTextContents()) customStatements.push(row);
check('custom: t=10 respected and only × with 2–9 used',
  customStatements.length === 3 && customStatements.every((s) => /^[2-9] × [2-9] = \d+$/.test(s)), customStatements.join(' ; '));
await pc.reload(); await problemHeading(pc).waitFor();
const reloadedStatement = await problemHeading(pc).textContent();
check('custom: settings survive reload', /^[2-9] × [2-9] = $/.test(reloadedStatement ?? ''), reloadedStatement);
const dailySaved = saved(pd, 140000);
await Promise.all([resultsHeading(pg).waitFor({ timeout: 130000 }), resultsHeading(pl).waitFor({ timeout: 130000 }), resultsHeading(pd).waitFor({ timeout: 130000 })]);
await dailySaved; await sleep(1000);
after = snap(U1);
check('gcd: results in place, score 3', (await resultsHeading(pg).textContent())?.trim() === 'Score: 3');
check('lcm: results in place, score 3', (await resultsHeading(pl).textContent())?.trim() === 'Score: 3');
check('extras: zero write requests', wg.length + wl.length + wc.length === 0, [...wg, ...wl, ...wc].join(' | '));
check('extras: no crown', !(await pg.getByLabel(/best score$/).count()) && !(await pl.getByLabel(/best score$/).count()));
check('daily end: only daily saved (+1 test, +3 problems, dailyTotalTests +1)',
  after.tests === before.tests + 1 && after.problems === before.problems + 3 && after.daily === before.daily + 1, diff(before, after));
check('daily end: streak shown, no Restart button',
  (await pd.getByLabel(/^Daily streak:/).count()) === 1 && (await pd.getByRole('button', { name: 'Restart' }).count()) === 0,
  await pd.getByLabel(/^Daily streak:/).getAttribute('aria-label').catch(() => 'no streak'));
await pd.reload();
check('daily reload after finishing: "already played"', await pd.getByText("You have already played today's daily game.").isVisible());
await c1.close();

// ---------- Settings applied on direct load / reload ----------
console.log('\n== Settings (verifysettings: score off, timer off, keyboard on) ==');
execFileSync('psql', [DB, '-c', `update "Profile" set "showScore"=false, "showTimer"=false, "showKeyboard"=true where email='${U2}'`]);
const c2 = await login(U2);
const p2 = await c2.newPage();
for (const url of ['/game/standard', '/game/gcd', customUrl, '/game/daily']) {
  await p2.goto(url);   // direct load, never visiting the home page
  await problemHeading(p2).waitFor();
  await p2.getByRole('button', { name: '5', exact: true }).waitFor({ timeout: 5000 }).catch(() => {});
  const score = await p2.getByText(/^Score:/).count(), timer = await p2.getByText(/^Time:/).count(), kb = await p2.getByRole('button', { name: '5', exact: true }).count();
  check(`${url.split('?')[0]} direct load: score hidden, timer hidden, keyboard shown`, score === 0 && timer === 0 && kb === 1, `score=${score} timer=${timer} keyboard=${kb}`);
}
await p2.goto('/game/gcd'); await p2.reload(); await problemHeading(p2).waitFor();
await p2.getByRole('button', { name: '5', exact: true }).waitFor({ timeout: 5000 });
await solveN(p2, 2, true);
check('gcd after reload: on-screen keyboard solves problems', (await p2.locator('#game-answer').inputValue()) === '' );
await c2.close();

// Logged out: defaults
const c3 = await browser.newContext({ baseURL: base });
const p3 = await c3.newPage();
await p3.goto('/game/lcm'); await problemHeading(p3).waitFor();
check('logged out: defaults (score + timer shown, no keyboard)', (await p3.getByText(/^Score:/).count()) === 1 && (await p3.getByText(/^Time:/).count()) === 1 && (await p3.getByRole('button', { name: '5', exact: true }).count()) === 0);
await c3.close();

await browser.close();
console.log(`\n${failures === 0 ? 'ALL CHECKS PASSED' : failures + ' CHECK(S) FAILED'}`);
