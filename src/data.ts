import { AppUser, Member, Payment, Activity, AppNotification } from './types';

export const INITIAL_CATEGORIES: Record<string, { key: string; firaq: string[] }> = {
  'أشبال': {
    key: 'ashbal',
    firaq: ['فرقة الشهيد حسين السويعدي', 'فرقة الياسين', 'فرقة الرضا', 'فرقة آل النبي'],
  },
  'كشاف': {
    key: 'kashaf',
    firaq: ['فرقة لواء الحمد', 'فرقة الشهيد أحمد علي حمود'],
  },
  'كشاف متقدم': {
    key: 'mutaqadem',
    firaq: ['لواء الحق'],
  },
  'جوال': {
    key: 'jwal',
    firaq: [],
  },
  'أفواج': {
    key: 'afwaj',
    firaq: ['فوج الباقر', 'فوج السجاد', 'فوج البدور المنيرة', 'فوج ناصر الحسين'],
  },
};

export const getDefaultPermissionsForRole = (role: AppUser['role']): AppUser['permissions'] => {
  switch (role) {
    case 'supervisor_general':
      return {
        canManageMembers: true,
        canManageFinances: true,
        canViewFinances: true,
        canManageActivities: true,
        canManageUsers: true,
      };
    case 'section_leader':
      // الصنف الاول :قائد قسم وهو المسؤل على الاقسام
      return {
        canManageMembers: true,
        canManageFinances: false,
        canViewFinances: false,
        canManageActivities: true,
        canManageUsers: false,
      };
    case 'troop_leader':
      // الصنف الثاني :قائد فرقة وهو المسؤل على الفرق فقط
      return {
        canManageMembers: true,
        canManageFinances: false,
        canViewFinances: false,
        canManageActivities: false,
        canManageUsers: false,
      };
    case 'treasurer':
      // الصنف الثالث : امين صندوق وهو المسؤل على الصندوق فقط لا غير
      return {
        canManageMembers: false,
        canManageFinances: true,
        canViewFinances: true,
        canManageActivities: false,
        canManageUsers: false,
      };
    case 'activities_lead':
      // الصنف الرابع :مسؤل انشطة لديه الصلاحية فقط على الانشطة لا غير
      return {
        canManageMembers: false,
        canManageFinances: false,
        canViewFinances: false,
        canManageActivities: true,
        canManageUsers: false,
      };
    case 'viewer':
    default:
      // الصنف الخامس:مشاهد فقط ليس بأمكانه فعل اي شيء لا يستطيع النضر الى الندوق ولا الايرادات بتاتا
      return {
        canManageMembers: false,
        canManageFinances: false,
        canViewFinances: false,
        canManageActivities: false,
        canManageUsers: false,
      };
  }
};

export const INITIAL_USERS: AppUser[] = [
  {
    id: 1,
    email: 'jafarmahmd1998@gmail.com',
    passcode: 'admin313',
    fullName: 'المشرف العام (جعفر محمود)',
    phone: '07800000313',
    role: 'supervisor_general',
    status: 'approved',
    permissions: {
      canManageMembers: true,
      canManageFinances: true,
      canViewFinances: true,
      canManageActivities: true,
      canManageUsers: true,
    },
    createdAt: '2026-01-01T00:00:00.000Z',
    approvedAt: '2026-01-01T00:00:00.000Z',
    approvedBy: 'النظام التأسيسي',
  }
];

export const DEFAULT_LOGO = '/scout_logo.jpg';

export const INITIAL_MEMBERS: Member[] = [];

export const INITIAL_PAYMENTS: Payment[] = [];

export const INITIAL_ACTIVITIES: Activity[] = [];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [];
