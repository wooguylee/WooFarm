import { chromium } from 'playwright';
import path from 'path';

(async () => {
  console.log('=== 🌱 완전한 농업 순환 테스트 ===\n');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  
  const logs = [];
  page.on('console', msg => logs.push({ type: msg.type(), text: msg.text() }));
  
  await page.goto(`file://${path.resolve('./index.html')}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  // 새 게임
  console.log('1️⃣ 게임 시작\n');
  const buttons = await page.locator('button').all();
  for (const btn of buttons) {
    if ((await btn.textContent())?.includes('새 게임')) {
      await btn.click();
      break;
    }
  }
  await page.waitForTimeout(1500);
  
  // 타일 경작
  console.log('2️⃣ 경작 (괭이)\n');
  const toolSlots = await page.locator('.tool-slot').all();
  const tiles = await page.locator('.farm-tile').all();
  
  // 괭이 선택
  await toolSlots[0].click();
  console.log('  ✅ 괭이 선택');
  await page.waitForTimeout(200);
  
  // 타일 0, 1, 2 경작
  await tiles[0].click();
  await tiles[1].click();
  await tiles[2].click();
  console.log('  ✅ 타일 0, 1, 2 경작');
  await page.waitForTimeout(300);
  
  // 씨앗 선택
  console.log('\n3️⃣ 씨앗 심기\n');
  
  // 씨앗 도구 선택
  await toolSlots[2].click();
  console.log('  ✅ 씨앗 도구 선택');
  await page.waitForTimeout(400);
  
  // 씨앗 옵션 클릭
  const seedItems = await page.locator('#seed-list .seed-item').all();
  console.log(`  씨앗 옵션: ${seedItems.length}개`);
  
  if (seedItems.length > 0) {
    // 첫 번째 씨앗 선택
    await seedItems[0].click();
    console.log('  ✅ turnip_seed 선택됨');
    await page.waitForTimeout(300);
  }
  
  // 타일에 씨앗 심기
  const tiles2 = await page.locator('.farm-tile').all();
  await tiles2[0].click();
  console.log('  ✅ 타일 0에 씨앗 심음');
  await page.waitForTimeout(300);
  
  await tiles2[1].click();
  console.log('  ✅ 타일 1에 씨앗 심음');
  await page.waitForTimeout(300);
  
  // 물 주기
  console.log('\n4️⃣ 물 주기\n');
  
  await toolSlots[1].click();
  console.log('  ✅ 물뿌리개 선택');
  await page.waitForTimeout(200);
  
  const tiles3 = await page.locator('.farm-tile').all();
  await tiles3[0].click();
  await tiles3[1].click();
  console.log('  ✅ 타일 0, 1에 물 주음');
  await page.waitForTimeout(300);
  
  // 타일 상태 확인
  console.log('\n5️⃣ 현재 타일 상태\n');
  
  const tileStates = await page.evaluate(() => {
    const states = [];
    for (let i = 0; i < 3; i++) {
      const tile = window.FarmSystem.grid[i];
      states.push({
        index: i,
        state: tile?.state,
        crop: tile?.crop,
        growth: tile?.growthStage,
      });
    }
    return states;
  });
  
  tileStates.forEach(t => {
    if (t.crop) {
      console.log(`  타일 ${t.index}: ✅ ${t.crop}이 심어짐 (${t.state}, growth=${t.growth})`);
    } else {
      console.log(`  타일 ${t.index}: ❌ 씨앗 없음 (${t.state})`);
    }
  });
  
  // 시간 경과
  console.log('\n6️⃣ 시간 경과\n');
  
  for (let i = 0; i < 10; i++) {
    await page.evaluate(() => {
      window.TimeSystem.tick();
    });
    await page.waitForTimeout(50);
  }
  
  console.log('  ⏱️ 10시간 경과');
  
  // 성장 상태 확인
  const growthStates = await page.evaluate(() => {
    const states = [];
    for (let i = 0; i < 3; i++) {
      const tile = window.FarmSystem.grid[i];
      states.push({
        index: i,
        crop: tile?.crop,
        growth: tile?.growthStage,
        progress: tile?.growthProgress,
      });
    }
    return states;
  });
  
  console.log('\n7️⃣ 성장 상태\n');
  
  growthStates.forEach(t => {
    if (t.crop) {
      console.log(`  타일 ${t.index}: ${t.crop} growth=${t.growth}, progress=${t.progress}%`);
    }
  });
  
  // 수확
  console.log('\n8️⃣ 수확\n');
  
  // 성숙도 강제 설정
  await page.evaluate(() => {
    for (let i = 0; i < 2; i++) {
      if (window.FarmSystem.grid[i].crop) {
        window.FarmSystem.grid[i].growthProgress = 100;
      }
    }
  });
  
  // 수확 도구 선택
  const toolSlots2 = await page.locator('.tool-slot').all();
  await toolSlots2[3].click();
  console.log('  ✅ 수확 도구 선택');
  await page.waitForTimeout(200);
  
  // 타일 클릭해서 수확
  const tiles4 = await page.locator('.farm-tile').all();
  await tiles4[0].click();
  console.log('  ✅ 타일 0 수확');
  await page.waitForTimeout(200);
  
  await tiles4[1].click();
  console.log('  ✅ 타일 1 수확');
  await page.waitForTimeout(300);
  
  // 최종 인벤토리
  console.log('\n9️⃣ 최종 인벤토리\n');
  
  const finalInv = await page.evaluate(() => {
    return window.InventorySystem.items.map(item => ({
      itemId: item.itemId,
      quantity: item.quantity,
    }));
  });
  
  console.log('인벤토리:');
  finalInv.forEach(item => {
    console.log(`  ✓ ${item.itemId} x${item.quantity}`);
  });
  
  // 에러 확인
  console.log('\n🔟 최종 상태\n');
  
  const errors = logs.filter(l => l.type === 'error');
  console.log(`에러: ${errors.length}개`);
  
  if (finalInv.some(i => i.itemId === 'turnip')) {
    console.log('✅ 순무(turnip) 수확 성공!');
  }
  
  console.log('\n=== 테스트 완료 ===\n');
  
  await browser.close();
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
