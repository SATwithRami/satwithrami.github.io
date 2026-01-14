// DOM Elements
const elements = {
    // Loading
    loadingScreen: document.getElementById('loading-screen'),
    
    // Theme & Language
    darkToggle: document.getElementById('darkToggle'),
    langButtons: document.querySelectorAll('.chip[data-lang]'),
    
    // Inputs
    ksqInput: document.getElementById('ksq'),
    bsqInput: document.getElementById('bsq'),
    schemeSelect: document.getElementById('schemeSelect'),
    
    // Weights
    customWeights: document.getElementById('customWeights'),
    kqsWeight: document.getElementById('kqsWeight'),
    bsqWeight: document.getElementById('bsqWeight'),
    kqsWeightVal: document.getElementById('kqsWeightVal'),
    bsqWeightVal: document.getElementById('bsqWeightVal'),
    
    // Buttons
    btnCalc: document.getElementById('btn-calc'),
    btnSave: document.getElementById('btn-save'),
    btnClear: document.getElementById('btn-clear'),
    btnPDF: document.getElementById('btn-pdf'),
    btnCSV: document.getElementById('btn-csv'),
    btnShare: document.getElementById('btn-share'),
    btnCountdown: document.getElementById('btn-countdown'),
    
    // Results
    resultEl: document.getElementById('result'),
    convertedEl: document.getElementById('converted'),
    tipsBox: document.getElementById('tipsBox'),
    tipsText: document.getElementById('tips-text'),
    
    // Calculator
    resultCalc: document.getElementById('resultCalc'),
    calcButtons: document.querySelectorAll('.calc-buttons button'),
    
    // Countdown
    examDate: document.getElementById('examDate'),
    countdownEl: document.getElementById('countdown'),
    
    // Labels
    titleText: document.getElementById('title-text'),
    calcTitle: document.getElementById('calc-title'),
    historyTitle: document.getElementById('history-title'),
    examTitle: document.getElementById('exam-title'),
    calcBoxTitle: document.getElementById('calc-box-title'),
    labelKsq: document.getElementById('label-ksq'),
    labelBsq: document.getElementById('label-bsq'),
    labelScheme: document.getElementById('label-scheme'),
    labelResult: document.getElementById('label-result'),
    calcBtnText: document.getElementById('calc-btn-text'),
    countdownBtn: document.getElementById('countdown-btn'),
    
    // Footer
    yearEl: document.getElementById('year')
};

// State
let currentLang = localStorage.getItem('lang') || 'az';
let darkMode = localStorage.getItem('dark') === 'true';
let history = JSON.parse(localStorage.getItem('history') || '[]');
let chart = null;
let countdownTimer = null;
let currentResult = null;

// Translations
const translations = {
    az: {
        title: "Akademik Qiymət Kalkulyatoru",
        calcTitle: "Qiymət Kalkulyatoru",
        historyTitle: "Tarixçə",
        examTitle: "Geri Sayım",
        calcBoxTitle: "Kalkulyator",
        ksq: "KSQ Qiymətləri (vergüllə ayırın):",
        bsq: "BSQ Qiyməti (əgər varsa):",
        scheme: "Qiymətləndirmə Sistemi:",
        result: "Yekun Qiymət:",
        calcBtn: "Hesabla",
        saveBtn: "Saxla",
        clearBtn: "Təmizlə",
        countdownBtn: "Başlat",
        needKQS: "Ən azı bir KSQ qiyməti daxil edin.",
        saved: "Nəticə saxlandı!",
        cleared: "Tarix təmizləndi.",
        tipHigh: "Möhtəşəm! Davamlı performansınızı qoruyun.",
        tipImproveK: "KSQ ortalamanızı yüksəltmək üçün daha çox məşq edin.",
        tipImproveB: "BSQ üzərində daha çox işləyin.",
        defaultTip: "Qiymətlərinizi daxil edin"
    },
    en: {
        title: "Academic Grade Calculator",
        calcTitle: "Grade Calculator",
        historyTitle: "History",
        examTitle: "Countdown",
        calcBoxTitle: "Calculator",
        ksq: "KSQ Scores (comma separated):",
        bsq: "BSQ Score (if any):",
        scheme: "Grading System:",
        result: "Final Grade:",
        calcBtn: "Calculate",
        saveBtn: "Save",
        clearBtn: "Clear",
        countdownBtn: "Start",
        needKQS: "Enter at least one KSQ score.",
        saved: "Result saved!",
        cleared: "History cleared.",
        tipHigh: "Excellent! Keep up the great performance.",
        tipImproveK: "Improve your KSQ scores with more practice.",
        tipImproveB: "Focus on improving your BSQ strategy.",
        defaultTip: "Enter your scores to begin"
    }
};

