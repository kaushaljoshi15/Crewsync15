'use client'

import { useState } from 'react'
import { Calendar, Users, Clock, CheckCircle, ArrowRight, Star } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const [isDarkMode, setIsDarkMode] = useState(false)

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    document.documentElement.classList.toggle('dark')
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      {/* Header */}
      {/* Remove: <Header /> */}

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-indigo-100 dark:from-slate-800 dark:to-slate-900 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
              Volunteer Coordination
              <span className="text-primary-600 dark:text-primary-400"> Made Simple</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Efficiently manage student volunteers across sessions, duties, and time slots during large events. 
              Create shift schedules, assign duties, and track attendance in real-time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/register"
                className="btn btn-primary btn-lg"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Everything you need to manage volunteers
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Powerful features designed for event organizers and volunteers
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Organizer Dashboard */}
            <div className="card p-6">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
                  <Calendar className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="ml-3 text-xl font-semibold text-gray-900 dark:text-white">
                  Organizer Dashboard
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Create and manage events, add volunteer roles, create time slots, assign volunteers, 
                and track attendance with comprehensive statistics.
              </p>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-success-500 mr-2" />
                  Create shift schedules
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-success-500 mr-2" />
                  Assign duties and roles
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-success-500 mr-2" />
                  Track attendance in real-time
                </li>
              </ul>
            </div>

            {/* Volunteer Panel */}
            <div className="card p-6">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-success-100 dark:bg-success-900 rounded-lg">
                  <Users className="h-6 w-6 text-success-600 dark:text-success-400" />
                </div>
                <h3 className="ml-3 text-xl font-semibold text-gray-900 dark:text-white">
                  Volunteer Panel
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Personalized shift lists, task details, notifications, and the ability to mark 
                availability or request changes.
              </p>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-success-500 mr-2" />
                  View personalized shifts
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-success-500 mr-2" />
                  Get real-time notifications
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-success-500 mr-2" />
                  Mark availability status
                </li>
              </ul>
            </div>

            {/* Real-time Updates */}
            <div className="card p-6">
              <div className="flex items-center mb-4">
                <div className="p-3 bg-warning-100 dark:bg-warning-900 rounded-lg">
                  <Clock className="h-6 w-6 text-warning-600 dark:text-warning-400" />
                </div>
                <h3 className="ml-3 text-xl font-semibold text-gray-900 dark:text-white">
                  Real-time Updates
                </h3>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Instant notifications, live attendance tracking, and seamless communication 
                between organizers and volunteers.
              </p>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-success-500 mr-2" />
                  Live attendance tracking
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-success-500 mr-2" />
                  Instant notifications
                </li>
                <li className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-success-500 mr-2" />
                  Seamless communication
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600 dark:bg-primary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to streamline your volunteer management?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of event organizers who trust CrewSync for their volunteer coordination needs.
          </p>
          <Link
            href="/auth/register"
            className="btn bg-white text-primary-600 hover:bg-gray-100 btn-lg"
          >
            Start Managing Volunteers Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-slate-950 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold text-primary-400 mb-4">CrewSync</h3>
              <p className="text-gray-400">
                Making volunteer coordination simple, efficient, and reliable.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Start</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Getting Started Guide</li>
                <li>Setup Your First Event</li>
                <li>Add Volunteers</li>
                <li>Track Attendance</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Help & Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Quick Setup Guide</li>
                <li>Video Tutorials</li>
                <li>Live Chat Support</li>
                <li>FAQ</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Best Practices</li>
                <li>Event Templates</li>
                <li>Tips & Tricks</li>
                <li>Contact Us</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CrewSync. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
} 