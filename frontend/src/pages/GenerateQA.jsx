import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { qaAPI } from '../api/api'

export default function GenerateQA() {
  const navigate = useNavigate()
  const [stage, setStage] = useState('form') // form, test, results
  const [formData, setFormData] = useState({
    subject: '',
    topic: '',
    examPreparing: '',
    numQuestions: '5',
    difficulty: 'intermediate'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [questions, setQuestions] = useState(null)
  const [userAnswers, setUserAnswers] = useState({})
  const [results, setResults] = useState(null)
  const [submittingTest, setSubmittingTest] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmitForm = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const response = await qaAPI.generateQA(formData)
      if (response.data.success) {
        setQuestions(response.data.questions)
        setUserAnswers({})
        setStage('test')
      } else {
        setError(response.data.error || 'Failed to generate QA test')
      }
    } catch (err) {
      console.error('Error generating QA:', err)
      setError(err.response?.data?.error || 'Failed to generate QA test. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerChange = (questionId, answer) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  const handleSubmitTest = async () => {
    // Check if all questions are answered
    if (Object.keys(userAnswers).length !== questions.length) {
      setError('Please answer all questions before submitting')
      return
    }

    // Check if all answers have some content
    const allAnswered = Object.values(userAnswers).every(answer => answer.trim() !== '')
    if (!allAnswered) {
      setError('Please provide answers to all questions')
      return
    }

    setSubmittingTest(true)
    setError('')

    try {
      // Convert userAnswers object to array indexed by question position
      const userAnswersArray = questions.map((q) => userAnswers[q.id] || '')
      
      const response = await qaAPI.evaluateQA({
        questions,
        userAnswers: userAnswersArray
      })

      if (response.data.success) {
        setResults(response.data)
        setStage('results')
      } else {
        setError(response.data.error || 'Failed to evaluate test')
      }
    } catch (err) {
      console.error('Error submitting test:', err)
      setError(err.response?.data?.error || 'Failed to submit test. Please try again.')
    } finally {
      setSubmittingTest(false)
    }
  }

  const handleRetake = () => {
    setStage('form')
    setFormData({
      subject: '',
      topic: '',
      examPreparing: '',
      numQuestions: '5',
      difficulty: 'intermediate'
    })
    setQuestions(null)
    setUserAnswers({})
    setResults(null)
    setError('')
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow py-12 px-4 md:px-8">
        <div className="max-w-4xl mx-auto mt-16">
          {/* Back Button */}
          <button
            onClick={() => navigate('/dashboard')}
            className="mb-6 flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold transition-all"
          >
            <i className="fas fa-arrow-left"></i>
            Back to Dashboard
          </button>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center">
                <i className="fas fa-pen-fancy text-3xl text-orange-600"></i>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Generate Q&A Test</h1>
                <p className="text-gray-600 mt-1">Test your knowledge with question-answer format</p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-lg">
              <i className="fas fa-exclamation-circle mr-2"></i>
              {error}
            </div>
          )}

          {/* FORM STAGE */}
          {stage === 'form' && (
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <form onSubmit={handleSubmitForm} className="space-y-6">
                {/* Subject and Topic */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-2">
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="e.g., Biology, Economics"
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-all text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-2">
                      Topic <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="topic"
                      value={formData.topic}
                      onChange={handleChange}
                      placeholder="e.g., Photosynthesis, Supply and Demand"
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-all text-base"
                    />
                  </div>
                </div>

                {/* Exam Preparing For */}
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-2">
                    Exam Preparing For <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="examPreparing"
                    value={formData.examPreparing}
                    onChange={handleChange}
                    placeholder="e.g., JEE Main, NEET, Board Exam, Competitive Exam"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-all text-base"
                  />
                </div>

                {/* Test Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Number of Questions */}
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-2">
                      No. of Questions <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="numQuestions"
                      value={formData.numQuestions}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-all text-base"
                    >
                      <option value="3">3 Questions</option>
                      <option value="5">5 Questions</option>
                      <option value="7">7 Questions</option>
                      <option value="10">10 Questions</option>
                    </select>
                  </div>

                  {/* Difficulty */}
                  <div>
                    <label className="block text-lg font-semibold text-gray-900 mb-2">
                      Difficulty Level <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-all text-base"
                    >
                      <option value="easy">Easy</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-orange-500 text-white rounded-lg font-semibold text-lg hover:bg-orange-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner animate-spin"></i>
                      Generating Test...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-magic"></i>
                      Generate Q&A Test
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* TEST STAGE */}
          {stage === 'test' && questions && (
            <div className="space-y-8">
              {/* Test Header */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl p-8">
                <h2 className="text-3xl font-bold mb-2">{formData.subject}: {formData.topic}</h2>
                <p className="text-orange-100">Exam: {formData.examPreparing} • Difficulty: {formData.difficulty}</p>
                <div className="mt-4 text-sm">
                  <p>Progress: <span className="font-bold">{Object.keys(userAnswers).length}/{questions.length}</span> answered</p>
                </div>
              </div>

              {/* Questions */}
              <div className="space-y-8">
                {questions.map((question, index) => (
                  <div key={question.id} className="bg-white rounded-2xl shadow-lg p-8">
                    {/* Question Number and Text */}
                    <div className="mb-6">
                      <div className="flex items-start gap-3 mb-4">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="font-bold text-orange-600">{index + 1}</span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">{question.question}</h3>
                      </div>
                    </div>

                    {/* Answer Input */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-3">Your Answer:</label>
                      <textarea
                        value={userAnswers[question.id] || ''}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        placeholder="Write your answer here... (minimum 20 characters)"
                        rows="5"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-all text-base resize-none"
                      />
                      <div className="mt-2 text-sm text-gray-600">
                        Characters: {(userAnswers[question.id] || '').length}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Submit Test Button */}
              <button
                onClick={handleSubmitTest}
                disabled={submittingTest || Object.keys(userAnswers).length !== questions.length}
                className="w-full py-4 bg-green-500 text-white rounded-lg font-bold text-lg hover:bg-green-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submittingTest ? (
                  <>
                    <i className="fas fa-spinner animate-spin"></i>
                    Evaluating Answers...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check-circle"></i>
                    Submit Test ({Object.keys(userAnswers).length}/{questions.length})
                  </>
                )}
              </button>
            </div>
          )}

          {/* RESULTS STAGE */}
          {stage === 'results' && results && (
            <div className="space-y-8">
              {/* Overall Score Card */}
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl p-12 text-center">
                <div className="text-6xl font-bold mb-2">{results.averageScore}%</div>
                <div className="text-2xl font-bold mb-4">Overall Score</div>
                <div className="text-lg text-orange-100 mb-6">Total Score: {results.totalScore}/{results.totalQuestions * 100}</div>
                
                {/* Performance Badge */}
                <div className="inline-block px-6 py-2 bg-white bg-opacity-20 rounded-full text-lg font-semibold">
                  {results.averageScore >= 80 ? '🎉 Excellent!' : results.averageScore >= 60 ? '👍 Good Job!' : '💪 Keep Practicing!'}
                </div>
              </div>

              {/* Detailed Results */}
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-gray-900">Detailed Review</h2>
                
                {results.results.map((result, index) => (
                  <div key={result.questionId} className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {/* Question Header */}
                    <div className={`p-6 ${result.score >= 70 ? 'bg-green-50 border-l-4 border-green-500' : result.score >= 50 ? 'bg-yellow-50 border-l-4 border-yellow-500' : 'bg-red-50 border-l-4 border-red-500'}`}>
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                              result.score >= 70 ? 'bg-green-500' : result.score >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}>
                              {result.score}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">Question {index + 1}</p>
                              <p className="text-sm text-gray-600">Score: {result.score}/100</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-lg font-semibold text-gray-900">{result.question}</p>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                      {/* Your Answer */}
                      <div>
                        <p className="font-semibold text-gray-900 mb-2">
                          <i className="fas fa-pencil text-blue-500 mr-2"></i>
                          Your Answer
                        </p>
                        <div className="bg-gray-50 border-2 border-gray-200 rounded-lg p-4 text-gray-800">
                          {result.userAnswer}
                        </div>
                      </div>

                      {/* Model Answer */}
                      <div>
                        <p className="font-semibold text-gray-900 mb-2">
                          <i className="fas fa-check-circle text-green-500 mr-2"></i>
                          Model Answer
                        </p>
                        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-gray-800">
                          {result.modelAnswer}
                        </div>
                      </div>

                      {/* Feedback */}
                      {result.feedback && (
                        <div>
                          <p className="font-semibold text-gray-900 mb-2">
                            <i className="fas fa-comment-dots text-blue-500 mr-2"></i>
                            Feedback
                          </p>
                          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 text-gray-800">
                            {result.feedback}
                          </div>
                        </div>
                      )}

                      {/* Tips */}
                      {result.tips && result.tips.length > 0 && (
                        <div>
                          <p className="font-semibold text-gray-900 mb-3">
                            <i className="fas fa-lightbulb text-yellow-500 mr-2"></i>
                            Tips for Better Answer
                          </p>
                          <ul className="space-y-2">
                            {result.tips.map((tip, tipIndex) => (
                              <li key={tipIndex} className="flex items-start gap-3 bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                                <span className="text-yellow-600 font-bold flex-shrink-0">•</span>
                                <span className="text-gray-800">{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Areas to Improve */}
                      {result.areasToImprove && result.areasToImprove.length > 0 && (
                        <div>
                          <p className="font-semibold text-gray-900 mb-3">
                            <i className="fas fa-chart-line text-orange-500 mr-2"></i>
                            Areas to Improve
                          </p>
                          <ul className="space-y-2">
                            {result.areasToImprove.map((area, areaIndex) => (
                              <li key={areaIndex} className="flex items-start gap-3 bg-orange-50 border-l-4 border-orange-400 p-3 rounded">
                                <span className="text-orange-600 font-bold flex-shrink-0">→</span>
                                <span className="text-gray-800">{area}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={handleRetake}
                  className="flex-1 py-4 bg-orange-500 text-white rounded-lg font-bold text-lg hover:bg-orange-600 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <i className="fas fa-redo"></i>
                  Retake Test
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 py-4 bg-gray-500 text-white rounded-lg font-bold text-lg hover:bg-gray-600 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <i className="fas fa-home"></i>
                  Back to Dashboard
                </button>
              </div>
            </div>
          )}

          {/* Info Section (only in form stage) */}
          {stage === 'form' && (
            <div className="mt-8 bg-orange-50 rounded-2xl p-6 border-2 border-orange-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                <i className="fas fa-lightbulb text-orange-600 mr-2"></i>
                Q&A Test Features
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>✓ Write comprehensive answers to challenging questions</li>
                <li>✓ AI-powered evaluation with detailed scoring (0-100)</li>
                <li>✓ Model answers for each question</li>
                <li>✓ Personalized feedback and tips for improvement</li>
                <li>✓ Identify specific areas to focus on</li>
              </ul>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
