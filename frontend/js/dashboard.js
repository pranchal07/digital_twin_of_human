// Digital Twin - Dashboard Functionality (UPDATED - Backend Integration)

class DashboardManager {
    constructor() {
        this.charts = {};
        this.userData = null;
        this.init();
    }

    async init() {
        // Protect page - require authentication
        if (!window.DigitalTwinAPI || !window.DigitalTwinAPI.isAuthenticated()) {
            window.location.href = 'login.html';
            return;
        }

        this.setupEventListeners();
        await this.loadUserProfile();
        await this.loadDashboardData();
        this.initializeCharts();
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

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                window.DigitalTwinAPI.logout();
            });
        }
    }

    async loadUserProfile() {
        try {
            this.userData = await window.DigitalTwinAPI.getProfile();
            this.updateUserInfo();
        } catch (error) {
            console.error('Error loading profile:', error);
        }
    }

    updateUserInfo() {
        if (!this.userData) return;

        const userNameElement = document.getElementById('userName');
        const userAvatarElement = document.getElementById('userAvatar');

        if (userNameElement) {
            userNameElement.textContent = `${this.userData.first_name} ${this.userData.last_name}`;
        }

        if (userAvatarElement && this.userData.avatar_url) {
            userAvatarElement.src = this.userData.avatar_url;
        }
    }

    async loadDashboardData() {
        try {
            // Show loading state
            this.showLoading();

            // Get analytics summary (last 30 days by default)
            const analytics = await window.DigitalTwinAPI.getAnalyticsSummary(30);

            // Get recent vitals
            const vitals = await window.DigitalTwinAPI.getVitals({ limit: 30 });

            // Get recent lifestyle data
            const lifestyle = await window.DigitalTwinAPI.getLifestyle({ limit: 30 });

            // Get recent academic data
            const academic = await window.DigitalTwinAPI.getAcademic({ limit: 30 });

            // Get active goals
            const goals = await window.DigitalTwinAPI.getActiveGoals();

            // Update dashboard with real data
            this.updateQuickStats(analytics);
            this.updateRecommendations(analytics);
            this.updateGoals(goals);
            this.updateLastUpdated();

            // Store data for charts
            this.vitalsData = vitals.results || [];
            this.lifestyleData = lifestyle.results || [];
            this.academicData = academic.results || [];

            this.hideLoading();

        } catch (error) {
            console.error('Error loading dashboard data:', error);
            this.hideLoading();
            this.showError('Failed to load dashboard data. Please try refreshing the page.');
        }
    }

    showLoading() {
        const loadingDiv = document.getElementById('dashboardLoading');
        if (loadingDiv) {
            loadingDiv.style.display = 'flex';
        }
    }

    hideLoading() {
        const loadingDiv = document.getElementById('dashboardLoading');
        if (loadingDiv) {
            loadingDiv.style.display = 'none';
        }
    }

    showError(message) {
        const errorDiv = document.getElementById('dashboardError');
        if (errorDiv) {
            errorDiv.textContent = message;
            errorDiv.style.display = 'block';
        }
    }

    updateQuickStats(analytics) {
        // Update vital stats
        if (analytics.vitals) {
            this.updateStat('avgHeartRate', analytics.vitals.avg_heart_rate, 'bpm');
            this.updateStat('avgSpo2', analytics.vitals.avg_spo2, '%');
        }

        // Update lifestyle stats
        if (analytics.lifestyle) {
            this.updateStat('avgSleep', analytics.lifestyle.avg_sleep, 'hrs');
            this.updateStat('avgStress', analytics.lifestyle.avg_stress, '/10');
        }

        // Update academic stats
        if (analytics.academic) {
            this.updateStat('avgStudyHours', analytics.academic.avg_study_hours, 'hrs');
            this.updateStat('avgAttendance', analytics.academic.avg_attendance, '%');
        }

        // Update data count
        const totalRecords = (analytics.vitals?.count || 0) + 
                           (analytics.lifestyle?.count || 0) + 
                           (analytics.academic?.count || 0);
        this.updateStat('totalRecords', totalRecords, 'records');
    }

    updateStat(elementId, value, unit) {
        const element = document.getElementById(elementId);
        if (element && value !== null && value !== undefined) {
            const formattedValue = typeof value === 'number' ? value.toFixed(1) : value;
            element.textContent = `${formattedValue} ${unit}`;
        } else if (element) {
            element.textContent = 'N/A';
        }
    }

    updateRecommendations(analytics) {
        const recommendationsContainer = document.getElementById('recommendations');
        if (!recommendationsContainer) return;

        const recommendations = [];

        // Sleep recommendations
        if (analytics.lifestyle?.avg_sleep) {
            if (analytics.lifestyle.avg_sleep < 7) {
                recommendations.push({
                    text: 'Your average sleep is below recommended levels. Aim for 7-9 hours nightly.',
                    priority: 'high',
                    icon: '😴'
                });
            } else if (analytics.lifestyle.avg_sleep >= 7 && analytics.lifestyle.avg_sleep <= 9) {
                recommendations.push({
                    text: 'Great sleep pattern! Continue maintaining 7-9 hours nightly.',
                    priority: 'low',
                    icon: '✅'
                });
            }
        }

        // Stress recommendations
        if (analytics.lifestyle?.avg_stress) {
            if (analytics.lifestyle.avg_stress > 7) {
                recommendations.push({
                    text: 'Stress levels are high. Consider meditation or yoga to reduce stress.',
                    priority: 'high',
                    icon: '🧘'
                });
            } else if (analytics.lifestyle.avg_stress > 5) {
                recommendations.push({
                    text: 'Moderate stress detected. Try relaxation techniques.',
                    priority: 'medium',
                    icon: '💆'
                });
            }
        }

        // Study hours recommendations
        if (analytics.academic?.avg_study_hours) {
            if (analytics.academic.avg_study_hours < 4) {
                recommendations.push({
                    text: 'Study hours are below average. Try to increase daily study time.',
                    priority: 'medium',
                    icon: '📚'
                });
            }
        }

        // Attendance recommendations
        if (analytics.academic?.avg_attendance) {
            if (analytics.academic.avg_attendance < 75) {
                recommendations.push({
                    text: 'Attendance is below 75%. This may affect academic performance.',
                    priority: 'high',
                    icon: '⚠️'
                });
            } else if (analytics.academic.avg_attendance >= 90) {
                recommendations.push({
                    text: 'Excellent attendance! Keep up the great work.',
                    priority: 'low',
                    icon: '🎯'
                });
            }
        }

        // Display recommendations
        if (recommendations.length > 0) {
            recommendationsContainer.innerHTML = recommendations.map(rec => `
                <div class="recommendation-card priority-${rec.priority}">
                    <span class="rec-icon">${rec.icon}</span>
                    <div class="rec-content">
                        <p>${rec.text}</p>
                        <span class="rec-priority">${rec.priority.toUpperCase()} PRIORITY</span>
                    </div>
                </div>
            `).join('');
        } else {
            recommendationsContainer.innerHTML = '<p class="no-data">Add more data to get personalized recommendations.</p>';
        }
    }

    updateGoals(goals) {
        const goalsContainer = document.getElementById('goalsContainer');
        if (!goalsContainer) return;

        if (!goals || goals.length === 0) {
            goalsContainer.innerHTML = '<p class="no-data">No active goals. Create goals in your profile!</p>';
            return;
        }

        goalsContainer.innerHTML = goals.map(goal => {
            const progress = goal.progress_percentage || 0;
            const daysLeft = this.calculateDaysLeft(goal.deadline);

            return `
                <div class="goal-card">
                    <h4>${goal.title}</h4>
                    <div class="goal-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <span class="progress-text">${progress.toFixed(0)}%</span>
                    </div>
                    <div class="goal-meta">
                        <span>Target: ${goal.target_value} ${goal.unit}</span>
                        <span>${daysLeft} days left</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    calculateDaysLeft(deadline) {
        const today = new Date();
        const deadlineDate = new Date(deadline);
        const diffTime = deadlineDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays > 0 ? diffDays : 0;
    }

    updateLastUpdated() {
        const lastUpdatedElement = document.getElementById('lastUpdated');
        if (lastUpdatedElement) {
            const now = new Date();
            lastUpdatedElement.textContent = now.toLocaleString();
        }
    }

    initializeCharts() {
        // Initialize charts with real data
        this.updateVitalsChart(7);
        this.updateLifestyleChart(7);
    }

    updateVitalsChart(days) {
        // Filter data by days
        const filteredData = this.filterDataByDays(this.vitalsData, days);

        // Prepare chart data
        const labels = filteredData.map(d => new Date(d.timestamp).toLocaleDateString());
        const heartRateData = filteredData.map(d => d.heart_rate);
        const spo2Data = filteredData.map(d => d.oxygen_saturation);

        // Update chart (using Chart.js or similar)
        // This is a placeholder - actual chart implementation depends on your chart library
        console.log('Vitals chart data:', { labels, heartRateData, spo2Data });
    }

    updateLifestyleChart(days) {
        const filteredData = this.filterDataByDays(this.lifestyleData, days);

        const labels = filteredData.map(d => new Date(d.timestamp).toLocaleDateString());
        const sleepData = filteredData.map(d => d.sleep_hours);
        const stressData = filteredData.map(d => d.stress_level);

        console.log('Lifestyle chart data:', { labels, sleepData, stressData });
    }

    filterDataByDays(data, days) {
        if (!data || data.length === 0) return [];

        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        return data.filter(item => {
            const itemDate = new Date(item.timestamp);
            return itemDate >= cutoffDate;
        }).reverse(); // Show oldest to newest
    }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new DashboardManager();
});

// Add CSS for new elements
const style = document.createElement('style');
style.textContent = `
    #dashboardLoading {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(255, 255, 255, 0.9);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 9999;
    }

    #dashboardLoading .spinner {
        border: 4px solid #f3f4f6;
        border-top: 4px solid #667eea;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    #dashboardError {
        background: #fee2e2;
        color: #991b1b;
        padding: 16px;
        border-radius: 8px;
        margin: 20px;
        border: 1px solid #fecaca;
    }

    .no-data {
        text-align: center;
        color: #6b7280;
        padding: 20px;
        font-style: italic;
    }

    .recommendation-card {
        padding: 16px;
        border-radius: 8px;
        margin-bottom: 12px;
        display: flex;
        gap: 12px;
        align-items: start;
    }

    .priority-high {
        background: #fee2e2;
        border-left: 4px solid #ef4444;
    }

    .priority-medium {
        background: #fef3c7;
        border-left: 4px solid #f59e0b;
    }

    .priority-low {
        background: #d1fae5;
        border-left: 4px solid #10b981;
    }

    .rec-icon {
        font-size: 24px;
    }

    .rec-content {
        flex: 1;
    }

    .rec-priority {
        font-size: 0.75rem;
        font-weight: 600;
        color: #6b7280;
    }

    .goal-card {
        background: white;
        padding: 16px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        margin-bottom: 12px;
    }

    .goal-meta {
        display: flex;
        justify-content: space-between;
        margin-top: 8px;
        font-size: 0.875rem;
        color: #6b7280;
    }
`;
document.head.appendChild(style);
