const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('http://localhost:8123/workspace.html', { waitUntil: 'networkidle' });
  await page.click('a[data-tab="checkin"]');
  await page.waitForTimeout(300);
  await page.locator('.checkin-wrap').first().screenshot({ path: 'kpi-check.png' });
})();
