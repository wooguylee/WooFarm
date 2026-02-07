import { chromium } from 'playwright';
import path from 'path';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto(`file://${path.resolve('./index.html')}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  // 새 게임
  const buttons = await page.locator('button').all();
  for (const btn of buttons) {
    if ((await btn.textContent())?.includes('새 게임')) {
      await btn.click();
      break;
    }
  }
  await page.waitForTimeout(1500);
  
  console.log('=== renderSeedPanel 디버깅 ===\n');
  
  // 씨앗 도구 선택
  const toolSlots = await page.locator('.tool-slot').all();
  if (toolSlots.length > 2) {
    await toolSlots[2].click();
    console.log('씨앗 도구 선택됨');
    await page.waitForTimeout(400);
  }
  
  // renderSeedPanel 실행 후 상태 확인
  const details = await page.evaluate(() => {
    const container = document.getElementById('seed-list');
    const panel = document.getElementById('seed-panel');
    
    console.log('[PAGE] seed-list 컨테이너:', !!container);
    console.log('[PAGE] seed-panel:', !!panel);
    
    if (container) {
      console.log('[PAGE] seed-list innerHTML:', container.innerHTML);
    }
    
    // getSeedsForSeason 다시 호출
    const seeds = window.InventorySystem.getSeedsForSeason(window.TimeSystem.currentSeason);
    console.log('[PAGE] getSeedsForSeason 결과 개수:', seeds.length);
    
    // _createSeedElement 테스트
    if (seeds.length > 0) {
      const firstSeed = seeds[0];
      const seedEl = window.InventorySystem._createSeedElement(firstSeed);
      console.log('[PAGE] _createSeedElement 결과:', !!seedEl);
      console.log('[PAGE] seedEl.outerHTML:', seedEl.outerHTML.substring(0, 200));
    }
    
    return {
      containerExists: !!container,
      panelExists: !!panel,
      containerHTML: container?.innerHTML || 'not-found',
      seedsCount: seeds.length,
    };
  });
  
  console.log('\n결과:');
  console.log('seed-list 존재:', details.containerExists);
  console.log('seed-panel 존재:', details.panelExists);
  console.log('HTML:', details.containerHTML);
  console.log('시드 개수:', details.seedsCount);
  
  // HTML 구조 확인
  console.log('\n=== HTML 구조 ===\n');
  
  const htmlStructure = await page.evaluate(() => {
    const seedPanel = document.querySelector('#seed-panel');
    const seedList = document.querySelector('#seed-list');
    
    return {
      seedPanelHTML: seedPanel?.outerHTML.substring(0, 300),
      seedListHTML: seedList?.outerHTML.substring(0, 300),
    };
  });
  
  console.log('Seed Panel HTML:');
  console.log(htmlStructure.seedPanelHTML);
  console.log('\nSeed List HTML:');
  console.log(htmlStructure.seedListHTML);
  
  await browser.close();
})();
