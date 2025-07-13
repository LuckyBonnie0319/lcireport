import { state, addClass, addStudent, getClassById, editClass, deleteClass, editStudent, deleteStudent } from './app_state.js';
import { showView } from './ui_manager.js';

function renderClassList() {
    const classListEl = document.getElementById('class-list');
    if (!classListEl) return;

    if (state.classes.length === 0) {
        classListEl.innerHTML = '<p class="text-gray-500 text-sm p-2">등록된 반이 없습니다.</p>';
        return;
    }

    let html = '';
    state.classes.forEach(cls => {
        html += `<div class="flex justify-between items-center p-2 bg-gray-50 rounded border">
                    <span class="font-medium text-gray-700">${cls.name}</span>
                    <div class="flex items-center gap-1">
                        <button class="p-1 text-gray-500 hover:text-blue-600 hover:bg-gray-200 rounded-md edit-class-btn" data-class-id="${cls.id}" title="수정">
                            <i data-lucide="pencil" class="h-4 w-4 pointer-events-none"></i>
                        </button>
                        <button class="p-1 text-gray-500 hover:text-red-600 hover:bg-gray-200 rounded-md delete-class-btn" data-class-id="${cls.id}" title="삭제">
                            <i data-lucide="trash-2" class="h-4 w-4 pointer-events-none"></i>
                        </button>
                    </div>
                </div>`;
    });
    classListEl.innerHTML = html;
    try {
        lucide.createIcons();
    } catch(e) { console.error(e); }
}

function renderStudentList() {
    const studentListEl = document.getElementById('student-list');
    if (!studentListEl) return;

    if (state.students.length === 0) {
        studentListEl.innerHTML = '<p class="text-gray-500 text-sm p-2">등록된 학생이 없습니다.</p>';
        return;
    }

    let html = '';
    state.students.forEach(student => {
        const studentClass = getClassById(student.classId);
        html += `<div class="flex justify-between items-center p-2 bg-gray-50 rounded border">
                    <div>
                        <span class="font-medium text-gray-700">${student.name}</span>
                        <span class="text-xs text-gray-500 ml-2">(${studentClass ? studentClass.name : '알 수 없는 반'})</span>
                    </div>
                    <div class="flex items-center gap-1">
                        <button class="p-1 text-gray-500 hover:text-blue-600 hover:bg-gray-200 rounded-md edit-student-btn" data-student-id="${student.id}" title="수정">
                            <i data-lucide="pencil" class="h-4 w-4 pointer-events-none"></i>
                        </button>
                        <button class="p-1 text-gray-500 hover:text-red-600 hover:bg-gray-200 rounded-md delete-student-btn" data-student-id="${student.id}" title="삭제">
                            <i data-lucide="trash-2" class="h-4 w-4 pointer-events-none"></i>
                        </button>
                    </div>
                </div>`;
    });
    studentListEl.innerHTML = html;
    try {
        lucide.createIcons();
    } catch(e) { console.error(e); }
}

function updateClassDropdown() {
    const selectEl = document.getElementById('student-class-select');
    if (!selectEl) return;

    selectEl.innerHTML = '<option value="">반을 선택하세요</option>';
    state.classes.forEach(cls => {
        selectEl.innerHTML += `<option value="${cls.id}">${cls.name}</option>`;
    });
}

export function setupAcademyManagement() {
    const backToDashboardBtn = document.getElementById('back-to-dashboard');
    const addClassBtn = document.getElementById('add-class-btn');
    const addStudentBtn = document.getElementById('add-student-btn');
    const newClassNameInput = document.getElementById('new-class-name');
    const newStudentNameInput = document.getElementById('new-student-name');
    const studentClassSelect = document.getElementById('student-class-select');
    const academyView = document.getElementById('academy-management-view');
    const classListEl = document.getElementById('class-list');
    const studentListEl = document.getElementById('student-list');

    if (backToDashboardBtn) {
        backToDashboardBtn.addEventListener('click', () => {
            showView('dashboard-view');
        });
    }

    if (addClassBtn && newClassNameInput) {
        addClassBtn.addEventListener('click', () => {
            const className = newClassNameInput.value.trim();
            if (!className) {
                alert('반 이름을 입력해주세요.');
                return;
            }

            if (state.classes.some(cls => cls.name === className)) {
                alert('이미 존재하는 반 이름입니다.');
                return;
            }

            addClass(className);
            newClassNameInput.value = '';
            renderClassList();
            updateClassDropdown();
        });

        newClassNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addClassBtn.click();
            }
        });
    }

    if (addStudentBtn && newStudentNameInput && studentClassSelect) {
        addStudentBtn.addEventListener('click', () => {
            const studentName = newStudentNameInput.value.trim();
            const classId = studentClassSelect.value;

            if (!studentName) {
                alert('학생 이름을 입력해주세요.');
                return;
            }

            if (!classId) {
                alert('소속 반을 선택해주세요.');
                return;
            }

            if (state.students.some(student => student.name === studentName && student.classId === parseInt(classId))) {
                alert('해당 반에 이미 같은 이름의 학생이 있습니다.');
                return;
            }

            addStudent(studentName, classId);
            newStudentNameInput.value = '';
            studentClassSelect.value = '';
            renderStudentList();
        });

        newStudentNameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && studentClassSelect.value) {
                addStudentBtn.click();
            }
        });
    }

    if (classListEl) {
        classListEl.addEventListener('click', (e) => {
            const target = e.target.closest('button');
            if (!target) return;
    
            const classId = target.dataset.classId;
            if (!classId) return;
    
            if (target.classList.contains('edit-class-btn')) {
                const cls = state.classes.find(c => c.id === parseInt(classId));
                if (!cls) return;
    
                const newName = prompt('새로운 반 이름을 입력하세요:', cls.name);
                if (newName && newName.trim() !== '' && newName.trim() !== cls.name) {
                    editClass(classId, newName.trim());
                    renderClassList();
                    renderStudentList();
                    updateClassDropdown();
                }
            }
    
            if (target.classList.contains('delete-class-btn')) {
                const cls = state.classes.find(c => c.id === parseInt(classId));
                if (!cls) return;
                
                if (confirm(`'${cls.name}' 반을 삭제하시겠습니까?\n이 반에 속한 모든 학생 정보도 함께 삭제됩니다.`)) {
                    deleteClass(classId);
                    renderClassList();
                    renderStudentList();
                    updateClassDropdown();
                }
            }
        });
    }

    if (studentListEl) {
        studentListEl.addEventListener('click', (e) => {
            const target = e.target.closest('button');
            if (!target) return;
    
            const studentId = target.dataset.studentId;
            if (!studentId) return;

            if (target.classList.contains('edit-student-btn')) {
                const student = state.students.find(s => s.id === parseInt(studentId));
                if (!student) return;
    
                const newName = prompt('새로운 학생 이름을 입력하세요:', student.name);
                if (newName && newName.trim() !== '' && newName.trim() !== student.name) {
                    editStudent(studentId, newName.trim());
                    renderStudentList();
                }
            }
    
            if (target.classList.contains('delete-student-btn')) {
                 const student = state.students.find(s => s.id === parseInt(studentId));
                 if (!student) return;
    
                if (confirm(`'${student.name}' 학생을 삭제하시겠습니까?`)) {
                    deleteStudent(studentId);
                    renderStudentList();
                }
            }
        });
    }

    if (academyView) {
        new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (mutation.attributeName === 'class' && !academyView.classList.contains('hidden')) {
                    renderClassList();
                    renderStudentList();
                    updateClassDropdown();
                }
            }
        }).observe(academyView, { attributes: true });
    }
}
