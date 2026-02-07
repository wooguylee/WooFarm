import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

(async () => {
  console.log('=== 🎮 WooFarm 전체 게임 통합 테스트 ===\n');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const logs = [];
  const errors = [];
  
  page.on('console', msg => logs.push({ type: msg.type(), text: msg.text() }));
  page.on('pageerror', error => errors.push(error.toString()));
  
  const filePath = `file://${path.resolve('./index.html')}`;
  await page.goto(filePath, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  let testsPassed = 0, testsFailed = 0;
  
  const test = async (name, fn) => {
    try { await fn(); console.log(`✅ ${name}`); testsPassed++; }
    catch (e) { console.log(`❌ ${name}: ${e.message}`); testsFailed++; }
  };
  
  // 1. 게임 시작
  console.log('=== 1️⃣ 게임 초기화 ===\n');
  
  await test('새 게임 시작', async () => {
    const buttons = await page.locator('button').all();
    for (const btn of buttons) {
      const text = await btn.textContent();
      if (text?.includes('새 게임')) { await btn.click(); break; }
    }
    await page.waitForTimeout(1500);
  });
  
  // 2. 기본 게임 상태
  console.log('\n=== 2️⃣ 게임 상태 확인 ===\n');
  
  await test('TimeSystem 초기화', async () => {
    const time = await page.evaluate(() => ({
      hour: window.TimeSystem?.currentHour,
      day: window.TimeSystem?.currentDay,
      season: window.TimeSystem?.currentSeason,
    }));
    if (!time.hour || !time.day || !time.season) throw new Error('시간/날짜/계절 없음');
  });
  
  await test('FarmSystem 초기화', async () => {
    const farm = await page.evaluate(() => ({
      tilesCount: document.querySelectorAll('.farm-tile').length,
    }));
    if (farm.tilesCount !== 48) throw new Error(`타일: ${farm.tilesCount}`);
  });
  
  await test('InventorySystem 초기화', async () => {
    const inv = await page.evaluate(() => ({
      gold: window.InventorySystem?._gold,
    }));
    if (inv.gold === undefined) throw new Error('골드 초기화 실패');
  });
  
  // 3. UI 상호작용
  console.log('\n=== 3️⃣ UI 상호작용 테스트 ===\n');
  
  await test('도구 선택', async () => {
    const slots = await page.locator('.tool-slot').all();
    if (slots.length === 0) throw new Error('도구 슬롯 없음');
    await slots[0].click();
  });
  
  await test('타일 클릭', async () => {
    const tiles = await page.locator('.farm-tile').all();
    if (tiles.length === 0) throw new Error('타일 없음');
    await tiles[0].click();
  });
  
  await test('인벤토리 (I)', async () => {
    await page.keyboard.press('i');
    await page.waitForTimeout(400);
    const visible = await page.locator('#inventory-modal').isVisible();
    if (!visible) throw new Error('인벤토리 열기 실패');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  });
  
  await test('상점 (S)', async () => {
    await page.keyboard.press('s');
    await page.waitForTimeout(400);
    const visible = await page.locator('#shop-modal').isVisible();
    if (!visible) throw new Error('상점 열기 실패');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  });
  
  await test('퀘스트 (Q)', async () => {
    await page.keyboard.press('q');
    await page.waitForTimeout(400);
    const visible = await page.locator('#quest-modal').isVisible();
    if (!visible) throw new Error('퀘스트 열기 실패');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  });
  
  await test('동물 (A)', async () => {
    await page.keyboard.press('a');
    await page.waitForTimeout(400);
    const visible = await page.locator('#animal-modal').isVisible();
    if (!visible) throw new Error('동물 열기 실패');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  });
  
  // 4. 데이터 시스템
  console.log('\n=== 4️⃣ 데이터 시스템 ===\n');
  
  await test('QUEST_DATA 로드', async () => {
    const data = await page.evaluate(() => ({
      exists: !!window.QUEST_DATA,
      isObject: typeof window.QUEST_DATA === 'object',
      count: Object.keys(window.QUEST_DATA || {}).length,
    }));
    if (!data.exists || !data.isObject || data.count === 0) throw new Error('데이터 오류');
  });
  
  await test('ANIMAL_DATA 로드', async () => {
    const data = await page.evaluate(() => ({
      exists: !!window.ANIMAL_DATA,
      count: Object.keys(window.ANIMAL_DATA || {}).length,
    }));
    if (!data.exists || data.count === 0) throw new Error('데이터 오류');
  });
  
  await test('ITEM_DATA 로드', async () => {
    const data = await page.evaluate(() => ({
      exists: !!window.ITEM_DATA,
      count: Object.keys(window.ITEM_DATA || {}).length,
    }));
    if (!data.exists || data.count === 0) throw new Error('데이터 오류');
  });
  
  await test('DECORATION_DATA 로드', async () => {
    const data = await page.evaluate(() => ({
      exists: !!window.DECORATION_DATA,
      count: Object.keys(window.DECORATION_DATA || {}).length,
    }));
    if (!data.exists || data.count === 0) throw new Error('데이터 오류');
  });
  
  // 5. 매니저/시스템
  console.log('\n=== 5️⃣ 매니저/시스템 ===\n');
  
  await test('AudioManager 작동', async () => {
    const audio = await page.evaluate(() => ({
      exists: !!window.AudioManager,
      hasPlaySound: typeof window.AudioManager?.playSound === 'function',
    }));
    if (!audio.exists || !audio.hasPlaySound) throw new Error('오디오 오류');
  });
  
  await test('SaveManager 작동', async () => {
    const save = await page.evaluate(() => ({
      exists: !!window.SaveManager,
      hasSave: typeof window.SaveManager?.saveGame === 'function',
    }));
    if (!save.exists) throw new Error('저장 오류');
  });
  
  await test('EventBus 작동', async () => {
    const bus = await page.evaluate(() => ({
      exists: !!window.Utils?.eventBus,
      hasOn: typeof window.Utils?.eventBus?.on === 'function',
      hasEmit: typeof window.Utils?.eventBus?.emit === 'function',
    }));
    if (!bus.exists || !bus.hasOn || !bus.hasEmit) throw new Error('이벤트 오류');
  });
  
  // 6. 콘솔
  console.log('\n=== 6️⃣ 콘솔 상태 ===\n');
  
  await page.waitForTimeout(1000);
  
  await test('JavaScript 에러 없음', async () => {
    if (errors.length > 0) throw new Error(`${errors.length}개`);
  });
  
  // 결과
  console.log('\n=== 📊 최종 결과 ===\n');
  console.log(`✅ 통과: ${testsPassed}`);
  console.log(`❌ 실패: ${testsFailed}`);
  console.log(`📈 성공률: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);
  
  if (testsFailed === 0) {
    console.log('\n🎉 모든 테스트 통과! 게임이 완벽하게 작동합니다.');
  }
  
  await page.screenshot({ path: 'game-final.png' });
  console.log('📸 스크린샷: game-final.png\n');
  
  await browser.close();
  process.exit(testsFailed > 0 ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
