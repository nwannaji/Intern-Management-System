import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const internLinks = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/my-applications', label: 'My Applications' },
    { to: '/attendance', label: 'Attendance' },
    { to: '/leave', label: 'Leave' },
    { to: '/tasks', label: 'Tasks' },
    { to: '/reviews', label: 'Reviews' },
  ];

  const supervisorLinks = [
    { to: '/supervisor', label: 'Dashboard' },
    { to: '/tasks', label: 'Tasks' },
    { to: '/reviews', label: 'Reviews' },
    { to: '/attendance', label: 'Attendance' },
    { to: '/leave', label: 'Leave' },
  ];

  const adminLinks = [
    { to: '/admin', label: 'Dashboard' },
    { to: '/admin/users', label: 'Users' },
    { to: '/programs', label: 'Programs' },
    { to: '/admin/reports', label: 'Reports' },
    { to: '/qr-kiosk', label: 'QR Kiosk' },
  ];

  const links = user?.role === 'admin' ? adminLinks
    : user?.role === 'supervisor' ? supervisorLinks
    : internLinks;

  const isActive = (to) => location.pathname === to;

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden p-1 text-gray-400 hover:text-gray-600 transition"
        aria-label="Toggle menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {mobileOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Desktop nav */}
      <nav className="hidden md:flex items-center gap-1">
        {links.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className={`px-3 py-2 rounded-md text-sm font-medium transition ${
              isActive(link.to)
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="absolute top-14 left-0 right-0 bg-white shadow-lg border-b border-gray-200 md:hidden z-50">
          <nav className="flex flex-col p-4 gap-1">
            {links.map(link => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition ${
                  isActive(link.to)
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  );
};

export default Navbar;