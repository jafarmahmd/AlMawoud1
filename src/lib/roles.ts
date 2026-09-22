import { AppUser, UserPermissions } from '../types';

export interface RolePreset {
  id: string;
  categoryGroup?: string;
  labelAr: string;
  labelEn: string;
  role: AppUser['role'];
  assignedCategory?: string;
  assignedFirqa?: string;
  descriptionAr: string;
  permissions: UserPermissions;
}

export const ROLE_PRESETS: RolePreset[] = [
  {
    id: 'supervisor_general',
    labelAr: 'المشرف العام (كامل الصلاحيات والتحكم المركزي)',
    labelEn: 'General Supervisor (Full Authority)',
    role: 'supervisor_general',
    assignedCategory: undefined,
    descriptionAr: 'الصلاحية الكاملة والمطلقة على كافة الأقسام والأفواج، الصناديق، الأنشطة، إدارة المستخدمين، والشعار.',
    permissions: {
      canManageMembers: true,
      canManageFinances: true,
      canViewFinances: true,
      canManageActivities: true,
      canManageUsers: true,
    },
  },

  // ===== فئة الأشبال =====
  {
    id: 'ashbal_admin',
    categoryGroup: 'فئة الأشبال',
    labelAr: 'رتبة إدارة الأشبال (الأنشطة ومعلومات الأفراد فقط)',
    labelEn: 'Cubs Administration (Activities & Members only)',
    role: 'section_leader',
    assignedCategory: 'أشبال',
    descriptionAr: 'التحكم الكامل في أنشطة ومعلومات أفراد فئة الأشبال فقط، ومحجوب عنه الصندوق وباقي الأقسام.',
    permissions: {
      canManageMembers: true,
      canManageActivities: true,
      canManageFinances: false,
      canViewFinances: false,
      canManageUsers: false,
    },
  },
  {
    id: 'ashbal_treasurer',
    categoryGroup: 'فئة الأشبال',
    labelAr: 'رتبة مسؤول صندوق الأشبال (التحكم في صندوق الأشبال فقط)',
    labelEn: 'Cubs Treasurer (Cubs Treasury & Finances only)',
    role: 'treasurer',
    assignedCategory: 'أشبال',
    descriptionAr: 'التحكم الكامل في صندوق واشتراكات فئة الأشبال فقط، محجوب عن صناديق الفئات والأفواج الأخرى.',
    permissions: {
      canManageMembers: false,
      canManageActivities: false,
      canManageFinances: true,
      canViewFinances: true,
      canManageUsers: false,
    },
  },
  {
    id: 'ashbal_troop_leader',
    categoryGroup: 'فئة الأشبال',
    labelAr: 'رتبة قائد فرقة الأشبال (إدارة أفراد فرقته في الأشبال فقط)',
    labelEn: 'Cubs Troop Leader (Assigned Troop only)',
    role: 'troop_leader',
    assignedCategory: 'أشبال',
    descriptionAr: 'متابعة وإدارة أفراد فرقته المحددة ضمن فئة الأشبال فقط، ومحجوب عنه الصندوق وباقي الفئات.',
    permissions: {
      canManageMembers: true,
      canManageActivities: false,
      canManageFinances: false,
      canViewFinances: false,
      canManageUsers: false,
    },
  },

  // ===== فئة الكشاف =====
  {
    id: 'kashaf_admin',
    categoryGroup: 'فئة الكشاف',
    labelAr: 'رتبة إدارة الكشاف (الأنشطة ومعلومات الأفراد فقط)',
    labelEn: 'Scouts Administration (Activities & Members only)',
    role: 'section_leader',
    assignedCategory: 'كشاف',
    descriptionAr: 'التحكم الكامل في أنشطة ومعلومات أفراد فئة الكشاف فقط، ومحجوب عنه الصندوق وباقي الأقسام.',
    permissions: {
      canManageMembers: true,
      canManageActivities: true,
      canManageFinances: false,
      canViewFinances: false,
      canManageUsers: false,
    },
  },
  {
    id: 'kashaf_treasurer',
    categoryGroup: 'فئة الكشاف',
    labelAr: 'رتبة مسؤول صندوق الكشاف (التحكم في صندوق الكشاف فقط)',
    labelEn: 'Scouts Treasurer (Scouts Treasury & Finances only)',
    role: 'treasurer',
    assignedCategory: 'كشاف',
    descriptionAr: 'التحكم الكامل في صندوق واشتراكات فئة الكشاف فقط، محجوب عن صناديق الفئات والأفواج الأخرى.',
    permissions: {
      canManageMembers: false,
      canManageActivities: false,
      canManageFinances: true,
      canViewFinances: true,
      canManageUsers: false,
    },
  },
  {
    id: 'kashaf_troop_leader',
    categoryGroup: 'فئة الكشاف',
    labelAr: 'رتبة قائد فرقة الكشاف (إدارة أفراد فرقته في الكشاف فقط)',
    labelEn: 'Scouts Troop Leader (Assigned Troop only)',
    role: 'troop_leader',
    assignedCategory: 'كشاف',
    descriptionAr: 'متابعة وإدارة أفراد فرقته المحددة ضمن فئة الكشاف فقط، ومحجوب عنه الصندوق وباقي الفئات.',
    permissions: {
      canManageMembers: true,
      canManageActivities: false,
      canManageFinances: false,
      canViewFinances: false,
      canManageUsers: false,
    },
  },

  // ===== فئة الكشاف المتقدم =====
  {
    id: 'mutaqadem_admin',
    categoryGroup: 'فئة الكشاف المتقدم',
    labelAr: 'رتبة إدارة الكشاف المتقدم (الأنشطة ومعلومات الأفراد فقط)',
    labelEn: 'Senior Scouts Administration (Activities & Members only)',
    role: 'section_leader',
    assignedCategory: 'كشاف متقدم',
    descriptionAr: 'التحكم الكامل في أنشطة ومعلومات أفراد الكشاف المتقدم فقط، ومحجوب عنه الصندوق وباقي الأقسام.',
    permissions: {
      canManageMembers: true,
      canManageActivities: true,
      canManageFinances: false,
      canViewFinances: false,
      canManageUsers: false,
    },
  },
  {
    id: 'mutaqadem_treasurer',
    categoryGroup: 'فئة الكشاف المتقدم',
    labelAr: 'رتبة مسؤول صندوق الكشاف المتقدم (التحكم في صندوق المتقدم فقط)',
    labelEn: 'Senior Scouts Treasurer (Senior Scouts Treasury only)',
    role: 'treasurer',
    assignedCategory: 'كشاف متقدم',
    descriptionAr: 'التحكم الكامل في صندوق واشتراكات الكشاف المتقدم فقط، محجوب عن صناديق الفئات والأفواج الأخرى.',
    permissions: {
      canManageMembers: false,
      canManageActivities: false,
      canManageFinances: true,
      canViewFinances: true,
      canManageUsers: false,
    },
  },
  {
    id: 'mutaqadem_troop_leader',
    categoryGroup: 'فئة الكشاف المتقدم',
    labelAr: 'رتبة قائد فرقة الكشاف المتقدم (إدارة أفراد فرقته في المتقدم فقط)',
    labelEn: 'Senior Scouts Troop Leader (Assigned Troop only)',
    role: 'troop_leader',
    assignedCategory: 'كشاف متقدم',
    descriptionAr: 'متابعة وإدارة أفراد فرقته المحددة ضمن الكشاف المتقدم فقط، ومحجوب عنه الصندوق وباقي الفئات.',
    permissions: {
      canManageMembers: true,
      canManageActivities: false,
      canManageFinances: false,
      canViewFinances: false,
      canManageUsers: false,
    },
  },

  // ===== فئة الجوالة =====
  {
    id: 'jawala_admin',
    categoryGroup: 'فئة الجوالة',
    labelAr: 'رتبة إدارة الجوالة (الأنشطة ومعلومات الأفراد فقط)',
    labelEn: 'Rovers Administration (Activities & Members only)',
    role: 'section_leader',
    assignedCategory: 'جوال',
    descriptionAr: 'التحكم الكامل في أنشطة ومعلومات أفراد الجوالة فقط، ومحجوب عنه الصندوق وباقي الأقسام.',
    permissions: {
      canManageMembers: true,
      canManageActivities: true,
      canManageFinances: false,
      canViewFinances: false,
      canManageUsers: false,
    },
  },
  {
    id: 'jawala_treasurer',
    categoryGroup: 'فئة الجوالة',
    labelAr: 'رتبة مسؤول صندوق الجوالة (التحكم في صندوق الجوالة فقط)',
    labelEn: 'Rovers Treasurer (Rovers Treasury only)',
    role: 'treasurer',
    assignedCategory: 'جوال',
    descriptionAr: 'التحكم الكامل في صندوق واشتراكات الجوالة فقط، محجوب عن صناديق الفئات والأفواج الأخرى.',
    permissions: {
      canManageMembers: false,
      canManageActivities: false,
      canManageFinances: true,
      canViewFinances: true,
      canManageUsers: false,
    },
  },
  {
    id: 'jawala_troop_leader',
    categoryGroup: 'فئة الجوالة',
    labelAr: 'رتبة قائد فرقة / رهط الجوالة (إدارة أفراد فرقته في الجوالة فقط)',
    labelEn: 'Rovers Troop/Patrol Leader',
    role: 'troop_leader',
    assignedCategory: 'جوال',
    descriptionAr: 'متابعة وإدارة أفراد رهطه المحددة ضمن الجوالة فقط، ومحجوب عنه الصندوق وباقي الفئات.',
    permissions: {
      canManageMembers: true,
      canManageActivities: false,
      canManageFinances: false,
      canViewFinances: false,
      canManageUsers: false,
    },
  },

  // ===== 1. فوج السجاد =====
  {
    id: 'sajjad_leader_full',
    categoryGroup: 'فوج السجاد',
    labelAr: 'رتبة قائد فوج السجاد (كامل صلاحيات الفوج: أفراد + أنشطة + صندوق)',
    labelEn: 'Al-Sajjad Regiment Leader (Full Regiment Authority)',
    role: 'troop_leader',
    assignedCategory: 'أفواج',
    assignedFirqa: 'فوج السجاد',
    descriptionAr: 'التحكم الشامل والكامل في فوج السجاد (إدارة الأفراد، جدولة الأنشطة، والتحكم بصندوق الفوج الخاص).',
    permissions: {
      canManageMembers: true,
      canManageActivities: true,
      canManageFinances: true,
      canViewFinances: true,
      canManageUsers: false,
    },
  },
  {
    id: 'sajjad_members',
    categoryGroup: 'فوج السجاد',
    labelAr: 'رتبة مسؤول أفراد فوج السجاد (إدارة الأفراد فقط لا غير)',
    labelEn: 'Al-Sajjad Regiment Members Lead (Members Only)',
    role: 'troop_leader',
    assignedCategory: 'أفواج',
    assignedFirqa: 'فوج السجاد',
    descriptionAr: 'التحكم في سجلات وبيانات ومعلومات أفراد فوج السجاد فقط، ومحجوب عنه الصندوق والأنشطة.',
    permissions: {
      canManageMembers: true,
      canManageActivities: false,
      canManageFinances: false,
      canViewFinances: false,
      canManageUsers: false,
    },
  },
  {
    id: 'sajjad_activities',
    categoryGroup: 'فوج السجاد',
    labelAr: 'رتبة مسؤول أنشطة فوج السجاد (إدارة الأنشطة والفعاليات فقط لا غير)',
    labelEn: 'Al-Sajjad Regiment Activities Lead (Activities Only)',
    role: 'activities_lead',
    assignedCategory: 'أفواج',
    assignedFirqa: 'فوج السجاد',
    descriptionAr: 'إضافة وجدولة وإدارة أنشطة وفعاليات فوج السجاد فقط، ومحجوب عنه الصندوق وسجلات الأفراد.',
    permissions: {
      canManageMembers: false,
      canManageActivities: true,
      canManageFinances: false,
      canViewFinances: false,
      canManageUsers: false,
    },
  },
  {
    id: 'sajjad_treasurer',
    categoryGroup: 'فوج السجاد',
    labelAr: 'رتبة مسؤول صندوق فوج السجاد (التحكم بالصندوق المالي فقط لا غير)',
    labelEn: 'Al-Sajjad Regiment Treasurer (Private Treasury Only)',
    role: 'treasurer',
    assignedCategory: 'أفواج',
    assignedFirqa: 'فوج السجاد',
    descriptionAr: 'التحكم في صندوق ومدفوعات واشتراكات فوج السجاد الخاص فقط، ومحجوب عن إدارة الأفراد والأنشطة.',
    permissions: {
      canManageMembers: false,
      canManageActivities: false,
      canManageFinances: true,
      canViewFinances: true,
      canManageUsers: false,
    },
  },

  // ===== 2. فوج الباقر =====
  {
    id: 'baqir_leader_full',
    categoryGroup: 'فوج الباقر',
    labelAr: 'رتبة قائد فوج الباقر (كامل صلاحيات الفوج: أفراد + أنشطة + صندوق)',
    labelEn: 'Al-Baqir Regiment Leader (Full Regiment Authority)',
    role: 'troop_leader',
    assignedCategory: 'أفواج',
    assignedFirqa: 'فوج الباقر',
    descriptionAr: 'التحكم الشامل والكامل في فوج الباقر (إدارة الأفراد، جدولة الأنشطة، والتحكم بصندوق الفوج الخاص).',
    permissions: {
      canManageMembers: true,
      canManageActivities: true,
      canManageFinances: true,
      canViewFinances: true,
      canManageUsers: false,
    },
  },
  {
    id: 'baqir_members',
    categoryGroup: 'فوج الباقر',
    labelAr: 'رتبة مسؤول أفراد فوج الباقر (إدارة الأفراد فقط لا غير)',
    labelEn: 'Al-Baqir Regiment Members Lead (Members Only)',
    role: 'troop_leader',
    assignedCategory: 'أفواج',
    assignedFirqa: 'فوج الباقر',
    descriptionAr: 'التحكم في سجلات وبيانات ومعلومات أفراد فوج الباقر فقط، ومحجوب عنه الصندوق والأنشطة.',
    permissions: {
      canManageMembers: true,
      canManageActivities: false,
      canManageFinances: false,
      canViewFinances: false,
      canManageUsers: false,
    },
  },
  {
    id: 'baqir_activities',
    categoryGroup: 'فوج الباقر',
    labelAr: 'رتبة مسؤول أنشطة فوج الباقر (إدارة الأنشطة والفعاليات فقط لا غير)',
    labelEn: 'Al-Baqir Regiment Activities Lead (Activities Only)',
    role: 'activities_lead',
    assignedCategory: 'أفواج',
    assignedFirqa: 'فوج الباقر',
    descriptionAr: 'إضافة وجدولة وإدارة أنشطة وفعاليات فوج الباقر فقط، ومحجوب عنه الصندوق وسجلات الأفراد.',
    permissions: {
      canManageMembers: false,
      canManageActivities: true,
      canManageFinances: false,
      canViewFinances: false,
      canManageUsers: false,
    },
  },
  {
    id: 'baqir_treasurer',
    categoryGroup: 'فوج الباقر',
    labelAr: 'رتبة مسؤول صندوق فوج الباقر (التحكم بالصندوق المالي فقط لا غير)',
    labelEn: 'Al-Baqir Regiment Treasurer (Private Treasury Only)',
    role: 'treasurer',
    assignedCategory: 'أفواج',
    assignedFirqa: 'فوج الباقر',
    descriptionAr: 'التحكم في صندوق ومدفوعات واشتراكات فوج الباقر الخاص فقط، ومحجوب عن إدارة الأفراد والأنشطة.',
    permissions: {
      canManageMembers: false,
      canManageActivities: false,
      canManageFinances: true,
      canViewFinances: true,
      canManageUsers: false,
    },
  },

  // ===== 3. فوج ناصر الحسين =====
  {
    id: 'nasir_leader_full',
    categoryGroup: 'فوج ناصر الحسين',
    labelAr: 'رتبة قائد فوج ناصر الحسين (كامل صلاحيات الفوج: أفراد + أنشطة + صندوق)',
    labelEn: 'Nasir Al-Hussein Regiment Leader (Full Regiment Authority)',
    role: 'troop_leader',
    assignedCategory: 'أفواج',
    assignedFirqa: 'فوج ناصر الحسين',
    descriptionAr: 'التحكم الشامل والكامل في فوج ناصر الحسين (إدارة الأفراد، جدولة الأنشطة، والتحكم بصندوق الفوج الخاص).',
    permissions: {
      canManageMembers: true,
      canManageActivities: true,
      canManageFinances: true,
      canViewFinances: true,
      canManageUsers: false,
    },
  },
  {
    id: 'nasir_members',
    categoryGroup: 'فوج ناصر الحسين',
    labelAr: 'رتبة مسؤول أفراد فوج ناصر الحسين (إدارة الأفراد فقط لا غير)',
    labelEn: 'Nasir Al-Hussein Regiment Members Lead (Members Only)',
    role: 'troop_leader',
    assignedCategory: 'أفواج',
    assignedFirqa: 'فوج ناصر الحسين',
    descriptionAr: 'التحكم في سجلات وبيانات ومعلومات أفراد فوج ناصر الحسين فقط، ومحجوب عنه الصندوق والأنشطة.',
    permissions: {
      canManageMembers: true,
      canManageActivities: false,
      canManageFinances: false,
      canViewFinances: false,
      canManageUsers: false,
    },
  },
  {
    id: 'nasir_activities',
    categoryGroup: 'فوج ناصر الحسين',
    labelAr: 'رتبة مسؤول أنشطة فوج ناصر الحسين (إدارة الأنشطة والفعاليات فقط لا غير)',
    labelEn: 'Nasir Al-Hussein Regiment Activities Lead (Activities Only)',
    role: 'activities_lead',
    assignedCategory: 'أفواج',
    assignedFirqa: 'فوج ناصر الحسين',
    descriptionAr: 'إضافة وجدولة وإدارة أنشطة وفعاليات فوج ناصر الحسين فقط، ومحجوب عنه الصندوق وسجلات الأفراد.',
    permissions: {
      canManageMembers: false,
      canManageActivities: true,
      canManageFinances: false,
      canViewFinances: false,
      canManageUsers: false,
    },
  },
  {
    id: 'nasir_treasurer',
    categoryGroup: 'فوج ناصر الحسين',
    labelAr: 'رتبة مسؤول صندوق فوج ناصر الحسين (التحكم بالصندوق المالي فقط لا غير)',
    labelEn: 'Nasir Al-Hussein Regiment Treasurer (Private Treasury Only)',
    role: 'treasurer',
    assignedCategory: 'أفواج',
    assignedFirqa: 'فوج ناصر الحسين',
    descriptionAr: 'التحكم في صندوق ومدفوعات واشتراكات فوج ناصر الحسين الخاص فقط، ومحجوب عن إدارة الأفراد والأنشطة.',
    permissions: {
      canManageMembers: false,
      canManageActivities: false,
      canManageFinances: true,
      canViewFinances: true,
      canManageUsers: false,
    },
  },

  // ===== 4. فوج البدور المنيرة =====
  {
    id: 'budoor_leader_full',
    categoryGroup: 'فوج البدور المنيرة',
    labelAr: 'رتبة قائد فوج البدور المنيرة (كامل صلاحيات الفوج: أفراد + أنشطة + صندوق)',
    labelEn: 'Al-Budoor Al-Muneera Regiment Leader (Full Regiment Authority)',
    role: 'troop_leader',
    assignedCategory: 'أفواج',
    assignedFirqa: 'فوج البدور المنيرة',
    descriptionAr: 'التحكم الشامل والكامل في فوج البدور المنيرة (إدارة الأفراد، جدولة الأنشطة، والتحكم بصندوق الفوج الخاص).',
    permissions: {
      canManageMembers: true,
      canManageActivities: true,
      canManageFinances: true,
      canViewFinances: true,
      canManageUsers: false,
    },
  },
  {
    id: 'budoor_members',
    categoryGroup: 'فوج البدور المنيرة',
    labelAr: 'رتبة مسؤول أفراد فوج البدور المنيرة (إدارة الأفراد فقط لا غير)',
    labelEn: 'Al-Budoor Al-Muneera Regiment Members Lead (Members Only)',
    role: 'troop_leader',
    assignedCategory: 'أفواج',
    assignedFirqa: 'فوج البدور المنيرة',
    descriptionAr: 'التحكم في سجلات وبيانات ومعلومات أفراد فوج البدور المنيرة فقط، ومحجوب عنه الصندوق والأنشطة.',
    permissions: {
      canManageMembers: true,
      canManageActivities: false,
      canManageFinances: false,
      canViewFinances: false,
      canManageUsers: false,
    },
  },
  {
    id: 'budoor_activities',
    categoryGroup: 'فوج البدور المنيرة',
    labelAr: 'رتبة مسؤول أنشطة فوج البدور المنيرة (إدارة الأنشطة والفعاليات فقط لا غير)',
    labelEn: 'Al-Budoor Al-Muneera Regiment Activities Lead (Activities Only)',
    role: 'activities_lead',
    assignedCategory: 'أفواج',
    assignedFirqa: 'فوج البدور المنيرة',
    descriptionAr: 'إضافة وجدولة وإدارة أنشطة وفعاليات فوج البدور المنيرة فقط، ومحجوب عنه الصندوق وسجلات الأفراد.',
    permissions: {
      canManageMembers: false,
      canManageActivities: true,
      canManageFinances: false,
      canViewFinances: false,
      canManageUsers: false,
    },
  },
  {
    id: 'budoor_treasurer',
    categoryGroup: 'فوج البدور المنيرة',
    labelAr: 'رتبة مسؤول صندوق فوج البدور المنيرة (التحكم بالصندوق المالي فقط لا غير)',
    labelEn: 'Al-Budoor Al-Muneera Regiment Treasurer (Private Treasury Only)',
    role: 'treasurer',
    assignedCategory: 'أفواج',
    assignedFirqa: 'فوج البدور المنيرة',
    descriptionAr: 'التحكم في صندوق ومدفوعات واشتراكات فوج البدور المنيرة الخاص فقط، ومحجوب عن إدارة الأفراد والأنشطة.',
    permissions: {
      canManageMembers: false,
      canManageActivities: false,
      canManageFinances: true,
      canViewFinances: true,
      canManageUsers: false,
    },
  },

  // ===== الإدارة العامة للأفواج =====
  {
    id: 'afwaj_admin',
    categoryGroup: 'إدارة عامة للأفواج',
    labelAr: 'رتبة إدارة الأفواج العامة (الأنشطة ومعلومات الأفراد لكافة الأفواج)',
    labelEn: 'General Regiments Admin (Activities & Members)',
    role: 'section_leader',
    assignedCategory: 'أفواج',
    descriptionAr: 'التحكم الكامل في أنشطة ومعلومات أفراد جميع الأفواج، ومحجوب عنه الصندوق وباقي الأقسام.',
    permissions: {
      canManageMembers: true,
      canManageActivities: true,
      canManageFinances: false,
      canViewFinances: false,
      canManageUsers: false,
    },
  },
  {
    id: 'afwaj_treasurer',
    categoryGroup: 'إدارة عامة للأفواج',
    labelAr: 'رتبة مسؤول صندوق الأفواج العام (التحكم في صندوق كافة الأفواج)',
    labelEn: 'General Regiments Treasurer (All Regiments Treasury)',
    role: 'treasurer',
    assignedCategory: 'أفواج',
    descriptionAr: 'التحكم في صناديق واشتراكات جميع الأفواج الأربعة، ومحجوب عن صناديق الفئات الأخرى.',
    permissions: {
      canManageMembers: false,
      canManageActivities: false,
      canManageFinances: true,
      canViewFinances: true,
      canManageUsers: false,
    },
  },

  // ===== رتبة المحجوب =====
  {
    id: 'viewer',
    labelAr: 'رتبة المحجوب (مشاهد لمحة الكشافة فقط)',
    labelEn: 'Restricted / Viewer Only (Scout Overview Only)',
    role: 'viewer',
    assignedCategory: undefined,
    descriptionAr: 'للاطلاع على لمحة الكشافة ورسالة الجمعية والوعد الكشفي فقط، ومحجوب تماماً عن رؤية الأفراد والأنشطة والصناديق وكافة السجلات الداخلية.',
    permissions: {
      canManageMembers: false,
      canManageFinances: false,
      canViewFinances: false,
      canManageActivities: false,
      canManageUsers: false,
    },
  },
];

