// Digital Twin - Data Management
class DataManager {
    constructor() {
        this.storageKeys = {
            healthData: 'dt_health_data',
            userProfile: 'dt_user_profile',
            predictions: 'dt_predictions',
            goals: 'dt_health_goals',
            settings: 'dt_settings'
        };
        this.init();
    }

    init() {
        this.initializeDefaultData();
        this.setupStorageListener();
    }

    initializeDefaultData() {
        // Initialize with sample data if no data exists
        if (!this.getHealthData().length) {
            this.generateSampleData();
        }

        if (!this.getUserProfile()) {
            this.createDefaultProfile();
        }

        if (!this.getSettings()) {
            this.createDefaultSettings();
        }
    }

    generateSampleData() {
        const sampleData = [];
        const now = new Date();

        // Generate 30 days of sample data
        for (let i = 29; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);

            sampleData.push({
                id: Date.now() - i * 86400000,
                timestamp: date.toISOString(),
                vitals: {
                    heartRate: this.randomBetween(65, 85),
                    bpSystolic: this.randomBetween(110, 130),
                    bpDiastolic: this.randomBetween(70, 85),
                    temperature: this.randomBetween(98.0, 99.2),
                    spo2: this.randomBetween(96, 100)
                },
                lifestyle: {
                    sleepHours: this.randomBetween(6.0, 9.0),
                    stressLevel: this.randomBetween(2, 7),
                    dietQuality: this.randomBetween(5, 9),
                    waterIntake: this.randomBetween(6, 12),
                    physicalActivity: this.randomBetween(0.5, 3.0)
                },
                academic: {
                    studyHours: this.randomBetween(3, 8),
                    attendance: this.randomBetween(85, 100),
                    assignmentsCompleted: this.randomBetween(80, 100),
                    focusLevel: this.randomBetween(4, 9)
                }
            });
        }

