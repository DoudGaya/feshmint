import Link from "next/link";

export default function Home() {
  return (
    <div className="bg-gray-950 text-white">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-black"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-900/20 via-transparent to-transparent"></div>
        
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.1)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_500px_300px_at_50%_50%,black_40%,transparent_100%)]"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-fade-in-up">
            <h1 className="text-5xl md:text-3xl lg:text-6xl font-black tracking-tight mb-8">
              <span className="block">Advanced</span>
              <span className="block bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                Solana Trading Automation
              </span>
              {/* <span className="block">Automation</span> */}
            </h1>
            
            <p className="max-w-3xl mx-auto text-lg md:text-xl text-gray-300 mb-12 leading-relaxed">
              Professional-grade serverless trading bot with intelligent signal processing, 
              MEV protection, and comprehensive risk management. Built for serious traders and investors.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link
                href="/auth/signup"
                className="group relative inline-flex items-center justify-center px-6 py-2 text-lg font-semibold text-white bg-gradient-to-r from-green-500 to-blue-600 rounded-xl hover:from-green-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
              >
                <span className="absolute inset-0 py-0 w-full h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></span>
                <span className="relative py-0">Start Trading Now</span>
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              
              <Link
                href="#features"
                className="inline-flex items-center justify-center px-6 py-2 text-lg text-white border-2 border-gray-600 rounded-xl hover:border-green-400 hover:bg-green-400/10 transition-all duration-300"
              >
                Learn More
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div className="p-6">
              <div className="text-4xl font-black text-green-400 mb-2">99.9%</div>
              <div className="text-gray-300 font-semibold">Uptime</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-black text-blue-400 mb-2">&lt;50ms</div>
              <div className="text-gray-300 font-semibold">Execution Speed</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-black text-purple-400 mb-2">24/7</div>
              <div className="text-gray-300 font-semibold">Monitoring</div>
            </div>
            <div className="p-6">
              <div className="text-4xl font-black text-yellow-400 mb-2">100%</div>
              <div className="text-gray-300 font-semibold">Serverless</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black text-white mb-6">
              Built for <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">Performance</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Every feature is designed to give you an edge in the fast-moving Solana ecosystem
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group p-8 bg-gray-900/50 rounded-2xl border border-gray-800 hover:border-green-500/50 transition-all duration-300 hover:bg-gray-900/80">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Signal Processing</h3>
              <p className="text-gray-300 leading-relaxed">
                Advanced signal acquisition from multiple sources including Telegram, Discord, and Solana indexers with intelligent scoring algorithms.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group p-8 bg-gray-900/50 rounded-2xl border border-gray-800 hover:border-blue-500/50 transition-all duration-300 hover:bg-gray-900/80">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">MEV Protection</h3>
              <p className="text-gray-300 leading-relaxed">
                Adaptive fee strategies and private routing to protect against MEV attacks and ensure optimal execution in competitive markets.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group p-8 bg-gray-900/50 rounded-2xl border border-gray-800 hover:border-purple-500/50 transition-all duration-300 hover:bg-gray-900/80">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Risk Management</h3>
              <p className="text-gray-300 leading-relaxed">
                Comprehensive risk controls with trailing stop-loss, position sizing, and market regime awareness to protect your capital.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group p-8 bg-gray-900/50 rounded-2xl border border-gray-800 hover:border-yellow-500/50 transition-all duration-300 hover:bg-gray-900/80">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Paper Trading</h3>
              <p className="text-gray-300 leading-relaxed">
                Test strategies risk-free with realistic paper trading simulation before deploying real capital to the markets.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group p-8 bg-gray-900/50 rounded-2xl border border-gray-800 hover:border-red-500/50 transition-all duration-300 hover:bg-gray-900/80">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Real-time Analytics</h3>
              <p className="text-gray-300 leading-relaxed">
                Advanced performance tracking, P&L analytics, and market insights to optimize your trading strategies continuously.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group p-8 bg-gray-900/50 rounded-2xl border border-gray-800 hover:border-indigo-500/50 transition-all duration-300 hover:bg-gray-900/80">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Custom Strategies</h3>
              <p className="text-gray-300 leading-relaxed">
                Build and deploy custom trading strategies with our intuitive strategy builder and backtesting engine.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-green-900/20 via-blue-900/20 to-purple-900/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-black text-white mb-6">
            Ready to Trade Smarter?
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Join professional traders who are already using Fresh Mint to automate their Solana trading strategies.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/auth/signup"
              className="group relative inline-flex items-center justify-center px-6 py-2 text-lg font-semibold text-white bg-gradient-to-r from-green-500 to-blue-600 rounded-xl hover:from-green-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-xl"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></span>
              <span className="relative">Get Started Free</span>
            </Link>
            <Link
              href="/documentation"
              className="inline-flex items-center justify-center px-6 py-2 text-lg text-white border-2 border-gray-600 rounded-xl hover:border-green-400 hover:bg-green-400/10 transition-all duration-300"
            >
              View Documentation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
