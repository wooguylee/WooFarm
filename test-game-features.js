const { chromium } = require('playwright');
const path = require('path');

(async () => {
  console.log('=== ✨ WooFarm 기능 통합 테스트 ===\n');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const filePath = `file://${path.resolve('./index.html')}`;
  
  await page.goto(filePath, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  let testsPassed = 0;
  let testsFailed = 0;
  
  const test = async (name, fn) => {
    try {
      await fn();
      console.log(`✅ ${name}`);
      testsPassed++;
    } catch (e) {
      console.log(`❌ ${name}`);
      console.log(`   에러: ${e.message}`);
      testsFailed++;
    }
  };
  
  // 1. 게임 시작
  console.log('=== 1️⃣ 게임 시작 ===\n');
  
  await test('새 게임 버튼 클릭', async () => {
    const buttons = await page.locator('button').all();
    let clicked = false;
    for (const btn of buttons) {
      const text = await btn.textContent();
      if (text && text.includes('새 게임')) {
        await btn.click();
        clicked = true;
        break;
      }
    }
    if (!clicked) throw new Error('버튼을 찾지 못함');
    
    await page.waitForTimeout(1500);
    
    const gameScreen = await page.evaluate(() => window.Game?.currentScreen === 'game');
    if (!gameScreen) throw new Error('게임 화면으로 전환 안됨');
  });
  
  // 2. 농장 시스템
  console.log('\n=== 2️⃣ 농장 시스템 ===\n');
  
  await test('농장 타일 렌더링', async () => {
    const tileCount = await page.locator('.farm-tile').count();
    if (tileCount !== 48) throw new Error(`타일 개수: ${tileCount} (예상: 48)`);
  });
  
  await test('타일 클릭', async () => {
    const tiles = await page.locator('.farm-tile').all();
    if (tiles.length === 0) throw new Error('타일 없음');
    await tiles[0].click();
  });
  
  await test('도구 선택', async () => {
    const toolButtons = await page.locator('.tool-btn').all();
    if (toolButtons.length === 0) throw new Error('도구 버튼 없음');
    await toolButtons[0].click();
  });
  
  // 3. HUD 표시
  console.log('\n=== 3️⃣ HUD 표시 ===\n');
  
  await test('HUD 요소 렌더링', async () => {
    const hudVisible = await page.locator('#hud').isVisible();
    if (!hudVisible) throw new Error('HUD가 보이지 않음');
  });
  
  await test('날짜/시간 정보', async () => {
    const dayDisplay = await page.locator('#hud-day').textContent();
    if (!dayDisplay) throw new Error('날짜 표시가 없음');
  });
  
  await test('골드 표시', async () => {
    const goldDisplay = await page.locator('.hud-gold').textContent();
    if (!goldDisplay) throw new Error('골드 표시가 없음');
  });
  
  // 4. 인벤토리
  console.log('\n=== 4️⃣ 인벤토리 ===\n');
  
  await test('인벤토리 모달 열기', async () => {
    const btn = await page.locator('#btn-inventory');
    if (!await btn.isVisible()) throw new Error('인벤토리 버튼이 보이지 않음');
    await btn.click();
    await page.waitForTimeout(500);
    
    const modal = await page.locator('#inventory-modal').isVisible();
    if (!modal) throw new Error('인벤토리 모달이 열리지 않음');
  });
  
  await test('인벤토리 모달 닫기', async () => {
    const closeBtn = await page.locator('#inventory-modal .modal-close');
    if (await closeBtn.count() === 0) throw new Error('닫기 버튼 없음');
    await closeBtn.first().click();
    await page.waitForTimeout(300);
  });
  
  // 5. 상점
  console.log('\n=== 5️⃣ 상점 ===\n');
  
  await test('상점 모달 열기', async () => {
    const btn = await page.locator('#btn-shop');
    if (!await btn.isVisible()) throw new Error('상점 버튼이 보이지 않음');
    await btn.click();
    await page.waitForTimeout(500);
    
    const modal = await page.locator('#shop-modal').isVisible();
    if (!modal) throw new Error('상점 모달이 열리지 않음');
  });
  
  await test('상점 모달 닫기', async () => {
    const closeBtn = await page.locator('#shop-modal .modal-close');
    if (await closeBtn.count() === 0) throw new Error('닫기 버튼 없음');
    await closeBtn.first().click();
    await page.waitForTimeout(300);
  });
  
  // 6. 퀘스트
  console.log('\n=== 6️⃣ 퀘스트 ===\n');
  
  await test('퀘스트 모달 열기', async () => {
    const btn = await page.locator('#btn-quest-log');
    if (!await btn.isVisible()) throw new Error('퀘스트 버튼이 보이지 않음');
    await btn.click();
    await page.waitForTimeout(500);
    
    const modal = await page.locator('#quest-modal').isVisible();
    if (!modal) throw new Error('퀘스트 모달이 열리지 않음');
  });
  
  await test('퀘스트 모달 닫기', async () => {
    const closeBtn = await page.locator('#quest-modal .modal-close');
    if (await closeBtn.count() === 0) throw new Error('닫기 버튼 없음');
    await closeBtn.first().click();
    await page.waitForTimeout(300);
  });
  
  // 7. 동물
  console.log('\n=== 7️⃣ 동물 관리 ===\n');
  
  await test('동물 모달 열기', async () => {
    const btn = await page.locator('#btn-animals');
    if (!await btn.isVisible()) throw new Error('동물 버튼이 보이지 않음');
    await btn.click();
    await page.waitForTimeout(500);
    
    const modal = await page.locator('#animal-modal').isVisible();
    if (!modal) throw new Error('동물 모달이 열리지 않음');
  });
  
  await test('동물 모달 닫기', async () => {
    const closeBtn = await page.locator('#animal-modal .modal-close');
    if (await closeBtn.count() === 0) throw new Error('닫기 버튼 없음');
    await closeBtn.first().click();
    await page.waitForTimeout(300);
  });
  
  // 8. 키보드 단축키
  console.log('\n=== 8️⃣ 키보드 단축키 ===\n');
  
  await test('I 키 (인벤토리)', async () => {
    await page.keyboard.press('i');
    await page.waitForTimeout(300);
    const invVisible = await page.locator('#inventory-modal').isVisible();
    if (!invVisible) throw new Error('인벤토리가 열리지 않음');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  });
  
  await test('S 키 (상점)', async () => {
    await page.keyboard.press('s');
    await page.waitForTimeout(300);
    const shopVisible = await page.locator('#shop-modal').isVisible();
    if (!shopVisible) throw new Error('상점이 열리지 않음');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  });
  
  // 9. 시스템
  console.log('\n=== 9️⃣ 게임 시스템 ===\n');
  
  await test('TimeSystem 작동', async () => {
    const timeInfo = await page.evaluate(() => {
      return {
        hour: window.TimeSystem?.currentHour,
        day: window.TimeSystem?.currentDay,
        season: window.TimeSystem?.currentSeason,
      };
    });
    if (timeInfo.hour === undefined) throw new Error('시간 정보 없음');
    if (timeInfo.day === undefined) throw new Error('날짜 정보 없음');
    if (!timeInfo.season) throw new Error('계절 정보 없음');
  });
  
  await test('FarmSystem 초기화', async () => {
    const farmInfo = await page.evaluate(() => {
      return {
        gridExists: !!window.FarmSystem?.grid,
        gridSize: window.FarmSystem?.grid?.length || 0,
      };
    });
    if (farmInfo.gridSize === 0) throw new Error('농장 그리드가 없음');
  });
  
  await test('InventorySystem 초기화', async () => {
    const invInfo = await page.evaluate(() => {
      return {
        itemsCount: window.InventorySystem?.items?.length || 0,
        gold: window.InventorySystem?._gold || 0,
      };
    });
  });
  
  // 10. 콘솔
  console.log('\n=== 🔟 콘솔 상태 ===\n');
  
  const logs = [];
  const errors = [];
  
  page.on('console', msg => logs.push(msg.text()));
  page.on('pageerror', error => errors.push(error.toString()));
  
  await page.waitForTimeout(2000);
  
  await test('JavaScript 에러 없음', async () => {
    if (errors.length > 0) {
      throw new Error(`${errors.length}개의 에러 발견: ${errors[0]}`);
    }
  });
  
  // 결과
  console.log('\n=== 📊 테스트 결과 ===\n');
  console.log(`✅ 통과: ${testsPassed}`);
  console.log(`❌ 실패: ${testsFailed}`);
  console.log(`📈 성공률: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);
  
  await browser.close();
  
  console.log('\n=== 테스트 완료 ===\n');
})();
