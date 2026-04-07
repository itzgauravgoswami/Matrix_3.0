import React, { useState, useEffect } from 'react'; 
import { ArrowRight, Brain, BookOpen, Target, TrendingUp, Play, Users, Award, Check, Sparkles } from 'lucide-react'; 
import { useAuth } from '../context/AuthContext'; 

export default function HeroSection({ onNavigate }) {
  const { isAuthenticated } = useAuth(); 
  return (
    <div id='home' className="relative min-h-screen bg-gradient-to-br from-black via-slate-950 to-black overflow-hidden pt-1" style={{ fontFamily: "'Lato', sans-serif" }}>
      {/* Enhanced Grid Background - Matching FAQ */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(168, 85, 247, 0.08) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(168, 85, 247, 0.08) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}
        ></div>
        {/* Additional subtle grid layer */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(168, 85, 247, 0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(168, 85, 247, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px'
          }}
        ></div>
      </div>

      {/* Gradient Orbs - Matching FAQ */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-48 md:w-64 lg:w-72 h-48 md:h-64 lg:h-72 bg-purple-900/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-32 w-56 md:w-72 lg:w-80 h-56 md:h-72 lg:h-80 bg-magenta-900/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-48 md:w-56 lg:w-64 h-48 md:h-56 lg:h-64 bg-cyan-900/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 md:py-6 lg:py-10 mt-12 sm:mt-0">
        {/* Top Badge - Left Aligned */}
        <div className="mt-2 sm:mt-4 flex justify-start mb-3 sm:mb-4 md:mb-6 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="mt-10 inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-purple-500/15 to-magenta-500/15 border border-purple-500/40 hover:border-purple-400/60 rounded-full transition-all duration-300 group cursor-pointer transform hover:scale-105">
            <Brain size={15} className="text-purple-400 group-hover:rotate-12 transition-transform" />
            <span className="text-sm sm:text-base md:text-sm lg:text-base text-purple-200 font-medium">
              AI-Powered Learning Platform
            </span>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse ml-1"></div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6 lg:gap-8 items-center">
          {/* Left Side - Content */}
          <div className="space-y-3 sm:space-y-4 md:space-y-5 animate-in fade-in slide-in-from-left-8 duration-1000">
            {/* Main Heading */}
            <div className="space-y-1 sm:space-y-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight">
                <span className="block mb-1 sm:mb-2">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-magenta-400 to-purple-400 animate-gradient">
                    You + AI =
                  </span>
                  <span className="ml-1">
                     🚀
                  </span>
                </span>
                <span className="block text-white drop-shadow-[0_0_30px_rgba(168,85,247,0.4)]">
                  Self Ranker Mode
                </span>
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-xl font-semibold text-white/90">
                Smarter Learning Begins Here 🧠
              </p>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm md:text-base lg:text-base text-slate-300 leading-relaxed">
              Say goodbye to boring 😴. Self Ranker brings hyper-personalized learning, real-time feedback, and intelligent practice. You're not just learning - you're leveling up! 📈
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3">
              <button
                onClick={() => onNavigate?.(isAuthenticated ? 'dashboard' : 'signup')}
                className="group px-4 md:px-6 py-2.5 sm:py-3 md:py-3 bg-gradient-to-r from-purple-600 to-magenta-600 hover:from-purple-700 hover:to-magenta-700 text-white text-xs sm:text-sm md:text-sm lg:text-sm rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-1.5 shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70 transform hover:scale-105 active:scale-95"
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Start Learning Free'} ✨
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={14} />
              </button>
              <button
                onClick={() => onNavigate?.('features')}
                className="group px-4 md:px-6 py-2.5 sm:py-3 md:py-3 bg-slate-900/60 hover:bg-slate-900/90 backdrop-blur-sm text-white text-xs sm:text-sm md:text-sm lg:text-sm rounded-lg font-semibold transition-all duration-300 border border-purple-500/40 hover:border-purple-500/70 flex items-center justify-center gap-1.5 transform hover:scale-105 active:scale-95"
              >
                See How It Works 🎯
                <Target className="group-hover:rotate-90 transition-transform duration-300" size={14} />
              </button>
            </div>

            {/* Success Badge */}
            {/* <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-blue-500/15 to-cyan-500/15 border border-blue-500/40 rounded-full">
              <Award size={14} className="text-blue-400" />
              <span className="text-sm sm:text-base text-blue-300 font-medium">
                95% Success Rate 🏆
              </span>
            </div> */}
          </div>

          {/* Right Side - Feature Cards & Stats */}
          <div className="space-y-3 sm:space-y-4 md:space-y-5 animate-in fade-in slide-in-from-right-8 duration-1000" style={{ animationDelay: '200ms' }}>
            {/* Feature Cards Grid - 2x2 Layout */}
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {[
                {
                  icon: Brain,
                  emoji: '🤖',
                  title: 'Smart Learning',
                  description: 'Personalized paths for you',
                  gradient: 'from-purple-500/20 to-magenta-500/20',
                  border: 'border-purple-500/50',
                  iconColor: 'text-purple-400'
                },
                {
                  icon: TrendingUp,
                  emoji: '⚡',
                  title: 'Fast Progress',
                  description: 'Achieve goals quicker',
                  gradient: 'from-orange-500/20 to-red-500/20',
                  border: 'border-orange-500/50',
                  iconColor: 'text-orange-400'
                },
                {
                  icon: BookOpen,
                  emoji: '📚',
                  title: 'Smart Notes',
                  description: 'AI-generated resources',
                  gradient: 'from-cyan-500/20 to-blue-500/20',
                  border: 'border-cyan-500/50',
                  iconColor: 'text-cyan-400'
                },
                {
                  icon: Target,
                  emoji: '🎯',
                  title: 'Daily Tests',
                  description: 'Track your progress',
                  gradient: 'from-green-500/20 to-emerald-500/20',
                  border: 'border-green-500/50',
                  iconColor: 'text-green-400'
                }
              ].map((feature, idx) => (
                <div
                  key={idx}
                  className={`group relative bg-gradient-to-br ${feature.gradient} backdrop-blur-sm border ${feature.border} hover:border-opacity-80 rounded-xl p-4 transition-all duration-300 hover:scale-105 cursor-pointer`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                  <div className="relative space-y-2">
                    <div className="flex items-center gap-1">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${feature.gradient} border ${feature.border} flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                        <feature.icon className={`${feature.iconColor}`} size={16} />
                      </div>
                      <span className="text-2xl group-hover:scale-125 transition-transform duration-300 origin-left">{feature.emoji}</span>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-magenta-400 transition-all duration-300">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors leading-tight">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-4 gap-2 md:gap-3">
              {[
                { value: '500+', label: 'Topics', icon: '📚' },
                { value: '50K+', label: 'Learners', icon: '👥' },
                { value: '4.9★', label: 'Rating', icon: '⭐' },
                { value: '95%', label: 'Success', icon: '🎯' }
              ].map((stat, idx) => (
                <div
                  key={idx}
                  className="group text-center space-y-1 p-3 rounded-lg bg-gradient-to-br from-purple-500/10 to-magenta-500/10 border border-purple-500/30 hover:border-purple-500/50 cursor-pointer hover:scale-110 transition-all duration-300"
                >
                  <div className="text-2xl group-hover:scale-125 transition-transform duration-300">
                    {stat.icon}
                  </div>
                  <p className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-magenta-400 group-hover:from-purple-300 group-hover:to-magenta-300 transition-all">
                    {stat.value}
                  </p>
                  <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors font-medium">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg); 
          }
          33% { 
            transform: translateY(-20px) rotate(5deg); 
          }
          66% { 
            transform: translateY(-10px) rotate(-5deg); 
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite; 
        }
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%;  }
          50% { background-position: 100% 50%;  }
        }
        .animate-gradient {
          background-size: 200% 200%; 
          animation: gradient 3s ease infinite; 
        }
      `}</style>
    </div>
  ); 
}