// Initialize
function init() {
    // Set year
    if (elements.yearEl) {
        elements.yearEl.textContent = new Date().getFullYear();
    }
    
    // Apply language
    applyLanguage(currentLang);
    
    // Apply theme
    if (darkMode) {
        document.body.classList.add('dark-theme');
        elements.darkToggle.checked = true;
    }
    
    // Event Listeners
    elements.darkToggle?.addEventListener('change', toggleTheme);
    elements.schemeSelect?.addEventListener('change', handleSchemeChange);
    elements.btnCalc?.addEventListener('click', calculate);
    elements.btnSave?.addEventListener('click', saveResult);
    elements.btnClear?.addEventListener('click', clearHistory);
    elements.btnCountdown?.addEventListener('click', startCountdown);
    elements.ksqInput?.addEventListener('input', calculate);
    elements.bsqInput?.addEventListener('input', calculate);
    elements.kqsWeight?.addEventListener('input', updateWeights);
    
    // Language switcher
    elements.langButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            applyLanguage(btn.dataset.lang);
        });
    });
    
    // Calculator buttons
    elements.calcButtons?.forEach(btn => {
        btn.addEventListener('click', handleCalculatorButton);
    });
    
    // Initialize weights
    updateWeights();
    
    // Initialize chart
    initChart();
}

// Language Functions
function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    
    const t = translations[lang];
    
    // Update all text
    if (elements.titleText) elements.titleText.textContent = t.title;
    if (elements.calcTitle) elements.calcTitle.textContent = t.calcTitle;
    if (elements.historyTitle) elements.historyTitle.textContent = t.historyTitle;
    if (elements.examTitle) elements.examTitle.textContent = t.examTitle;
    if (elements.calcBoxTitle) elements.calcBoxTitle.textContent = t.calcBoxTitle;
    if (elements.labelKsq) elements.labelKsq.innerHTML = `<i class="fas fa-tasks"></i> ${t.ksq}`;
    if (elements.labelBsq) elements.labelBsq.innerHTML = `<i class="fas fa-file-alt"></i> ${t.bsq}`;
    if (elements.labelScheme) elements.labelScheme.innerHTML = `<i class="fas fa-globe"></i> ${t.scheme}`;
    if (elements.labelResult) elements.labelResult.textContent = t.result;
    if (elements.calcBtnText) elements.calcBtnText.textContent = t.calcBtn;
    if (elements.countdownBtn) elements.countdownBtn.textContent = t.countdownBtn;
    if (elements.btnSave) elements.btnSave.innerHTML = `<i class="fas fa-save"></i> ${t.saveBtn}`;
    if (elements.btnClear) elements.btnClear.innerHTML = `<i class="fas fa-trash"></i> ${t.clearBtn}`;
    
    // Update language buttons
    elements.langButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
    
    // Recalculate
    calculate();
}

// Theme Functions
function toggleTheme() {
    darkMode = elements.darkToggle.checked;
    localStorage.setItem('dark', darkMode);
    
    if (darkMode) {
        document.body.classList.add('dark-theme');
    } else {
        document.body.classList.remove('dark-theme');
    }
}

// Weight Functions
function updateWeights() {
    if (elements.kqsWeightVal) {
        elements.kqsWeightVal.textContent = elements.kqsWeight.value;
    }
    if (elements.bsqWeightVal) {
        elements.bsqWeightVal.textContent = 100 - elements.kqsWeight.value;
        elements.bsqWeight.value = 100 - elements.kqsWeight.value;
    }
    
    if (elements.schemeSelect.value === 'custom') {
        calculate();
    }
}

