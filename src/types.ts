export type UserRole = 
  | 'supervisor_general' // المشرف العام - صلاحية كاملة
  | 'section_leader'     // قائد قسم
  | 'troop_leader'       // قائد فرقة
  | 'treasurer'          // أمين الصندوق
  | 'activities_lead'    // مسؤول الأنشطة
  | 'viewer';            // مشاهد فقط

export type AccountStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export interface UserPermissions {
  canManageMembers: boolean;
  canManageFinances: boolean;
  canViewFinances: boolean;
  canManageActivities: boolean;
  canManageUsers: boolean;
}

export interface AppUser {
  id: number | string;
  email: string;
  passcode: string;
  fullName: string;
  phone: string;
  role: UserRole;
  status: AccountStatus;
  assignedCategory?: string;
  assignedFirqa?: string;
  permissions: UserPermissions;
  requestNotes?: string;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
}

export interface Member {
  id: number;
  fullName: string;
  birthDate: string;
  age: number | string;
  category: string;
  firqa: string;
  phone: string;
  guardianPhone: string;
  address: string;
  school: string;
  grade: string;
  joinDate: string;
  badges: string;
  status: 'نشط' | 'غير نشط' | 'متوقف';
  notes: string;
  photo?: string;
  createdAt: string;
}

export interface Payment {
  id: number;
  memberId: number;
  amount: number | string;
  date: string;
  type: 'أسبوعي' | 'شهري' | 'رسوم نشاط' | 'رسوم معسكر' | 'تبرع' | 'أخرى';
  method: 'نقدا' | 'تحويل بنكي';
  notes: string;
  createdAt: string;
}

export interface Activity {
  id: number;
  name: string;
  type: string;
  date: string;
  category: string;
  firqa?: string;
  location: string;
  linkUrl?: string; // رابط أو URL للنشاط (خرائط، استمارة، بث، مجلد صور)
  cost: number | string;
  leaders: string[];
  present: string[];
  absent: string[];
  images: string[];
  description: string;
  status?: 'قائم' | 'مكتمل' | 'ملغي';
  cancelReason?: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'approval' | 'registration' | 'info' | 'financial' | 'activity';
  recipientId?: string | number | 'all' | 'supervisor';
  read: boolean;
  createdAt: string;
}

export type Language = 'ar' | 'en';
