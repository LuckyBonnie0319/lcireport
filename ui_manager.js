const views = ['login-view', 'dashboard-view', 'academy-management-view', 'exam-creation-view', 'student-entry-view', 'report-view', 'market-automation-view'];

export function showView(viewId) {
    views.forEach(id => {
        const view = document.getElementById(id);
        if (view) {
            if (id === viewId) {
                view.classList.remove('hidden');
            } else {
                view.classList.add('hidden');
            }
        }
    });

    if (viewId !== 'report-view') {
        const reportView = document.getElementById('report-view');
        if (reportView) {
            reportView.innerHTML = '';
        }
    }

    window.scrollTo(0, 0);
}
