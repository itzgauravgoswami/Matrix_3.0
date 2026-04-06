import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function SupremeLearning() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    subject: '',
    topic: '',
    examType: '',
    videoLanguage: 'english',
    notesLanguage: 'english'
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    console.log('Accessing premium course:', formData)
    setTimeout(() => setLoading(false), 2000)
  }

  const premiumFeatures = [
    { icon: 'fa-video', title: 'HD Video Lectures', desc: 'High-quality videos from expert instructors' },
    { icon: 'fa-certificate', title: 'Certifications', desc: 'Earn recognized certificates upon completion' },
    { icon: 'fa-users', title: 'Live Sessions', desc: 'Interactive live classes with instructors' },
    { icon: 'fa-download', title: 'Downloadable', desc: 'Download resources for offline learning' },
    { icon: 'fa-headset', title: 'Support', desc: '24/7 customer support and doubt clearing' },
    { icon: 'fa-infinity', title: 'Lifetime Access', desc: 'Access courses forever after enrollment' }
  ]

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
                <i className="fas fa-crown text-3xl text-orange-600"></i>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Supreme Learning</h1>
                <p className="text-gray-600 mt-1">Access premium learning resources and expert-led courses</p>
              </div>
            </div>
          </div>

          {/* Premium Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {premiumFeatures.map((feature, idx) => (
              <div key={idx} className="bg-orange-50 rounded-xl p-4 border border-orange-200">
                <div className="text-2xl text-orange-600 mb-2">
                  <i className={`fas ${feature.icon}`}></i>
                </div>
                <h4 className="font-bold text-gray-900 mb-1">{feature.title}</h4>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              <i className="fas fa-search mr-3 text-orange-600"></i>
              Find Your Perfect Course
            </h2>
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
                    placeholder="e.g., Physics, Chemistry, Mathematics"
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
                    placeholder="e.g., Electromagnetism, Organic Reactions"
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-all text-base"
                  />
                </div>
              </div>

              {/* Exam Type */}
              <div>
                <label className="block text-lg font-semibold text-gray-900 mb-2">
                  Exam Type <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="examType"
                  value={formData.examType}
                  onChange={handleChange}
                  placeholder="e.g., JEE Main, NEET, GATE, Board Exam"
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-all text-base"
                />
              </div>

              {/* Video and Notes Language */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-2">
                    Video Language <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="videoLanguage"
                    value={formData.videoLanguage}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-all text-base"
                  >
                    <option value="english">English</option>
                    <option value="hinglish">Hinglish (English + Hindi)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-lg font-semibold text-gray-900 mb-2">
                    Notes Language <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="notesLanguage"
                    value={formData.notesLanguage}
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
                    Creating Course...
                  </>
                ) : (
                  <>
                    <i className="fas fa-crown"></i>
                    Access Supreme Learning
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Pricing Info */}
          <div className="mt-8 bg-blue-50 rounded-2xl p-6 border-2 border-blue-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              <i className="fas fa-star text-blue-600 mr-2"></i>
              Premium Membership
            </h3>
            <p className="text-gray-700 mb-4">
              Unlock unlimited access to all premium courses with a Supreme Learning membership.
            </p>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all">
              <i className="fas fa-crown mr-2"></i>
              Upgrade to Premium
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
