import { showView } from './ui_manager.js';

const STORAGE_KEY = 'market-automation-config';

const defaultConfig = {
  usUniverse: 'S&P500,NASDAQ100,SOXX,XLU,IBB',
  minUsdVolume: 500000000,
  scoreWeights: { usMomentum: 0.3, krLinkage: 0.3, liquidity: 0.25, valuationRisk: 0.15 },
  watchlistLimit: 3,
  schedule: {
    usCloseScanUtc: '20:30',
    krOpenPlanUtc: '23:30'
  }
};

function getConfig() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultConfig;
  try {
    return { ...defaultConfig, ...JSON.parse(raw) };
  } catch {
    return defaultConfig;
  }
}

function saveConfig(config) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

function getBeginnerDefaults() {
  return {
    ...defaultConfig,
    usUniverse: 'NASDAQ100,SOXX,XLU',
    minUsdVolume: 1000000000,
    scoreWeights: { usMomentum: 0.35, krLinkage: 0.35, liquidity: 0.2, valuationRisk: 0.1 },
    watchlistLimit: 3
  };
}

function generateChecklistRows() {
  return [
    ['1단계', '미국 상승 종목 20개 수집', '대기'],
    ['2단계', '상승 이유 3가지로 라벨링 (실적/정책/수급)', '대기'],
    ['3단계', '한국 연결 가능한 종목만 남기기', '대기'],
    ['4단계', '후보 5~10개 → 최종 2~3개로 압축', '대기'],
    ['5단계', '장중 실행 후 O/X 복기 기록', '대기']
  ].map((row, idx) => `<tr class="border-b"><td class="py-2 pr-3">${idx + 1}</td><td class="py-2 pr-3">${row[0]}</td><td class="py-2 pr-3">${row[1]}</td><td class="py-2">${row[2]}</td></tr>`).join('');
}

