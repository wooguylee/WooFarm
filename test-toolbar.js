const { chromium } = require('playwright');
const path = require('path');

(async () => {
  console.log('=== 🔧 도구바 상세 검사 ===\n');
  
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  await page.goto(`file://${path.resolve('./index.html')}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  
  // 새 게임 시작
  const buttons = await page.locator('button').all();
  for (const btn of buttons) {
    const text = await btn.textContent();
    if (text && text.includes('새 게임')) {
      await btn.click();
      break;
    }
  }
  
  await page.waitForTimeout(2000);
  
  // 도구바 정보 확인
  const toolbarInfo = await page.evaluate(() => {
    const toolbar = document.querySelector('.toolbar');
    const toolBtns = document.querySelectorAll('.tool-btn');
    const toolLabels = document.querySelectorAll('.tool-label');
    
    return {
      toolbarExists: !!toolbar,
      toolbarDisplay: toolbar ? window.getComputedStyle(toolbar).display : 'n/a',
      toolBtnCount: toolBtns.length,
      toolLabelCount: toolLabels.length,
      toolBtnHtml: Array.from(toolBtns).slice(0, 3).map(btn => btn.outerHTML.substring(0, 100)),
      seedPanelExists: !!document.querySelector('#seed-panel'),
      seedPanelDisplay: document.querySelector('#seed-panel') ? window.getComputedStyle(document.querySelector('#seed-panel')).display : 'n/a',
    };
  });
  
  console.log('도구바 정보:');
  console.log(`  도구바 존재: ${toolbarInfo.toolbarExists ? '✅' : '❌'}`);
  console.log(`  도구바 display: ${toolbarInfo.toolbarDisplay}`);
  console.log(`  도구 버튼 개수: ${toolbarInfo.toolBtnCount}`);
  console.log(`  도구 라벨 개수: ${toolbarInfo.toolLabelCount}`);
  console.log(`  씨앗 패널 존재: ${toolbarInfo.seedPanelExists ? '✅' : '❌'}`);
  console.log(`  씨앗 패널 display: ${toolbarInfo.seedPanelDisplay}`);
  
  // 실제 HTML 구조 확인
  console.log('\n도구 버튼 HTML:');
  toolbarInfo.toolBtnHtml.forEach((html, i) => {
    console.log(`  ${i+1}. ${html}...`);
  });
  
  // 도구바 선택 메커니즘 확인
  const toolbarHTML = await page.locator('.toolbar').first().innerHTML();
  console.log('\n도구바 내부 구조:');
  console.log(toolbarHTML.substring(0, 500));
  
  await browser.close();
})();
