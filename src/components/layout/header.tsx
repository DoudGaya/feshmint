"use client";

import Link from "next/link";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { data: session } = useSession();

  return (
    <header className="fixed top-0 w-full z-50 bg-gray-900/95 backdrop-blur-md border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">FM</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              Fresh Mint
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/features" 
              className="text-gray-300 hover:text-white transition-colors font-medium"
            >
              Features
            </Link>
            <Link 
              href="/documentation" 
              className="text-gray-300 hover:text-white transition-colors font-medium"
            >
              Documentation
            </Link>
            <Link 
              href="/pricing" 
              className="text-gray-300 hover:text-white transition-colors font-medium"
            >
              Pricing
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {session ? (
              <div className="flex items-center space-x-4">
                <Link 
                  href="/dashboard"
                  className="text-gray-300 hover:text-white transition-colors font-medium"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut()}
                  className="text-gray-300 hover:text-white transition-colors font-medium"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <Link 
                  href="/auth/signin"
                  className="text-gray-300 hover:text-white transition-colors font-medium"
                >
                  Sign In
                </Link>
                <Link 
                  href="/auth/signup"
                  className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-300 hover:text-white"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-800 rounded-lg mt-2">
              <Link 
                href="/features" 
                className="block px-3 py-2 text-gray-300 hover:text-white transition-colors font-medium"
              >
                Features
              </Link>
              <Link 
                href="/documentation" 
                className="block px-3 py-2 text-gray-300 hover:text-white transition-colors font-medium"
              >
                Documentation
              </Link>
              <Link 
                href="/pricing" 
                className="block px-3 py-2 text-gray-300 hover:text-white transition-colors font-medium"
              >
                Pricing
              </Link>
              <div className="border-t border-gray-700 pt-2">
                {session ? (
                  <>
                    <Link 
                      href="/dashboard"
                      className="block px-3 py-2 text-gray-300 hover:text-white transition-colors font-medium"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={() => signOut()}
                      className="block w-full text-left px-3 py-2 text-gray-300 hover:text-white transition-colors font-medium"
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      href="/auth/signin"
                      className="block px-3 py-2 text-gray-300 hover:text-white transition-colors font-medium"
                    >
                      Sign In
                    </Link>
                    <Link 
                      href="/auth/signup"
                      className="block mx-3 my-2 bg-gradient-to-r from-green-500 to-blue-600 text-white px-4 py-2 rounded-lg font-semibold text-center"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
