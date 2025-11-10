// Digital Twin - Form Management
class FormManager {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 3;
        this.formData = {};
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupValidation();
        this.updateProgress();
    }

    setupEventListeners() {
        const form = document.getElementById('healthForm');
        const nextBtn = document.getElementById('nextBtn');
        const prevBtn = document.getElementById('prevBtn');
        const submitBtn = document.getElementById('submitBtn');

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextStep());
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.prevStep());
        }

        if (submitBtn) {
            submitBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.submitForm();
            });
        }

        // Range input updates
        this.setupRangeInputs();

        // Real-time validation
        this.setupRealTimeValidation();
    }

    setupRangeInputs() {
        const ranges = ['stressLevel', 'dietQuality', 'focusLevel'];

        ranges.forEach(id => {
            const input = document.getElementById(id);
            const display = document.getElementById(id.replace('Level', 'Value').replace('Quality', 'Value').replace('focus', 'focus'));

            if (input && display) {
                input.addEventListener('input', (e) => {
                    display.textContent = e.target.value;
                });
            }
        });
    }

    setupRealTimeValidation() {
        const inputs = document.querySelectorAll('.form-step input');

        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearErrors(input));
        });
    }

    validateField(input) {
        const value = input.value.trim();
        const min = parseFloat(input.min);
        const max = parseFloat(input.max);
        const isRequired = input.hasAttribute('required');

        this.clearErrors(input);

        if (isRequired && !value) {
            this.showError(input, 'This field is required');
            return false;
        }

        if (value && input.type === 'number') {
            const num = parseFloat(value);
            if (isNaN(num)) {
                this.showError(input, 'Please enter a valid number');
                return false;
            }

            if (min && num < min) {
                this.showError(input, `Value must be at least ${min}`);
                return false;
            }

            if (max && num > max) {
                this.showError(input, `Value must be no more than ${max}`);
                return false;
            }
        }

        this.showSuccess(input);
        return true;
    }

    showError(input, message) {
        const formGroup = input.closest('.form-group');
        formGroup.classList.add('error');
        formGroup.classList.remove('success');

        let errorElement = formGroup.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('span');
            errorElement.className = 'error-message';
            formGroup.appendChild(errorElement);
        }
        errorElement.textContent = message;
    }

    showSuccess(input) {
        const formGroup = input.closest('.form-group');
        formGroup.classList.add('success');
        formGroup.classList.remove('error');

        const errorElement = formGroup.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
    }

    clearErrors(input) {
        const formGroup = input.closest('.form-group');
        formGroup.classList.remove('error', 'success');

        const errorElement = formGroup.querySelector('.error-message');
        if (errorElement) {
            errorElement.remove();
        }
    }

    validateCurrentStep() {
        const currentStepElement = document.querySelector(`.form-step[data-step="${this.currentStep}"]`);
        const inputs = currentStepElement.querySelectorAll('input[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        return isValid;
    }

    collectStepData() {
        const currentStepElement = document.querySelector(`.form-step[data-step="${this.currentStep}"]`);
        const inputs = currentStepElement.querySelectorAll('input, select');

        inputs.forEach(input => {
            let value = input.value;

            // Convert to appropriate type
            if (input.type === 'number' || input.type === 'range') {
                value = parseFloat(value);
            }

            this.formData[input.id] = value;
        });
    }

    nextStep() {
        if (!this.validateCurrentStep()) {
            DigitalTwinApp.showToast('Please fill in all required fields correctly', 'error');
            return;
        }

        this.collectStepData();

        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
            this.showStep(this.currentStep);
            this.updateProgress();
            this.updateNavigation();
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.showStep(this.currentStep);
            this.updateProgress();
            this.updateNavigation();
        }
    }

    showStep(stepNumber) {
        // Hide all steps
        document.querySelectorAll('.form-step').forEach(step => {
            step.classList.remove('active');
        });

        // Show current step
        const currentStep = document.querySelector(`.form-step[data-step="${stepNumber}"]`);
        if (currentStep) {
            currentStep.classList.add('active');
        }

        // Update step indicators
        document.querySelectorAll('.step').forEach((step, index) => {
            step.classList.remove('active', 'completed');

            if (index + 1 === stepNumber) {
                step.classList.add('active');
            } else if (index + 1 < stepNumber) {
                step.classList.add('completed');
            }
        });
    }

    updateProgress() {
        const progressFill = document.getElementById('progressFill');
        if (progressFill) {
            const progress = (this.currentStep / this.totalSteps) * 100;
            progressFill.style.width = `${progress}%`;
        }
    }

    updateNavigation() {
        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');

        if (prevBtn) {
            prevBtn.style.display = this.currentStep === 1 ? 'none' : 'inline-flex';
        }

        if (nextBtn && submitBtn) {
            if (this.currentStep === this.totalSteps) {
                nextBtn.style.display = 'none';
                submitBtn.style.display = 'inline-flex';
            } else {
                nextBtn.style.display = 'inline-flex';
                submitBtn.style.display = 'none';
            }
        }
    }

    async submitForm() {
        if (!this.validateCurrentStep()) {
            DigitalTwinApp.showToast('Please fill in all required fields correctly', 'error');
            return;
        }

        this.collectStepData();

        try {
            // Show loading state
            const submitBtn = document.getElementById('submitBtn');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            submitBtn.disabled = true;

            // Save data
            await this.saveHealthData();

            // Generate predictions
            await this.generatePredictions();

            // Show success
            this.showSuccess();

        } catch (error) {
            console.error('Error submitting form:', error);
            DigitalTwinApp.showToast('Error saving data. Please try again.', 'error');

            // Reset button
            const submitBtn = document.getElementById('submitBtn');
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Complete Entry';
            submitBtn.disabled = false;
        }
    }

    async saveHealthData() {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Save to localStorage
        const existingData = JSON.parse(localStorage.getItem('healthData') || '[]');
        const newEntry = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            vitals: {
                heartRate: this.formData.heartRate,
                bpSystolic: this.formData.bpSystolic,
                bpDiastolic: this.formData.bpDiastolic,
                temperature: this.formData.temperature,
                spo2: this.formData.spo2
            },
            lifestyle: {
                sleepHours: this.formData.sleepHours,
                stressLevel: this.formData.stressLevel,
                dietQuality: this.formData.dietQuality,
                waterIntake: this.formData.waterIntake,
                physicalActivity: this.formData.physicalActivity
            },
            academic: {
                studyHours: this.formData.studyHours,
                attendance: this.formData.attendance,
                assignmentsCompleted: this.formData.assignmentsCompleted,
                focusLevel: this.formData.focusLevel
            }
        };

        existingData.push(newEntry);
        localStorage.setItem('healthData', JSON.stringify(existingData));

        // Update user stats
        this.updateUserStats();
    }

    updateUserStats() {
        const stats = JSON.parse(localStorage.getItem('userStats') || '{}');
        stats.totalEntries = (stats.totalEntries || 0) + 1;
        stats.lastEntry = new Date().toISOString();
        stats.currentStreak = this.calculateStreak();

        localStorage.setItem('userStats', JSON.stringify(stats));
    }

    calculateStreak() {
        const data = JSON.parse(localStorage.getItem('healthData') || '[]');
        if (data.length === 0) return 1;

        let streak = 1;
        const today = new Date().toDateString();

        // Check if there's an entry for today
        const hasToday = data.some(entry => 
            new Date(entry.timestamp).toDateString() === today
        );

        if (!hasToday) return 1;

        // Count consecutive days
        for (let i = 1; i < 30; i++) {
            const checkDate = new Date();
            checkDate.setDate(checkDate.getDate() - i);

            const hasEntry = data.some(entry => 
                new Date(entry.timestamp).toDateString() === checkDate.toDateString()
            );

            if (hasEntry) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    }

    async generatePredictions() {
        // Use ML predictions if available
        if (window.MLPredictor) {
            const prediction = window.MLPredictor.generatePrediction(this.formData);

            const predictions = JSON.parse(localStorage.getItem('predictions') || '[]');
            predictions.push({
                id: Date.now(),
                timestamp: new Date().toISOString(),
                ...prediction
            });

            localStorage.setItem('predictions', JSON.stringify(predictions));
        }
    }

    showSuccess() {
        // Hide form steps
        document.querySelectorAll('.form-step').forEach(step => {
            step.style.display = 'none';
        });

        // Hide navigation
        const navigation = document.querySelector('.form-navigation');
        if (navigation) {
            navigation.style.display = 'none';
        }

        // Show success message
        const successDiv = document.createElement('div');
        successDiv.className = 'form-success active';
        successDiv.innerHTML = `
            <div class="success-icon">
                <i class="fas fa-check"></i>
            </div>
            <h3>Data Saved Successfully!</h3>
            <p>Your health data has been recorded and analyzed. View your personalized insights on the dashboard.</p>
            <div class="success-actions">
                <a href="dashboard.html" class="btn btn-primary">
                    <i class="fas fa-chart-line"></i> View Dashboard
                </a>
                <button class="btn btn-secondary" onclick="location.reload()">
                    <i class="fas fa-plus"></i> Add More Data
                </button>
            </div>
        `;

        const formContainer = document.querySelector('.form-container');
        if (formContainer) {
            formContainer.appendChild(successDiv);
        }

        // Confetti animation
        this.showConfetti();

        // Auto redirect after 5 seconds
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 5000);
    }

    showConfetti() {
        // Simple confetti effect
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'];

        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.style.position = 'fixed';
                confetti.style.left = Math.random() * 100 + 'vw';
                confetti.style.top = '-10px';
                confetti.style.width = '10px';
                confetti.style.height = '10px';
                confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.zIndex = '10000';
                confetti.style.pointerEvents = 'none';
                confetti.style.borderRadius = '50%';

                document.body.appendChild(confetti);

                const animation = confetti.animate([
                    { transform: 'translateY(0) rotateZ(0deg)', opacity: 1 },
                    { transform: `translateY(100vh) rotateZ(360deg)`, opacity: 0 }
                ], {
                    duration: 3000,
                    easing: 'cubic-bezier(0, 0, 0.2, 1)'
                });

                animation.onfinish = () => confetti.remove();
            }, i * 100);
        }
    }

    resetForm() {
        this.currentStep = 1;
        this.formData = {};
        this.showStep(1);
        this.updateProgress();
        this.updateNavigation();

        // Clear all form fields
        document.querySelectorAll('.form-step input').forEach(input => {
            if (input.type === 'range') {
                input.value = 5; // Reset to middle value
            } else {
                input.value = '';
            }
            this.clearErrors(input);
        });

        // Update range displays
        document.querySelectorAll('[id$="Value"]').forEach(display => {
            display.textContent = '5';
        });
    }
}

// Initialize form manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('healthForm')) {
        window.formManager = new FormManager();
    }
});