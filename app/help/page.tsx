'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MessageCircle, Book, Mail, Phone, ExternalLink } from 'lucide-react';

export default function HelpPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Help & Support</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Quick Help */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">How can we help you?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
            >
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Live Chat</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Chat with our support team</p>
              </div>
            </button>

            <button
              className="flex items-start gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
            >
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center flex-shrink-0">
                <Book className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Documentation</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Browse our help articles</p>
              </div>
            </button>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <h2 className="text-xl font-bold text-white">Contact Us</h2>
            <p className="text-white/90 text-sm mt-1">We're here to help 24/7</p>
          </div>
          <div className="p-6 space-y-4">
            <a
              href="mailto:support@medaskca.com"
              className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <Mail className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">Email Support</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">support@medaskca.com</p>
              </div>
              <ExternalLink className="w-5 h-5 text-gray-400" />
            </a>

            <a
              href="tel:+441234567890"
              className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center">
                <Phone className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white">Phone Support</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">+44 123 456 7890</p>
              </div>
              <ExternalLink className="w-5 h-5 text-gray-400" />
            </a>
          </div>
        </div>

        {/* FAQs */}
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">How do I use TOM AI voice mode?</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Click the floating voice button on mobile or the voice icon in the chat interface. TOM will start listening to your voice commands.</p>
            </div>
            <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Can I access TOM offline?</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">TOM requires an internet connection to provide real-time theatre operations management and AI assistance.</p>
            </div>
            <div className="pb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">How do I manage my schedule?</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Navigate to the Schedule section from the main menu to view and manage your theatre schedules.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 px-4 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>TOM by MEDASKCA</p>
          <p className="mt-1">Theatre Operations Manager for NHS Trusts</p>
        </div>
      </div>
    </div>
  );
}
