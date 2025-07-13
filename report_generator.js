import { state } from './app_state.js';
import { showView } from './ui_manager.js';
import { saveReportEdit, getReportEdit } from './app_state.js';

const THRESHOLDS = {
    strength: 85,
    weakness: 70,
    critical: 60
};

const STRATEGY_BANK = {
    "Phonics": {
        critical: "The Phonics score is critically low, indicating fundamental gaps in understanding letter-sound relationships. Immediate intervention is required. Focus on mastering individual letter sounds first, using flashcards and multisensory techniques (e.g., tracing letters in sand). Progress to blending two sounds (e.g., 'a-t' -> 'at'), then three. Daily, targeted 10-minute practice sessions are crucial for building this foundational skill.",
        regular: "To strengthen Phonics skills, move from basic sounds to more complex patterns like digraphs (sh, ch, th) and vowel teams (ea, ai, oa). Play word-building games where the student changes one letter to make a new word (e.g., cat -> hat -> sat). Regular practice with decodable texts that focus on specific phonics patterns will significantly improve reading fluency and accuracy."
    },
    "Reading": {
        critical: "The Reading score indicates significant challenges. It is essential to establish a daily reading routine of 15-20 minutes. Start with books slightly below the current level to build confidence. Practice predicting story outcomes before reading endings, and after each page, pause to summarize what happened. This active engagement transforms passive reading into comprehension building.",
        regular: "To improve Reading comprehension, practice identifying the main idea of each paragraph in daily reading materials. Create a reading journal where three key points from each story are written down. Additionally, practice reading aloud to improve fluency, which directly impacts comprehension. Focus on expression and pausing at punctuation marks."
    },
    "Sentence Comprehension": {
        critical: "Sentence Comprehension requires immediate attention. Begin with simple sentence patterns: subject-verb-object. Use colored cards to represent different parts of speech and physically arrange them to build sentences. Progress to combining two simple sentences with conjunctions (and, but, because). Practice daily by taking one complex sentence from reading materials and breaking it into simpler parts.",
        regular: "To enhance Sentence Comprehension, practice sentence transformation exercises. Take a simple sentence and expand it by adding descriptive words, then practice the reverse by simplifying complex sentences. Create sentence puzzles where words are mixed up and need rearranging. This hands-on approach makes grammar rules tangible rather than abstract."
    },
    "Vocabulary": {
        critical: "Vocabulary development needs intensive support. Create a word wall at home with 5 new words weekly. For each word, include a picture, the word in a sentence, and a personal connection. Practice using these words in daily conversation. Play word association games where one word leads to related words, building semantic networks.",
        regular: "To expand Vocabulary, implement the 'Word of the Day' practice. Choose words from current reading materials and create word maps showing synonyms, antonyms, and example sentences. Practice using new words in different contexts - if learning 'enormous,' use it to describe various things throughout the day. This contextual repetition ensures retention."
    },
    "Grammar": {
        critical: "Grammar understanding requires structured intervention. Focus on one grammar rule per week. For verb tenses, create timelines and place actions on them. For subject-verb agreement, use physical movements - jump once for singular subjects, twice for plural. Practice correcting intentionally incorrect sentences, explaining why changes are needed.",
        regular: "To improve Grammar accuracy, maintain a grammar journal noting one correctly used grammar rule noticed in daily reading. Practice sentence building with dice - roll for subject, verb, and object, then construct grammatically correct sentences. Focus on common error patterns and create personal rules or mnemonics to remember correct usage."
    },
    "Listening Comprehension": {
        critical: "Listening Comprehension needs immediate strengthening. Start with short, clear audio clips (2-3 minutes) with visual support. Listen once for general understanding, then again for specific details. Practice 'listen and draw' activities where instructions are followed to create pictures. Gradually remove visual supports as skills improve.",
        regular: "To enhance Listening Comprehension, practice active listening with podcasts or audiobooks designed for language learners. After listening to short segments, practice retelling the content in your own words. Play listening games like 'Simon Says' with increasingly complex instructions. Focus on identifying key words rather than understanding every word."
    }
};

