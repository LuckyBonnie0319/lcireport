import { state } from './app_state.js';
import { showView } from './ui_manager.js';

const container = document.getElementById('answer-inputs-container');
const form = document.getElementById('student-answer-form');
const view = document.getElementById('student-entry-view');
const header = document.getElementById('student-entry-header');

function renderAnswerForm() {
    if (!state.currentExam || !state.currentStudent) {
        showView('dashboard-view');
        return;
    }
    
    header.textContent = `'${state.currentStudent.name}' 학생의 '${state.currentExam.name}' 시험 답안을 입력합니다.`;
    container.innerHTML = '';

    state.currentExam.questions.forEach(q => {
        let inputHtml;
        if (q.type === 'objective') {
            inputHtml = `
                <label for="student-answer-${q.id}" class="text-sm font-medium text-gray-700">학생 답</label>
                <input type="text" id="student-answer-${q.id}" data-question-id="${q.id}" data-question-type="objective" class="input-field w-full mt-1">`;
        } else {
            inputHtml = `
                <label for="student-score-${q.id}" class="text-sm font-medium text-gray-700">교사 입력 점수 (최대 ${q.points}점)</label>
                <input type="number" id="student-score-${q.id}" data-question-id="${q.id}" data-question-type="subjective" class="input-field w-full mt-1" min="0" max="${q.points}">`;
        }

        const questionBlock = `
            <div class="p-3 bg-white border rounded-md">
                <p class="font-semibold">문항 ${q.number} <span class="text-sm font-normal text-gray-500">(${q.area} / ${q.type} / ${q.points}점)</span></p>
                <div class="mt-2">${inputHtml}</div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', questionBlock);
    });
}

export function setupAnswerEntry() {
    if (!view || !form) return;

    new MutationObserver(() => {
        if (!view.classList.contains('hidden')) {
            renderAnswerForm();
        }
    }).observe(view, { attributes: true });

    document.getElementById('cancel-answer-entry').addEventListener('click', () => {
        showView('dashboard-view');
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const submission = {
            studentId: state.currentStudent.id,
            examId: state.currentExam.id,
            answers: []
        };

        state.currentExam.questions.forEach(q => {
            const input = document.querySelector(`[data-question-id="${q.id}"]`);
            if (q.type === 'objective') {
                submission.answers.push({
                    questionId: q.id,
                    answer: input.value
                });
            } else {
                submission.answers.push({
                    questionId: q.id,
                    score: parseFloat(input.value) || 0
                });
            }
        });
        
        window.submitAndGenerateReport(submission);
        form.reset();
    });
}
