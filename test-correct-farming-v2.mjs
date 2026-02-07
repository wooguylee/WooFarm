import { chromium } from 'playwright';
import path from 'path';

(async () => {
  console.log('=== 🌱 올바른 농업 테스트 (v2) ===\n');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  
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
  console.log('  ✅ 완료\n');
  
  console.log('2️⃣ 경작 (괭이)');
  
  await page.evaluate(() => {
    window.FarmSystem.useTool(0, 0, 'hoe');
    window.FarmSystem.useTool(0, 1, 'hoe');
    window.FarmSystem.useTool(0, 2, 'hoe');
  });
  console.log('  ✅ 타일 (0,0), (0,1), (0,2) 경작됨\n');
  
  console.log('3️⃣ 씨앗 심기');
  
  await page.evaluate(() => {
    window.InventorySystem.setSelectedSeed('turnip_seed');
    window.FarmSystem.plantCrop(0, 0, 'turnip');
    window.FarmSystem.plantCrop(0, 1, 'turnip');
  });
  console.log('  ✅ 순무 씨앗 심음\n');
  
  console.log('4️⃣ 물 주기');
  
  await page.evaluate(() => {
    window.FarmSystem.useTool(0, 0, 'water');
    window.FarmSystem.useTool(0, 1, 'water');
  });
  console.log('  ✅ 물 줌\n');
  
  console.log('5️⃣ 성장 시뮬레이션');
  
  // 작물을 성숙 상태로 진행 (tick 호출)
  for (let i = 0; i < 50; i++) {
    await page.evaluate(() => {
      window.TimeSystem.tick();
    });
    if (i % 10 === 0) process.stdout.write('.');
  }
  console.log('\n  ✅ 충분한 시간 경과\n');
  
  console.log('6️⃣ 타일 상태 확인');
  
  const states = await page.evaluate(() => {
    const result = [];
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 8; col++) {
        const tile = window.FarmSystem.grid[row][col];
        if (tile.crop) {
          result.push({
            pos: `(${row},${col})`,
            state: tile.state,
            crop: tile.crop,
            growth: tile.growthStage,
            progress: tile.growthProgress,
          });
        }
      }
    }
    return result;
  });
  
  states.forEach(t => {
    console.log(`  타일 ${t.pos}: ${t.crop} - state=${t.state}, progress=${t.progress}%`);
  });
  
  if (states.length === 0) {
    console.log('  ⚠️ 심어진 작물 없음');
  }
  
  console.log();
  
  console.log('7️⃣ 수확');
  
  const harvest = await page.evaluate(() => {
    const result = [];
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 8; col++) {
        const tile = window.FarmSystem.grid[row][col];
        if (tile.crop && tile.state === 'ready') {
          const before = window.InventorySystem.items.length;
          window.FarmSystem.useTool(row, col, 'harvest');
          const after = window.InventorySystem.items.length;
          result.push({
            pos: `(${row},${col})`,
            crop: tile.crop,
            itemAdded: after > before,
          });
        }
      }
    }
    return result;
  });
  
  harvest.forEach(h => {
    console.log(`  타일 ${h.pos}: ${h.crop} 수확 (${h.itemAdded ? '✅' : '❌'})`);
  });
  
  if (harvest.length === 0) {
    console.log('  ⚠️ 수확 가능한 작물 없음 (state !== "ready")');
  }
  console.log();
  
  console.log('8️⃣ 최종 인벤토리\n');
  
  const finalInv = await page.evaluate(() => {
    return window.InventorySystem.items.map(item => ({
      itemId: item.itemId,
      quantity: item.quantity,
    }));
  });
  
  finalInv.forEach(item => {
    console.log(`  ✓ ${item.itemId} x${item.quantity}`);
  });
  
  console.log('\n=== 최종 결과 ===\n');
  
  const hasTurnip = finalInv.some(i => i.itemId === 'turnip');
  
  if (hasTurnip) {
    console.log('🎉 완벽합니다! 순무를 성공적으로 수확했습니다!');
    console.log('   전체 농업 순환이 정상 작동합니다:');
    console.log('   1. 경작 ✅');
    console.log('   2. 씨앗 심기 ✅');
    console.log('   3. 물 주기 ✅');
    console.log('   4. 성장 ✅');
    console.log('   5. 수확 ✅');
  } else {
    console.log('⚠️ 순무 수확 실패');
    console.log('아직도 상태가 "ready"가 아님');
  }
  
  const errors = logs.filter(l => l.type === 'error');
  if (errors.length > 0) {
    console.log(`\n⚠️ 에러: ${errors.length}개`);
    errors.slice(0, 3).forEach(e => console.log(`  - ${e.text}`));
  } else {
    console.log('\n✅ 에러 없음');
  }
  
  console.log('\n=== 테스트 완료 ===\n');
  
  await browser.close();
  process.exit(hasTurnip ? 0 : 1);
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