function generateAreaAnalysisText(area, score) {
    if (score >= THRESHOLDS.strength) {
        return `Excellent performance in ${area}. Continue with challenging materials.`;
    } else if (score >= THRESHOLDS.weakness) {
        return `Good foundation in ${area}. Focus on advanced applications.`;
    } else if (score >= THRESHOLDS.critical) {
        return `${area} needs improvement. Regular practice recommended.`;
    } else {
        return `${area} requires immediate attention and intensive support.`;
    }
}

function generateStrengthsText(strengths) {
    if (strengths.length === 0) return "모든 영역에서 꾸준한 성과를 보이고 있으며, 각 영역에서 개선의 여지가 있습니다.";
    if (strengths.length === 1) return `${strengths[0].area} (${strengths[0].score}점)에서 뛰어난 강점을 보입니다.`;
    const sortedStrengths = strengths.sort((a, b) => b.score - a.score);
    const topTwo = sortedStrengths.slice(0, 2).map(s => `${s.area} (${s.score}점)`).join(' 및 ');
    if (sortedStrengths.length === 2) return `${topTwo}에서 뛰어난 강점을 보입니다.`;
    return `${topTwo}에서 뛰어난 강점을 보이며, 다른 영역에서도 우수한 성과를 나타냅니다.`;
}

function generateWeaknessesText(weaknesses) {
    if (weaknesses.length === 0) return "특별한 약점은 발견되지 않았습니다. 심화 자료를 통해 계속 도전하는 것이 좋습니다.";
    const sortedWeaknesses = weaknesses.sort((a, b) => a.score - b.score);
    const critical = sortedWeaknesses.filter(w => w.score < THRESHOLDS.critical);
    const regular = sortedWeaknesses.filter(w => w.score >= THRESHOLDS.critical);

    let text = '';
    if (critical.length > 0) {
        const criticalAreas = critical.map(w => `${w.area} (${w.score}점)`).join(', ');
        text += `${criticalAreas} 영역에서 즉각적인 집중 개선이 필요합니다. `;
    }
    if (regular.length > 0) {
        const regularAreas = regular.map(w => `${w.area} (${w.score}점)`).join(', ');
        text += `${regularAreas} 영역에서 추가적인 연습이 필요합니다.`;
    }
    return text.trim();
}

function generateLearningStrategy(weaknesses) {
    if (weaknesses.length === 0) return "모든 영역에 걸쳐 심화 자료로 학생에게 계속 도전 과제를 제시하세요. 현재의 강점을 유지하고 더욱 발전시키기 위해 다양하고 흥미로운 활동에 집중하세요.";
    
    const priorityAreas = weaknesses.sort((a, b) => a.score - b.score).slice(0, 3);
    const strategies = priorityAreas.map(weakness => {
        const level = weakness.score < THRESHOLDS.critical ? 'critical' : 'regular';
        return STRATEGY_BANK[weakness.area][level];
    });

    if (strategies.length > 1) {
        strategies.push("이 전략들을 점진적으로 실행하며, 한 번에 한 영역에 2-3주간 집중한 후 다른 영역을 추가하세요. 꾸준함과 인내가 개선의 핵심입니다.");
    }
    return strategies.join("\\n\\n");
}

function generateEvaluationAnalysis(scores) {
    const strengths = [];
    const weaknesses = [];

    for (const [area, score] of Object.entries(scores)) {
        if (score >= THRESHOLDS.strength) strengths.push({ area, score });
        else if (score < THRESHOLDS.weakness) weaknesses.push({ area, score });
    }

    return {
        strengths: generateStrengthsText(strengths),
        weaknesses: generateWeaknessesText(weaknesses),
        customLearningStrategy: generateLearningStrategy(weaknesses)
    };
}

