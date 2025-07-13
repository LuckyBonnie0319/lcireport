import { setupLogin } from './login.js';
import { showView } from './ui_manager.js';
import { setupDashboard } from './dashboard_controller.js';
import { setupExamCreation } from './exam_controller.js';
import { setupAnswerEntry } from './answer_controller.js';
import { setupAcademyManagement } from './academy_controller.js';
import { generateReportFromSubmission } from './report_generator.js';
import { addStudentAnswer } from './app_state.js';

document.addEventListener('DOMContentLoaded', () => {
    try {
        lucide.createIcons();
    } catch (error) {
        console.error("Error initializing Lucide icons:", error);
    }

    setupLogin();
    setupDashboard();
    setupExamCreation();
    setupAnswerEntry();
    setupAcademyManagement();

    window.navigateTo = showView;
    
    window.submitAndGenerateReport = (submission) => {
        addStudentAnswer(submission);
        generateReportFromSubmission(submission);
    };
});
