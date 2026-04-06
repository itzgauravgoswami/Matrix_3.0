import React, { useState } from 'react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function Home() {
  const features = [
    {
      icon: <i className="fas fa-book text-white text-3xl"></i>,
      title: 'Generate Notes',
      description: 'AI-powered note generation that captures key concepts and creates structured, easy-to-understand study materials.',
      color: 'bg-orange-500'
    },
    {
      icon: <i className="fas fa-brain text-white text-3xl"></i>,
      title: 'Smart Quizzes',
      description: 'Adaptive quizzes that adjust difficulty based on your performance and learning pace.',
      color: 'bg-orange-500'
    },
    {
      icon: <i className="fas fa-chart-bar text-white text-3xl"></i>,
      title: 'Q&A Tests',
      description: 'Comprehensive question-answer tests designed to reinforce learning and identify weak areas.',
      color: 'bg-orange-500'
    },
    {
      icon: <i className="fas fa-bolt text-white text-3xl"></i>,
      title: 'Instant Feedback',
      description: 'Get real-time feedback on your answers with detailed explanations and learning tips.',
      color: 'bg-orange-500'
    },
    {
      icon: <i className="fas fa-bullseye text-white text-3xl"></i>,
      title: 'Personalized Learning',
      description: 'AI algorithms learn your pace and style to create customized learning paths just for you.',
      color: 'bg-orange-500'
    },
    {
      icon: <i className="fas fa-trophy text-white text-3xl"></i>,
      title: 'Progress Tracking',
      description: 'Detailed analytics and progress reports to monitor your learning journey and achievements.',
      color: 'bg-orange-500'
    }
  ]

  const steps = [
    {
      number: '1',
      title: 'Choose Your Subject',
      description: 'Select the topic or subject you want to learn from our extensive library.'
    },
    {
      number: '2',
      title: 'AI Generates Content',
      description: 'Our AI creates personalized notes, quizzes, and Q&A tests tailored to your level.'
    },
    {
      number: '3',
      title: 'Learn & Practice',
      description: 'Study the generated content and practice with interactive quizzes and tests.'
    },
    {
      number: '4',
      title: 'Track Progress',
      description: 'Monitor your performance with detailed analytics and identify areas for improvement.'
    }
  ]

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Medical Student',
      content: 'Self Ranker has transformed how I study. The AI-generated notes are incredibly comprehensive and the quizzes are perfect for exam prep.',
      avatar: '👩‍🎓'
    },
    {
      name: 'Alex Kumar',
      role: 'Engineering Aspirant',
      content: 'The personalized learning paths really work. I improved my understanding of complex topics significantly in just 2 weeks.',
      avatar: '👨‍💻'
    },
    {
      name: 'Emma Wilson',
      role: 'Language Learner',
      content: 'Best learning tool I\'ve ever used. The instant feedback and tracking features keep me motivated and on track.'
      , avatar: '👩‍🏫'
    },
    {
      name: 'David Lee',
      role: 'Finance Professional',
      content: 'Upskilled myself for a new role using Self Ranker. Highly recommend it for professionals looking to learn quickly.',
      avatar: '👨‍💼'
    }
  ]

  const faqs = [
    {
      question: 'How does Self Ranker generate personalized study materials?',
      answer: 'Self Ranker uses advanced AI algorithms to analyze your learning patterns and create customized notes, quizzes, and Q&A tests based on your learning style and pace. It continuously adapts as you progress.'
    },
    {
      question: 'Can I use Self Ranker on multiple devices?',
      answer: 'Yes! Your account syncs across all your devices - desktop, tablet, and mobile. You can start studying on one device and continue on another seamlessly.'
    },
    {
      question: 'What subjects are available on Self Ranker?',
      answer: 'We cover a wide range of subjects including Science, Mathematics, History, Languages, Technology, Business, and many more. New subjects are added regularly based on user demand.'
    },
    {
      question: 'Is there a free trial available?',
      answer: 'Yes! You can start with our free plan which includes access to basic features. Premium plans unlock advanced AI features and unlimited content generation.'
    },
    {
      question: 'How accurate is the AI-generated content?',
      answer: 'Our AI is trained on verified academic sources and is continuously refined. All content is reviewed for accuracy and quality, ensuring you get reliable study materials.'
    },
    {
      question: 'Can I download my study materials?',
      answer: 'Absolutely! You can download your notes, quiz results, and progress reports in PDF format for offline access and future reference.'
    }
  ]

  const [openFaq, setOpenFaq] = useState(0)

  return (
    <div className="min-h-screen bg-white" style={{backgroundImage: 'radial-gradient(circle, #f0f0f0 0.5px, transparent 0.5px)', backgroundSize: '30px 30px'}}>
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-white -z-10"></div>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block mb-6">
              <span className="px-4 py-2 bg-orange-100 text-orange-600 rounded-full font-semibold text-sm">
                🎉 Launch Special: Get 50% off on Premium
              </span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Learn Smarter with
              <span className="block text-orange-600">
                AI-Powered Learning
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Generate personalized notes, quizzes, and Q&A tests instantly. Master any subject with adaptive learning powered by artificial intelligence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-orange-500 text-white rounded-full font-bold text-lg hover:bg-orange-600 transition-all duration-300">
                Start Learning Free
              </button>
              <button className="px-8 py-4 border-2 border-orange-500 text-orange-600 rounded-full font-bold text-lg hover:bg-orange-50 transition-all duration-300">
                Watch Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Powerful Features for
              <span className="block text-orange-600">
                Better Learning
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to master any subject with our AI-powered learning platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 group border border-gray-100"
              >
                <div className={`w-16 h-16 ${feature.color} rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-b-2 border-dotted border-gray-300 mx-4 sm:mx-6 lg:mx-8"></div>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              How <span className="text-orange-600">Self Ranker</span> Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple 4-step process to start your smart learning journey today.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100 h-full hover:shadow-xl transition-shadow duration-300">
                  <div className="w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl mb-6">
                    {step.number}
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-900">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-8 transform -translate-y-1/2">
                    <i className="fas fa-arrow-right text-orange-400 text-3xl"></i>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-b-2 border-dotted border-gray-300 mx-4 sm:mx-6 lg:mx-8"></div>

      {/* Benefits Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-orange-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl sm:text-5xl font-bold mb-8">
                Why Choose
                <span className="block text-orange-600">
                  Self Ranker?
                </span>
              </h2>
              <div className="space-y-4">
                {[
                  'AI-generated personalized learning materials',
                  'Adaptive difficulty that grows with your skills',
                  'Instant feedback and detailed analytics',
                  'Works on all devices with cloud sync',
                  '24/7 access to study anytime, anywhere',
                  'Proven results: 95% success rate'
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <i className="fas fa-check-circle text-orange-500 text-2xl"></i>
                    <span className="text-lg text-gray-700 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
              <button className="mt-8 px-8 py-4 bg-orange-500 text-white rounded-full font-bold text-lg hover:bg-orange-600 transition-all duration-300">
                Get Started Today
              </button>
            </div>
            <div className="relative">
              <div className="bg-orange-100 rounded-3xl p-8 shadow-2xl">
                <div className="bg-white rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between p-4 bg-orange-100 rounded-xl">
                    <span className="font-semibold text-gray-800">Accuracy</span>
                    <span className="text-2xl font-bold text-orange-600">98%</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-orange-100 rounded-xl">
                    <span className="font-semibold text-gray-800">Success Rate</span>
                    <span className="text-2xl font-bold text-orange-600">95%</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-orange-100 rounded-xl">
                    <span className="font-semibold text-gray-800">Time Saved</span>
                    <span className="text-2xl font-bold text-orange-600">3x</span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-orange-100 rounded-xl">
                    <span className="font-semibold text-gray-800">Active Users</span>
                    <span className="text-2xl font-bold text-orange-600">50K+</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-b-2 border-dotted border-gray-300 mx-4 sm:mx-6 lg:mx-8"></div>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Simple, Transparent
              <span className="block text-orange-600">
                Pricing Plans
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the perfect plan to accelerate your learning journey with Self Ranker.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Basic Plan */}
            <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100 hover:shadow-2xl transition-all duration-300">
              <div className="mb-6">
                <h3 className="text-3xl font-bold text-gray-900 mb-2">Basic Plan</h3>
                <p className="text-gray-600">Perfect for getting started</p>
              </div>

              <div className="mb-8">
                <span className="text-3xl font-bold text-orange-600">Free</span>
              </div>

              <button className="w-full px-8 py-3 border-2 border-orange-500 text-orange-600 rounded-full font-bold text-lg hover:bg-orange-50 transition-all duration-300 mb-8">
                Get Started Free
              </button>

              <div className="space-y-4">
                <p className="font-semibold text-gray-900 mb-6">What's Included:</p>
                {[
                  'Up to 10 AI-generated notes per month',
                  '5 practice quizzes per subject',
                  '3 Q&A tests per month',
                  'Basic progress analytics',
                  'Mobile app access',
                  'Community support forum'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <i className="fas fa-check text-orange-500 font-bold"></i>
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pro Plan */}
            <div className="bg-orange-600 rounded-3xl p-8 shadow-2xl transform md:scale-105 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold">
                Most Popular
              </div>

              <div className="mb-6">
                <h3 className="text-3xl font-bold text-white mb-2">Pro Plan</h3>
                <p className="text-orange-100">For serious learners</p>
              </div>

              <div className="mb-8">
                <span className="text-3xl font-bold text-white">₹830</span>
                <span className="text-orange-100 ml-2">/ month</span>
              </div>

              <button className="w-full px-8 py-3 bg-white text-orange-600 rounded-full font-bold text-lg hover:bg-orange-50 transition-all duration-300 mb-8 shadow-lg">
                Start Your Trial
              </button>

              <div className="space-y-4">
                <p className="font-semibold text-white mb-6">Everything in Basic, plus:</p>
                {[
                  'Unlimited AI-generated notes',
                  'Unlimited practice quizzes',
                  'Unlimited Q&A tests',
                  'Advanced AI personalization',
                  'Detailed performance insights',
                  'Priority email support',
                  'Download study materials as PDF',
                  'Offline access to content',
                  'Ad-free experience'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <i className="fas fa-check text-white font-bold"></i>
                    <span className="text-orange-50">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <p className="text-gray-600 mb-4">All plans include a 7-day free trial. No credit card required.</p>
            <div className="flex justify-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <i className="fas fa-shield-alt text-orange-500 text-2xl"></i>
                <span className="text-gray-700 font-medium">Secure & Encrypted</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fas fa-crown text-orange-500 text-2xl"></i>
                <span className="text-gray-700 font-medium">Cancel Anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <i className="fas fa-redo text-orange-500 text-2xl"></i>
                <span className="text-gray-700 font-medium">30-Day Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-b-2 border-dotted border-gray-300 mx-4 sm:mx-6 lg:mx-8"></div>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Loved by
              <span className="block text-orange-600">
                Thousands of Learners
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See what our users have to say about their learning journey with Self Ranker.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="text-5xl">{testimonial.avatar}</div>
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-orange-600 font-semibold">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed">"{testimonial.content}"</p>
                <div className="flex gap-1 mt-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-xl">★</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-b-2 border-dotted border-gray-300 mx-4 sm:mx-6 lg:mx-8"></div>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              Frequently Asked
              <span className="block text-orange-600">
                Questions
              </span>
            </h2>
            <p className="text-xl text-gray-600">
              Have questions? We have answers. Check out our FAQ section below.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow duration-300"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? -1 : index)}
                  className="w-full px-8 py-6 flex items-center justify-between hover:bg-orange-50 transition-colors duration-300"
                >
                  <span className="text-lg font-bold text-gray-900 text-left">{faq.question}</span>
                  <i
                    className={`fas fa-circle-question text-orange-500 text-2xl flex-shrink-0 transition-transform duration-300 ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                  ></i>
                </button>
                {openFaq === index && (
                  <div className="px-8 py-6 bg-orange-50 border-t border-gray-100">
                    <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-orange-500 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of learners who are already using Self Ranker to achieve their educational goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-orange-600 rounded-full font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
              Start Free Trial
            </button>
            <button className="px-8 py-4 border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white/10 transition-all duration-300">
              View Pricing
            </button>
          </div>
          <p className="text-white/80 mt-6">No credit card required. Start learning in seconds.</p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
