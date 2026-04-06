import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { notesAPI } from '../api/api'

const MarkdownRenderer = ({ content }) => {
  const lines = content.split('\n')
  const elements = []

  let inCodeBlock = false
  let codeBlockContent = ''

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Handle code blocks
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <pre key={`code-${i}`} className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-4 text-sm">
            <code>{codeBlockContent}</code>
          </pre>
        )
        codeBlockContent = ''
        inCodeBlock = false
      } else {
        inCodeBlock = true
      }
      continue
    }

    if (inCodeBlock) {
      codeBlockContent += line + '\n'
      continue
    }

    // Handle headers
    if (line.startsWith('# ')) {
      elements.push(<h1 key={i} className="text-3xl font-bold text-gray-900 mt-6 mb-3">{line.replace('# ', '')}</h1>)
    } else if (line.startsWith('## ')) {
      elements.push(<h2 key={i} className="text-2xl font-bold text-gray-800 mt-5 mb-3">{line.replace('## ', '')}</h2>)
    } else if (line.startsWith('### ')) {
      elements.push(<h3 key={i} className="text-xl font-bold text-gray-700 mt-4 mb-2">{line.replace('### ', '')}</h3>)
    } else if (line.startsWith('#### ')) {
      elements.push(<h4 key={i} className="text-lg font-bold text-gray-700 mt-3 mb-2">{line.replace('#### ', '')}</h4>)
    } else if (line.startsWith('- ')) {
      elements.push(<li key={i} className="text-gray-700 ml-6 mb-1">• {line.replace('- ', '')}</li>)
    } else if (line.startsWith('* ')) {
      elements.push(<li key={i} className="text-gray-700 ml-6 mb-1">• {line.replace('* ', '')}</li>)
    } else if (line.startsWith('**') && line.endsWith('**')) {
      elements.push(<p key={i} className="text-gray-700 font-bold mb-2">{line.replace(/\*\*/g, '')}</p>)
    } else if (line.trim() === '') {
      elements.push(<div key={i} className="mb-3"></div>)
    } else if (line.trim()) {
      elements.push(<p key={i} className="text-gray-700 mb-3 leading-relaxed">{line}</p>)
    }
  }

  return <div className="space-y-0">{elements}</div>
}

export default function GenerateNotes() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    subject: '',
    topic: '',
    format: 'detailed',
    examPreparing: '',
    language: 'english'
  })
  const [loading, setLoading] = useState(false)
  const [generatedNotes, setGeneratedNotes] = useState(null)
  const [error, setError] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await notesAPI.generateNotes(formData)
      setGeneratedNotes(response.data.notes)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate notes. Please try again.')
      console.error('Error generating notes:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setGeneratedNotes(null)
    setError(null)
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

          {!generatedNotes ? (
            <>
              {/* Header */}
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center">
                    <i className="fas fa-file-alt text-3xl text-orange-600"></i>
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900">Generate Notes</h1>
                    <p className="text-gray-600 mt-1">Create comprehensive study notes powered by AI</p>
                  </div>
                </div>
              </div>

              {/* Form */}
              <div className="bg-white rounded-2xl shadow-lg p-8">
                {error && (
                  <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-lg text-red-700">
                    {error}
                  </div>
                )}
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
                        placeholder="e.g., Physics, Mathematics, Biology"
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
                        placeholder="e.g., Thermodynamics, Quadratic Equations"
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

                  {/* Format and Language */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-lg font-semibold text-gray-900 mb-2">
                        Format <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="format"
                        value={formData.format}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-all text-base"
                      >
                        <option value="detailed">Detailed</option>
                        <option value="short">Short</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-lg font-semibold text-gray-900 mb-2">
                        Language <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="language"
                        value={formData.language}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-all text-base"
                      >
                        <option value="english">English</option>
                        <option value="hinglish">Hinglish (English + Hindi)</option>
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
                        Generating Notes...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-magic"></i>
                        Generate Notes
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Info Section */}
              <div className="mt-8 bg-orange-50 rounded-2xl p-6 border-2 border-orange-200">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  <i className="fas fa-lightbulb text-orange-600 mr-2"></i>
                  Tips for Best Results
                </h3>
                <ul className="space-y-2 text-gray-700">
                  <li>✓ Be specific with the subject and topic for targeted content</li>
                  <li>✓ Choose the exam you're preparing for context</li>
                  <li>✓ Select detailed format for comprehensive learning</li>
                  <li>✓ Use Hinglish if you're more comfortable with mixed language</li>
                </ul>
              </div>
            </>
          ) : (
            <>
              {/* Generated Notes Display */}
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-3xl font-bold text-gray-900">Generated Notes</h2>
                <button
                  onClick={handleReset}
                  className="px-6 py-2 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-all"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Generate New
                </button>
              </div>

              {/* Notes Metadata */}
              <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Subject</p>
                    <p className="text-lg font-bold text-gray-900">{formData.subject}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Topic</p>
                    <p className="text-lg font-bold text-gray-900">{formData.topic}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Exam Type</p>
                    <p className="text-lg font-bold text-gray-900">{formData.examPreparing}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Format</p>
                    <p className="text-lg font-bold text-gray-900 capitalize">{formData.format}</p>
                  </div>
                </div>
              </div>

              {/* Generated Content */}
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
                <MarkdownRenderer content={generatedNotes} />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mb-12">
                <button
                  onClick={() => {
                    const element = document.createElement('a')
                    const file = new Blob([generatedNotes], { type: 'text/markdown' })
                    element.href = URL.createObjectURL(file)
                    element.download = `${formData.topic}-notes.md`
                    document.body.appendChild(element)
                    element.click()
                    document.body.removeChild(element)
                  }}
                  className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                >
                  <i className="fas fa-download"></i>
                  Download as Markdown
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 px-6 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
                >
                  <i className="fas fa-redo"></i>
                  Generate Different Notes
                </button>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
