import React, { useState } from 'react'; 
import { ChevronDown, HelpCircle } from 'lucide-react'; 

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null); 

  const faqs = [
    {
      question: 'Is Self Ranker really free?',
      answer:
        'Yes! Self Ranker has a free tier that includes on-demand quizzes, smart notes, and basic progress tracking. Premium features like daily tests and advanced analytics require a subscription.',
    },
    {
      question: 'How accurate is the AI-generated content?',
      answer:
        'Our AI is trained on extensive educational datasets and uses OpenAI/Gemini models. We continuously improve accuracy through user feedback and validation. Quiz questions are verified before deployment.',
    },
    {
      question: 'Can I use Self Ranker for competitive exams?',
      answer:
        'Absolutely! Self Ranker is designed for all learning levels. Our Ultimate plan includes mock exams and custom study plans specifically tailored for competitive exam preparation.',
    },
    {
      question: 'Is there a mobile app?',
      answer:
        'Currently, Self Ranker works perfectly on all browsers. Native iOS and Android apps are coming soon! We will notify all users when they launch.',
    },
    {
      question: 'How does the daily test feature work?',
      answer:
        'Premium users get one personalized daily test based on their selected subjects and past performance. Each day brings a new test to keep learning fresh and consistent.',
    },
    {
      question: 'Can I download my progress reports?',
      answer:
        'Yes! Premium users can download detailed PDF reports of their performance, including subject-wise analytics and improvement suggestions.',
    },
  ]; 

  return (
    <section id="faq" className="relative py-12 md:py-20 bg-gradient-to-b from-black via-slate-950 to-black overflow-hidden" style={{ fontFamily: "'Lato', sans-serif" }}>
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

      <div className="relative max-w-3xl mx-auto px-3 sm:px-4 lg:px-6">
        {/* Header */}
        <div className="text-center mb-8 md:mb-14 animate-in fade-in slide-in-from-top-8 duration-1000">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/10 to-magenta-500/10 border border-purple-500/30 rounded-full mb-4 md:mb-6">
            <span className="text-xs md:text-sm font-medium text-purple-300">❓ FAQ</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6 leading-tight">
            <span className="text-white">Frequently Asked</span> Questions
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Find answers to common questions about Self Ranker
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4 mb-10 md:mb-16">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="bg-gradient-to-br from-slate-900/40 to-slate-950/40 border border-purple-500/30 hover:border-purple-500/60 rounded-xl overflow-hidden transition-all duration-500 group hover:shadow-xl hover:shadow-purple-500/10 backdrop-blur-sm animate-in fade-in"
              style={{ animationDelay: `${idx * 100}ms`, animationDuration: '600ms' }}
            >
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="w-full p-5 md:p-6 flex items-center justify-between text-left hover:bg-white/5 transition-all duration-300"
              >
                <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                  <HelpCircle className="text-purple-400 flex-shrink-0 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300" size={20} />
                  <span className="text-base md:text-lg font-semibold text-white group-hover:text-purple-200 transition-colors break-words">
                    {faq.question}
                  </span>
                </div>
                <ChevronDown
                  className={`text-slate-400 flex-shrink-0 transition-all duration-300 group-hover:text-purple-400 ml-2 ${
                    openIndex === idx ? 'rotate-180' : ''
                  }`}
                  size={20}
                />
              </button>

              {/* Answer */}
              {openIndex === idx && (
                <div className="px-5 md:px-6 pb-5 md:pb-6 text-sm md:text-base text-slate-300 border-t border-purple-500/20 pt-4 animate-in fade-in slide-in-from-top-4 duration-300 leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Still Have Questions */}
        <div className="bg-gradient-to-br from-slate-900/40 to-slate-950/40 border border-purple-500/30 hover:border-purple-500/50 rounded-2xl p-6 md:p-8 backdrop-blur-xl transition-all duration-300 group text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <h3 className="text-xl md:text-2xl font-bold text-white mb-3 group-hover:text-purple-200 transition-colors">
            Still have questions?
          </h3>
          <p className="text-sm md:text-base text-slate-300 mb-6 group-hover:text-slate-200 transition-colors">
            We're here to help! Contact our support team for more information.
          </p>
          <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-magenta-600 hover:from-purple-500 hover:to-magenta-500 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70">
            Contact Support
          </button>
        </div>
      </div>
    </section>
  ); 
}