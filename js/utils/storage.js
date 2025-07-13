// Assignment Checker - Storage Utilities

class StorageUtils {
    static KEYS = {
        ASSIGNMENTS: 'assignments',
        SUBMISSIONS: 'submissions',
        SETTINGS: 'settings',
        API_KEY: 'hf_api_key'
    };

    // Assignment Management
    static saveAssignment(assignment) {
        try {
            const assignments = this.getAssignments();
            assignment.id = Date.now().toString();
            assignment.createdAt = new Date().toISOString();
            assignment.isActive = true;
            assignments.push(assignment);
            localStorage.setItem(this.KEYS.ASSIGNMENTS, JSON.stringify(assignments));
            return assignment;
        } catch (error) {
            console.error('Error saving assignment:', error);
            throw new Error('Failed to save assignment');
        }
    }

    static getAssignments() {
        try {
            const stored = localStorage.getItem(this.KEYS.ASSIGNMENTS);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading assignments:', error);
            return [];
        }
    }

    static getAssignment(id) {
        const assignments = this.getAssignments();
        return assignments.find(a => a.id === id);
    }

    static updateAssignment(id, updates) {
        try {
            const assignments = this.getAssignments();
            const index = assignments.findIndex(a => a.id === id);
            if (index !== -1) {
                assignments[index] = { ...assignments[index], ...updates, updatedAt: new Date().toISOString() };
                localStorage.setItem(this.KEYS.ASSIGNMENTS, JSON.stringify(assignments));
                return assignments[index];
            }
            return null;
        } catch (error) {
            console.error('Error updating assignment:', error);
            throw new Error('Failed to update assignment');
        }
    }

    static deleteAssignment(id) {
        try {
            const assignments = this.getAssignments();
            const filtered = assignments.filter(a => a.id !== id);
            localStorage.setItem(this.KEYS.ASSIGNMENTS, JSON.stringify(filtered));
            
            // Also delete related submissions
            const submissions = this.getSubmissions();
            const filteredSubmissions = submissions.filter(s => s.assignmentId !== id);
            localStorage.setItem(this.KEYS.SUBMISSIONS, JSON.stringify(filteredSubmissions));
            
            return true;
        } catch (error) {
            console.error('Error deleting assignment:', error);
            throw new Error('Failed to delete assignment');
        }
    }

    // Submission Management
    static saveSubmission(submission) {
        try {
            const submissions = this.getSubmissions();
            submission.id = Date.now().toString();
            submission.submittedAt = new Date().toISOString();
            submissions.push(submission);
            localStorage.setItem(this.KEYS.SUBMISSIONS, JSON.stringify(submissions));
            return submission;
        } catch (error) {
            console.error('Error saving submission:', error);
            throw new Error('Failed to save submission');
        }
    }

    static getSubmissions() {
        try {
            const stored = localStorage.getItem(this.KEYS.SUBMISSIONS);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading submissions:', error);
            return [];
        }
    }

    static getSubmission(id) {
        const submissions = this.getSubmissions();
        return submissions.find(s => s.id === id);
    }

    static getSubmissionsByAssignment(assignmentId) {
        const submissions = this.getSubmissions();
        return submissions.filter(s => s.assignmentId === assignmentId);
    }

    static updateSubmission(id, updates) {
        try {
            const submissions = this.getSubmissions();
            const index = submissions.findIndex(s => s.id === id);
            if (index !== -1) {
                submissions[index] = { ...submissions[index], ...updates, updatedAt: new Date().toISOString() };
                localStorage.setItem(this.KEYS.SUBMISSIONS, JSON.stringify(submissions));
                return submissions[index];
            }
            return null;
        } catch (error) {
            console.error('Error updating submission:', error);
            throw new Error('Failed to update submission');
        }
    }

    static deleteSubmission(id) {
        try {
            const submissions = this.getSubmissions();
            const filtered = submissions.filter(s => s.id !== id);
            localStorage.setItem(this.KEYS.SUBMISSIONS, JSON.stringify(filtered));
            return true;
        } catch (error) {
            console.error('Error deleting submission:', error);
            throw new Error('Failed to delete submission');
        }
    }