function handleSchemeChange() {
    const scheme = elements.schemeSelect.value;
    elements.customWeights.style.display = scheme === 'custom' ? 'block' : 'none';
    calculate();
}

// Calculation Functions
function parseKSQ(input) {
    if (!input) return [];
    return input.split(',')
        .map(s => parseFloat(s.trim()))
        .filter(n => !isNaN(n) && n >= 0 && n <= 100);
}

function calculateAZ(ksqScores, bsq) {
    const kAvg = ksqScores.length ? ksqScores.reduce((a, b) => a + b, 0) / ksqScores.length : 0;
    const b = isNaN(bsq) ? 0 : bsq;
    return (kAvg * 0.4) + (b * 0.6);
}

function calculateCustom(ksqScores, bsq, kWeight) {
    const kAvg = ksqScores.length ? ksqScores.reduce((a, b) => a + b, 0) / ksqScores.length : 0;
    const b = isNaN(bsq) ? 0 : bsq;
    const kw = kWeight / 100;
    const bw = 1 - kw;
    return (kAvg * kw) + (b * bw);
}

function calculate() {
    const t = translations[currentLang];
    const ksqScores = parseKSQ(elements.ksqInput.value);
    const bsqScore = parseFloat(elements.bsqInput.value);
    const scheme = elements.schemeSelect.value;
    
    // Validate
    if ((scheme === 'az' || scheme === 'custom') && ksqScores.length === 0) {
        showResult('-', t.needKQS);
        return;
    }
    
    let result;
    switch(scheme) {
        case 'az':
            result = calculateAZ(ksqScores, bsqScore);
            break;
        case 'custom':
            const kWeight = parseFloat(elements.kqsWeight.value);
            result = calculateCustom(ksqScores, bsqScore, kWeight);
            break;
        default:
            // For other schemes, just average all scores
            const allScores = [...ksqScores];
            if (!isNaN(bsqScore)) allScores.push(bsqScore);
            if (allScores.length === 0) {
                showResult('-', t.needKQS);
                return;
            }
            result = allScores.reduce((a, b) => a + b, 0) / allScores.length;
    }
    
    // Format and display
    const formatted = result.toFixed(2);
    currentResult = result;
    
    // Show result
    showResult(formatted);
    
    // Show tip
    showTip(result, ksqScores, bsqScore);
}

function showResult(value, message = '') {
    if (elements.resultEl) {
        elements.resultEl.textContent = value;
    }
    
    if (elements.convertedEl) {
        // Simple conversion display
        if (value !== '-') {
            elements.convertedEl.textContent = `${value}/100`;
        } else {
            elements.convertedEl.textContent = '';
        }
    }
    
    if (message && elements.tipsText) {
        elements.tipsText.textContent = message;
    }
}

function showTip(final, ksqScores, bsq) {
    const t = translations[currentLang];
    let tip = t.defaultTip;
    
    if (final >= 90) {
        tip = t.tipHigh;
    } else if (ksqScores.length > 0 && !isNaN(bsq)) {
        const kAvg = ksqScores.reduce((a, b) => a + b, 0) / ksqScores.length;
        if (kAvg < bsq) {
            tip = t.tipImproveK;
        } else {
            tip = t.tipImproveB;
        }
    }
    
    if (elements.tipsText) {
        elements.tipsText.textContent = tip;
    }
}

function saveResult() {
    if (!currentResult) {
        calculate();
        if (!currentResult) return;
    }
    
    const t = translations[currentLang];
    const now = new Date().toLocaleString();
    const ksqScores = parseKSQ(elements.ksqInput.value);
    const bsqScore = parseFloat(elements.bsqInput.value);
    
    const entry = {
        date: now,
        ksq: ksqScores,
        bsq: isNaN(bsqScore) ? 0 : bsqScore,
        final: currentResult,
        scheme: elements.schemeSelect.value
    };
    
    history.push(entry);
    localStorage.setItem('history', JSON.stringify(history));
    
    // Update chart
    updateChart();
    
    // Show success
    if (elements.tipsText) {
        elements.tipsText.textContent = t.saved;
        elements.tipsBox.style.borderLeftColor = '#10b981';
    }
}

