import React, { useState } from 'react';
import { Member, Payment, Activity, Language, AppUser } from '../types';
import { translations } from '../i18n';
import { INITIAL_CATEGORIES } from '../data';
import { findPresetForUser } from '../lib/roles';

interface DashboardViewProps {
  members: Member[];
  payments: Payment[];
  activities: Activity[];
  currentUser: AppUser;
  lang: Language;
  onSelectCategory: (catName: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  members,
  payments,
  activities,
  currentUser,
  lang,
  onSelectCategory,
}) => {
  const t = translations[lang];
  const userPreset = findPresetForUser(currentUser);
  const [copiedLink, setCopiedLink] = useState(false);

  // Link to Scout Association official Facebook page
  const scoutPageUrl = 'https://www.facebook.com/share/17vaxToxvv/';

  // Role 5: Viewer is strictly forbidden from seeing the treasury or revenue!
  const canSeeFinances =
    currentUser.role !== 'viewer' &&
    (currentUser.role === 'supervisor_general' ||
      currentUser.role === 'treasurer' ||
      currentUser.permissions?.canViewFinances ||
      currentUser.permissions?.canManageFinances);

  const totalRev = payments.reduce((sum, p) => sum + (parseFloat(p.amount as string) || 0), 0);

  const getCategoryMembers = (cat: string) => members.filter((m) => m.category === cat);
  const getCategoryPayments = (cat: string) => {
    const memIds = getCategoryMembers(cat).map((m) => m.id);
    return payments.filter((p) => memIds.includes(p.memberId));
  };
  const getCategoryRev = (cat: string) => {
    return getCategoryPayments(cat).reduce(
      (sum, p) => sum + (parseFloat(p.amount as string) || 0),
      0
    );
  };
  const getCategoryActivities = (cat: string) => {
    return activities.filter((a) => a.category === cat || a.category === 'الجميع');
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div>
      {/* Category Banner with Welcome */}
      <div className="category-banner default">
        <h1>⚜️ {lang === 'ar' ? 'بوابة جمعية كشافة الموعود (عج)' : 'Al-Mawood Scout Association'}</h1>
        <p>
          {lang === 'ar'
            ? 'أهلاً وسهلاً بالقادة والأعضاء في المنظومة الإدارية والكشفية الموحدة'
            : 'Welcome leaders and members to the unified scout management portal'}
        </p>
      </div>

      {/* User Active Role & Permissions Status Bar */}
      <div
        id="userRoleStatusBar"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '1.1rem 1.4rem',
          marginBottom: '1.5rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          boxShadow: 'var(--shadow-sm)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.2rem',
            }}
          >
            ⚜️
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--text-main)' }}>
              {lang === 'ar' ? 'مرحباً بك القائد:' : 'Welcome Leader:'} {currentUser.fullName}
            </div>
            <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{userPreset.labelAr}</span>
              {currentUser.assignedCategory && (
                <span style={{ margin: '0 6px' }}>• الفئة: {currentUser.assignedCategory}</span>
              )}
              {currentUser.assignedFirqa && (
                <span style={{ margin: '0 6px' }}>• الفرقة: {currentUser.assignedFirqa}</span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {currentUser.role === 'supervisor_general' ? (
            <span className="badge badge-afwaj">👑 كامل الصلاحيات والتحكم المركزي</span>
          ) : currentUser.role === 'viewer' ? (
            <span className="badge badge-warning">🛡️ {lang === 'ar' ? 'رتبة المحجوب (مشاهد لمحة الكشافة فقط)' : 'Restricted: Scout Overview Only'}</span>
          ) : (
            <>
              {currentUser.permissions?.canManageMembers && (
                <span className="badge badge-kashaf">✓ إدارة الأفراد</span>
              )}
              {currentUser.permissions?.canManageActivities && (
                <span className="badge badge-info">✓ إدارة الأنشطة</span>
              )}
              {canSeeFinances ? (
                <span className="badge badge-success">✓ مسؤول الصندوق المالي</span>
              ) : (
                <span className="badge badge-danger">🔒 محجوب عن الصندوق والإيرادات</span>
              )}
            </>
          )}
        </div>
      </div>

      {/* Scout Welcome, Definition, Law & Page Links Section */}
      <div
        id="scoutIntroCard"
        style={{
          background: 'linear-gradient(135deg, rgba(27, 94, 32, 0.06), rgba(46, 125, 50, 0.02))',
          border: '1px solid rgba(27, 94, 32, 0.2)',
          borderRadius: '14px',
          padding: '1.5rem',
          marginBottom: '2rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              🏕️ {lang === 'ar' ? 'لمحة كشفية ورسالة الجمعية' : 'Scout Overview & Motto'}
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.92rem', color: 'var(--text-muted)' }}>
              {lang === 'ar'
                ? 'جمعية كشافة الموعود (عج) - بناء الأجيال وغرس القيم الدينية والأخلاقية'
                : 'Al-Mawood Scout Association - Nurturing Generations with Noble Values'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <a
              id="btnScoutFacebookPage"
              href={scoutPageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{
                padding: '0.45rem 1rem',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                textDecoration: 'none',
                background: '#1877F2',
                borderColor: '#1877F2',
                color: '#ffffff',
                fontWeight: 700,
              }}
              title={lang === 'ar' ? 'الانتقال إلى صفحة الجمعية الرسمية على فيسبوك' : 'Visit Official Facebook Page'}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              {lang === 'ar' ? 'رابط صفحة الجمعية (فيسبوك)' : 'Scout Facebook Page'}
            </a>
            <button
              onClick={handleCopyLink}
              className="btn btn-outline"
              style={{ padding: '0.45rem 1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              🔗 {copiedLink ? (lang === 'ar' ? 'تم نسخ الرابط!' : 'Link Copied!') : (lang === 'ar' ? 'نسخ رابط المنظومة' : 'Share Portal Link')}
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.2rem' }}>
          <div style={{ background: 'var(--bg-card)', padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary)', fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              📖 {lang === 'ar' ? 'تعريف الحركة الكشفية:' : 'Definition of Scouting:'}
            </h4>
            <p style={{ margin: 0, fontSize: '0.94rem', lineHeight: 1.65, color: 'var(--text-main)', fontWeight: 500 }}>
              {lang === 'ar'
                ? 'هي حركة شبابية تربوية تثقيفية تطوعية مستقلة تهدف الى تنمية قدرات الشباب وتطويرها وتفعيل دورهم في المجتمع ولها مبادئ وقانون على الفرد ان يلتزم بها.'
                : 'A voluntary, non-political educational movement for young people, open to all, aimed at developing physical, intellectual, social, and spiritual capacities.'}
            </p>
          </div>

          <div style={{ background: 'var(--bg-card)', padding: '1rem 1.25rem', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary)', fontWeight: 800, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              ⚜️ {lang === 'ar' ? 'الوعد الكشفي:' : 'Scout Promise:'}
            </h4>
            <p style={{ margin: 0, fontSize: '0.94rem', lineHeight: 1.65, color: 'var(--text-main)', fontWeight: 500 }}>
              {lang === 'ar'
                ? '«اعد بشرفي ان ابذل جهدي في ان اقوم بما يجب علي نحو الله والدين والمذهب وامامي الموعود تم الوطن والوالدين والقائد الكشفي وانا اعمل بقانون الكشافة»'
                : '"On my honor, I promise that I will do my best to do my duty to God and my religion, my country, my parents, and to obey the Scout Law."'}
            </p>
          </div>
        </div>
      </div>

      {/* For Restricted / Viewer Role: Show ONLY the scout overview and a security notice */}
      {currentUser.role === 'viewer' ? (
        <div
          id="viewerRestrictedNotice"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '1.5rem',
            textAlign: 'center',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🔒</div>
          <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--primary)', fontWeight: 800, fontSize: '1.15rem' }}>
            {lang === 'ar' ? 'حساب مقيّد (رتبة المحجوب)' : 'Restricted Account (Viewer Mode)'}
          </h3>
          <p style={{ margin: '0 auto', maxWidth: '600px', fontSize: '0.95rem', color: 'var(--text-muted)', lineHeight: '1.6' }}>
            {lang === 'ar'
              ? 'أهلاً بك! تم ضبط حسابك برتبة المحجوب لمشاهدة لمحة الكشافة العامة، الوعد الكشفي، وصفحة الجمعية. كافة السجلات الإدارية، وقوائم الأفراد، والصناديق المالية والأنشطة محجوبة عن هذا الحساب.'
              : 'Welcome! Your account is set to Viewer / Restricted mode to view the Scout Overview, Promise, and Association page. Internal member records, treasuries, and activities are inaccessible.'}
          </p>
        </div>
      ) : (
        <>
          {/* Stats Summary Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-number">{members.length}</div>
              <div className="stat-label">{t.totalMembers}</div>
            </div>

            {Object.keys(INITIAL_CATEGORIES)
              .filter((cat) => {
                if (currentUser.role === 'supervisor_general' || !currentUser.assignedCategory) return true;
                return currentUser.assignedCategory === cat;
              })
              .map((cat) => {
              const k = INITIAL_CATEGORIES[cat].key;
              const cnt = getCategoryMembers(cat).length;
              return (
                <div
                  key={cat}
                  className={`stat-card ${k}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => onSelectCategory(cat)}
                >
                  <div className="stat-number">{cnt}</div>
                  <div className="stat-label">{cat}</div>
                </div>
              );
            })}

            {canSeeFinances && (
              <div className="stat-card financial">
                <div className="stat-number">{totalRev.toLocaleString()}</div>
                <div className="stat-label">{t.totalFund}</div>
              </div>
            )}

            <div className="stat-card activities">
              <div className="stat-number">{activities.length}</div>
              <div className="stat-label">{t.totalActivities}</div>
            </div>
          </div>

          {/* Quick Access Categories */}
          <div className="content-card">
            <h2 className="card-title">{t.quickAccess}</h2>
            <div className="firqa-grid" style={{ marginTop: '1.5rem' }}>
              {Object.keys(INITIAL_CATEGORIES)
                .filter((cat) => {
                  if (currentUser.role === 'supervisor_general' || !currentUser.assignedCategory) return true;
                  return currentUser.assignedCategory === cat;
                })
                .map((cat) => {
                const k = INITIAL_CATEGORIES[cat].key;
                const mems = getCategoryMembers(cat);
                const rev = getCategoryRev(cat);
                const acts = getCategoryActivities(cat);
                const firaqCount = INITIAL_CATEGORIES[cat].firaq.length;

                return (
                  <div
                    key={cat}
                    className={`firqa-card ${k}`}
                    onClick={() => onSelectCategory(cat)}
                  >
                    <h3>{cat}</h3>
                    <div className="firqa-stats">
                      <div className="firqa-stat">
                        <div className="firqa-stat-num">{mems.length}</div>
                        <div className="firqa-stat-label">
                          {lang === 'ar' ? 'أفراد' : 'Members'}
                        </div>
                      </div>
                      {canSeeFinances && (
                        <div className="firqa-stat">
                          <div className="firqa-stat-num">{rev.toLocaleString()}</div>
                          <div className="firqa-stat-label">IQD</div>
                        </div>
                      )}
                      <div className="firqa-stat">
                        <div className="firqa-stat-num">{acts.length}</div>
                        <div className="firqa-stat-label">
                          {lang === 'ar' ? 'نشاطات' : 'Activities'}
                        </div>
                      </div>
                      <div className="firqa-stat">
                        <div className="firqa-stat-num">{firaqCount}</div>
                        <div className="firqa-stat-label">
                          {lang === 'ar' ? 'فرق' : 'Troops'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
