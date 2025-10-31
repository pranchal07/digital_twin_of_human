// Digital Twin - Form Management (UPDATED)

class FormManager {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 3;
        this.formData = {};
        this.init();
    }

    init() {
        // Protect page - require authentication
        if (!window.DigitalTwinAPI || !window.DigitalTwinAPI.isAuthenticated()) {
            window.location.href = 'login.html';
            return;
        }

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

        this.setupRangeInputs();
        this.setupRealTimeValidation();
    }

    setupRangeInputs() {
        const ranges = ['stressLevel', 'dietQuality', 'focusLevel'];
        ranges.forEach(id => {
            const input = document.getElementById(id);
            const display = document.getElementById(id + 'Display');
            if (input && display) {
                input.addEventListener('input', (e) => {
                    display.textContent = e.target.value;
                });
            }
        });
    }

    setupRealTimeValidation() {
        const inputs = document.querySelectorAll('input[required]');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
        });
    }

    validateField(field) {
        if (field.hasAttribute('required') && !field.value) {
            field.classList.add('invalid');
            return false;
        }
        field.classList.remove('invalid');
        return true;
    }

    validateStep(step) {
        const stepElement = document.querySelector(`.step-content[data-step="${step}"]`);
        if (!stepElement) return true;

        const requiredInputs = stepElement.querySelectorAll('input[required]');
        let isValid = true;

        requiredInputs.forEach(input => {
            if (!this.validateField(input)) {
                isValid = false;
            }
        });

        return isValid;
    }

    nextStep() {
        if (!this.validateStep(this.currentStep)) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        this.collectStepData(this.currentStep);

        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
            this.updateStepDisplay();
            this.updateProgress();
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStepDisplay();
            this.updateProgress();
        }
    }

    updateStepDisplay() {
        const steps = document.querySelectorAll('.step-content');
        steps.forEach((step, index) => {
            step.classList.remove('active');
            if (index + 1 === this.currentStep) {
                step.classList.add('active');
            }
        });

        const prevBtn = document.getElementById('prevBtn');
        const nextBtn = document.getElementById('nextBtn');
        const submitBtn = document.getElementById('submitBtn');

        if (prevBtn) {
            prevBtn.style.display = this.currentStep === 1 ? 'none' : 'inline-block';
        }

        if (this.currentStep === this.totalSteps) {
            if (nextBtn) nextBtn.style.display = 'none';
            if (submitBtn) submitBtn.style.display = 'inline-block';
        } else {
            if (nextBtn) nextBtn.style.display = 'inline-block';
            if (submitBtn) submitBtn.style.display = 'none';
        }
    }

    updateProgress() {
        const progressBar = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        const stepIndicators = document.querySelectorAll('.step-indicator');

        const progress = (this.currentStep / this.totalSteps) * 100;

        if (progressBar) {
            progressBar.style.width = progress + '%';
        }

        if (progressText) {
            progressText.textContent = `Step ${this.currentStep} of ${this.totalSteps}`;
        }

        stepIndicators.forEach((indicator, index) => {
            if (index + 1 < this.currentStep) {
                indicator.classList.add('completed');
                indicator.classList.remove('active');
            } else if (index + 1 === this.currentStep) {
                indicator.classList.add('active');
                indicator.classList.remove('completed');
            } else {
                indicator.classList.remove('active', 'completed');
            }
        });
    }

    collectStepData(step) {
        const stepElement = document.querySelector(`.step-content[data-step="${step}"]`);
        if (!stepElement) return;

        const inputs = stepElement.querySelectorAll('input');
        inputs.forEach(input => {
            this.formData[input.name || input.id] = input.value;
        });
    }

    async submitForm() {
        if (!this.validateStep(this.currentStep)) {
            this.showNotification('Please fill in all required fields', 'error');
            return;
        }

        this.collectStepData(this.currentStep);

        // Show loading state
        const submitBtn = document.getElementById('submitBtn');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Submitting...';
        submitBtn.disabled = true;

        try {
            // Prepare data for API
            const vitalsData = {
                heart_rate: parseInt(this.formData.heartRate) || 0,
                blood_pressure_systolic: parseInt(this.formData.bpSystolic) || 0,
                blood_pressure_diastolic: parseInt(this.formData.bpDiastolic) || 0,
                temperature: parseFloat(this.formData.temperature) || 0,
                oxygen_saturation: parseInt(this.formData.spo2) || 0
            };

            const lifestyleData = {
                sleep_hours: parseFloat(this.formData.sleepHours) || 0,
                stress_level: parseInt(this.formData.stressLevel) || 5,
                diet_quality_score: parseInt(this.formData.dietQuality) || 5,
                water_intake: parseInt(this.formData.waterIntake) || 0,
                physical_activity_minutes: parseInt(this.formData.physicalActivity) * 60 || 0
            };

            const academicData = {
                study_hours: parseFloat(this.formData.studyHours) || 0,
                attendance_percentage: parseFloat(this.formData.attendance) || 0,
                focus_level: parseInt(this.formData.focusLevel) || 5,
                assignment_completion_rate: parseFloat(this.formData.assignmentsCompleted) || 0
            };

            // Submit to backend
            const result = await window.DigitalTwinAPI.submitHealthData({
                vitals: vitalsData,
                lifestyle: lifestyleData,
                academic: academicData
            });

            console.log('Data submitted successfully:', result);

            // Show success message
            this.showNotification('Data saved successfully! You can enter more data or view dashboard.', 'success');

            // Reset form for new entry
            this.resetForm();

            // Add action buttons
            this.showActionButtons();

        } catch (error) {
            console.error('Submission error:', error);
            this.showNotification('Error saving data: ' + error.message, 'error');

            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    }

    resetForm() {
        // Reset to step 1
        this.currentStep = 1;
        this.formData = {};
        this.updateStepDisplay();
        this.updateProgress();

        // Clear all inputs
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
            if (input.type === 'range') {
                input.value = 5;
                const display = document.getElementById(input.id + 'Display');
                if (display) display.textContent = '5';
            } else if (input.type !== 'button' && input.type !== 'submit') {
                input.value = '';
            }
            input.classList.remove('invalid');
        });

        // Re-enable submit button
        const submitBtn = document.getElementById('submitBtn');
        if (submitBtn) {
            submitBtn.textContent = 'Complete Entry';
            submitBtn.disabled = false;
        }
    }

    showActionButtons() {
        // Create action buttons container
        let actionsDiv = document.getElementById('postSubmitActions');
        if (!actionsDiv) {
            actionsDiv = document.createElement('div');
            actionsDiv.id = 'postSubmitActions';
            actionsDiv.className = 'post-submit-actions';
            actionsDiv.innerHTML = `
                <h3>What would you like to do next?</h3>
                <div class="action-buttons">
                    <button onclick="location.reload()" class="btn btn-secondary">
                        Add Another Entry
                    </button>
                    <button onclick="window.location.href='dashboard.html'" class="btn btn-primary">
                        View Dashboard
                    </button>
                </div>
            `;

            const form = document.getElementById('healthForm');
            if (form && form.parentElement) {
                form.parentElement.appendChild(actionsDiv);
            }
        } else {
            actionsDiv.style.display = 'block';
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 16px 24px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideIn 0.3s ease-out;
            max-width: 400px;
        `;

        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.parentElement.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
}

// Initialize form manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new FormManager();
});

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }

    .post-submit-actions {
        margin-top: 30px;
        padding: 24px;
        background: #f0fdf4;
        border-radius: 12px;
        border: 2px solid #10b981;
        text-align: center;
    }

    .post-submit-actions h3 {
        color: #065f46;
        margin-bottom: 20px;
    }

    .action-buttons {
        display: flex;
        gap: 16px;
        justify-content: center;
        flex-wrap: wrap;
    }

    .action-buttons .btn {
        padding: 12px 24px;
        font-size: 1rem;
        border-radius: 8px;
        cursor: pointer;
        border: none;
        font-weight: 600;
        transition: transform 0.2s;
    }

    .action-buttons .btn:hover {
        transform: translateY(-2px);
    }

    .btn-primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
    }

    .btn-secondary {
        background: #6b7280;
        color: white;
    }
`;
document.head.appendChild(style);
