import { useState, useEffect } from 'react';
import {
  AppUser,
  Member,
  Payment,
  Activity,
  AppNotification,
  Language,
} from './types';
import {
  INITIAL_USERS,
  INITIAL_MEMBERS,
  INITIAL_PAYMENTS,
  INITIAL_ACTIVITIES,
  INITIAL_NOTIFICATIONS,
  DEFAULT_LOGO,
  getDefaultPermissionsForRole,
} from './data';
import { translations } from './i18n';
import { LoginScreen } from './components/LoginScreen';
import { TopBar } from './components/TopBar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { CategoryView } from './components/CategoryView';
import { FirqaView } from './components/FirqaView';
import { UserManagementView } from './components/UserManagementView';
import { Modals } from './components/Modals';
import { getFirebaseDb, collection, doc, setDoc, onSnapshot, deleteDoc } from './lib/firebase';

export default function App() {
  // ============ PERSISTED STATES ============
  const [currentUser, setCurrentUser] = useState<AppUser | null>(() => {
    const saved = localStorage.getItem('currentUser');
    return saved ? JSON.parse(saved) : null;
  });

  // Site Logo with Local Storage persistence
  const [siteLogo, setSiteLogo] = useState<string>(() => {
    return localStorage.getItem('scoutSiteLogo') || DEFAULT_LOGO;
  });

  const [users, setUsers] = useState<AppUser[]>(() => {
    const saved = localStorage.getItem('scoutUsers');
    if (!saved) return INITIAL_USERS;
    try {
      const parsed: AppUser[] = JSON.parse(saved);
      const hasSupervisor = parsed.some(
        (u) => u.email.toLowerCase() === 'jafarmahmd1998@gmail.com'
      );
      if (!hasSupervisor) {
        return [...INITIAL_USERS, ...parsed];
      }
      return parsed;
    } catch {
      return INITIAL_USERS;
    }
  });

  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem('scoutMembers');
    if (!saved) return INITIAL_MEMBERS;
    try {
      return JSON.parse(saved);
    } catch {
      return INITIAL_MEMBERS;
    }
  });

  const [payments, setPayments] = useState<Payment[]>(() => {
    const saved = localStorage.getItem('scoutPayments');
    if (!saved) return INITIAL_PAYMENTS;
    try {
      return JSON.parse(saved);
    } catch {
      return INITIAL_PAYMENTS;
    }
  });

  const [activities, setActivities] = useState<Activity[]>(() => {
    const saved = localStorage.getItem('scoutActivities');
    if (!saved) return INITIAL_ACTIVITIES;
    try {
      return JSON.parse(saved);
    } catch {
      return INITIAL_ACTIVITIES;
    }
  });

  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('scoutNotifications');
    if (!saved) return INITIAL_NOTIFICATIONS;
    try {
      return JSON.parse(saved);
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem('scoutLang');
    return (saved as Language) || 'ar';
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('scoutDarkMode') === 'true';
  });

  // ============ REALTIME FIREBASE SYNC LISTENERS ============
  useEffect(() => {
    const db = getFirebaseDb();
    if (!db) return;

    // Listen to members
    const unsubMembers = onSnapshot(collection(db, 'members'), (snapshot) => {
      if (!snapshot.empty) {
        const cloudMembers: Member[] = [];
        snapshot.forEach((docSnap) => {
          cloudMembers.push(docSnap.data() as Member);
        });
        setMembers(cloudMembers);
        localStorage.setItem('scoutMembers', JSON.stringify(cloudMembers));
      }
    }, (err) => console.log('Firestore members listener:', err));

    // Listen to activities
    const unsubActivities = onSnapshot(collection(db, 'activities'), (snapshot) => {
      if (!snapshot.empty) {
        const cloudActs: Activity[] = [];
        snapshot.forEach((docSnap) => {
          cloudActs.push(docSnap.data() as Activity);
        });
        setActivities(cloudActs);
        localStorage.setItem('scoutActivities', JSON.stringify(cloudActs));
      }
    }, (err) => console.log('Firestore activities listener:', err));

    // Listen to payments
    const unsubPayments = onSnapshot(collection(db, 'payments'), (snapshot) => {
      if (!snapshot.empty) {
        const cloudPays: Payment[] = [];
        snapshot.forEach((docSnap) => {
          cloudPays.push(docSnap.data() as Payment);
        });
        setPayments(cloudPays);
        localStorage.setItem('scoutPayments', JSON.stringify(cloudPays));
      }
    }, (err) => console.log('Firestore payments listener:', err));

    // Listen to users
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      if (!snapshot.empty) {
        const cloudUsers: AppUser[] = [];
        snapshot.forEach((docSnap) => {
          cloudUsers.push(docSnap.data() as AppUser);
        });
        const hasSupervisor = cloudUsers.some(
          (u) => u.email.toLowerCase() === 'jafarmahmd1998@gmail.com'
        );
        const merged = hasSupervisor ? cloudUsers : [...INITIAL_USERS, ...cloudUsers];
        setUsers(merged);
        localStorage.setItem('scoutUsers', JSON.stringify(merged));
      }
    }, (err) => console.log('Firestore users listener:', err));

    // Listen to notifications
    const unsubNotifs = onSnapshot(collection(db, 'notifications'), (snapshot) => {
      if (!snapshot.empty) {
        const cloudNotifs: AppNotification[] = [];
        snapshot.forEach((docSnap) => {
          cloudNotifs.push(docSnap.data() as AppNotification);
        });
        cloudNotifs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setNotifications(cloudNotifs);
        localStorage.setItem('scoutNotifications', JSON.stringify(cloudNotifs));
      }
    }, (err) => console.log('Firestore notifications listener:', err));

    return () => {
      unsubMembers();
      unsubActivities();
      unsubPayments();
      unsubUsers();
      unsubNotifs();
    };
  }, []);

  // ============ NAVIGATION STATES ============
  const [currentView, setCurrentView] = useState<string>('dashboard');
  const [currentCategory, setCurrentCategory] = useState<string | null>(null);
  const [currentFirqa, setCurrentFirqa] = useState<string | null>(null);
  const [mobileActive, setMobileActive] = useState<boolean>(false);

  // ============ MODAL STATES ============
  const [showMemberModal, setShowMemberModal] = useState<boolean>(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [modalDefaultCat, setModalDefaultCat] = useState<string>('');
  const [modalDefaultFirqa, setModalDefaultFirqa] = useState<string>('');

  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false);
  const [paymentMember, setPaymentMember] = useState<Member | null>(null);

  const [showActivityModal, setShowActivityModal] = useState<boolean>(false);
  const [actDefaultCat, setActDefaultCat] = useState<string>('');
  const [actDefaultFirqa, setActDefaultFirqa] = useState<string>('');

  const [viewingMember, setViewingMember] = useState<Member | null>(null);
  const [viewingImage, setViewingImage] = useState<string | null>(null);

  // ============ TOAST NOTIFICATION ============
  const [toast, setToast] = useState<{
    msg: string;
    type: 'success' | 'error' | 'warning' | 'info';
    visible: boolean;
  }>({ msg: '', type: 'info', visible: false });

  const showToast = (
    msg: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info'
  ) => {
    setToast({ msg, type, visible: true });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 4500);
  };

  // Sync users to storage
  useEffect(() => {
    localStorage.setItem('scoutUsers', JSON.stringify(users));
  }, [users]);

  // Sync members to storage
  useEffect(() => {
    localStorage.setItem('scoutMembers', JSON.stringify(members));
  }, [members]);

  // Sync payments to storage
  useEffect(() => {
    localStorage.setItem('scoutPayments', JSON.stringify(payments));
  }, [payments]);

  // Sync activities to storage
  useEffect(() => {
    localStorage.setItem('scoutActivities', JSON.stringify(activities));
  }, [activities]);

  // Sync notifications to storage
  useEffect(() => {
    localStorage.setItem('scoutNotifications', JSON.stringify(notifications));
  }, [notifications]);

  // Sync site logo to storage
  useEffect(() => {
    localStorage.setItem('scoutSiteLogo', siteLogo);
  }, [siteLogo]);

  // Sync currentUser to storage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }, [currentUser]);

  // Sync Language and HTML dir
  useEffect(() => {
    localStorage.setItem('scoutLang', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // Sync Dark Mode
  useEffect(() => {
    localStorage.setItem('scoutDarkMode', darkMode.toString());
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  const toggleLang = () => {
    setLang((prev) => (prev === 'ar' ? 'en' : 'ar'));
  };

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  // ============ NOTIFICATION BROADCAST HELPER ============
  // Dispatches instant real-time notification to EVERY registered user and email
  const dispatchBroadcastNotification = (
    title: string,
    message: string,
    type: AppNotification['type'] = 'info'
  ) => {
    const newNotif: AppNotification = {
      id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      title,
      message,
      type,
      recipientId: 'all', // Dispatches to every registered email user
      read: false,
      createdAt: new Date().toISOString(),
    };

    setNotifications((prev) => [newNotif, ...prev]);

    const db = getFirebaseDb();
    if (db) {
      setDoc(doc(db, 'notifications', newNotif.id), newNotif).catch((e) =>
        console.error('Firestore notification save error:', e)
      );
    }
  };

  // ============ LOGO HANDLERS ============
  const handleUpdateLogo = (newLogo: string) => {
    setSiteLogo(newLogo);
    localStorage.setItem('scoutSiteLogo', newLogo);
    dispatchBroadcastNotification(
      lang === 'ar' ? 'تحديث شعار وهوية الموقع' : 'Site Logo Updated',
      lang === 'ar'
        ? `قام ${currentUser?.fullName || 'المشرف العام'} بتحديث الشعار الرسمي للموقع.`
        : `${currentUser?.fullName || 'General Supervisor'} updated the official site logo.`,
      'info'
    );
  };

  const handleResetLogo = () => {
    setSiteLogo(DEFAULT_LOGO);
    localStorage.removeItem('scoutSiteLogo');
    dispatchBroadcastNotification(
      lang === 'ar' ? 'استعادة الشعار الافتراضي' : 'Logo Reset to Default',
      lang === 'ar'
        ? `قام ${currentUser?.fullName || 'المشرف العام'} باستعادة الشعار الكشفي الافتراضي للموقع.`
        : `${currentUser?.fullName || 'General Supervisor'} restored the default scout logo.`,
      'info'
    );
  };

  // ============ AUTH HANDLERS ============
  const handleLogin = (user: AppUser) => {
    setCurrentUser(user);
    showToast(
      lang === 'ar'
        ? `أهلاً بك، ${user.fullName}!`
        : `Welcome, ${user.fullName}!`,
      'success'
    );
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    setCurrentCategory(null);
    setCurrentFirqa(null);
    setCurrentView('dashboard');
    showToast(
      lang === 'ar' ? 'تم تسجيل الخروج بنجاح' : 'Logged out successfully',
      'info'
    );
  };

  // Requirement 1 & 2: User requests account -> status pending awaiting supervisor approval
  const handleRequestAccount = (data: {
    fullName: string;
    email: string;
    passcode: string;
    phone: string;
    requestedRole?: AppUser['role'];
    assignedCategory?: string;
    assignedFirqa?: string;
    requestNotes: string;
  }) => {
    const newUser: AppUser = {
      id: Date.now(),
      email: data.email,
      passcode: data.passcode,
      fullName: data.fullName,
      phone: data.phone,
      role: data.requestedRole || 'viewer',
      status: 'pending', // Awaiting exclusive supervisor approval
      assignedCategory: data.assignedCategory,
      assignedFirqa: data.assignedFirqa,
      requestNotes: data.requestNotes,
      permissions: getDefaultPermissionsForRole(data.requestedRole || 'viewer'),
      createdAt: new Date().toISOString(),
    };

    setUsers((prev) => [...prev, newUser]);
    const db = getFirebaseDb();
    if (db) {
      setDoc(doc(db, 'users', String(newUser.id)), newUser).catch((e) =>
        console.error('Firestore save request account error:', e)
      );
    }

    // Create notification for the supervisor and broadcast to all registered users
    dispatchBroadcastNotification(
      lang === 'ar' ? 'طلب انضمام جديد قيد المراجعة' : 'New Join Request Pending',
      lang === 'ar'
        ? `سجل (${data.fullName} - ${data.email}) طلباً جديداً لدخول الموقع بانتظار اعتماد المشرف العام.`
        : `(${data.fullName} - ${data.email}) submitted a new access request awaiting supervisor approval.`,
      'registration'
    );
  };

  // Requirement 2, 3 & 4: General Supervisor Approves User & Instant Notification Dispatched!
  const handleApproveUser = (
    userToApprove: AppUser,
    role: AppUser['role'],
    perms: AppUser['permissions']
  ) => {
    const updatedUser: AppUser = {
      ...userToApprove,
      status: 'approved',
      role,
      permissions: perms,
      approvedAt: new Date().toISOString(),
      approvedBy: currentUser?.fullName || 'المشرف العام',
    };

    setUsers((prev) =>
      prev.map((u) => (u.id === userToApprove.id ? updatedUser : u))
    );

    const db = getFirebaseDb();
    if (db) {
      setDoc(doc(db, 'users', String(userToApprove.id)), updatedUser).catch((e) =>
        console.error('Firestore approve user error:', e)
      );
    }

    // Requirement 4: Instant Notification to All Registered Users
    dispatchBroadcastNotification(
      lang === 'ar' ? 'تم اعتماد وتفعيل حساب مستخدم' : 'User Account Approved',
      lang === 'ar'
        ? `وافق المشرف العام على منح حق الدخول للمستخدم (${userToApprove.fullName} - ${userToApprove.email}) برتبة: ${role}.`
        : `General Supervisor approved access for (${userToApprove.fullName} - ${userToApprove.email}) with role: ${role}.`,
      'approval'
    );

    // Instant toast announcement
    showToast(
      lang === 'ar'
        ? `⚡ إشعار فوري: تمت الموافقة على طلب (${userToApprove.fullName}) وتفعيل حسابه بنجاح!`
        : `⚡ Instant Alert: User (${userToApprove.fullName}) approved and access enabled!`,
      'success'
    );
  };

  const handleRejectUser = (userToReject: AppUser) => {
    const updatedUser: AppUser = { ...userToReject, status: 'rejected' };
    setUsers((prev) =>
      prev.map((u) => (u.id === userToReject.id ? updatedUser : u))
    );
    const db = getFirebaseDb();
    if (db) {
      setDoc(doc(db, 'users', String(userToReject.id)), updatedUser).catch((e) =>
        console.error('Firestore reject user error:', e)
      );
    }
    dispatchBroadcastNotification(
      lang === 'ar' ? 'رفض طلب انضمام' : 'Join Request Rejected',
      lang === 'ar'
        ? `قام المشرف العام برفض طلب الانضمام للمستخدم (${userToReject.fullName} - ${userToReject.email}).`
        : `General Supervisor rejected access request for (${userToReject.fullName} - ${userToReject.email}).`,
      'info'
    );
    showToast(
      lang === 'ar'
        ? `تم رفض طلب ${userToReject.fullName}`
        : `Request for ${userToReject.fullName} declined`,
      'info'
    );
  };

  const handleUpdatePermissions = (
    userId: string | number,
    role: AppUser['role'],
    perms: AppUser['permissions'],
    status: AppUser['status'],
    assignedCategory?: string,
    assignedFirqa?: string
  ) => {
    const targetUser = users.find((u) => u.id === userId);
    let updatedTarget: AppUser | null = null;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          updatedTarget = {
            ...u,
            role,
            permissions: perms,
            status,
            assignedCategory,
            assignedFirqa,
          };
          return updatedTarget;
        }
        return u;
      })
    );

    const db = getFirebaseDb();
    if (db && updatedTarget) {
      setDoc(doc(db, 'users', String(userId)), updatedTarget).catch((e) =>
        console.error('Firestore update permissions error:', e)
      );
    }

    // If current logged-in user updated their own role
    if (currentUser && currentUser.id === userId) {
      setCurrentUser((prev) =>
        prev
          ? {
              ...prev,
              role,
              permissions: perms,
              status,
              assignedCategory,
              assignedFirqa,
            }
          : null
      );
    }

    dispatchBroadcastNotification(
      lang === 'ar' ? 'تحديث رتبة وصلاحيات مستخدم' : 'User Permissions Updated',
      lang === 'ar'
        ? `تم تحديث صلاحيات ورتبة المستخدم (${targetUser?.fullName || ''} - ${targetUser?.email || ''}) إلى: ${role}.`
        : `Updated role & permissions for user (${targetUser?.fullName || ''} - ${targetUser?.email || ''}) to: ${role}.`,
      'info'
    );
  };

  const handleDeleteUser = (userId: string | number) => {
    const targetUser = users.find((u) => u.id === userId);
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    const db = getFirebaseDb();
    if (db) {
      deleteDoc(doc(db, 'users', String(userId))).catch((e) =>
        console.error('Firestore delete user error:', e)
      );
    }
    dispatchBroadcastNotification(
      lang === 'ar' ? 'حذف حساب مستخدم' : 'User Account Deleted',
      lang === 'ar'
        ? `قام المشرف بحذف حساب (${targetUser?.fullName || ''} - ${targetUser?.email || ''}) من النظام.`
        : `Supervisor removed user account (${targetUser?.fullName || ''} - ${targetUser?.email || ''}).`,
      'info'
    );
    showToast(
      lang === 'ar' ? 'تم حذف المستخدم من النظام' : 'User deleted',
      'info'
    );
  };

  const handleMarkNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast(
      lang === 'ar'
        ? 'تم تحديد جميع الإشعارات كمقروءة'
        : 'All notifications marked as read',
      'info'
    );
  };

  // ============ NAVIGATION ============
  const handleNavigate = (
    view: string,
    cat: string | null = null,
    firqa: string | null = null
  ) => {
    if (currentUser?.role === 'viewer') {
      setCurrentView('dashboard');
      setCurrentCategory(null);
      setCurrentFirqa(null);
      return;
    }
    setCurrentView(view);
    setCurrentCategory(cat);
    setCurrentFirqa(firqa);
  };

  // ============ MEMBER HANDLERS ============
  const handleOpenAddMember = (cat: string, firqa: string) => {
    setEditingMember(null);
    setModalDefaultCat(cat);
    setModalDefaultFirqa(firqa);
    setShowMemberModal(true);
  };

  const handleEditMember = (member: Member) => {
    setEditingMember(member);
    setShowMemberModal(true);
  };

  const handleSaveMember = (memberData: Partial<Member>) => {
    const db = getFirebaseDb();
    if (editingMember) {
      const updatedMember = { ...editingMember, ...memberData } as Member;
      setMembers((prev) =>
        prev.map((m) =>
          m.id === editingMember.id ? updatedMember : m
        )
      );
      if (db) {
        setDoc(doc(db, 'members', String(updatedMember.id)), updatedMember).catch((e) =>
          console.error('Firestore save member error:', e)
        );
      }
      dispatchBroadcastNotification(
        lang === 'ar' ? 'تعديل بيانات فرد كشفي' : 'Scout Member Updated',
        lang === 'ar'
          ? `قام (${currentUser?.fullName || 'القائد'}) بتحديث بيانات الفرد (${memberData.fullName}) في قسم (${editingMember.category}).`
          : `(${currentUser?.fullName || 'Leader'}) updated scout member profile: (${memberData.fullName}).`,
        'info'
      );
      showToast(
        lang === 'ar'
          ? `تم تحديث بيانات ${memberData.fullName}`
          : `Updated ${memberData.fullName}`,
        'success'
      );
    } else {
      const newMember: Member = {
        id: Date.now(),
        fullName: memberData.fullName || '',
        birthDate: memberData.birthDate || '',
        age: memberData.age || 0,
        category: memberData.category || 'أشبال',
        firqa: memberData.firqa || '',
        phone: memberData.phone || '',
        guardianPhone: memberData.guardianPhone || '',
        address: memberData.address || '',
        school: memberData.school || '',
        grade: memberData.grade || '',
        joinDate: memberData.joinDate || new Date().toISOString().split('T')[0],
        badges: memberData.badges || '',
        status: memberData.status || 'نشط',
        notes: memberData.notes || '',
        photo: memberData.photo || '',
        createdAt: new Date().toISOString(),
      };
      setMembers((prev) => [...prev, newMember]);
      if (db) {
        setDoc(doc(db, 'members', String(newMember.id)), newMember).catch((e) =>
          console.error('Firestore save new member error:', e)
        );
      }
      dispatchBroadcastNotification(
        lang === 'ar' ? 'إضافة فرد كشفي جديد' : 'New Scout Member Added',
        lang === 'ar'
          ? `أضاف (${currentUser?.fullName || 'القائد'}) فرداً كشفياً جديداً: (${newMember.fullName}) إلى قسم (${newMember.category} - ${newMember.firqa || 'عام'}).`
          : `(${currentUser?.fullName || 'Leader'}) registered new scout member: (${newMember.fullName}) in (${newMember.category} - ${newMember.firqa || 'General'}).`,
        'info'
      );
      showToast(
        lang === 'ar'
          ? `تم إضافة الفرد ${newMember.fullName} بنجاح`
          : `Added member ${newMember.fullName}`,
        'success'
      );
    }
    setShowMemberModal(false);
  };

  const handleDeleteMember = (memberId: number) => {
    const m = members.find((x) => x.id === memberId);
    if (!m) return;
    setMembers((prev) => prev.filter((x) => x.id !== memberId));
    const db = getFirebaseDb();
    if (db) {
      deleteDoc(doc(db, 'members', String(memberId))).catch((e) =>
        console.error('Firestore delete member error:', e)
      );
    }
    dispatchBroadcastNotification(
      lang === 'ar' ? 'حذف فرد كشفي' : 'Scout Member Deleted',
      lang === 'ar'
        ? `قام (${currentUser?.fullName || 'القائد'}) بحذف سجل الفرد الكشفي (${m.fullName}) من قسم (${m.category}).`
        : `(${currentUser?.fullName || 'Leader'}) removed scout member (${m.fullName}) from (${m.category}).`,
      'info'
    );
    showToast(
      lang === 'ar' ? `تم حذف ${m.fullName}` : `Deleted ${m.fullName}`,
      'info'
    );
  };

  // ============ PAYMENT HANDLERS ============
  const handleOpenAddPayment = (memberId: number) => {
    const m = members.find((x) => x.id === memberId);
    if (!m) return;
    setPaymentMember(m);
    setShowPaymentModal(true);
  };

  const handleSavePayment = (paymentData: Partial<Payment>) => {
    const newPayment: Payment = {
      id: Date.now(),
      memberId: paymentData.memberId || 0,
      amount: paymentData.amount || 0,
      date: paymentData.date || new Date().toISOString().split('T')[0],
      type: paymentData.type || 'أسبوعي',
      method: paymentData.method || 'نقدا',
      notes: paymentData.notes || '',
      createdAt: new Date().toISOString(),
    };
    setPayments((prev) => [...prev, newPayment]);
    const db = getFirebaseDb();
    if (db) {
      setDoc(doc(db, 'payments', String(newPayment.id)), newPayment).catch((e) =>
        console.error('Firestore save payment error:', e)
      );
    }
    const m = members.find((x) => x.id === newPayment.memberId);
    
    dispatchBroadcastNotification(
      lang === 'ar' ? 'تسجيل حركة مالية جديدة' : 'New Financial Payment',
      lang === 'ar'
        ? `سجل (${currentUser?.fullName || 'المسؤول'}) دفعة مالية بقيمة ${Number(newPayment.amount).toLocaleString()} د.ع للعضو (${m?.fullName || ''}) [نوع: ${newPayment.type} - طريقة الدفع: ${newPayment.method}].`
        : `(${currentUser?.fullName || 'Leader'}) recorded payment of ${Number(newPayment.amount).toLocaleString()} IQD for member (${m?.fullName || ''}).`,
      'financial'
    );

    showToast(
      lang === 'ar'
        ? `تم تسجيل دفعة بقيمة ${newPayment.amount} IQD للعضو ${m?.fullName || ''}`
        : `Recorded payment of ${newPayment.amount} IQD for ${m?.fullName || ''}`,
      'success'
    );
    setShowPaymentModal(false);
  };

  // ============ ACTIVITY HANDLERS ============
  const handleOpenAddActivity = (cat: string, firqa: string) => {
    setActDefaultCat(cat);
    setActDefaultFirqa(firqa);
    setShowActivityModal(true);
  };

  const handleSaveActivity = (activityData: Partial<Activity>) => {
    const newAct: Activity = {
      id: Date.now(),
      name: activityData.name || '',
      type: activityData.type || 'اجتماع',
      status: activityData.status || 'قائم',
      date: activityData.date || new Date().toISOString().split('T')[0],
      category: activityData.category || 'الجميع',
      firqa: activityData.firqa || '',
      location: activityData.location || '',
      cost: activityData.cost || 0,
      linkUrl: activityData.linkUrl || '',
      leaders: activityData.leaders || [],
      present: activityData.present || [],
      absent: activityData.absent || [],
      images: activityData.images || [],
      description: activityData.description || '',
      createdAt: new Date().toISOString(),
    };
    setActivities((prev) => [...prev, newAct]);
    const db = getFirebaseDb();
    if (db) {
      setDoc(doc(db, 'activities', String(newAct.id)), newAct).catch((e) =>
        console.error('Firestore save activity error:', e)
      );
    }

    dispatchBroadcastNotification(
      lang === 'ar' ? 'إنشاء نشاط وفعالية جديدة' : 'New Activity Announced',
      lang === 'ar'
        ? `أعلن (${currentUser?.fullName || 'القائد'}) عن نشاط جديد: "${newAct.name}" (${newAct.type}) بتاريخ ${newAct.date} لقسم (${newAct.category} - ${newAct.firqa || 'الجميع'}).`
        : `(${currentUser?.fullName || 'Leader'}) scheduled new activity: "${newAct.name}" (${newAct.type}) on ${newAct.date}.`,
      'activity'
    );

    showToast(
      lang === 'ar'
        ? `تمت إضافة النشاط "${newAct.name}" بنجاح`
        : `Added activity "${newAct.name}"`,
      'success'
    );
    setShowActivityModal(false);
  };

  const handleDeleteActivity = (activityId: number) => {
    const act = activities.find((a) => a.id === activityId);
    if (!act) return;
    setActivities((prev) => prev.filter((a) => a.id !== activityId));
    const db = getFirebaseDb();
    if (db) {
      deleteDoc(doc(db, 'activities', String(activityId))).catch((e) =>
        console.error('Firestore delete activity error:', e)
      );
    }

    dispatchBroadcastNotification(
      lang === 'ar' ? 'حذف نشاط كشفي' : 'Activity Deleted',
      lang === 'ar'
        ? `قام (${currentUser?.fullName || 'القائد'}) بحذف النشاط: "${act.name}".`
        : `(${currentUser?.fullName || 'Leader'}) deleted activity: "${act.name}".`,
      'activity'
    );

    showToast(translations[lang].activityDeletedSuccess, 'info');
  };

  const handleToggleCancelActivity = (activityId: number) => {
    const act = activities.find((a) => a.id === activityId);
    if (!act) return;
    const isCancelled = act.status === 'ملغي';
    const newStatus: Activity['status'] = isCancelled ? 'قائم' : 'ملغي';
    const updatedAct = { ...act, status: newStatus };
    setActivities((prev) =>
      prev.map((a) => (a.id === activityId ? updatedAct : a))
    );
    const db = getFirebaseDb();
    if (db) {
      setDoc(doc(db, 'activities', String(activityId)), updatedAct).catch((e) =>
        console.error('Firestore toggle cancel activity error:', e)
      );
    }

    dispatchBroadcastNotification(
      isCancelled
        ? (lang === 'ar' ? 'إعادة تفعيل نشاط كشفي' : 'Activity Reactivated')
        : (lang === 'ar' ? 'إلغاء نشاط كشفي' : 'Activity Cancelled'),
      isCancelled
        ? (lang === 'ar'
            ? `قام (${currentUser?.fullName || 'القائد'}) بإعادة تفعيل النشاط: "${act.name}".`
            : `(${currentUser?.fullName || 'Leader'}) reactivated activity: "${act.name}".`)
        : (lang === 'ar'
            ? `قام (${currentUser?.fullName || 'القائد'}) بإلغاء النشاط: "${act.name}".`
            : `(${currentUser?.fullName || 'Leader'}) cancelled activity: "${act.name}".`),
      'activity'
    );

    showToast(
      isCancelled
        ? translations[lang].activityReactivatedSuccess
        : translations[lang].activityCancelledSuccess,
      isCancelled ? 'success' : 'warning'
    );
  };

  // Requirement 2: Reset / Clear Troop Fund (delete all troop payments)
  const handleResetFirqaFund = (category: string, firqa: string) => {
    const firqaMemberIds = members
      .filter((m) => m.category === category && m.firqa === firqa)
      .map((m) => m.id);

    setPayments((prev) => prev.filter((p) => !firqaMemberIds.includes(p.memberId)));

    dispatchBroadcastNotification(
      lang === 'ar' ? 'تصفير صندوق الفرقة' : 'Troop Fund Reset',
      lang === 'ar'
        ? `قام (${currentUser?.fullName || 'القائد'}) بتصفير وإعادة ضبط صندوق فرقة (${firqa} - ${category}).`
        : `(${currentUser?.fullName || 'Leader'}) reset troop fund for (${firqa} - ${category}).`,
      'financial'
    );

    showToast(translations[lang].troopFundResetSuccess, 'success');
  };

  // ============ DATA BACKUP & RESTORE ============
  const handleExportBackup = () => {
    try {
      const backupData = {
        appName: 'جمعية كشافة الموعود الإسلامية',
        systemVersion: '2.0.0',
        exportedAt: new Date().toISOString(),
        exportedBy: currentUser?.fullName || 'المشرف العام',
        data: {
          members,
          payments,
          activities,
          users,
          notifications,
          lang,
          darkMode,
        },
      };

      const jsonStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];
      a.href = url;
      a.download = `scout_database_backup_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast(translations[lang].exportBackupSuccess, 'success');
    } catch {
      showToast(
        lang === 'ar' ? 'فشل تصدير النسخة الاحتياطية' : 'Failed to export backup',
        'error'
      );
    }
  };

  const handleImportBackup = (importedJson: any) => {
    try {
      if (!importedJson || typeof importedJson !== 'object') {
        showToast(translations[lang].importBackupError, 'error');
        return;
      }

      const payload = importedJson.data || importedJson;

      if (Array.isArray(payload.members)) {
        setMembers(payload.members);
        localStorage.setItem('scoutMembers', JSON.stringify(payload.members));
      }
      if (Array.isArray(payload.payments)) {
        setPayments(payload.payments);
        localStorage.setItem('scoutPayments', JSON.stringify(payload.payments));
      }
      if (Array.isArray(payload.activities)) {
        setActivities(payload.activities);
        localStorage.setItem('scoutActivities', JSON.stringify(payload.activities));
      }
      if (Array.isArray(payload.users)) {
        setUsers(payload.users);
        localStorage.setItem('scoutUsers', JSON.stringify(payload.users));
      }
      if (Array.isArray(payload.notifications)) {
        setNotifications(payload.notifications);
        localStorage.setItem('scoutNotifications', JSON.stringify(payload.notifications));
      }

      dispatchBroadcastNotification(
        lang === 'ar' ? 'استعادة قاعدة البيانات من نسخة احتياطية' : 'Database Restored from Backup',
        lang === 'ar'
          ? `تم استيراد واسترجاع بيانات النظام بنجاح بواسطة (${currentUser?.fullName || 'المشرف العام'}).`
          : `Database restored from backup file by (${currentUser?.fullName || 'General Supervisor'}).`,
        'info'
      );

      showToast(translations[lang].importBackupSuccess, 'success');
    } catch {
      showToast(translations[lang].importBackupError, 'error');
    }
  };

  const handleClearAllMembers = () => {
    setMembers([]);
    setPayments([]);
    localStorage.removeItem('scoutMembers');
    localStorage.removeItem('scoutPayments');

    dispatchBroadcastNotification(
      lang === 'ar' ? 'مسح وتصفير سجلات الأفراد' : 'All Member Records Cleared',
      lang === 'ar'
        ? `قام المشرف العام (${currentUser?.fullName}) بمسح سجلات الأفراد للبدء بإدخال بيانات حقيقية جديدة.`
        : `General Supervisor (${currentUser?.fullName}) cleared all scout member records.`,
      'info'
    );

    showToast(translations[lang].allMembersCleared, 'info');
  };

  // Determine top bar page title
  const getPageTitle = () => {
    const t = translations[lang];
    if (currentUser?.role === 'viewer') {
      return lang === 'ar' ? 'لمحة الكشافة ورسالة الجمعية' : 'Scout Overview';
    }
    if (currentView === 'users') return t.userManagement;
    if (currentFirqa) return currentFirqa;
    if (currentCategory) return `${lang === 'ar' ? 'قسم' : 'Section'} ${currentCategory}`;
    return t.dashboard;
  };

  const pendingCount = users.filter((u) => u.status === 'pending').length;

  // Filter notifications relevant to current user
  const userNotifications = notifications.filter(
    (n) =>
      n.recipientId === 'all' ||
      n.recipientId === currentUser?.id ||
      (n.recipientId === 'supervisor' &&
        (currentUser?.role === 'supervisor_general' ||
          currentUser?.permissions.canManageUsers))
  );

  return (
    <>
      {/* Toast Alert matching original scout styling */}
      <div
        className={`notification ${toast.type} ${toast.visible ? 'active' : ''}`}
        id="notification"
      >
        {toast.msg}
      </div>

      {/* Screen 1: Login / Request Account Screen */}
      {!currentUser ? (
        <LoginScreen
          lang={lang}
          logo={siteLogo}
          onLogin={handleLogin}
          onRequestAccount={handleRequestAccount}
          users={users}
          showToast={showToast}
        />
      ) : (
        /* Screen 2: Main Scout Management Application */
        <div className="app-container active" id="appContainer">
          <Sidebar
            currentUser={currentUser}
            currentView={currentView}
            currentCategory={currentCategory}
            currentFirqa={currentFirqa}
            pendingUsersCount={pendingCount}
            lang={lang}
            logo={siteLogo}
            onNavigate={handleNavigate}
            onLogout={handleLogout}
            mobileActive={mobileActive}
            onCloseMobile={() => setMobileActive(false)}
          />

          <main className="main-content">
            <TopBar
              pageTitle={getPageTitle()}
              lang={lang}
              onToggleLang={toggleLang}
              darkMode={darkMode}
              onToggleDarkMode={toggleDarkMode}
              notifications={userNotifications}
              onMarkNotificationsRead={handleMarkNotificationsRead}
              onToggleSidebar={() => setMobileActive(!mobileActive)}
              onLogout={handleLogout}
              showQuickAdd={
                !!(
                  currentFirqa &&
                  currentUser.permissions?.canManageMembers
                )
              }
              onQuickAdd={() =>
                handleOpenAddMember(currentCategory || '', currentFirqa || '')
              }
            />

            <div className="content-area" id="contentArea">
              {currentView === 'users' ? (
                <UserManagementView
                  currentUser={currentUser}
                  users={users}
                  members={members}
                  payments={payments}
                  activities={activities}
                  lang={lang}
                  siteLogo={siteLogo}
                  onUpdateLogo={handleUpdateLogo}
                  onResetLogo={handleResetLogo}
                  onClearAllMembers={handleClearAllMembers}
                  onExportBackup={handleExportBackup}
                  onImportBackup={handleImportBackup}
                  onApproveUser={handleApproveUser}
                  onRejectUser={handleRejectUser}
                  onUpdatePermissions={handleUpdatePermissions}
                  onDeleteUser={handleDeleteUser}
                  showToast={showToast}
                />
              ) : currentFirqa ? (
                <FirqaView
                  category={currentCategory || ''}
                  firqa={currentFirqa}
                  members={members}
                  payments={payments}
                  activities={activities}
                  currentUser={currentUser}
                  lang={lang}
                  onNavigateToDashboard={() => handleNavigate('dashboard')}
                  onNavigateToCategory={(cat) => handleNavigate('category', cat)}
                  onOpenAddMember={handleOpenAddMember}
                  onOpenAddPayment={handleOpenAddPayment}
                  onOpenAddActivity={handleOpenAddActivity}
                  onViewMember={(m) => setViewingMember(m)}
                  onEditMember={handleEditMember}
                  onDeleteMember={handleDeleteMember}
                  onViewImage={(img) => setViewingImage(img)}
                  onDeleteActivity={handleDeleteActivity}
                  onToggleCancelActivity={handleToggleCancelActivity}
                  onResetFirqaFund={handleResetFirqaFund}
                />
              ) : currentCategory ? (
                <CategoryView
                  category={currentCategory}
                  members={members}
                  payments={payments}
                  activities={activities}
                  currentUser={currentUser}
                  lang={lang}
                  onSelectFirqa={(f) => handleNavigate('firqa', currentCategory, f)}
                  onOpenAddMember={handleOpenAddMember}
                  onOpenAddPayment={handleOpenAddPayment}
                  onOpenAddActivity={handleOpenAddActivity}
                  onViewMember={(m) => setViewingMember(m)}
                  onEditMember={handleEditMember}
                  onDeleteMember={handleDeleteMember}
                  onViewImage={(img) => setViewingImage(img)}
                  onDeleteActivity={handleDeleteActivity}
                  onToggleCancelActivity={handleToggleCancelActivity}
                />
              ) : (
                <DashboardView
                  currentUser={currentUser}
                  members={members}
                  payments={payments}
                  activities={activities}
                  lang={lang}
                  onSelectCategory={(cat) => handleNavigate('category', cat)}
                />
              )}
            </div>
          </main>
        </div>
      )}

      {/* Global Action Modals */}
      <Modals
        lang={lang}
        showMemberModal={showMemberModal}
        editingMember={editingMember}
        defaultCategory={modalDefaultCat}
        defaultFirqa={modalDefaultFirqa}
        onCloseMemberModal={() => setShowMemberModal(false)}
        onSaveMember={handleSaveMember}
        showPaymentModal={showPaymentModal}
        paymentMember={paymentMember}
        onClosePaymentModal={() => setShowPaymentModal(false)}
        onSavePayment={handleSavePayment}
        showActivityModal={showActivityModal}
        defaultActCategory={actDefaultCat}
        defaultActFirqa={actDefaultFirqa}
        onCloseActivityModal={() => setShowActivityModal(false)}
        onSaveActivity={handleSaveActivity}
        viewingMember={viewingMember}
        onCloseViewMember={() => setViewingMember(null)}
        viewingImage={viewingImage}
        onCloseViewImage={() => setViewingImage(null)}
      />
    </>
  );
}