        this.saveHealthData(sampleData);
    }

    randomBetween(min, max) {
        return Math.round((Math.random() * (max - min) + min) * 10) / 10;
    }

    createDefaultProfile() {
        const profile = {
            name: 'Alex Johnson',
            age: 22,
            email: 'alex.johnson@student.edu',
            height: 175, // cm
            weight: 70, // kg
            gender: 'other',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.saveUserProfile(profile);
    }

    createDefaultSettings() {
        const settings = {
            theme: 'ocean',
            notifications: true,
            dataRetention: 365, // days
            privacyMode: false,
            language: 'en',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        };

        this.saveSettings(settings);
    }

    setupStorageListener() {
        // Listen for storage changes from other tabs
        window.addEventListener('storage', (e) => {
            if (Object.values(this.storageKeys).includes(e.key)) {
                this.handleStorageChange(e);
            }
        });
    }

    handleStorageChange(event) {
        // Handle data synchronization between tabs
        const eventData = {
            key: event.key,
            oldValue: event.oldValue,
            newValue: event.newValue
        };

        // Emit custom event for other components to listen
        window.dispatchEvent(new CustomEvent('dataChanged', { detail: eventData }));
    }

    // Health Data Management
    getHealthData() {
        try {
            const data = localStorage.getItem(this.storageKeys.healthData);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error reading health data:', error);
            return [];
        }
    }

    saveHealthData(data) {
        try {
            localStorage.setItem(this.storageKeys.healthData, JSON.stringify(data));
            this.updateLastModified();
            return true;
        } catch (error) {
            console.error('Error saving health data:', error);
            return false;
        }
    }

    addHealthEntry(entry) {
        const data = this.getHealthData();
        const newEntry = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            ...entry
        };

        data.push(newEntry);
        return this.saveHealthData(data);
    }

    updateHealthEntry(id, updates) {
        const data = this.getHealthData();
        const index = data.findIndex(entry => entry.id === id);

        if (index !== -1) {
            data[index] = { ...data[index], ...updates, updatedAt: new Date().toISOString() };
            return this.saveHealthData(data);
        }

        return false;
    }

    deleteHealthEntry(id) {
        const data = this.getHealthData();
        const filteredData = data.filter(entry => entry.id !== id);
        return this.saveHealthData(filteredData);
    }

    getHealthDataInRange(startDate, endDate) {
        const data = this.getHealthData();
        const start = new Date(startDate);
        const end = new Date(endDate);

        return data.filter(entry => {
            const entryDate = new Date(entry.timestamp);
            return entryDate >= start && entryDate <= end;
        });
    }

    getLatestHealthEntry() {
        const data = this.getHealthData();
        return data.length > 0 ? data[data.length - 1] : null;
    }

    // User Profile Management
    getUserProfile() {
        try {
            const profile = localStorage.getItem(this.storageKeys.userProfile);
            return profile ? JSON.parse(profile) : null;
        } catch (error) {
            console.error('Error reading user profile:', error);
            return null;
        }
    }

    saveUserProfile(profile) {
        try {
            const updatedProfile = {
                ...profile,
                updatedAt: new Date().toISOString()
            };
            localStorage.setItem(this.storageKeys.userProfile, JSON.stringify(updatedProfile));
            return true;
        } catch (error) {
            console.error('Error saving user profile:', error);
            return false;
        }
    }

    updateUserProfile(updates) {
        const currentProfile = this.getUserProfile() || {};
        const updatedProfile = { ...currentProfile, ...updates };
        return this.saveUserProfile(updatedProfile);
    }

    // Predictions Management
    getPredictions() {
        try {
            const predictions = localStorage.getItem(this.storageKeys.predictions);
            return predictions ? JSON.parse(predictions) : [];
        } catch (error) {
            console.error('Error reading predictions:', error);
            return [];
        }
    }

    savePrediction(prediction) {
        const predictions = this.getPredictions();
        const newPrediction = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            ...prediction
        };

        predictions.push(newPrediction);

        try {
            localStorage.setItem(this.storageKeys.predictions, JSON.stringify(predictions));
            return true;
        } catch (error) {
            console.error('Error saving prediction:', error);
            return false;
        }
    }

    getLatestPrediction() {
        const predictions = this.getPredictions();
        return predictions.length > 0 ? predictions[predictions.length - 1] : null;
    }

    // Health Goals Management
    getHealthGoals() {
        try {
            const goals = localStorage.getItem(this.storageKeys.goals);
            return goals ? JSON.parse(goals) : [];
        } catch (error) {
            console.error('Error reading health goals:', error);
            return [];
        }
    }

    saveHealthGoal(goal) {
        const goals = this.getHealthGoals();
        const newGoal = {
            id: Date.now(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            isCompleted: false,
            ...goal
        };

        goals.push(newGoal);

        try {
            localStorage.setItem(this.storageKeys.goals, JSON.stringify(goals));
            return newGoal;
        } catch (error) {
            console.error('Error saving health goal:', error);
            return null;
        }
    }

    updateHealthGoal(id, updates) {
        const goals = this.getHealthGoals();
        const index = goals.findIndex(goal => goal.id === id);

        if (index !== -1) {
            goals[index] = {
                ...goals[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };

            try {
                localStorage.setItem(this.storageKeys.goals, JSON.stringify(goals));
                return goals[index];
            } catch (error) {
                console.error('Error updating health goal:', error);
                return null;
            }
        }

        return null;
    }

    deleteHealthGoal(id) {
        const goals = this.getHealthGoals();
        const filteredGoals = goals.filter(goal => goal.id !== id);

        try {
            localStorage.setItem(this.storageKeys.goals, JSON.stringify(filteredGoals));
            return true;
        } catch (error) {
            console.error('Error deleting health goal:', error);
            return false;
        }
    }

    getActiveGoals() {
        return this.getHealthGoals().filter(goal => !goal.isCompleted);
    }

    getCompletedGoals() {
        return this.getHealthGoals().filter(goal => goal.isCompleted);
    }

    // Settings Management
    getSettings() {
        try {
            const settings = localStorage.getItem(this.storageKeys.settings);
            return settings ? JSON.parse(settings) : null;
        } catch (error) {
            console.error('Error reading settings:', error);
            return null;
        }
    }

    saveSettings(settings) {
        try {
            localStorage.setItem(this.storageKeys.settings, JSON.stringify(settings));
            return true;
        } catch (error) {
            console.error('Error saving settings:', error);
            return false;
        }
    }

    updateSetting(key, value) {
        const currentSettings = this.getSettings() || {};
        currentSettings[key] = value;
        return this.saveSettings(currentSettings);
    }

    getSetting(key, defaultValue = null) {
        const settings = this.getSettings();
        return settings && settings.hasOwnProperty(key) ? settings[key] : defaultValue;
    }

    // Statistics and Analytics
    getHealthStats() {
        const data = this.getHealthData();
        if (data.length === 0) return null;

        const latest = data[data.length - 1];
        const last30Days = this.getHealthDataInRange(
            new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            new Date()
        );

        return {
            totalEntries: data.length,
            last30Days: last30Days.length,
            lastEntry: latest.timestamp,
            averages: this.calculateAverages(last30Days),
            trends: this.calculateTrends(data.slice(-14)) // Last 2 weeks
        };
    }

    calculateAverages(data) {
        if (data.length === 0) return {};

        const sums = data.reduce((acc, entry) => {
            acc.heartRate += entry.vitals.heartRate;
            acc.sleepHours += entry.lifestyle.sleepHours;
            acc.stressLevel += entry.lifestyle.stressLevel;
            acc.studyHours += entry.academic.studyHours;
            return acc;
        }, { heartRate: 0, sleepHours: 0, stressLevel: 0, studyHours: 0 });

        const count = data.length;
        return {
            heartRate: Math.round(sums.heartRate / count),
            sleepHours: Math.round((sums.sleepHours / count) * 10) / 10,
            stressLevel: Math.round((sums.stressLevel / count) * 10) / 10,
            studyHours: Math.round((sums.studyHours / count) * 10) / 10
        };
    }

    calculateTrends(data) {
        if (data.length < 2) return {};

        const first = data[0];
        const last = data[data.length - 1];

        return {
            heartRate: last.vitals.heartRate - first.vitals.heartRate,
            sleepHours: last.lifestyle.sleepHours - first.lifestyle.sleepHours,
            stressLevel: last.lifestyle.stressLevel - first.lifestyle.stressLevel,
            studyHours: last.academic.studyHours - first.academic.studyHours
        };
    }

    // Data Export/Import
    exportData(format = 'json') {
        const data = {
            healthData: this.getHealthData(),
            userProfile: this.getUserProfile(),
            predictions: this.getPredictions(),
            goals: this.getHealthGoals(),
            settings: this.getSettings(),
            exportedAt: new Date().toISOString(),
            version: '1.0.0'
        };

        if (format === 'json') {
            return JSON.stringify(data, null, 2);
        } else if (format === 'csv') {
            return this.convertToCSV(data.healthData);
        }

        return data;
    }

    convertToCSV(healthData) {
        if (healthData.length === 0) return '';

        const headers = [
            'Date', 'Heart Rate', 'BP Systolic', 'BP Diastolic', 'Temperature', 'SpO2',
            'Sleep Hours', 'Stress Level', 'Diet Quality', 'Water Intake', 'Physical Activity',
            'Study Hours', 'Attendance', 'Assignments Completed', 'Focus Level'
        ];

        const rows = healthData.map(entry => [
            new Date(entry.timestamp).toLocaleDateString(),
            entry.vitals.heartRate,
            entry.vitals.bpSystolic,
            entry.vitals.bpDiastolic,
            entry.vitals.temperature,
            entry.vitals.spo2,
            entry.lifestyle.sleepHours,
            entry.lifestyle.stressLevel,
            entry.lifestyle.dietQuality,
            entry.lifestyle.waterIntake,
            entry.lifestyle.physicalActivity,
            entry.academic.studyHours,
            entry.academic.attendance,
            entry.academic.assignmentsCompleted,
            entry.academic.focusLevel
        ]);

        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    importData(jsonData) {
        try {
            const data = typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;

            if (data.healthData) {
                this.saveHealthData(data.healthData);
            }

            if (data.userProfile) {
                this.saveUserProfile(data.userProfile);
            }

            if (data.goals) {
                localStorage.setItem(this.storageKeys.goals, JSON.stringify(data.goals));
            }

            if (data.settings) {
                this.saveSettings(data.settings);
            }

            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    // Utility Methods
    clearAllData() {
        Object.values(this.storageKeys).forEach(key => {
            localStorage.removeItem(key);
        });
    }

    getStorageUsage() {
        let totalSize = 0;
        Object.values(this.storageKeys).forEach(key => {
            const data = localStorage.getItem(key);
            if (data) {
                totalSize += data.length;
            }
        });

        return {
            bytes: totalSize,
            kb: Math.round(totalSize / 1024 * 100) / 100,
            mb: Math.round(totalSize / (1024 * 1024) * 100) / 100
        };
    }

    updateLastModified() {
        localStorage.setItem('dt_last_modified', new Date().toISOString());
    }

    getLastModified() {
        return localStorage.getItem('dt_last_modified');
    }
}

// Initialize data manager
window.DataManager = new DataManager();