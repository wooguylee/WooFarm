const { chromium } = require('playwright');
const path = require('path');

(async () => {
  console.log('=== 🔍 게임 요소 상세 디버그 ===\n');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const filePath = `file://${path.resolve('./index.html')}`;
  await page.goto(filePath, { waitUntil: 'networkidle' });
  
  await page.waitForTimeout(3000);
  
  // 게임 상태 확인
  const gameState = await page.evaluate(() => {
    const getDisplay = (selector) => {
      const el = document.querySelector(selector);
      return el ? window.getComputedStyle(el).display : 'not-found';
    };
    
    return {
      gameStatus: typeof window.Game !== 'undefined' ? 'exists' : 'missing',
      currentScreen: window.Game?.currentScreen || 'unknown',
      htmlStructure: {
        menuScreen: document.querySelector('#menu-screen') ? 'exists' : 'missing',
        gameScreen: document.querySelector('#game-screen') ? 'exists' : 'missing',
        hud: document.querySelector('#hud') ? 'exists' : 'missing',
        farmGrid: document.querySelector('#farm-grid') ? 'exists' : 'missing',
      },
      displayStates: {
        menuScreen: getDisplay('#menu-screen'),
        gameScreen: getDisplay('#game-screen'),
        hud: getDisplay('#hud'),
        farmGrid: getDisplay('#farm-grid'),
      },
      systemStates: {
        game: !!window.Game,
        timeSystem: !!window.TimeSystem,
        farmSystem: !!window.FarmSystem,
        inventory: !!window.InventorySystem,
        shop: !!window.ShopSystem,
      }
    };
  });
  
  console.log('게임 상태:');
  console.log(`  Game 객체: ${gameState.gameStatus}`);
  console.log(`  현재 화면: ${gameState.currentScreen}`);
  
  console.log('\n📄 HTML 구조:');
  for (const [key, value] of Object.entries(gameState.htmlStructure)) {
    console.log(`  ${key}: ${value}`);
  }
  
  console.log('\n🎨 Display 스타일:');
  for (const [key, value] of Object.entries(gameState.displayStates)) {
    console.log(`  ${key}: "${value}"`);
  }
  
  console.log('\n⚙️ 시스템 상태:');
  for (const [key, value] of Object.entries(gameState.systemStates)) {
    console.log(`  ${key}: ${value ? '✅' : '❌'}`);
  }
  
  // 새 게임 버튼 클릭 후 상태 확인
  console.log('\n▶️ 새 게임 시작:');
  const buttons = await page.locator('button').all();
  for (const btn of buttons) {
    const text = await btn.textContent();
    if (text && text.includes('새 게임')) {
      await btn.click();
      console.log('  "새 게임" 버튼 클릭 ✅');
      break;
    }
  }
  
  await page.waitForTimeout(2000);
  
  const gameState2 = await page.evaluate(() => {
    const getDisplay = (selector) => {
      const el = document.querySelector(selector);
      return el ? window.getComputedStyle(el).display : 'not-found';
    };
    
    return {
      currentScreen: window.Game?.currentScreen,
      gameStarted: window.Game?.gameStarted,
      displayStates: {
        menuScreen: getDisplay('#menu-screen'),
        gameScreen: getDisplay('#game-screen'),
      },
      tileCount: document.querySelectorAll('.farm-tile').length,
      hudDisplay: getDisplay('#hud'),
    };
  });
  
  console.log(`  현재 화면: ${gameState2.currentScreen}`);
  console.log(`  게임 시작: ${gameState2.gameStarted}`);
  console.log(`  메뉴 화면 display: "${gameState2.displayStates.menuScreen}"`);
  console.log(`  게임 화면 display: "${gameState2.displayStates.gameScreen}"`);
  console.log(`  타일 개수: ${gameState2.tileCount}`);
  console.log(`  HUD display: "${gameState2.hudDisplay}"`);
  
  // 스크린샷 저장
  await page.screenshot({ path: 'game-state.png' });
  console.log('\n📸 스크린샷 저장: game-state.png');
  
  await browser.close();
})();
