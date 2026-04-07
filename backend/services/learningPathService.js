const LearningPath = require('../models/LearningPath'); 
const Quiz = require('../models/Quiz'); 
const GamificationService = require('./gamificationService'); 

class LearningPathService {
  /**
   * Initialize learning path for a subject
   */
  static async initializeLearningPath(userId, subject) {
    try {
      let learningPath = await LearningPath.findOne({ userId, subject }); 

      if (!learningPath) {
        learningPath = new LearningPath({
          userId,
          subject,
          currentLevel: 'beginner',
          topicsCovered: [],
          recommendedTopics: this.getRecommendedTopicsBySubject(subject),
          focusAreas: [],
          progressPercentage: 0
        }); 
        await learningPath.save(); 
      }

      return learningPath; 
    } catch (error) {
      console.error('Error initializing learning path:', error); 
      return null; 
    }
  }

  /**
   * Update learning path based on quiz performance
   */
  static async updateLearningPath(userId, subject, quizData) {
    try {
      let learningPath = await LearningPath.findOne({ userId, subject }); 

      if (!learningPath) {
        learningPath = await this.initializeLearningPath(userId, subject); 
      }

      // Check if topic already covered
      let topicRecord = learningPath.topicsCovered.find(t => t.topicName === quizData.topic); 

      if (!topicRecord) {
        topicRecord = {
          topicName: quizData.topic,
          level: 'beginner',
          completed: quizData.score >= 70,
          score: quizData.score,
          attempts: 1,
          completedAt: quizData.score >= 70 ? new Date() : null
        }; 
        learningPath.topicsCovered.push(topicRecord); 
      } else {
        topicRecord.attempts += 1; 
        topicRecord.score = (topicRecord.score + quizData.score) / 2;  // Average score
        if (quizData.score >= 70 && !topicRecord.completed) {
          topicRecord.completed = true; 
          topicRecord.completedAt = new Date(); 
        }
      }

      // Update difficulty level
      learningPath = await this.updateDifficultyLevel(learningPath); 

      // Update focus areas
      learningPath = await this.updateFocusAreas(learningPath); 

      // Calculate progress
      learningPath.progressPercentage = this.calculateProgress(learningPath); 

      // Update next recommended topic
      learningPath.nextRecommendedTopic = this.getNextTopic(learningPath); 

      learningPath.lastUpdated = new Date(); 
      await learningPath.save(); 

      return learningPath; 
    } catch (error) {
      console.error('Error updating learning path:', error); 
      return null; 
    }
  }

  /**
   * Update difficulty based on performance
   */
  static async updateDifficultyLevel(learningPath) {
    try {
      const avgScore = learningPath.topicsCovered.length > 0
        ? learningPath.topicsCovered.reduce((sum, t) => sum + t.score, 0) / learningPath.topicsCovered.length
        : 0; 

      if (avgScore >= 85 && learningPath.currentLevel === 'beginner') {
        learningPath.currentLevel = 'intermediate'; 
      } else if (avgScore >= 75 && learningPath.currentLevel === 'intermediate') {
        learningPath.currentLevel = 'advanced'; 
      } else if (avgScore >= 90 && learningPath.currentLevel === 'advanced') {
        learningPath.currentLevel = 'master'; 
      }

      return learningPath; 
    } catch (error) {
      console.error('Error updating difficulty:', error); 
      return learningPath; 
    }
  }

  /**
   * Identify and update focus areas
   */
  static async updateFocusAreas(learningPath) {
    try {
      learningPath.focusAreas = learningPath.topicsCovered
        .filter(t => t.score < 70)
        .map(topic => ({
          topic: topic.topicName,
          weaknessScore: Math.round(100 - topic.score),
          recommendedActions: this.getRecommendedActions(topic)
        }))
        .sort((a, b) => b.weaknessScore - a.weaknessScore)
        .slice(0, 5); 

      return learningPath; 
    } catch (error) {
      console.error('Error updating focus areas:', error); 
      return learningPath; 
    }
  }

  /**
   * Generate recommended actions for weak topics
   */
  static getRecommendedActions(topic) {
    const actions = []; 

    if (topic.attempts === 1) {
      actions.push('Retry this topic'); 
      actions.push('Review the concept explanations'); 
    }

    if (topic.attempts >= 2 && topic.score < 50) {
      actions.push('Take a detailed course on this topic'); 
      actions.push('Consult the AI tutor for explanations'); 
      actions.push('Study notes on this topic'); 
    }

    if (topic.attempts >= 3) {
      actions.push('Try spaced repetition practice'); 
      actions.push('Focus on difficult subtopics'); 
    }

    if (topic.score >= 60 && topic.score < 70) {
      actions.push('One more practice quiz to master'); 
    }

    return actions; 
  }

