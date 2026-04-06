export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">SR</span>
              </div>
              <span className="text-xl font-bold">Self Ranker</span>
            </div>
            <p className="text-gray-300 text-sm">
              Empowering learners with AI-driven study tools and personalized learning experiences.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-4 text-lg">Product</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><a href="#features" className="hover:text-orange-400 transition">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-orange-400 transition">How It Works</a></li>
              <li><a href="#faq" className="hover:text-orange-400 transition">FAQ</a></li>
              <li><a href="#pricing" className="hover:text-orange-400 transition">Pricing</a></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4 text-lg">Company</h4>
            <ul className="space-y-2 text-gray-300 text-sm">
              <li><a href="#about" className="hover:text-orange-400 transition">About</a></li>
              <li><a href="#blog" className="hover:text-orange-400 transition">Blog</a></li>
              <li><a href="#careers" className="hover:text-orange-400 transition">Careers</a></li>
              <li><a href="#contact" className="hover:text-orange-400 transition">Contact</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-lg">Connect</h4>
            <div className="flex gap-4 mb-4">
              <a href="#" className="bg-orange-500 p-2 rounded-full hover:bg-orange-600 hover:scale-110 transition">
                <i className="fas fa-envelope text-white text-xl"></i>
              </a>
              <a href="#" className="bg-orange-500 p-2 rounded-full hover:bg-orange-600 hover:scale-110 transition">
                <i className="fab fa-twitter text-white text-xl"></i>
              </a>
              <a href="#" className="bg-orange-500 p-2 rounded-full hover:bg-orange-600 hover:scale-110 transition">
                <i className="fab fa-linkedin text-white text-xl"></i>
              </a>
              <a href="#" className="bg-orange-500 p-2 rounded-full hover:bg-orange-600 hover:scale-110 transition">
                <i className="fab fa-github text-white text-xl"></i>
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center text-gray-400 text-sm">
          <p>&copy; 2026 Self Ranker. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#privacy" className="hover:text-orange-400 transition">Privacy Policy</a>
            <a href="#terms" className="hover:text-orange-400 transition">Terms of Service</a>
            <a href="#cookies" className="hover:text-orange-400 transition">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
