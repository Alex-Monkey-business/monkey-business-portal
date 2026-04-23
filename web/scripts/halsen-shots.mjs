import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, '../public/assets/halsen');
await mkdir(OUT, { recursive: true });

const APP = 'http://localhost:5174';
const USER = 'Alex';
const PIN = '1234';

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
});
await context.addInitScript(() => {
  sessionStorage.setItem('splashShown', '1');
});
const page = await context.newPage();
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const selectUserAndPin = async () => {
  await page.waitForSelector('input[type="tel"][inputmode="numeric"]', { timeout: 10000 });
  await page.evaluate(
    async ({ user, pin }) => {
      const select = document.querySelector('select');
      if (select) {
        const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set;
        const opts = Array.from(select.options);
        const opt = opts.find((o) => o.text.trim() === user || o.text.includes(user));
        if (opt) {
          setter.call(select, opt.value);
          select.dispatchEvent(new Event('change', { bubbles: true }));
          select.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
      await new Promise((r) => setTimeout(r, 200));
      const inputs = document.querySelectorAll('input[type="tel"][inputmode="numeric"]');
      for (let i = 0; i < inputs.length && i < pin.length; i++) {
        const el = inputs[i];
        const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
        setter.call(el, pin[i]);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        await new Promise((r) => setTimeout(r, 80));
      }
    },
    { user: USER, pin: PIN }
  );
  await page.waitForFunction(
    () => !!JSON.parse(localStorage.getItem('halsen_coach') || 'null'),
    { timeout: 10000 }
  );
  await wait(600);
};

// 1. LOGIN screen — fresh context, no auth, splash skipped. Capture the login UI.
await page.goto(APP, { waitUntil: 'networkidle' });
await page.waitForSelector('input[type="tel"][inputmode="numeric"]', { timeout: 10000 });
await wait(400);
// Select Alex so the coach avatar appears in the top circle.
await page.evaluate((user) => {
  const select = document.querySelector('select');
  if (select) {
    const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set;
    const opt = Array.from(select.options).find((o) => o.text.trim() === user);
    if (opt) {
      setter.call(select, opt.value);
      select.dispatchEvent(new Event('change', { bubbles: true }));
      select.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }
}, USER);
await wait(400);
await page.screenshot({ path: resolve(OUT, 'login.png'), fullPage: false });
console.log('✓ login.png');

// Enter PIN to proceed
await selectUserAndPin();

// 2. DASHBOARD (/)
await page.goto(APP + '/', { waitUntil: 'networkidle' });
await wait(900);
await page.evaluate(() => window.scrollTo(0, 0));
await wait(200);
await page.screenshot({ path: resolve(OUT, 'dashboard.png'), fullPage: false });
console.log('✓ dashboard.png');

// 3. SEASON (/sesong)
await page.goto(APP + '/sesong', { waitUntil: 'networkidle' });
await wait(900);
await page.evaluate(() => window.scrollTo(0, 0));
await wait(200);
await page.screenshot({ path: resolve(OUT, 'season.png'), fullPage: false });
console.log('✓ season.png');

// 4. MATCH DETAIL
await page.goto(APP + '/', { waitUntil: 'networkidle' });
await wait(700);
const firstMatchHref = await page.evaluate(() => {
  const a = document.querySelector('a[href^="/kamp/"]');
  return a ? a.getAttribute('href') : null;
});
if (firstMatchHref) {
  await page.goto(APP + firstMatchHref, { waitUntil: 'networkidle' });
  await wait(900);
  await page.evaluate(() => window.scrollTo(0, 0));
  await wait(200);
  await page.screenshot({ path: resolve(OUT, 'match.png'), fullPage: false });
  console.log('✓ match.png');
} else {
  console.log('! no match link found');
}

// 5. MORE
await page.goto(APP + '/mer', { waitUntil: 'networkidle' });
await wait(700);
await page.evaluate(() => window.scrollTo(0, 0));
await wait(200);
await page.screenshot({ path: resolve(OUT, 'more.png'), fullPage: false });
console.log('✓ more.png');

await browser.close();
console.log('done →', OUT);
