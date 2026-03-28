import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePGStore } from '../../store/pgStore';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Building, Map } from 'lucide-react';
import Swal from 'sweetalert2';
import { useT } from '../../hooks/useT';

const AddPG = () => {
  const { t } = useT();
  const [formData, setFormData] = useState({
    name: '', address: '', city: '', state: '', totalFloors: '', completionYear: '', description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createPG } = usePGStore();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newPGData = {
      ...formData,
      totalFloors: Number(formData.totalFloors)
    };

    const success = await createPG(newPGData);
    if (success) {
      Swal.fire({
        title: t('pgCreated'),
        text: t('propertyAddedSuccess'),
        icon: 'success',
        background: '#1e293b',
        color: '#fff',
        confirmButtonColor: '#4f46e5'
      }).then(() => {
        navigate('/pgs');
      });
    } else {
      Swal.fire({
        title: t('error'),
        text: t('error'),
        icon: 'error',
        background: '#1e293b',
        color: '#fff',
        confirmButtonColor: '#4f46e5'
      });
    }
    setIsSubmitting(false);
  };

  return (
    <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 glass-card hover:bg-slate-800 rounded-xl text-slate-300">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{t('addNewPG')}</h1>
          <p className="text-slate-400 text-sm">{t('registerPropertyDesc')}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-6 md:p-8 rounded-2xl border border-slate-700/50">
        
        <h3 className="text-lg font-medium text-white mb-6 flex items-center gap-2 pb-4 border-b border-slate-700/50">
          <Building className="w-5 h-5 text-indigo-400" /> {t('basicDetails')}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-1">{t('pgName')} *</label>
            <input type="text" name="name" onChange={handleChange} required className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-white" placeholder={t('sunriseResidencyPlaceholder')} />
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-1">{t('fullAddress')} *</label>
            <textarea name="address" onChange={handleChange} required rows={2} className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-white" placeholder={t('streetLayoutDetails')}></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">{t('city')} *</label>
            <input type="text" name="city" onChange={handleChange} required className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-white" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">{t('state')} *</label>
            <input type="text" name="state" onChange={handleChange} required className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-white" />
          </div>
        </div>

        <h3 className="text-lg font-medium text-white mb-6 flex items-center gap-2 pb-4 border-b border-slate-700/50 mt-8">
          <Map className="w-5 h-5 text-indigo-400" /> {t('propertySpecifications')}
        </h3>

        <div className="mb-8">
          <label className="block text-sm font-medium text-slate-300 mb-1">{t('totalFloors')} *</label>
          <input type="number" name="totalFloors" onChange={handleChange} required className="w-1/3 px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-white" />
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-slate-300 mb-1">{t('descriptionOptional')}</label>
          <textarea name="description" onChange={handleChange} rows={3} className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-white" placeholder={t('featuresAmenitiesRules')}></textarea>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-700/50">
          <button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50">
            {isSubmitting ? t('saving') : <><Save className="w-5 h-5" /> {t('saveProperty')}</>}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default AddPG;