    // Settings Management
    static saveSettings(settings) {
        try {
            const currentSettings = this.getSettings();
            const updatedSettings = { ...currentSettings, ...settings, updatedAt: new Date().toISOString() };
            localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(updatedSettings));
            return updatedSettings;
        } catch (error) {
            console.error('Error saving settings:', error);
            throw new Error('Failed to save settings');
        }
    }

    static getSettings() {
        try {
            const stored = localStorage.getItem(this.KEYS.SETTINGS);
            const defaultSettings = {
                autoSave: true,
                showAnimations: true,
                theme: 'dark',
                language: 'en'
            };
            return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
        } catch (error) {
            console.error('Error loading settings:', error);
            return {
                autoSave: true,
                showAnimations: true,
                theme: 'dark',
                language: 'en'
            };
        }
    }

    // API Key Management
    static saveApiKey(key) {
        try {
            localStorage.setItem(this.KEYS.API_KEY, key);
            return true;
        } catch (error) {
            console.error('Error saving API key:', error);
            throw new Error('Failed to save API key');
        }
    }

    static getApiKey() {
        try {
            return localStorage.getItem(this.KEYS.API_KEY) || '';
        } catch (error) {
            console.error('Error loading API key:', error);
            return '';
        }
    }

    static deleteApiKey() {
        try {
            localStorage.removeItem(this.KEYS.API_KEY);
            return true;
        } catch (error) {
            console.error('Error deleting API key:', error);
            return false;
        }
    }

    // Data Export/Import
    static exportData() {
        try {
            const data = {
                assignments: this.getAssignments(),
                submissions: this.getSubmissions(),
                settings: this.getSettings(),
                exportedAt: new Date().toISOString(),
                version: '1.0.0'
            };
            
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `assignment-checker-data-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            return true;
        } catch (error) {
            console.error('Error exporting data:', error);
            throw new Error('Failed to export data');
        }
    }

    static async importData(file) {
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            // Validate data structure
            if (!data.assignments || !data.submissions) {
                throw new Error('Invalid data format');
            }
            
            // Backup current data
            const backup = {
                assignments: this.getAssignments(),
                submissions: this.getSubmissions(),
                settings: this.getSettings()
            };
            
            // Import data
            localStorage.setItem(this.KEYS.ASSIGNMENTS, JSON.stringify(data.assignments));
            localStorage.setItem(this.KEYS.SUBMISSIONS, JSON.stringify(data.submissions));
            if (data.settings) {
                localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(data.settings));
            }
            
            return { success: true, backup };
        } catch (error) {
            console.error('Error importing data:', error);
            throw new Error('Failed to import data: ' + error.message);
        }
    }

    // Data Management
    static clearAllData() {
        try {
            localStorage.removeItem(this.KEYS.ASSIGNMENTS);
            localStorage.removeItem(this.KEYS.SUBMISSIONS);
            localStorage.removeItem(this.KEYS.SETTINGS);
            // Keep API key unless explicitly requested to remove
            return true;
        } catch (error) {
            console.error('Error clearing data:', error);
            throw new Error('Failed to clear data');
        }
    }

    static getStorageSize() {
        try {
            let total = 0;
            for (let key in localStorage) {
                if (localStorage.hasOwnProperty(key)) {
                    total += localStorage[key].length + key.length;
                }
            }
            return {
                bytes: total,
                kb: (total / 1024).toFixed(2),
                mb: (total / (1024 * 1024)).toFixed(4)
            };
        } catch (error) {
            console.error('Error calculating storage size:', error);
            return { bytes: 0, kb: '0.00', mb: '0.0000' };
        }
    }

    // Statistics
    static getStatistics() {
        try {
            const assignments = this.getAssignments();
            const submissions = this.getSubmissions();
            
            // Calculate basic stats
            const totalAssignments = assignments.length;
            const totalSubmissions = submissions.length;
            const activeAssignments = assignments.filter(a => a.isActive).length;
            
            // Calculate average score
            const evaluatedSubmissions = submissions.filter(s => s.evaluation && s.evaluation.overallScore);
            const averageScore = evaluatedSubmissions.length > 0
                ? Math.round(evaluatedSubmissions.reduce((sum, s) => sum + s.evaluation.overallScore, 0) / evaluatedSubmissions.length)
                : 0;
            
            // Calculate completion rate
            const completedEvaluations = submissions.filter(s => s.evaluation && s.evaluation.evaluatedAt).length;
            const completionRate = submissions.length > 0
                ? Math.round((completedEvaluations / submissions.length) * 100)
                : 0;
            
            // Subject distribution
            const subjectStats = assignments.reduce((acc, assignment) => {
                const subject = assignment.subject || 'other';
                acc[subject] = (acc[subject] || 0) + 1;
                return acc;
            }, {});
            
            // Grade distribution
            const gradeStats = evaluatedSubmissions.reduce((acc, submission) => {
                const grade = submission.evaluation.grade || 'Unknown';
                acc[grade] = (acc[grade] || 0) + 1;
                return acc;
            }, {});
            
            return {
                totalAssignments,
                totalSubmissions,
                activeAssignments,
                averageScore,
                completedEvaluations,
                completionRate,
                subjectStats,
                gradeStats,
                storageSize: this.getStorageSize()
            };
        } catch (error) {
            console.error('Error calculating statistics:', error);
            return {
                totalAssignments: 0,
                totalSubmissions: 0,
                activeAssignments: 0,
                averageScore: 0,
                completedEvaluations: 0,
                completionRate: 0,
                subjectStats: {},
                gradeStats: {},
                storageSize: { bytes: 0, kb: '0.00', mb: '0.0000' }
            };
        }
    }

    // Search and Filter
    static searchAssignments(query, filters = {}) {
        try {
            let assignments = this.getAssignments();
            
            // Apply text search
            if (query) {
                const lowerQuery = query.toLowerCase();
                assignments = assignments.filter(assignment =>
                    assignment.title.toLowerCase().includes(lowerQuery) ||
                    assignment.subject.toLowerCase().includes(lowerQuery) ||
                    assignment.description.toLowerCase().includes(lowerQuery)
                );
            }
            
            // Apply filters
            if (filters.subject) {
                assignments = assignments.filter(a => a.subject === filters.subject);
            }
            
            if (filters.isActive !== undefined) {
                assignments = assignments.filter(a => a.isActive === filters.isActive);
            }
            
            if (filters.dateFrom) {
                assignments = assignments.filter(a => new Date(a.createdAt) >= new Date(filters.dateFrom));
            }
            
            if (filters.dateTo) {
                assignments = assignments.filter(a => new Date(a.createdAt) <= new Date(filters.dateTo));
            }
            
            return assignments;
        } catch (error) {
            console.error('Error searching assignments:', error);
            return [];
        }
    }

    static searchSubmissions(query, filters = {}) {
        try {
            let submissions = this.getSubmissions();
            
            // Apply text search
            if (query) {
                const lowerQuery = query.toLowerCase();
                submissions = submissions.filter(submission =>
                    submission.studentName.toLowerCase().includes(lowerQuery) ||
                    submission.studentId.toLowerCase().includes(lowerQuery) ||
                    (submission.submissionText && submission.submissionText.toLowerCase().includes(lowerQuery))
                );
            }
            
            // Apply filters
            if (filters.assignmentId) {
                submissions = submissions.filter(s => s.assignmentId === filters.assignmentId);
            }
            
            if (filters.hasEvaluation !== undefined) {
                submissions = submissions.filter(s => !!s.evaluation === filters.hasEvaluation);
            }
            
            if (filters.minScore !== undefined) {
                submissions = submissions.filter(s => s.evaluation && s.evaluation.overallScore >= filters.minScore);
            }
            
            if (filters.maxScore !== undefined) {
                submissions = submissions.filter(s => s.evaluation && s.evaluation.overallScore <= filters.maxScore);
            }
            
            if (filters.grade) {
                submissions = submissions.filter(s => s.evaluation && s.evaluation.grade === filters.grade);
            }
            
            return submissions;
        } catch (error) {
            console.error('Error searching submissions:', error);
            return [];
        }
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StorageUtils;
}
