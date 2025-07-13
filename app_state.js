function loadFromLocalStorage(key, defaultValue) {
    try {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : defaultValue;
    } catch (error) {
        console.error(`Error loading ${key} from localStorage:`, error);
        return defaultValue;
    }
}

function saveToLocalStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
        console.error(`Error saving ${key} to localStorage:`, error);
    }
}

export const state = {
    classes: loadFromLocalStorage('classes', [
        { id: 1, name: '초급 A반' },
        { id: 2, name: '중급 B반' },
    ]),
    students: loadFromLocalStorage('students', [
        { id: 101, name: '김민준', classId: 1 },
        { id: 102, name: '이서연', classId: 1 },
        { id: 103, name: '박도윤', classId: 1 },
        { id: 201, name: '최아린', classId: 2 },
        { id: 202, name: '정하은', classId: 2 },
    ]),
    exams: loadFromLocalStorage('exams', []),
    studentAnswers: loadFromLocalStorage('studentAnswers', []),
    reportEdits: loadFromLocalStorage('reportEdits', {}),
    currentExam: null,
    currentStudent: null,
    nextClassId: loadFromLocalStorage('classes', []).length > 0 ? Math.max(...loadFromLocalStorage('classes', []).map(c => c.id)) + 1 : 3,
    nextStudentId: loadFromLocalStorage('students', []).length > 0 ? Math.max(...loadFromLocalStorage('students', []).map(s => s.id)) + 1 : 203
};

export function addClass(className) {
    const newClass = {
        id: state.nextClassId++,
        name: className
    };
    state.classes.push(newClass);
    saveToLocalStorage('classes', state.classes);
    saveToLocalStorage('nextClassId', state.nextClassId);
    return newClass;
}

export function editClass(classId, newName) {
    const classToEdit = state.classes.find(cls => cls.id === parseInt(classId));
    if (classToEdit) {
        classToEdit.name = newName;
        saveToLocalStorage('classes', state.classes);
    }
}

export function deleteClass(classId) {
    const id = parseInt(classId);
    state.classes = state.classes.filter(cls => cls.id !== id);
    saveToLocalStorage('classes', state.classes);
    state.students = state.students.filter(student => student.classId !== id);
    saveToLocalStorage('students', state.students);
}

export function addStudent(studentName, classId) {
    const newStudent = {
        id: state.nextStudentId++,
        name: studentName,
        classId: parseInt(classId)
    };
    state.students.push(newStudent);
    saveToLocalStorage('students', state.students);
    saveToLocalStorage('nextStudentId', state.nextStudentId);
    return newStudent;
}

export function editStudent(studentId, newName) {
    const studentToEdit = state.students.find(student => student.id === parseInt(studentId));
    if (studentToEdit) {
        studentToEdit.name = newName;
        saveToLocalStorage('students', state.students);
    }
}

export function deleteStudent(studentId) {
    state.students = state.students.filter(student => student.id !== parseInt(studentId));
    saveToLocalStorage('students', state.students);
}

export function addExam(exam) {
    exam.id = Date.now();
    state.exams.push(exam);
    saveToLocalStorage('exams', state.exams);
}

export function addStudentAnswer(submission)
{
    const newAnswer = {
        id: Date.now(),
        ...submission
    };
    state.studentAnswers.push(newAnswer);
    saveToLocalStorage('studentAnswers', state.studentAnswers);
    return newAnswer;
}

export function saveReportEdit(reportKey, section, content) {
    if (!state.reportEdits[reportKey]) {
        state.reportEdits[reportKey] = {};
    }
    state.reportEdits[reportKey][section] = content;
    saveToLocalStorage('reportEdits', state.reportEdits);
}

export function getReportEdit(reportKey, section) {
    return state.reportEdits[reportKey] && state.reportEdits[reportKey][section];
}

export function getClassById(classId) {
    return state.classes.find(c => c.id === parseInt(classId));
}

export function getStudentsByClassId(classId) {
    return state.students.filter(s => s.classId === parseInt(classId));
}

window.appState = state;
