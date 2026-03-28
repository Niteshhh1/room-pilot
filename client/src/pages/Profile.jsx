import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useT } from '../hooks/useT';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Mail, Phone, Calendar, Lock, Save, ShieldCheck } from 'lucide-react';
import Swal from 'sweetalert2';

const Profile = () => {
  const { t, language } = useT();
  const navigate = useNavigate();
  const { admin, updateProfile } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contactNumber: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (admin) {
      setFormData({
        name: admin.name || '',
        email: admin.email || '',
        contactNumber: admin.contactNumber || '',
        password: '',
        confirmPassword: '',
      });
    }
  }, [admin]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password && formData.password !== formData.confirmPassword) {
      return Swal.fire({ title: t('mismatch'), text: t('passwordsDoNotMatch'), icon: 'warning', background: '#1e293b', color: '#fff', confirmButtonColor: '#4f46e5' });
    }

    if (formData.password && formData.password.length < 6) {
      return Swal.fire({ title: t('tooShort'), text: t('passwordTooShort'), icon: 'warning', background: '#1e293b', color: '#fff', confirmButtonColor: '#4f46e5' });
    }

    setIsSubmitting(true);

    const payload = {
      name: formData.name,
      email: formData.email,
      contactNumber: formData.contactNumber,
    };
    if (formData.password) payload.password = formData.password;

    const success = await updateProfile(payload);

    if (success) {
      Swal.fire({ title: t('updated'), text: t('propertySavedSuccess'), icon: 'success', background: '#1e293b', color: '#fff', confirmButtonColor: '#4f46e5' });
      setIsEditing(false);
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
    } else {
      Swal.fire({ title: t('error'), text: t('error'), icon: 'error', background: '#1e293b', color: '#fff', confirmButtonColor: '#4f46e5' });
    }

    setIsSubmitting(false);
  };

  const memberSince = admin?.createdAt
    ? new Date(admin.createdAt).toLocaleDateString(language === 'en' ? 'en-IN' : language, { day: '2-digit', month: 'long', year: 'numeric' })
    : 'N/A';

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 glass-card hover:bg-slate-800 rounded-xl text-slate-300">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{t('myProfile')}</h1>
          <p className="text-slate-400 text-sm">{t('manageAccount')}</p>
        </div>
      </div>

      {/* Profile Hero Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-2xl border border-slate-700/50 p-8 flex flex-col sm:flex-row items-center gap-6 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-transparent to-purple-500/5 pointer-events-none" />
        
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-4xl shadow-xl shadow-indigo-500/30 border-2 border-white/10">
            {admin?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-slate-900 flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
        </div>

        <div className="text-center sm:text-left">
          <h2 className="text-2xl font-bold text-white">{admin?.name || 'Admin User'}</h2>
          <p className="text-slate-400 mt-1">{admin?.email}</p>
          <div className="flex flex-wrap gap-4 mt-3 justify-center sm:justify-start">
            <span className="inline-flex items-center gap-1.5 text-xs bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 px-3 py-1 rounded-full">
              <ShieldCheck className="w-3 h-3" /> {t('administrator')}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs bg-slate-700/50 text-slate-400 border border-slate-600/40 px-3 py-1 rounded-full">
              <Calendar className="w-3 h-3" /> {t('memberSinceLabel')} {memberSince}
            </span>
          </div>
        </div>

        <div className="sm:ml-auto">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all border ${
              isEditing
                ? 'bg-slate-700/50 border-slate-600 text-slate-300 hover:bg-slate-700'
                : 'bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-600/20'
            }`}
          >
            {isEditing ? t('cancel') : t('editProfile')}
          </button>
        </div>
      </motion.div>

      {/* Info or Edit Form */}
      {!isEditing ? (
        /* Read-only View */
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl border border-slate-700/50 p-6 space-y-4"
        >
          <h3 className="text-lg font-semibold text-white border-b border-slate-700/50 pb-3">{t('accountInformation')}</h3>
          
          {[
            { Icon: User, label: t('fullName'), value: admin?.name },
            { Icon: Mail, label: t('emailAddress'), value: admin?.email },
            { Icon: Phone, label: t('contactNumber'), value: admin?.contactNumber || '—' },
            { Icon: Calendar, label: t('memberSinceLabel'), value: memberSince },
          ].map(({ Icon, label, value }) => (
            <div key={label} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-800/30 transition-colors">
              <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs text-slate-500">{label}</p>
                <p className="text-white font-medium">{value}</p>
              </div>
            </div>
          ))}
        </motion.div>
      ) : (
        /* Edit Form */
        <motion.form
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="glass-card rounded-2xl border border-slate-700/50 p-6 space-y-6"
        >
          <h3 className="text-lg font-semibold text-white border-b border-slate-700/50 pb-3 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-400" /> {t('editAccountInfo')}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('fullName')} *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('emailAddress')} *</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-white" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('contactNumber')} *</label>
              <input type="tel" name="contactNumber" value={formData.contactNumber} onChange={handleChange} required className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-white" />
            </div>
          </div>

          <div className="border-t border-slate-700/50 pt-5">
            <h4 className="text-sm font-semibold text-slate-400 mb-4 flex items-center gap-2 uppercase tracking-wider">
              <Lock className="w-4 h-4" /> {t('changePassword')}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('newPassword')}</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder={t('leaveBlankToKeepCurrent')} className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('confirmPassword')}</label>
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder={t('reEnterNewPassword')} className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-white" />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-700/50">
            <button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50">
              {isSubmitting ? t('saving') : <><Save className="w-4 h-4" /> {t('saveChanges')}</>}
            </button>
          </div>
        </motion.form>
      )}
    </motion.div>
  );
};

export default Profile;
