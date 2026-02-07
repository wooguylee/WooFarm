const { chromium } = require('playwright');
const path = require('path');

(async () => {
  console.log('=== 🎮 WooFarm 전체 게임 통합 테스트 ===\n');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const logs = [];
  const errors = [];
  
  page.on('console', msg => {
    logs.push({ type: msg.type(), text: msg.text() });
  });
  
  page.on('pageerror', error => {
    errors.push(error.toString());
  });
  
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
      console.log(`❌ ${name}: ${e.message}`);
      testsFailed++;
    }
  };
  
  // 1. 게임 시작
  console.log('=== 1️⃣ 게임 초기화 ===\n');
  
  await test('새 게임 시작', async () => {
    const buttons = await page.locator('button').all();
    for (const btn of buttons) {
      const text = await btn.textContent();
      if (text && text.includes('새 게임')) {
        await btn.click();
        break;
      }
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
      gridSize: window.FarmSystem?.grid?.length,
      tilesCount: document.querySelectorAll('.farm-tile').length,
    }));
    if (farm.tilesCount !== 48) throw new Error(`타일: ${farm.tilesCount} (예상: 48)`);
  });
  
  await test('InventorySystem 초기화', async () => {
    const inv = await page.evaluate(() => ({
      itemsLength: window.InventorySystem?.items?.length,
      gold: window.InventorySystem?._gold,
    }));
    if (inv.gold === undefined) throw new Error('골드 초기화 실패');
  });
  
  // 3. UI 상호작용
  console.log('\n=== 3️⃣ UI 상호작용 테스트 ===\n');
  
  await test('도구 선택 - 괭이', async () => {
    const slots = await page.locator('.tool-slot').all();
    if (slots.length === 0) throw new Error('도구 슬롯 없음');
    await slots[0].click();
    await page.waitForTimeout(200);
  });
  
  await test('타일 상호작용', async () => {
    const tiles = await page.locator('.farm-tile').all();
    if (tiles.length === 0) throw new Error('타일 없음');
    await tiles[0].click();
  });
  
  await test('인벤토리 열기/닫기', async () => {
    await page.keyboard.press('i');
    await page.waitForTimeout(400);
    const invModal = await page.locator('#inventory-modal').isVisible();
    if (!invModal) throw new Error('인벤토리 열기 실패');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  });
  
  await test('상점 열기/닫기', async () => {
    await page.keyboard.press('s');
    await page.waitForTimeout(400);
    const shopModal = await page.locator('#shop-modal').isVisible();
    if (!shopModal) throw new Error('상점 열기 실패');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  });
  
  await test('퀘스트 열기/닫기', async () => {
    await page.keyboard.press('q');
    await page.waitForTimeout(400);
    const questModal = await page.locator('#quest-modal').isVisible();
    if (!questModal) throw new Error('퀘스트 열기 실패');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  });
  
  await test('동물 관리 열기/닫기', async () => {
    await page.keyboard.press('a');
    await page.waitForTimeout(400);
    const animalModal = await page.locator('#animal-modal').isVisible();
    if (!animalModal) throw new Error('동물 관리 열기 실패');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  });
  
  // 4. 농장 시스템
  console.log('\n=== 4️⃣ 농장 시스템 ===\n');
  
  await test('경작 (Hoe 도구)', async () => {
    const slots = await page.locator('.tool-slot').all();
    await slots[0].click(); // 괭이
    await page.waitForTimeout(200);
    const tiles = await page.locator('.farm-tile').all();
    if (tiles.length > 0) {
      await tiles[0].click();
      await page.waitForTimeout(200);
    }
  });
  
  await test('씨앗 선택 (Seed 도구)', async () => {
    const slots = await page.locator('.tool-slot').all();
    if (slots.length > 2) {
      await slots[2].click(); // 씨앗
      await page.waitForTimeout(300);
      const seedPanel = await page.locator('#seed-panel').isVisible().catch(() => false);
      if (!seedPanel) throw new Error('씨앗 패널이 열리지 않음');
    }
  });
  
  // 5. 퀘스트 시스템
  console.log('\n=== 5️⃣ 퀘스트 시스템 ===\n');
  
  await test('퀘스트 데이터 로드', async () => {
    const questData = await page.evaluate(() => {
      return {
        dataExists: !!window.QUEST_DATA,
        dataType: typeof window.QUEST_DATA,
        questCount: Object.keys(window.QUEST_DATA || {}).length,
      };
    });
    if (!questData.dataExists) throw new Error('QUEST_DATA 없음');
    if (questData.dataType !== 'object') throw new Error(`데이터 타입: ${questData.dataType}`);
    if (questData.questCount === 0) throw new Error('퀘스트 개수: 0');
  });
  
  await test('활성 퀘스트 존재', async () => {
    const quests = await page.evaluate(() => {
      return {
        activeQuestsCount: window.QuestSystem?.getActiveQuests?.()?.length || 0,
      };
    });
    if (quests.activeQuestsCount === 0) throw new Error('활성 퀘스트 없음');
  });
  
  // 6. 동물 시스템
  console.log('\n=== 6️⃣ 동물 시스템 ===\n');
  
  await test('동물 데이터 로드', async () => {
    const animalData = await page.evaluate(() => {
      return {
        dataExists: !!window.ANIMAL_DATA,
        dataType: typeof window.ANIMAL_DATA,
        animalCount: Object.keys(window.ANIMAL_DATA || {}).length,
      };
    });
    if (!animalData.dataExists) throw new Error('ANIMAL_DATA 없음');
    if (animalData.animalCount === 0) throw new Error('동물 데이터 0개');
  });
  
  // 7. 상점 시스템
  console.log('\n=== 7️⃣ 상점 시스템 ===\n');
  
  await test('상점 데이터 로드', async () => {
    const shopData = await page.evaluate(() => {
      return {
        itemDataExists: !!window.ITEM_DATA,
        itemCount: Object.keys(window.ITEM_DATA || {}).length,
      };
    });
    if (shopData.itemCount === 0) throw new Error('상점 아이템 없음');
  });
  
  // 8. 장식 시스템
  console.log('\n=== 8️⃣ 장식 시스템 ===\n');
  
  await test('장식 데이터 로드', async () => {
    const decorData = await page.evaluate(() => {
      return {
        dataExists: !!window.DECORATION_DATA,
        dataCount: window.DECORATION_DATA ? Object.keys(window.DECORATION_DATA).length : 0,
      };
    });
    if (decorData.dataCount === 0) throw new Error('장식 데이터 없음');
  });
  
  // 9. 오디오 시스템
  console.log('\n=== 9️⃣ 오디오 시스템 ===\n');
  
  await test('AudioManager 초기화', async () => {
    const audio = await page.evaluate(() => {
      return {
        exists: !!window.AudioManager,
        hasPlaySound: typeof window.AudioManager?.playSound === 'function',
      };
    });
    if (!audio.exists) throw new Error('AudioManager 없음');
    if (!audio.hasPlaySound) throw new Error('playSound 메소드 없음');
  });
  
  // 10. 시스템 통신
  console.log('\n=== 🔟 이벤트 버스 ===\n');
  
  await test('EventBus 기능', async () => {
    const eventBus = await page.evaluate(() => {
      return {
        exists: !!window.Utils?.eventBus,
        hasOn: typeof window.Utils?.eventBus?.on === 'function',
        hasEmit: typeof window.Utils?.eventBus?.emit === 'function',
      };
    });
    if (!eventBus.exists) throw new Error('EventBus 없음');
    if (!eventBus.hasOn || !eventBus.hasEmit) throw new Error('EventBus 메소드 없음');
  });
  
  // 11. 저장 시스템
  console.log('\n=== 1️⃣1️⃣ 저장 시스템 ===\n');
  
  await test('SaveManager 초기화', async () => {
    const save = await page.evaluate(() => {
      return {
        exists: !!window.SaveManager,
        hasSave: typeof window.SaveManager?.saveGame === 'function',
        hasLoad: typeof window.SaveManager?.loadGame === 'function',
      };
    });
    if (!save
