import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import './AccountMenu.css';

const AccountMenu = ({ currentUser, onOpenUserSelector, onOpenSettings, onLogOut }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef(null);

  const getUserInitials = useCallback((name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogOut = () => {
    setIsOpen(false);
    onLogOut();
  };

  const handleOpenUserSelector = () => {
    setIsOpen(false);
    onOpenUserSelector();
  };

  const handleOpenSettings = () => {
    setIsOpen(false);
    onOpenSettings();
  };

  return (
    <div className="account-menu" ref={dropdownRef}>
      <button
        type="button"
        className="account-menu-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={currentUser ? 'Account options' : 'Sign in'}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {currentUser ? (
          <span className="account-avatar">{getUserInitials(currentUser.name)}</span>
        ) : (
          <svg className="account-icon" viewBox="0 0 24 24" width="24" height="24" aria-hidden>
            <path
              d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
              fill="currentColor"
            />
          </svg>
        )}
      </button>

      {isOpen && (
        <div className="account-menu-dropdown">
          {currentUser ? (
            <>
              <div className="account-menu-header">
                <span className="account-menu-name">{currentUser.name}</span>
                <span className="account-menu-label">Signed in</span>
              </div>
              <div className="account-menu-divider" />
              <button
                type="button"
                className="account-menu-item"
                onClick={handleOpenUserSelector}
              >
                <svg className="account-menu-item-icon" viewBox="0 0 24 24" width="18" height="18">
                  <path
                    d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
                Switch account
              </button>
              <button
                type="button"
                className="account-menu-item"
                onClick={handleOpenSettings}
              >
                <svg className="account-menu-item-icon" viewBox="0 0 24 24" width="18" height="18">
                  <path
                    d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"
                    fill="currentColor"
                  />
                </svg>
                Settings
              </button>
              <button
                type="button"
                className="account-menu-item account-menu-item-logout"
                onClick={handleLogOut}
              >
                <svg className="account-menu-item-icon" viewBox="0 0 24 24" width="18" height="18">
                  <path
                    d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"
                    fill="currentColor"
                  />
                </svg>
                Log out
              </button>
            </>
          ) : (
            <button
              type="button"
              className="account-menu-item account-menu-item-signin"
              onClick={handleOpenUserSelector}
            >
              <svg className="account-menu-item-icon" viewBox="0 0 24 24" width="18" height="18">
                <path
                  d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                  fill="currentColor"
                />
              </svg>
              Sign in
            </button>
          )}
        </div>
      )}
    </div>
  );
};

AccountMenu.propTypes = {
  currentUser: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
  }),
  onOpenUserSelector: PropTypes.func.isRequired,
  onOpenSettings: PropTypes.func.isRequired,
  onLogOut: PropTypes.func.isRequired
};

export default AccountMenu;
