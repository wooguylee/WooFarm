const { chromium } = require('playwright');
const path = require('path');

(async () => {
  console.log('=== 🎮 WooFarm 게임 상세 테스트 ===\n');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // 모든 콘솔 메시지 및 에러 캡처
  const logs = [];
  const errors = [];
  
  page.on('console', msg => {
    logs.push({ type: msg.type(), text: msg.text(), args: msg.args() });
  });
  
  page.on('pageerror', error => {
    errors.push(error.toString());
  });
  
  const filePath = `file://${path.resolve('./index.html')}`;
  console.log(`📂 파일: ${filePath}\n`);
  
  try {
    await page.goto(filePath, { waitUntil: 'networkidle' });
    console.log('✅ 페이지 로드 완료\n');
    
    await page.waitForTimeout(3000);
    
    // ===== 게임 상태 확인 =====
    console.log('=== 📊 게임 상태 확인 ===\n');
    
    // 게임 객체 확인
    const gameExists = await page.evaluate(() => typeof window.Game !== 'undefined');
    console.log(`Game 객체: ${gameExists ? '✅' : '❌'}`);
    
    const timeSystemExists = await page.evaluate(() => typeof window.TimeSystem !== 'undefined');
    console.log(`TimeSystem: ${timeSystemExists ? '✅' : '❌'}`);
    
    const farmSystemExists = await page.evaluate(() => typeof window.FarmSystem !== 'undefined');
    console.log(`FarmSystem: ${farmSystemExists ? '✅' : '❌'}`);
    
    const inventoryExists = await page.evaluate(() => typeof window.InventorySystem !== 'undefined');
    console.log(`InventorySystem: ${inventoryExists ? '✅' : '❌'}`);
    
    // ===== HUD 요소 확인 =====
    console.log('\n=== 🖼️ HUD 요소 ===\n');
    
    const hudElements = {
      'HUD': await page.locator('#hud').isVisible().catch(() => false),
      '날짜 표시': await page.locator('#hud-day').isVisible().catch(() => false),
      '시간 표시': await page.locator('#hud-time').isVisible().catch(() => false),
      '계절 표시': await page.locator('#hud-season').isVisible().catch(() => false),
      '날씨 표시': await page.locator('#hud-weather').isVisible().catch(() => false),
      '골드 표시': await page.locator('.hud-gold').isVisible().catch(() => false),
      '레벨 표시': await page.locator('.hud-level').isVisible().catch(() => false),
    };
    
    for (const [name, visible] of Object.entries(hudElements)) {
      console.log(`  ${name}: ${visible ? '✅' : '❌'}`);
    }
    
    // ===== 게임 화면 요소 =====
    console.log('\n=== 🎯 게임 화면 요소 ===\n');
    
    const gameElements = {
      '게임 화면': await page.locator('#game-screen').isVisible().catch(() => false),
      '농장 그리드': await page.locator('#farm-grid').isVisible().catch(() => false),
      '도구바': await page.locator('.toolbar').isVisible().catch(() => false),
      '씨앗 패널': await page.locator('#seed-panel').isVisible().catch(() => false),
    };
    
    for (const [name, visible] of Object.entries(gameElements)) {
      console.log(`  ${name}: ${visible ? '✅' : '❌'}`);
    }
    
    // ===== 타일 정보 =====
    console.log('\n=== 🌾 농장 타일 ===\n');
    
    const tileCount = await page.locator('.farm-tile').count();
    console.log(`  타일 개수: ${tileCount} (6x8 = 48개)`);
    
    if (tileCount === 48) {
      console.log(`  타일 배치: ✅`);
    } else {
      console.log(`  타일 배치: ❌ (예상: 48, 실제: ${tileCount})`);
    }
    
    // ===== 버튼 및 UI 요소 =====
    console.log('\n=== 🔘 UI 버튼 ===\n');
    
    const buttons = {
      '인벤토리': await page.locator('#btn-inventory').isVisible().catch(() => false),
      '상점': await page.locator('#btn-shop').isVisible().catch(() => false),
      '퀘스트': await page.locator('#btn-quest-log').isVisible().catch(() => false),
      '동물': await page.locator('#btn-animals').isVisible().catch(() => false),
    };
    
    for (const [name, visible] of Object.entries(buttons)) {
      console.log(`  ${name}: ${visible ? '✅' : '❌'}`);
    }
    
    // ===== 도구 선택 테스트 =====
    console.log('\n=== 🛠️ 도구 선택 ===\n');
    
    const toolButtons = await page.locator('.tool-btn').all();
    console.log(`  도구 버튼 개수: ${toolButtons.length}`);
    
    if (toolButtons.length > 0) {
      await toolButtons[0].click();
      console.log(`  첫 번째 도구 선택: ✅`);
      await page.waitForTimeout(300);
    }
    
    // ===== 타일 상호작용 테스트 =====
    console.log('\n=== 🖱️ 타일 상호작용 ===\n');
    
    const tiles = await page.locator('.farm-tile').all();
    if (tiles.length > 0) {
      // 첫 번째 타일 클릭
      await tiles[0].click();
      console.log(`  타일 1 선택: ✅`);
      
      // 아래쪽 타일들도 클릭해보기
      if (tiles.length > 10) {
        await tiles[5].click();
        console.log(`  타일 6 선택: ✅`);
        await page.waitForTimeout(200);
      }
    }
    
    // ===== 모달 테스트 =====
    console.log('\n=== 📋 모달 (UI Dialog) ===\n');
    
    // 인벤토리 열기
    const invBtn = await page.locator('#btn-inventory');
    if (await invBtn.isVisible()) {
      await invBtn.click();
      console.log(`  인벤토리 버튼 클릭: ✅`);
      await page.waitForTimeout(500);
      
      const invModal = await page.locator('#inventory-modal').isVisible().catch(() => false);
      console.log(`  인벤토리 모달: ${invModal ? '✅ 열림' : '❌ 닫힘'}`);
      
      if (invModal) {
        // 닫기
        const closeBtn = await page.locator('#inventory-modal .modal-close');
        if (await closeBtn.count() > 0) {
          await closeBtn.first().click();
          console.log(`  모달 닫기: ✅`);
          await page.waitForTimeout(300);
        }
      }
    }
    
    // 상점 열기
    const shopBtn = await page.locator('#btn-shop');
    if (await shopBtn.isVisible()) {
      await shopBtn.click();
      console.log(`  상점 버튼 클릭: ✅`);
      await page.waitForTimeout(500);
      
      const shopModal = await page.locator('#shop-modal').isVisible().catch(() => false);
      console.log(`  상점 모달: ${shopModal ? '✅ 열림' : '❌ 닫힘'}`);
      
      if (shopModal) {
        const closeBtn = await page.locator('#shop-modal .modal-close');
        if (await closeBtn.count() > 0) {
          await closeBtn.first().click();
          await page.waitForTimeout(300);
        }
      }
    }
    
    // 퀘스트 열기
    const questBtn = await page.locator('#btn-quest-log');
    if (await questBtn.isVisible()) {
      await questBtn.click();
      console.log(`  퀘스트 버튼 클릭: ✅`);
      await page.waitForTimeout(500);
      
      const questModal = await page.locator('#quest-modal').isVisible().catch(() => false);
      console.log(`  퀘스트 모달: ${questModal ? '✅ 열림' : '❌ 닫힘'}`);
      
      if (questModal) {
        const closeBtn = await page.locator('#quest-modal .modal-close');
        if (await closeBtn.count() > 0) {
          await closeBtn.first().click();
          await page.waitForTimeout(300);
        }
      }
    }
    
    // ===== 콘솔 에러 확인 =====
    console.log('\n=== ⚠️ 콘솔 문제 ===\n');
    
    if (errors.length > 0) {
      console.log(`❌ JavaScript 에러: ${errors.length}개`);
      errors.slice(0, 3).forEach((e, i) => {
        console.log(`  ${i+1}. ${e.substring(0, 100)}`);
      });
    } else {
      console.log(`✅ JavaScript 에러 없음`);
    }
    
    const errorLogs = logs.filter(l => l.type === 'error');
    if (errorLogs.length > 0) {
      console.log(`⚠️ 콘솔 에러 로그: ${errorLogs.length}개`);
      errorLogs.slice(0, 3).forEach((log, i) => {
        console.log(`  ${i+1}. ${log.text}`);
      });
    }
    
    // 중요 로그 확인
    const importantLogs = logs.filter(l => l.text.toLowerCase().includes('error') || l.text.toLowerCase().includes('fail'));
    if (importantLogs.length > 0) {
      console.log(`⚠️ 주요 로그: ${importantLogs.length}개`);
      importantLogs.slice(0, 3).forEach((log, i) => {
        console.log(`  ${i+1}. [${log.type}] ${log.text}`);
      });
    }
    
  } catch (error) {
    console.error('❌ 테스트 에러:', error.message);
  } finally {
    await browser.close();
    console.log('\n=== ✅ 테스트 완료 ===\n');
  }
})();