function gradeSubmission(submission) {
    const exam = state.exams.find(e => e.id === submission.examId);
    if (!exam) throw new Error("Exam not found");

    const areaScores = {
        "Phonics": { earned: 0, total: 0 },
        "Reading": { earned: 0, total: 0 },
        "Sentence Comprehension": { earned: 0, total: 0 },
        "Vocabulary": { earned: 0, total: 0 },
        "Grammar": { earned: 0, total: 0 },
        "Listening Comprehension": { earned: 0, total: 0 },
    };

    exam.questions.forEach((question, index) => {
        const area = question.type;
        if (!areaScores.hasOwnProperty(area)) return;

        areaScores[area].total += 1;
        
        const studentSubmissionData = submission.answers[index];
        const studentAnswer = (studentSubmissionData && studentSubmissionData.answer ? studentSubmissionData.answer : "").trim().toLowerCase();
        const correctAnswer = (question.answer || "").trim().toLowerCase();

        if (studentAnswer === correctAnswer) {
            areaScores[area].earned += 1;
        }
    });

    return areaScores;
}

function showSaveIndicator() {
    let indicator = document.querySelector('.save-indicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.className = 'save-indicator';
        indicator.innerHTML = '<i data-lucide="check" class="inline-block w-4 h-4 mr-1"></i>저장됨';
        document.body.appendChild(indicator);
        if (window.lucide) {
            lucide.createIcons();
        }
    }
    
    indicator.classList.add('show');
    setTimeout(() => {
        indicator.classList.remove('show');
    }, 2000);
}

function setupEditableReportSections(reportKey, originalAnalysis) {
    const strengthsElement = document.getElementById('strengths-editable');
    const weaknessesElement = document.getElementById('weaknesses-editable');
    const strategyElement = document.getElementById('strategy-editable');

    if (strengthsElement) {
        const savedStrengths = getReportEdit(reportKey, 'strengths');
        strengthsElement.value = savedStrengths || originalAnalysis.strengths;
        
        strengthsElement.addEventListener('input', () => {
            saveReportEdit(reportKey, 'strengths', strengthsElement.value);
            showSaveIndicator();
        });
    }

    if (weaknessesElement) {
        const savedWeaknesses = getReportEdit(reportKey, 'weaknesses');
        weaknessesElement.value = savedWeaknesses || originalAnalysis.weaknesses;
        
        weaknessesElement.addEventListener('input', () => {
            saveReportEdit(reportKey, 'weaknesses', weaknessesElement.value);
            showSaveIndicator();
        });
    }

    if (strategyElement) {
        const savedStrategy = getReportEdit(reportKey, 'customLearningStrategy');
        strategyElement.value = savedStrategy || originalAnalysis.customLearningStrategy.replace(/\\n\\n/g, '\n\n');
        
        strategyElement.addEventListener('input', () => {
            saveReportEdit(reportKey, 'customLearningStrategy', strategyElement.value);
            showSaveIndicator();
        });
    }
}

