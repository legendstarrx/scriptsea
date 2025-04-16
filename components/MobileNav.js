import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const MobileNav = ({ isMenuOpen, setIsMenuOpen, handleLogout }) => {
  const router = useRouter();

  const navigationItems = [
    {
      name: 'Generate',
      path: '/generate',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
        </svg>
      ),
    },
    {
      name: 'Subscription',
      path: '/subscription',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/>
          <path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/>
          <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z"/>
        </svg>
      ),
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      ),
    },
  ];

  return (
    <>
      <div className="mobile-nav">
        <div className="mobile-header">
          <Link href="/" style={{
            fontSize: '1.25rem',
            fontWeight: 'bold',
            color: '#FF3366',
            textDecoration: 'none'
          }}>ScriptSea</Link>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="menu-button">
            {isMenuOpen ? 'Close' : 'Menu'}
          </button>
        </div>
        
        <nav className={`nav-menu ${isMenuOpen ? 'open' : ''}`}>
          <ul>
            {navigationItems.map((item) => (
              <li key={item.name}>
                <button
                  onClick={() => {
                    router.push(item.path);
                    setIsMenuOpen(false);
                  }}
                  className={router.pathname === item.path ? 'active' : ''}
                >
                  <span className="icon">{item.icon}</span>
                  <span>{item.name}</span>
                </button>
              </li>
            ))}
          </ul>
          
          <button onClick={handleLogout} className="logout-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Logout
          </button>
        </nav>
      </div>

      <style jsx>{`
        .mobile-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 50;
          background: white;
        }

        .mobile-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 1px solid #eee;
        }

        .logo {
          font-size: 1.25rem;
          font-weight: bold;
          color: #FF3366;
          text-decoration: none;
        }

        .menu-button {
          background: none;
          border: none;
          padding: 0.5rem;
          cursor: pointer;
          color: #666;
        }

        .nav-menu {
          position: fixed;
          top: 60px;
          left: 0;
          right: 0;
          bottom: 0;
          background: white;
          padding: 1rem;
          transform: translateX(-100%);
          transition: transform 0.3s ease;
        }

        .nav-menu.open {
          transform: translateX(0);
        }

        ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        li {
          margin-bottom: 0.5rem;
        }

        button {
          width: 100%;
          padding: 0.75rem 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: none;
          border: none;
          border-radius: 0.5rem;
          color: #4b5563;
          cursor: pointer;
          font-size: 0.9rem;
        }

        button:hover {
          background: #f3f4f6;
        }

        button.active {
          background: #f3f4f6;
          color: #2563eb;
          font-weight: 600;
        }

        .icon {
          opacity: 0.8;
        }

        .logout-button {
          margin-top: 1rem;
          background: #fee2e2;
          color: #dc2626;
        }

        .logout-button:hover {
          background: #fecaca;
        }

        @media (min-width: 769px) {
          .mobile-nav {
            display: none;
          }
        }
      `}</style>
    </>
  );
};

export default MobileNav; 