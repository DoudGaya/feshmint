import Link from "next/link";

export default function Features() {
  const features = [
    {
      title: "Intelligent Signal Processing",
      description: "Advanced algorithms analyze signals from multiple sources including Telegram channels, Discord servers, and Solana indexers.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      features: [
        "Multi-source signal aggregation",
        "Intelligent scoring algorithms",
        "Real-time signal processing",
        "Custom signal filters",
        "Signal confidence scoring"
      ]
    },
    {
      title: "MEV Protection & Execution",
      description: "Protect your trades from MEV attacks with advanced execution strategies.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
      features: [
        "Adaptive fee strategies",
        "MEV attack detection",
        "Priority fee optimization",
        "Private routing support",
        "Sandwich attack prevention"
      ]
    },
    {
      title: "Risk Management Suite",
      description: "Comprehensive risk controls to protect your capital with intelligent position sizing and stop-loss mechanisms.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      features: [
        "Dynamic position sizing",
        "Trailing stop-loss",
        "Portfolio diversification",
        "Risk/reward optimization",
        "Market regime detection"
      ]
    },
    {
      title: "Paper Trading Environment",
      description: "Test your strategies risk-free with realistic market simulation before deploying real capital.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      features: [
        "Realistic market simulation",
        "Historical backtesting",
        "Strategy performance metrics",
        "Risk-free testing",
        "Seamless live transition"
      ]
    },
    {
      title: "Real-time Analytics",
      description: "Advanced performance tracking and market insights to optimize your trading strategies continuously.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
        </svg>
      ),
      features: [
        "Real-time P&L tracking",
        "Performance analytics",
        "Market sentiment analysis",
        "Trade execution reports",
        "Custom dashboards"
      ]
    },
    {
      title: "Custom Strategy Builder",
      description: "Build and deploy sophisticated trading strategies with our intuitive visual strategy builder.",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      features: [
        "Visual strategy builder",
        "Custom indicators",
        "Strategy backtesting",
        "Multi-timeframe analysis",
        "Strategy marketplace"
      ]
    }
  ];

  return (
    <div className="bg-gray-950 text-white">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-black"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-900/20 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(34,197,94,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(34,197,94,0.1)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_800px_400px_at_50%_50%,black_40%,transparent_100%)]"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-8">
            <span className="block">Advanced Trading</span>
            <span className="block bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
              Features
            </span>
          </h1>
          <p className="max-w-3xl mx-auto text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed">
            Comprehensive suite of professional-grade tools designed to give you an edge in Solana token trading
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group bg-gray-900/30 border border-gray-800 rounded-2xl p-8 hover:border-green-500/30 transition-all duration-300 hover:bg-gray-900/50"
              >
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-xl flex items-center justify-center text-white mr-6 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white">{feature.title}</h3>
                </div>
                
                <p className="text-gray-300 mb-6 leading-relaxed">
                  {feature.description}
                </p>
                
                <ul className="space-y-3">
                  {feature.features.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-center text-gray-300">
                      <svg className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technical Specifications */}
      <section className="py-24 bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-6">
              Technical <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">Specifications</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Built on cutting-edge technology for maximum performance and reliability
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-center">
              <div className="text-3xl font-black text-green-400 mb-2">&lt;50ms</div>
              <div className="text-gray-300 font-semibold">Execution Speed</div>
              <div className="text-sm text-gray-400 mt-2">Ultra-low latency trading</div>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-center">
              <div className="text-3xl font-black text-blue-400 mb-2">99.9%</div>
              <div className="text-gray-300 font-semibold">Uptime</div>
              <div className="text-sm text-gray-400 mt-2">Reliable serverless infrastructure</div>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-center">
              <div className="text-3xl font-black text-purple-400 mb-2">24/7</div>
              <div className="text-gray-300 font-semibold">Monitoring</div>
              <div className="text-sm text-gray-400 mt-2">Continuous market surveillance</div>
            </div>
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-center">
              <div className="text-3xl font-black text-yellow-400 mb-2">100%</div>
              <div className="text-gray-300 font-semibold">Serverless</div>
              <div className="text-sm text-gray-400 mt-2">Infinitely scalable architecture</div>
            </div>
          </div>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-24 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-6">
              Enterprise-Grade <span className="bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent">Security</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Your funds and data are protected by industry-leading security measures
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">End-to-End Encryption</h3>
              <p className="text-gray-300">
                All data and communications are encrypted using industry-standard AES-256 encryption
              </p>
            </div>

            <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Non-Custodial</h3>
              <p className="text-gray-300">
                You maintain full control of your private keys and funds at all times
              </p>
            </div>

            <div className="bg-gray-900/30 border border-gray-800 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Real-time Monitoring</h3>
              <p className="text-gray-300">
                Continuous security monitoring and threat detection protect your account 24/7
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-green-900/20 via-blue-900/20 to-purple-900/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-black text-white mb-6">
            Ready to Experience These Features?
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Start with paper trading to test all features risk-free, then scale to live trading when you&apos;re ready.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/auth/signup"
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-green-500 to-blue-600 rounded-xl hover:from-green-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-xl"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity"></span>
              <span className="relative">Start Free Trial</span>
            </Link>
            <Link
              href="/documentation"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-gray-600 rounded-xl hover:border-green-400 hover:bg-green-400/10 transition-all duration-300"
            >
              View Documentation
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
