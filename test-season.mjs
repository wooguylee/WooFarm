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
  
  const info = await page.evaluate(() => {
    const season = window.TimeSystem.currentSeason;
    const seeds = window.InventorySystem.getSeedsForSeason(season);
    
    // 수동으로 필터링
    const allSeeds = window.InventorySystem.getItemsByType('seed');
    const filtered = [];
    
    for (let i = 0; i < allSeeds.length; i++) {
      const seed = allSeeds[i];
      const cropId = seed.itemId.replace('_seed', '');
      const cropData = window.CROP_DATA?.[cropId];
      console.log(`[DEBUG] ${seed.itemId} -> cropId: ${cropId}, cropData: ${!!cropData}, seasons: ${cropData?.seasons}`);
      
      if (cropData && cropData.seasons && cropData.seasons.includes(season)) {
        filtered.push({
          itemId: seed.itemId,
          quantity: seed.quantity,
          cropId: cropId,
        });
      }
    }
    
    return {
      currentSeason: season,
      allSeeds: allSeeds,
      getSeedsForSeasonResult: seeds,
      manualFiltered: filtered,
    };
  });
  
  console.log('현재 계절:', info.currentSeason);
  console.log('\n모든 씨앗:');
  info.allSeeds.forEach(s => console.log(`  ${s.itemId} x${s.quantity}`));
  
  console.log('\ngetSeedsForSeason 결과:', info.getSeedsForSeasonResult);
  
  console.log('\n수동 필터링 결과:');
  info.manualFiltered.forEach(s => console.log(`  ${s.itemId} (${s.cropId})`));
  
  await browser.close();
})();
