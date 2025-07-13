import { state, addExam, getClassById } from './app_state.js';
import { showView } from './ui_manager.js';

const QUESTION_TYPES = ['Phonics', 'Reading', 'Sentence Comprehension', 'Vocabulary', 'Grammar', 'Listening Comprehension'];

let questionCounter = 0;

function populateClassDropdown() {
    const classSelect = document.getElementById('exam-class-select');
    if (!classSelect) return;
    
    const classes = state.classes || [];
    const selectedValue = classSelect.value;
    classSelect.innerHTML = '<option value="">반을 선택하세요</option>' + 
        classes.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
    classSelect.value = selectedValue;
}

function updateQuestionNumbers() {
    const questionsContainer = document.getElementById('questions-container');
    if (!questionsContainer) return;

    questionsContainer.querySelectorAll('.question-item').forEach((item, index) => {
        item.querySelector('.question-number').textContent = `문항 ${index + 1}`;
    });
}

function addQuestionItem() {
    const questionsContainer = document.getElementById('questions-container');
    if (!questionsContainer) return;
    questionCounter++;

    const questionHtml = `
        <div class="question-item flex items-center gap-4 p-3 bg-white rounded-md border" data-id="${questionCounter}">
            <span class="question-number font-medium text-gray-600 w-16 text-sm">문항 ${questionsContainer.children.length + 1}</span>
            <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label for="question-type-${questionCounter}" class="sr-only">문제 유형</label>
                    <select id="question-type-${questionCounter}" name="question-type" class="input-field w-full" required>
                        <option value="">문제 유형 선택</option>
                        ${QUESTION_TYPES.map(type => `<option value="${type}">${type}</option>`).join('')}
                    </select>
                </div>
                <div>
                    <label for="question-answer-${questionCounter}" class="sr-only">정답</label>
                    <input type="text" id="question-answer-${questionCounter}" name="question-answer" class="input-field w-full" placeholder="정답 입력" required>
                </div>
            </div>
            <button type="button" class="remove-question-btn text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50">
                <i data-lucide="trash-2" class="h-5 w-5"></i>
            </button>
        </div>
    `;
    questionsContainer.insertAdjacentHTML('beforeend', questionHtml);
    lucide.createIcons();
}

function renderExamList() {
    const examListContainer = document.getElementById('exam-list-container');
    if (!examListContainer) return;

    const exams = state.exams || [];
    examListContainer.innerHTML = '';

    if (exams.length === 0) {
        examListContainer.innerHTML = '<p class="text-gray-500 text-center py-4">아직 저장된 시험이 없습니다.</p>';
        return;
    }

    const list = document.createElement('ul');
    list.className = 'space-y-3';
    exams.sort((a, b) => b.id - a.id).forEach(exam => {
        const classInfo = getClassById(exam.classId);
        const examItem = document.createElement('li');
        examItem.className = 'p-4 bg-white rounded-lg border flex justify-between items-center transition hover:shadow-sm hover:border-blue-300';
        examItem.innerHTML = `
            <div>
                <p class="font-semibold text-gray-800">${exam.name}</p>
                <p class="text-sm text-gray-500">${classInfo ? classInfo.name : '알 수 없는 반'} &bull; ${exam.date}</p>
            </div>
            ${exam.examFile ? `<a href="${exam.examFile}" download="exam_${exam.name}.pdf" target="_blank" class="btn-secondary-sm"><i data-lucide="file-text" class="h-4 w-4 mr-1"></i> 시험지 보기</a>` : ''}
        `;
        list.appendChild(examItem);
    });
    examListContainer.appendChild(list);
    lucide.createIcons();
}

function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

export function setupExamCreation() {
    const form = document.getElementById('exam-creation-form');
    if (!form || form.dataset.initialized) return;
    form.dataset.initialized = 'true';

    const backButton = document.getElementById('exam-back-to-dashboard');
    const addQuestionBtn = document.getElementById('add-question-btn');
    const questionsContainer = document.getElementById('questions-container');

    if (backButton) {
        backButton.addEventListener('click', () => showView('dashboard-view'));
    }

    if (addQuestionBtn) {
        addQuestionBtn.addEventListener('click', addQuestionItem);
    }
    
    if (questionsContainer) {
        questionsContainer.addEventListener('click', (e) => {
            const removeBtn = e.target.closest('.remove-question-btn');
            if (removeBtn) {
                removeBtn.closest('.question-item').remove();
                updateQuestionNumbers();
            }
        });
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const fileInput = document.getElementById('exam-file-upload');
        let examFileContent = null;
        if (fileInput.files.length > 0) {
            try {
                examFileContent = await readFileAsDataURL(fileInput.files[0]);
            } catch (error) {
                console.error('Error reading file:', error);
                alert('파일을 읽는 중 오류가 발생했습니다.');
                return;
            }
        }
        
        const questionItems = questionsContainer.querySelectorAll('.question-item');
        if (questionItems.length === 0) {
            alert('하나 이상의 문항을 추가해주세요.');
            return;
        }

        const questions = Array.from(questionItems).map(item => ({
            type: item.querySelector('select[name="question-type"]').value,
            answer: item.querySelector('input[name="question-answer"]').value.trim()
        }));

        const newExam = {
            name: document.getElementById('exam-name').value,
            classId: document.getElementById('exam-class-select').value,
            date: document.getElementById('exam-date').value,
            examFile: examFileContent,
            questions: questions
        };

        addExam(newExam);
        renderExamList();
        
        form.reset();
        questionsContainer.innerHTML = '';
        addQuestionItem();
        alert('시험이 성공적으로 저장되었습니다.');
    });

    const examView = document.getElementById('exam-creation-view');
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            if (mutation.attributeName === 'class' && !examView.classList.contains('hidden')) {
                populateClassDropdown();
                renderExamList();
            }
        }
    });
    observer.observe(examView, { attributes: true });

    if (questionsContainer && questionsContainer.children.length === 0) {
        addQuestionItem();
    }
}
