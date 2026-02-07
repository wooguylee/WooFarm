import { chromium } from 'playwright';
import path from 'path';

(async () => {
  console.log('=== 🌱 농업 테스트 (직접 호출) ===\n');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  
  const logs = [];
  page.on('console', msg => logs.push({ type: msg.type(), text: msg.text() }));
  
  await page.goto(`file://${path.resolve('./index.html')}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  // 새 게임
  console.log('1️⃣ 게임 시작');
  const buttons = await page.locator('button').all();
  for (const btn of buttons) {
    if ((await btn.textContent())?.includes('새 게임')) {
      await btn.click();
      break;
    }
  }
  await page.waitForTimeout(1500);
  
  console.log('\n2️⃣ 경작 (괭이)');
  
  // 직접 JavaScript로 처리
  await page.evaluate(() => {
    // 타일 경작
    window.FarmSystem.useTool('hoe', 0);
    window.FarmSystem.useTool('hoe', 1);
    window.FarmSystem.useTool('hoe', 2);
    console.log('[TEST] 경작 완료');
  });
  console.log('  ✅ 타일 0, 1, 2 경작');
  await page.waitForTimeout(300);
  
  console.log('\n3️⃣ 씨앗 심기');
  
  // 씨앗 선택
  await page.evaluate(() => {
    window.InventorySystem.setSelectedSeed('turnip_seed');
    console.log('[TEST] turnip_seed 선택됨');
  });
  console.log('  ✅ turnip_seed 선택');
  await page.waitForTimeout(200);
  
  // 씨앗 심기
  await page.evaluate(() => {
    window.FarmSystem.useTool('seed', 0);
    window.FarmSystem.useTool('seed', 1);
    console.log('[TEST] 씨앗 심기 완료');
  });
  console.log('  ✅ 타일 0, 1에 씨앗 심음');
  await page.waitForTimeout(300);
  
  console.log('\n4️⃣ 물 주기');
  
  // 물 주기
  await page.evaluate(() => {
    window.FarmSystem.useTool('water', 0);
    window.FarmSystem.useTool('water', 1);
    console.log('[TEST] 물 주기 완료');
  });
  console.log('  ✅ 타일 0, 1에 물 줌');
  await page.waitForTimeout(300);
  
  console.log('\n5️⃣ 현재 타일 상태');
  
  const states = await page.evaluate(() => {
    const result = [];
    for (let i = 0; i < 3; i++) {
      const tile = window.FarmSystem.grid[i];
      result.push({
        index: i,
        state: tile.state,
        crop: tile.crop,
        growthStage: tile.growthStage,
        growthProgress: tile.growthProgress,
      });
    }
    return result;
  });
  
  states.forEach(t => {
    if (t.crop) {
      console.log(`  타일 ${t.index}: ✅ ${t.crop} (stage=${t.growthStage}, progress=${t.growthProgress}%)`);
    } else {
      console.log(`  타일 ${t.index}: state=${t.state}`);
    }
  });
  
  console.log('\n6️⃣ 성장 강제 진행');
  
  // 성장도를 100으로 설정
  await page.evaluate(() => {
    for (let i = 0; i < 2; i++) {
      if (window.FarmSystem.grid[i].crop) {
        window.FarmSystem.grid[i].growthProgress = 100;
      }
    }
    console.log('[TEST] 성장도 100% 설정');
  });
  console.log('  ✅ 성장도 100% 설정');
  await page.waitForTimeout(300);
  
  console.log('\n7️⃣ 수확');
  
  // 수확
  await page.evaluate(() => {
    const result = [];
    result.push(window.FarmSystem.useTool('harvest', 0));
    result.push(window.FarmSystem.useTool('harvest', 1));
    console.log('[TEST] 수확 결과:', result);
  });
  console.log('  ✅ 타일 0, 1 수확');
  await page.waitForTimeout(300);
  
  console.log('\n8️⃣ 최종 인벤토리');
  
  const finalInv = await page.evaluate(() => {
    return window.InventorySystem.items.map(item => ({
      itemId: item.itemId,
      quantity: item.quantity,
    }));
  });
  
  console.log('인벤토리 아이템:');
  finalInv.forEach(item => {
    console.log(`  ✓ ${item.itemId} x${item.quantity}`);
  });
  
  // 검증
  const hasTurnip = finalInv.some(i => i.itemId === 'turnip');
  
  console.log('\n9️⃣ 최종 결과\n');
  
  if (hasTurnip) {
    console.log('🎉 완벽합니다! 순무를 성공적으로 수확했습니다!');
  } else {
    console.log('⚠️ 순무 수확 실패');
  }
  
  const errors = logs.filter(l => l.type === 'error');
  if (errors.length > 0) {
    console.log(`\n⚠️ 에러: ${errors.length}개`);
    errors.slice(0, 3).forEach(e => console.log(`  ${e.text}`));
  } else {
    console.log('✅ 에러 없음');
  }
  
  console.log('\n=== 테스트 완료 ===\n');
  
  await browser.close();
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
