import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { supremeLearningAPI } from '../api/api'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function SupremeLearning() {
  const navigate = useNavigate()
  const [stage, setStage] = useState('form')
  const [formData, setFormData] = useState({
    subject: '',
    topic: '',
    examPreparing: '',
    difficulty: 'intermediate'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [data, setData] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await supremeLearningAPI.generate({
        subject: formData.subject,
        topic: formData.topic,
        examPreparing: formData.examPreparing,
        difficulty: formData.difficulty
      })

      if (response.data.success) {
        setData(response.data)
        setStage('results')
      } else {
        setError('Failed to generate learning materials')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Error generating learning materials')
    } finally {
      setLoading(false)
    }
  }

  const handleRetry = () => {
    setStage('form')
    setData(null)
    setError('')
  }


  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-grow py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto mt-16">
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
                <i className="fas fa-crown text-3xl text-orange-600"></i>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Supreme Learning</h1>
                <p className="text-gray-600 mt-1">Learn with curated videos and comprehensive notes side-by-side</p>
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
              <form onSubmit={handleSubmit} className="space-y-6">
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
                      placeholder="e.g., Physics, Chemistry, Biology"
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
                      placeholder="e.g., Thermodynamics, Chemical Bonding"
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
                    placeholder="e.g., JEE Main, NEET, Board Exam"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-all text-base"
                  />
                </div>

                {/* Difficulty Level */}
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

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-orange-500 text-white rounded-lg font-semibold text-lg hover:bg-orange-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner animate-spin"></i>
                      Finding Best Resources...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-crown"></i>
                      Start Supreme Learning
                    </>
                  )}
                </button>
              </form>

              {/* Features Section */}
              <div className="mt-8 bg-orange-50 rounded-2xl p-6 border-2 border-orange-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  <i className="fas fa-star text-orange-600 mr-2"></i>
                  Why Supreme Learning?
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li>✓ AI-curated best YouTube video for your topic</li>
                  <li>✓ Comprehensive, well-structured study notes</li>
                  <li>✓ Watch video and read notes simultaneously</li>
                  <li>✓ Covers key concepts, examples, and tips</li>
                  <li>✓ Perfect for exam preparation</li>
                </ul>
              </div>
            </div>
          )}

          {/* RESULTS STAGE - Side by Side Layout */}
          {stage === 'results' && data && (
            <div>
              {/* Header with details */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-2xl p-8 mb-8">
                <h2 className="text-3xl font-bold mb-2">{formData.subject}: {formData.topic}</h2>
                <p className="text-orange-100">Exam: {formData.examPreparing} • Difficulty: {formData.difficulty}</p>
              </div>

              {/* Two-column layout: Video on left, Notes on right */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* LEFT SIDE - VIDEO */}
                <div className="flex flex-col">
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col h-full">
                    {/* Video Title */}
                    <div className="p-6 bg-gradient-to-r from-red-50 to-orange-50 border-b-2 border-red-200">
                      <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-2">
                        <i className="fas fa-play-circle text-red-600"></i>
                        Recommended Video
                      </h3>
                      <p className="text-base font-semibold text-red-900 mb-2">{data.video.title}</p>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <i className="fas fa-user"></i>
                        {data.video.channel}
                      </p>
                    </div>

                    {/* Embedded YouTube Video */}
                    {data.video.videoId ? (
                      <div className="flex-grow bg-black flex items-center justify-center p-4 min-h-[450px]">
                        <iframe
                          width="100%"
                          height="450"
                          src={data.video.embedUrl}
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                          className="rounded-lg"
                        ></iframe>
                      </div>
                    ) : (
                      /* Fallback: Video recommendation card */
                      <div className="flex-grow flex flex-col items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-8">
                        <div className="text-center space-y-6 max-w-sm">
                          <div>
                            <i className="fas fa-video text-6xl text-red-500 mb-4 block"></i>
                            <h4 className="text-2xl font-bold text-gray-900 mb-2">YouTube Video</h4>
                            <p className="text-gray-600">Watch on YouTube</p>
                          </div>

                          {/* Why this video explanation */}
                          <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
                            <p className="text-sm text-gray-900 font-semibold mb-2">Why this video?</p>
                            <p className="text-gray-700 text-sm leading-relaxed">{data.video.description}</p>
                          </div>

                          {/* Search Keywords Display */}
                          <div className="bg-white rounded-lg p-4 border-2 border-gray-200">
                            <p className="text-xs font-semibold text-gray-600 mb-2">Search on YouTube:</p>
                            <div className="space-y-2">
                              <div className="flex flex-wrap gap-2 justify-center">
                                <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-xs font-medium">
                                  {data.video.searchKeywordsPrimary}
                                </span>
                              </div>
                              {data.video.searchKeywordsSecondary && (
                                <div className="flex flex-wrap gap-2 justify-center">
                                  <span className="text-xs text-gray-600">Or:</span>
                                  <span className="bg-gray-200 text-gray-800 px-3 py-1 rounded-full text-xs font-medium">
                                    {data.video.searchKeywordsSecondary}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Video Links and Info */}
                    <div className="p-6 border-t-2 border-gray-200 space-y-3">
                      {data.video.videoId && (
                        <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                          <p className="text-sm text-gray-700">
                            <i className="fas fa-check-circle text-green-600 mr-2"></i>
                            <span className="font-semibold">Real video from YouTube</span>
                          </p>
                        </div>
                      )}
                      
                      <a
                        href={data.video.watchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full px-6 py-4 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-all text-center text-lg"
                      >
                        <i className="fab fa-youtube mr-2"></i>
                        Watch on YouTube
                      </a>
                    </div>
                  </div>
                </div>

                {/* RIGHT SIDE - NOTES */}
                <div className="flex flex-col">
                  <div className="bg-white rounded-2xl shadow-lg p-8 overflow-y-auto max-h-[900px] flex-grow">
                    <div className="flex items-center gap-2 mb-6">
                      <i className="fas fa-book text-orange-600 text-2xl"></i>
                      <h3 className="text-2xl font-bold text-gray-900">Study Notes</h3>
                    </div>

                    {/* Notes Content with Markdown */}
                    <div className="text-gray-800 max-h-[900px] overflow-y-auto">
                      <ReactMarkdown
                        components={{
                          h1: ({ children }) => (
                            <h1 className="text-2xl font-bold mt-6 mb-3 text-gray-900">{children}</h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="text-xl font-bold mt-5 mb-2 text-gray-900">{children}</h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="text-lg font-bold mt-4 mb-2 text-gray-800">{children}</h3>
                          ),
                          p: ({ children }) => (
                            <p className="mb-3 text-gray-700 leading-relaxed">{children}</p>
                          ),
                          ul: ({ children }) => (
                            <ul className="list-disc list-inside mb-3 text-gray-700 space-y-1">{children}</ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="list-decimal list-inside mb-3 text-gray-700 space-y-1">{children}</ol>
                          ),
                          li: ({ children }) => (
                            <li className="text-gray-700">{children}</li>
                          ),
                          strong: ({ children }) => (
                            <strong className="font-bold text-gray-900">{children}</strong>
                          ),
                          em: ({ children }) => (
                            <em className="italic text-gray-700">{children}</em>
                          ),
                          code: ({ children }) => (
                            <code className="bg-gray-100 px-2 py-1 rounded text-red-600 font-mono text-sm">{children}</code>
                          ),
                          blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-orange-500 pl-4 italic text-gray-600 my-3">{children}</blockquote>
                          ),
                          table: ({ children }) => (
                            <table className="w-full border-collapse border border-gray-300 my-3">{children}</table>
                          ),
                          thead: ({ children }) => (
                            <thead className="bg-orange-100">{children}</thead>
                          ),
                          th: ({ children }) => (
                            <th className="border border-gray-300 p-2 font-bold text-left">{children}</th>
                          ),
                          td: ({ children }) => (
                            <td className="border border-gray-300 p-2">{children}</td>
                          )
                        }}
                      >
                        {data.notes}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mb-8">
                <button
                  onClick={handleRetry}
                  className="flex-1 py-4 bg-orange-500 text-white rounded-lg font-bold text-lg hover:bg-orange-600 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <i className="fas fa-redo"></i>
                  Try Another Topic
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 py-4 bg-gray-500 text-white rounded-lg font-bold text-lg hover:bg-gray-600 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <i className="fas fa-home"></i>
                  Back to Dashboard
                </button>
              </div>

              {/* Info Section */}
              <div className="bg-blue-50 rounded-2xl p-6 border-2 border-blue-200 mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  <i className="fas fa-lightbulb text-blue-600 mr-2"></i>
                  Learning Tips
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li>✓ Watch the video first to get an overview of the topic</li>
                  <li>✓ Pause the video and take notes alongside the generated notes</li>
                  <li>✓ Review the notes after watching to reinforce learning</li>
                  <li>✓ Use this resource multiple times for better retention</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