async function createFullReportAsHTML(reportData) {
    const canvasWidth = 400;
    const canvasHeight = 400;
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = canvasWidth;
    offscreenCanvas.height = canvasHeight;
    const ctx = offscreenCanvas.getContext('2d');

    const chartImageBase64 = await new Promise((resolve, reject) => {
        try {
            new Chart(ctx, {
                type: 'radar',
                data: {
                    labels: Object.keys(reportData.scores),
                    datasets: [{
                        label: 'Evaluation Score',
                        data: Object.values(reportData.scores),
                        backgroundColor: 'rgba(59, 130, 246, 0.2)',
                        borderColor: 'rgb(59, 130, 246)',
                        pointBackgroundColor: 'rgb(59, 130, 246)',
                        borderWidth: 2
                    }]
                },
                options: {
                    animation: {
                        onComplete: (animation) => {
                           resolve(animation.chart.toBase64Image('image/png', 1.0));
                           animation.chart.destroy();
                        }
                    },
                    responsive: false,
                    maintainAspectRatio: false,
                    devicePixelRatio: 3, 
                    scales: {
                        r: {
                            angleLines: { color: 'rgba(0, 0, 0, 0.1)' },
                            suggestedMin: 0,
                            suggestedMax: 100,
                            pointLabels: {
                                font: { size: 14, weight: 'bold', family: "'Noto Sans KR', sans-serif" },
                                color: '#334155'
                            },
                            grid: { color: 'rgba(0, 0, 0, 0.1)' },
                            ticks: {
                                stepSize: 20,
                                backdropColor: 'transparent',
                                color: '#64748b',
                                font: { size: 12 }
                            }
                        }
                    },
                    plugins: { legend: { display: false } }
                }
            });
        } catch (error) {
            console.error("Chart generation error:", error);
            reject(error);
        }
    });

    const scoreDetailsHTML = Object.entries(reportData.rawScores)
        .map(([category, scoreData]) => {
            
const percentageScore = scoreData.total > 0 ? Math.round((scoreData.earned / scoreData.total) * 100) : 0;
            const analysisText = generateAreaAnalysisText(category, percentageScore);
            return `<div class="flex justify-between items-start p-3 rounded-md bg-slate-50 border border-slate-200">
                <div class="flex-1">
                    <h4 class="font-semibold text-slate-700">${category}</h4>
                    <p class="text-xs text-slate-600 mt-1 leading-relaxed">${analysisText}</p>
                </div>
                <p class="font-bold text-lg text-blue-700 ml-4">${scoreData.earned} <span class="text-sm text-slate-500 font-medium">/ ${scoreData.total}</span></p>
            </div>`;
        })
        .join('');
    
    const reportKey = `${reportData.student.id}_${reportData.exam.id}`;
    const savedStrengths = getReportEdit(reportKey, 'strengths') || reportData.analysis.strengths;
    const savedWeaknesses = getReportEdit(reportKey, 'weaknesses') || reportData.analysis.weaknesses;
    const savedStrategy = getReportEdit(reportKey, 'customLearningStrategy') || reportData.analysis.customLearningStrategy.replace(/\\n\\n/g, '\n\n');
    
    const today = new Date();
    const formattedDate = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;

    return `
    <div class="report-body bg-gray-100 p-4 sm:p-6 lg:p-8">
        <div class="no-print w-full max-w-5xl mx-auto flex justify-between items-center mb-4">
            <h2 class="text-xl font-bold text-gray-800">학생 최종 리포트</h2>
            <div>
                 <button onclick="window.print()" class="btn-secondary"><i data-lucide="printer" class="inline-block w-4 h-4 mr-2"></i>인쇄</button>
                 <button onclick="window.navigateTo('dashboard-view')" class="btn-primary"><i data-lucide="arrow-left" class="inline-block w-4 h-4 mr-2"></i>대시보드로</button>
            </div>
        </div>

        <div id="report-container" class="w-full max-w-5xl mx-auto space-y-8 print:space-y-0">
            <div class="report-page bg-white p-8 sm:p-12 shadow-lg print:shadow-none">
                <header class="text-left pb-4 mb-8 border-b-2 border-slate-200">
                    <h1 class="page-title">LCI KIDS CLUB English Academy</h1>
                    <h2 class="page-subtitle">${reportData.exam.name} Evaluation Report</h2>
                </header>

                <main class="flex-grow">
                    <section id="student-info" class="mb-8">
                        <div class="grid grid-cols-3 gap-6 text-base p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <div><span class="block text-sm font-semibold text-slate-500">Student Name</span><span class="block text-slate-800 font-bold text-lg">${reportData.student.name}</span></div>
                            <div><span class="block text-sm font-semibold text-slate-500">Class</span><span class="block text-slate-800 font-bold text-lg">${reportData.exam.className}</span></div>
                            <div><span class="block text-sm font-semibold text-slate-500">Evaluation Date</span><span class="block text-slate-800 font-bold text-lg">${formattedDate}</span></div>
                        </div>
                    </section>

                    <div class="grid grid-cols-1 md:grid-cols-12 gap-8 print-flex-container">
                        <div class="md:col-span-5 print-flex-item">
                            <section class="p-6 border border-slate-200 rounded-lg bg-white h-full flex flex-col">
                                <h3 class="section-title">Evaluation Graph</h3>
                                <div class="chart-container-wrapper"><img src="${chartImageBase64}" alt="Evaluation Score Radar Chart" /></div>
                                <div class="mt-4 border-t border-slate-200 pt-4">
                                    <p class="text-xs text-slate-600 leading-relaxed"><b>Phonics:</b> 개별 소리와 글자의 관계를 이해하고 단어를 정확하게 발음하는 능력입니다.</p>
                                    <p class="text-xs text-slate-600 leading-relaxed"><b>Reading:</b> 글을 읽고 핵심 내용을 파악하는 능력입니다.</p>
                                    <p class="text-xs text-slate-600 leading-relaxed"><b>Sentence Comprehension:</b> 문장의 구조와 의미를 정확히 이해하는 능력입니다.</p>
                                    <p class="text-xs text-slate-600 leading-relaxed"><b>Vocabulary:</b> 상황에 맞는 어휘를 알고 활용하는 능력입니다.</p>
                                    <p class="text-xs text-slate-600 leading-relaxed"><b>Grammar:</b> 문법 규칙에 맞춰 올바른 문장을 만드는 능력입니다.</p>
                                    <p class="text-xs text-slate-600 leading-relaxed"><b>Listening Comprehension:</b> 영어 대화를 듣고 이해하는 능력입니다.</p>
                                </div>
                            </section>
                        </div>
                        <div class="md:col-span-7 print-flex-item">
                            <section id="test-results">
                                <h3 class="section-title">Detailed Scores</h3>
                                <div class="space-y-3">${scoreDetailsHTML}</div>
                            </section>
                        </div>
                    </div>
                </main>
                <footer class="text-center text-xs text-gray-400 mt-auto pt-6">LCI KIDS CLUB Academic Department | Page 1</footer>
            </div>

            <div class="report-page bg-white p-8 sm:p-12 shadow-lg print:shadow-none">
                <header class="text-left mb-8"><h1 class="page-title">LCI KIDS CLUB English Academy</h1></header>
                <main class="flex-grow">
                    <div class="space-y-8">
                        <section id="strengths-weaknesses">
                            <div class="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-8">
                                <div class="assessment-box">
                                    <h4 class="assessment-subtitle">
                                        <span class="flex items-center">
                                            <i data-lucide="trending-up" class="w-5 h-5 mr-2 text-green-600"></i>
                                            Strengths
                                        </span>
                                        <button class="edit-button btn-success no-print" onclick="toggleEdit('strengths')">
                                            <i data-lucide="edit-3" class="w-3 h-3 mr-1"></i>편집
                                        </button>
                                    </h4>
                                    <div id="strengths-display" class="assessment-text whitespace-pre-line">${savedStrengths}</div>
                                    <textarea id="strengths-editable" class="editable-text hidden">${savedStrengths}</textarea>
                                </div>
                                <div class="assessment-box">
                                    <h4 class="assessment-subtitle">
                                        <span class="flex items-center">
                                            <i data-lucide="trending-down" class="w-5 h-5 mr-2 text-red-600"></i>
                                            Weaknesses
                                        </span>
                                        <button class="edit-button btn-success no-print" onclick="toggleEdit('weaknesses')">
                                            <i data-lucide="edit-3" class="w-3 h-3 mr-1"></i>편집
                                        </button>
                                    </h4>
                                    <div id="weaknesses-display" class="assessment-text whitespace-pre-line">${savedWeaknesses}</div>
                                    <textarea id="weaknesses-editable" class="editable-text hidden">${savedWeaknesses}</textarea>
                                </div>
                            </div>
                        </section>
                        <section id="learning-strategy">
                            <div class="flex justify-between items-center mb-4">
                                <h3 class="section-title mb-0">Customized Analysis</h3>
                                <button class="edit-button btn-success no-print" onclick="toggleEdit('strategy')">
                                    <i data-lucide="edit-3" class="w-3 h-3 mr-1"></i>편집
                                </button>
                            </div>
                            <div class="strategy-item">
                                <div id="strategy-display" class="assessment-text whitespace-pre-line">${savedStrategy}</div>
                                <textarea id="strategy-editable" class="strategy-editable hidden">${savedStrategy}</textarea>
                            </div>
                        </section>
                    </div>
                </main>
                <footer class="text-center text-xs text-gray-400 mt-auto pt-6">LCI KIDS CLUB Academic Department | Page 2</footer>
            </div>
        </div>
    </div>
    `;
}

