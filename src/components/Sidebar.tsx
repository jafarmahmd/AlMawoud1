import React, { useState } from 'react';
import { AppUser, Language } from '../types';
import { translations } from '../i18n';
import { INITIAL_CATEGORIES } from '../data';

interface SidebarProps {
  currentUser: AppUser;
  currentView: string;
  currentCategory: string | null;
  currentFirqa: string | null;
  pendingUsersCount: number;
  lang: Language;
  logo?: string;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  onNavigate: (view: string, category?: string | null, firqa?: string | null) => void;
  onLogout: () => void;
  mobileActive: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  currentView,
  currentCategory,
  currentFirqa,
  pendingUsersCount,
  lang,
  logo,
  collapsed = false,
  onToggleCollapse,
  onNavigate,
  onLogout,
  mobileActive,
  onCloseMobile,
}) => {
  const t = translations[lang];
  const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>({
    ashbal: false,
    kashaf: false,
    mutaqadem: false,
    jwal: false,
    afwaj: false,
  });

  const toggleCategoryMenu = (key: string) => {
    setExpandedKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isSupervisor =
    currentUser.role === 'supervisor_general' ||
    currentUser.permissions.canManageUsers;

  // Strict category isolation: Section leaders, troop leaders, and category treasurers only see their own category
  const rawCatList = [
    { name: 'أشبال', label: t.ashbal, icon: '◆', key: 'ashbal' },
    { name: 'كشاف', label: t.kashaf, icon: '★', key: 'kashaf' },
    { name: 'كشاف متقدم', label: t.mutaqadem, icon: '▲', key: 'mutaqadem' },
    { name: 'جوال', label: t.jwal, icon: '●', key: 'jwal' },
    { name: 'أفواج', label: t.afwaj, icon: '◈', key: 'afwaj' },
  ];

  const catList = currentUser.role === 'viewer'
    ? []
    : isSupervisor
    ? rawCatList
    : rawCatList.filter((cat) => {
        if (!currentUser.assignedCategory) return true;
        return currentUser.assignedCategory === cat.name;
      });

  const getRoleDisplayName = (user: AppUser) => {
    if (user.role === 'supervisor_general') {
      return t.role_supervisor_general;
    }
    if (user.role === 'viewer') {
      return lang === 'ar' ? 'رتبة المحجوب (لمحة الكشافة فقط)' : 'Restricted (Scout Overview Only)';
    }

    const scopeName = user.assignedFirqa || user.assignedCategory || '';

    // Check if full leader (members + activities + finances)
    if (
      user.permissions?.canManageMembers &&
      user.permissions?.canManageActivities &&
      user.permissions?.canManageFinances
    ) {
      return lang === 'ar' ? `👑 قائد ${scopeName} (كامل الصلاحيات)` : `Leader (${scopeName} - Full)`;
    }

    if (user.role === 'treasurer' || (user.permissions?.canManageFinances && !user.permissions?.canManageMembers && !user.permissions?.canManageActivities)) {
      return lang === 'ar' ? `💰 مسؤول صندوق ${scopeName}` : `Treasurer (${scopeName})`;
    }

    if (user.role === 'activities_lead' || (user.permissions?.canManageActivities && !user.permissions?.canManageMembers && !user.permissions?.canManageFinances)) {
      return lang === 'ar' ? `🎯 مسؤول أنشطة ${scopeName}` : `Activities Lead (${scopeName})`;
    }

    if (user.role === 'section_leader') {
      return lang === 'ar' ? `📋 إدارة ${scopeName} (أنشطة وأفراد)` : `Admin (${scopeName})`;
    }

    if (user.role === 'troop_leader') {
      return lang === 'ar' ? `⛺ مسؤول أفراد ${scopeName}` : `Members Lead (${scopeName})`;
    }

    return t.role_viewer;
  };

  return (
    <aside
      className={`sidebar ${mobileActive ? 'mobile-active' : ''} ${collapsed ? 'collapsed' : ''}`}
      id="sidebar"
      style={
        collapsed
          ? {
              width: '74px',
              minWidth: '74px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }
          : {
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }
      }
    >
      <div 
        className="sidebar-header"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: collapsed ? '1rem 0.5rem' : '1.25rem 1rem',
          cursor: isSupervisor ? 'pointer' : undefined,
        }}
        title={isSupervisor ? (lang === 'ar' ? 'انقر للذهاب إلى إدارة المستخدمين وشعار الموقع' : 'Click to manage users and site logo') : undefined}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            overflow: 'hidden',
          }}
          onClick={() => {
            if (isSupervisor) {
              onNavigate('users', null, null);
              onCloseMobile();
            }
          }}
        >
          <img
            src={logo || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'%3E%3Ccircle cx='100' cy='100' r='90' fill='white'/%3E%3Cpath d='M100 40 L120 80 L160 80 L130 104 L140 140 L100 116 L60 140 L70 104 L40 80 L80 80 Z' fill='%234CAF50'/%3E%3C/svg%3E"}
            className="sidebar-logo"
            alt="الشعار"
            style={{
              objectFit: 'contain',
              width: collapsed ? '38px' : '44px',
              height: collapsed ? '38px' : '44px',
            }}
          />
          {!collapsed && <div className="sidebar-title">{t.appTitle}</div>}
        </div>

        {/* Sidebar Collapse / Expand Toggle Button */}
        {onToggleCollapse && (
          <button
            type="button"
            className="sidebar-toggle-btn"
            onClick={(e) => {
              e.stopPropagation();
              onToggleCollapse();
            }}
            title={
              collapsed
                ? lang === 'ar'
                  ? 'تمديد القائمة الجانبية'
                  : 'Expand sidebar'
                : lang === 'ar'
                ? 'طي / تصغير القائمة الجانبية'
                : 'Collapse sidebar'
            }
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              padding: '6px 8px',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s',
            }}
          >
            {collapsed ? '▶' : '◀'}
          </button>
        )}
      </div>

      {!collapsed && (
        <div className="user-info">
          <div className="user-info-name" id="currentUserName">
            {currentUser.fullName}
          </div>
          <div className="user-info-role" id="currentUserRole">
            <span>🛡️</span>
            <span>{getRoleDisplayName(currentUser)}</span>
          </div>
        </div>
      )}

      <nav className="nav-menu" id="navMenu">
        {/* Dashboard - Visible only for supervisors or if granted overview */}
        <div
          className={`nav-item ${
            currentView === 'dashboard' && !currentCategory ? 'active' : ''
          }`}
          title={collapsed ? (currentUser.role === 'viewer' ? (lang === 'ar' ? 'لمحة الكشافة' : 'Scout Overview') : t.dashboard) : undefined}
          style={collapsed ? { justifyContent: 'center', padding: '0.8rem 0' } : undefined}
          onClick={() => {
            onNavigate('dashboard', null, null);
            onCloseMobile();
          }}
        >
          <span className="nav-icon">{currentUser.role === 'viewer' ? '🏕️' : '■'}</span>
          {!collapsed && (
            <span>
              {currentUser.role === 'viewer'
                ? lang === 'ar'
                  ? 'لمحة الكشافة ورسالة الجمعية'
                  : 'Scout Overview'
                : t.dashboard}
            </span>
          )}
        </div>

        {/* Categories Section - Only visible if there are accessible categories */}
        {!collapsed && catList.length > 0 && (
          <div className="nav-section-title">{t.categoriesTitle}</div>
        )}

        {catList.map((cat) => {
          const catData = INITIAL_CATEGORIES[cat.name];
          const hasFiraq = catData && catData.firaq.length > 0;
          const isExpanded = !!expandedKeys[cat.key];
          const isCatActive = currentCategory === cat.name;

          // Filter firaq if troop leader has specific assigned firqa
          const accessibleFiraq =
            currentUser.role === 'troop_leader' && currentUser.assignedFirqa
              ? catData.firaq.filter((f) => f === currentUser.assignedFirqa)
              : catData.firaq;

          if (hasFiraq && !collapsed) {
            return (
              <div key={cat.key}>
                <div
                  className={`nav-category-toggle ${
                    isCatActive && !currentFirqa ? 'active' : ''
                  } ${isExpanded ? 'expanded' : ''}`}
                  onClick={() => toggleCategoryMenu(cat.key)}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                    }}
                  >
                    <span className="nav-icon">{cat.icon}</span>
                    <span>{cat.label}</span>
                  </div>
                  <span className="toggle-arrow">
                    {isExpanded ? '▼' : lang === 'ar' ? '◄' : '►'}
                  </span>
                </div>

                <div
                  className={`nav-sub-menu ${isExpanded ? 'expanded' : ''}`}
                  id={`submenu-${cat.key}`}
                >
                  {/* Category overview accessible by supervisor, section leader, treasurer, activities lead */}
                  {currentUser.role !== 'troop_leader' && (
                    <div
                      className={`nav-sub-item ${
                        isCatActive && !currentFirqa ? 'active' : ''
                      }`}
                      onClick={() => {
                        onNavigate('category', cat.name, null);
                        onCloseMobile();
                      }}
                    >
                      <span>⊙</span>
                      <span>{t.overview}</span>
                    </div>
                  )}

                  {accessibleFiraq.map((f) => (
                    <div
                      key={f}
                      className={`nav-sub-item ${
                        isCatActive && currentFirqa === f ? 'active' : ''
                      }`}
                      onClick={() => {
                        onNavigate('firqa', cat.name, f);
                        onCloseMobile();
                      }}
                    >
                      <span>-</span>
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          } else {
            return (
              <div
                key={cat.key}
                className={`nav-item ${isCatActive ? 'active' : ''}`}
                title={collapsed ? cat.label : undefined}
                style={collapsed ? { justifyContent: 'center', padding: '0.8rem 0' } : undefined}
                onClick={() => {
                  onNavigate('category', cat.name, null);
                  onCloseMobile();
                }}
              >
                <span className="nav-icon">{cat.icon}</span>
                {!collapsed && <span>{cat.label}</span>}
              </div>
            );
          }
        })}

        {/* Central Administration (Exclusively General Supervisor) */}
        {isSupervisor && (
          <>
            {!collapsed && (
              <div className="nav-section-title">
                {lang === 'ar' ? 'الإدارة المركزية' : 'Central Administration'}
              </div>
            )}
            <div
              className={`nav-item ${
                currentView === 'users' ? 'active' : ''
              }`}
              id="navUserManagement"
              title={collapsed ? t.userManagement : undefined}
              style={collapsed ? { justifyContent: 'center', padding: '0.8rem 0' } : { position: 'relative' }}
              onClick={() => {
                onNavigate('users', null, null);
                onCloseMobile();
              }}
            >
              <span className="nav-icon">⚙️</span>
              {!collapsed && <span style={{ flex: 1 }}>{t.userManagement}</span>}
              {pendingUsersCount > 0 && (
                <span
                  style={{
                    background: 'var(--accent-red)',
                    color: 'white',
                    fontSize: '0.72rem',
                    fontWeight: 900,
                    padding: collapsed ? '2px 4px' : '2px 8px',
                    borderRadius: '12px',
                    position: collapsed ? 'absolute' : 'static',
                    top: collapsed ? '4px' : undefined,
                    right: collapsed ? '4px' : undefined,
                  }}
                >
                  {pendingUsersCount} {!collapsed && (lang === 'ar' ? 'طلب' : 'new')}
                </span>
              )}
            </div>
          </>
        )}
      </nav>

      <div className="sidebar-footer" style={collapsed ? { padding: '0.5rem' } : undefined}>
        <button
          className="btn btn-secondary"
          id="btnLogout"
          style={{ width: '100%', padding: collapsed ? '8px 4px' : undefined }}
          title={t.logout}
          onClick={onLogout}
        >
          {collapsed ? '🚪' : t.logout}
        </button>
      </div>
    </aside>
  );
};
