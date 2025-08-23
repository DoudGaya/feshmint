import Link from "next/link";

export default function Documentation() {
  const sections = [
    {
      title: "Getting Started",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      items: [
        { title: "Quick Start Guide", href: "#quick-start" },
        { title: "Account Setup", href: "#account-setup" },
        { title: "Paper Trading Tutorial", href: "#paper-trading" },
        { title: "First Live Trade", href: "#first-trade" }
      ]
    },
    {
      title: "Signal Configuration",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      items: [
        { title: "Signal Sources", href: "#signal-sources" },
        { title: "Telegram Integration", href: "#telegram" },
        { title: "Discord Setup", href: "#discord" },
        { title: "Custom Filters", href: "#filters" }
      ]
    },
    {
      title: "Risk Management",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      items: [
        { title: "Position Sizing", href: "#position-sizing" },
        { title: "Stop Loss Configuration", href: "#stop-loss" },
        { title: "Portfolio Limits", href: "#portfolio-limits" },
        { title: "Risk Metrics", href: "#risk-metrics" }
      ]
    },
    {
      title: "Trading Strategies",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      items: [
        { title: "Strategy Builder", href: "#strategy-builder" },
        { title: "Backtesting", href: "#backtesting" },
        { title: "Custom Indicators", href: "#indicators" },
        { title: "Strategy Marketplace", href: "#marketplace" }
      ]
    },
    {
      title: "API Reference",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      items: [
        { title: "Authentication", href: "#api-auth" },
        { title: "Trading Endpoints", href: "#trading-api" },
        { title: "WebSocket Feeds", href: "#websocket" },
        { title: "Rate Limits", href: "#rate-limits" }
      ]
    },
    {
      title: "Troubleshooting",
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      items: [
        { title: "Common Issues", href: "#common-issues" },
        { title: "FAQ", href: "#faq" },
        { title: "Support", href: "#support" },
        { title: "Contact", href: "#contact" }
      ]
    }
  ];

  return (
    <div className="bg-gray-950 text-white">
      {/* Hero Section */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-950 to-black"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_800px_400px_at_50%_50%,black_40%,transparent_100%)]"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-8">
            <span className="block">Complete</span>
            <span className="block bg-gradient-to-r from-blue-400 via-purple-500 to-pink-600 bg-clip-text text-transparent">
              Documentation
            </span>
          </h1>
          <p className="max-w-3xl mx-auto text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed">
            Everything you need to master Fresh Mint Trading Bot, from basic setup to advanced strategies
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="#quick-start"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
            >
              Get Started
            </Link>
            <Link
              href="#api-auth"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-gray-600 rounded-xl hover:border-blue-400 hover:bg-blue-400/10 transition-all duration-300"
            >
              API Reference
            </Link>
          </div>
        </div>
      </section>

      {/* Documentation Sections */}
      <section className="py-24 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sections.map((section, index) => (
              <div
                key={index}
                className="bg-gray-900/30 border border-gray-800 rounded-2xl p-8 hover:border-blue-500/30 transition-all duration-300 hover:bg-gray-900/50"
              >
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white mr-4">
                    {section.icon}
                  </div>
                  <h3 className="text-xl font-bold text-white">{section.title}</h3>
                </div>
                
                <ul className="space-y-3">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex}>
                      <Link
                        href={item.href}
                        className="flex items-center text-gray-300 hover:text-white transition-colors group"
                      >
                        <svg className="w-4 h-4 text-blue-400 mr-3 group-hover:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Start Guide */}
      <section id="quick-start" className="py-24 bg-gray-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-black text-white mb-12 text-center">
            Quick Start <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">Guide</span>
          </h2>
          
          <div className="space-y-8">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-4">1</div>
                <h3 className="text-2xl font-bold text-white">Create Your Account</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Sign up for Fresh Mint and verify your email address. Start with paper trading to familiarize yourself with the platform.
              </p>
              <Link
                href="/auth/signup"
                className="inline-flex items-center text-green-400 hover:text-green-300 font-semibold"
              >
                Sign up now →
              </Link>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-4">2</div>
                <h3 className="text-2xl font-bold text-white">Configure Signal Sources</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Connect your Telegram and Discord accounts to start receiving trading signals. Configure filters to match your trading style.
              </p>
              <Link
                href="#signal-sources"
                className="inline-flex items-center text-blue-400 hover:text-blue-300 font-semibold"
              >
                Learn about signals →
              </Link>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-4">3</div>
                <h3 className="text-2xl font-bold text-white">Set Risk Parameters</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Configure your risk management settings including position sizes, stop-loss levels, and portfolio limits.
              </p>
              <Link
                href="#position-sizing"
                className="inline-flex items-center text-purple-400 hover:text-purple-300 font-semibold"
              >
                Setup risk management →
              </Link>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm mr-4">4</div>
                <h3 className="text-2xl font-bold text-white">Start Paper Trading</h3>
              </div>
              <p className="text-gray-300 mb-4">
                Test your configuration with paper trading. Monitor performance and refine your settings before going live.
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center text-yellow-400 hover:text-yellow-300 font-semibold"
              >
                Go to dashboard →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* API Documentation Preview */}
      <section id="api-auth" className="py-24 bg-gray-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-black text-white mb-12 text-center">
            API <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">Reference</span>
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* API Authentication */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Authentication</h3>
              <p className="text-gray-300 mb-6">
                All API requests require authentication using your API key in the Authorization header.
              </p>
              <div className="bg-gray-800 rounded-lg p-4 font-mono text-sm">
                <div className="text-gray-400 mb-2"># Example request</div>
                <div className="text-green-400">curl -X GET https://api.freshmint.trading/v1/account \\</div>
                <div className="text-blue-400 ml-4">-H &quot;Authorization: Bearer YOUR_API_KEY&quot;</div>
              </div>
            </div>

            {/* Trading Endpoints */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8">
              <h3 className="text-2xl font-bold text-white mb-6">Trading Endpoints</h3>
              <p className="text-gray-300 mb-6">
                Execute trades, manage positions, and access real-time market data through our REST API.
              </p>
              <div className="space-y-3 text-sm">
                <div className="flex items-center">
                  <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-mono mr-3">POST</span>
                  <span className="text-gray-300 font-mono">/v1/trades</span>
                </div>
                <div className="flex items-center">
                  <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-mono mr-3">GET</span>
                  <span className="text-gray-300 font-mono">/v1/positions</span>
                </div>
                <div className="flex items-center">
                  <span className="bg-purple-600 text-white px-2 py-1 rounded text-xs font-mono mr-3">GET</span>
                  <span className="text-gray-300 font-mono">/v1/signals</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-gray-900/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-black text-white mb-12 text-center">
            Frequently Asked <span className="bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">Questions</span>
          </h2>
          
          <div className="space-y-6">
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8">
              <h3 className="text-xl font-bold text-white mb-4">Is my money safe with Fresh Mint?</h3>
              <p className="text-gray-300">
                Fresh Mint is non-custodial, meaning you maintain full control of your private keys and funds. 
                We never have access to your wallet or funds - the bot operates with limited permissions that you control.
              </p>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8">
              <h3 className="text-xl font-bold text-white mb-4">How does paper trading work?</h3>
              <p className="text-gray-300">
                Paper trading simulates real market conditions without using actual funds. It&apos;s perfect for testing strategies, 
                learning the platform, and optimizing your settings before transitioning to live trading.
              </p>
            </div>

            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-8">
              <h3 className="text-xl font-bold text-white mb-4">What makes Fresh Mint different from other trading bots?</h3>
              <p className="text-gray-300">
                Fresh Mint combines advanced signal processing, MEV protection, comprehensive risk management, 
                and a serverless architecture for maximum reliability and performance in the fast-moving Solana ecosystem.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Support CTA */}
      <section className="py-24 bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-pink-900/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-black text-white mb-6">
            Need More Help?
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Our support team is here to help you succeed. Join our community or reach out directly.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              href="/support"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105"
            >
              Contact Support
            </Link>
            <a
              href="https://discord.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white border-2 border-gray-600 rounded-xl hover:border-blue-400 hover:bg-blue-400/10 transition-all duration-300"
            >
              Join Discord
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
