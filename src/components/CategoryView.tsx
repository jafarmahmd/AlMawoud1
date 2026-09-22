import React, { useState } from 'react';
import { Member, Payment, Activity, Language, AppUser } from '../types';
import { translations } from '../i18n';
import { INITIAL_CATEGORIES } from '../data';

interface CategoryViewProps {
  category: string;
  members: Member[];
  payments: Payment[];
  activities: Activity[];
  currentUser: AppUser;
  lang: Language;
  onSelectFirqa: (firqaName: string) => void;
  onOpenAddMember: (cat: string, firqa: string) => void;
  onOpenAddPayment: (memberId: number) => void;
  onOpenAddActivity: (cat: string, firqa: string) => void;
  onViewMember: (member: Member) => void;
  onEditMember: (member: Member) => void;
  onDeleteMember: (memberId: number) => void;
  onViewImage: (imgUrl: string) => void;
  onDeleteActivity?: (activityId: number) => void;
  onToggleCancelActivity?: (activityId: number) => void;
}

export const CategoryView: React.FC<CategoryViewProps> = ({
  category,
  members,
  payments,
  activities,
  currentUser,
  lang,
  onSelectFirqa,
  onOpenAddMember,
  onOpenAddPayment,
  onOpenAddActivity,
  onViewMember,
  onEditMember,
  onDeleteMember,
  onViewImage,
  onDeleteActivity,
  onToggleCancelActivity,
}) => {
  const t = translations[lang];
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    confirmVariant?: 'danger' | 'warning' | 'primary';
    onConfirm: () => void;
  } | null>(null);

  const catData = INITIAL_CATEGORIES[category] || { key: 'kashaf', firaq: [] };
  const k = catData.key;
  const firaq = catData.firaq;

  const allMems = members.filter((m) => m.category === category);
  const memIds = allMems.map((m) => m.id);
  const allPays = payments.filter((p) => memIds.includes(p.memberId));
  const totalRev = allPays.reduce((s, p) => s + (parseFloat(p.amount as string) || 0), 0);
  const allActs = activities.filter(
    (a) => a.category === category || a.category === 'الجميع'
  );
  const activeCount = allMems.filter((m) => m.status === 'نشط').length;

  const canSeeFinances =
    currentUser.role !== 'viewer' &&
    (currentUser.role === 'supervisor_general' ||
      currentUser.role === 'treasurer' ||
      currentUser.permissions?.canViewFinances ||
      currentUser.permissions?.canManageFinances);

  const canManageThisSection =
    currentUser.role === 'supervisor_general' ||
    (currentUser.role === 'section_leader' &&
      (!currentUser.assignedCategory || currentUser.assignedCategory === category)) ||
    (currentUser.permissions?.canManageMembers &&
      currentUser.role !== 'viewer' &&
      currentUser.role !== 'treasurer' &&
      currentUser.role !== 'activities_lead');

  return (
    <div>
      <div className={`category-banner ${k}`}>
        <h1>{lang === 'ar' ? `قسم ${category}` : `${category} Section`}</h1>
        <p>
          {lang === 'ar'
            ? `إدارة شاملة لجميع فرق ونشاطات وصندوق ${category}`
            : `Comprehensive management of all ${category} troops, activities and finances`}
        </p>
      </div>

      <div className="stats-grid">
        <div className={`stat-card ${k}`}>
          <div className="stat-number">{allMems.length}</div>
          <div className="stat-label">{t.totalMembers}</div>
        </div>
        <div className={`stat-card ${k}`}>
          <div className="stat-number">{activeCount}</div>
          <div className="stat-label">{t.activeMembers}</div>
        </div>
        {canSeeFinances && (
          <div className="stat-card financial">
            <div className="stat-number">{totalRev.toLocaleString()}</div>
            <div className="stat-label">{t.totalFund}</div>
          </div>
        )}
        <div className="stat-card activities">
          <div className="stat-number">{allActs.length}</div>
          <div className="stat-label">{t.totalActivities}</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{firaq.length}</div>
          <div className="stat-label">{t.troopsCount}</div>
        </div>
      </div>

      {firaq.length > 0 ? (
        <div className="content-card">
          <div className="card-header">
            <h2 className="card-title">
              {lang === 'ar' ? 'الفرق التابعة للقسم' : 'Troops in this Section'}
            </h2>
          </div>
          <div className="firqa-grid">
            {firaq.map((f) => {
              const fMems = members.filter(
                (m) => m.category === category && m.firqa === f
              );
              const fMemIds = fMems.map((m) => m.id);
              const fPays = payments.filter((p) => fMemIds.includes(p.memberId));
              const fRev = fPays.reduce(
                (s, p) => s + (parseFloat(p.amount as string) || 0),
                0
              );
              const fActs = activities.filter(
                (a) => a.category === category && a.firqa === f
              );

              return (
                <div
                  key={f}
                  className={`firqa-card ${k}`}
                  onClick={() => onSelectFirqa(f)}
                >
                  <h3>{f}</h3>
                  <div className="firqa-stats">
                    <div className="firqa-stat">
                      <div className="firqa-stat-num">{fMems.length}</div>
                      <div className="firqa-stat-label">
                        {lang === 'ar' ? 'أفراد' : 'Members'}
                      </div>
                    </div>
                    {canSeeFinances && (
                      <div className="firqa-stat">
                        <div className="firqa-stat-num">{fRev.toLocaleString()}</div>
                        <div className="firqa-stat-label">IQD</div>
                      </div>
                    )}
                    <div className="firqa-stat">
                      <div className="firqa-stat-num">{fActs.length}</div>
                      <div className="firqa-stat-label">
                        {lang === 'ar' ? 'نشاطات' : 'Activities'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Section without sub-troops (like جوال) */
        <div className="content-card">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '1.5rem',
            }}
          >
            <h3 style={{ color: 'var(--primary-green)', fontWeight: 900 }}>
              {t.membersTab} ({allMems.length})
            </h3>
            {canManageThisSection && (
              <button
                className="btn btn-primary btn-small"
                onClick={() => onOpenAddMember(category, '')}
              >
                + {t.addNewMember}
              </button>
            )}
          </div>

          {allMems.length === 0 ? (
            <div className="empty-state">
              <h3>{lang === 'ar' ? 'لا يوجد أفراد مسجلون' : 'No members found'}</h3>
              {canManageThisSection && (
                <button
                  className="btn btn-primary"
                  style={{ marginTop: '1rem' }}
                  onClick={() => onOpenAddMember(category, '')}
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
                    <th>{t.phone}</th>
                    <th>{t.status}</th>
                    <th>{t.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {allMems.map((m) => (
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
                          {canManageThisSection && (
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

      {/* Confirmation Modal */}
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
                    : 'rgba(245, 124, 0, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '30px',
                margin: '0 auto 1.2rem',
              }}
            >
              {confirmDialog.confirmVariant === 'danger' ? '🗑️' : '⚠️'}
            </div>

            <h3
              style={{
                fontSize: '1.25rem',
                fontWeight: 900,
                color:
                  confirmDialog.confirmVariant === 'danger'
                    ? 'var(--danger, #d32f2f)'
                    : 'var(--warning, #f57c00)',
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
                    : 'btn-warning'
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
