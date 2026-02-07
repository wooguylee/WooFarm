import { chromium } from 'playwright';
import path from 'path';

(async () => {
  console.log('=== 🌱 씨앗 심기 상세 테스트 ===\n');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const logs = [];
  page.on('console', msg => logs.push({ type: msg.type(), text: msg.text() }));
  
  await page.goto(`file://${path.resolve('./index.html')}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  // 새 게임 시작
  console.log('1️⃣ 게임 시작\n');
  const buttons = await page.locator('button').all();
  for (const btn of buttons) {
    const text = await btn.textContent();
    if (text?.includes('새 게임')) { 
      await btn.click();
      console.log('  ✅ 새 게임 클릭');
      break; 
    }
  }
  await page.waitForTimeout(1500);
  
  // 2. 현재 인벤토리 확인
  console.log('\n2️⃣ 초기 인벤토리 확인\n');
  const invItems = await page.evaluate(() => {
    return {
      items: window.InventorySystem?.items || [],
      itemCount: window.InventorySystem?.items?.length || 0,
    };
  });
  console.log(`  인벤토리 아이템: ${invItems.itemCount}개`);
  
  // 3. 경작 (Hoe)
  console.log('\n3️⃣ 경작 (괭이)\n');
  const toolSlots = await page.locator('.tool-slot').all();
  console.log(`  도구 슬롯: ${toolSlots.length}개`);
  
  if (toolSlots.length > 0) {
    await toolSlots[0].click(); // 괭이 선택
    console.log('  ✅ 괭이 선택');
    await page.waitForTimeout(300);
    
    // 첫 번째 타일 경작
    const tiles = await page.locator('.farm-tile').all();
    if (tiles.length > 0) {
      await tiles[0].click();
      console.log('  ✅ 타일 0 경작');
      await page.waitForTimeout(300);
    }
  }
  
  // 4. 씨앗 선택
  console.log('\n4️⃣ 씨앗 도구 선택\n');
  if (toolSlots.length > 2) {
    await toolSlots[2].click(); // 씨앗 선택
    console.log('  ✅ 씨앗 도구 선택');
    await page.waitForTimeout(400);
    
    // 씨앗 패널 확인
    const seedPanel = await page.locator('#seed-panel').isVisible().catch(() => false);
    console.log(`  씨앗 패널 표시: ${seedPanel ? '✅' : '❌'}`);
    
    if (seedPanel) {
      // 씨앗 옵션 확인
      const seedOptions = await page.locator('#seed-panel .seed-option').all();
      console.log(`  씨앗 옵션: ${seedOptions.length}개`);
      
      if (seedOptions.length > 0) {
        // 첫 번째 씨앗 선택
        await seedOptions[0].click();
        console.log('  ✅ 첫 번째 씨앗 선택');
        await page.waitForTimeout(300);
        
        // 선택된 씨앗 정보
        const selectedInfo = await page.evaluate(() => {
          return {
            selectedSeed: window.HudUI?.getSelectedTool?.(),
            seedInSystem: window.InventorySystem?._selectedSeed,
          };
        });
        console.log(`  선택된 도구: ${selectedInfo.selectedSeed}`);
        console.log(`  선택된 씨앗: ${selectedInfo.seedInSystem}`);
      }
    }
  }
  
  // 5. 씨앗 심기
  console.log('\n5️⃣ 씨앗 심기\n');
  const tiles = await page.locator('.farm-tile').all();
  console.log(`  클릭할 타일: ${tiles.length}개 중 타일 1`);
  
  if (tiles.length > 1) {
    await tiles[1].click();
    console.log('  ✅ 타일 1 클릭 (씨앗 심기)');
    await page.waitForTimeout(500);
    
    // 타일 상태 확인
    const tileState = await page.evaluate(() => {
      const tile = document.querySelectorAll('.farm-tile')[1];
      return {
        className: tile?.className,
        hasContent: tile?.innerHTML?.length > 0,
        tileInfo: window.FarmSystem?.grid?.[1],
      };
    });
    
    console.log(`  타일 클래스: ${tileState.className}`);
    console.log(`  타일 콘텐츠: ${tileState.hasContent ? '✅' : '❌'}`);
    console.log(`  FarmSystem 상태: ${JSON.stringify(tileState.tileInfo)}`);
  }
  
  // 6. 물 주기
  console.log('\n6️⃣ 물 주기 (watering can)\n');
  if (toolSlots.length > 1) {
    await toolSlots[1].click(); // 물뿌리개 선택
    console.log('  ✅ 물뿌리개 선택');
    await page.waitForTimeout(300);
    
    // 심은 타일에 물 주기
    const tiles = await page.locator('.farm-tile').all();
    if (tiles.length > 1) {
      await tiles[1].click();
      console.log('  ✅ 타일 1에 물 주기');
      await page.waitForTimeout(300);
    }
  }
  
  // 7. 시간 경과 (게임 내 시간 진행)
  console.log('\n7️⃣ 시간 경과\n');
  
  // 다음 날로 진행
  await page.keyboard.press('Escape'); // 설정 열기
  await page.waitForTimeout(400);
  
  const nextDayBtn = await page.locator('#btn-next-day, button:has-text("다음 날")').first();
  if (await nextDayBtn.isVisible().catch(() => false)) {
    await nextDayBtn.click();
    console.log('  ✅ 다음 날 버튼 클릭');
    await page.waitForTimeout(1000);
  }
  
  // 8. 작물 성장 확인
  console.log('\n8️⃣ 작물 성장 상태\n');
  
  const cropState = await page.evaluate(() => {
    const tile = window.FarmSystem?.grid?.[1];
    return {
      tileState: tile?.state,
      cropId: tile?.crop,
      cropGrowth: tile?.growth,
    };
  });
  
  console.log(`  타일 상태: ${cropState.tileState}`);
  console.log(`  작물 ID: ${cropState.cropId}`);
  console.log(`  성장 정도: ${cropState.cropGrowth}`);
  
  // 9. 수확
  console.log('\n9️⃣ 수확\n');
  
  if (toolSlots.length > 3) {
    await toolSlots[3].click(); // 수확 도구 선택
    console.log('  ✅ 수확 도구 선택');
    await page.waitForTimeout(300);
    
    const tiles = await page.locator('.farm-tile').all();
    if (tiles.length > 1) {
      // 여러 번 클릭해서 성숙도가 높아질 때까지
      for (let i = 0; i < 5; i++) {
        await tiles[1].click();
        await page.waitForTimeout(200);
      }
      console.log('  ✅ 수확 시도 (5회)');
    }
  }
  
  // 10. 인벤토리에 아이템 추가되었는지 확인
  console.log('\n🔟 최종 인벤토리\n');
  await page.keyboard.press('i');
  await page.waitForTimeout(500);
  
  const finalInv = await page.evaluate(() => {
    return {
      itemCount: window.InventorySystem?.items?.length || 0,
      items: window.InventorySystem?.items?.map(item => ({
        itemId: item.itemId,
        quantity: item.quantity,
      })) || [],
    };
  });
  
  console.log(`  최종 아이템 수: ${finalInv.itemCount}개`);
  if (finalInv.items.length > 0) {
    console.log('  📦 인벤토리 아이템:');
    finalInv.items.slice(0, 5).forEach((item, i) => {
      console.log(`     ${i+1}. ${item.itemId} x${item.quantity}`);
    });
  }
  
  // 11. 콘솔 에러 확인
  console.log('\n1️⃣1️⃣ 콘솔 상태\n');
  const errors = logs.filter(l => l.type === 'error');
  const warnings = logs.filter(l => l.type === 'warn');
  
  console.log(`  에러: ${errors.length}개`);
  console.log(`  경고: ${warnings.length}개`);
  
  if (errors.length > 0) {
    console.log('  ⚠️ 에러 로그:');
    errors.slice(0, 3).forEach((log, i) => {
      console.log(`     ${i+1}. ${log.text}`);
    });
  }
  
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
