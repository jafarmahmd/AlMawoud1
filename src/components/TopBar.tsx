import React, { useState, useRef, useEffect } from 'react';
import { AppNotification, Language } from '../types';
import { translations } from '../i18n';

interface TopBarProps {
  pageTitle: string;
  lang: Language;
  onToggleLang: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  notifications: AppNotification[];
  onMarkNotificationsRead: () => void;
  onToggleSidebar: () => void;
  showQuickAdd: boolean;
  onQuickAdd: () => void;
  onLogout?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  pageTitle,
  lang,
  onToggleLang,
  darkMode,
  onToggleDarkMode,
  notifications,
  onMarkNotificationsRead,
  onToggleSidebar,
  showQuickAdd,
  onQuickAdd,
  onLogout,
}) => {
  const t = translations[lang];
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="top-bar" id="topBar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          className="mobile-menu-btn"
          id="btnMobileMenu"
          onClick={onToggleSidebar}
          title="القائمة"
        >
          ☰
        </button>
        <h1 className="top-bar-title" id="pageTitle">
          {pageTitle}
        </h1>
      </div>

      <div className="top-bar-actions" id="topBarActions">
        {/* Quick Add Button */}
        {showQuickAdd && (
          <button
            className="btn btn-primary btn-small"
            id="quickAddBtn"
            onClick={onQuickAdd}
          >
            + {t.quickAddMember}
          </button>
        )}

        {/* Multi-language Support Toggle (Requirement 5) */}
        <button
          className="icon-button"
          id="btnToggleLang"
          onClick={onToggleLang}
          title={t.language}
        >
          <span>🌐</span>
          <span>{lang === 'ar' ? 'English' : 'العربية'}</span>
        </button>

        {/* Dark Mode Toggle (Requirement 5) */}
        <button
          className="icon-button"
          id="btnToggleDarkMode"
          onClick={onToggleDarkMode}
          title={darkMode ? t.lightMode : t.darkMode}
        >
          <span>{darkMode ? '☀️' : '🌙'}</span>
          <span>{darkMode ? t.lightMode : t.darkMode}</span>
        </button>

        {/* Instant Notification System (Requirement 4) */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            className="icon-button"
            id="btnNotificationBell"
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            title={t.notifications}
          >
            <span>🔔</span>
            <span>{t.notifications}</span>
            {unreadCount > 0 && (
              <span className="icon-badge" id="unreadBadge">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="notification-dropdown" id="notificationDropdown">
              <div className="notification-dropdown-header">
                <span>{t.notifications} ({notifications.length})</span>
                {unreadCount > 0 && (
                  <button
                    style={{
                      background: 'rgba(255,255,255,0.2)',
                      border: 'none',
                      color: 'white',
                      fontSize: '0.78rem',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontFamily: 'Cairo, sans-serif',
                      fontWeight: 700,
                    }}
                    onClick={() => {
                      onMarkNotificationsRead();
                    }}
                  >
                    {t.markAllRead}
                  </button>
                )}
              </div>

              <div style={{ maxHeight: '350px', overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div
                    style={{
                      padding: '2rem 1rem',
                      textAlign: 'center',
                      color: 'var(--text-light)',
                      fontSize: '0.9rem',
                    }}
                  >
                    {t.noNotifications}
                  </div>
                ) : (
                  notifications.map((n) => {
                    const getIcon = () => {
                      switch (n.type) {
                        case 'approval':
                          return '✅';
                        case 'registration':
                          return '📝';
                        case 'financial':
                          return '💰';
                        case 'activity':
                          return '🏕️';
                        default:
                          return '📢';
                      }
                    };

                    return (
                      <div
                        key={n.id}
                        className={`notification-item ${!n.read ? 'unread' : ''}`}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '0.25rem',
                            gap: '0.5rem',
                          }}
                        >
                          <strong
                            style={{
                              fontSize: '0.9rem',
                              color:
                                n.type === 'approval'
                                  ? 'var(--dark-green)'
                                  : n.type === 'financial'
                                  ? '#1565c0'
                                  : 'var(--text-dark)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                            }}
                          >
                            <span>{getIcon()}</span>
                            <span>{n.title}</span>
                          </strong>
                          <span
                            style={{
                              fontSize: '0.72rem',
                              color: 'var(--text-light)',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {new Date(n.createdAt).toLocaleTimeString(
                              lang === 'ar' ? 'ar-IQ' : 'en-US',
                              { hour: '2-digit', minute: '2-digit' }
                            )}
                          </span>
                        </div>
                        <p
                          style={{
                            fontSize: '0.83rem',
                            color: 'var(--text-light)',
                            lineHeight: '1.4',
                            margin: '0.2rem 0',
                          }}
                        >
                          {n.message}
                        </p>
                        <div
                          style={{
                            fontSize: '0.7rem',
                            color: 'var(--primary-green)',
                            fontWeight: 700,
                            marginTop: '0.2rem',
                          }}
                        >
                          {t.broadcastNotifTag}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Quick Logout Button */}
        {onLogout && (
          <button
            className="icon-button"
            id="btnTopBarLogout"
            onClick={onLogout}
            title={t.logout}
            style={{
              color: 'var(--accent-red, #e53935)',
              borderColor: 'rgba(229, 57, 53, 0.3)',
            }}
          >
            <span>🚪</span>
            <span>{t.logout}</span>
          </button>
        )}
      </div>
    </div>
  );
};
