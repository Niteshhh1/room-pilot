import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, User, FileText } from 'lucide-react';
import Swal from 'sweetalert2';
import { useT } from '../../hooks/useT';

const EditTenant = () => {
  const { t } = useT();
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '', email: '', contactNumber: '', bloodGroup: '', hometown: '',
    aadharNumber: '', emergencyContact: '', moveInDate: '', monthlyRent: '', securityDeposit: ''
  });

  useEffect(() => {
    const fetchTenant = async () => {
      try {
        const { data } = await api.get(`/tenants/${id}`);
        setFormData({
          name: data.name || '',
          email: data.email || '',
          contactNumber: data.contactNumber || '',
          bloodGroup: data.bloodGroup || '',
          hometown: data.hometown || '',
          aadharNumber: data.aadharNumber || '',
          emergencyContact: data.emergencyContact || '',
          moveInDate: data.moveInDate ? data.moveInDate.split('T')[0] : '',
          monthlyRent: data.monthlyRent !== undefined ? data.monthlyRent : '',
          securityDeposit: data.securityDeposit !== undefined ? data.securityDeposit : '',
        });
      } catch (err) {
        console.error('Failed to fetch tenant data', err);
        Swal.fire({
          title: t('error'),
          text: t('failedToLoadTenantData'),
          icon: 'error',
          background: '#1e293b',
          color: '#fff',
          confirmButtonColor: '#4f46e5'
        });
        navigate(-1);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTenant();
  }, [id, navigate, t]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.contactNumber)) {
      return Swal.fire({
        title: t('invalidInput'),
        text: t('valid10DigitPhone'),
        icon: 'warning',
        background: '#1e293b',
        color: '#fff',
        confirmButtonColor: '#4f46e5'
      });
    }
    if (formData.emergencyContact && !phoneRegex.test(formData.emergencyContact)) {
      return Swal.fire({
        title: t('invalidInput'),
        text: t('validEmergencyPhone') || t('valid10DigitPhone'),
        icon: 'warning',
        background: '#1e293b',
        color: '#fff',
        confirmButtonColor: '#4f46e5'
      });
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        monthlyRent: Number(formData.monthlyRent),
        securityDeposit: Number(formData.securityDeposit)
      };
      await api.put(`/tenants/${id}`, payload);
      Swal.fire({
        title: t('updated'),
        text: t('tenantSavedSuccess') || t('updated'),
        icon: 'success',
        background: '#1e293b',
        color: '#fff',
        confirmButtonColor: '#4f46e5'
      }).then(() => navigate(`/tenants/${id}`));
    } catch (err) {
      console.error('Failed to update tenant', err);
      Swal.fire({
        title: t('error'),
        text: err.response?.data?.message || t('error'),
        icon: 'error',
        background: '#1e293b',
        color: '#fff',
        confirmButtonColor: '#4f46e5'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 glass-card hover:bg-slate-800 rounded-xl text-slate-300">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{t('editTenant')}</h1>
          <p className="text-slate-400 text-sm">{t('updatingProfileFor')} {formData.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-6 md:p-8 rounded-2xl border border-slate-700/50">

        <h3 className="text-lg font-medium text-white mb-6 flex items-center gap-2 pb-4 border-b border-slate-700/50">
          <User className="w-5 h-5 text-indigo-400" /> {t('personalDetails')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">{t('fullName')} *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">{t('emailAddress')} *</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">{t('contactNumber')} *</label>
            <input type="text" name="contactNumber" value={formData.contactNumber} onChange={handleChange} required className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">{t('emergencyContact')}</label>
            <input type="text" name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">{t('bloodGroup')}</label>
            <input type="text" name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-white" placeholder={t('bloodGroupPlaceholder')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">{t('hometown')}</label>
            <input type="text" name="hometown" value={formData.hometown} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-white" />
          </div>
        </div>

        <h3 className="text-lg font-medium text-white mb-6 flex items-center gap-2 pb-4 border-b border-slate-700/50 mt-8">
          <FileText className="w-5 h-5 text-indigo-400" /> {t('identityAgreement')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">{t('aadharNumber')} *</label>
            <input type="text" name="aadharNumber" value={formData.aadharNumber} onChange={handleChange} required className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-white" placeholder={t('aadharPlaceholder')} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">{t('moveInDate')} *</label>
            <input type="date" name="moveInDate" value={formData.moveInDate} onChange={handleChange} required className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-white [color-scheme:dark]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">{t('monthlyRent')} (₹) *</label>
            <input type="number" name="monthlyRent" value={formData.monthlyRent} onChange={handleChange} required className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">{t('securityDeposit')} (₹) *</label>
            <input type="number" name="securityDeposit" value={formData.securityDeposit} onChange={handleChange} required className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-white" />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-700/50">
          <button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50">
            {isSubmitting ? t('saving') : <><Save className="w-5 h-5" /> {t('updateTenant')}</>}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default EditTenant;

