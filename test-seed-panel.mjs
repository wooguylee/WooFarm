import { chromium } from 'playwright';
import path from 'path';

(async () => {
  console.log('=== 🌱 씨앗 패널 상세 분석 ===\n');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto(`file://${path.resolve('./index.html')}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  // 새 게임 시작
  const buttons = await page.locator('button').all();
  for (const btn of buttons) {
    const text = await btn.textContent();
    if (text?.includes('새 게임')) { 
      await btn.click();
      break; 
    }
  }
  await page.waitForTimeout(1500);
  
  console.log('1️⃣ 초기 상태\n');
  
  const initState = await page.evaluate(() => {
    const seedPanel = document.querySelector('#seed-panel');
    const seedOptions = document.querySelectorAll('#seed-panel .seed-option');
    
    return {
      seedPanelHTML: seedPanel?.innerHTML?.substring(0, 200),
      seedPanelDisplay: seedPanel ? window.getComputedStyle(seedPanel).display : 'not-found',
      seedOptionsCount: seedOptions.length,
      inventoryItems: window.InventorySystem?.items?.map(item => ({
        itemId: item.itemId,
        quantity: item.quantity,
      })),
      selectedSeed: window.InventorySystem?._selectedSeed,
    };
  });
  
  console.log('씨앗 패널:');
  console.log(`  Display: ${initState.seedPanelDisplay}`);
  console.log(`  HTML: ${initState.seedPanelHTML}`);
  console.log(`  옵션 개수: ${initState.seedOptionsCount}`);
  
  console.log('\n초기 인벤토리:');
  if (initState.inventoryItems) {
    initState.inventoryItems.forEach(item => {
      console.log(`  ${item.itemId} x${item.quantity}`);
    });
  }
  console.log(`\n선택된 씨앗: ${initState.selectedSeed || 'none'}`);
  
  // 씨앗 도구 선택
  console.log('\n2️⃣ 씨앗 도구 선택\n');
  
  const toolSlots = await page.locator('.tool-slot').all();
  if (toolSlots.length > 2) {
    await toolSlots[2].click(); // 씨앗
    console.log('✅ 씨앗 도구 선택');
    await page.waitForTimeout(400);
  }
  
  // 씨앗 패널 다시 확인
  console.log('\n3️⃣ 씨앗 도구 선택 후\n');
  
  const afterSelectState = await page.evaluate(() => {
    const seedPanel = document.querySelector('#seed-panel');
    const seedOptions = document.querySelectorAll('#seed-panel .seed-option');
    
    return {
      seedPanelDisplay: seedPanel ? window.getComputedStyle(seedPanel).display : 'not-found',
      seedOptionsCount: seedOptions.length,
      seedOptionsHTML: Array.from(seedOptions).map(opt => opt.outerHTML.substring(0, 100)),
      currentTool: window.HudUI?.getSelectedTool?.(),
      selectedSeedAfter: window.InventorySystem?._selectedSeed,
    };
  });
  
  console.log(`씨앗 패널 Display: ${afterSelectState.seedPanelDisplay}`);
  console.log(`옵션 개수: ${afterSelectState.seedOptionsCount}`);
  console.log(`현재 선택 도구: ${afterSelectState.currentTool}`);
  
  if (afterSelectState.seedOptionsCount > 0) {
    console.log('\n씨앗 옵션:');
    afterSelectState.seedOptionsHTML.forEach((html, i) => {
      console.log(`  ${i+1}. ${html}`);
    });
  } else {
    console.log('\n⚠️ 씨앗 옵션이 렌더링되지 않았습니다.');
  }
  
  // renderSeedPanel 함수 직접 호출
  console.log('\n4️⃣ renderSeedPanel 직접 호출\n');
  
  const directRender = await page.evaluate(() => {
    try {
      window.InventorySystem.renderSeedPanel(window.TimeSystem.currentSeason);
      return 'success';
    } catch (e) {
      return `error: ${e.message}`;
    }
  });
  
  console.log(`직접 호출 결과: ${directRender}`);
  await page.waitForTimeout(300);
  
  // 렌더링 후 다시 확인
  const afterRenderState = await page.evaluate(() => {
    const seedOptions = document.querySelectorAll('#seed-panel .seed-option');
    return {
      seedOptionsCount: seedOptions.length,
      seedOptionsHTML: Array.from(seedOptions).map(opt => opt.innerText),
    };
  });
  
  console.log(`\n렌더링 후 옵션 개수: ${afterRenderState.seedOptionsCount}`);
  if (afterRenderState.seedOptionsCount > 0) {
    console.log('옵션 목록:');
    afterRenderState.seedOptionsHTML.forEach((text, i) => {
      console.log(`  ${i+1}. ${text}`);
    });
  }
  
  // InventorySystem.getSeeds() 확인
  console.log('\n5️⃣ getSeeds() 함수\n');
  
  const seedsInfo = await page.evaluate(() => {
    const seeds = window.InventorySystem.getSeeds?.();
    return {
      getSeedsExists: typeof window.InventorySystem.getSeeds === 'function',
      seeds: seeds,
      seedsCount: seeds?.length || 0,
    };
  });
  
  console.log(`getSeeds 함수 존재: ${seedsInfo.getSeedsExists}`);
  console.log(`반환된 씨앗: ${seedsInfo.seedsCount}개`);
  if (seedsInfo.seeds) {
    seedsInfo.seeds.forEach((seed, i) => {
      console.log(`  ${i+1}. ${seed}`);
    });
  }
  
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
