const { chromium } = require('playwright');
const path = require('path');

(async () => {
  console.log('=== WooFarm 게임 테스트 시작 ===\n');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  // Console 메시지 캡처
  const logs = [];
  const errors = [];
  
  page.on('console', msg => {
    const text = `[${msg.type().toUpperCase()}] ${msg.text()}`;
    logs.push(text);
    if (msg.type() === 'error') console.error(text);
  });
  
  page.on('pageerror', error => {
    errors.push(error.toString());
  });
  
  // 파일 경로
  const filePath = `file://${path.resolve('./index.html')}`;
  console.log(`📂 로딩: ${filePath}\n`);
  
  try {
    await page.goto(filePath, { waitUntil: 'networkidle' });
    console.log('✅ 페이지 로드 성공\n');
    
    // 초기화 대기
    await page.waitForTimeout(3000);
    
    // 1. 로딩 화면 확인
    console.log('=== 1️⃣ 로딩 화면 테스트 ===');
    let loadingScreen = await page.locator('#loading-screen').isVisible().catch(() => false);
    console.log(`  로딩 화면: ${loadingScreen ? '✅ 표시중' : '❌ 없음'}`);
    
    // 2. 메인 메뉴 확인
    console.log('\n=== 2️⃣ 메인 메뉴 테스트 ===');
    let menuScreen = await page.locator('#menu-screen').isVisible().catch(() => false);
    console.log(`  메뉴 화면: ${menuScreen ? '✅ 표시중' : '❌ 없음'}`);
    
    // 3. 새 게임 버튼 찾기 및 클릭
    console.log('\n=== 3️⃣ 새 게임 시작 ===');
    const buttons = await page.locator('button').all();
    let clicked = false;
    for (const btn of buttons) {
      const text = await btn.textContent();
      if (text && text.includes('새 게임')) {
        await btn.click();
        console.log(`  "새 게임" 버튼 클릭 완료`);
        clicked = true;
        break;
      }
    }
    if (!clicked) console.log(`  ❌ 새 게임 버튼을 찾지 못했습니다`);
    
    await page.waitForTimeout(2000);
    
    // 4. 게임 화면 확인
    console.log('\n=== 4️⃣ 게임 화면 확인 ===');
    let gameScreen = await page.locator('#game-screen').isVisible().catch(() => false);
    let gameContainer = await page.locator('#game-container').isVisible().catch(() => false);
    let farmGrid = await page.locator('#farm-grid').isVisible().catch(() => false);
    console.log(`  게임 화면: ${gameScreen ? '✅' : '❌'}`);
    console.log(`  게임 컨테이너: ${gameContainer ? '✅' : '❌'}`);
    console.log(`  농장 그리드: ${farmGrid ? '✅' : '❌'}`);
    
    // 5. HUD 확인
    console.log('\n=== 5️⃣ HUD 확인 ===');
    let hud = await page.locator('#hud').isVisible().catch(() => false);
    let timeDisplay = await page.locator('.time-display').isVisible().catch(() => false);
    let goldDisplay = await page.locator('.gold-display').isVisible().catch(() => false);
    console.log(`  HUD: ${hud ? '✅' : '❌'}`);
    console.log(`  시간 표시: ${timeDisplay ? '✅' : '❌'}`);
    console.log(`  골드 표시: ${goldDisplay ? '✅' : '❌'}`);
    
    // 6. 타일 상호작용 테스트
    console.log('\n=== 6️⃣ 타일 상호작용 ===');
    const tiles = await page.locator('.farm-tile').all();
    console.log(`  농장 타일 개수: ${tiles.length}`);
    
    if (tiles.length > 0) {
      await tiles[0].click();
      console.log(`  첫 번째 타일 선택 완료`);
      await page.waitForTimeout(500);
    }
    
    // 7. 콘솔 에러 확인
    console.log('\n=== 7️⃣ 콘솔 출력 ===');
    if (errors.length > 0) {
      console.log(`❌ 에러 발견: ${errors.length}개`);
      errors.slice(0, 5).forEach((e, i) => console.log(`  ${i+1}. ${e.substring(0, 100)}`));
    } else {
      console.log(`✅ 에러 없음`);
    }
    
    // 에러 로그 필터링
    const errorLogs = logs.filter(l => l.includes('ERROR') || l.includes('Error'));
    if (errorLogs.length > 0) {
      console.log(`\n⚠️ 에러 로그:`);
      errorLogs.slice(0, 5).forEach(log => console.log(`  ${log.substring(0, 120)}`));
    }
    
  } catch (error) {
    console.error('❌ 테스트 오류:', error.message);
  } finally {
    await browser.close();
    console.log('\n=== 테스트 완료 ===\n');
  }
})();
