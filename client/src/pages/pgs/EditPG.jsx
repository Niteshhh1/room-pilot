import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePGStore } from '../../store/pgStore';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Building, Map } from 'lucide-react';
import Swal from 'sweetalert2';
import api from '../../services/api';
import { useT } from '../../hooks/useT';

const EditPG = () => {
  const { t } = useT();
  const { id } = useParams();
  const navigate = useNavigate();
  const { updatePG } = usePGStore();
  
  const [formData, setFormData] = useState({
    name: '', address: '', city: '', state: '', totalFloors: '', completionYear: '', description: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPG = async () => {
      try {
        const { data } = await api.get(`/pgs/${id}`);
        setFormData({
          name: data.name || '',
          address: data.address || '',
          city: data.city || '',
          state: data.state || '',
          totalFloors: data.totalFloors || '',
          completionYear: data.completionYear || '',
          description: data.description || '',
        });
      } catch (err) {
        console.error('Failed to fetch PG data for editing', err);
        Swal.fire({
          title: t('error'),
          text: t('failedToLoadPropertyData'),
          icon: 'error',
          background: '#1e293b',
          color: '#fff',
          confirmButtonColor: '#4f46e5'
        });
        navigate('/pgs');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPG();
  }, [id, navigate, t]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const updatedPGData = {
      ...formData,
      totalFloors: Number(formData.totalFloors)
    };

    const success = await updatePG(id, updatedPGData);
    
    if (success) {
      Swal.fire({
        title: t('updated'),
        text: t('propertySavedSuccess'),
        icon: 'success',
        background: '#1e293b',
        color: '#fff',
        confirmButtonColor: '#4f46e5'
      }).then(() => {
        navigate(`/pgs/${id}`);
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
          <h1 className="text-2xl font-bold text-white tracking-tight">{t('editProperty')}</h1>
          <p className="text-slate-400 text-sm">{t('updatePropertyDesc')} {formData.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-6 md:p-8 rounded-2xl border border-slate-700/50">
        
        <h3 className="text-lg font-medium text-white mb-6 flex items-center gap-2 pb-4 border-b border-slate-700/50">
          <Building className="w-5 h-5 text-indigo-400" /> {t('basicDetails')}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-1">{t('pgName')} *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-white" />
          </div>

          <div className="col-span-1 md:col-span-2">
            <label className="block text-sm font-medium text-slate-300 mb-1">{t('fullAddress')} *</label>
            <textarea name="address" value={formData.address} onChange={handleChange} required rows={2} className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-white"></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">{t('city')} *</label>
            <input type="text" name="city" value={formData.city} onChange={handleChange} required className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-white" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">{t('state')} *</label>
            <input type="text" name="state" value={formData.state} onChange={handleChange} required className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-white" />
          </div>
        </div>

        <h3 className="text-lg font-medium text-white mb-6 flex items-center gap-2 pb-4 border-b border-slate-700/50 mt-8">
          <Map className="w-5 h-5 text-indigo-400" /> {t('propertySpecifications')}
        </h3>

        <div className="mb-8">
          <label className="block text-sm font-medium text-slate-300 mb-1">{t('totalFloors')} *</label>
          <input type="number" name="totalFloors" value={formData.totalFloors} onChange={handleChange} required className="w-1/3 px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-white" />
        </div>

        <div className="mb-8">
          <label className="block text-sm font-medium text-slate-300 mb-1">{t('descriptionOptional')}</label>
          <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-white" placeholder={t('featuresAmenitiesRules')}></textarea>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-700/50">
          <button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50">
            {isSubmitting ? t('saving') : <><Save className="w-5 h-5" /> {t('updateProperty')}</>}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default EditPG;
