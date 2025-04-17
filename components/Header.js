import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import ProfileModal from './ProfileModal';

export default function Header() {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  return (
    <header className="bg-white shadow-sm">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-pink-500">
              ScriptSea
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-6">
            {user ? (
              <>
                <Link href="/pricing" className="text-gray-700 hover:text-gray-900">
                  Upgrade
                </Link>
                <Link href="/contact" className="text-gray-700 hover:text-gray-900">
                  Contact Us
                </Link>
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="text-gray-700 hover:text-gray-900"
                >
                  Profile
                </button>
              </>
            ) : (
              <>
                <Link href="/pricing" className="text-gray-700 hover:text-gray-900">
                  Pricing
                </Link>
                <Link href="/register" className="text-gray-700 hover:text-gray-900">
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-3">
            {user ? (
              <div className="flex flex-col space-y-2">
                <Link href="/pricing" className="text-gray-700 hover:text-gray-900 px-3 py-2">
                  Upgrade
                </Link>
                <Link href="/contact" className="text-gray-700 hover:text-gray-900 px-3 py-2">
                  Contact Us
                </Link>
                <button
                  onClick={() => {
                    setShowProfileModal(true);
                    setIsMenuOpen(false);
                  }}
                  className="text-left text-gray-700 hover:text-gray-900 px-3 py-2"
                >
                  Profile
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2">
                <Link href="/pricing" className="text-gray-700 hover:text-gray-900 px-3 py-2">
                  Pricing
                </Link>
                <Link href="/register" className="text-gray-700 hover:text-gray-900 px-3 py-2">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileModal
          show={showProfileModal}
          onClose={() => setShowProfileModal(false)}
        />
      )}
    </header>
  );
} 