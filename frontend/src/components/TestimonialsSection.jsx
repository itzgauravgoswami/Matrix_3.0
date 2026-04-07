import React from 'react'; 
import { Star } from 'lucide-react'; 

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'JEE Aspirant',
      avatar: '👩‍🎓',
      content:
        'Self Ranker helped me score 95% in Math! The daily tests and analytics dashboard showed exactly where I was weak.',
      rating: 5,
      improvement: '+35%',
      color: 'from-purple-500/10 to-purple-600/5',
      borderColor: 'border-purple-500/40',
    },
    {
      name: 'Rahul Kumar',
      role: 'Medical Student',
      avatar: '👨‍⚕️',
      content:
        'The AI-generated quizzes are incredibly accurate. I went from 72% to 88% in just 2 months of consistent practice.',
      rating: 5,
      improvement: '+16%',
      color: 'from-cyan-500/10 to-cyan-600/5',
      borderColor: 'border-cyan-500/40',
    },
    {
      name: 'Aisha Patel',
      role: 'College Student',
      avatar: '👩‍💼',
      content:
        'Finally, a study tool that understands my learning pace! The personalized daily tests have transformed my exam preparation.',
      rating: 5,
      improvement: '+28%',
      color: 'from-purple-500/10 to-magenta-600/5',
      borderColor: 'border-magenta-500/40',
    },
    {
      name: 'Arjun Singh',
      role: 'Working Professional',
      avatar: '👨‍💻',
      content:
        'As someone with limited time, Self Ranker is a lifesaver. Quick quizzes fit perfectly into my schedule.',
      rating: 5,
      improvement: '+22%',
      color: 'from-blue-500/10 to-blue-600/5',
      borderColor: 'border-blue-500/40',
    },
  ]; 

  return (
    <section id='testimonials' className="relative py-12 md:py-20 bg-gradient-to-b from-black via-slate-950 to-black overflow-hidden" style={{ fontFamily: "'Lato', sans-serif" }}>
      {/* Grid Background - Matching HowItWorks */}
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

      {/* Gradient Orbs - Matching HowItWorks */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-48 md:w-64 lg:w-72 h-48 md:h-64 lg:h-72 bg-purple-900/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-32 w-56 md:w-72 lg:w-80 h-56 md:h-72 lg:h-80 bg-magenta-900/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-1/2 left-1/3 w-48 md:w-56 lg:w-64 h-48 md:h-56 lg:h-64 bg-cyan-900/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>

      <div className="relative max-w-6xl mx-auto px-3 sm:px-4 lg:px-6">
        {/* Header */}
        <div className="text-center mb-8 md:mb-14 animate-in fade-in slide-in-from-top-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-magenta-500/10 border border-purple-500/30 rounded-full mb-4 md:mb-6">
            <span className="text-xs md:text-sm font-medium text-purple-300">✨ Testimonials</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6 leading-tight">
            Success Stories from Our <span className="text-white">Community</span>
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            See how students like you are transforming their learning journey with AI-powered personalized study tools.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 md:mb-16">
          {testimonials.map((testimonial, idx) => (
            <div
              key={idx}
              className={`relative h-full bg-gradient-to-br ${testimonial.color} border ${testimonial.borderColor} hover:border-purple-500/60 rounded-2xl p-6 transition-all duration-500 hover:shadow-xl hover:shadow-purple-500/10 cursor-pointer transform hover:scale-105 hover:-translate-y-2 backdrop-blur-sm overflow-hidden group animate-in fade-in`}
              style={{
                animationDelay: `${idx * 150}ms`,
                animationDuration: '800ms',
              }}
            >
              {/* Gradient Overlay on Hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 to-white/0 group-hover:from-white/5 group-hover:to-white/0 transition-all duration-500 rounded-2xl pointer-events-none"></div>

              <div className="relative z-5">
                {/* Stars */}
                <div className="flex gap-1 mb-4 group-hover:gap-1.5 transition-all duration-300">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="text-yellow-400 fill-yellow-400 group-hover:scale-110 transition-transform duration-300"
                      size={16}
                      style={{ transitionDelay: `${i * 50}ms` }}
                    />
                  ))}
                </div>

                {/* Content */}
                <p className="text-sm md:text-base text-slate-300 mb-6 leading-relaxed group-hover:text-slate-200 transition-colors duration-300">
                  "{testimonial.content}"
                </p>

                {/* User Info */}
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl group-hover:scale-110 transition-transform duration-300">{testimonial.avatar}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-white text-sm group-hover:text-purple-200 transition-colors duration-300">
                      {testimonial.name}
                    </p>
                    <p className="text-slate-400 text-xs group-hover:text-slate-300 transition-colors duration-300">
                      {testimonial.role}
                    </p>
                  </div>
                </div>

                {/* Improvement Badge */}
                <div className="inline-flex px-3 py-1.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 hover:border-green-500/60 rounded-full transition-all duration-300 group-hover:from-green-500/30 group-hover:to-emerald-500/30 transform group-hover:scale-105">
                  <span className="text-xs font-bold text-green-400 group-hover:text-green-300 transition-colors">
                    Improvement: {testimonial.improvement}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 bg-gradient-to-br from-slate-900/40 to-slate-950/40 border border-purple-500/30 hover:border-purple-500/50 rounded-2xl p-6 md:p-12 backdrop-blur-xl transition-all duration-300 group animate-in fade-in slide-in-from-bottom-8 duration-1000">
          {[
            { label: 'Active Students', value: '50K+', icon: '👥' },
            { label: 'Avg. Improvement', value: '+28%', icon: '📈' },
            { label: 'Satisfaction Rate', value: '4.9★', icon: '⭐' },
          ].map((stat, idx) => (
            <div key={idx} className="text-center group/stat cursor-pointer transform hover:scale-110 transition-all duration-300 animate-in fade-in" style={{ animationDelay: `${1000 + idx * 100}ms`, animationDuration: '600ms' }}>
              <p className="text-3xl md:text-4xl mb-3 md:mb-4 group-hover/stat:scale-125 transition-transform">
                {stat.icon}
              </p>
              <p className={`text-xl md:text-2xl font-bold bg-gradient-to-r ${idx === 0 ? 'from-purple-400 to-magenta-400' : idx === 1 ? 'from-cyan-400 to-blue-400' : 'from-yellow-400 to-orange-400'} bg-clip-text text-transparent mb-2 group-hover/stat:scale-105 transition-transform`}>
                {stat.value}
              </p>
              <p className="text-sm md:text-base text-slate-400 group-hover/stat:text-slate-300 transition-colors">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  ); 
}