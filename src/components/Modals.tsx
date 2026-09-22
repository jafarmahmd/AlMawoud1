import React, { useState, useEffect } from 'react';
import { Member, Payment, Activity, Language } from '../types';
import { translations } from '../i18n';
import { INITIAL_CATEGORIES } from '../data';

interface ModalsProps {
  lang: Language;
  // Member modal
  showMemberModal: boolean;
  editingMember: Member | null;
  defaultCategory: string;
  defaultFirqa: string;
  onCloseMemberModal: () => void;
  onSaveMember: (memberData: Partial<Member>) => void;

  // Payment modal
  showPaymentModal: boolean;
  paymentMember: Member | null;
  onClosePaymentModal: () => void;
  onSavePayment: (paymentData: Partial<Payment>) => void;

  // Activity modal
  showActivityModal: boolean;
  defaultActCategory: string;
  defaultActFirqa: string;
  onCloseActivityModal: () => void;
  onSaveActivity: (activityData: Partial<Activity>) => void;

  // View Member Details modal
  viewingMember: Member | null;
  onCloseViewMember: () => void;

  // View Image modal
  viewingImage: string | null;
  onCloseViewImage: () => void;
}

export const Modals: React.FC<ModalsProps> = ({
  lang,
  showMemberModal,
  editingMember,
  defaultCategory,
  defaultFirqa,
  onCloseMemberModal,
  onSaveMember,
  showPaymentModal,
  paymentMember,
  onClosePaymentModal,
  onSavePayment,
  showActivityModal,
  defaultActCategory,
  defaultActFirqa,
  onCloseActivityModal,
  onSaveActivity,
  viewingMember,
  onCloseViewMember,
  viewingImage,
  onCloseViewImage,
}) => {
  const t = translations[lang];

  // ============ MEMBER STATE ============
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [age, setAge] = useState<number | string>('');
  const [category, setCategory] = useState('');
  const [firqa, setFirqa] = useState('');
  const [phone, setPhone] = useState('');
  const [guardianPhone, setGuardianPhone] = useState('');
  const [address, setAddress] = useState('');
  const [school, setSchool] = useState('');
  const [grade, setGrade] = useState('');
  const [joinDate, setJoinDate] = useState('');
  const [status, setStatus] = useState<'نشط' | 'غير نشط' | 'متوقف'>('نشط');
  const [badges, setBadges] = useState('');
  const [notes, setNotes] = useState('');
  const [photoData, setPhotoData] = useState('');

  useEffect(() => {
    if (editingMember) {
      setFullName(editingMember.fullName);
      setBirthDate(editingMember.birthDate);
      setAge(editingMember.age);
      setCategory(editingMember.category);
      setFirqa(editingMember.firqa || '');
      setPhone(editingMember.phone);
      setGuardianPhone(editingMember.guardianPhone || '');
      setAddress(editingMember.address || '');
      setSchool(editingMember.school || '');
      setGrade(editingMember.grade || '');
      setJoinDate(editingMember.joinDate || '');
      setStatus(editingMember.status);
      setBadges(editingMember.badges || '');
      setNotes(editingMember.notes || '');
      setPhotoData(editingMember.photo || '');
    } else {
      setFullName('');
      setBirthDate('');
      setAge('');
      setCategory(defaultCategory || 'أشبال');
      setFirqa(defaultFirqa || '');
      setPhone('');
      setGuardianPhone('');
      setAddress('');
      setSchool('');
      setGrade('');
      setJoinDate(new Date().toISOString().split('T')[0]);
      setStatus('نشط');
      setBadges('');
      setNotes('');
      setPhotoData('');
    }
  }, [editingMember, defaultCategory, defaultFirqa, showMemberModal]);

  const handleBirthDateChange = (val: string) => {
    setBirthDate(val);
    if (!val) return;
    const bd = new Date(val);
    const today = new Date();
    let calculatedAge = today.getFullYear() - bd.getFullYear();
    if (
      today.getMonth() < bd.getMonth() ||
      (today.getMonth() === bd.getMonth() && today.getDate() < bd.getDate())
    ) {
      calculatedAge--;
    }
    setAge(calculatedAge);

    if (!category) {
      if (calculatedAge >= 7 && calculatedAge <= 11) setCategory('أشبال');
      else if (calculatedAge >= 12 && calculatedAge <= 15) setCategory('كشاف');
      else if (calculatedAge >= 16 && calculatedAge <= 18) setCategory('كشاف متقدم');
      else if (calculatedAge >= 19) setCategory('جوال');
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setPhotoData(ev.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveMember({
      fullName,
      birthDate,
      age,
      category,
      firqa,
      phone,
      guardianPhone,
      address,
      school,
      grade,
      joinDate,
      status,
      badges,
      notes,
      photo: photoData,
    });
  };

  // ============ PAYMENT STATE ============
  const [payAmount, setPayAmount] = useState<number | string>('1000');
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [payType, setPayType] = useState<Payment['type']>('أسبوعي');
  const [payMethod, setPayMethod] = useState<Payment['method']>('نقدا');
  const [payNotes, setPayNotes] = useState('');

  const handlePayTypeChange = (val: Payment['type']) => {
    setPayType(val);
    if (val === 'أسبوعي') setPayAmount('1000');
    else if (val === 'شهري') setPayAmount('4000');
  };

  const handleSavePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentMember) return;
    onSavePayment({
      memberId: paymentMember.id,
      amount: payAmount,
      date: payDate,
      type: payType,
      method: payMethod,
      notes: payNotes,
    });
  };

  // ============ ACTIVITY STATE ============
  const [actName, setActName] = useState('');
  const [actType, setActType] = useState('اجتماع');
  const [actStatus, setActStatus] = useState<'قائم' | 'مكتمل' | 'ملغي'>('قائم');
  const [actDate, setActDate] = useState(new Date().toISOString().split('T')[0]);
  const [actCategory, setActCategory] = useState(defaultActCategory || 'الجميع');
  const [actFirqa, setActFirqa] = useState(defaultActFirqa || '');
  const [actLocation, setActLocation] = useState('');
  const [actLinkUrl, setActLinkUrl] = useState('');
  const [actCost, setActCost] = useState<number | string>('0');
  const [actLeaders, setActLeaders] = useState('');
  const [actPresent, setActPresent] = useState('');
  const [actAbsent, setActAbsent] = useState('');
  const [actDesc, setActDesc] = useState('');
  const [actImages, setActImages] = useState<string[]>([]);

  useEffect(() => {
    setActCategory(defaultActCategory || 'الجميع');
    setActFirqa(defaultActFirqa || '');
    setActStatus('قائم');
    setActLinkUrl('');
  }, [defaultActCategory, defaultActFirqa, showActivityModal]);

  const handleActivityImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    if (actImages.length + files.length > 10) {
      return;
    }
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setActImages((prev) => [...prev, ev.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSaveActivitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveActivity({
      name: actName,
      type: actType,
      status: actStatus,
      date: actDate,
      category: actCategory,
      firqa: actFirqa,
      location: actLocation,
      linkUrl: actLinkUrl.trim() || undefined,
      cost: actCost,
      leaders: actLeaders.split(',').map((l) => l.trim()).filter(Boolean),
      present: actPresent.split(',').map((p) => p.trim()).filter(Boolean),
      absent: actAbsent.split(',').map((a) => a.trim()).filter(Boolean),
      images: actImages,
      description: actDesc,
    });
  };

  return (
    <>
      {/* 1. Add / Edit Member Modal */}
      {showMemberModal && (
        <div className="modal active" id="addMemberModal">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">
                {editingMember
                  ? lang === 'ar'
                    ? `تعديل بيانات: ${editingMember.fullName}`
                    : `Edit Member: ${editingMember.fullName}`
                  : t.addNewMember}
              </h2>
              <button className="close-btn" onClick={onCloseMemberModal}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveMemberSubmit}>
              <div className="form-group">
                <label>{t.photo}</label>
                <div
                  className="photo-upload"
                  onClick={() => document.getElementById('fileMemberPhoto')?.click()}
                >
                  {photoData ? (
                    <img src={photoData} className="photo-preview" alt="معاينة الصورة" />
                  ) : (
                    <div className="photo-preview-placeholder">؟</div>
                  )}
                  <label className="file-upload-btn" onClick={(e) => e.stopPropagation()}>
                    {lang === 'ar' ? 'اختر صورة من الجهاز' : 'Choose Photo'}
                    <input
                      type="file"
                      id="fileMemberPhoto"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                    />
                  </label>
                </div>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>{t.name} *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>{lang === 'ar' ? 'تاريخ الميلاد *' : 'Date of Birth *'}</label>
                  <input
                    type="date"
                    required
                    value={birthDate}
                    onChange={(e) => handleBirthDateChange(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>{t.age}</label>
                  <input type="number" readOnly value={age} />
                </div>

                <div className="form-group">
                  <label>{lang === 'ar' ? 'القسم الكشفي *' : 'Section *'}</label>
                  <select
                    required
                    value={category}
                    onChange={(e) => {
                      setCategory(e.target.value);
                      setFirqa('');
                    }}
                  >
                    <option value="">{lang === 'ar' ? 'اختر القسم' : 'Select Section'}</option>
                    {Object.keys(INITIAL_CATEGORIES).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>{t.firqa}</label>
                  <select
                    value={firqa}
                    onChange={(e) => setFirqa(e.target.value)}
                  >
                    <option value="">{lang === 'ar' ? 'اختر الفرقة' : 'Select Troop'}</option>
                    {category &&
                      INITIAL_CATEGORIES[category]?.firaq.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>{t.phone} *</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>{lang === 'ar' ? 'هاتف ولي الأمر' : 'Guardian Phone'}</label>
                  <input
                    type="tel"
                    value={guardianPhone}
                    onChange={(e) => setGuardianPhone(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>{lang === 'ar' ? 'السكن / العنوان' : 'Address'}</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>{lang === 'ar' ? 'المدرسة' : 'School'}</label>
                  <input
                    type="text"
                    value={school}
                    onChange={(e) => setSchool(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>{lang === 'ar' ? 'الصف الدراسي' : 'Grade'}</label>
                  <input
                    type="text"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>{lang === 'ar' ? 'تاريخ الانضمام' : 'Join Date'}</label>
                  <input
                    type="date"
                    value={joinDate}
                    onChange={(e) => setJoinDate(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>{t.status}</label>
                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value as 'نشط' | 'غير نشط' | 'متوقف')
                    }
                  >
                    <option value="نشط">{lang === 'ar' ? 'نشط' : 'Active'}</option>
                    <option value="غير نشط">{lang === 'ar' ? 'غير نشط' : 'Inactive'}</option>
                    <option value="متوقف">{lang === 'ar' ? 'متوقف' : 'Suspended'}</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>{lang === 'ar' ? 'الشارات والأوسمة' : 'Badges & Honors'}</label>
                <input
                  type="text"
                  placeholder={lang === 'ar' ? 'مفصولة بفواصل' : 'Separated by commas'}
                  value={badges}
                  onChange={(e) => setBadges(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>{lang === 'ar' ? 'ملاحظات إضافية' : 'Notes'}</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary">
                  {lang === 'ar' ? 'حفظ البيانات' : 'Save Member'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onCloseMemberModal}
                >
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Add Payment Modal */}
      {showPaymentModal && paymentMember && (
        <div className="modal active" id="addPaymentModal">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2 className="modal-title">{t.addNewPayment}</h2>
              <button className="close-btn" onClick={onClosePaymentModal}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSavePaymentSubmit}>
              <div className="form-group">
                <label>{t.member}</label>
                <input type="text" readOnly value={paymentMember.fullName} />
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>{t.type} *</label>
                  <select
                    value={payType}
                    onChange={(e) => handlePayTypeChange(e.target.value as Payment['type'])}
                  >
                    <option value="أسبوعي">أسبوعي - 1,000 IQD</option>
                    <option value="شهري">شهري - 4,000 IQD</option>
                    <option value="رسوم نشاط">رسوم نشاط</option>
                    <option value="رسوم معسكر">رسوم معسكر</option>
                    <option value="تبرع">تبرع</option>
                    <option value="أخرى">أخرى</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>{t.amount} (IQD) *</label>
                  <input
                    type="number"
                    required
                    value={payAmount}
                    onChange={(e) => setPayAmount(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>{t.date} *</label>
                  <input
                    type="date"
                    required
                    value={payDate}
                    onChange={(e) => setPayDate(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>{t.method}</label>
                  <select
                    value={payMethod}
                    onChange={(e) => setPayMethod(e.target.value as Payment['method'])}
                  >
                    <option value="نقدا">{lang === 'ar' ? 'نقداً' : 'Cash'}</option>
                    <option value="تحويل بنكي">{lang === 'ar' ? 'تحويل بنكي' : 'Bank Transfer'}</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>{lang === 'ar' ? 'ملاحظات الدفعة' : 'Notes'}</label>
                <textarea
                  value={payNotes}
                  onChange={(e) => setPayNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-success">
                  {lang === 'ar' ? 'حفظ الدفعة في الصندوق' : 'Record Payment'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onClosePaymentModal}
                >
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Add Activity Modal */}
      {showActivityModal && (
        <div className="modal active" id="addActivityModal">
          <div className="modal-content">
            <div className="modal-header">
              <h2 className="modal-title">{t.addNewActivity}</h2>
              <button className="close-btn" onClick={onCloseActivityModal}>
                &times;
              </button>
            </div>

            <form onSubmit={handleSaveActivitySubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>{lang === 'ar' ? 'اسم النشاط *' : 'Activity Name *'}</label>
                  <input
                    type="text"
                    required
                    value={actName}
                    onChange={(e) => setActName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>{t.type} *</label>
                  <select
                    value={actType}
                    onChange={(e) => setActType(e.target.value)}
                  >
                    <option value="اجتماع">{lang === 'ar' ? 'اجتماع' : 'Meeting'}</option>
                    <option value="معسكر">{lang === 'ar' ? 'معسكر' : 'Camp'}</option>
                    <option value="رحلة">{lang === 'ar' ? 'رحلة' : 'Trip'}</option>
                    <option value="دورة">{lang === 'ar' ? 'دورة تدريبية' : 'Course'}</option>
                    <option value="مسابقة">{lang === 'ar' ? 'مسابقة' : 'Competition'}</option>
                    <option value="خدمة مجتمع">{lang === 'ar' ? 'خدمة مجتمع' : 'Community Service'}</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>{t.activityStatus || (lang === 'ar' ? 'حالة النشاط' : 'Activity Status')} *</label>
                  <select
                    value={actStatus}
                    onChange={(e) => setActStatus(e.target.value as 'قائم' | 'مكتمل' | 'ملغي')}
                  >
                    <option value="قائم">{lang === 'ar' ? 'قائم / مبرمج' : 'Active / Scheduled'}</option>
                    <option value="مكتمل">{lang === 'ar' ? 'مكتمل / منجز' : 'Completed'}</option>
                    <option value="ملغي">{lang === 'ar' ? 'ملغي' : 'Cancelled'}</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>{t.date} *</label>
                  <input
                    type="date"
                    required
                    value={actDate}
                    onChange={(e) => setActDate(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>{lang === 'ar' ? 'القسم الكشفي' : 'Section'}</label>
                  <select
                    value={actCategory}
                    onChange={(e) => {
                      setActCategory(e.target.value);
                      setActFirqa('');
                    }}
                  >
                    <option value="الجميع">{lang === 'ar' ? 'الجميع' : 'All'}</option>
                    {Object.keys(INITIAL_CATEGORIES).map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>{t.firqa}</label>
                  <select
                    value={actFirqa}
                    onChange={(e) => setActFirqa(e.target.value)}
                  >
                    <option value="">{lang === 'ar' ? 'الكل' : 'All'}</option>
                    {actCategory &&
                      INITIAL_CATEGORIES[actCategory]?.firaq.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>{lang === 'ar' ? 'الموقع الجغرافي / المكان' : 'Location'}</label>
                  <input
                    type="text"
                    placeholder="مثال: القاعة الكشفية أو متنزه الزوراء"
                    value={actLocation}
                    onChange={(e) => setActLocation(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>
                    {lang === 'ar' ? 'رابط النشاط (Link / URL)' : 'Activity Link / URL'}
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-light)', marginRight: '6px' }}>
                      ({lang === 'ar' ? 'خرائط، استمارة، بث، مجلد صور' : 'Maps, Forms, Stream, Drive'})
                    </span>
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={actLinkUrl}
                    onChange={(e) => setActLinkUrl(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>{lang === 'ar' ? 'التكلفة (IQD)' : 'Cost (IQD)'}</label>
                  <input
                    type="number"
                    value={actCost}
                    onChange={(e) => setActCost(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>{lang === 'ar' ? 'القائمون (مفصولة بفواصل)' : 'Leaders (comma-separated)'}</label>
                <input
                  type="text"
                  placeholder="مثال: القائد أحمد، القائد كرار"
                  value={actLeaders}
                  onChange={(e) => setActLeaders(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>{lang === 'ar' ? 'سجل الحضور (مفصولة بفواصل)' : 'Present Members (comma-separated)'}</label>
                <textarea
                  placeholder="علي حسين، محمد صادق، ..."
                  value={actPresent}
                  onChange={(e) => setActPresent(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>{lang === 'ar' ? 'سجل الغياب (مفصولة بفواصل)' : 'Absent Members (comma-separated)'}</label>
                <textarea
                  value={actAbsent}
                  onChange={(e) => setActAbsent(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>{lang === 'ar' ? 'صور النشاط (حتى 10 صور)' : 'Activity Images (up to 10)'}</label>
                <label className="file-upload-btn" style={{ display: 'inline-block', marginTop: '0.4rem' }}>
                  {lang === 'ar' ? 'رفع صور' : 'Upload Images'}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleActivityImagesUpload}
                  />
                </label>

                {actImages.length > 0 && (
                  <div className="activity-images">
                    {actImages.map((img, idx) => (
                      <div key={idx} style={{ position: 'relative', display: 'inline-block' }}>
                        <img src={img} className="activity-image" alt="نشاط" />
                        <button
                          type="button"
                          style={{
                            position: 'absolute',
                            top: '5px',
                            left: '5px',
                            background: 'var(--danger)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '50%',
                            width: '24px',
                            height: '24px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                          }}
                          onClick={() =>
                            setActImages((prev) => prev.filter((_, i) => i !== idx))
                          }
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>{lang === 'ar' ? 'وصف النشاط والتقرير' : 'Description & Report'}</label>
                <textarea
                  value={actDesc}
                  onChange={(e) => setActDesc(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                <button type="submit" className="btn btn-primary">
                  {lang === 'ar' ? 'حفظ النشاط' : 'Save Activity'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={onCloseActivityModal}
                >
                  {lang === 'ar' ? 'إلغاء' : 'Cancel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. View Member Details Modal */}
      {viewingMember && (
        <div className="modal active" id="viewMemberModal">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div className="modal-header">
              <h2 className="modal-title">
                {lang === 'ar' ? 'تفاصيل الفرد الكشفي' : 'Scout Member Details'}
              </h2>
              <button className="close-btn" onClick={onCloseViewMember}>
                &times;
              </button>
            </div>

            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              {viewingMember.photo ? (
                <img
                  src={viewingMember.photo}
                  style={{
                    width: '130px',
                    height: '130px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '4px solid var(--primary-green)',
                    margin: '0 auto',
                  }}
                  alt={viewingMember.fullName}
                />
              ) : (
                <div
                  style={{
                    width: '130px',
                    height: '130px',
                    borderRadius: '50%',
                    background: 'var(--bg-main)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '3.5rem',
                    color: 'var(--text-light)',
                    border: '4px solid var(--border)',
                    fontWeight: 700,
                  }}
                >
                  ؟
                </div>
              )}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                background: 'var(--bg-main)',
                padding: '1.5rem',
                borderRadius: '12px',
                border: '1px solid var(--border)',
              }}
            >
              <div>
                <strong>{t.name}:</strong> {viewingMember.fullName}
              </div>
              <div>
                <strong>{lang === 'ar' ? 'تاريخ الميلاد:' : 'DOB:'}</strong>{' '}
                {viewingMember.birthDate}
              </div>
              <div>
                <strong>{t.age}:</strong> {viewingMember.age} {t.years}
              </div>
              <div>
                <strong>{lang === 'ar' ? 'القسم:' : 'Section:'}</strong>{' '}
                <span className="badge badge-kashaf">{viewingMember.category}</span>
              </div>
              <div>
                <strong>{t.firqa}:</strong> {viewingMember.firqa || '-'}
              </div>
              <div>
                <strong>{t.phone}:</strong> {viewingMember.phone}
              </div>
              <div>
                <strong>{lang === 'ar' ? 'هاتف ولي الأمر:' : 'Guardian Phone:'}</strong>{' '}
                {viewingMember.guardianPhone || '-'}
              </div>
              <div>
                <strong>{lang === 'ar' ? 'العنوان:' : 'Address:'}</strong>{' '}
                {viewingMember.address || '-'}
              </div>
              <div>
                <strong>{lang === 'ar' ? 'المدرسة:' : 'School:'}</strong>{' '}
                {viewingMember.school || '-'}
              </div>
              <div>
                <strong>{lang === 'ar' ? 'الصف:' : 'Grade:'}</strong>{' '}
                {viewingMember.grade || '-'}
              </div>
              <div>
                <strong>{lang === 'ar' ? 'تاريخ الانضمام:' : 'Join Date:'}</strong>{' '}
                {viewingMember.joinDate || '-'}
              </div>
              <div>
                <strong>{t.status}:</strong>{' '}
                <span
                  className={`badge badge-${
                    viewingMember.status === 'نشط' ? 'success' : 'warning'
                  }`}
                >
                  {viewingMember.status}
                </span>
              </div>
            </div>

            {viewingMember.badges && (
              <div style={{ marginTop: '1rem' }}>
                <strong>{lang === 'ar' ? 'الأوسمة والشارات:' : 'Badges:'}</strong>
                <p style={{ marginTop: '0.25rem', color: 'var(--text-light)' }}>
                  {viewingMember.badges}
                </p>
              </div>
            )}

            {viewingMember.notes && (
              <div style={{ marginTop: '1rem' }}>
                <strong>{lang === 'ar' ? 'ملاحظات:' : 'Notes:'}</strong>
                <p style={{ marginTop: '0.25rem', color: 'var(--text-light)' }}>
                  {viewingMember.notes}
                </p>
              </div>
            )}

            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <button className="btn btn-secondary" onClick={onCloseViewMember}>
                {lang === 'ar' ? 'إغلاق' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. View Fullscreen Image Modal */}
      {viewingImage && (
        <div
          className="modal active"
          id="viewImageModal"
          style={{ background: 'rgba(0,0,0,0.92)' }}
          onClick={onCloseViewImage}
        >
          <div
            className="modal-content"
            style={{
              maxWidth: '90%',
              padding: 0,
              background: 'transparent',
              boxShadow: 'none',
              border: 'none',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="close-btn"
              style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 10 }}
              onClick={onCloseViewImage}
            >
              &times;
            </button>
            <img
              src={viewingImage}
              alt="معاينة كاملة"
              style={{
                width: '100%',
                maxHeight: '90vh',
                objectFit: 'contain',
                borderRadius: '10px',
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};
