import React from 'react'; 
import { Zap, BookOpen, Code, Brain } from 'lucide-react'; 

export default function FeaturesSection() {
  const features = [
    {
      icon: Brain,
      title: 'AI Notes & Smart Quizzes',
      desc: 'Generate unlimited AI notes and create smart quizzes with advanced question types. Get instant feedback, detailed explanations, and personalized learning experiences.',
      color: 'text-purple-400',
      bgGradient: 'from-purple-500/10 to-magenta-500/5',
      borderColor: 'border-purple-500/40',
      accentColor: 'from-purple-500 to-magenta-500',
    },
    {
      icon: BookOpen,
      title: 'Learning Path',
      desc: 'Follow personalized learning paths based on your goals. Track your progress, identify weak topics, and get targeted recommendations.',
      color: 'text-cyan-400',
      bgGradient: 'from-cyan-500/10 to-blue-500/5',
      borderColor: 'border-cyan-500/40',
      accentColor: 'from-cyan-500 to-blue-500',
    },
    {
      icon: Code,
      title: 'AI Doubt Solver',
      desc: 'Get instant answers to your doubts from our AI assistant. Understand complex concepts with detailed explanations and examples.',
      color: 'text-orange-400',
      bgGradient: 'from-orange-500/10 to-red-500/5',
      borderColor: 'border-orange-500/40',
      accentColor: 'from-orange-500 to-red-500',
    },
    {
      icon: Zap,
      title: 'Supreme Learning',
      desc: 'Unlock the ultimate learning experience with advanced analytics, comprehensive study materials, and personalized mentoring support for competitive exams.',
      color: 'text-yellow-400',
      bgGradient: 'from-yellow-500/10 to-orange-500/5',
      borderColor: 'border-yellow-500/40',
      accentColor: 'from-yellow-500 to-orange-500',
    },
  ]; 

  return (
    <section id="features" className="relative py-12 md:py-20 bg-gradient-to-b from-black via-slate-950 to-black overflow-hidden" style={{ fontFamily: "'Lato', sans-serif" }}>
      {/* Grid Background - Only on Main Background */}
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

      {/* Gradient Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-48 md:w-64 lg:w-72 h-48 md:h-64 lg:h-72 bg-purple-900/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-32 w-56 md:w-72 lg:w-80 h-56 md:h-72 lg:h-80 bg-magenta-900/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-48 md:w-56 lg:w-64 h-48 md:h-56 lg:h-64 bg-cyan-900/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-3 sm:px-4 lg:px-6">
        {/* Header */}
        <div className="text-center mb-8 md:mb-14 animate-in fade-in slide-in-from-top-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-magenta-500/10 border border-purple-500/30 rounded-full mb-4 md:mb-6">
            <span className="text-xs md:text-sm font-medium text-purple-300">✨ Core Features</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6 leading-tight">
            Powerful <span className="text-white">Features</span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Everything you need to learn efficiently in one platform
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-10 md:mb-16">
          {features.map((feature, idx) => {
            const Icon = feature.icon; 
            return (
              <div
                key={idx}
                className="group relative animate-in fade-in"
                style={{ animationDelay: `${idx * 150}ms`, animationDuration: '800ms' }}
              >
                {/* Card */}
                <div className={`relative h-full bg-gradient-to-br ${feature.bgGradient} border ${feature.borderColor} hover:border-purple-500/60 rounded-2xl p-8 transition-all duration-500 transform hover:scale-105 hover:-translate-y-2 hover:shadow-xl hover:shadow-purple-500/10 overflow-hidden group backdrop-blur-sm`}>
                  {/* Gradient Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/0 group-hover:from-white/5 group-hover:to-white/0 transition-all duration-500 rounded-2xl pointer-events-none"></div>

                  {/* Content */}
                  <div className="relative z-5">
                    {/* Icon */}
                    <div className="mb-6 inline-flex p-3 rounded-xl bg-gradient-to-br from-white/10 to-white/5 group-hover:from-white/15 group-hover:to-white/10 transition-all duration-300">
                      <Icon className={`${feature.color} group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`} size={28} />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-3 group-hover:text-purple-200 transition-colors duration-300 leading-tight">
                      {feature.title}
                    </h3>

                    {/* Description */}
                    <p className="text-sm md:text-base text-slate-300 group-hover:text-slate-200 transition-colors duration-300 leading-relaxed">
                      {feature.desc}
                    </p>

                    {/* Learn More */}
                    <div className="mt-6 pt-6 border-t border-slate-700/50 group-hover:border-purple-500/30 transition-colors">
                      <p className="text-purple-400 text-sm font-semibold group-hover:text-purple-300 transition-colors flex items-center gap-2">
                        Learn more
                        <span className="group-hover:translate-x-2 transition-transform">→</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ); 
          })}
        </div>
      </div>

      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%;  }
          50% { background-position: 100% 50%;  }
        }
        .animate-gradient {
          background-size: 200% 200%; 
          animation: gradient 3s ease infinite; 
        }
      `}</style>
    </section>
  ); 
}