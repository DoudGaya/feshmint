'use client';

import { useState } from 'react';
import { Check, X, Zap, Shield, TrendingUp, Bot } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: 49,
    period: 'month',
    description: 'Perfect for beginners getting started with crypto trading',
    features: [
      'Up to $1,000 portfolio cap',
      'Basic trading signals',
      'Email notifications',
      'Simple risk management',
      'Community support',
      '24/7 monitoring'
    ],
    limitations: [
      'No advanced MEV protection',
      'Limited to 10 trades/day',
      'No custom strategies'
    ],
    popular: false,
    color: 'blue'
  },
  {
    name: 'Professional',
    price: 149,
    period: 'month',
    description: 'Advanced features for serious traders',
    features: [
      'Up to $10,000 portfolio cap',
      'Advanced trading signals',
      'Real-time notifications',
      'Advanced risk management',
      'Priority support',
      '24/7 monitoring',
      'MEV protection',
      'Custom risk parameters',
      'Telegram & Discord integration',
      'Advanced analytics'
    ],
    limitations: [
      'No custom strategies',
      'Limited to 100 trades/day'
    ],
    popular: true,
    color: 'emerald'
  },
  {
    name: 'Enterprise',
    price: 399,
    period: 'month',
    description: 'Full-featured solution for professional traders',
    features: [
      'Unlimited portfolio cap',
      'Premium trading signals',
      'Multi-channel notifications',
      'Enterprise risk management',
      'Dedicated support',
      '24/7 monitoring',
      'MEV protection',
      'Custom strategies',
      'White-label options',
      'API access',
      'Custom integrations',
      'Advanced reporting'
    ],
    limitations: [],
    popular: false,
    color: 'purple'
  }
];

const faqs = [
  {
    question: 'How does the trading bot work?',
    answer: 'Fresh Mint uses advanced algorithms to monitor crypto markets 24/7, identifying profitable trading opportunities and executing trades based on your risk parameters.'
  },
  {
    question: 'Is my money safe?',
    answer: 'Your funds remain in your own wallet. We never hold your assets. The bot only has permission to execute trades based on your predefined settings.'
  },
  {
    question: 'What makes Fresh Mint different?',
    answer: 'We focus on MEV protection, advanced risk management, and transparent performance tracking. Our bot is designed to protect your capital while maximizing returns.'
  },
  {
    question: 'Can I cancel anytime?',
    answer: 'Yes, you can cancel your subscription at any time. There are no long-term contracts or cancellation fees.'
  },
  {
    question: 'Do you offer refunds?',
    answer: 'We offer a 7-day money-back guarantee for all plans. If you\'re not satisfied, contact us for a full refund.'
  }
];

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const getPrice = (monthlyPrice: number) => {
    if (billingPeriod === 'yearly') {
      return Math.floor(monthlyPrice * 12 * 0.8); // 20% discount for yearly
    }
    return monthlyPrice;
  };

  const getPeriodText = () => {
    return billingPeriod === 'yearly' ? 'year' : 'month';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Simple, Transparent
            <span className="bg-gradient-to-r from-emerald-500 to-blue-600 bg-clip-text text-transparent"> Pricing</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Choose the perfect plan for your trading journey. Start small, scale as you grow.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center mb-12">
            <span className={`mr-3 ${billingPeriod === 'monthly' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
              className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingPeriod === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`ml-3 ${billingPeriod === 'yearly' ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
              Yearly
            </span>
            {billingPeriod === 'yearly' && (
              <span className="ml-2 bg-emerald-100 text-emerald-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                Save 20%
              </span>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border-2 p-8 ${
                plan.popular
                  ? 'border-emerald-500 ring-2 ring-emerald-200'
                  : 'border-gray-200'
              } bg-white shadow-lg hover:shadow-xl transition-all duration-200`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-emerald-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <div className="flex items-center justify-center">
                  <span className="text-4xl font-bold text-gray-900">${getPrice(plan.price)}</span>
                  <span className="text-gray-600 ml-2">/{getPeriodText()}</span>
                </div>
                {billingPeriod === 'yearly' && (
                  <p className="text-sm text-emerald-600 mt-1">
                    ${plan.price}/month billed annually
                  </p>
                )}
              </div>

              <div className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <div key={featureIndex} className="flex items-center">
                    <Check className="h-5 w-5 text-emerald-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
                {plan.limitations.map((limitation, limitationIndex) => (
                  <div key={limitationIndex} className="flex items-center">
                    <X className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                    <span className="text-gray-500 line-through">{limitation}</span>
                  </div>
                ))}
              </div>

              <button
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  plan.popular
                    ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}
              >
                Get Started
              </button>
            </div>
          ))}
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why Choose Fresh Mint?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bot className="h-8 w-8 text-emerald-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Automated Trading</h3>
              <p className="text-gray-600">24/7 monitoring and execution without manual intervention</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">MEV Protection</h3>
              <p className="text-gray-600">Advanced protection against front-running and sandwich attacks</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Risk Management</h3>
              <p className="text-gray-600">Sophisticated algorithms to protect your capital</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Lightning Fast</h3>
              <p className="text-gray-600">Execute trades in milliseconds to capture opportunities</p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="border border-gray-200 rounded-lg">
                <button
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50"
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                >
                  <span className="font-medium text-gray-900">{faq.question}</span>
                  <span className="ml-6 flex-shrink-0">
                    {openFaq === index ? (
                      <X className="h-5 w-5 text-gray-500" />
                    ) : (
                      <span className="text-gray-500">+</span>
                    )}
                  </span>
                </button>
                {openFaq === index && (
                  <div className="px-6 pb-4">
                    <p className="text-gray-600">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Start Trading Smarter?
          </h2>
          <p className="text-emerald-100 text-lg mb-8">
            Join thousands of traders who trust Fresh Mint with their investments
          </p>
          <button className="bg-white text-emerald-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
            Start Your Free Trial
          </button>
        </div>
      </div>
    </div>
  );
}
