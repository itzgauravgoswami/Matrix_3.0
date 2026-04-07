import React, { useState } from 'react'; 
import { Sparkles, Github, Linkedin, Twitter, Send, Heart } from 'lucide-react'; 

export default function Footer() {
  const [email, setEmail] = useState(''); 
  const [subscribed, setSubscribed] = useState(false); 

  const handleSubscribe = () => {
    if (email.trim()) {
      setSubscribed(true); 
      setEmail(''); 
      setTimeout(() => setSubscribed(false), 3000); 
    }
  }; 

  const footerSections = [
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '#features' },
        { label: 'Pricing', href: '#pricing' },
        { label: 'Languages', href: '#languages' },
        { label: 'FAQ', href: '#faq' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About', href: '#' },
        { label: 'Blog', href: '#' },
        { label: 'Careers', href: '#' },
        { label: 'Contact', href: '#' },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy', href: '#' },
        { label: 'Terms', href: '#' },
        { label: 'Cookies', href: '#' },
        { label: 'GDPR', href: '#' },
      ],
    },
  ]; 

  const socialLinks = [
    { icon: Twitter, label: 'Twitter', href: '#', color: 'hover:text-cyan-400' },
    { icon: Github, label: 'GitHub', href: '#', color: 'hover:text-purple-400' },
    { icon: Linkedin, label: 'LinkedIn', href: '#', color: 'hover:text-blue-400' },
  ]; 

  return (
    <footer className="relative bg-gradient-to-b from-black via-slate-950 to-black border-t border-purple-500/30 overflow-hidden" style={{ fontFamily: "'Lato', sans-serif" }}>
      {/* Grid Background - Matching FAQ */}
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

      {/* Newsletter Section */}
      <div className="relative bg-gradient-to-r from-purple-500/10 to-magenta-500/10 border-b border-purple-500/30">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="animate-in fade-in slide-in-from-left-8 duration-1000">
              <h3 className="text-2xl font-bold text-white mb-2 hover:text-purple-300 transition-colors">
                Get the Latest Updates
              </h3>
              <p className="text-slate-300 hover:text-slate-200 transition-colors">
                Subscribe for exclusive tips, new features, and free study resources.
              </p>
            </div>
            <div className="flex gap-2 animate-in fade-in slide-in-from-right-8 duration-1000">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubscribe()}
                className="flex-1 bg-slate-900/40 border border-purple-500/30 hover:border-purple-500/50 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-all duration-300 focus:ring-2 focus:ring-purple-500/20 backdrop-blur-sm"
              />
              <button
                onClick={handleSubscribe}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-magenta-600 hover:from-purple-500 hover:to-magenta-500 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-2 shadow-lg shadow-purple-500/50 hover:shadow-purple-500/70"
              >
                <Send size={18} />
              </button>
            </div>
            {subscribed && (
              <p className="text-green-400 text-sm col-span-full animate-in fade-in">
                ✓ Thanks for subscribing! Check your email soon.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="relative max-w-6xl mx-auto px-4 py-16">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="md:col-span-1 animate-in fade-in slide-in-from-left-8 duration-1000">
            <div className="flex items-center gap-2 mb-4 group cursor-pointer">
              <div className="p-2 bg-gradient-to-br from-purple-600 to-magenta-600 rounded-lg group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="text-white" size={20} />
              </div>
              <span className="text-xl font-bold text-purple-400 group-hover:text-purple-300 transition-colors">
                Self Ranker
              </span>
            </div>
            <p className="text-slate-300 text-sm mb-6 hover:text-slate-200 transition-colors">
              AI-powered personalized learning platform for mastering any skill.
            </p>
            {/* Social Links */}
            <div className="flex gap-4">
              {socialLinks.map((social, idx) => {
                const Icon = social.icon; 
                return (
                  <a
                    key={idx}
                    href={social.href}
                    className={`text-slate-400 ${social.color} transition-all duration-300 hover:scale-110 transform cursor-pointer group/social animate-in fade-in`}
                    style={{ animationDelay: `${idx * 100}ms`, animationDuration: '600ms' }}
                    title={social.label}
                  >
                    <Icon className="group-hover/social:rotate-12 transition-transform" size={20} />
                  </a>
                ); 
              })}
            </div>
          </div>

          {/* Footer Links */}
          {footerSections.map((section, idx) => (
            <div
              key={idx}
              className="animate-in fade-in"
              style={{
                animationDelay: `${(idx + 1) * 100}ms`,
                animationDuration: '800ms',
              }}
            >
              <h4 className="font-semibold text-white mb-4 hover:text-purple-300 transition-colors">
                {section.title}
              </h4>
              <ul className="flex flex-wrap gap-4 md:gap-3 md:flex-col md:space-y-3">
                {section.links.map((link, lIdx) => (
                  <li
                    key={lIdx}
                    className="transform hover:translate-x-1 transition-all duration-300"
                  >
                    <a
                      href={link.href}
                      className="text-slate-300 hover:text-purple-400 transition-colors text-sm inline-flex items-center gap-2 group/link"
                    >
                      <span className="w-0 group-hover/link:w-4 transition-all duration-300 overflow-hidden">
                        →
                      </span>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-purple-500/30 pt-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-slate-300 text-sm flex items-center gap-2">
              © 2025 Self Ranker. Made with
              <Heart className="text-red-400 fill-red-400 animate-pulse" size={16} />
              by Gaurav Goswami.
            </p>

            {/* Tech Stack */}
            <div className="flex items-center gap-4 text-sm text-slate-300 flex-wrap justify-center md:justify-end">
              <span className="text-slate-400">Built with:</span>
              <div className="flex gap-2 flex-wrap justify-center">
                {[
                  { name: 'React', icon: '⚛️' },
                  { name: 'Tailwind', icon: '🎨' },
                  { name: 'Node.js', icon: '🟢' },
                  { name: 'AI', icon: '🤖' },
                ].map((tech, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-1 bg-slate-900/40 border border-purple-500/20 hover:bg-slate-800/60 hover:border-purple-500/40 rounded text-xs transition-all duration-300 transform hover:scale-105 hover:cursor-pointer group/tech animate-in fade-in backdrop-blur-sm"
                    style={{ animationDelay: `${idx * 100}ms`, animationDuration: '600ms' }}
                    title={tech.name}
                  >
                    <span className="group-hover/tech:scale-110 inline-block transition-transform">
                      {tech.icon}
                    </span>
                    {' '}
                    {tech.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  ); 
}