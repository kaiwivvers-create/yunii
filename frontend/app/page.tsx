export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">U</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                UniVerse
              </span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#universities" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Universities
              </a>
              <a href="#programs" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Programs
              </a>
              <a href="#about" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                About
              </a>
              <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-6">
            <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></span>
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
              10,000+ Universities Worldwide
            </span>
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
            Discover Your Perfect
            <span className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              University Match
            </span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-10">
            Explore top universities from across the globe. Find programs that match your ambitions and connect with institutions that shape the future.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="flex gap-2 bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-xl shadow-blue-500/10">
              <input
                type="text"
                placeholder="Search universities, programs, or locations..."
                className="flex-1 px-6 py-4 bg-transparent outline-none text-slate-900 dark:text-white placeholder-slate-400"
              />
              <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all">
                Search
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg">
              <div className="text-3xl font-bold text-blue-600 mb-1">150+</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Countries</div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg">
              <div className="text-3xl font-bold text-indigo-600 mb-1">10K+</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Universities</div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg">
              <div className="text-3xl font-bold text-purple-600 mb-1">50K+</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Programs</div>
            </div>
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg">
              <div className="text-3xl font-bold text-pink-600 mb-1">2M+</div>
              <div className="text-sm text-slate-600 dark:text-slate-400">Students</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Regions */}
      <section id="universities" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Explore by Region
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Discover universities across different continents and find the perfect destination for your education
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* North America */}
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-500 to-cyan-500 p-8 text-white cursor-pointer hover:shadow-2xl hover:shadow-blue-500/25 transition-all">
              <div className="relative z-10">
                <div className="text-4xl mb-4">🇺🇸</div>
                <h3 className="text-2xl font-bold mb-2">North America</h3>
                <p className="text-blue-100 mb-4">Harvard, MIT, Stanford, and 500+ more</p>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span>2,500+ Universities</span>
                  <span className="group-hover:translate-x-2 transition-transform">→</span>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-cyan-600/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>

            {/* Europe */}
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 p-8 text-white cursor-pointer hover:shadow-2xl hover:shadow-purple-500/25 transition-all">
              <div className="relative z-10">
                <div className="text-4xl mb-4">🇬🇧</div>
                <h3 className="text-2xl font-bold mb-2">Europe</h3>
                <p className="text-purple-100 mb-4">Oxford, Cambridge, ETH Zurich, and 800+ more</p>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span>3,200+ Universities</span>
                  <span className="group-hover:translate-x-2 transition-transform">→</span>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>

            {/* Asia */}
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 to-red-500 p-8 text-white cursor-pointer hover:shadow-2xl hover:shadow-orange-500/25 transition-all">
              <div className="relative z-10">
                <div className="text-4xl mb-4">🇯🇵</div>
                <h3 className="text-2xl font-bold mb-2">Asia</h3>
                <p className="text-orange-100 mb-4">Tokyo University, NUS, Tsinghua, and 1,200+ more</p>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span>4,000+ Universities</span>
                  <span className="group-hover:translate-x-2 transition-transform">→</span>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 to-red-600/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>

            {/* Australia */}
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-500 to-teal-500 p-8 text-white cursor-pointer hover:shadow-2xl hover:shadow-green-500/25 transition-all">
              <div className="relative z-10">
                <div className="text-4xl mb-4">🇦🇺</div>
                <h3 className="text-2xl font-bold mb-2">Oceania</h3>
                <p className="text-green-100 mb-4">ANU, Melbourne, Sydney, and 200+ more</p>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span>400+ Universities</span>
                  <span className="group-hover:translate-x-2 transition-transform">→</span>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 to-teal-600/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>

            {/* South America */}
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-yellow-500 to-orange-500 p-8 text-white cursor-pointer hover:shadow-2xl hover:shadow-yellow-500/25 transition-all">
              <div className="relative z-10">
                <div className="text-4xl mb-4">🇧🇷</div>
                <h3 className="text-2xl font-bold mb-2">South America</h3>
                <p className="text-yellow-100 mb-4">USP, UBA, and 500+ more</p>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span>800+ Universities</span>
                  <span className="group-hover:translate-x-2 transition-transform">→</span>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-600/20 to-orange-600/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>

            {/* Africa */}
            <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-500 p-8 text-white cursor-pointer hover:shadow-2xl hover:shadow-indigo-500/25 transition-all">
              <div className="relative z-10">
                <div className="text-4xl mb-4">🇿🇦</div>
                <h3 className="text-2xl font-bold mb-2">Africa</h3>
                <p className="text-indigo-100 mb-4">Cape Town, Stellenbosch, and 300+ more</p>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span>600+ Universities</span>
                  <span className="group-hover:translate-x-2 transition-transform">→</span>
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Universities */}
      <section id="programs" className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Featured Universities
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Top-ranked institutions from around the world
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "Harvard University", location: "Cambridge, USA", ranking: "#1", color: "from-red-500 to-red-600" },
              { name: "MIT", location: "Cambridge, USA", ranking: "#2", color: "from-gray-700 to-gray-800" },
              { name: "Stanford University", location: "Stanford, USA", ranking: "#3", color: "from-red-600 to-red-700" },
              { name: "University of Oxford", location: "Oxford, UK", ranking: "#4", color: "from-blue-600 to-blue-700" },
              { name: "ETH Zurich", location: "Zurich, Switzerland", ranking: "#5", color: "from-red-500 to-red-600" },
              { name: "National University of Singapore", location: "Singapore", ranking: "#6", color: "from-orange-500 to-orange-600" },
              { name: "University of Cambridge", location: "Cambridge, UK", ranking: "#7", color: "from-blue-700 to-blue-800" },
              { name: "Tsinghua University", location: "Beijing, China", ranking: "#8", color: "from-purple-600 to-purple-700" },
            ].map((uni, index) => (
              <div key={index} className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg hover:shadow-xl hover:shadow-blue-500/10 transition-all cursor-pointer group">
                <div className={`w-12 h-12 bg-gradient-to-br ${uni.color} rounded-xl flex items-center justify-center mb-4`}>
                  <span className="text-white font-bold">{uni.ranking}</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {uni.name}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">{uni.location}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Why Choose UniVerse?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Everything you need to find your perfect university
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🔍</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                Smart Search
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Advanced filters to find universities that match your specific needs, location, and budget
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">📊</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                Detailed Insights
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Comprehensive data on rankings, programs, tuition, and student life
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🌍</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                Global Network
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Connect with students and alumni from universities around the world
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-center text-white">
            <h2 className="text-4xl font-bold mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join millions of students who found their perfect university through UniVerse
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-white text-blue-600 rounded-xl font-medium hover:shadow-lg transition-all">
                Create Free Account
              </button>
              <button className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-medium hover:bg-white/10 transition-all">
                Explore Universities
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">U</span>
                </div>
                <span className="text-2xl font-bold">UniVerse</span>
              </div>
              <p className="text-slate-400">
                Your gateway to universities worldwide. Find your perfect academic match.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Platform</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Search Universities</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Browse Programs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Compare</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Scholarships</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Resources</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Guides</a></li>
                <li><a href="#" className="hover:text-white transition-colors">FAQs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 pt-8 text-center text-slate-400">
            <p>&copy; 2024 UniVerse. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