function clearHistory() {
    const t = translations[currentLang];
    if (confirm(currentLang === 'az' ? 'Tarixi təmizləmək istədiyinizə əminsiniz?' : 'Are you sure you want to clear history?')) {
        history = [];
        localStorage.setItem('history', JSON.stringify(history));
        updateChart();
        
        if (elements.tipsText) {
            elements.tipsText.textContent = t.cleared;
            elements.tipsBox.style.borderLeftColor = '#ef4444';
        }
    }
}

// Chart Functions
function initChart() {
    const ctx = document.getElementById('historyChart')?.getContext('2d');
    if (!ctx) return;
    
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: history.map(h => h.date.split(',')[0]),
            datasets: [{
                label: 'Final Grade',
                data: history.map(h => h.final),
                borderColor: '#4f46e5',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100
                }
            }
        }
    });
}

function updateChart() {
    if (chart) {
        chart.data.labels = history.map(h => h.date.split(',')[0]);
        chart.data.datasets[0].data = history.map(h => h.final);
        chart.update();
    } else {
        initChart();
    }
}

// Countdown Functions
function startCountdown() {
    if (!elements.examDate.value) return;
    
    const target = new Date(elements.examDate.value);
    
    // Clear existing timer
    if (countdownTimer) clearInterval(countdownTimer);
    
    // Update immediately
    updateCountdown(target);
    
    // Update every second
    countdownTimer = setInterval(() => updateCountdown(target), 1000);
}

function updateCountdown(target) {
    const now = new Date();
    const diff = target - now;
    
    if (diff <= 0) {
        if (elements.countdownEl) {
            elements.countdownEl.textContent = '0 gün';
        }
        if (countdownTimer) clearInterval(countdownTimer);
        return;
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    if (elements.countdownEl) {
        elements.countdownEl.textContent = `${days}g ${hours}sa ${minutes}dəq ${seconds}san`;
    }
}

// Calculator Functions
function handleCalculatorButton(e) {
    const value = e.target.dataset.c;
    const current = elements.resultCalc.value;
    
    switch(value) {
        case 'C':
            elements.resultCalc.value = '0';
            break;
        case 'B':
            elements.resultCalc.value = current.length > 1 ? current.slice(0, -1) : '0';
            break;
        case '=':
            try {
                let expr = current.replace(/×/g, '*').replace(/÷/g, '/');
                const result = Function('"use strict"; return (' + expr + ')')();
                elements.resultCalc.value = Number.isFinite(result) ? result.toString() : 'Error';
            } catch {
                elements.resultCalc.value = 'Error';
            }
            break;
        default:
            elements.resultCalc.value = current === '0' ? value : current + value;
    }
}

// Export Functions (simplified)
if (elements.btnPDF) {
    elements.btnPDF.addEventListener('click', () => {
        alert('PDF export would open here');
    });
}

if (elements.btnCSV) {
    elements.btnCSV.addEventListener('click', () => {
        if (history.length === 0) {
            alert('No data to export');
            return;
        }
        
        const csv = ['Date,KSQ,BSQ,Final,Scheme', ...history.map(h => 
            `${h.date},${h.ksq.join(';')},${h.bsq},${h.final},${h.scheme}`
        )].join('\n');
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'grades.csv';
        a.click();
        URL.revokeObjectURL(url);
    });
}

if (elements.btnShare && navigator.share) {
    elements.btnShare.addEventListener('click', async () => {
        try {
            await navigator.share({
                title: 'My Academic Grades',
                text: `My final grade: ${currentResult || 'Not calculated yet'}`,
                url: window.location.href
            });
        } catch (err) {
            console.log('Share cancelled');
        }
    });
} else if (elements.btnShare) {
    elements.btnShare.addEventListener('click', () => {
        const text = `My academic grade: ${currentResult || 'Not calculated yet'}`;
        navigator.clipboard.writeText(text).then(() => {
            alert('Copied to clipboard!');
        });
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
