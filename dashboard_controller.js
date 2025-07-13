import { state } from './app_state.js';
import { showView } from './ui_manager.js';

function renderDashboardContent() {
    const contentEl = document.getElementById('dashboard-content');
    if (!contentEl) return;

    if (state.students.length === 0 || state.exams.length === 0) {
        let message = '';
        if (state.students.length === 0) {
            message += '<p class="mb-2">학생 데이터가 없습니다. 먼저 \'학원 관리\'에서 학생을 추가해주세요.</p>';
        }
        if (state.exams.length === 0) {
            message += '<p>시험 데이터가 없습니다. 먼저 \'시험 관리\'에서 시험을 만들어주세요.</p>';
        }
        contentEl.innerHTML = `
            <div class="text-center p-8 bg-gray-50 rounded-lg">
                <h3 class="text-lg font-semibold text-gray-700">답안을 입력할 수 없습니다.</h3>
                <div class="text-gray-500 mt-2">${message}</div>
            </div>`;
        return;
    }

    const studentOptions = state.students.map(s => {
        const className = state.classes.find(c => c.id === s.classId)?.name || '반 없음';
        return `<option value="${s.id}">${s.name} (${className})</option>`;
    }).join('');
    const examOptions = state.exams.map(e => `<option value="${e.id}">${e.name} (${e.date})</option>`).join('');

    contentEl.innerHTML = `
        <div class="bg-gray-50/80 rounded-xl p-6 border">
            <h3 class="text-xl font-semibold mb-6 text-gray-800 flex items-center">
                <i data-lucide="edit-3" class="h-5 w-5 mr-2 text-green-500"></i>
                답안 입력 대상 선택
            </h3>
            <form id="answer-selection-form" class="space-y-4">
                <div>
                    <label for="student-select" class="label-text">학생 선택</label>
                    <select id="student-select" required class="input-field mt-1 w-full">
                        <option value="">학생을 선택하세요...</option>
                        ${studentOptions}
                    </select>
                </div>
                <div>
                    <label for="exam-select" class="label-text">시험 선택</label>
                    <select id="exam-select" required class="input-field mt-1 w-full">
                        <option value="">시험을 선택하세요...</option>
                        ${examOptions}
                    </select>
                </div>
                <div class="pt-4 flex justify-end">
                    <button type="submit" class="btn-primary w-full sm:w-auto">답안 입력 폼 불러오기</button>
                </div>
            </form>
        </div>
    `;

    lucide.createIcons();

    const form = document.getElementById('answer-selection-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const studentId = parseInt(document.getElementById('student-select').value, 10);
            const examId = parseInt(document.getElementById('exam-select').value, 10);

            if (!studentId || !examId) {
                alert('학생과 시험을 모두 선택해주세요.');
                return;
            }

            state.currentStudent = state.students.find(s => s.id === studentId);
            state.currentExam = state.exams.find(e => e.id === examId);

            if (state.currentStudent && state.currentExam) {
                showView('student-entry-view');
            } else {
                alert('선택한 학생 또는 시험 정보를 찾을 수 없습니다.');
                if(contentEl) contentEl.innerHTML = '';
            }
        });
    }
}


export function setupDashboard() {
    const manageAcademyBtn = document.getElementById('manage-academy');
    const manageExamsBtn = document.getElementById('manage-exams');
    const viewReportsBtn = document.getElementById('view-reports');
    const dashboardView = document.getElementById('dashboard-view');

    if (manageAcademyBtn) {
        manageAcademyBtn.addEventListener('click', () => {
            showView('academy-management-view');
        });
    }

    if (manageExamsBtn) {
        manageExamsBtn.addEventListener('click', () => {
            showView('exam-creation-view');
        });
    }

    if (viewReportsBtn) {
        viewReportsBtn.addEventListener('click', () => {
            renderDashboardContent();
        });
    }

    if (dashboardView) {
        new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.attributeName === 'class' && !dashboardView.classList.contains('hidden')) {
                    const contentEl = document.getElementById('dashboard-content');
                    if (contentEl) {
                        contentEl.innerHTML = '';
                    }
                }
            }
        }).observe(dashboardView, { attributes: true });
    }
}