export function findPresetForUser(user: Partial<AppUser>): RolePreset {
  if (!user) return ROLE_PRESETS[0];
  if (user.role === 'supervisor_general') {
    return ROLE_PRESETS[0];
  }
  if (user.role === 'viewer') {
    return ROLE_PRESETS[ROLE_PRESETS.length - 1];
  }

  // Exact firqa match with permission profile
  if (user.assignedFirqa) {
    // 1. Full Leader match
    if (
      user.permissions?.canManageMembers &&
      user.permissions?.canManageActivities &&
      user.permissions?.canManageFinances
    ) {
      const fullMatch = ROLE_PRESETS.find(
        (p) =>
          p.assignedFirqa === user.assignedFirqa &&
          p.permissions.canManageMembers &&
          p.permissions.canManageActivities &&
          p.permissions.canManageFinances
      );
      if (fullMatch) return fullMatch;
    }

    // 2. Activities Lead match
    if (
      user.role === 'activities_lead' ||
      (user.permissions?.canManageActivities && !user.permissions?.canManageMembers && !user.permissions?.canManageFinances)
    ) {
      const actMatch = ROLE_PRESETS.find(
        (p) =>
          p.assignedFirqa === user.assignedFirqa &&
          p.permissions.canManageActivities &&
          !p.permissions.canManageMembers
      );
      if (actMatch) return actMatch;
    }

    // 3. Treasurer match
    if (
      user.role === 'treasurer' ||
      (user.permissions?.canManageFinances && !user.permissions?.canManageMembers && !user.permissions?.canManageActivities)
    ) {
      const trMatch = ROLE_PRESETS.find(
        (p) =>
          p.assignedFirqa === user.assignedFirqa &&
          p.role === 'treasurer'
      );
      if (trMatch) return trMatch;
    }

    // 4. Members Lead match
    if (
      user.permissions?.canManageMembers &&
      !user.permissions?.canManageActivities &&
      !user.permissions?.canManageFinances
    ) {
      const memMatch = ROLE_PRESETS.find(
        (p) =>
          p.assignedFirqa === user.assignedFirqa &&
          p.permissions.canManageMembers &&
          !p.permissions.canManageActivities &&
          !p.permissions.canManageFinances
      );
      if (memMatch) return memMatch;
    }

    const firqaMatch = ROLE_PRESETS.find(
      (p) =>
        p.role === user.role &&
        p.assignedCategory === user.assignedCategory &&
        p.assignedFirqa === user.assignedFirqa
    );
    if (firqaMatch) return firqaMatch;
  }

  const match = ROLE_PRESETS.find(
    (p) =>
      p.role === user.role &&
      p.assignedCategory === user.assignedCategory &&
      !p.assignedFirqa
  );
  return (
    match ||
    ROLE_PRESETS.find((p) => p.role === user.role) ||
    ROLE_PRESETS[ROLE_PRESETS.length - 1]
  );
}
