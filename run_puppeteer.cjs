const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', e => console.log('PAGEERROR:', e.message));
  page.on('error', e => console.log('ERROR:', e.message));
  await page.goto('https://ais-dev-v26v4zaoxrzhueqqjveglf-405049108850.us-west1.run.app', { waitUntil: 'load', timeout: 10000 });
  await new Promise(r => setTimeout(r, 2000));
  await browser.close();
})();
