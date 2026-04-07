import React, { useState } from 'react'; 
import { Menu, X, Sparkles, Home, Lightbulb, Zap, DollarSign, HelpCircle, Star } from 'lucide-react'; 

export default function Navbar({ onNavigate, isLoggedIn, onLogout, isAdminLoggedIn }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false); 

  const menuItems = [
    { label: 'Home', id: 'home', icon: Home },
    { label: 'How It Works', id: 'howitworks', icon: Lightbulb },
    { label: 'Features', id: 'features', icon: Zap },
    { label: 'Testimonials', id: 'testimonials', icon: Star },
    { label: 'Pricing', id: 'pricing', icon: DollarSign },
    { label: 'FAQ', id: 'faq', icon: HelpCircle },
  ]; 

  return (
    <nav className="fixed top-0 w-full z-50 px-3 sm:px-4 md:px-4 py-2.5 sm:py-3 md:py-3" style={{ fontFamily: "'Poppins', sans-serif" }}>
      <div className="max-w-7xl mx-auto backdrop-blur-xl bg-gradient-to-b from-slate-950/95 to-slate-950/40 border border-purple-500/20 rounded-xl sm:rounded-2xl px-4 sm:px-5 md:px-6 py-2.5 sm:py-3 md:py-3 flex justify-between items-center transition-all duration-300 hover:border-purple-500/30">
        
        {/* Logo Section */}
        <div
          className="flex items-center gap-2 sm:gap-2.5 md:gap-3 cursor-pointer group animate-in fade-in duration-700"
          onClick={() => {
            onNavigate('home'); 
            setIsMenuOpen(false); 
          }}
        >
          {/* Logo Icon */}
          <div className="p-2 sm:p-2.5 md:p-2.5 bg-gradient-to-br from-purple-600 to-magenta-600 rounded-lg sm:rounded-xl group-hover:rotate-12 group-hover:shadow-lg group-hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-110 animate-in zoom-in" style={{ animationDelay: '100ms' }}>
            <Sparkles className="text-white group-hover:scale-110 transition-all duration-300" size={18} />
          </div>
          
          {/* Logo Text */}
          <span className="text-sm sm:text-base md:text-base lg:text-lg font-bold text-purple-400 group-hover:text-purple-300 transition-all duration-300 group-hover:scale-105 transform animate-in fade-in whitespace-nowrap" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, animationDelay: '150ms' }}>
            Self Ranker
          </span>
        </div>

        {/* Desktop Menu - Center */}
        <div className="hidden lg:flex items-center gap-1 xl:gap-1.5 animate-in fade-in slide-in-from-top-4 duration-700" style={{ animationDelay: '200ms' }}>
          {menuItems.map((item, idx) => {
            const Icon = item.icon; 
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className="px-3 lg:px-3 xl:px-4 py-2 lg:py-2 text-slate-300 hover:text-purple-300 transition-all duration-300 text-xs lg:text-xs xl:text-sm font-medium group relative flex items-center gap-1.5 lg:gap-1.5 rounded-lg hover:bg-purple-500/10 transform hover:scale-105 active:scale-95 animate-in fade-in whitespace-nowrap"
                style={{ 
                  animationDelay: `${250 + idx * 75}ms`, 
                  animationDuration: '700ms',
                  fontFamily: "'Poppins', sans-serif", 
                  fontWeight: 500 
                }}
              >
                <Icon className="group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" size={15} />
                <span className="group-hover:text-purple-300 transition-all duration-300">{item.label}</span>
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-400 to-magenta-400 group-hover:w-full transition-all duration-300 rounded-full"></span>
              </button>
            ); 
          })}
        </div>

        {/* Right Section - Desktop Auth Buttons */}
        <div className="hidden lg:flex items-center gap-2 xl:gap-2.5 animate-in fade-in slide-in-from-right-4 duration-700" style={{ animationDelay: '350ms' }}>
          {isAdminLoggedIn ? (
            <>
              {/* Admin Dashboard Button - Desktop */}
              <button
                onClick={() => onNavigate('admin')}
                className="px-4 lg:px-5 xl:px-6 py-2 lg:py-2 xl:py-2.5 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg shadow-red-500/50 hover:shadow-red-500/70 animate-in fade-in text-xs lg:text-xs xl:text-sm whitespace-nowrap"
                style={{ 
                  animationDelay: '400ms', 
                  animationDuration: '700ms', 
                  fontFamily: "'Poppins', sans-serif", 
                  fontWeight: 600 
                }}
              >
                🔐 Admin Dashboard
              </button>

              {/* Admin Logout Button - Desktop */}
              <button
                onClick={() => {
                  localStorage.removeItem('adminToken')
                  window.location.reload()
                }}
                className="px-4 lg:px-5 xl:px-6 py-2 lg:py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 animate-in fade-in text-xs lg:text-xs xl:text-sm whitespace-nowrap"
                style={{ animationDelay: '450ms', animationDuration: '600ms', fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}
              >
                Logout
              </button>
            </>
          ) : !isLoggedIn ? (
            <>
              {/* Sign In Button - Desktop */}
              <button
                onClick={() => onNavigate('login')}
                className="px-3 lg:px-4 xl:px-5 py-2 lg:py-2 text-slate-300 hover:text-purple-300 transition-all duration-300 text-xs lg:text-xs xl:text-sm font-medium rounded-lg hover:bg-slate-800/50 transform hover:scale-105 active:scale-95 animate-in fade-in whitespace-nowrap"
                style={{ 
                  animationDelay: '400ms', 
                  animationDuration: '700ms', 
                  fontFamily: "'Poppins', sans-serif", 
                  fontWeight: 500 
                }}
              >
                Sign In
              </button>

              {/* Get Started Button - Desktop (Primary) */}
              <button
                onClick={() => onNavigate('signup')}
                className="px-4 lg:px-5 xl:px-6 py-2 lg:py-2 xl:py-2.5 bg-gradient-to-r from-purple-600 to-magenta-600 hover:from-purple-700 hover:to-magenta-700 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 animate-in fade-in text-xs lg:text-xs xl:text-sm whitespace-nowrap"
                style={{ 
                  animationDelay: '450ms', 
                  animationDuration: '700ms', 
                  fontFamily: "'Poppins', sans-serif", 
                  fontWeight: 600 
                }}
              >
                Get Started
              </button>
            </>
          ) : (
            <>
              {/* Dashboard Button - Desktop */}
              <button
                onClick={() => {
                  onNavigate('dashboard'); 
                  setIsMenuOpen(false); 
                }}
                className="px-4 lg:px-5 xl:px-6 py-2 lg:py-2 xl:py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg shadow-cyan-500/50 hover:shadow-cyan-500/70 animate-in fade-in text-xs lg:text-xs xl:text-sm whitespace-nowrap"
                style={{ 
                  animationDelay: '400ms', 
                  animationDuration: '700ms', 
                  fontFamily: "'Poppins', sans-serif", 
                  fontWeight: 600 
                }}
              >
                Dashboard
              </button>

              {/* Logout Button - Desktop */}
              <button
                onClick={() => {
                  onLogout(); 
                  setIsMenuOpen(false); 
                }}
                className="px-4 lg:px-5 xl:px-6 py-2 lg:py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 animate-in fade-in text-xs lg:text-xs xl:text-sm whitespace-nowrap"
                style={{ animationDelay: '450ms', animationDuration: '600ms', fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}
              >
                Logout
              </button>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden text-purple-400 hover:text-purple-300 transition-all duration-300 transform hover:scale-110 active:scale-95 ml-2 animate-in fade-in"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          style={{ animationDelay: '500ms', animationDuration: '600ms' }}
        >
          {isMenuOpen ? (
            <X size={22} className="sm:w-6 sm:h-6 transition-transform duration-300 rotate-90" />
          ) : (
            <Menu size={22} className="sm:w-6 sm:h-6 transition-transform duration-300" />
          )}
        </button>
      </div>

      {/* Mobile Menu with Smooth Transition */}
      <div 
        className={`lg:hidden mx-3 sm:mx-4 md:mx-4 mt-2.5 sm:mt-3 md:mt-3 bg-gradient-to-b from-slate-900/95 to-slate-900/85 backdrop-blur-xl border border-purple-500/20 rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-500 ease-in-out ${
          isMenuOpen 
            ? 'max-h-[700px] opacity-100 translate-y-0' 
            : 'max-h-0 opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="px-4 sm:px-4 py-3.5 sm:py-4 space-y-2 sm:space-y-2">
          {/* Mobile Menu Items */}
          {menuItems.map((item, idx) => {
            const Icon = item.icon; 
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id); 
                  setIsMenuOpen(false); 
                }}
                className={`w-full text-left px-4 sm:px-4 py-2.5 sm:py-3 md:py-3 text-slate-300 hover:text-purple-300 hover:bg-purple-500/15 rounded-lg transition-all duration-300 transform hover:translate-x-2 group flex items-center gap-2.5 sm:gap-3 md:gap-3 text-sm sm:text-sm md:text-base ${
                  isMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
                }`}
                style={{ 
                  transitionDelay: isMenuOpen ? `${idx * 75}ms` : '0ms',
                  fontFamily: "'Poppins', sans-serif", 
                  fontWeight: 500 
                }}
              >
                <Icon className="group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" size={18} />
                <span className="group-hover:text-purple-300 transition-all duration-300">{item.label}</span>
              </button>
            ); 
          })}

          {/* Mobile Divider */}
          <div 
            className={`h-px bg-gradient-to-r from-purple-500/20 to-transparent my-2.5 sm:my-3 transition-all duration-300 ${
              isMenuOpen ? 'opacity-100 scale-x-100' : 'opacity-0 scale-x-0'
            }`}
            style={{ transitionDelay: isMenuOpen ? '450ms' : '0ms' }}
          ></div>

          {/* Mobile Auth Section */}
          {isAdminLoggedIn ? (
            <div className="space-y-2 sm:space-y-2">
              <button
                onClick={() => {
                  onNavigate('admin'); 
                  setIsMenuOpen(false); 
                }}
                className={`w-full px-4 sm:px-4 py-2.5 sm:py-3 md:py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 text-sm sm:text-sm md:text-base ${
                  isMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
                }`}
                style={{ 
                  transitionDelay: isMenuOpen ? '525ms' : '0ms',
                  fontFamily: "'Poppins', sans-serif", 
                  fontWeight: 600 
                }}
              >
                🔐 Admin Dashboard
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('adminToken')
                  setIsMenuOpen(false)
                  window.location.reload()
                }}
                className={`w-full px-4 sm:px-4 py-2.5 sm:py-3 md:py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg font-semibold transition-all duration-300 text-sm sm:text-sm md:text-base transform hover:scale-105 active:scale-95 ${
                  isMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
                }`}
                style={{ 
                  transitionDelay: isMenuOpen ? '600ms' : '0ms',
                  fontFamily: "'Poppins', sans-serif", 
                  fontWeight: 600 
                }}
              >
                Logout
              </button>
            </div>
          ) : !isLoggedIn ? (
            <div className="space-y-2 sm:space-y-2">
              <button
                onClick={() => {
                  onNavigate('login'); 
                  setIsMenuOpen(false); 
                }}
                className={`w-full px-4 sm:px-4 py-2.5 sm:py-3 md:py-3 text-slate-300 hover:text-purple-300 hover:bg-purple-500/15 rounded-lg transition-all duration-300 text-sm sm:text-sm md:text-base font-medium transform hover:translate-x-2 active:scale-95 ${
                  isMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
                }`}
                style={{ 
                  transitionDelay: isMenuOpen ? '525ms' : '0ms',
                  fontFamily: "'Poppins', sans-serif", 
                  fontWeight: 500 
                }}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  onNavigate('signup'); 
                  setIsMenuOpen(false); 
                }}
                className={`w-full px-4 sm:px-4 py-2.5 sm:py-3 md:py-3 bg-gradient-to-r from-purple-600 to-magenta-600 hover:from-purple-700 hover:to-magenta-700 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 text-sm sm:text-sm md:text-base ${
                  isMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
                }`}
                style={{ 
                  transitionDelay: isMenuOpen ? '600ms' : '0ms',
                  fontFamily: "'Poppins', sans-serif", 
                  fontWeight: 600 
                }}
              >
                Get Started
              </button>
            </div>
          ) : (
            <div className="space-y-2 sm:space-y-2">
              <button
                onClick={() => {
                  onNavigate('dashboard'); 
                  setIsMenuOpen(false); 
                }}
                className={`w-full px-4 sm:px-4 py-2.5 sm:py-3 md:py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 text-sm sm:text-sm md:text-base ${
                  isMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
                }`}
                style={{ 
                  transitionDelay: isMenuOpen ? '525ms' : '0ms',
                  fontFamily: "'Poppins', sans-serif", 
                  fontWeight: 600 
                }}
              >
                Dashboard
              </button>
              <button
                onClick={() => {
                  onLogout(); 
                  setIsMenuOpen(false); 
                }}
                className={`w-full px-4 sm:px-4 py-2.5 sm:py-3 md:py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg font-semibold transition-all duration-300 text-sm sm:text-sm md:text-base transform hover:scale-105 active:scale-95 ${
                  isMenuOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
                }`}
                style={{ 
                  transitionDelay: isMenuOpen ? '600ms' : '0ms',
                  fontFamily: "'Poppins', sans-serif", 
                  fontWeight: 600 
                }}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  ); 
}