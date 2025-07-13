import { showView } from './ui_manager.js';

export function setupLogin() {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;

    const usernameInput = document.getElementById('id');
    const passwordInput = document.getElementById('password');

    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        
        const username = usernameInput.value;
        const password = passwordInput.value;

        if (username === 'teacher' && password === '1234') {
            showView('exam-creation-view');
        } else {
            alert('아이디 또는 비밀번호가 일치하지 않습니다.');
            passwordInput.value = '';
            passwordInput.focus();
        }
    });
}
