// Question data
const questions = {
    physical: [
        "How is your energy level today?",
        "How well did you sleep last night?",
        "How is your physical comfort level?",
        "How well can you focus on physical tasks?"
    ],
    mental: [
        "How is your mood today?",
        "How is your anxiety level? (5 = low anxiety, 1 = high anxiety)",
        "How well can you concentrate?",
        "How is your emotional regulation today?"
    ]
};

let currentSection = 'physical';
let currentQuestionIndex = 0;
let answers = {
    physical: [],
    mental: []
};

// Initialize the assessment
function initializeAssessment() {
    currentSection = 'physical';
    currentQuestionIndex = 0;
    answers = {
        physical: [],
        mental: []
    };
    displayCurrentQuestion();
}

// Display the current question
function displayCurrentQuestion() {
    const questionElement = document.getElementById('question');
    const questionText = questions[currentSection][currentQuestionIndex];
    questionElement.textContent = questionText;
    
    // Update progress indicator
    updateProgress();
}

// Handle rating button clicks
function handleRating(rating) {
    answers[currentSection][currentQuestionIndex] = rating;
    
    if (currentQuestionIndex < questions[currentSection].length - 1) {
        currentQuestionIndex++;
    } else if (currentSection === 'physical') {
        currentSection = 'mental';
        currentQuestionIndex = 0;
    } else {
        // Assessment complete
        saveAssessment();
        showResults();
        return;
    }
    
    displayCurrentQuestion();
}

// Update progress indicator
function updateProgress() {
    const totalQuestions = questions.physical.length + questions.mental.length;
    const currentQuestion = currentSection === 'physical' 
        ? currentQuestionIndex + 1
        : questions.physical.length + currentQuestionIndex + 1;
    
    document.getElementById('progress').textContent = 
        `Question ${currentQuestion} of ${totalQuestions}`;
}

// Calculate summary
function calculateSummary() {
    const physicalAvg = answers.physical.reduce((a, b) => a + b, 0) / answers.physical.length;
    const mentalAvg = answers.mental.reduce((a, b) => a + b, 0) / answers.mental.length;
    
    return {
        physical: physicalAvg,
        mental: mentalAvg,
        average: (physicalAvg + mentalAvg) / 2
    };
}

// Save assessment
function saveAssessment() {
    const summary = calculateSummary();
    const assessment = {
        date: new Date().toISOString(),
        answers: answers,
        summary: summary
    };
    
    const savedAssessments = JSON.parse(localStorage.getItem('assessments') || '[]');
    savedAssessments.push(assessment);
    localStorage.setItem('assessments', JSON.stringify(savedAssessments));
}

// Show results
function showResults() {
    const summary = calculateSummary();
    const resultsDiv = document.getElementById('results');
    const assessmentDiv = document.getElementById('assessment');
    
    resultsDiv.innerHTML = `
        <h2>Assessment Results</h2>
        <p>Physical Average: ${summary.physical.toFixed(1)}/5</p>
        <p>Mental Average: ${summary.mental.toFixed(1)}/5</p>
        <p>Overall Average: ${summary.average.toFixed(1)}/5</p>
        <button onclick="initializeAssessment()">Start New Assessment</button>
    `;
    
    assessmentDiv.style.display = 'none';
    resultsDiv.style.display = 'block';
    
    updateTrendChart();
}

// Add event listeners for rating buttons
document.addEventListener('DOMContentLoaded', () => {
    const ratingButtons = document.querySelectorAll('.rating-btn');
    ratingButtons.forEach(button => {
        button.addEventListener('click', () => {
            handleRating(parseInt(button.dataset.rating));
        });
    });
    
    initializeAssessment();
    initTrendChart();
    updateTrendChart();
});
