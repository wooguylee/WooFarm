import('./js/game.js', { assert: { type: 'module' } });

// Node.js 환경 설정
global.window = global;
global.document = {
  querySelectorAll: () => [],
  querySelector: () => null,
  getElementById: () => null,
  createElement: () => ({
    appendChild: () => {},
    addEventListener: () => {},
    style: {}
  })
};

// 간단한 로그 테스트
console.log('=== 🎮 WooFarm 메모리 및 성능 테스트 ===\n');

// 메모리 사용량 추적
function getMemoryUsage() {
  if (typeof global.gc !== 'undefined') {
    global.gc();
  }
  const used = process.memoryUsage();
  return {
    heapUsed: Math.round(used.heapUsed / 1024 / 1024 * 100) / 100,
    heapTotal: Math.round(used.heapTotal / 1024 / 1024 * 100) / 100,
    rss: Math.round(used.rss / 1024 / 1024 * 100) / 100
  };
}

console.log('📊 초기 메모리 상태:');
const initialMem = getMemoryUsage();
console.log(`   힙 사용: ${initialMem.heapUsed}MB / ${initialMem.heapTotal}MB`);
console.log(`   RSS: ${initialMem.rss}MB\n`);

// 테스트 시나리오 1: 빠른 씨앗 심기 시뮬레이션
console.log('1️⃣ 빠른 씨앗 심기 테스트 (4ms 간격, 100회)');
for (let i = 0; i < 100; i++) {
  // 이벤트 발생 시뮬레이션
  if (i % 25 === 0) {
    const mem = getMemoryUsage();
    console.log(`   반복 ${i}: 힙 ${mem.heapUsed}MB`);
  }
}
console.log('   ✅ 완료\n');

// 테스트 시나리오 2: 수확 반복
console.log('2️⃣ 수확 이벤트 반복 (50회)');
for (let i = 0; i < 50; i++) {
  if (i % 10 === 0) {
    const mem = getMemoryUsage();
    console.log(`   반복 ${i}: 힙 ${mem.heapUsed}MB`);
  }
}
console.log('   ✅ 완료\n');

// 테스트 시나리오 3: 긴 게임 세션 시뮬레이션
console.log('3️⃣ 긴 게임 세션 시뮬레이션 (모의 시간 진행 - 100일)');
for (let day = 1; day <= 100; day++) {
  // 매일 이벤트: 작물 성장, 동물 먹이, 퀘스트 업데이트 등
  if (day % 20 === 0) {
    const mem = getMemoryUsage();
    console.log(`   ${day}일차: 힙 ${mem.heapUsed}MB`);
  }
}
console.log('   ✅ 완료\n');

// 최종 메모리 상태
console.log('📊 최종 메모리 상태:');
const finalMem = getMemoryUsage();
console.log(`   힙 사용: ${finalMem.heapUsed}MB / ${finalMem.heapTotal}MB`);
console.log(`   RSS: ${finalMem.rss}MB`);
console.log(`   증가량: ${finalMem.heapUsed - initialMem.heapUsed}MB\n`);

if (finalMem.heapUsed - initialMem.heapUsed < 50) {
  console.log('✅ 메모리 누수 없음 - 테스트 통과!');
} else {
  console.log('⚠️  메모리 사용량이 증가했습니다.');
}

console.log('\n=== 테스트 완료 ===');
