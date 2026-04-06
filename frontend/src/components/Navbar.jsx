import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import AuthModal from './AuthModal'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [user, setUser] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const navLinks = [
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Features', href: '#features' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'FAQ', href: '#faq' },
  ]

  const handleNavClick = (href) => {
    setIsMenuOpen(false)
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    navigate('/')
  }

  const isDashboard = location.pathname === '/dashboard'

  return (
    <>
      <nav className="fixed top-4 left-4 right-4 bg-white shadow-lg z-50 rounded-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-all"
          >
            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">SR</span>
            </div>
            <span className="hidden sm:inline text-2xl font-bold text-orange-600">
              Self Ranker
            </span>
          </button>

          {/* Desktop Navigation - Home Page */}
          {!isDashboard && (
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className="text-gray-700 hover:text-orange-600 font-medium transition-all duration-300"
                >
                  {link.label}
                </button>
              ))}
            </div>
          )}

          {/* Dashboard Navigation */}
          {isDashboard && user && (
            <div className="hidden md:flex items-center gap-6">
              <span className="text-gray-700 font-medium">
                Welcome, <span className="text-orange-600 font-bold">{user.name}</span>
              </span>
            </div>
          )}

          {/* Auth Button / User Menu */}
          <div className="hidden md:flex items-center gap-3">
            {!user ? (
              <button
                onClick={() => setIsAuthOpen(true)}
                className="px-4 py-1.5 text-sm bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600 transition-all duration-300"
              >
                Get Started
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-4 py-1.5 text-sm bg-orange-50 text-orange-600 rounded-full font-semibold hover:bg-orange-100 transition-all duration-300"
                >
                  <i className="fas fa-home mr-2"></i>
                  Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-1.5 text-sm bg-red-50 text-red-600 rounded-full font-semibold hover:bg-red-100 transition-all duration-300"
                >
                  <i className="fas fa-sign-out-alt mr-2"></i>
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-all duration-300"
            >
              {isMenuOpen ? (
                <i className="fas fa-times text-2xl text-gray-800"></i>
              ) : (
                <i className="fas fa-bars text-2xl text-gray-800"></i>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white py-4 space-y-2 rounded-2xl mb-4">
            {!isDashboard && navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-orange-100 rounded-lg transition-all duration-300"
              >
                {link.label}
              </button>
            ))}
            {!user ? (
              <button
                onClick={() => {
                  setIsAuthOpen(true)
                  setIsMenuOpen(false)
                }}
                className="w-full px-4 py-2 text-sm bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-all duration-300 mt-4"
              >
                Get Started
              </button>
            ) : (
              <>
                <button
                  onClick={() => {
                    navigate('/dashboard')
                    setIsMenuOpen(false)
                  }}
                  className="w-full px-4 py-2 text-left text-gray-700 hover:bg-orange-100 rounded-lg transition-all duration-300"
                >
                  <i className="fas fa-home mr-2 text-orange-600"></i>
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    handleLogout()
                    setIsMenuOpen(false)
                  }}
                  className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-100 rounded-lg transition-all duration-300"
                >
                  <i className="fas fa-sign-out-alt mr-2"></i>
                  Logout
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  )
}
