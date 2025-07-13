// Assignment Checker - Hugging Face API Service

class HuggingFaceService {
    static API_BASE = 'https://api-inference.huggingface.co/models';
    static MODELS = {
        textGeneration: 'microsoft/DialoGPT-medium',
        textClassification: 'facebook/bart-large-mnli',
        questionAnswering: 'deepset/roberta-base-squad2',
        sentimentAnalysis: 'cardiffnlp/twitter-roberta-base-sentiment-latest',
        textSummarization: 'facebook/bart-large-cnn'
    };

    constructor() {
        this.apiKey = StorageUtils.getApiKey();
        this.requestCache = new Map();
        this.rateLimitDelay = 1000; // 1 second between requests
        this.lastRequestTime = 0;
    }

    // Set API key
    setApiKey(key) {
        this.apiKey = key;
        StorageUtils.saveApiKey(key);
    }

    // Check if API key is configured
    isConfigured() {
        return !!this.apiKey;
    }

    // Rate limiting helper
    async waitForRateLimit() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        
        if (timeSinceLastRequest < this.rateLimitDelay) {
            const waitTime = this.rateLimitDelay - timeSinceLastRequest;
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
        
        this.lastRequestTime = Date.now();
    }

    // Generic API request method
    async makeRequest(model, inputs, parameters = {}, useCache = true) {
        if (!this.apiKey) {
            throw new Error('API key not configured. Please set your Hugging Face API key in settings.');
        }

        // Check cache first
        const cacheKey = JSON.stringify({ model, inputs, parameters });
        if (useCache && this.requestCache.has(cacheKey)) {
            return this.requestCache.get(cacheKey);
        }

        await this.waitForRateLimit();

        try {
            const response = await fetch(`${HuggingFaceService.API_BASE}/${model}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    inputs,
                    parameters,
                    options: {
                        wait_for_model: true,
                        use_cache: useCache
                    }
                })
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Invalid API key. Please check your Hugging Face API key.');
                } else if (response.status === 429) {
                    throw new Error('Rate limit exceeded. Please try again later.');
                } else if (response.status === 503) {
                    throw new Error('Model is currently loading. Please try again in a few moments.');
                }
                throw new Error(`API request failed: ${response.status} ${response.statusText}`);
            }

            const result = await response.json();
            
            // Cache successful results
            if (useCache) {
                this.requestCache.set(cacheKey, result);
                
                // Limit cache size
                if (this.requestCache.size > 100) {
                    const firstKey = this.requestCache.keys().next().value;
                    this.requestCache.delete(firstKey);
                }
            }

            return result;
        } catch (error) {
            console.error('Hugging Face API error:', error);
            throw error;
        }
    }

    // Evaluate assignment submission
    async evaluateSubmission(assignment, submission) {
        try {
            const evaluationPrompt = this.buildEvaluationPrompt(assignment, submission);
            
            // Use text generation to evaluate the submission
            const result = await this.makeRequest(
                HuggingFaceService.MODELS.textGeneration,
                evaluationPrompt,
                {
                    max_length: 500,
                    temperature: 0.7,
                    do_sample: true,
                    top_p: 0.9
                }
            );

            // Parse the generated evaluation
            const evaluation = this.parseEvaluation(result[0]?.generated_text || '', assignment);
            
            // Add sentiment analysis
            const sentiment = await this.analyzeSentiment(submission.submissionText);
            evaluation.sentiment = sentiment;
            
            // Add additional metrics
            evaluation.metrics = await this.calculateMetrics(assignment, submission);
            evaluation.evaluatedAt = new Date().toISOString();
            evaluation.evaluatedBy = 'AI Assistant';

            return evaluation;
        } catch (error) {
            console.error('Error evaluating submission:', error);
            throw new Error('Failed to evaluate submission: ' + error.message);
        }
    }

    // Build evaluation prompt
    buildEvaluationPrompt(assignment, submission) {
        const prompt = `
Assignment Evaluation Task:

ASSIGNMENT DETAILS:
Title: ${assignment.title}
Subject: ${assignment.subject}
Description: ${assignment.description}
Instructions: ${assignment.instructions}
Total Points: ${assignment.totalPoints}

RUBRIC CRITERIA:
${assignment.rubric.map(criterion => 
    `- ${criterion.name} (${criterion.points} points): ${criterion.description}`
).join('\n')}

STUDENT SUBMISSION:
Student: ${submission.studentName} (ID: ${submission.studentId})
Submission Text: ${submission.submissionText}

EVALUATION REQUIREMENTS:
1. Evaluate the submission against each rubric criterion
2. Provide a score for each criterion (0 to maximum points)
3. Calculate overall score and percentage
4. Assign a letter grade (A, B, C, D, F)
5. Provide specific feedback for improvement
6. Highlight strengths and areas for improvement

Please provide a detailed evaluation following this format:
SCORES: [criterion1: X/Y points, criterion2: X/Y points, ...]
OVERALL: X/${assignment.totalPoints} points (X%)
GRADE: [Letter Grade]
FEEDBACK: [Detailed feedback]
STRENGTHS: [What the student did well]
IMPROVEMENTS: [Areas for improvement]

Evaluation:`;

        return prompt;
    }

    // Parse evaluation response
    parseEvaluation(generatedText, assignment) {
        const evaluation = {
            criteriaScores: [],
            overallScore: 0,
            percentage: 0,
            grade: 'F',
            feedback: '',
            strengths: [],
            improvements: [],
            totalPossiblePoints: assignment.totalPoints
        };

        try {
            // Extract scores
            const scoresMatch = generatedText.match(/SCORES:\s*(.+?)(?:OVERALL:|$)/s);
            if (scoresMatch) {
                const scoresText = scoresMatch[1].trim();
                const scoreMatches = scoresText.match(/(\w+):\s*(\d+)\/(\d+)/g);
                
                if (scoreMatches) {
                    scoreMatches.forEach((match, index) => {
                        const [, , earned, possible] = match.match(/(\w+):\s*(\d+)\/(\d+)/);
                        evaluation.criteriaScores.push({
                            criterion: assignment.rubric[index]?.name || `Criterion ${index + 1}`,
                            earned: parseInt(earned),
                            possible: parseInt(possible),
                            percentage: Math.round((parseInt(earned) / parseInt(possible)) * 100)
                        });
                    });
                }
            }

            // Extract overall score
            const overallMatch = generatedText.match(/OVERALL:\s*(\d+)\/(\d+)\s*\((\d+)%\)/);
            if (overallMatch) {
                evaluation.overallScore = parseInt(overallMatch[1]);
                evaluation.percentage = parseInt(overallMatch[3]);
            } else {
                // Calculate from criteria scores
                const totalEarned = evaluation.criteriaScores.reduce((sum, score) => sum + score.earned, 0);
                evaluation.overallScore = totalEarned;
                evaluation.percentage = Math.round((totalEarned / assignment.totalPoints) * 100);
            }

            // Extract grade
            const gradeMatch = generatedText.match(/GRADE:\s*([A-F][+-]?)/);
            if (gradeMatch) {
                evaluation.grade = gradeMatch[1];
            } else {
                // Calculate grade from percentage
                evaluation.grade = this.calculateGrade(evaluation.percentage);
            }

            // Extract feedback
            const feedbackMatch = generatedText.match(/FEEDBACK:\s*(.+?)(?:STRENGTHS:|$)/s);
            if (feedbackMatch) {
                evaluation.feedback = feedbackMatch[1].trim();
            }

            // Extract strengths
            const strengthsMatch = generatedText.match(/STRENGTHS:\s*(.+?)(?:IMPROVEMENTS:|$)/s);
            if (strengthsMatch) {
                evaluation.strengths = strengthsMatch[1]
                    .split(/[-•\n]/)
                    .map(s => s.trim())
                    .filter(s => s.length > 0);
            }

            // Extract improvements
            const improvementsMatch = generatedText.match(/IMPROVEMENTS:\s*(.+?)$/s);
            if (improvementsMatch) {
                evaluation.improvements = improvementsMatch[1]
                    .split(/[-•\n]/)
                    .map(s => s.trim())
                    .filter(s => s.length > 0);
            }

        } catch (error) {
            console.error('Error parsing evaluation:', error);
            // Provide default evaluation if parsing fails
            evaluation.feedback = 'Unable to parse detailed evaluation. Please review manually.';
        }

        return evaluation;
    }

    // Calculate letter grade from percentage
    calculateGrade(percentage) {
        if (percentage >= 97) return 'A+';
        if (percentage >= 93) return 'A';
        if (percentage >= 90) return 'A-';
        if (percentage >= 87) return 'B+';
        if (percentage >= 83) return 'B';
        if (percentage >= 80) return 'B-';
        if (percentage >= 77) return 'C+';
        if (percentage >= 73) return 'C';
        if (percentage >= 70) return 'C-';
        if (percentage >= 67) return 'D+';
        if (percentage >= 63) return 'D';
        if (percentage >= 60) return 'D-';
        return 'F';
    }

    // Analyze sentiment of submission
    async analyzeSentiment(text) {
        try {
            const result = await this.makeRequest(
                HuggingFaceService.MODELS.sentimentAnalysis,
                text.substring(0, 500) // Limit text length
            );

            if (result && result.length > 0) {
                const sentiment = result[0];
                return {
                    label: sentiment.label,
                    score: Math.round(sentiment.score * 100),
                    confidence: sentiment.score
                };
            }
        } catch (error) {
            console.error('Error analyzing sentiment:', error);
        }

        return {
            label: 'NEUTRAL',
            score: 50,
            confidence: 0.5
        };
    }

    // Calculate additional metrics
    async calculateMetrics(assignment, submission) {
        const text = submission.submissionText;
        
        return {
            wordCount: text.split(/\s+/).filter(word => word.length > 0).length,
            characterCount: text.length,
            sentenceCount: text.split(/[.!?]+/).filter(s => s.trim().length > 0).length,
            paragraphCount: text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length,
            averageWordsPerSentence: Math.round(
                text.split(/\s+/).length / Math.max(1, text.split(/[.!?]+/).length)
            ),
            readabilityScore: this.calculateReadabilityScore(text),
            keywordMatches: this.findKeywordMatches(assignment.keywords || [], text)
        };
    }

    // Calculate simple readability score (Flesch Reading Ease approximation)
    calculateReadabilityScore(text) {
        const words = text.split(/\s+/).filter(word => word.length > 0);
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const syllables = words.reduce((count, word) => count + this.countSyllables(word), 0);
        
        if (sentences.length === 0 || words.length === 0) return 0;
        
        const avgWordsPerSentence = words.length / sentences.length;
        const avgSyllablesPerWord = syllables / words.length;
        
        const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);
        return Math.max(0, Math.min(100, Math.round(score)));
    }

    // Count syllables in a word (simple approximation)
    countSyllables(word) {
        word = word.toLowerCase();
        if (word.length <= 3) return 1;
        word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
        word = word.replace(/^y/, '');
        const matches = word.match(/[aeiouy]{1,2}/g);
        return matches ? matches.length : 1;
    }

    // Find keyword matches
    findKeywordMatches(keywords, text) {
        const lowerText = text.toLowerCase();
        return keywords.filter(keyword => 
            lowerText.includes(keyword.toLowerCase())
        ).length;
    }

    // Summarize submission
    async summarizeSubmission(text, maxLength = 100) {
        try {
            if (text.length <= maxLength) return text;

            const result = await this.makeRequest(
                HuggingFaceService.MODELS.textSummarization,
                text,
                {
                    max_length: maxLength,
                    min_length: Math.min(30, Math.floor(maxLength / 2)),
                    do_sample: false
                }
            );

            return result[0]?.summary_text || text.substring(0, maxLength) + '...';
        } catch (error) {
            console.error('Error summarizing text:', error);
            return text.substring(0, maxLength) + '...';
        }
    }

    // Check if submission answers specific questions
    async checkQuestionAnswering(questions, submissionText) {
        const results = [];
        
        for (const question of questions) {
            try {
                const result = await this.makeRequest(
                    HuggingFaceService.MODELS.questionAnswering,
                    {
                        question: question,
                        context: submissionText
                    }
                );

                results.push({
                    question,
                    answer: result.answer,
                    confidence: Math.round(result.score * 100),
                    hasAnswer: result.score > 0.1
                });
            } catch (error) {
                console.error('Error checking question answering:', error);
                results.push({
                    question,
                    answer: 'Unable to determine',
                    confidence: 0,
                    hasAnswer: false
                });
            }
        }
        
        return results;
    }

    // Classify submission content
    async classifyContent(text, categories) {
        try {
            const candidateLabels = categories.join(', ');
            const result = await this.makeRequest(
                HuggingFaceService.MODELS.textClassification,
                {
                    sequence: text,
                    candidate_labels: candidateLabels
                }
            );

            return result.labels.map((label, index) => ({
                category: label,
                score: Math.round(result.scores[index] * 100),
                confidence: result.scores[index]
            }));
        } catch (error) {
            console.error('Error classifying content:', error);
            return categories.map(category => ({
                category,
                score: 0,
                confidence: 0
            }));
        }
    }

    // Test API connection
    async testConnection() {
        try {
            await this.makeRequest(
                HuggingFaceService.MODELS.sentimentAnalysis,
                'This is a test message.',
                {},
                false // Don't use cache for test
            );
            return { success: true, message: 'API connection successful' };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    // Clear cache
    clearCache() {
        this.requestCache.clear();
    }

    // Get cache statistics
    getCacheStats() {
        return {
            size: this.requestCache.size,
            maxSize: 100
        };
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HuggingFaceService;
}
