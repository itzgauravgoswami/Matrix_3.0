import React from 'react'; 
import { ArrowRight, Zap, Lightbulb, TrendingUp } from 'lucide-react'; 

export default function HowItWorks() {
  const steps = [
    {
      number: 1,
      icon: Zap,
      title: 'Choose Your Topic',
      description: 'Pick any subject, topic, or concept you want to master. From Math to History, Science to Languages.',
      color: 'text-blue-400',
      bgGradient: 'from-blue-500/10 to-blue-600/5',
      borderColor: 'border-blue-500/40',
      accentColor: 'from-blue-500 to-blue-600',
    },
    {
      number: 2,
      icon: Lightbulb,
      title: 'AI Generates Content',
      description: 'Our AI instantly creates personalized quizzes, structured notes, and curated video resources.',
      color: 'text-purple-400',
      bgGradient: 'from-purple-500/10 to-purple-600/5',
      borderColor: 'border-purple-500/40',
      accentColor: 'from-purple-500 to-purple-600',
    },
    {
      number: 3,
      icon: TrendingUp,
      title: 'Track & Improve',
      description: 'Monitor your progress with detailed analytics, identify weak areas, and improve daily.',
      color: 'text-cyan-400',
      bgGradient: 'from-cyan-500/10 to-cyan-600/5',
      borderColor: 'border-cyan-500/40',
      accentColor: 'from-cyan-500 to-cyan-600',
    },
  ]; 

  return (
    <section id="howitworks" className="relative py-12 md:py-20 bg-gradient-to-b from-black via-slate-950 to-black overflow-hidden" style={{ fontFamily: "'Lato', sans-serif" }}>
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
            <span className="text-xs md:text-sm font-medium text-purple-300">✨ Our Process</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6 leading-tight">
            How It <span className="text-white">Works</span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            A simple three-step process designed to transform how you learn. Choose, Generate, and Improve your knowledge with AI-powered guidance.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8 mb-10 md:mb-16">
          {steps.map((step, idx) => (
            <div key={idx} className="relative group">
              {/* Connecting Line */}
              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute top-20 -right-4 w-8 h-0.5 bg-gradient-to-r from-purple-500/50 via-purple-500/30 to-transparent animate-in slide-in-from-left-8 duration-700" style={{ animationDelay: `${(idx + 1) * 200}ms` }}></div>
              )}

              {/* Card */}
              <div
                className={`relative h-full bg-gradient-to-br ${step.bgGradient} border ${step.borderColor} hover:border-purple-500/60 rounded-2xl p-8 transition-all duration-500 hover:shadow-xl hover:shadow-purple-500/10 cursor-pointer transform hover:scale-105 hover:-translate-y-2 animate-in fade-in backdrop-blur-sm overflow-hidden group`}
                style={{
                  animationDelay: `${idx * 200}ms`,
                  animationDuration: '800ms',
                }}
              >
                {/* Gradient Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/0 group-hover:from-white/5 group-hover:to-white/0 transition-all duration-500 rounded-2xl pointer-events-none"></div>

                {/* Number Badge */}
                <div className={`absolute -top-6 -right-6 w-12 h-12 bg-gradient-to-br ${step.accentColor} rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg transform group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 z-10`}>
                  {step.number}
                </div>

                {/* Content */}
                <div className="relative z-5">
                  {/* Icon */}
                  <div className="mb-6 inline-flex p-3 rounded-xl bg-gradient-to-br from-white/10 to-white/5 group-hover:from-white/15 group-hover:to-white/10 transition-all duration-300">
                    <step.icon className={`${step.color} group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`} size={28} />
                  </div>

                  {/* Title */}
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-3 group-hover:text-purple-200 transition-colors duration-300 leading-tight">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm md:text-base text-slate-300 group-hover:text-slate-200 transition-colors duration-300 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Arrow indicator */}
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 text-purple-500/30 group-hover:text-purple-400/60 transition-colors duration-300">
                    <ArrowRight size={24} />
                  </div>
                )}
              </div>
            </div>
          ))}
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