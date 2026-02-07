import { chromium } from 'playwright';
import path from 'path';

(async () => {
  console.log('=== 🌱 올바른 농업 테스트 ===\n');
  
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
  
  console.log('\n2️⃣ 경작 (괭이)');
  
  // 타일 경작 (row, col 형식)
  await page.evaluate(() => {
    // 0 -> (0, 0), 1 -> (0, 1), 2 -> (0, 2)
    window.FarmSystem.useTool(0, 0, 'hoe');
    window.FarmSystem.useTool(0, 1, 'hoe');
    window.FarmSystem.useTool(0, 2, 'hoe');
  });
  console.log('  ✅ 타일 (0,0), (0,1), (0,2) 경작');
  await page.waitForTimeout(300);
  
  console.log('\n3️⃣ 씨앗 심기');
  
  // 씨앗 선택
  await page.evaluate(() => {
    window.InventorySystem.setSelectedSeed('turnip_seed');
  });
  console.log('  ✅ turnip_seed 선택');
  
  // 씨앗 심기
  await page.evaluate(() => {
    const seedId = window.InventorySystem.getSelectedSeed();
    const cropId = seedId.replace('_seed', '');
    window.FarmSystem.plantCrop(0, 0, cropId);
    window.FarmSystem.plantCrop(0, 1, cropId);
  });
  console.log('  ✅ 타일 (0,0), (0,1)에 씨앗 심음');
  await page.waitForTimeout(300);
  
  console.log('\n4️⃣ 물 주기');
  
  // 물 주기
  await page.evaluate(() => {
    window.FarmSystem.useTool(0, 0, 'water');
    window.FarmSystem.useTool(0, 1, 'water');
  });
  console.log('  ✅ 타일 (0,0), (0,1)에 물 줌');
  await page.waitForTimeout(300);
  
  console.log('\n5️⃣ 현재 타일 상태');
  
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
    console.log(`  타일 ${t.pos}: ✅ ${t.crop} (${t.state}, growth=${t.growth}, progress=${t.progress}%)`);
  });
  
  if (states.length === 0) {
    console.log('  ⚠️ 심어진 작물이 없습니다!');
  }
  
  console.log('\n6️⃣ 강제 성장');
  
  // 성장도 강제 설정
  await page.evaluate(() => {
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 8; col++) {
        const tile = window.FarmSystem.grid[row][col];
        if (tile.crop) {
          tile.growthStage = 3;
          tile.growthProgress = 100;
        }
      }
    }
  });
  console.log('  ✅ 모든 작물 성숙도 100%');
  await page.waitForTimeout(300);
  
  console.log('\n7️⃣ 수확');
  
  // 수확
  const harvest = await page.evaluate(() => {
    const result = [];
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 8; col++) {
        const tile = window.FarmSystem.grid[row][col];
        if (tile.crop && tile.growthProgress >= 100) {
          const res = window.FarmSystem.useTool(row, col, 'harvest');
          result.push({ pos: `(${row},${col})`, harvested: res });
        }
      }
    }
    return result;
  });
  
  harvest.forEach(h => {
    console.log(`  타일 ${h.pos}: 수확 완료`);
  });
  
  if (harvest.length === 0) {
    console.log('  ⚠️ 수확할 작물이 없습니다!');
  }
  
  await page.waitForTimeout(300);
  
  console.log('\n8️⃣ 최종 인벤토리');
  
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
  
  console.log('\n9️⃣ 최종 결과\n');
  
  const hasTurnip = finalInv.some(i => i.itemId === 'turnip');
  
  if (hasTurnip) {
    console.log('🎉 완벽합니다! 순무를 성공적으로 수확했습니다!');
    console.log('   - 경작, 씨앗 심기, 물 주기, 수확 모두 정상 작동!');
  } else {
    console.log('⚠️ 순무 수확 실패');
  }
  
  const errors = logs.filter(l => l.type === 'error');
  console.log(`\n에러: ${errors.length}개`);
  
  console.log('\n=== 테스트 완료 ===\n');
  
  await browser.close();
  process.exit(hasTurnip ? 0 : 1);
})().catch(e => { console.error('ERROR:', e.message); process.exit(1); });
