import React, { useState } from 'react'; 
import { Check, Users, TrendingUp, ChevronRight, Zap, BookOpen, Award } from 'lucide-react'; 

export default function SubjectsSection() {
  const [selectedCategory, setSelectedCategory] = useState('all'); 

  const categories = [
    { id: 'all', name: 'All Subjects', icon: '📚' },
    { id: 'stem', name: 'STEM', icon: '🔬' },
    { id: 'languages', name: 'Languages', icon: '🗣️' },
    { id: 'humanities', name: 'Humanities', icon: '📖' },
    { id: 'business', name: 'Business', icon: '💼' },
    { id: 'coding', name: 'Programming', icon: '💻' },
  ]; 

  const subjects = {
    all: [
      { name: 'Mathematics', level: 'High School to Advanced', quizzes: 450, learners: '45K', icon: '🔢', color: 'from-blue-500 to-cyan-600' },
      { name: 'Physics', level: 'Elementary to University', quizzes: 380, learners: '38K', icon: '⚛️', color: 'from-purple-500 to-pink-600' },
      { name: 'Chemistry', level: 'High School to Post-Grad', quizzes: 340, learners: '34K', icon: '🧪', color: 'from-green-500 to-emerald-600' },
      { name: 'Biology', level: 'High School to Medical', quizzes: 320, learners: '32K', icon: '🧬', color: 'from-yellow-500 to-orange-600' },
      { name: 'English', level: 'Primary to University', quizzes: 280, learners: '28K', icon: '📝', color: 'from-red-500 to-pink-600' },
      { name: 'History', level: 'Middle School to Research', quizzes: 250, learners: '25K', icon: '📜', color: 'from-amber-600 to-yellow-600' },
      { name: 'Spanish', level: 'Beginner to Advanced', quizzes: 200, learners: '20K', icon: '🇪🇸', color: 'from-red-600 to-yellow-600' },
      { name: 'French', level: 'Beginner to Fluent', quizzes: 180, learners: '18K', icon: '🇫🇷', color: 'from-blue-600 to-white-600' },
      { name: 'Python', level: 'Beginner to Expert', quizzes: 420, learners: '42K', icon: '🐍', color: 'from-yellow-500 to-blue-600' },
      { name: 'JavaScript', level: 'Beginner to Advanced', quizzes: 380, learners: '38K', icon: '⚡', color: 'from-yellow-400 to-yellow-600' },
      { name: 'Economics', level: 'High School to MBA', quizzes: 220, learners: '22K', icon: '📈', color: 'from-green-600 to-emerald-600' },
      { name: 'Psychology', level: 'Introductory to Research', quizzes: 200, learners: '20K', icon: '🧠', color: 'from-purple-600 to-pink-600' },
    ],
    stem: [
      { name: 'Mathematics', level: 'High School to Advanced', quizzes: 450, learners: '45K', icon: '🔢', color: 'from-blue-500 to-cyan-600' },
      { name: 'Physics', level: 'Elementary to University', quizzes: 380, learners: '38K', icon: '⚛️', color: 'from-purple-500 to-pink-600' },
      { name: 'Chemistry', level: 'High School to Post-Grad', quizzes: 340, learners: '34K', icon: '🧪', color: 'from-green-500 to-emerald-600' },
      { name: 'Biology', level: 'High School to Medical', quizzes: 320, learners: '32K', icon: '🧬', color: 'from-yellow-500 to-orange-600' },
    ],
    languages: [
      { name: 'English', level: 'Primary to University', quizzes: 280, learners: '28K', icon: '📝', color: 'from-red-500 to-pink-600' },
      { name: 'Spanish', level: 'Beginner to Advanced', quizzes: 200, learners: '20K', icon: '🇪🇸', color: 'from-red-600 to-yellow-600' },
      { name: 'French', level: 'Beginner to Fluent', quizzes: 180, learners: '18K', icon: '🇫🇷', color: 'from-blue-600 to-white-600' },
      { name: 'German', level: 'Beginner to Advanced', quizzes: 150, learners: '15K', icon: '🇩🇪', color: 'from-gray-600 to-yellow-600' },
      { name: 'Mandarin', level: 'Beginner to Intermediate', quizzes: 140, learners: '14K', icon: '🇨🇳', color: 'from-red-600 to-yellow-600' },
      { name: 'Japanese', level: 'Beginner to Advanced', quizzes: 130, learners: '13K', icon: '🇯🇵', color: 'from-red-600 to-white-600' },
    ],
    humanities: [
      { name: 'History', level: 'Middle School to Research', quizzes: 250, learners: '25K', icon: '📜', color: 'from-amber-600 to-yellow-600' },
      { name: 'Psychology', level: 'Introductory to Research', quizzes: 200, learners: '20K', icon: '🧠', color: 'from-purple-600 to-pink-600' },
      { name: 'Philosophy', level: 'Introductory to Advanced', quizzes: 170, learners: '17K', icon: '🏛️', color: 'from-indigo-600 to-purple-600' },
      { name: 'Literature', level: 'High School to University', quizzes: 160, learners: '16K', icon: '📚', color: 'from-orange-600 to-red-600' },
    ],
    business: [
      { name: 'Economics', level: 'High School to MBA', quizzes: 220, learners: '22K', icon: '📈', color: 'from-green-600 to-emerald-600' },
      { name: 'Accounting', level: 'Beginner to CPA', quizzes: 190, learners: '19K', icon: '💰', color: 'from-blue-600 to-cyan-600' },
      { name: 'Business Management', level: 'Introductory to MBA', quizzes: 180, learners: '18K', icon: '💼', color: 'from-purple-600 to-blue-600' },
      { name: 'Marketing', level: 'Introductory to Advanced', quizzes: 160, learners: '16K', icon: '🎯', color: 'from-pink-600 to-red-600' },
    ],
    coding: [
      { name: 'Python', level: 'Beginner to Expert', quizzes: 420, learners: '42K', icon: '🐍', color: 'from-yellow-500 to-blue-600' },
      { name: 'JavaScript', level: 'Beginner to Advanced', quizzes: 380, learners: '38K', icon: '⚡', color: 'from-yellow-400 to-yellow-600' },
      { name: 'Java', level: 'Beginner to Enterprise', quizzes: 350, learners: '35K', icon: '☕', color: 'from-orange-500 to-red-600' },
      { name: 'React', level: 'Intermediate to Expert', quizzes: 280, learners: '28K', icon: '⚛️', color: 'from-cyan-400 to-blue-600' },
      { name: 'C++', level: 'Beginner to Advanced', quizzes: 310, learners: '31K', icon: '⚙️', color: 'from-blue-500 to-cyan-600' },
      { name: 'SQL', level: 'Beginner to DBA', quizzes: 260, learners: '26K', icon: '🗄️', color: 'from-purple-500 to-pink-600' },
    ],
  }; 

  const currentSubjects = subjects[selectedCategory] || subjects.all; 

  return (
    <section id="subjects" className="relative py-32 bg-gradient-to-b from-slate-900 to-slate-950 overflow-hidden" style={{ fontFamily: "'Poppins', sans-serif" }}>
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-magenta-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-top-8 duration-1000">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 transition-all duration-300" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800 }}>
            Master <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-magenta-400">1000+ Subjects</span>
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed transition-all duration-300 hover:text-slate-200" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400 }}>
            From school basics to advanced university courses, master any subject with AI-powered quizzes and intelligent learning paths.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-16 animate-in fade-in slide-in-from-top-4 duration-700">
          {categories.map((cat, idx) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className="px-6 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-110 active:scale-95 flex items-center gap-2 animate-in fade-in"
              style={{
                animationDelay: `${200 + idx * 100}ms`,
                animationDuration: '600ms',
                fontFamily: "'Poppins', sans-serif",
                fontWeight: 600,
                background: selectedCategory === cat.id 
                  ? 'linear-gradient(to right, rgb(168, 85, 247), rgb(236, 72, 153))' 
                  : 'rgba(107, 114, 128, 0.5)',
                color: selectedCategory === cat.id ? 'white' : 'rgb(203, 213, 225)',
                border: selectedCategory === cat.id ? 'none' : '1px solid rgba(168, 85, 247, 0.3)',
                boxShadow: selectedCategory === cat.id ? '0 0 20px rgba(168, 85, 247, 0.5)' : 'none',
                cursor: 'pointer',
              }}
            >
              <span className="text-lg">{cat.icon}</span>
              {cat.name}
            </button>
          ))}
        </div>

        {/* Subjects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {currentSubjects.map((subject, idx) => (
            <div
              key={idx}
              className="group cursor-pointer animate-in fade-in"
              style={{ animationDelay: `${idx * 100}ms`, animationDuration: '700ms' }}
            >
              <div className="relative">
                <div className={`absolute inset-0 bg-gradient-to-br ${subject.color} rounded-2xl opacity-0 group-hover:opacity-20 blur-xl transition-all duration-300`}></div>

                <div className={`relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-purple-500/30 group-hover:border-purple-500/60 rounded-2xl p-6 transition-all duration-300 transform group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-purple-500/20 backdrop-blur-xl`}>
                  {/* Icon & Title */}
                  <div className="mb-4">
                    <p className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{subject.icon}</p>
                    <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-all duration-300" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700 }}>
                      {subject.name}
                    </h3>
                    <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-all duration-300 mt-2" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 500 }}>
                      {subject.level}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="space-y-3 mb-4 border-t border-slate-700/50 pt-4">
                    <div className="flex items-center justify-between text-sm group-hover:text-white transition-all duration-300">
                      <span className="text-slate-400" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 500 }}>Quizzes:</span>
                      <span className="font-semibold text-purple-400">{subject.quizzes}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm group-hover:text-white transition-all duration-300">
                      <Users size={14} className="text-purple-400" />
                      <span className="text-slate-400" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 500 }}>
                        {subject.learners} Learning
                      </span>
                    </div>
                  </div>

                  {/* CTA */}
                  <button className="w-full py-2 bg-gradient-to-r from-purple-600/50 to-magenta-600/50 hover:from-purple-600 hover:to-magenta-600 text-white rounded-lg text-sm font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 group/btn" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}>
                    Start Quiz
                    <ChevronRight size={16} className="group-hover/btn:translate-x-1 transition-all duration-300" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Features Highlight Row */}
        <div className="grid md:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          {[
            { icon: Zap, title: 'Instant Quizzes', desc: 'Generate unlimited quizzes for any topic in seconds' },
            { icon: BookOpen, title: 'Smart Notes', desc: 'AI-generated study materials with key concepts' },
            { icon: Award, title: 'Track Progress', desc: 'Detailed analytics and personalized recommendations' },
          ].map((feature, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-br from-purple-600/10 to-magenta-600/10 border border-purple-500/30 hover:border-purple-500/60 rounded-2xl p-6 transition-all duration-300 transform hover:scale-105 group cursor-pointer animate-in fade-in"
              style={{ animationDelay: `${800 + idx * 100}ms`, animationDuration: '700ms' }}
            >
              <feature.icon className="text-purple-400 mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" size={32} />
              <h3 className="text-lg font-bold text-white mb-2 group-hover:text-purple-300 transition-all duration-300" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700 }}>
                {feature.title}
              </h3>
              <p className="text-slate-300 group-hover:text-white transition-all duration-300" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 400 }}>
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom Stats Bar */}
        <div className="mt-16 grid grid-cols-3 gap-6 bg-gradient-to-r from-slate-800/30 to-slate-900/30 border border-purple-500/20 rounded-2xl p-8 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-8 duration-1000" style={{ animationDelay: '900ms' }}>
          {[
            { label: 'Total Subjects', value: '1000+', icon: '📚' },
            { label: 'Active Learners', value: '500K+', icon: '👥' },
            { label: 'Avg. Improvement', value: '+28%', icon: '📈' },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="text-center group cursor-pointer transform hover:scale-110 transition-all duration-300 animate-in fade-in"
              style={{ animationDelay: `${950 + idx * 100}ms`, animationDuration: '600ms' }}
            >
              <p className="text-2xl mb-2 group-hover:scale-125 transition-all duration-300">{stat.icon}</p>
              <p className="text-2xl font-bold text-purple-400 group-hover:text-magenta-400 transition-all duration-300" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 800 }}>
                {stat.value}
              </p>
              <p className="text-slate-400 group-hover:text-white transition-all duration-300" style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 500 }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  ); 
}