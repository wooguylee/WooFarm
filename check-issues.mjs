import { chromium } from 'playwright';
import path from 'path';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  
  await page.goto(`file://${path.resolve('./index.html')}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  // 새 게임 시작
  const buttons = await page.locator('button').all();
  for (const btn of buttons) {
    const text = await btn.textContent();
    if (text?.includes('새 게임')) { await btn.click(); break; }
  }
  
  await page.waitForTimeout(2000);
  
  // 상세 정보 확인
  const info = await page.evaluate(() => {
    return {
      inventoryGold: window.InventorySystem?._gold,
      shopGold: window.ShopSystem?.gold,
      decorationDataType: typeof window.DECORATION_DATA,
      decorationDataKeyCount: Object.keys(window.DECORATION_DATA || {}).length,
      decorationDataFirst3: Object.keys(window.DECORATION_DATA || {}).slice(0, 3),
    };
  });
  
  console.log('=== 문제 분석 ===\n');
  console.log('InventorySystem._gold:', info.inventoryGold);
  console.log('ShopSystem.gold:', info.shopGold);
  console.log('DECORATION_DATA 타입:', info.decorationDataType);
  console.log('DECORATION_DATA 키 개수:', info.decorationDataKeyCount);
  console.log('DECORATION_DATA 첫 키들:', info.decorationDataFirst3);
  console.log('\nConsole 에러 수:', errors.length);
  if (errors.length > 0) {
    console.log('첫 에러:', errors[0]);
  }
  
  await browser.close();
})();
