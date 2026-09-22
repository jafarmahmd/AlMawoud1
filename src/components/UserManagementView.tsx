import React, { useState, useRef } from 'react';
import { AppUser, Language, Member, Payment, Activity } from '../types';
import { translations } from '../i18n';
import { INITIAL_CATEGORIES, DEFAULT_LOGO, getDefaultPermissionsForRole } from '../data';
import { ROLE_PRESETS, findPresetForUser, RolePreset } from '../lib/roles';
import { isFirebaseConfigured, getFirebaseDb, doc, setDoc } from '../lib/firebase';

interface UserManagementViewProps {
  currentUser: AppUser;
  users: AppUser[];
  members?: Member[];
  payments?: Payment[];
  activities?: Activity[];
  lang: Language;
  siteLogo: string;
  onUpdateLogo?: (newLogo: string) => void;
  onResetLogo?: () => void;
  onClearAllMembers?: () => void;
  onExportBackup?: () => void;
  onImportBackup?: (backupData: any) => void;
  onApproveUser: (user: AppUser, role: AppUser['role'], perms: AppUser['permissions']) => void;
  onRejectUser: (user: AppUser) => void;
  onUpdatePermissions: (userId: string | number, role: AppUser['role'], perms: AppUser['permissions'], status: AppUser['status'], assignedCategory?: string, assignedFirqa?: string) => void;
  onDeleteUser: (userId: string | number) => void;
  showToast: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  currentUser,
  users,
  members = [],
  payments = [],
  activities = [],
  lang,
  siteLogo,
  onUpdateLogo,
  onResetLogo,
  onClearAllMembers,
  onExportBackup,
  onImportBackup,
  onApproveUser,
  onRejectUser,
  onUpdatePermissions,
  onDeleteUser,
  showToast,
}) => {
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'logo'>('pending');
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);
  const [userToDelete, setUserToDelete] = useState<AppUser | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const importFileInputRef = useRef<HTMLInputElement>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);

  // Logo control states
  const [logoInput, setLogoInput] = useState<string>(siteLogo);
  const [logoPreview, setLogoPreview] = useState<string>(siteLogo);

  // Update logoPreview if siteLogo changes
  React.useEffect(() => {
    setLogoPreview(siteLogo);
    setLogoInput(siteLogo);
  }, [siteLogo]);

  // Modal edit states
  const [editRole, setEditRole] = useState<AppUser['role']>('troop_leader');
  const [editStatus, setEditStatus] = useState<AppUser['status']>('approved');
  const [editCategory, setEditCategory] = useState('');
  const [editFirqa, setEditFirqa] = useState('');
  const [editPermMembers, setEditPermMembers] = useState(true);
  const [editPermFinances, setEditPermFinances] = useState(false);
  const [editPermActivities, setEditPermActivities] = useState(true);
  const [editPermUsers, setEditPermUsers] = useState(false);

  const pendingUsers = users.filter((u) => u.status === 'pending');
  const approvedUsers = users.filter((u) => u.status !== 'pending');

  const handleImportFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result;
        if (typeof content === 'string') {
          const parsed = JSON.parse(content);
          if (onImportBackup) {
            onImportBackup(parsed);
          }
        }
      } catch {
        showToast(t.importBackupError, 'error');
      }
      if (importFileInputRef.current) {
        importFileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setLogoPreview(reader.result);
        setLogoInput(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyLogo = () => {
    if (!logoPreview || !logoPreview.trim()) {
      showToast(lang === 'ar' ? 'يرجى اختيار أو إدخال صورة الشعار أولاً' : 'Please provide a logo image first', 'warning');
      return;
    }
    if (onUpdateLogo) {
      onUpdateLogo(logoPreview);
    }
    showToast(t.logoUpdatedSuccess, 'success');
  };

  const handleResetLogo = () => {
    if (onResetLogo) {
      onResetLogo();
    }
    setLogoPreview(DEFAULT_LOGO);
    setLogoInput(DEFAULT_LOGO);
    showToast(t.logoResetSuccess, 'info');
  };

  const [selectedPresetId, setSelectedPresetId] = useState<string>('supervisor_general');

  const openEditModal = (u: AppUser) => {
    setEditingUser(u);
    setEditRole(u.role);
    setEditStatus(u.status);
    setEditCategory(u.assignedCategory || '');
    setEditFirqa(u.assignedFirqa || '');
    const preset = findPresetForUser(u);
    setSelectedPresetId(preset.id);
    const def = getDefaultPermissionsForRole(u.role);
    setEditPermMembers(u.permissions?.canManageMembers ?? def.canManageMembers);
    setEditPermFinances(u.permissions?.canManageFinances ?? def.canManageFinances);
    setEditPermActivities(u.permissions?.canManageActivities ?? def.canManageActivities);
    setEditPermUsers(u.permissions?.canManageUsers ?? def.canManageUsers);
  };

  const handlePresetSelect = (presetId: string) => {
    setSelectedPresetId(presetId);
    const found = ROLE_PRESETS.find((p) => p.id === presetId);
    if (found) {
      setEditRole(found.role);
      if (found.assignedCategory) {
        setEditCategory(found.assignedCategory);
      }
      setEditFirqa(found.assignedFirqa || '');
      setEditPermMembers(found.permissions.canManageMembers);
      setEditPermFinances(found.permissions.canManageFinances);
      setEditPermActivities(found.permissions.canManageActivities);
      setEditPermUsers(found.permissions.canManageUsers);
    }
  };

  const handleRoleSelect = (newRole: AppUser['role']) => {
    setEditRole(newRole);
    const def = getDefaultPermissionsForRole(newRole);
    setEditPermMembers(def.canManageMembers);
    setEditPermFinances(def.canManageFinances);
    setEditPermActivities(def.canManageActivities);
    setEditPermUsers(def.canManageUsers);
  };

  const handleSavePermissions = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    onUpdatePermissions(
      editingUser.id,
      editRole,
      {
        canManageMembers: editPermMembers,
        canManageFinances: editPermFinances,
        canViewFinances:
          editRole === 'supervisor_general' ||
          editRole === 'treasurer' ||
          editPermFinances,
        canManageActivities: editPermActivities,
        canManageUsers: editPermUsers || editRole === 'supervisor_general',
      },
      editStatus,
      editCategory,
      editFirqa
    );

    setEditingUser(null);
    showToast(t.permissionsSaved, 'success');
  };

  const getRoleBadge = (userOrRole: AppUser | AppUser['role'], category?: string, firqa?: string) => {
    let role: AppUser['role'];
    let cat = category;
    let frq = firqa;
    let userObj: AppUser | undefined = undefined;

    if (typeof userOrRole === 'object') {
      role = userOrRole.role;
      cat = userOrRole.assignedCategory;
      frq = userOrRole.assignedFirqa;
      userObj = userOrRole;
    } else {
      role = userOrRole;
    }

    if (role === 'supervisor_general') {
      return <span className="badge badge-afwaj">👑 {lang === 'ar' ? 'المشرف العام (كامل الصلاحيات)' : 'General Supervisor'}</span>;
    }
    if (role === 'viewer') {
      return <span className="badge badge-warning">🛡️ {lang === 'ar' ? 'رتبة المحجوب (مشاهد لمحة الكشافة فقط)' : 'Restricted (Scout Overview Only)'}</span>;
    }

    const scopeName = frq || cat || '';

    // Check if full regiment/troop leader with complete permissions (members + activities + finances)
    if (
      userObj?.permissions?.canManageMembers &&
      userObj?.permissions?.canManageActivities &&
      userObj?.permissions?.canManageFinances
    ) {
      return (
        <span className="badge badge-afwaj" style={{ background: '#047857', color: '#fff', border: '1px solid #10b981' }}>
          👑 {lang === 'ar' ? `قائد ${scopeName} (كامل الصلاحيات)` : `Leader (${scopeName} - Full)`}
        </span>
      );
    }

    if (role === 'treasurer' || (userObj?.permissions?.canManageFinances && !userObj?.permissions?.canManageMembers && !userObj?.permissions?.canManageActivities)) {
      return <span className="badge badge-success">💰 {lang === 'ar' ? `مسؤول صندوق ${scopeName}` : `Treasurer (${scopeName})`}</span>;
    }
    if (role === 'activities_lead' || (userObj?.permissions?.canManageActivities && !userObj?.permissions?.canManageMembers && !userObj?.permissions?.canManageFinances)) {
      return <span className="badge badge-info">🎯 {lang === 'ar' ? `مسؤول أنشطة ${scopeName}` : `Activities Lead (${scopeName})`}</span>;
    }
    if (role === 'section_leader') {
      return <span className="badge badge-kashaf">📋 {lang === 'ar' ? `إدارة ${scopeName} (أنشطة وأفراد)` : `Admin (${scopeName})`}</span>;
    }
    if (role === 'troop_leader') {
      return <span className="badge badge-ashbal">⛺ {lang === 'ar' ? `مسؤول أفراد ${scopeName}` : `Members Lead (${scopeName})`}</span>;
    }
    return <span className="badge badge-warning">🛡️ {lang === 'ar' ? 'رتبة المحجوب (مشاهد لمحة الكشافة فقط)' : 'Restricted (Scout Overview Only)'}</span>;
  };

  const getStatusBadge = (status: AppUser['status']) => {
    switch (status) {
      case 'approved':
        return <span className="badge badge-success">{t.status_approved}</span>;
      case 'pending':
        return <span className="badge badge-warning">{t.status_pending}</span>;
      case 'rejected':
        return <span className="badge badge-danger">{t.status_rejected}</span>;
      case 'suspended':
        return <span className="badge badge-danger">{t.status_suspended}</span>;
    }
  };

  return (
    <div>
      {/* Category Banner styling matches the exact design */}
      <div className="category-banner default">
        <h1>⚙️ {t.userManagement}</h1>
        <p>
          {lang === 'ar'
            ? 'الموافقة الحصرية على انضمام المستخدمين وإدارة الصلاحيات الرقابية والإدارية'
            : 'Exclusive supervisor authority to grant system access and assign roles'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card" style={{ borderRightColor: 'var(--accent-red)' }}>
          <div className="stat-number" style={{ color: 'var(--accent-red)' }}>
            {pendingUsers.length}
          </div>
          <div className="stat-label">
            {lang === 'ar' ? 'طلبات قيد انتظار الموافقة' : 'Pending Approvals'}
          </div>
        </div>

        <div className="stat-card financial">
          <div className="stat-number">
            {approvedUsers.filter((u) => u.status === 'approved').length}
          </div>
          <div className="stat-label">
            {lang === 'ar' ? 'المستخدمون المعتمدون' : 'Active Approved Users'}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-number">{users.length}</div>
          <div className="stat-label">
            {lang === 'ar' ? 'إجمالي الحسابات' : 'Total Accounts'}
          </div>
        </div>

        <div className="stat-card" style={{ borderRightColor: isFirebaseConfigured() ? '#10b981' : '#f59e0b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '1.2rem' }}>{isFirebaseConfigured() ? '🟢' : '🟠'}</span>
            <div className="stat-number" style={{ fontSize: '1.25rem', color: isFirebaseConfigured() ? '#047857' : '#d97706' }}>
              {isFirebaseConfigured() 
                ? (lang === 'ar' ? 'متصل بالسحابة' : 'Cloud Connected')
                : (lang === 'ar' ? 'تخزين محلي' : 'Local Storage')}
            </div>
          </div>
          <div className="stat-label" style={{ fontSize: '0.8rem' }}>
            {isFirebaseConfigured()
              ? (lang === 'ar' ? 'تزامن لحظي مباشر بين جميع الأجهزة' : 'Real-time multi-device sync')
              : (lang === 'ar' ? 'الموقع يعمل في المتصفح فقط' : 'Local browser mode')}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="content-card">
        <div className="tabs-nav">
          <button
            className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            {t.pendingRequests} ({pendingUsers.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'approved' ? 'active' : ''}`}
            onClick={() => setActiveTab('approved')}
          >
            {t.approvedUsers} ({approvedUsers.length})
          </button>
          <button
            className={`tab-btn ${activeTab === 'logo' ? 'active' : ''}`}
            onClick={() => setActiveTab('logo')}
          >
            💾 {t.siteLogoSettings}
          </button>
        </div>

        {/* Tab 1: Pending Requests awaiting supervisor approval */}
        {activeTab === 'pending' && (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
              }}
            >
              <h3 style={{ color: 'var(--primary-green)', fontWeight: 900 }}>
                {t.pendingRequests}
              </h3>
              <div
                style={{
                  fontSize: '0.88rem',
                  color: 'var(--dark-green)',
                  background: 'rgba(76,175,80,0.1)',
                  padding: '0.4rem 0.9rem',
                  borderRadius: '8px',
                  fontWeight: 700,
                }}
              >
                ⚡ {t.instantNotificationSent}
              </div>
            </div>

            {pendingUsers.length === 0 ? (
              <div className="empty-state">
                <h3>{t.noPendingRequests}</h3>
                <p>
                  {lang === 'ar'
                    ? 'جميع طلبات التسجيل تم البت فيها والموافقة عليها.'
                    : 'All registration requests have been reviewed.'}
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>{t.name}</th>
                      <th>{t.email}</th>
                      <th>{t.phone}</th>
                      <th>{t.requestedRole}</th>
                      <th>{lang === 'ar' ? 'الفرقة / القسم' : 'Troop / Section'}</th>
                      <th>{lang === 'ar' ? 'ملاحظات الطلب' : 'Notes'}</th>
                      <th>{t.date}</th>
                      <th>{t.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingUsers.map((u) => (
                      <tr key={u.id}>
                        <td>
                          <strong>{u.fullName}</strong>
                        </td>
                        <td style={{ direction: 'ltr', textAlign: 'right' }}>
                          <code>{u.email}</code>
                        </td>
                        <td>{u.phone}</td>
                        <td>{getRoleBadge(u)}</td>
                        <td>
                          {u.assignedFirqa || u.assignedCategory || '-'}
                        </td>
                        <td style={{ maxWidth: '220px', fontSize: '0.88rem' }}>
                          {u.requestNotes || '-'}
                        </td>
                        <td>
                          {new Date(u.createdAt).toLocaleDateString(
                            lang === 'ar' ? 'ar-IQ' : 'en-US'
                          )}
                        </td>
                        <td>
                          <div className="action-btns">
                            {/* Requirement 2 & 4: Approval button with instant notification */}
                            <button
                              className="btn btn-success btn-small"
                              title={t.approveRequest}
                              onClick={() =>
                                onApproveUser(
                                  u,
                                  u.role,
                                  getDefaultPermissionsForRole(u.role)
                                )
                              }
                            >
                              ✓ {t.approveRequest}
                            </button>
                            <button
                              className="btn btn-danger btn-small"
                              title={t.rejectRequest}
                              onClick={() => onRejectUser(u)}
                            >
                              ✕ {t.rejectRequest}
                            </button>
                            <button
                              className="btn btn-danger btn-small"
                              title={lang === 'ar' ? 'حذف الحساب نهائياً' : 'Delete Account'}
                              style={{ background: '#7f1d1d', borderColor: '#7f1d1d' }}
                              onClick={() => setUserToDelete(u)}
                            >
                              🗑️ {lang === 'ar' ? 'حذف الحساب' : 'Delete'}
                            </button>
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

        {/* Tab 2: Approved Users & Permissions */}
        {activeTab === 'approved' && (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
              }}
            >
              <h3 style={{ color: 'var(--primary-green)', fontWeight: 900 }}>
                {t.approvedUsers}
              </h3>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t.name}</th>
                    <th>{t.email}</th>
                    <th>{t.phone}</th>
                    <th>{t.role}</th>
                    <th>{t.status}</th>
                    <th>{t.permissions}</th>
                    <th>{t.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {approvedUsers.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <strong>{u.fullName}</strong>
                        {u.id === currentUser.id && (
                          <span
                            style={{
                              marginRight: '6px',
                              marginLeft: '6px',
                              fontSize: '0.75rem',
                              color: 'var(--dark-green)',
                              fontWeight: 800,
                            }}
                          >
                            ({lang === 'ar' ? 'أنت' : 'You'})
                          </span>
                        )}
                      </td>
                      <td style={{ direction: 'ltr', textAlign: 'right' }}>
                        <code>{u.email}</code>
                      </td>
                      <td>{u.phone}</td>
                      <td>{getRoleBadge(u)}</td>
                      <td>{getStatusBadge(u.status)}</td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                          {u.role === 'supervisor_general' ? (
                            <span className="badge badge-afwaj">{t.fullPermission}</span>
                          ) : (
                            <>
                              {u.permissions?.canManageMembers && (
                                <span className="badge badge-kashaf">{t.manageMembersPerm}</span>
                              )}
                              {u.permissions?.canManageFinances && (
                                <span className="badge badge-success">{t.manageFinancesPerm}</span>
                              )}
                              {u.permissions?.canManageActivities && (
                                <span className="badge badge-info">{t.manageActivitiesPerm}</span>
                              )}
                              {u.permissions?.canManageUsers && (
                                <span className="badge badge-warning">{t.manageUsersPerm}</span>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="action-btns">
                          <button
                            className="btn btn-primary btn-small"
                            onClick={() => openEditModal(u)}
                          >
                            ✏️ {t.edit}
                          </button>
                          {u.id !== currentUser.id && (
                            <button
                              className="btn btn-danger btn-small"
                              title={lang === 'ar' ? 'حذف الحساب نهائياً' : 'Delete Account'}
                              onClick={() => setUserToDelete(u)}
                            >
                              🗑️ {lang === 'ar' ? 'حذف الحساب' : 'Delete'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Site Logo Control & Data Storage Management */}
        {activeTab === 'logo' && (
          <div id="siteStorageAndLogoContent">
            {/* 1. Logo Customization Card */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '1.8rem',
                marginBottom: '2rem',
                boxShadow: 'var(--shadow)',
              }}
            >
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
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>🎨</span>
                    <h3 style={{ color: 'var(--primary-green)', fontWeight: 900, margin: 0 }}>
                      {t.logoControlTitle}
                    </h3>
                  </div>
                  <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', margin: '0.3rem 0 0 0' }}>
                    {t.logoControlDesc}
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={handleResetLogo}
                    title={t.resetLogo}
                  >
                    🔄 {t.resetLogo}
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleApplyLogo}
                  >
                    💾 {t.saveLogo}
                  </button>
                </div>
              </div>

              {/* Live Dual-Theme Preview */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '1.5rem',
                  marginBottom: '1.8rem',
                }}
              >
                {/* Light card preview */}
                <div
                  style={{
                    background: 'var(--bg-main)',
                    border: '2px dashed var(--border-color)',
                    borderRadius: '14px',
                    padding: '1.2rem',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '0.8rem', fontWeight: 700 }}>
                    {lang === 'ar' ? 'معاينة الشعار في صفحة الدخول والبطاقات' : 'Login Screen & Cards Preview'}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: '120px',
                      background: 'var(--bg-card)',
                      borderRadius: '10px',
                      padding: '1rem',
                    }}
                  >
                    <img
                      src={logoPreview || DEFAULT_LOGO}
                      alt="معاينة الشعار"
                      style={{
                        maxHeight: '90px',
                        maxWidth: '100%',
                        objectFit: 'contain',
                        filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))',
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = DEFAULT_LOGO;
                      }}
                    />
                  </div>
                </div>

                {/* Dark Green preview */}
                <div
                  style={{
                    background: 'linear-gradient(135deg, var(--dark-green) 0%, var(--primary-green) 100%)',
                    borderRadius: '14px',
                    padding: '1.2rem',
                    textAlign: 'center',
                    color: 'white',
                  }}
                >
                  <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.85)', marginBottom: '0.8rem', fontWeight: 700 }}>
                    {lang === 'ar' ? 'معاينة الشعار في الشريط الجانبي والقوائم' : 'Sidebar Header Preview'}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: '120px',
                      background: 'rgba(255,255,255,0.15)',
                      borderRadius: '10px',
                      padding: '1rem',
                    }}
                  >
                    <img
                      src={logoPreview || DEFAULT_LOGO}
                      alt="معاينة الشعار في الشريط"
                      style={{
                        maxHeight: '90px',
                        maxWidth: '100%',
                        objectFit: 'contain',
                        filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.25))',
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = DEFAULT_LOGO;
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Upload and URL Controls */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '1.2rem',
                }}
              >
                {/* File Upload Box */}
                <div
                  style={{
                    border: '2px dashed var(--primary-green)',
                    borderRadius: '12px',
                    padding: '1.3rem',
                    textAlign: 'center',
                    background: 'var(--bg-main)',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onClick={() => logoFileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={logoFileInputRef}
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleLogoFileUpload}
                  />
                  <div style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>📁</div>
                  <div style={{ fontWeight: 800, color: 'var(--primary-green)', marginBottom: '0.2rem' }}>
                    {t.uploadLogo}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-light)' }}>
                    PNG, JPG, SVG, WebP
                  </div>
                </div>

                {/* Direct Image URL input */}
                <div
                  style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '1.3rem',
                    background: 'var(--bg-main)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <label style={{ fontWeight: 800, fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block' }}>
                    🔗 {t.orLogoUrl}
                  </label>
                  <div style={{ display: 'flex', gap: '0.6rem' }}>
                    <input
                      type="text"
                      dir="ltr"
                      placeholder="https://... أو /scout_logo.jpg"
                      value={logoInput}
                      onChange={(e) => {
                        setLogoInput(e.target.value);
                        if (e.target.value.trim()) {
                          setLogoPreview(e.target.value.trim());
                        }
                      }}
                      style={{ flex: 1, padding: '0.6rem 0.8rem', fontSize: '0.9rem' }}
                    />
                    <button
                      type="button"
                      className="btn btn-primary btn-small"
                      onClick={handleApplyLogo}
                    >
                      {t.saveLogo}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Data Storage & Persistence Center */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '1.8rem',
                marginBottom: '2rem',
                boxShadow: 'var(--shadow)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '1.6rem' }}>💾</span>
                <div>
                  <h3 style={{ color: 'var(--primary-green)', fontWeight: 900, margin: 0 }}>
                    {t.dataStorageStatus}
                  </h3>
                  <p style={{ color: 'var(--text-light)', fontSize: '0.9rem', margin: '0.3rem 0 0 0' }}>
                    {t.dataStorageStatusDesc}
                  </p>
                </div>
              </div>

              {/* Stats Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '1rem',
                  margin: '1.5rem 0',
                }}
              >
                <div
                  style={{
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '1rem',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>👥</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary-green)' }}>
                    {members.length}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: 700 }}>
                    {t.storedMembersCount}
                  </div>
                </div>

                <div
                  style={{
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '1rem',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>💰</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#388e3c' }}>
                    {payments.length}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: 700 }}>
                    {t.storedPaymentsCount}
                  </div>
                </div>

                <div
                  style={{
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '1rem',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>🎯</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0288d1' }}>
                    {activities.length}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: 700 }}>
                    {t.storedActivitiesCount}
                  </div>
                </div>

                <div
                  style={{
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '1rem',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '1.5rem', marginBottom: '0.3rem' }}>🔐</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f57c00' }}>
                    {users.length}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-light)', fontWeight: 700 }}>
                    {t.storedUsersCount}
                  </div>
                </div>
              </div>

              {/* Action Buttons: Export & Import */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                  gap: '1.2rem',
                  marginTop: '1.5rem',
                }}
              >
                {/* Export Card */}
                <div
                  style={{
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '1.3rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <h4 style={{ color: 'var(--primary-green)', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
                      📥 {t.exportBackup}
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', margin: '0 0 1rem 0', lineHeight: 1.5 }}>
                      {lang === 'ar'
                        ? 'تنزيل وحفظ ملف نسخة احتياطية كاملة (.json) يحتوي على كافة الأفراد، السجلات المالية، الأنشطة والحسابات في أمان تام.'
                        : 'Download a full backup file (.json) containing all members, finances, activities, and accounts.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ width: '100%', justifyContent: 'center' }}
                    onClick={onExportBackup}
                  >
                    📥 {t.exportBackup}
                  </button>
                </div>

                {/* Import Card */}
                <div
                  style={{
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    padding: '1.3rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <h4 style={{ color: '#0288d1', fontWeight: 800, margin: '0 0 0.5rem 0' }}>
                      📤 {t.importBackup}
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', margin: '0 0 1rem 0', lineHeight: 1.5 }}>
                      {lang === 'ar'
                        ? 'استعادة كافة البيانات من ملف نسخة احتياطية سابقة بنقرة زر واحدة دون فقدان أي سجل.'
                        : 'Restore all application data from a previous JSON backup file in a single click.'}
                    </p>
                  </div>
                  <input
                    type="file"
                    ref={importFileInputRef}
                    accept=".json,application/json"
                    style={{ display: 'none' }}
                    onChange={handleImportFileSelected}
                  />
                  <button
                    type="button"
                    className="btn btn-outline"
                    style={{ width: '100%', justifyContent: 'center', borderColor: '#0288d1', color: '#0288d1' }}
                    onClick={() => importFileInputRef.current?.click()}
                  >
                    📤 {t.importBackup}
                  </button>
                </div>
              </div>
            </div>

            {/* Cloud Sync & Firebase Configuration Card */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '16px',
                padding: '1.8rem',
                marginBottom: '2rem',
                boxShadow: 'var(--shadow)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <span style={{ fontSize: '1.8rem' }}>☁️</span>
                  <div>
                    <h3 style={{ color: 'var(--primary-green)', fontWeight: 900, margin: 0 }}>
                      {lang === 'ar' ? 'المزامنة السحابية وقاعدة بيانات Firebase' : 'Firebase Cloud Sync & Database'}
                    </h3>
                    <p style={{ color: 'var(--text-light)', fontSize: '0.88rem', margin: '0.2rem 0 0 0' }}>
                      {lang === 'ar'
                        ? 'ربط الموقع السحابي لحفظ البيانات ومزامنتها لحظياً وفورياً بين الهواتف والأجهزة المختلفة.'
                        : 'Connect cloud database to synchronize data in real-time across all mobile and desktop devices.'}
                    </p>
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: 'rgba(76, 175, 80, 0.08)',
                  border: '1px solid rgba(76, 175, 80, 0.25)',
                  borderRadius: '12px',
                  padding: '1rem 1.2rem',
                  marginBottom: '1.5rem',
                  fontSize: '0.9rem',
                  lineHeight: 1.6,
                }}
              >
                <div style={{ fontWeight: 800, color: 'var(--primary-green)', marginBottom: '0.4rem' }}>
                  📌 {lang === 'ar' ? 'كيف تعمل المزامنة السحابية الحية؟' : 'How does Cloud Sync work?'}
                </div>
                <p style={{ margin: 0, color: 'var(--text-light)' }}>
                  {lang === 'ar'
                    ? 'عند إدخال إعدادات مشروع Firebase (أو تعريف متغيرات البيئة في Vercel)، يتم حفظ جميع الأفراد والأنشطة والصندوق فوراً في السحابة ومزامنتها على جميع هواتف القادة تلقائياً بمجرد فتح التطبيق.'
                    : 'When Firebase config is set (or added in Vercel Environment Variables), all records, members, activities, and finances sync across all devices in real-time.'}
                </p>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '1rem',
                  marginBottom: '1.2rem',
                }}
              >
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>Firebase API Key</label>
                  <input
                    type="text"
                    placeholder="AIzaSy..."
                    defaultValue={localStorage.getItem('scout_fb_apiKey') || ''}
                    id="fbApiKeyInput"
                    style={{ width: '100%', padding: '0.6rem 0.8rem', marginTop: '0.3rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>Project ID</label>
                  <input
                    type="text"
                    placeholder="scout-project-id"
                    defaultValue={localStorage.getItem('scout_fb_projectId') || ''}
                    id="fbProjectIdInput"
                    style={{ width: '100%', padding: '0.6rem 0.8rem', marginTop: '0.3rem' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>App ID</label>
                  <input
                    type="text"
                    placeholder="1:123456789:web:abcdef"
                    defaultValue={localStorage.getItem('scout_fb_appId') || ''}
                    id="fbAppIdInput"
                    style={{ width: '100%', padding: '0.6rem 0.8rem', marginTop: '0.3rem' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    const apiKey = (document.getElementById('fbApiKeyInput') as HTMLInputElement)?.value.trim();
                    const projectId = (document.getElementById('fbProjectIdInput') as HTMLInputElement)?.value.trim();
                    const appId = (document.getElementById('fbAppIdInput') as HTMLInputElement)?.value.trim();
                    
                    if (apiKey && projectId) {
                      const cfg = {
                        apiKey,
                        projectId,
                        appId: appId || '',
                        authDomain: `${projectId}.firebaseapp.com`,
                        storageBucket: `${projectId}.appspot.com`,
                      };
                      localStorage.setItem('scout_firebase_config', JSON.stringify(cfg));
                      localStorage.setItem('scout_fb_apiKey', apiKey);
                      localStorage.setItem('scout_fb_projectId', projectId);
                      localStorage.setItem('scout_fb_appId', appId);
                      showToast(
                        lang === 'ar'
                          ? 'تم حفظ إعدادات Firebase السحابية بنجاح! سيتم المزامنة تلقائياً.'
                          : 'Firebase Cloud config saved! Synchronizing in real-time.',
                        'success'
                      );
                      setTimeout(() => window.location.reload(), 800);
                    } else {
                      showToast(
                        lang === 'ar' ? 'يرجى إدخال API Key و Project ID على الأقل' : 'Please provide API Key and Project ID',
                        'warning'
                      );
                    }
                  }}
                >
                  ☁️ {lang === 'ar' ? 'حفظ إعدادات السحابة وتفعيل المزامنة' : 'Save Cloud Config'}
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ background: '#047857' }}
                  onClick={async () => {
                    const db = getFirebaseDb();
                    if (!db) {
                      showToast(
                        lang === 'ar' ? 'يرجى حفظ إعدادات السحابة أولاً' : 'Please configure cloud settings first',
                        'warning'
                      );
                      return;
                    }
                    try {
                      showToast(
                        lang === 'ar' ? 'جارٍ رفع كافة البيانات المحلية إلى السحابة...' : 'Uploading local data to cloud...',
                        'info'
                      );
                      // Upload users
                      for (const u of users) {
                        await setDoc(doc(db, 'users', String(u.id)), u);
                      }
                      // Upload members
                      for (const m of members) {
                        await setDoc(doc(db, 'members', String(m.id)), m);
                      }
                      // Upload payments
                      for (const p of payments) {
                        await setDoc(doc(db, 'payments', String(p.id)), p);
                      }
                      // Upload activities
                      for (const a of activities) {
                        await setDoc(doc(db, 'activities', String(a.id)), a);
                      }
                      showToast(
                        lang === 'ar' ? '⚡ تم رفع ومزامنة كافة السجلات إلى السحابة بنجاح!' : 'All records synced to cloud!',
                        'success'
                      );
                    } catch (err: any) {
                      console.error('Upload to cloud error:', err);
                      showToast(
                        lang === 'ar' 
                          ? 'تنبيه: تأكد من تفعيل Firestore Database في Firebase Console' 
                          : 'Error: Ensure Firestore Database is created in Firebase Console',
                        'error'
                      );
                    }
                  }}
                >
                  🚀 {lang === 'ar' ? 'رفع ومزامنة كافة البيانات الحالية إلى السحابة الآن' : 'Push Local Data to Cloud'}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    localStorage.removeItem('scout_firebase_config');
                    localStorage.removeItem('scout_fb_apiKey');
                    localStorage.removeItem('scout_fb_projectId');
                    localStorage.removeItem('scout_fb_appId');
                    showToast(
                      lang === 'ar' ? 'تمت إعادة الضبط لاستخدام المتغيرات المضمنة' : 'Reset to default config',
                      'info'
                    );
                  }}
                >
                  🔄 {lang === 'ar' ? 'إعادة ضبط' : 'Reset'}
                </button>
              </div>
            </div>

            {/* Danger Zone: Clear Members */}
            {onClearAllMembers && (
              <div
                style={{
                  border: '1px solid rgba(244, 67, 54, 0.3)',
                  background: 'rgba(244, 67, 54, 0.04)',
                  borderRadius: '14px',
                  padding: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h4 style={{ color: '#d32f2f', fontWeight: 800, marginBottom: '0.3rem' }}>
                      🗑️ {t.clearAllMembers}
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', margin: 0 }}>
                      {lang === 'ar'
                        ? 'إفراغ قائمة الأفراد وحذف الأسماء لبدء الإدخال الفعلي الجديد مع الحفاظ على القادة والحسابات.'
                        : 'Reset and clear all member records to start fresh while keeping leaders and accounts.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => setShowClearConfirm(true)}
                  >
                    🗑️ {t.clearAllMembers}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Clear All Members Confirmation Modal */}
      {showClearConfirm && (
        <div className="modal active" id="clearMembersConfirmModal">
          <div className="modal-content" style={{ maxWidth: '440px', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '0.8rem' }}>⚠️</div>
            <h3 style={{ color: '#d32f2f', fontWeight: 900, marginBottom: '0.8rem' }}>
              {t.clearAllMembers}
            </h3>
            <p style={{ color: 'var(--text-light)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              {t.clearMembersConfirm}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowClearConfirm(false)}
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => {
                  if (onClearAllMembers) {
                    onClearAllMembers();
                  }
                  setShowClearConfirm(false);
                }}
              >
                {lang === 'ar' ? 'نعم، مسح السجلات' : 'Yes, Clear Records'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User & Permissions Modal */}
      {editingUser && (
        <div className="modal active" id="editUserModal">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">
                {t.changeRole} - {editingUser.fullName}
              </h2>
              <button
                className="close-btn"
                onClick={() => setEditingUser(null)}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSavePermissions}>
              <div className="form-grid">
                <div className="form-group">
                  <label>{t.name}</label>
                  <input type="text" value={editingUser.fullName} readOnly />
                </div>

                <div className="form-group">
                  <label>{t.email}</label>
                  <input type="email" value={editingUser.email} readOnly />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>{t.role} / {lang === 'ar' ? 'الرتبة المحددة' : 'Role Preset'} *</label>
                  <select
                    value={selectedPresetId}
                    onChange={(e) => handlePresetSelect(e.target.value)}
                    style={{ fontWeight: 700 }}
                  >
                    <option value="supervisor_general">👑 {lang === 'ar' ? 'المشرف العام (كامل الصلاحيات المركزية)' : 'General Supervisor (Full Authority)'}</option>
                    
                    <optgroup label={lang === 'ar' ? '🐺 فئة الأشبال' : 'Cubs Section'}>
                      <option value="ashbal_admin">📋 {lang === 'ar' ? 'إدارة الأشبال (الأنشطة ومعلومات الأفراد فقط)' : 'Cubs Admin (Activities & Members)'}</option>
                      <option value="ashbal_treasurer">💰 {lang === 'ar' ? 'مسؤول صندوق الأشبال (التحكم في صندوق الأشبال فقط)' : 'Cubs Treasurer (Treasury Only)'}</option>
                      <option value="ashbal_troop_leader">⛺ {lang === 'ar' ? 'قائد فرقة الأشبال (إدارة أفراد فرقته في الأشبال)' : 'Cubs Troop Leader'}</option>
                    </optgroup>

                    <optgroup label={lang === 'ar' ? '⚜️ فئة الكشاف' : 'Scouts Section'}>
                      <option value="kashaf_admin">📋 {lang === 'ar' ? 'إدارة الكشاف (الأنشطة ومعلومات الأفراد فقط)' : 'Scouts Admin (Activities & Members)'}</option>
                      <option value="kashaf_treasurer">💰 {lang === 'ar' ? 'مسؤول صندوق الكشاف (التحكم في صندوق الكشاف فقط)' : 'Scouts Treasurer (Treasury Only)'}</option>
                      <option value="kashaf_troop_leader">⛺ {lang === 'ar' ? 'قائد فرقة الكشاف (إدارة أفراد فرقته في الكشاف)' : 'Scouts Troop Leader'}</option>
                    </optgroup>

                    <optgroup label={lang === 'ar' ? '⛺ فئة الكشاف المتقدم' : 'Senior Scouts Section'}>
                      <option value="mutaqadem_admin">📋 {lang === 'ar' ? 'إدارة الكشاف المتقدم (الأنشطة ومعلومات الأفراد فقط)' : 'Senior Scouts Admin'}</option>
                      <option value="mutaqadem_treasurer">💰 {lang === 'ar' ? 'مسؤول صندوق الكشاف المتقدم (التحكم في صندوق المتقدم فقط)' : 'Senior Scouts Treasurer'}</option>
                      <option value="mutaqadem_troop_leader">⛺ {lang === 'ar' ? 'قائد فرقة الكشاف المتقدم (إدارة أفراد فرقته في المتقدم)' : 'Senior Scouts Troop Leader'}</option>
                    </optgroup>

                    <optgroup label={lang === 'ar' ? '🧭 فئة الجوالة' : 'Rovers Section'}>
                      <option value="jawala_admin">📋 {lang === 'ar' ? 'إدارة الجوالة (الأنشطة ومعلومات الأفراد فقط)' : 'Rovers Admin'}</option>
                      <option value="jawala_treasurer">💰 {lang === 'ar' ? 'مسؤول صندوق الجوالة (التحكم في صندوق الجوالة فقط)' : 'Rovers Treasurer'}</option>
                      <option value="jawala_troop_leader">⛺ {lang === 'ar' ? 'قائد فرقة / رهط الجوالة (إدارة أفراد فرقته في الجوالة)' : 'Rovers Troop Leader'}</option>
                    </optgroup>

                    <optgroup label={lang === 'ar' ? '🎖️ فوج السجاد' : 'Al-Sajjad Regiment'}>
                      <option value="sajjad_leader_full">👑 {lang === 'ar' ? 'رتبة قائد فوج السجاد (كامل صلاحيات الفوج: أفراد + أنشطة + صندوق)' : 'Al-Sajjad Leader (Full Regiment Authority)'}</option>
                      <option value="sajjad_members">⛺ {lang === 'ar' ? 'رتبة مسؤول أفراد فوج السجاد (إدارة الأفراد فقط لا غير)' : 'Al-Sajjad Members Lead (Members Only)'}</option>
                      <option value="sajjad_activities">🎯 {lang === 'ar' ? 'رتبة مسؤول أنشطة فوج السجاد (إدارة الأنشطة فقط لا غير)' : 'Al-Sajjad Activities Lead (Activities Only)'}</option>
                      <option value="sajjad_treasurer">💰 {lang === 'ar' ? 'رتبة مسؤول صندوق فوج السجاد (التحكم بالصندوق المالي فقط لا غير)' : 'Al-Sajjad Treasurer (Treasury Only)'}</option>
                    </optgroup>

                    <optgroup label={lang === 'ar' ? '🎖️ فوج الباقر' : 'Al-Baqir Regiment'}>
                      <option value="baqir_leader_full">👑 {lang === 'ar' ? 'رتبة قائد فوج الباقر (كامل صلاحيات الفوج: أفراد + أنشطة + صندوق)' : 'Al-Baqir Leader (Full Regiment Authority)'}</option>
                      <option value="baqir_members">⛺ {lang === 'ar' ? 'رتبة مسؤول أفراد فوج الباقر (إدارة الأفراد فقط لا غير)' : 'Al-Baqir Members Lead (Members Only)'}</option>
                      <option value="baqir_activities">🎯 {lang === 'ar' ? 'رتبة مسؤول أنشطة فوج الباقر (إدارة الأنشطة فقط لا غير)' : 'Al-Baqir Activities Lead (Activities Only)'}</option>
                      <option value="baqir_treasurer">💰 {lang === 'ar' ? 'رتبة مسؤول صندوق فوج الباقر (التحكم بالصندوق المالي فقط لا غير)' : 'Al-Baqir Treasurer (Treasury Only)'}</option>
                    </optgroup>

                    <optgroup label={lang === 'ar' ? '🎖️ فوج ناصر الحسين' : 'Nasir Al-Hussein Regiment'}>
                      <option value="nasir_leader_full">👑 {lang === 'ar' ? 'رتبة قائد فوج ناصر الحسين (كامل صلاحيات الفوج: أفراد + أنشطة + صندوق)' : 'Nasir Al-Hussein Leader (Full Authority)'}</option>
                      <option value="nasir_members">⛺ {lang === 'ar' ? 'رتبة مسؤول أفراد فوج ناصر الحسين (إدارة الأفراد فقط لا غير)' : 'Nasir Al-Hussein Members Lead (Members Only)'}</option>
                      <option value="nasir_activities">🎯 {lang === 'ar' ? 'رتبة مسؤول أنشطة فوج ناصر الحسين (إدارة الأنشطة فقط لا غير)' : 'Nasir Al-Hussein Activities Lead (Activities Only)'}</option>
                      <option value="nasir_treasurer">💰 {lang === 'ar' ? 'رتبة مسؤول صندوق فوج ناصر الحسين (التحكم بالصندوق المالي فقط لا غير)' : 'Nasir Al-Hussein Treasurer (Treasury Only)'}</option>
                    </optgroup>

                    <optgroup label={lang === 'ar' ? '🎖️ فوج البدور المنيرة' : 'Al-Budoor Al-Muneera Regiment'}>
                      <option value="budoor_leader_full">👑 {lang === 'ar' ? 'رتبة قائد فوج البدور المنيرة (كامل صلاحيات الفوج: أفراد + أنشطة + صندوق)' : 'Al-Budoor Leader (Full Authority)'}</option>
                      <option value="budoor_members">⛺ {lang === 'ar' ? 'رتبة مسؤول أفراد فوج البدور المنيرة (إدارة الأفراد فقط لا غير)' : 'Al-Budoor Members Lead (Members Only)'}</option>
                      <option value="budoor_activities">🎯 {lang === 'ar' ? 'رتبة مسؤول أنشطة فوج البدور المنيرة (إدارة الأنشطة فقط لا غير)' : 'Al-Budoor Activities Lead (Activities Only)'}</option>
                      <option value="budoor_treasurer">💰 {lang === 'ar' ? 'رتبة مسؤول صندوق فوج البدور المنيرة (التحكم بالصندوق المالي فقط لا غير)' : 'Al-Budoor Treasurer (Treasury Only)'}</option>
                    </optgroup>

                    <optgroup label={lang === 'ar' ? '🎖️ إدارة عامة للأفواج' : 'General Regiments'}>
                      <option value="afwaj_admin">📋 {lang === 'ar' ? 'إدارة الأفواج العامة (أنشطة ومعلومات كافة الأفواج)' : 'General Regiments Admin'}</option>
                      <option value="afwaj_treasurer">💰 {lang === 'ar' ? 'مسؤول صندوق الأفواج العام (صندوق كافة الأفواج)' : 'General Regiments Treasurer'}</option>
                    </optgroup>

                    <option value="viewer">🛡️ {lang === 'ar' ? 'رتبة المحجوب (مشاهد لمحة الكشافة فقط لا غير)' : 'Restricted (Scout Overview Only)'}</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>{lang === 'ar' ? 'الفئة المخصصة' : 'Category'}</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                  >
                    <option value="">{lang === 'ar' ? 'عام / غير محدد' : 'General'}</option>
                    {Object.keys(INITIAL_CATEGORIES).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>{t.status} *</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as AppUser['status'])}
                  >
                    <option value="approved">{t.status_approved}</option>
                    <option value="suspended">{t.status_suspended}</option>
                    <option value="rejected">{t.status_rejected}</option>
                  </select>
                </div>

                {editRole === 'troop_leader' && (
                  <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                    <label>{lang === 'ar' ? 'الفرقة / الفوج المسؤول عنه' : 'Assigned Troop / Regiment'}</label>
                    <input
                      type="text"
                      value={editFirqa}
                      placeholder="مثال: فرقة لواء الحمد أو فوج الباقر"
                      onChange={(e) => setEditFirqa(e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Permissions Checkboxes */}
              <div
                style={{
                  background: 'var(--bg-main)',
                  padding: '1.25rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  marginBottom: '1.5rem',
                }}
              >
                <h4
                  style={{
                    color: 'var(--primary-green)',
                    fontWeight: 800,
                    marginBottom: '1rem',
                  }}
                >
                  {t.permissions}
                </h4>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                  }}
                >
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    <input
                      type="checkbox"
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      checked={editPermMembers || editRole === 'supervisor_general'}
                      disabled={editRole === 'supervisor_general'}
                      onChange={(e) => setEditPermMembers(e.target.checked)}
                    />
                    <span>{t.manageMembersPerm}</span>
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    <input
                      type="checkbox"
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      checked={editPermFinances || editRole === 'supervisor_general'}
                      disabled={editRole === 'supervisor_general'}
                      onChange={(e) => setEditPermFinances(e.target.checked)}
                    />
                    <span>{t.manageFinancesPerm}</span>
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    <input
                      type="checkbox"
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      checked={editPermActivities || editRole === 'supervisor_general'}
                      disabled={editRole === 'supervisor_general'}
                      onChange={(e) => setEditPermActivities(e.target.checked)}
                    />
                    <span>{t.manageActivitiesPerm}</span>
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.6rem',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    <input
                      type="checkbox"
                      style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      checked={editPermUsers || editRole === 'supervisor_general'}
                      disabled={editRole === 'supervisor_general'}
                      onChange={(e) => setEditPermUsers(e.target.checked)}
                    />
                    <span>{t.manageUsersPerm}</span>
                  </label>
                </div>

                <p
                  style={{
                    fontSize: '0.82rem',
                    color: 'var(--text-light)',
                    marginTop: '0.85rem',
                    marginBottom: 0,
                    lineHeight: '1.5',
                    background: 'rgba(0,0,0,0.03)',
                    padding: '0.6rem 0.8rem',
                    borderRadius: '6px',
                  }}
                >
                  {editRole === 'section_leader' &&
                    (lang === 'ar'
                      ? '📌 الصنف الأول (قائد قسم): مسؤول على إدارة القسم التابع له فقط.'
                      : '📌 Category 1 (Section Leader): Responsible for their section.')}
                  {editRole === 'troop_leader' &&
                    (lang === 'ar'
                      ? '📌 الصنف الثاني (قائد فرقة): مسؤول على إدارة فرقته فقط.'
                      : '📌 Category 2 (Troop Leader): Responsible for their troop only.')}
                  {editRole === 'treasurer' &&
                    (lang === 'ar'
                      ? '📌 الصنف الثالث (أمين صندوق): مسؤول على الصندوق فقط لا غير.'
                      : '📌 Category 3 (Treasurer): Responsible for treasury only.')}
                  {editRole === 'activities_lead' &&
                    (lang === 'ar'
                      ? '📌 الصنف الرابع (مسؤول أنشطة): لديه الصلاحية فقط على الأنشطة لا غير.'
                      : '📌 Category 4 (Activities Lead): Responsible for activities only.')}
                  {editRole === 'viewer' &&
                    (lang === 'ar'
                      ? '📌 الصنف الخامس (مشاهد فقط): ليس بإمكانه فعل أي شيء، ومحجوب عنه الصندوق والإيرادات بتاتاً.'
                      : '📌 Category 5 (Viewer): View-only, strictly restricted from treasury and revenue.')}
                  {editRole === 'supervisor_general' &&
                    (lang === 'ar'
                      ? '📌 المشرف العام: يمتلك كافة الصلاحيات وإدارة المستخدمين والشعار.'
                      : '📌 General Supervisor: Full administrative authority.')}
                </p>
              </div>

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <button type="submit" className="btn btn-primary">
                  {lang === 'ar' ? 'حفظ الصلاحيات' : 'Save Permissions'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setEditingUser(null)}
                >
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
                {editingUser.id !== currentUser.id && (
                  <button
                    type="button"
                    className="btn btn-danger"
                    style={{ marginInlineStart: 'auto', background: '#dc2626' }}
                    onClick={() => {
                      const u = editingUser;
                      setEditingUser(null);
                      setUserToDelete(u);
                    }}
                  >
                    🗑️ {lang === 'ar' ? 'حذف هذا الحساب نهائياً' : 'Delete Account'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {userToDelete && (
        <div
          className="modal-overlay active"
          onClick={() => setUserToDelete(null)}
          style={{ zIndex: 9999 }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '460px', textAlign: 'center' }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                background: 'rgba(239, 68, 68, 0.12)',
                color: 'var(--accent-red)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.8rem',
                margin: '0 auto 1.25rem',
              }}
            >
              🗑️
            </div>

            <h3 style={{ color: 'var(--accent-red)', fontWeight: 900, marginBottom: '0.5rem' }}>
              {lang === 'ar' ? 'تأكيد حذف الحساب نهائياً' : 'Confirm Permanent Deletion'}
            </h3>

            <p style={{ color: 'var(--text-light)', marginBottom: '1.25rem', fontSize: '0.92rem', lineHeight: '1.6' }}>
              {lang === 'ar'
                ? 'هل أنت متأكد من حذف هذا الحساب نهائياً من الموقع؟ سيتم إلغاء وصوله وإزالة بياناته بالكامل.'
                : 'Are you sure you want to permanently delete this account from the site? All access will be revoked.'}
            </p>

            <div
              style={{
                background: 'var(--bg-main)',
                padding: '1rem',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                marginBottom: '1.5rem',
                textAlign: lang === 'ar' ? 'right' : 'left',
              }}
            >
              <div style={{ marginBottom: '0.4rem' }}>
                <strong>{lang === 'ar' ? 'الاسم:' : 'Name:'}</strong> {userToDelete.fullName}
              </div>
              <div style={{ marginBottom: '0.4rem' }}>
                <strong>{lang === 'ar' ? 'البريد الإلكتروني:' : 'Email:'}</strong>{' '}
                <code style={{ direction: 'ltr' }}>{userToDelete.email}</code>
              </div>
              <div>
                <strong>{lang === 'ar' ? 'الرتبة:' : 'Role:'}</strong> {getRoleBadge(userToDelete.role)}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <button
                className="btn btn-danger"
                style={{ flex: 1 }}
                onClick={() => {
                  onDeleteUser(userToDelete.id);
                  setUserToDelete(null);
                }}
              >
                {lang === 'ar' ? 'نعم، احذف الحساب' : 'Yes, Delete'}
              </button>
              <button
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => setUserToDelete(null)}
              >
                {lang === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
