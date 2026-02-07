import { chromium } from 'playwright';
import path from 'path';

(async () => {
  console.log('=== 🎮 WooFarm 최종 테스트 ===\n');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  
  await page.goto(`file://${path.resolve('./index.html')}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  let pass = 0, fail = 0;
  
  const test = async (name, fn) => {
    try { await fn(); console.log(`✅ ${name}`); pass++; }
    catch (e) { console.log(`❌ ${name}: ${e.message}`); fail++; }
  };
  
  console.log('=== 게임 시작 ===\n');
  
  await test('새 게임 시작', async () => {
    const buttons = await page.locator('button').all();
    for (const btn of buttons) {
      const text = await btn.textContent();
      if (text?.includes('새 게임')) { await btn.click(); break; }
    }
    await page.waitForTimeout(1500);
  });
  
  console.log('\n=== 게임 시스템 ===\n');
  
  await test('TimeSystem', async () => {
    const t = await page.evaluate(() => !!window.TimeSystem?.currentHour);
    if (!t) throw new Error('TimeSystem 없음');
  });
  
  await test('FarmSystem (48 타일)', async () => {
    const count = await page.locator('.farm-tile').count();
    if (count !== 48) throw new Error(`${count}개`);
  });
  
  await test('ShopSystem (골드)', async () => {
    const g = await page.evaluate(() => window.ShopSystem?.gold);
    if (typeof g !== 'number') throw new Error('골드 타입 오류');
  });
  
  await test('QuestSystem', async () => {
    const q = await page.evaluate(() => Object.keys(window.QUEST_DATA || {}).length > 0);
    if (!q) throw new Error('퀘스트 데이터 없음');
  });
  
  await test('AnimalSystem', async () => {
    const a = await page.evaluate(() => Object.keys(window.ANIMAL_DATA || {}).length > 0);
    if (!a) throw new Error('동물 데이터 없음');
  });
  
  await test('ItemSystem', async () => {
    const i = await page.evaluate(() => Object.keys(window.ITEM_DATA || {}).length > 0);
    if (!i) throw new Error('아이템 데이터 없음');
  });
  
  await test('AudioManager', async () => {
    const a = await page.evaluate(() => typeof window.AudioManager?.playSound === 'function');
    if (!a) throw new Error('AudioManager 오류');
  });
  
  console.log('\n=== UI 상호작용 ===\n');
  
  await test('도구 선택', async () => {
    const s = await page.locator('.tool-slot').all();
    if (s.length === 0) throw new Error('도구 없음');
    await s[0].click();
  });
  
  await test('타일 클릭', async () => {
    const t = await page.locator('.farm-tile').all();
    if (t.length === 0) throw new Error('타일 없음');
    await t[0].click();
  });
  
  await test('단축키 I - 인벤토리', async () => {
    await page.keyboard.press('i');
    await page.waitForTimeout(400);
    const visible = await page.locator('#inventory-modal').isVisible();
    if (!visible) throw new Error('모달 미표시');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  });
  
  await test('단축키 S - 상점', async () => {
    await page.keyboard.press('s');
    await page.waitForTimeout(400);
    const visible = await page.locator('#shop-modal').isVisible();
    if (!visible) throw new Error('모달 미표시');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  });
  
  await test('단축키 Q - 퀘스트', async () => {
    await page.keyboard.press('q');
    await page.waitForTimeout(400);
    const visible = await page.locator('#quest-modal').isVisible();
    if (!visible) throw new Error('모달 미표시');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  });
  
  await test('단축키 A - 동물', async () => {
    await page.keyboard.press('a');
    await page.waitForTimeout(400);
    const visible = await page.locator('#animal-modal').isVisible();
    if (!visible) throw new Error('모달 미표시');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  });
  
  console.log('\n=== 최종 상태 ===\n');
  
  await test('JavaScript 에러 없음', async () => {
    if (errors.length > 0) throw new Error(`${errors.length}개 에러`);
  });
  
  console.log('\n=== 📊 결과 ===\n');
  console.log(`✅ 통과: ${pass}`);
  console.log(`❌ 실패: ${fail}`);
  console.log(`📈 성공률: ${((pass/(pass+fail))*100).toFixed(1)}%\n`);
  
  if (fail === 0) {
    console.log('🎉 완벽합니다! 모든 기능이 정상 작동합니다.\n');
  }
  
  await page.screenshot({ path: 'game-screenshot.png' });
  
  await browser.close();
  process.exit(fail > 0 ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
