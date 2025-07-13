// Assignment Checker - Main Application

class AssignmentChecker {
    constructor() {
        this.currentPage = 'dashboard';
        this.huggingFaceService = new HuggingFaceService();
        this.chartsComponent = new ChartsComponent();
        this.currentAssignment = null;
        this.currentSubmission = null;
        
        this.init();
    }

    async init() {
        try {
            // Initialize components
            await this.initializeComponents();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Load initial data
            this.loadDashboard();
            
            // Initialize particles for hero section
            this.initializeParticles();
            
            console.log('Assignment Checker initialized successfully');
        } catch (error) {
            console.error('Error initializing Assignment Checker:', error);
            this.showError('Failed to initialize application. Please refresh the page.');
        }
    }

    async initializeComponents() {
        // Check API key
        const apiKey = StorageUtils.getApiKey();
        if (apiKey) {
            this.huggingFaceService.setApiKey(apiKey);
        }

        // Load user settings
        const settings = StorageUtils.getSettings();
        this.applySettings(settings);
    }

    setupEventListeners() {
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.target.dataset.page;
                if (page) {
                    this.navigateToPage(page);
                }
            });
        });

        // Assignment form
        const assignmentForm = document.getElementById('assignment-form');
        if (assignmentForm) {
            assignmentForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAssignmentSubmission(e);
            });
        }

        // Submission form
        const submissionForm = document.getElementById('submission-form');
        if (submissionForm) {
            submissionForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleStudentSubmission(e);
            });
        }

        // Settings form
        const settingsForm = document.getElementById('settings-form');
        if (settingsForm) {
            settingsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSettingsUpdate(e);
            });
        }

        // File upload
        const fileInput = document.getElementById('file-upload');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                this.handleFileUpload(e);
            });
        }

        // Upload area click
        const uploadArea = document.getElementById('upload-area');
        if (uploadArea) {
            uploadArea.addEventListener('click', () => {
                const fileInput = document.getElementById('file-upload');
                if (fileInput) fileInput.click();
            });

            // Drag and drop
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('drag-over');
            });

            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('drag-over');
            });

            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('drag-over');
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    const fileInput = document.getElementById('file-upload');
                    if (fileInput) {
                        fileInput.files = files;
                        this.handleFileUpload({ target: fileInput });
                    }
                }
            });
        }

        // API key toggle
        const toggleApiKey = document.getElementById('toggle-api-key');
        if (toggleApiKey) {
            toggleApiKey.addEventListener('click', () => {
                const apiKeyInput = document.getElementById('hf-api-key');
                if (apiKeyInput) {
                    const isPassword = apiKeyInput.type === 'password';
                    apiKeyInput.type = isPassword ? 'text' : 'password';
                    toggleApiKey.textContent = isPassword ? '🙈' : '👁️';
                }
            });
        }

        // Search functionality
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(button => {
            button.addEventListener('click', () => {
                this.closeModal();
            });
        });

        // Add rubric criterion
        const addCriterionBtn = document.getElementById('add-criterion');
        if (addCriterionBtn) {
            addCriterionBtn.addEventListener('click', () => {
                this.addRubricCriterion();
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'n':
                        e.preventDefault();
                        this.navigateToPage('create');
                        break;
                    case 's':
                        e.preventDefault();
                        this.navigateToPage('settings');
                        break;
                    case '/':
                        e.preventDefault();
                        const searchInput = document.getElementById('search-input');
                        if (searchInput) searchInput.focus();
                        break;
                }
            }
            
            if (e.key === 'Escape') {
                this.closeModal();
            }
        });
    }

    async navigateToPage(page) {
        if (this.currentPage === page) return;

        const currentPageElement = document.getElementById(`${this.currentPage}-page`);
        const targetPageElement = document.getElementById(`${page}-page`);

        if (!targetPageElement) {
            console.error('Page not found:', page);
            return;
        }

        // Update navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        
        const activeNavLink = document.querySelector(`[data-page="${page}"]`);
        if (activeNavLink) {
            activeNavLink.classList.add('active');
        }

        // Animate page transition
        if (AnimationUtils.isAnimationsEnabled()) {
            await AnimationUtils.pageTransition(currentPageElement, targetPageElement, 'fade');
        } else {
            currentPageElement.style.display = 'none';
            targetPageElement.style.display = 'block';
        }

        this.currentPage = page;

        // Load page-specific content
        switch (page) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'assignments':
                this.loadAssignments();
                break;
            case 'submissions':
                this.loadSubmissions();
                break;
            case 'create':
                this.loadCreatePage();
                break;
            case 'upload':
                this.loadUploadPage();
                break;
            case 'results':
                this.loadResultsPage();
                break;
            case 'settings':
                this.loadSettings();
                break;
        }

        // Update URL
        window.history.pushState({ page }, '', `#${page}`);
    }

    loadDashboard() {
        try {
            const stats = StorageUtils.getStatistics();
            
            // Update stats cards
            this.updateStatsCard('total-assignments', stats.totalAssignments);
            this.updateStatsCard('total-submissions', stats.totalSubmissions);
            this.updateStatsCard('average-score', stats.averageScore + '%');
            this.updateStatsCard('completion-rate', stats.completionRate + '%');

            // Load recent activity
            this.loadRecentActivity();

            // Load charts
            this.loadDashboardCharts(stats);

        } catch (error) {
            console.error('Error loading dashboard:', error);
            this.showError('Failed to load dashboard data');
        }
    }

    updateStatsCard(cardId, value) {
        const card = document.getElementById(cardId);
        if (card) {
            const valueElement = card.querySelector('.stat-value');
            if (valueElement) {
                if (AnimationUtils.isAnimationsEnabled()) {
                    AnimationUtils.countUp(valueElement, parseInt(value) || 0, 1000);
                } else {
                    valueElement.textContent = value;
                }
            }
        }
    }

    loadRecentActivity() {
        const submissions = StorageUtils.getSubmissions()
            .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
            .slice(0, 5);

        const activityList = document.getElementById('recent-activity');
        if (activityList) {
            activityList.innerHTML = submissions.map(submission => `
                <div class="activity-item animate-slide-in">
                    <div class="activity-info">
                        <h4>${submission.studentName}</h4>
                        <p>${this.getAssignmentTitle(submission.assignmentId)}</p>
                    </div>
                    <div class="activity-meta">
                        <span class="activity-time">${this.formatTimeAgo(submission.submittedAt)}</span>
                        ${submission.evaluation ? 
                            `<span class="activity-score">${submission.evaluation.overallScore}/${submission.evaluation.totalPossiblePoints}</span>` :
                            '<span class="activity-pending">Pending</span>'
                        }
                    </div>
                </div>
            `).join('');

            if (AnimationUtils.isAnimationsEnabled()) {
                const items = activityList.querySelectorAll('.activity-item');
                AnimationUtils.staggerIn(items, 100);
            }
        }
    }

    loadDashboardCharts(stats) {
        // Grade distribution chart
        if (Object.keys(stats.gradeStats).length > 0) {
            const gradeData = Object.entries(stats.gradeStats).map(([grade, count]) => ({
                label: grade,
                value: count
            }));

            this.chartsComponent.createDonutChart('grade-distribution-chart', gradeData, {
                centerText: 'Grades',
                showLabels: true
            });
        }

        // Subject distribution chart
        if (Object.keys(stats.subjectStats).length > 0) {
            const subjectData = Object.entries(stats.subjectStats).map(([subject, count]) => ({
                label: subject,
                value: count
            }));

            this.chartsComponent.createBarChart('subject-distribution-chart', subjectData, {
                showValues: true
            });
        }
    }

    loadAssignments() {
        const assignments = StorageUtils.getAssignments();
        const assignmentsList = document.getElementById('assignments-list');
        
        if (assignmentsList) {
            assignmentsList.innerHTML = assignments.map(assignment => `
                <div class="assignment-card animate-fade-in" data-assignment-id="${assignment.id}">
                    <div class="assignment-header">
                        <h3>${assignment.title}</h3>
                        <span class="assignment-subject">${assignment.subject}</span>
                    </div>
                    <div class="assignment-meta">
                        <span class="assignment-points">${assignment.totalPoints} points</span>
                        <span class="assignment-date">${this.formatDate(assignment.createdAt)}</span>
                        <span class="assignment-status ${assignment.isActive ? 'active' : 'inactive'}">
                            ${assignment.isActive ? 'Active' : 'Inactive'}
                        </span>
                    </div>
                    <div class="assignment-description">
                        ${assignment.description}
                    </div>
                    <div class="assignment-actions">
                        <button class="btn btn-primary" onclick="app.viewAssignment('${assignment.id}')">
                            View Details
                        </button>
                        <button class="btn btn-secondary" onclick="app.editAssignment('${assignment.id}')">
                            Edit
                        </button>
                        <button class="btn btn-danger" onclick="app.deleteAssignment('${assignment.id}')">
                            Delete
                        </button>
                    </div>
                </div>
            `).join('');

            if (AnimationUtils.isAnimationsEnabled()) {
                const cards = assignmentsList.querySelectorAll('.assignment-card');
                AnimationUtils.staggerIn(cards, 100);
            }
        }
    }

    loadSubmissions() {
        const submissions = StorageUtils.getSubmissions();
        const submissionsList = document.getElementById('submissions-list');
        
        if (submissionsList) {
            submissionsList.innerHTML = submissions.map(submission => `
                <div class="submission-card animate-fade-in" data-submission-id="${submission.id}">
                    <div class="submission-header">
                        <h3>${submission.studentName}</h3>
                        <span class="submission-id">ID: ${submission.studentId}</span>
                    </div>
                    <div class="submission-meta">
                        <span class="submission-assignment">${this.getAssignmentTitle(submission.assignmentId)}</span>
                        <span class="submission-date">${this.formatDate(submission.submittedAt)}</span>
                    </div>
                    ${submission.evaluation ? `
                        <div class="submission-score">
                            <div class="score-circle" data-score="${submission.evaluation.percentage}">
                                <span class="score-value">${submission.evaluation.overallScore}</span>
                                <span class="score-total">/${submission.evaluation.totalPossiblePoints}</span>
                            </div>
                            <div class="score-grade ${submission.evaluation.grade.toLowerCase()}">${submission.evaluation.grade}</div>
                        </div>
                    ` : `
                        <div class="submission-pending">
                            <button class="btn btn-primary" onclick="app.evaluateSubmission('${submission.id}')">
                                Evaluate
                            </button>
                        </div>
                    `}
                    <div class="submission-actions">
                        <button class="btn btn-secondary" onclick="app.viewSubmission('${submission.id}')">
                            View Details
                        </button>
                        <button class="btn btn-danger" onclick="app.deleteSubmission('${submission.id}')">
                            Delete
                        </button>
                    </div>
                </div>
            `).join('');

            if (AnimationUtils.isAnimationsEnabled()) {
                const cards = submissionsList.querySelectorAll('.submission-card');
                AnimationUtils.staggerIn(cards, 100);
            }
        }
    }

    loadCreatePage() {
        // Reset form
        const form = document.getElementById('assignment-form');
        if (form) {
            form.reset();
        }

        // Reset rubric
        const rubricContainer = document.getElementById('rubric-criteria');
        if (rubricContainer) {
            rubricContainer.innerHTML = '';
            this.addRubricCriterion(); // Add first criterion
        }
    }

    loadUploadPage() {
        // Load available assignments
        const assignments = StorageUtils.getAssignments().filter(a => a.isActive);
        const assignmentSelect = document.getElementById('selected-assignment');
        
        if (assignmentSelect) {
            assignmentSelect.innerHTML = '<option value="">Choose an assignment to submit</option>';
            assignments.forEach(assignment => {
                const option = document.createElement('option');
                option.value = assignment.id;
                option.textContent = assignment.title;
                assignmentSelect.appendChild(option);
            });
        }
    }

    loadResultsPage() {
        // Load recent results
        const submissions = StorageUtils.getSubmissions()
            .filter(s => s.evaluation)
            .sort((a, b) => new Date(b.evaluation.evaluatedAt) - new Date(a.evaluation.evaluatedAt));

        const resultsContent = document.getElementById('results-content');
        if (resultsContent) {
            if (submissions.length === 0) {
                resultsContent.innerHTML = `
                    <div class="no-results glassmorphism">
                        <div class="no-results-icon">📊</div>
                        <h3>No Results Available</h3>
                        <p>Submit assignments for evaluation to see results here.</p>
                        <button class="btn btn-primary animated-button" onclick="app.navigateToPage('upload')">Submit Assignment</button>
                    </div>
                `;
            } else {
                resultsContent.innerHTML = submissions.map(submission => `
                    <div class="result-card glassmorphism animate-fade-in">
                        <div class="result-header">
                            <h3>${submission.studentName}</h3>
                            <span class="result-date">${this.formatDate(submission.evaluation.evaluatedAt)}</span>
                        </div>
                        <div class="result-assignment">${this.getAssignmentTitle(submission.assignmentId)}</div>
                        <div class="result-score">
                            <div class="score-circle" data-score="${submission.evaluation.percentage}">
                                <span class="score-value">${submission.evaluation.overallScore}</span>
                                <span class="score-total">/${submission.evaluation.totalPossiblePoints}</span>
                            </div>
                            <div class="score-grade ${submission.evaluation.grade.toLowerCase()}">${submission.evaluation.grade}</div>
                        </div>
                        <div class="result-actions">
                            <button class="btn btn-secondary" onclick="app.viewSubmission('${submission.id}')">View Details</button>
                        </div>
                    </div>
                `).join('');
            }
        }
    }

    loadSettings() {
        const settings = StorageUtils.getSettings();
        const apiKey = StorageUtils.getApiKey();

        // Populate settings form
        const settingsForm = document.getElementById('settings-form');
        if (settingsForm) {
            const formData = new FormData(settingsForm);
            
            // Update form fields
            const apiKeyInput = settingsForm.querySelector('[name="apiKey"]');
            if (apiKeyInput) apiKeyInput.value = apiKey;

            const autoSaveCheckbox = settingsForm.querySelector('[name="autoSave"]');
            if (autoSaveCheckbox) autoSaveCheckbox.checked = settings.autoSave;

            const animationsCheckbox = settingsForm.querySelector('[name="showAnimations"]');
            if (animationsCheckbox) animationsCheckbox.checked = settings.showAnimations;

            const themeSelect = settingsForm.querySelector('[name="theme"]');
            if (themeSelect) themeSelect.value = settings.theme;
        }

        // Show storage information
        this.updateStorageInfo();
    }

    async handleAssignmentSubmission(e) {
        try {
            const formData = new FormData(e.target);
            const rubricCriteria = this.collectRubricCriteria();

            const assignment = {
                title: formData.get('title'),
                subject: formData.get('subject'),
                description: formData.get('description'),
                instructions: formData.get('instructions'),
                totalPoints: parseInt(formData.get('totalPoints')),
                rubric: rubricCriteria,
                keywords: formData.get('keywords') ? formData.get('keywords').split(',').map(k => k.trim()) : []
            };

            // Validate assignment
            if (!assignment.title || !assignment.subject || !assignment.totalPoints || rubricCriteria.length === 0) {
                throw new Error('Please fill in all required fields and add at least one rubric criterion');
            }

            // Save assignment
            const savedAssignment = StorageUtils.saveAssignment(assignment);
            
            this.showSuccess('Assignment created successfully!');
            
            // Navigate to assignments page
            setTimeout(() => {
                this.navigateToPage('assignments');
            }, 1500);

        } catch (error) {
            console.error('Error creating assignment:', error);
            this.showError(error.message);
        }
    }

    async handleStudentSubmission(e) {
        try {
            const formData = new FormData(e.target);
            const assignmentId = formData.get('assignmentId');

            if (!assignmentId) {
                throw new Error('Please select an assignment');
            }

            const submission = {
                assignmentId,
                studentName: formData.get('studentName'),
                studentId: formData.get('studentId'),
                submissionText: formData.get('submissionText') || '',
                fileData: formData.get('fileData') || null
            };

            // Validate submission
            if (!submission.studentName || !submission.studentId || (!submission.submissionText && !submission.fileData)) {
                throw new Error('Please fill in all required fields');
            }

            // Save submission
            const savedSubmission = StorageUtils.saveSubmission(submission);
            
            this.showSuccess('Submission saved successfully!');
            
            // Optionally auto-evaluate
            const autoEvaluate = confirm('Would you like to evaluate this submission now?');
            if (autoEvaluate) {
                await this.evaluateSubmission(savedSubmission.id);
            }

            // Reset form
            e.target.reset();

        } catch (error) {
            console.error('Error saving submission:', error);
            this.showError(error.message);
        }
    }

    async handleSettingsUpdate(e) {
        try {
            const formData = new FormData(e.target);
            
            const settings = {
                autoSave: formData.get('autoSave') === 'on',
                showAnimations: formData.get('showAnimations') === 'on',
                theme: formData.get('theme') || 'dark'
            };

            const apiKey = formData.get('apiKey');

            // Save settings
            StorageUtils.saveSettings(settings);
            
            if (apiKey) {
                StorageUtils.saveApiKey(apiKey);
                this.huggingFaceService.setApiKey(apiKey);
            }

            // Apply settings
            this.applySettings(settings);

            this.showSuccess('Settings updated successfully!');

        } catch (error) {
            console.error('Error updating settings:', error);
            this.showError(error.message);
        }
    }

    async evaluateSubmission(submissionId) {
        try {
            const submission = StorageUtils.getSubmission(submissionId);
            const assignment = StorageUtils.getAssignment(submission.assignmentId);

            if (!submission || !assignment) {
                throw new Error('Submission or assignment not found');
            }

            // Check if API is configured
            if (!this.huggingFaceService.isConfigured()) {
                throw new Error('Please configure your Hugging Face API key in settings');
            }

            // Show loading
            this.showLoading('Evaluating submission...');

            // Evaluate submission
            const evaluation = await this.huggingFaceService.evaluateSubmission(assignment, submission);

            // Update submission with evaluation
            StorageUtils.updateSubmission(submissionId, { evaluation });

            this.hideLoading();
            this.showSuccess('Submission evaluated successfully!');

            // Show evaluation results
            this.showEvaluationResults(submission, evaluation);

        } catch (error) {
            this.hideLoading();
            console.error('Error evaluating submission:', error);
            this.showError('Failed to evaluate submission: ' + error.message);
        }
    }

    showEvaluationResults(submission, evaluation) {
        const modal = this.createModal('Evaluation Results', `
            <div class="evaluation-results">
                <div class="student-info">
                    <h3>${submission.studentName} (${submission.studentId})</h3>
                </div>
                
                <div class="overall-score">
                    <div class="score-circle large" data-score="${evaluation.percentage}">
                        <span class="score-value">${evaluation.overallScore}</span>
                        <span class="score-total">/${evaluation.totalPossiblePoints}</span>
                    </div>
                    <div class="score-grade ${evaluation.grade.toLowerCase()}">${evaluation.grade}</div>
                    <div class="score-percentage">${evaluation.percentage}%</div>
                </div>

                <div class="criteria-scores">
                    <h4>Criteria Breakdown</h4>
                    ${evaluation.criteriaScores.map(score => `
                        <div class="criterion-score">
                            <span class="criterion-name">${score.criterion}</span>
                            <span class="criterion-points">${score.earned}/${score.possible}</span>
                            <div class="criterion-bar">
                                <div class="criterion-fill" style="width: ${score.percentage}%"></div>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <div class="feedback-section">
                    <h4>Feedback</h4>
                    <p>${evaluation.feedback}</p>
                </div>

                ${evaluation.strengths.length > 0 ? `
                    <div class="strengths-section">
                        <h4>Strengths</h4>
                        <ul>
                            ${evaluation.strengths.map(strength => `<li>${strength}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}

                ${evaluation.improvements.length > 0 ? `
                    <div class="improvements-section">
                        <h4>Areas for Improvement</h4>
                        <ul>
                            ${evaluation.improvements.map(improvement => `<li>${improvement}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}

                <div class="evaluation-meta">
                    <small>Evaluated on ${this.formatDate(evaluation.evaluatedAt)} by ${evaluation.evaluatedBy}</small>
                </div>
            </div>
        `);

        this.showModal(modal);
    }

    // Utility methods
    collectRubricCriteria() {
        const criteria = [];
        const criteriaElements = document.querySelectorAll('.rubric-criterion');
        
        criteriaElements.forEach(element => {
            const name = element.querySelector('[name="criterionName"]').value;
            const points = parseInt(element.querySelector('[name="criterionPoints"]').value);
            const description = element.querySelector('[name="criterionDescription"]').value;
            
            if (name && points && description) {
                criteria.push({ name, points, description });
            }
        });
        
        return criteria;
    }

    addRubricCriterion() {
        const container = document.getElementById('rubric-criteria');
        if (!container) return;

        const criterionHtml = `
            <div class="rubric-criterion animate-slide-in">
                <div class="criterion-header">
                    <input type="text" name="criterionName" placeholder="Criterion name" class="form-input" required>
                    <input type="number" name="criterionPoints" placeholder="Points" class="form-input points-input" min="1" required>
                    <button type="button" class="btn btn-danger btn-small remove-criterion">Remove</button>
                </div>
                <textarea name="criterionDescription" placeholder="Criterion description" class="form-textarea" required></textarea>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', criterionHtml);

        // Add remove functionality
        const newCriterion = container.lastElementChild;
        const removeBtn = newCriterion.querySelector('.remove-criterion');
        removeBtn.addEventListener('click', () => {
            if (AnimationUtils.isAnimationsEnabled()) {
                AnimationUtils.slideUp(newCriterion).then(() => {
                    newCriterion.remove();
                });
            } else {
                newCriterion.remove();
            }
        });

        if (AnimationUtils.isAnimationsEnabled()) {
            AnimationUtils.slideDown(newCriterion);
        }
    }

    initializeParticles() {
        // Initialize particles for hero section
        particleManager.create('hero-particles', {
            particleCount: 50,
            particleSize: { min: 1, max: 2 },
            particleSpeed: { min: 0.05, max: 0.2 },
            connectionDistance: 80,
            enableMouse: true
        });
    }

    applySettings(settings) {
        // Apply theme
        document.documentElement.setAttribute('data-theme', settings.theme);

        // Apply animations setting
        AnimationUtils.setAnimationsEnabled(settings.showAnimations);

        // Update particle systems
        if (settings.showAnimations) {
            particleManager.startAll();
        } else {
            particleManager.pauseAll();
        }
    }

    getAssignmentTitle(assignmentId) {
        const assignment = StorageUtils.getAssignment(assignmentId);
        return assignment ? assignment.title : 'Unknown Assignment';
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString();
    }

    formatTimeAgo(dateString) {
        const now = new Date();
        const date = new Date(dateString);
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        return `${Math.floor(diffInSeconds / 86400)} days ago`;
    }

    // Modal methods
    createModal(title, content) {
        return `
            <div class="modal-overlay" id="modal-overlay">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>${title}</h2>
                        <button class="modal-close" id="modal-close">&times;</button>
                    </div>
                    <div class="modal-body">
                        ${content}
                    </div>
                </div>
            </div>
        `;
    }

    showModal(modalHtml) {
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        const overlay = document.getElementById('modal-overlay');
        
        // Add event listeners
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) this.closeModal();
        });
        
        document.getElementById('modal-close').addEventListener('click', () => {
            this.closeModal();
        });

        if (AnimationUtils.isAnimationsEnabled()) {
            AnimationUtils.fadeIn(overlay, 'fast');
        }
    }

    closeModal() {
        const overlay = document.getElementById('modal-overlay');
        if (overlay) {
            if (AnimationUtils.isAnimationsEnabled()) {
                AnimationUtils.fadeOut(overlay, 'fast').then(() => {
                    overlay.remove();
                });
            } else {
                overlay.remove();
            }
        }
    }

    // Notification methods
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        document.body.appendChild(notification);

        if (AnimationUtils.isAnimationsEnabled()) {
            AnimationUtils.slideDown(notification).then(() => {
                setTimeout(() => {
                    AnimationUtils.slideUp(notification).then(() => {
                        notification.remove();
                    });
                }, 3000);
            });
        } else {
            setTimeout(() => {
                notification.remove();
            }, 3000);
        }
    }

    showLoading(message = 'Loading...') {
        const loading = document.createElement('div');
        loading.id = 'global-loading';
        loading.className = 'loading-overlay global';
        loading.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <p>${message}</p>
            </div>
        `;

        document.body.appendChild(loading);

        if (AnimationUtils.isAnimationsEnabled()) {
            AnimationUtils.fadeIn(loading, 'fast');
        }
    }

    hideLoading() {
        const loading = document.getElementById('global-loading');
        if (loading) {
            if (AnimationUtils.isAnimationsEnabled()) {
                AnimationUtils.fadeOut(loading, 'fast').then(() => {
                    loading.remove();
                });
            } else {
                loading.remove();
            }
        }
    }

    updateStorageInfo() {
        const stats = StorageUtils.getStatistics();
        const storageInfo = document.getElementById('storage-info');
        
        if (storageInfo) {
            storageInfo.innerHTML = `
                <p>Storage used: ${stats.storageSize.kb} KB</p>
                <p>Total assignments: ${stats.totalAssignments}</p>
                <p>Total submissions: ${stats.totalSubmissions}</p>
            `;
        }
    }

    // File handling
    async handleFileUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        try {
            if (file.type === 'application/json') {
                // Import data
                await StorageUtils.importData(file);
                this.showSuccess('Data imported successfully!');
                this.loadDashboard(); // Refresh dashboard
            } else if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
                // Handle text file submission
                const text = await file.text();
                const textArea = document.getElementById('submission-text');
                if (textArea) {
                    textArea.value = text;
                }
            } else {
                this.showError('Unsupported file type. Please use JSON for data import or TXT for submissions.');
            }
        } catch (error) {
            this.showError('Failed to process file: ' + error.message);
        }
    }

    clearAllData() {
        if (confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
            try {
                StorageUtils.clearAllData();
                this.showSuccess('All data cleared successfully!');
                this.loadDashboard(); // Refresh dashboard
                this.updateStorageInfo(); // Update storage info
            } catch (error) {
                this.showError('Failed to clear data: ' + error.message);
            }
        }
    }

    handleSearch(query) {
        // Implement search functionality based on current page
        console.log('Searching for:', query);
        // TODO: Implement search logic
    }

    // Additional assignment methods
    viewAssignment(id) {
        const assignment = StorageUtils.getAssignment(id);
        if (!assignment) return;

        this.currentAssignment = assignment;
        
        const modalContent = `
            <div class="assignment-details">
                <h3>${assignment.title}</h3>
                <div class="assignment-meta">
                    <span class="badge">${assignment.subject}</span>
                    <span class="points">${assignment.totalPoints} points</span>
                    <span class="date">${this.formatDate(assignment.createdAt)}</span>
                </div>
                <div class="assignment-description">
                    <h4>Description</h4>
                    <p>${assignment.description}</p>
                </div>
                <div class="assignment-instructions">
                    <h4>Instructions</h4>
                    <p>${assignment.instructions}</p>
                </div>
                <div class="assignment-rubric">
                    <h4>Rubric</h4>
                    ${assignment.rubric.map(criterion => `
                        <div class="rubric-item">
                            <strong>${criterion.name}</strong> (${criterion.points} points)
                            <p>${criterion.description}</p>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        const modal = this.createModal('Assignment Details', modalContent);
        this.showModal(modal);
    }

    editAssignment(id) {
        const assignment = StorageUtils.getAssignment(id);
        if (!assignment) return;

        // Populate form with assignment data for editing
        this.navigateToPage('create');
        // TODO: Populate form with existing data
    }

    deleteAssignment(id) {
        if (confirm('Are you sure you want to delete this assignment? This action cannot be undone.')) {
            try {
                StorageUtils.deleteAssignment(id);
                this.showSuccess('Assignment deleted successfully!');
                this.loadAssignments(); // Refresh list
            } catch (error) {
                this.showError('Failed to delete assignment: ' + error.message);
            }
        }
    }

    viewSubmission(id) {
        const submission = StorageUtils.getSubmission(id);
        if (!submission) return;

        const assignment = StorageUtils.getAssignment(submission.assignmentId);
        
        const modalContent = `
            <div class="submission-details">
                <div class="student-header">
                    <h3>${submission.studentName} (${submission.studentId})</h3>
                    <span class="submission-date">${this.formatDate(submission.submittedAt)}</span>
                </div>
                <div class="assignment-info">
                    <strong>Assignment:</strong> ${assignment ? assignment.title : 'Unknown'}
                </div>
                <div class="submission-content">
                    <h4>Submission</h4>
                    <div class="submission-text">${submission.submissionText || 'No text submission'}</div>
                </div>
                ${submission.evaluation ? `
                    <div class="evaluation-summary">
                        <h4>Evaluation Results</h4>
                        <div class="score-display">
                            <span class="score">${submission.evaluation.overallScore}/${submission.evaluation.totalPossiblePoints}</span>
                            <span class="grade ${submission.evaluation.grade.toLowerCase()}">${submission.evaluation.grade}</span>
                        </div>
                        <div class="feedback">
                            <strong>Feedback:</strong>
                            <p>${submission.evaluation.feedback}</p>
                        </div>
                    </div>
                ` : `
                    <div class="no-evaluation">
                        <p>This submission has not been evaluated yet.</p>
                        <button class="btn btn-primary" onclick="app.closeModal(); app.evaluateSubmission('${submission.id}')">Evaluate Now</button>
                    </div>
                `}
            </div>
        `;
        
        const modal = this.createModal('Submission Details', modalContent);
        this.showModal(modal);
    }

    deleteSubmission(id) {
        if (confirm('Are you sure you want to delete this submission?')) {
            try {
                StorageUtils.deleteSubmission(id);
                this.showSuccess('Submission deleted successfully!');
                this.loadSubmissions(); // Refresh list
            } catch (error) {
                this.showError('Failed to delete submission: ' + error.message);
            }
        }
    }
}

// Initialize application when DOM is ready
let app;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        app = new AssignmentChecker();
    });
} else {
    app = new AssignmentChecker();
}

// Handle browser navigation
window.addEventListener('popstate', (e) => {
    if (e.state && e.state.page && app) {
        app.navigateToPage(e.state.page);
    }
});

// Export for global access
window.app = app;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AssignmentChecker;
}
