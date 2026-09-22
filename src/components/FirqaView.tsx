import React, { useState } from 'react';
import { Member, Payment, Activity, Language, AppUser } from '../types';
import { translations } from '../i18n';
import { INITIAL_CATEGORIES } from '../data';

interface FirqaViewProps {
  category: string;
  firqa: string;
  members: Member[];
  payments: Payment[];
  activities: Activity[];
  currentUser: AppUser;
  lang: Language;
  onNavigateToDashboard: () => void;
  onNavigateToCategory: (cat: string) => void;
  onOpenAddMember: (cat: string, firqa: string) => void;
  onOpenAddPayment: (memberId: number) => void;
  onOpenAddActivity: (cat: string, firqa: string) => void;
  onViewMember: (member: Member) => void;
  onEditMember: (member: Member) => void;
  onDeleteMember: (memberId: number) => void;
  onViewImage: (imgUrl: string) => void;
  onDeleteActivity?: (activityId: number) => void;
  onToggleCancelActivity?: (activityId: number) => void;
  onResetFirqaFund?: (category: string, firqa: string) => void;
}

export const FirqaView: React.FC<FirqaViewProps> = ({
  category,
  firqa,
  members,
  payments,
  activities,
  currentUser,
  lang,
  onNavigateToDashboard,
  onNavigateToCategory,
  onOpenAddMember,
  onOpenAddPayment,
  onOpenAddActivity,
  onViewMember,
  onEditMember,
  onDeleteMember,
  onViewImage,
  onDeleteActivity,
  onToggleCancelActivity,
  onResetFirqaFund,
}) => {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'members' | 'finances' | 'activities'>('members');
  const [searchQuery, setSearchQuery] = useState('');

  // In-App Confirmation Modal State (Reliable inside iframe without window.confirm)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    confirmVariant?: 'danger' | 'warning' | 'primary';
    onConfirm: () => void;
  } | null>(null);

  // Role 5: Viewer cannot see finances or revenues whatsoever
  const canSeeFinances =
    currentUser.role !== 'viewer' &&
    (currentUser.role === 'supervisor_general' ||
      currentUser.role === 'treasurer' ||
      currentUser.permissions?.canViewFinances ||
      currentUser.permissions?.canManageFinances);

  // Leaders who can manage finances (Supervisor, Treasurer, Section Leader, Troop Leader)
  const canManageFinances =
    currentUser.role !== 'viewer' &&
    (currentUser.role === 'supervisor_general' ||
      currentUser.role === 'treasurer' ||
      currentUser.role === 'section_leader' ||
      currentUser.role === 'troop_leader' ||
      currentUser.permissions?.canManageFinances);

  // Leaders who can manage activities (Supervisor, Section Leader, Troop Leader, Activities Lead)
  const canManageActivities =
    currentUser.role !== 'viewer' &&
    (currentUser.role === 'supervisor_general' ||
      currentUser.role === 'section_leader' ||
      currentUser.role === 'troop_leader' ||
      currentUser.role === 'activities_lead' ||
      currentUser.permissions?.canManageActivities);

  // Role-based troop member management
  const canManageThisFirqa =
    currentUser.role === 'supervisor_general' ||
    (currentUser.role === 'section_leader' &&
      (!currentUser.assignedCategory || currentUser.assignedCategory === category)) ||
    (currentUser.role === 'troop_leader' &&
      (!currentUser.assignedFirqa || currentUser.assignedFirqa === firqa)) ||
    (currentUser.permissions?.canManageMembers &&
      currentUser.role !== 'viewer' &&
      currentUser.role !== 'treasurer' &&
      currentUser.role !== 'activities_lead');

  // If user cannot see finances and current tab is finances, fallback to members
  const currentTab = !canSeeFinances && activeTab === 'finances' ? 'members' : activeTab;

  const catData = INITIAL_CATEGORIES[category] || { key: 'kashaf', firaq: [] };
  const k = catData.key;

  const fMems = members.filter(
    (m) => m.category === category && m.firqa === firqa
  );
  const fMemIds = fMems.map((m) => m.id);
  const fPays = payments.filter((p) => fMemIds.includes(p.memberId));
  const totalRev = fPays.reduce((s, p) => s + (parseFloat(p.amount as string) || 0), 0);
  const weeklyRev = fPays
    .filter((p) => p.type === 'أسبوعي')
    .reduce((s, p) => s + (parseFloat(p.amount as string) || 0), 0);
  const monthlyRev = fPays
    .filter((p) => p.type === 'شهري')
    .reduce((s, p) => s + (parseFloat(p.amount as string) || 0), 0);

  const fActs = activities.filter(
    (a) => a.category === category && a.firqa === firqa
  );
  const activeCount = fMems.filter((m) => m.status === 'نشط').length;

  const filteredMembers = fMems.filter(
    (m) =>
      m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.phone.includes(searchQuery)
  );

  return (
    <div>
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <a onClick={onNavigateToDashboard}>{t.dashboard}</a> /{' '}
        <a onClick={() => onNavigateToCategory(category)}>
          {lang === 'ar' ? `قسم ${category}` : category}
        </a>{' '}
        / <span>{firqa}</span>
      </div>

      {/* Banner */}
      <div className={`category-banner ${k}`}>
        <h1>{firqa}</h1>
        <p>{lang === 'ar' ? `قسم ${category}` : `${category} Section`}</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className={`stat-card ${k}`}>
          <div className="stat-number">{fMems.length}</div>
          <div className="stat-label">{t.totalMembers}</div>
        </div>
        <div className={`stat-card ${k}`}>
          <div className="stat-number">{activeCount}</div>
          <div className="stat-label">{t.activeMembers}</div>
        </div>
        {canSeeFinances && (
          <>
            <div className="stat-card financial">
              <div className="stat-number">{totalRev.toLocaleString()}</div>
              <div className="stat-label">{t.totalFund}</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{weeklyRev.toLocaleString()}</div>
              <div className="stat-label">{t.weeklyFund}</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{monthlyRev.toLocaleString()}</div>
              <div className="stat-label">{t.monthlyFund}</div>
            </div>
          </>
        )}
        <div className="stat-card activities">
          <div className="stat-number">{fActs.length}</div>
          <div className="stat-label">{t.totalActivities}</div>
        </div>
      </div>

      {/* Content Card with Tabs */}
      <div className="content-card">
        <div className="tabs-nav">
          <button
            className={`tab-btn ${currentTab === 'members' ? 'active' : ''}`}
            onClick={() => setActiveTab('members')}
          >
            {t.membersTab} ({fMems.length})
          </button>
          {canSeeFinances && (
            <button
              className={`tab-btn ${currentTab === 'finances' ? 'active' : ''}`}
              onClick={() => setActiveTab('finances')}
            >
              {t.fundTab} ({fPays.length})
            </button>
          )}
          <button
            className={`tab-btn ${currentTab === 'activities' ? 'active' : ''}`}
            onClick={() => setActiveTab('activities')}
          >
            {t.activitiesTab} ({fActs.length})
          </button>
        </div>

        {/* Tab 1: Members */}
        {currentTab === 'members' && (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <h3 style={{ color: 'var(--primary-green)', fontWeight: 900 }}>
                {lang === 'ar' ? `أفراد ${firqa}` : `${firqa} Members`}
              </h3>
              {canManageThisFirqa && (
                <button
                  className="btn btn-primary btn-small"
                  onClick={() => onOpenAddMember(category, firqa)}
                >
                  + {t.addNewMember}
                </button>
              )}
            </div>

            {fMems.length > 0 && (
              <div className="search-bar">
                <input
                  type="text"
                  placeholder={t.searchMember}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}

            {filteredMembers.length === 0 ? (
              <div className="empty-state">
                <h3>{lang === 'ar' ? 'لا يوجد أفراد' : 'No members found'}</h3>
                {canManageThisFirqa && (
                  <button
                    className="btn btn-primary"
                    style={{ marginTop: '1rem' }}
                    onClick={() => onOpenAddMember(category, firqa)}
                  >
                    + {t.addNewMember}
                  </button>
                )}
              </div>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t.photo}</th>
                      <th>{t.name}</th>
                      <th>{t.age}</th>
                      <th>{t.firqa}</th>
                      <th>{t.phone}</th>
                      <th>{t.status}</th>
                      <th>{t.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.map((m) => (
                      <tr key={m.id}>
                        <td>
                          {m.photo ? (
                            <img src={m.photo} className="member-photo" alt={m.fullName} />
                          ) : (
                            <div className="member-photo-placeholder">؟</div>
                          )}
                        </td>
                        <td>
                          <strong>{m.fullName}</strong>
                        </td>
                        <td>
                          {m.age} {t.years}
                        </td>
                        <td>
                          <span className={`badge badge-${k}`}>
                            {m.firqa || '-'}
                          </span>
                        </td>
                        <td>{m.phone}</td>
                        <td>
                          <span
                            className={`badge badge-${
                              m.status === 'نشط' ? 'success' : 'warning'
                            }`}
                          >
                            {m.status}
                          </span>
                        </td>
                        <td>
                          <div className="action-btns">
                            <button
                              className="btn btn-info btn-small"
                              onClick={() => onViewMember(m)}
                            >
                              {t.view}
                            </button>
                            {currentUser.permissions?.canManageFinances && (
                              <button
                                className="btn btn-warning btn-small"
                                onClick={() => onOpenAddPayment(m.id)}
                              >
                                {t.pay}
                              </button>
                            )}
                            {canManageThisFirqa && (
                              <>
                                <button
                                  className="btn btn-primary btn-small"
                                  onClick={() => onEditMember(m)}
                                >
                                  {t.edit}
                                </button>
                                <button
                                  className="btn btn-danger btn-small"
                                  onClick={() => {
                                    setConfirmDialog({
                                      isOpen: true,
                                      title: lang === 'ar' ? 'حذف الفرد' : 'Delete Member',
                                      message: `${t.confirmDeleteMember} (${m.fullName})`,
                                      confirmText: lang === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete',
                                      confirmVariant: 'danger',
                                      onConfirm: () => {
                                        onDeleteMember(m.id);
                                        setConfirmDialog(null);
                                      },
                                    });
                                  }}
                                >
                                  {t.delete}
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Fund */}
        {currentTab === 'finances' && canSeeFinances && (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <h3 style={{ color: 'var(--primary-green)', fontWeight: 900 }}>
                {lang === 'ar' ? `صندوق ${firqa}` : `${firqa} Treasury`}
              </h3>

              {/* Requirement 2: Reset Troop Fund (Only Leaders / Treasurers with finance permissions) */}
              {canManageFinances && (
                <button
                  className="btn btn-danger btn-small"
                  onClick={() => {
                    setConfirmDialog({
                      isOpen: true,
                      title: lang === 'ar' ? `تصفير صندوق ${firqa}` : `Reset ${firqa} Treasury`,
                      message: t.confirmResetTroopFund,
                      confirmText: lang === 'ar' ? 'تأكيد تصفير الصندوق' : 'Confirm Reset',
                      confirmVariant: 'danger',
                      onConfirm: () => {
                        onResetFirqaFund?.(category, firqa);
                        setConfirmDialog(null);
                      },
                    });
                  }}
                  disabled={fPays.length === 0}
                  title={
                    lang === 'ar'
                      ? 'تصفير صندوق هذه الفرقة وحذف جميع مدفوعاتها والبدء من الصفر'
                      : 'Reset this troop treasury and delete all its payments'
                  }
                  style={{
                    opacity: fPays.length === 0 ? 0.6 : 1,
                    cursor: fPays.length === 0 ? 'not-allowed' : 'pointer',
                  }}
                >
                  🗑️ {t.resetTroopFund}
                </button>
              )}
            </div>

            <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
              <div className="stat-card financial">
                <div className="stat-number">{totalRev.toLocaleString()}</div>
                <div className="stat-label">
                  {lang === 'ar' ? 'إجمالي (IQD)' : 'Total (IQD)'}
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{weeklyRev.toLocaleString()}</div>
                <div className="stat-label">{t.weeklyFund}</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{monthlyRev.toLocaleString()}</div>
                <div className="stat-label">{t.monthlyFund}</div>
              </div>
            </div>

            {fPays.length === 0 ? (
              <div className="empty-state">
                <h3>{lang === 'ar' ? 'لا توجد مدفوعات مسجلة (الصندوق مصفّر)' : 'No payments recorded (Treasury is 0 IQD)'}</h3>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t.member}</th>
                      <th>{t.amount}</th>
                      <th>{t.date}</th>
                      <th>{t.type}</th>
                      <th>{t.firqa}</th>
                      <th>{t.method}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...fPays].reverse().map((p) => {
                      const m = members.find((x) => x.id === p.memberId);
                      return (
                        <tr key={p.id}>
                          <td>
                            <strong>{m ? m.fullName : 'غير معروف'}</strong>
                          </td>
                          <td>
                            <strong style={{ color: 'var(--success)' }}>
                              {parseFloat(p.amount as string).toLocaleString()} IQD
                            </strong>
                          </td>
                          <td>{p.date}</td>
                          <td>
                            <span className="badge badge-info">{p.type}</span>
                          </td>
                          <td>{m ? m.firqa || '-' : '-'}</td>
                          <td>{p.method}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Activities */}
        {currentTab === 'activities' && (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <h3 style={{ color: 'var(--primary-green)', fontWeight: 900 }}>
                {lang === 'ar' ? `نشاطات ${firqa}` : `${firqa} Activities`}
              </h3>
              {canManageActivities && (
                <button
                  className="btn btn-primary btn-small"
                  onClick={() => onOpenAddActivity(category, firqa)}
                >
                  + {t.addNewActivity}
                </button>
              )}
            </div>

            {fActs.length === 0 ? (
              <div className="empty-state">
                <h3>{lang === 'ar' ? 'لا توجد نشاطات مسجلة' : 'No activities recorded'}</h3>
                {canManageActivities && (
                  <button
                    className="btn btn-primary"
                    style={{ marginTop: '1rem' }}
                    onClick={() => onOpenAddActivity(category, firqa)}
                  >
                    + {t.addNewActivity}
                  </button>
                )}
              </div>
            ) : (
              <div>
                {[...fActs].reverse().map((a) => {
                  const isCancelled = a.status === 'ملغي';
                  return (
                    <div
                      key={a.id}
                      className="content-card"
                      style={{
                        marginBottom: '1.5rem',
                        borderRight: isCancelled
                          ? '6px solid var(--danger)'
                          : a.status === 'مكتمل'
                          ? '6px solid var(--success)'
                          : '6px solid var(--primary-green)',
                        background: isCancelled ? 'rgba(211, 47, 47, 0.03)' : undefined,
                        opacity: isCancelled ? 0.92 : 1,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          flexWrap: 'wrap',
                          gap: '0.8rem',
                          marginBottom: '1rem',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                          <h3
                            style={{
                              color: isCancelled ? 'var(--danger)' : 'var(--primary-green)',
                              fontWeight: 900,
                              margin: 0,
                              textDecoration: isCancelled ? 'line-through' : 'none',
                            }}
                          >
                            {a.name}
                          </h3>
                          {isCancelled ? (
                            <span className="badge badge-danger">
                              ⚠️ {t.activityStatusCancelled}
                            </span>
                          ) : a.status === 'مكتمل' ? (
                            <span className="badge badge-success">
                              ✓ {t.activityStatusCompleted}
                            </span>
                          ) : (
                            <span className="badge badge-info">
                              {t.activityStatusActive}
                            </span>
                          )}
                        </div>

                        {/* Leader Control Action Buttons: Delete and Cancel */}
                        {canManageActivities && (
                          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            {isCancelled ? (
                              <>
                                <button
                                  className="btn btn-danger btn-small"
                                  onClick={() => {
                                    setConfirmDialog({
                                      isOpen: true,
                                      title: lang === 'ar' ? 'حذف النشاط الملغي' : 'Delete Cancelled Activity',
                                      message: `${t.confirmDeleteActivity} (${a.name})`,
                                      confirmText: lang === 'ar' ? 'تأكيد الحذف النهائي' : 'Confirm Delete',
                                      confirmVariant: 'danger',
                                      onConfirm: () => {
                                        onDeleteActivity?.(a.id);
                                        setConfirmDialog(null);
                                      },
                                    });
                                  }}
                                  title={
                                    lang === 'ar'
                                      ? 'حذف النشاط الملغي نهائياً'
                                      : 'Delete cancelled activity permanently'
                                  }
                                >
                                  🗑️ {t.deleteCancelledActivity}
                                </button>
                                <button
                                  className="btn btn-outline btn-small"
                                  onClick={() => {
                                    onToggleCancelActivity?.(a.id);
                                  }}
                                  title={
                                    lang === 'ar'
                                      ? 'إعادة تفعيل النشاط'
                                      : 'Reactivate activity'
                                  }
                                >
                                  ↩️ {t.reactivateActivity}
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  className="btn btn-warning btn-small"
                                  onClick={() => {
                                    setConfirmDialog({
                                      isOpen: true,
                                      title: lang === 'ar' ? 'إلغاء النشاط' : 'Cancel Activity',
                                      message: `${t.confirmCancelActivity} (${a.name})`,
                                      confirmText: lang === 'ar' ? 'تأكيد الإلغاء' : 'Confirm Cancel',
                                      confirmVariant: 'warning',
                                      onConfirm: () => {
                                        onToggleCancelActivity?.(a.id);
                                        setConfirmDialog(null);
                                      },
                                    });
                                  }}
                                  title={
                                    lang === 'ar'
                                      ? 'تحديد النشاط كملغي'
                                      : 'Mark activity as cancelled'
                                  }
                                >
                                  ⚠️ {t.cancelActivity}
                                </button>
                                <button
                                  className="btn btn-danger btn-small"
                                  onClick={() => {
                                    setConfirmDialog({
                                      isOpen: true,
                                      title: lang === 'ar' ? 'حذف النشاط' : 'Delete Activity',
                                      message: `${t.confirmDeleteActivity} (${a.name})`,
                                      confirmText: lang === 'ar' ? 'تأكيد الحذف' : 'Confirm Delete',
                                      confirmVariant: 'danger',
                                      onConfirm: () => {
                                        onDeleteActivity?.(a.id);
                                        setConfirmDialog(null);
                                      },
                                    });
                                  }}
                                  title={lang === 'ar' ? 'حذف النشاط' : 'Delete activity'}
                                >
                                  🗑️ {t.deleteActivity}
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>

                      {isCancelled && (
                        <div
                          style={{
                            background: 'rgba(211, 47, 47, 0.1)',
                            border: '1px solid rgba(211, 47, 47, 0.25)',
                            padding: '0.6rem 1rem',
                            borderRadius: '8px',
                            color: 'var(--danger)',
                            fontWeight: 700,
                            marginBottom: '1rem',
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                          }}
                        >
                          <span>⚠️</span>
                          <span>
                            {lang === 'ar'
                              ? 'تم إلغاء هذا النشاط من قبل القادة. يمكنك حذفه نهائياً بالضغط على زر "حذف النشاط الملغي".'
                              : 'This activity was marked as cancelled by leaders. You can permanently delete it via "Delete Cancelled Activity".'}
                          </span>
                        </div>
                      )}

                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                          gap: '1rem',
                          marginBottom: '1rem',
                        }}
                      >
                        <div>
                          <strong>{t.date}:</strong> {a.date}
                        </div>
                        <div>
                          <strong>{t.type}:</strong>{' '}
                          <span className="badge badge-info">{a.type}</span>
                        </div>
                        <div>
                          <strong>{lang === 'ar' ? 'الموقع:' : 'Location:'}</strong>{' '}
                          {a.location || (lang === 'ar' ? 'غير محدد' : 'Not specified')}
                        </div>
                        {a.linkUrl && (
                          <div>
                            <strong>{lang === 'ar' ? 'رابط النشاط:' : 'Activity Link:'}</strong>{' '}
                            <a
                              href={a.linkUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="badge badge-primary"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                textDecoration: 'none',
                                color: 'white',
                                background: 'var(--primary-green)',
                                padding: '4px 10px',
                                borderRadius: '6px',
                                fontSize: '0.85rem',
                              }}
                            >
                              🔗 {lang === 'ar' ? 'فتح الرابط الخارجي' : 'Open Link'}
                            </a>
                          </div>
                        )}
                        {canSeeFinances && (
                          <div>
                            <strong>{lang === 'ar' ? 'التكلفة:' : 'Cost:'}</strong>{' '}
                            {a.cost || 0} IQD
                          </div>
                        )}
                      </div>

                      {a.leaders && a.leaders.length > 0 && (
                        <div style={{ marginTop: '1rem' }}>
                          <strong>{lang === 'ar' ? 'القائمون:' : 'Leaders:'}</strong>
                          <div className="attendance-list">
                            {a.leaders.map((l, idx) => (
                              <span key={idx} className="attendance-badge attendance-leader">
                                {l}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {a.present && a.present.length > 0 && (
                        <div style={{ marginTop: '1rem' }}>
                          <strong>
                            {lang === 'ar'
                              ? `الحضور (${a.present.length}):`
                              : `Present (${a.present.length}):`}
                          </strong>
                          <div className="attendance-list">
                            {a.present.map((p, idx) => (
                              <span key={idx} className="attendance-badge attendance-present">
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {a.absent && a.absent.length > 0 && (
                        <div style={{ marginTop: '1rem' }}>
                          <strong>
                            {lang === 'ar'
                              ? `الغياب (${a.absent.length}):`
                              : `Absent (${a.absent.length}):`}
                          </strong>
                          <div className="attendance-list">
                            {a.absent.map((ab, idx) => (
                              <span key={idx} className="attendance-badge attendance-absent">
                                {ab}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {a.description && (
                        <div
                          style={{
                            marginTop: '1rem',
                            paddingTop: '1rem',
                            borderTop: '2px solid var(--border)',
                          }}
                        >
                          <strong>{lang === 'ar' ? 'الوصف:' : 'Description:'}</strong>
                          <p style={{ marginTop: '0.5rem' }}>{a.description}</p>
                        </div>
                      )}

                      {a.images && a.images.length > 0 && (
                        <div
                          style={{
                            marginTop: '1rem',
                            paddingTop: '1rem',
                            borderTop: '2px solid var(--border)',
                          }}
                        >
                          <strong>
                            {lang === 'ar'
                              ? `الصور (${a.images.length}):`
                              : `Images (${a.images.length}):`}
                          </strong>
                          <div className="activity-images">
                            {a.images.map((img, idx) => (
                              <img
                                key={idx}
                                src={img}
                                className="activity-image"
                                alt="صورة النشاط"
                                onClick={() => onViewImage(img)}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* In-App Confirmation Modal Dialog */}
      {confirmDialog && confirmDialog.isOpen && (
        <div
          className="modal active"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            backdropFilter: 'blur(4px)',
            padding: '1rem',
          }}
          onClick={() => setConfirmDialog(null)}
        >
          <div
            className="modal-content"
            style={{
              maxWidth: '460px',
              width: '100%',
              padding: '2rem 1.8rem',
              borderRadius: '16px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
              textAlign: 'center',
              background: 'var(--card-bg, #ffffff)',
              border: '1px solid var(--border)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background:
                  confirmDialog.confirmVariant === 'danger'
                    ? 'rgba(211, 47, 47, 0.12)'
                    : confirmDialog.confirmVariant === 'warning'
                    ? 'rgba(245, 124, 0, 0.12)'
                    : 'rgba(46, 125, 50, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '30px',
                margin: '0 auto 1.2rem',
              }}
            >
              {confirmDialog.confirmVariant === 'danger'
                ? '🗑️'
                : confirmDialog.confirmVariant === 'warning'
                ? '⚠️'
                : 'ℹ️'}
            </div>

            <h3
              style={{
                fontSize: '1.25rem',
                fontWeight: 900,
                color:
                  confirmDialog.confirmVariant === 'danger'
                    ? 'var(--danger, #d32f2f)'
                    : confirmDialog.confirmVariant === 'warning'
                    ? 'var(--warning, #f57c00)'
                    : 'var(--primary-green, #1b5e20)',
                marginBottom: '0.8rem',
              }}
            >
              {confirmDialog.title}
            </h3>

            <p
              style={{
                fontSize: '0.95rem',
                lineHeight: '1.6',
                color: 'var(--text-light, #555)',
                marginBottom: '1.8rem',
              }}
            >
              {confirmDialog.message}
            </p>

            <div
              style={{
                display: 'flex',
                gap: '0.75rem',
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <button
                type="button"
                className="btn btn-secondary"
                style={{ minWidth: '110px' }}
                onClick={() => setConfirmDialog(null)}
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                className={`btn ${
                  confirmDialog.confirmVariant === 'danger'
                    ? 'btn-danger'
                    : confirmDialog.confirmVariant === 'warning'
                    ? 'btn-warning'
                    : 'btn-primary'
                }`}
                style={{ minWidth: '140px', fontWeight: 800 }}
                onClick={() => {
                  confirmDialog.onConfirm();
                }}
              >
                {confirmDialog.confirmText || (lang === 'ar' ? 'تأكيد' : 'Confirm')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