export function generateReportFromSubmission(submission) {
    const reportContainer = document.getElementById('report-view');
    if (!reportContainer) return;

    reportContainer.innerHTML = '<div class="bg-white p-8 rounded-lg text-center"><p>리포트를 생성 중입니다. 잠시만 기다려주세요...</p></div>';
    showView('report-view');

    try {
        const rawScores = gradeSubmission(submission);
        
        const percentageScores = {};
        const scoresForAnalysis = {};

        for (const area in rawScores) {
            const { earned, total } = rawScores[area];
            if (total > 0) {
                const score = Math.round((earned / total) * 100);
                percentageScores[area] = score;
                scoresForAnalysis[area] = score;
            } else {
                percentageScores[area] = 0;
            }
        }
        
        const analysis = generateEvaluationAnalysis(scoresForAnalysis);
        const student = state.students.find(s => s.id === submission.studentId);
        const exam = state.exams.find(e => e.id === submission.examId);
        
        if (!student || !exam) {
            throw new Error("Student or Exam not found for this submission.");
        }
        const classInfo = state.classes.find(c => c.id === student.classId);
        const examWithClassName = { ...exam, className: classInfo ? classInfo.name : 'N/A' };

        const reportData = { student, exam: examWithClassName, scores: percentageScores, rawScores, analysis };
        
        createFullReportAsHTML(reportData)
            .then(reportHTML => {
                reportContainer.innerHTML = reportHTML;
                if (window.lucide) {
                    lucide.createIcons();
                }

                const reportKey = `${reportData.student.id}_${reportData.exam.id}`;
                setupEditableReportSections(reportKey, reportData.analysis);

                window.toggleEdit = function(section) {
                    const displayElement = document.getElementById(`${section}-display`);
                    const editableElement = document.getElementById(`${section}-editable`);
                    const button = event.target.closest('button');
                    
                    if (displayElement.classList.contains('hidden')) {
                        displayElement.textContent = editableElement.value;
                        displayElement.classList.remove('hidden');
                        editableElement.classList.add('hidden');
                        button.innerHTML = '<i data-lucide="edit-3" class="w-3 h-3 mr-1"></i>편집';
                    } else {
                        displayElement.classList.add('hidden');
                        editableElement.classList.remove('hidden');
                        editableElement.focus();
                        button.innerHTML = '<i data-lucide="check" class="w-3 h-3 mr-1"></i>완료';
                    }
                    
                    if (window.lucide) {
                        lucide.createIcons();
                    }
                };

                window.navigateTo = showView;
            })
            .catch(error => {
                reportContainer.innerHTML = '<div class="bg-white p-8 rounded-lg text-center text-red-600"><p>오류: 리포트 생성에 실패했습니다. 콘솔을 확인해주세요.</p></div>';
                console.error('Report generation failed:', error);
            });

    } catch (error) {
        console.error("Failed to generate report:", error);
        reportContainer.innerHTML = `<div class="bg-white p-8 rounded-lg text-center text-red-600"><p>리포트 생성에 실패했습니다: ${error.message}</p></div>`;
        showView('report-view');
    }
}
