// Initialize variables to store ratings
let ratings = {
    'sleep-quality': 0,
    'energy-level': 0,
    'pain-level': 0,
    'emotional-state': 0,
    'cognitive-clarity': 0,
    'stress-level': 0
};

let trendChart;

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Set current date
    const currentDate = new Date();
    document.getElementById('current-date').textContent = currentDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    // Add click handlers to all rating buttons
    const ratingButtons = document.querySelectorAll('.rating-button');
    ratingButtons.forEach(button => {
        button.addEventListener('click', handleRatingClick);
    });

    // Add handlers for action buttons
    document.getElementById('reset-btn').addEventListener('click', resetAssessment);
    document.getElementById('save-btn').addEventListener('click', saveAssessment);
    document.getElementById('export-btn').addEventListener('click', exportToDakBoard);

    // Initialize trend chart
    initTrendChart();
    updateTrendChart();
});

// Handle rating button clicks
function handleRatingClick(event) {
    const button = event.target;
    const value = parseInt(button.dataset.value);
    const container = button.parentElement;
    const category = container.id;

    // Remove selected state from all buttons in this category
    container.querySelectorAll('.rating-button').forEach(btn => {
        btn.setAttribute('data-selected', 'false');
    });

    // Set selected state for clicked button
    button.setAttribute('data-selected', 'true');

    // Store the rating
    ratings[category] = value;

    // Update summary
    updateSummary();
}

// Calculate and update summary
function updateSummary() {
    const physicalScores = [
        ratings['sleep-quality'],
        ratings['energy-level'],
        ratings['pain-level']
    ].filter(score => score > 0);

    const mentalScores = [
        ratings['emotional-state'],
        ratings['cognitive-clarity'],
        ratings['stress-level']
    ].filter(score => score > 0);

    if (physicalScores.length > 0 || mentalScores.length > 0) {
        const physicalAvg = physicalScores.length > 0 
            ? physicalScores.reduce((a, b) => a + b) / physicalScores.length 
            : 0;
        const mentalAvg = mentalScores.length > 0 
            ? mentalScores.reduce((a, b) => a + b) / mentalScores.length 
            : 0;
        const overallAvg = (physicalAvg + mentalAvg) / (physicalAvg && mentalAvg ? 2 : 1);

        // Update summary text
        document.getElementById('summary-text').innerHTML = `
            Physical: ${physicalAvg.toFixed(1)}/5<br>
            Mental: ${mentalAvg.toFixed(1)}/5<br>
            Overall: ${overallAvg.toFixed(1)}/5
        `;

        // Update status marker
        const marker = document.getElementById('status-marker');
        marker.style.left = `${(overallAvg / 5) * 100}%`;
    }
}

// Reset assessment
function resetAssessment() {
    // Reset all ratings
    Object.keys(ratings).forEach(key => ratings[key] = 0);

    // Reset all buttons
    document.querySelectorAll('.rating-button').forEach(btn => {
        btn.setAttribute('data-selected', 'false');
    });

    // Reset checkboxes
    document.querySelectorAll('.support-checkbox input').forEach(checkbox => {
        checkbox.checked = false;
    });

    // Reset summary
    document.getElementById('summary-text').textContent = 'Complete the assessment to see your summary';
    document.getElementById('status-marker').style.left = '10%';
}

// Save assessment
function saveAssessment() {
    const assessment = {
        date: new Date().toISOString(),
        ratings: {...ratings},
        supportNeeds: Array.from(document.querySelectorAll('.support-checkbox input'))
            .filter(cb => cb.checked)
            .map(cb => cb.id),
        summary: {
            physical: Object.values(ratings).slice(0, 3).reduce((a, b) => a + b) / 3,
            mental: Object.values(ratings).slice(3).reduce((a, b) => a + b) / 3
        }
    };

    // Save to localStorage
    const savedAssessments = JSON.parse(localStorage.getItem('assessments') || '[]');
    savedAssessments.push(assessment);
    localStorage.setItem('assessments', JSON.stringify(savedAssessments));

    // Update trend chart
    updateTrendChart();

    alert('Assessment saved successfully!');
}

// Initialize trend chart
function initTrendChart() {
    const ctx = document.getElementById('trendChart').getContext('2d');
    trendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Physical',
                    borderColor: '#2ecc71',
                    data: [],
                    tension: 0.4,
                    fill: false
                },
                {
                    label: 'Mental',
                    borderColor: '#e74c3c',
                    data: [],
                    tension: 0.4,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 5,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#ffffff'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#ffffff'
                    }
                }
            },
            plugins: {
                legend: {
                    labels: {
                        color: '#ffffff'
                    }
                }
            }
        }
    });
}

// Update trend chart
function updateTrendChart() {
    const savedAssessments = JSON.parse(localStorage.getItem('assessments') || '[]');
    const recentAssessments = savedAssessments.slice(-7);

    trendChart.data.labels = recentAssessments.map(a => 
        new Date(a.date).toLocaleDateString()
    );
    
    trendChart.data.datasets[0].data = recentAssessments.map(a => a.summary.physical);
    trendChart.data.datasets[1].data = recentAssessments.map(a => a.summary.mental);
    
    trendChart.update();
}

// Export to DakBoard
function exportToDakBoard() {
    const summary = {
        physical: Object.values(ratings).slice(0, 3).reduce((a, b) => a + b) / 3,
        mental: Object.values(ratings).slice(3).reduce((a, b) => a + b) / 3
    };
    summary.average = (summary.physical + summary.mental) / 2;

    const currentTime = new Date().toLocaleTimeString();
    const currentDate = new Date().toLocaleDateString();
    
    const displayContent = `
        <div style="font-family: Arial; padding: 20px; color: white; background: #1a1a1a;">
            <h2>Capability Assessment</h2>
            <p>Last Updated: ${currentDate} ${currentTime}</p>
            <div style="font-size: 24px; margin: 15px 0;">
                Overall: ${summary.average.toFixed(1)}/5
            </div>
            <div style="background: linear-gradient(to right, #e74c3c, #e67e22, #f1c40f, #2ecc71);
                        height: 20px; border-radius: 10px; position: relative;">
                <div style="position: absolute; width: 20px; height: 20px; background: white;
                        border-radius: 50%; left: ${(summary.average / 5) * 100}%;
                        transform: translateX(-50%);"></div>
            </div>
            <div style="margin-top: 15px;">
                <p>Physical: ${summary.physical.toFixed(1)}/5</p>
                <p>Mental: ${summary.mental.toFixed(1)}/5</p>
            </div>
        </div>
    `;

    const blob = new Blob([displayContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    alert(`Add this URL to DakBoard as a Website widget:\n${url}`);
}
