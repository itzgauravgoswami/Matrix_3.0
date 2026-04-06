import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { quizAPI } from '../api/api'

export default function GenerateQuiz() {
  const navigate = useNavigate()
  const [stage, setStage] = useState('form') // form, quiz, results
  const [formData, setFormData] = useState({
    subject: '',
    topic: '',
    examPreparing: '',
    numQuestions: '10',
    difficulty: 'intermediate'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [quizData, setQuizData] = useState(null)
  const [userAnswers, setUserAnswers] = useState({})
  const [results, setResults] = useState(null)
  const [SubmittingQuiz, setSubmittingQuiz] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmitForm = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const response = await quizAPI.generateQuiz(formData)
      if (response.data.success) {
        setQuizData(response.data.quiz)
        setUserAnswers({})
        setStage('quiz')
      } else {
        setError(response.data.error || 'Failed to generate quiz')
      }
    } catch (err) {
      console.error('Error generating quiz:', err)
      setError(err.response?.data?.error || 'Failed to generate quiz. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerSelect = (questionId, optionIndex) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }))
  }

  const handleSubmitQuiz = async () => {
    // Check if all questions are answered
    if (Object.keys(userAnswers).length !== quizData.length) {
      setError('Please answer all questions before submitting')
      return
    }

    setSubmittingQuiz(true)
    setError('')

    try {
      // Convert userAnswers object to array indexed by question position
      const userAnswersArray = quizData.map((q, index) => userAnswers[q.id] ?? -1)
      
      const response = await quizAPI.submitQuiz({
        quizQuestions: quizData,
        userAnswers: userAnswersArray
      })

      if (response.data.success) {
        setResults(response.data)
        setStage('results')
      } else {
        setError(response.data.error || 'Failed to evaluate quiz')
      }
    } catch (err) {
      console.error('Error submitting quiz:', err)
      setError(err.response?.data?.error || 'Failed to submit quiz. Please try again.')
    } finally {
      setSubmittingQuiz(false)
    }
  }

  const handleRetake = () => {
    setStage('form')
    setFormData({
      subject: '',
      topic: '',
      examPreparing: '',
      numQuestions: '10',
      difficulty: 'intermediate'
    })
    setQuizData(null)
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
                <i className="fas fa-question-circle text-3xl text-orange-600"></i>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Generate Quiz</h1>
                <p className="text-gray-600 mt-1">Create customized quizzes to test your knowledge</p>
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
                      placeholder="e.g., Chemistry, History"
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
                      placeholder="e.g., Periodic Table, French Revolution"
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

                {/* Quiz Configuration */}
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
                      <option value="5">5 Questions</option>
                      <option value="10">10 Questions</option>
                      <option value="15">15 Questions</option>
                      <option value="20">20 Questions</option>
                      <option value="25">25 Questions</option>
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
                      Generating Quiz...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-magic"></i>
                      Generate Quiz
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* QUIZ STAGE */}
          {stage === 'quiz' && quizData && (
            <div className="space-y-8">
              {/* Quiz Header */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl p-8">
                <h2 className="text-3xl font-bold mb-2">{formData.subject}: {formData.topic}</h2>
                <p className="text-orange-100">Exam: {formData.examPreparing} • Difficulty: {formData.difficulty}</p>
                <div className="mt-4 text-sm">
                  <p>Progress: <span className="font-bold">{Object.keys(userAnswers).length}/{quizData.length}</span> answered</p>
                </div>
              </div>

              {/* Questions */}
              <div className="space-y-6">
                {quizData.map((question, index) => (
                  <div key={question.id} className="bg-white rounded-2xl shadow-lg p-8">
                    {/* Question Number and Text */}
                    <div className="mb-6">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                          <span className="font-bold text-orange-600">{index + 1}</span>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">{question.question}</h3>
                      </div>
                    </div>

                    {/* Options */}
                    <div className="space-y-3">
                      {question.options.map((option, optionIndex) => (
                        <label
                          key={optionIndex}
                          className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            userAnswers[question.id] === optionIndex
                              ? 'bg-orange-50 border-orange-500'
                              : 'bg-gray-50 border-gray-200 hover:border-orange-300'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${question.id}`}
                            checked={userAnswers[question.id] === optionIndex}
                            onChange={() => handleAnswerSelect(question.id, optionIndex)}
                            className="w-5 h-5 text-orange-500 cursor-pointer"
                          />
                          <span className="ml-3 text-gray-900 font-medium">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Submit Quiz Button */}
              <button
                onClick={handleSubmitQuiz}
                disabled={SubmittingQuiz || Object.keys(userAnswers).length !== quizData.length}
                className="w-full py-4 bg-green-500 text-white rounded-lg font-bold text-lg hover:bg-green-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {SubmittingQuiz ? (
                  <>
                    <i className="fas fa-spinner animate-spin"></i>
                    Submitting...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check-circle"></i>
                    Submit Quiz ({Object.keys(userAnswers).length}/{quizData.length})
                  </>
                )}
              </button>
            </div>
          )}

          {/* RESULTS STAGE */}
          {stage === 'results' && results && (
            <div className="space-y-8">
              {/* Score Card */}
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-2xl p-12 text-center">
                <div className="text-6xl font-bold mb-2">{results.percentage}%</div>
                <div className="text-3xl font-bold mb-4">{results.correctAnswers}/{results.totalQuestions}</div>
                <p className="text-lg text-orange-100 mb-6">Quiz Completed Successfully!</p>
                
                {/* Performance Badge */}
                <div className="inline-block px-6 py-2 bg-white bg-opacity-20 rounded-full text-lg font-semibold">
                  {results.percentage >= 80 ? '🎉 Excellent!' : results.percentage >= 60 ? '👍 Good Job!' : '💪 Keep Learning!'}
                </div>
              </div>

              {/* Results Details */}
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-gray-900">Detailed Results</h2>
                
                {results.results.map((result, index) => (
                  <div
                    key={result.questionId}
                    className={`rounded-2xl p-8 ${
                      result.isCorrect
                        ? 'bg-green-50 border-2 border-green-200'
                        : 'bg-red-50 border-2 border-red-200'
                    }`}
                  >
                    {/* Question Header */}
                    <div className="flex items-start gap-4 mb-6">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          result.isCorrect
                            ? 'bg-green-500 text-white'
                            : 'bg-red-500 text-white'
                        }`}
                      >
                        <i className={`fas fa-${result.isCorrect ? 'check' : 'times'}`}></i>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xl font-bold text-gray-900">Question {index + 1}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            result.isCorrect ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                          }`}>
                            {result.isCorrect ? 'Correct' : 'Incorrect'}
                          </span>
                        </div>
                        <p className="text-lg text-gray-800">{result.question}</p>
                      </div>
                    </div>

                    {/* Answer Information */}
                    <div className="space-y-3 ml-14">
                      <div>
                        <p className="text-sm font-semibold text-gray-700 mb-1">Your Answer:</p>
                        <p className={`text-base font-medium ${result.isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                          {result.userAnswer}
                        </p>
                      </div>

                      {!result.isCorrect && (
                        <div>
                          <p className="text-sm font-semibold text-gray-700 mb-1">Correct Answer:</p>
                          <p className="text-base font-medium text-green-700">{result.correctAnswer}</p>
                        </div>
                      )}

                      {/* Explanation */}
                      <div className="mt-4 pt-4 border-t border-gray-300">
                        <p className="text-sm font-semibold text-gray-700 mb-2">
                          <i className="fas fa-lightbulb text-yellow-500 mr-2"></i>
                          Explanation
                        </p>
                        <p className="text-gray-800 leading-relaxed">{result.explanation}</p>
                      </div>
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
                  Retake Quiz
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
                Quiz Features
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li>✓ Instant performance analysis and score breakdown</li>
                <li>✓ Detailed explanations (30-40 words) for each question</li>
                <li>✓ Track your progress over time</li>
                <li>✓ Retake quizzes to improve your score</li>
              </ul>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
