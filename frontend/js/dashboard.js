// Digital Twin - Dashboard Functionality
class DashboardManager {
    constructor() {
        this.healthScore = 78;
        this.riskLevel = 'low';
        this.charts = {};
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadDashboardData();
        this.initializeCharts();
        this.updateHealthScore();
        this.loadRecommendations();
        this.loadGoals();
    }

    setupEventListeners() {
        // Time range selectors
        const vitalsTimeRange = document.getElementById('vitalsTimeRange');
        const lifestyleTimeRange = document.getElementById('lifestyleTimeRange');

        if (vitalsTimeRange) {
            vitalsTimeRange.addEventListener('change', () => {
                this.updateVitalsChart(parseInt(vitalsTimeRange.value));
            });
        }

        if (lifestyleTimeRange) {
            lifestyleTimeRange.addEventListener('change', () => {
                this.updateLifestyleChart(parseInt(lifestyleTimeRange.value));
            });
        }
    }

    loadDashboardData() {
        // Load user data and update dashboard elements
        this.updateQuickStats();
        this.updateLastUpdated();
    }

    updateQuickStats() {
        const stats = {
            avgHeartRate: this.calculateAverageHeartRate(),
            avgSleep: this.calculateAverageSleep(),
            avgStress: this.calculateAverageStress(),
            avgStudyHours: this.calculateAverageStudyHours()
        };

        // Update DOM elements
        const elements = {
            avgHeartRate: document.getElementById('avgHeartRate'),
            avgSleep: document.getElementById('avgSleep'),
            avgStress: document.getElementById('avgStress'),
            avgStudyHours: document.getElementById('avgStudyHours')
        };

        Object.keys(elements).forEach(key => {
            if (elements[key]) {
                elements[key].textContent = stats[key];
            }
        });
    }

    calculateAverageHeartRate() {
        // Get recent vitals data from DataManager
        const recentData = this.getRecentVitalsData(7);
        if (recentData.length === 0) return '72';

        const avg = recentData.reduce((sum, data) => sum + data.heartRate, 0) / recentData.length;
        return Math.round(avg);
    }

    calculateAverageSleep() {
        const recentData = this.getRecentLifestyleData(7);
        if (recentData.length === 0) return '7.2';

        const avg = recentData.reduce((sum, data) => sum + data.sleepHours, 0) / recentData.length;
        return avg.toFixed(1);
    }

    calculateAverageStress() {
        const recentData = this.getRecentLifestyleData(7);
        if (recentData.length === 0) return '4.1';

        const avg = recentData.reduce((sum, data) => sum + data.stressLevel, 0) / recentData.length;
        return avg.toFixed(1);
    }

    calculateAverageStudyHours() {
        const recentData = this.getRecentAcademicData(7);
        if (recentData.length === 0) return '5.8';

        const avg = recentData.reduce((sum, data) => sum + data.studyHours, 0) / recentData.length;
        return avg.toFixed(1);
    }

    getRecentVitalsData(days) {
        // Mock data for demonstration
        return [
            { heartRate: 72, bpSystolic: 118, bpDiastolic: 78, temperature: 98.6, spo2: 99 },
            { heartRate: 75, bpSystolic: 120, bpDiastolic: 80, temperature: 98.4, spo2: 98 },
            { heartRate: 70, bpSystolic: 115, bpDiastolic: 75, temperature: 98.7, spo2: 99 },
            { heartRate: 73, bpSystolic: 119, bpDiastolic: 79, temperature: 98.5, spo2: 98 },
            { heartRate: 71, bpSystolic: 117, bpDiastolic: 77, temperature: 98.6, spo2: 99 }
        ];
    }

    getRecentLifestyleData(days) {
        return [
            { sleepHours: 7.5, stressLevel: 4, dietQuality: 7, waterIntake: 8, physicalActivity: 1.5 },
            { sleepHours: 6.5, stressLevel: 6, dietQuality: 6, waterIntake: 7, physicalActivity: 1 },
            { sleepHours: 8, stressLevel: 3, dietQuality: 8, waterIntake: 9, physicalActivity: 2 },
            { sleepHours: 7.2, stressLevel: 4, dietQuality: 7, waterIntake: 8, physicalActivity: 1.5 },
            { sleepHours: 6.8, stressLevel: 5, dietQuality: 6, waterIntake: 7, physicalActivity: 1 }
        ];
    }