  /**
   * Calculate overall progress
   */
  static calculateProgress(learningPath) {
    if (learningPath.topicsCovered.length === 0) return 0; 

    const completedTopics = learningPath.topicsCovered.filter(t => t.completed).length; 
    return Math.round((completedTopics / learningPath.topicsCovered.length) * 100); 
  }

  /**
   * Get next recommended topic
   */
  static getNextTopic(learningPath) {
    // Prioritize incomplete topics
    const incompleted = learningPath.topicsCovered.find(t => !t.completed); 
    if (incompleted) return incompleted.topicName; 

    // If all completed, suggest new recommended topic
    const coveredTopics = learningPath.topicsCovered.map(t => t.topicName); 
    const newTopic = learningPath.recommendedTopics.find(t => !coveredTopics.includes(t)); 
    return newTopic || 'All topics mastered!'; 
  }

  /**
   * Get recommended topics by subject
   */
  static getRecommendedTopicsBySubject(subject) {
    const subjects = {
      'Mathematics': [
        'Algebra', 'Geometry', 'Trigonometry', 'Calculus', 'Probability',
        'Statistics', 'Linear Algebra', 'Discrete Math'
      ],
      'Physics': [
        'Mechanics', 'Thermodynamics', 'Electromagnetism', 'Optics',
        'Modern Physics', 'Quantum Mechanics', 'Relativity'
      ],
      'Chemistry': [
        'General Chemistry', 'Organic Chemistry', 'Inorganic Chemistry',
        'Physical Chemistry', 'Analytical Chemistry', 'Biochemistry'
      ],
      'Biology': [
        'Cell Biology', 'Genetics', 'Evolution', 'Ecology',
        'Physiology', 'Microbiology', 'Molecular Biology'
      ],
      'Computer Science': [
        'Data Structures', 'Algorithms', 'OOP', 'Database',
        'Web Development', 'AI/ML', 'System Design', 'Networking'
      ],
      'History': [
        'Ancient History', 'Medieval History', 'Modern History',
        'World Wars', 'Cold War', 'Contemporary History'
      ],
      'English': [
        'Grammar', 'Vocabulary', 'Literature', 'Writing',
        'Speaking', 'Reading Comprehension', 'Essay Writing'
      ]
    }; 

    return subjects[subject] || [
      'Fundamentals', 'Intermediate', 'Advanced', 'Expert', 'Mastery'
    ]; 
  }

  /**
   * Get learning path analytics
   */
  static async getLearningPathAnalytics(userId, subject) {
    try {
      let learningPath = await LearningPath.findOne({ userId, subject }); 

      if (!learningPath) {
        learningPath = await this.initializeLearningPath(userId, subject); 
      }

      const completedTopics = learningPath.topicsCovered.filter(t => t.completed).length; 
      const totalTopics = learningPath.topicsCovered.length; 

      return {
        subject,
        currentLevel: learningPath.currentLevel,
        progressPercentage: learningPath.progressPercentage,
        topicsCovered: completedTopics,
        totalTopicsInPath: learningPath.recommendedTopics.length,
        nextTopic: learningPath.nextRecommendedTopic,
        focusAreas: learningPath.focusAreas,
        averageScore: learningPath.topicsCovered.length > 0
          ? Math.round(learningPath.topicsCovered.reduce((sum, t) => sum + t.score, 0) / learningPath.topicsCovered.length)
          : 0,
        estimatedTimeToMastery: this.estimateTimeToMastery(learningPath)
      }; 
    } catch (error) {
      console.error('Error getting learning path analytics:', error); 
      return null; 
    }
  }

  /**
   * Estimate time to mastery
   */
  static estimateTimeToMastery(learningPath) {
    if (learningPath.currentLevel === 'master') return 0; 

    const topicsRemaining = learningPath.recommendedTopics.length - learningPath.topicsCovered.length; 
    const avgAttemptsPerTopic = learningPath.topicsCovered.length > 0
      ? learningPath.topicsCovered.reduce((sum, t) => sum + t.attempts, 0) / learningPath.topicsCovered.length
      : 2; 

    return Math.ceil(topicsRemaining * avgAttemptsPerTopic); 
  }

  /**
   * Get all learning paths for user
   */
  static async getUserLearningPaths(userId) {
    try {
      const paths = await LearningPath.find({ userId }); 
      return paths; 
    } catch (error) {
      console.error('Error getting user learning paths:', error); 
      return []; 
    }
  }
}

module.exports = LearningPathService; 