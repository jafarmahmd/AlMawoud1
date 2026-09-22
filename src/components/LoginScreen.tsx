import React, { useState } from 'react';
import { AppUser, Language } from '../types';
import { translations } from '../i18n';
import { DEFAULT_LOGO } from '../data';

interface LoginScreenProps {
  lang: Language;
  logo?: string;
  onLogin: (user: AppUser) => void;
  onRequestAccount: (data: {
    fullName: string;
    email: string;
    passcode: string;
    phone: string;
    requestedRole?: AppUser['role'];
    assignedCategory?: string;
    assignedFirqa?: string;
    requestNotes: string;
  }) => void;
  users: AppUser[];
  showToast: (msg: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  lang,
  logo = DEFAULT_LOGO,
  onLogin,
  onRequestAccount,
  users,
  showToast,
}) => {
  const t = translations[lang];
  const [isRegistering, setIsRegistering] = useState(false);

  // Login form state
  const [email, setEmail] = useState('');
  const [passcode, setPasscode] = useState('');

  // Request account form state (Standard clean fields only - no sensitive internal roles exposed)
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPasscode, setRegPasscode] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regNotes, setRegNotes] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = passcode.trim();

    const user = users.find(
      (u) => u.email.toLowerCase() === cleanEmail
    );

    if (!user) {
      showToast(
        lang === 'ar'
          ? 'البريد الإلكتروني غير مسجل في النظام'
          : 'Email is not registered in the system',
        'error'
      );
      return;
    }

    // Strict Password Verification
    if (user.passcode && user.passcode !== cleanPass) {
      showToast(
        lang === 'ar'
          ? 'كلمة المرور غير صحيحة، يرجى التأكد وإعادة المحاولة'
          : 'Incorrect password, please try again',
        'error'
      );
      return;
    }

    // Check approval status (Requirement 2: Approval exclusively by General Supervisor)
    if (user.status === 'pending') {
      showToast(
        lang === 'ar'
          ? 'طلبك قيد المراجعة حالياً. تكون الموافقة على دخول الموقع حصراً من المشرف العام.'
          : 'Your account is pending review. Access is granted exclusively by the General Supervisor.',
        'warning'
      );
      return;
    }

    if (user.status === 'rejected') {
      showToast(
        lang === 'ar'
          ? 'تم رفض طلب الانضمام من قبل المشرف العام.'
          : 'Your join request was declined by the General Supervisor.',
        'error'
      );
      return;
    }

    if (user.status === 'suspended') {
      showToast(
        lang === 'ar'
          ? 'تم تعليق هذا الحساب من قبل المشرف العام.'
          : 'This account has been suspended by the General Supervisor.',
        'error'
      );
      return;
    }

    // Approved!
    onLogin(user);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = regEmail.trim().toLowerCase();
    const cleanPass = regPasscode.trim();

    if (!cleanPass) {
      showToast(
        lang === 'ar' ? 'يرجى تعيين كلمة مرور قوية للحساب' : 'Please set a secure password',
        'error'
      );
      return;
    }

    // Check if email already exists
    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      showToast(
        lang === 'ar'
          ? 'هذا البريد الإلكتروني مسجل مسبقاً في النظام'
          : 'This email is already registered',
        'error'
      );
      return;
    }

    onRequestAccount({
      fullName: regFullName.trim(),
      email: cleanEmail,
      passcode: cleanPass,
      phone: regPhone.trim(),
      requestedRole: 'viewer',
      assignedCategory: undefined,
      assignedFirqa: undefined,
      requestNotes: regNotes.trim(),
    });

    setIsRegistering(false);
    setEmail(cleanEmail);
    setPasscode('');
    showToast(
      lang === 'ar'
        ? 'تم إرسال طلب إنشاء الحساب بنجاح. سيقوم المشرف العام بمراجعة طلبك وتحديد رتبتك وصلاحياتك.'
        : 'Registration request submitted successfully. The General Supervisor will review and assign your role.',
      'success'
    );
  };

  return (
    <div className="login-screen" id="loginScreen">
      <div className="login-card" id="loginCard">
        {/* Association Logo */}
        <img
          src={logo}
          className="login-logo"
          alt="شعار الجمعية"
        />

        {!isRegistering ? (
          <>
            <h1>{t.welcome}</h1>
            <p className="subtitle">{t.appSubtitle}</p>

            <form id="loginForm" onSubmit={handleLoginSubmit}>
              {/* Login via Email & Password with strict authentication */}
              <div className="form-group">
                <label id="lblEmail">{t.email} *</label>
                <input
                  id="loginEmail"
                  type="email"
                  required
                  placeholder={t.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label id="lblPasscode">{lang === 'ar' ? 'كلمة المرور / الرمز السري *' : 'Password *'}</label>
                <input
                  id="loginPasscode"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                />
              </div>

              <button
                type="submit"
                id="btnLoginSubmit"
                className="btn btn-primary"
                style={{ marginTop: '0.5rem', width: '100%' }}
              >
                {t.loginBtn}
              </button>

              <button
                type="button"
                id="btnToggleRegister"
                className="btn btn-outline"
                style={{ width: '100%', marginTop: '0.8rem' }}
                onClick={() => setIsRegistering(true)}
              >
                {t.requestAccountBtn}
              </button>

              <div style={{ marginTop: '1.2rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
                <a
                  id="btnLoginFacebookLink"
                  href="https://www.facebook.com/share/17vaxToxvv/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    color: '#1877F2',
                    textDecoration: 'none',
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '8px',
                    background: 'rgba(24, 119, 242, 0.08)',
                  }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  {lang === 'ar' ? 'صفحة الجمعية الرسمية على فيسبوك' : 'Official Scout Facebook Page'}
                </a>
              </div>
            </form>
          </>
        ) : (
          <>
            <h1>{t.registerTitle}</h1>
            <p className="subtitle">{t.registerSubtitle}</p>

            <form id="registerForm" onSubmit={handleRegisterSubmit}>
              <div className="form-group">
                <label>{t.fullName} *</label>
                <input
                  id="regFullName"
                  type="text"
                  required
                  placeholder="مثال: القائد علي محمد"
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>{t.email} *</label>
                <input
                  id="regEmail"
                  type="email"
                  required
                  placeholder="example@scout.org"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>{lang === 'ar' ? 'تعيين كلمة المرور *' : 'Set Password *'}</label>
                <input
                  id="regPasscode"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={regPasscode}
                  onChange={(e) => setRegPasscode(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>{t.phone} *</label>
                <input
                  id="regPhone"
                  type="tel"
                  required
                  placeholder="078xxxxxxxx"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>{t.notesOrReason} {lang === 'ar' ? '(اختياري)' : '(Optional)'}</label>
                <textarea
                  id="regNotes"
                  placeholder={
                    lang === 'ar'
                      ? 'وضح الفرقة التابع لها أو المهام الكشفية أو سبب طلب الانضمام (اختياري)'
                      : 'State your troop affiliation, scout role or reason for joining (optional)'
                  }
                  value={regNotes}
                  onChange={(e) => setRegNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div
                style={{
                  background: 'rgba(56, 161, 105, 0.1)',
                  border: '1px solid rgba(56, 161, 105, 0.3)',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  marginBottom: '1rem',
                  fontSize: '0.86rem',
                  color: 'var(--text-main)',
                  lineHeight: '1.5',
                }}
              >
                🔒 {lang === 'ar'
                  ? 'ملاحظة: لحماية خصوصية بيانات الجمعية وهيكليتها، تتم مراجعة كافة الطلبات وتحديد الرتب والصلاحيات المناسبة حصراً من قبل المشرف العام.'
                  : 'Note: To protect organizational privacy, all access requests and role assignments are reviewed exclusively by the General Supervisor.'}
              </div>

              <button
                type="submit"
                id="btnSubmitReg"
                className="btn btn-primary"
                style={{ marginTop: '0.5rem' }}
              >
                {t.submitRequest}
              </button>

              <button
                type="button"
                id="btnCancelReg"
                className="btn btn-outline"
                style={{ width: '100%', marginTop: '0.8rem' }}
                onClick={() => setIsRegistering(false)}
              >
                {t.backToLogin}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