    getRecentAcademicData(days) {
        return [
            { studyHours: 6, focusLevel: 7, attendance: 95, assignmentsCompleted: 90 },
            { studyHours: 4, focusLevel: 5, attendance: 100, assignmentsCompleted: 85 },
            { studyHours: 7, focusLevel: 8, attendance: 100, assignmentsCompleted: 95 },
            { studyHours: 5.5, focusLevel: 6, attendance: 95, assignmentsCompleted: 88 },
            { studyHours: 6.2, focusLevel: 7, attendance: 100, assignmentsCompleted: 92 }
        ];
    }

    initializeCharts() {
        this.createVitalsChart();
        this.createLifestyleChart();
    }

    createVitalsChart() {
        const ctx = document.getElementById('vitalsChart');
        if (!ctx) return;

        const vitalsData = this.getRecentVitalsData(30);

        this.charts.vitals = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.generateDateLabels(vitalsData.length),
                datasets: [
                    {
                        label: 'Heart Rate (bpm)',
                        data: vitalsData.map(d => d.heartRate),
                        borderColor: 'rgb(239, 68, 68)',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.4,
                        fill: false
                    },
                    {
                        label: 'Systolic BP',
                        data: vitalsData.map(d => d.bpSystolic),
                        borderColor: 'rgb(59, 130, 246)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4,
                        fill: false
                    },
                    {
                        label: 'SpO2 (%)',
                        data: vitalsData.map(d => d.spo2),
                        borderColor: 'rgb(16, 185, 129)',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        titleColor: '#1e293b',
                        bodyColor: '#64748b',
                        borderColor: '#e2e8f0',
                        borderWidth: 1
                    }
                },
                scales: {
                    x: {
                        display: true,
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        display: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }

    createLifestyleChart() {
        const ctx = document.getElementById('lifestyleChart');
        if (!ctx) return;

        const lifestyleData = this.getRecentLifestyleData(30);

        this.charts.lifestyle = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.generateDateLabels(lifestyleData.length),
                datasets: [
                    {
                        label: 'Sleep Hours',
                        data: lifestyleData.map(d => d.sleepHours),
                        borderColor: 'rgb(16, 185, 129)',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Stress Level',
                        data: lifestyleData.map(d => d.stressLevel),
                        borderColor: 'rgb(245, 158, 11)',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        tension: 0.4,
                        yAxisID: 'y1'
                    },
                    {
                        label: 'Physical Activity',
                        data: lifestyleData.map(d => d.physicalActivity),
                        borderColor: 'rgb(168, 85, 247)',
                        backgroundColor: 'rgba(168, 85, 247, 0.1)',
                        tension: 0.4,
                        yAxisID: 'y'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            usePointStyle: true,
                            padding: 20
                        }
                    }
                },
                scales: {
                    x: {
                        display: true,
                        grid: {
                            display: false
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: 'Hours'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Level (1-10)'
                        },
                        grid: {
                            drawOnChartArea: false,
                        },
                    }
                }
            }
        });
    }

    generateDateLabels(count) {
        const labels = [];
        const today = new Date();

        for (let i = count - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        }

        return labels;
    }

    updateVitalsChart(days) {
        if (!this.charts.vitals) return;

        const vitalsData = this.getRecentVitalsData(days);

        this.charts.vitals.data.labels = this.generateDateLabels(vitalsData.length);
        this.charts.vitals.data.datasets[0].data = vitalsData.map(d => d.heartRate);
        this.charts.vitals.data.datasets[1].data = vitalsData.map(d => d.bpSystolic);
        this.charts.vitals.data.datasets[2].data = vitalsData.map(d => d.spo2);

        this.charts.vitals.update('active');
    }

    updateLifestyleChart(days) {
        if (!this.charts.lifestyle) return;

        const lifestyleData = this.getRecentLifestyleData(days);

        this.charts.lifestyle.data.labels = this.generateDateLabels(lifestyleData.length);
        this.charts.lifestyle.data.datasets[0].data = lifestyleData.map(d => d.sleepHours);
        this.charts.lifestyle.data.datasets[1].data = lifestyleData.map(d => d.stressLevel);
        this.charts.lifestyle.data.datasets[2].data = lifestyleData.map(d => d.physicalActivity);

        this.charts.lifestyle.update('active');
    }

    updateHealthScore() {
        const scoreElement = document.getElementById('healthScore');
        const lastUpdatedElement = document.getElementById('lastUpdated');

        if (scoreElement) {
            this.animateValue(scoreElement, 0, this.healthScore, 2000);
        }

        if (lastUpdatedElement) {
            lastUpdatedElement.textContent = 'Today';
        }

        // Create health score chart if canvas exists
        this.createHealthScoreChart();
    }

    createHealthScoreChart() {
        const ctx = document.getElementById('healthScoreChart');
        if (!ctx) return;

        const score = this.healthScore;
        const remaining = 100 - score;

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [score, remaining],
                    backgroundColor: [
                        this.getScoreColor(score),
                        'rgba(0, 0, 0, 0.05)'
                    ],
                    borderWidth: 0,
                    cutout: '75%'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        enabled: false
                    }
                }
            }
        });
    }

    getScoreColor(score) {
        if (score >= 80) return 'rgb(16, 185, 129)';
        if (score >= 60) return 'rgb(245, 158, 11)';
        if (score >= 40) return 'rgb(239, 68, 68)';
        return 'rgb(153, 27, 27)';
    }

    animateValue(element, start, end, duration) {
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const current = Math.floor(start + (end - start) * progress);
            element.textContent = current;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    loadRecommendations() {
        const recommendationsGrid = document.getElementById('recommendationsGrid');
        if (!recommendationsGrid) return;

        const recommendations = this.generateRecommendations();

        recommendationsGrid.innerHTML = recommendations.map(rec => `
            <div class="recommendation-card ${rec.type}">
                <div class="recommendation-icon">${rec.icon}</div>
                <div class="recommendation-content">
                    <h4>${rec.title}</h4>
                    <p>${rec.description}</p>
                    <span class="recommendation-priority">${rec.priority}</span>
                </div>
            </div>
        `).join('');
    }

    generateRecommendations() {
        return [
            {
                icon: '🌙',
                title: 'Sleep Optimization',
                description: 'Great sleep pattern! Continue maintaining 7-9 hours nightly.',
                priority: 'Low Priority',
                type: 'success'
            },
            {
                icon: '🧘',
                title: 'Stress Management',
                description: 'Consider meditation or yoga to further reduce stress levels.',
                priority: 'Medium Priority',
                type: 'warning'
            },
            {
                icon: '💪',
                title: 'Physical Activity',
                description: 'Increase weekly exercise to 3-5 hours for optimal health.',
                priority: 'High Priority',
                type: 'info'
            }
        ];
    }

    loadGoals() {
        const goalsGrid = document.getElementById('goalsGrid');
        if (!goalsGrid) return;

        const goals = this.getUserGoals();

        goalsGrid.innerHTML = goals.map(goal => `
            <div class="goal-card">
                <div class="goal-header">
                    <h4>${goal.title}</h4>
                    <span class="goal-progress">${goal.progress}%</span>
                </div>
                <div class="goal-progress-bar">
                    <div class="progress-fill" style="width: ${goal.progress}%"></div>
                </div>
                <div class="goal-details">
                    <span class="goal-target">Target: ${goal.targetValue} ${goal.unit}</span>
                    <span class="goal-current">Current: ${goal.currentValue}</span>
                </div>
            </div>
        `).join('');
    }

    getUserGoals() {
        return [
            {
                title: 'Improve Sleep Quality',
                targetValue: '8.0',
                currentValue: '7.2',
                unit: 'quality score',
                progress: 90
            },
            {
                title: 'Reduce Stress Level',
                targetValue: '4.0',
                currentValue: '4.3',
                unit: 'stress level',
                progress: 85
            }
        ];
    }

    updateLastUpdated() {
        const element = document.getElementById('lastUpdated');
        if (element) {
            element.textContent = 'Today, ' + new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit'
            });
        }
    }

    refreshDashboard() {
        this.loadDashboardData();
        this.updateQuickStats();
        this.updateHealthScore();
        this.loadRecommendations();
        this.loadGoals();

        if (this.charts.vitals) {
            this.updateVitalsChart(30);
        }
        if (this.charts.lifestyle) {
            this.updateLifestyleChart(30);
        }

        DigitalTwinApp.showToast('Dashboard refreshed successfully!', 'success');
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('vitalsChart') || document.getElementById('lifestyleChart')) {
        window.dashboardManager = new DashboardManager();
    }
});