function renderAutomationView() {
  const config = getConfig();
  const root = document.getElementById('market-automation-view');
  if (!root) return;

  root.innerHTML = `
    <div class="bg-white rounded-2xl shadow-lg border border-gray-200/80 p-8 space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-3xl font-bold text-gray-800">시장 자동화 (초보 모드)</h1>
        <button id="auto-back-dashboard" class="btn-secondary">대시보드로 돌아가기</button>
      </div>

      <div class="bg-blue-50 border-l-4 border-blue-400 text-blue-900 p-4 rounded-r-lg">
        <p class="font-semibold">처음이면 이렇게만 하세요.</p>
        <ol class="list-decimal pl-5 mt-2 text-sm space-y-1">
          <li><strong>초보 기본값 적용</strong> 버튼 클릭</li>
          <li><strong>설정 저장</strong> 클릭</li>
          <li><strong>오늘 루틴 자동 실행</strong> 클릭</li>
          <li>아래 체크리스트를 위에서부터 1개씩 수행</li>
        </ol>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <form id="automation-config-form" class="space-y-4 bg-gray-50 rounded-xl border p-5">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold">설정값 입력</h2>
            <button type="button" id="apply-beginner-defaults" class="btn-secondary">초보 기본값 적용</button>
          </div>

          <div>
            <label class="label-text">1) 미국 종목 묶음 (쉼표로 구분)</label>
            <input id="us-universe" class="input-field mt-1 w-full" value="${config.usUniverse}">
          </div>
          <div>
            <label class="label-text">2) 최소 거래대금 (USD)</label>
            <input id="min-usd-volume" type="number" class="input-field mt-1 w-full" value="${config.minUsdVolume}">
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div><label class="label-text">3) 미국 모멘텀 비중</label><input id="w-us" type="number" step="0.05" class="input-field mt-1 w-full" value="${config.scoreWeights.usMomentum}"></div>
            <div><label class="label-text">4) 한국 연결 비중</label><input id="w-kr" type="number" step="0.05" class="input-field mt-1 w-full" value="${config.scoreWeights.krLinkage}"></div>
            <div><label class="label-text">5) 유동성 비중</label><input id="w-liq" type="number" step="0.05" class="input-field mt-1 w-full" value="${config.scoreWeights.liquidity}"></div>
            <div><label class="label-text">6) 고평가 리스크 비중</label><input id="w-val" type="number" step="0.05" class="input-field mt-1 w-full" value="${config.scoreWeights.valuationRisk}"></div>
          </div>
          <div><label class="label-text">7) 최종 감시 종목 개수</label><input id="watchlist-limit" type="number" min="1" max="10" class="input-field mt-1 w-full" value="${config.watchlistLimit}"></div>
          <button type="submit" class="btn-primary w-full">설정 저장</button>
        </form>

        <div class="space-y-4 bg-gray-50 rounded-xl border p-5">
          <h2 class="text-lg font-semibold">실행</h2>
          <p class="text-sm text-gray-600">현재는 샘플 모드입니다. (실제 API 연결 전 단계)</p>
          <div class="flex flex-wrap gap-3">
            <button id="run-auto-now" class="btn-primary">오늘 루틴 자동 실행</button>
            <button id="download-template" class="btn-secondary">기록 템플릿 다운로드</button>
          </div>
          <div id="automation-result" class="text-sm text-gray-700 bg-white border rounded-lg p-3">아직 실행 결과가 없습니다.</div>
        </div>
      </div>

      <div class="bg-gray-50 rounded-xl border p-5">
        <h2 class="text-lg font-semibold mb-3">하루 체크리스트 (순서대로 1개씩)</h2>
        <table class="w-full text-sm"><thead><tr class="text-left border-b"><th class="py-2 pr-3">#</th><th class="py-2 pr-3">단계</th><th class="py-2 pr-3">해야 할 일</th><th class="py-2">상태</th></tr></thead><tbody>${generateChecklistRows()}</tbody></table>
      </div>
    </div>
  `;

  const applyBeginnerDefaults = () => {
    const beginner = getBeginnerDefaults();
    document.getElementById('us-universe').value = beginner.usUniverse;
    document.getElementById('min-usd-volume').value = beginner.minUsdVolume;
    document.getElementById('w-us').value = beginner.scoreWeights.usMomentum;
    document.getElementById('w-kr').value = beginner.scoreWeights.krLinkage;
    document.getElementById('w-liq').value = beginner.scoreWeights.liquidity;
    document.getElementById('w-val').value = beginner.scoreWeights.valuationRisk;
    document.getElementById('watchlist-limit').value = beginner.watchlistLimit;
  };

  document.getElementById('auto-back-dashboard')?.addEventListener('click', () => showView('dashboard-view'));
  document.getElementById('apply-beginner-defaults')?.addEventListener('click', applyBeginnerDefaults);

  document.getElementById('automation-config-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const updated = {
      usUniverse: document.getElementById('us-universe')?.value || defaultConfig.usUniverse,
      minUsdVolume: Number(document.getElementById('min-usd-volume')?.value || defaultConfig.minUsdVolume),
      scoreWeights: {
        usMomentum: Number(document.getElementById('w-us')?.value || defaultConfig.scoreWeights.usMomentum),
        krLinkage: Number(document.getElementById('w-kr')?.value || defaultConfig.scoreWeights.krLinkage),
        liquidity: Number(document.getElementById('w-liq')?.value || defaultConfig.scoreWeights.liquidity),
        valuationRisk: Number(document.getElementById('w-val')?.value || defaultConfig.scoreWeights.valuationRisk)
      },
      watchlistLimit: Number(document.getElementById('watchlist-limit')?.value || defaultConfig.watchlistLimit),
      schedule: config.schedule
    };
    saveConfig(updated);
    alert('저장 완료! 이제 "오늘 루틴 자동 실행" 버튼을 누르세요.');
  });

  document.getElementById('run-auto-now')?.addEventListener('click', () => {
    const now = new Date();
    const summary = getConfig();
    document.getElementById('automation-result').innerHTML = `
      <p><strong>실행 완료:</strong> ${now.toLocaleString('ko-KR')}</p>
      <ul class="list-disc pl-5 mt-2">
        <li>미국 상위 종목 수집/라벨링 완료 (샘플)</li>
        <li>한국 후보 ${summary.watchlistLimit}개로 압축 완료</li>
        <li>복기 시트 작성 준비 완료</li>
      </ul>
      <p class="mt-2 text-xs text-gray-500">다음 단계: 체크리스트 1단계부터 순서대로 진행</p>
    `;
  });

  document.getElementById('download-template')?.addEventListener('click', () => {
    const csv = 'sheet,columns\nUS_Labeling,날짜|미국티커|상승트리거분류|한국후보1\nKR_Mapping_Master,테마|한국종목명|대장여부|우선순위\nDaily_Review,날짜|진입종목|손익(%)|내일수정룰1개\n';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'market_automation_templates.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
  });

  lucide.createIcons();
}

export function setupAutomation() {
  const openBtn = document.getElementById('manage-automation');
  if (!openBtn) return;

  openBtn.addEventListener('click', () => {
    renderAutomationView();
    showView('market-automation-view');
  });
}
