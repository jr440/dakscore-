// Continuing the trendChart initialization
                            borderColor: '#3498db',
                            tension: 0.4,
                            fill: false
                        },
                        {
                            label: 'Physical',
                            data: [],
                            borderColor: '#2ecc71',
                            tension: 0.4,
                            fill: false
                        },
                        {
                            label: 'Mental',
                            data: [],
                            borderColor: '#e74c3c',
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

        // Update trend chart with new data
        function updateTrendChart() {
            const savedAssessments = JSON.parse(localStorage.getItem('assessments') || '[]');
            const recentAssessments = savedAssessments.slice(-7);
            
            trendChart.data.labels = recentAssessments.map(a => 
                new Date(a.date).toLocaleDateString()
            );
            
            trendChart.data.datasets[0].data = recentAssessments.map(a => a.summary.average);
            trendChart.data.datasets[1].data = recentAssessments.map(a => a.summary.physical);
            trendChart.data.datasets[2].data = recentAssessments.map(a => a.summary.mental);
            
            trendChart.update();
        }

        // DakBoard export functionality
        document.getElementById('export-btn').addEventListener('click', () => {
            const summary = calculateSummary();
            const currentTime = new Date().toLocaleTimeString();
            const currentDate = new Date().toLocaleDateString();
            
            // Create HTML content for DakBoard
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

            // Create a data blob and URL
            const blob = new Blob([displayContent], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            
            // Show the URL to the user
            alert(`Add this URL to DakBoard as a Website widget:\n${url}`);
        });

        // Initialize chart when page loads
        document.addEventListener('DOMContentLoaded', () => {
            initTrendChart();
            updateTrendChart();
        });
    </script>
