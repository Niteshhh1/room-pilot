import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Home, Info } from 'lucide-react';
import Swal from 'sweetalert2';
import { useT } from '../../hooks/useT';

const EditRoom = () => {
  const { t } = useT();
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    roomNumber: '',
    floorNumber: '',
    capacity: '',
    rent: '',
    roomType: 'Double',
    roomSize: '',
    description: '',
  });

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const { data } = await api.get(`/rooms/${id}`);
        setFormData({
          roomNumber: data.roomNumber || '',
          floorNumber: data.floorNumber !== undefined ? data.floorNumber : '',
          capacity: data.capacity !== undefined ? data.capacity : '',
          rent: data.rent !== undefined ? data.rent : '',
          roomType: data.roomType || 'Double',
          roomSize: data.roomSize || '',
          description: data.description || '',
        });
      } catch (err) {
        console.error('Failed to fetch room data for editing', err);
        Swal.fire({
          title: t('error'),
          text: t('failedToLoadPropertyData'), 
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
    fetchRoom();
  }, [id, navigate, t]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload = {
        ...formData,
        floorNumber: Number(formData.floorNumber),
        capacity: Number(formData.capacity),
        rent: Number(formData.rent)
      };
      
      await api.put(`/rooms/${id}`, payload);
      
      Swal.fire({
        title: t('updated'),
        text: t('roomSavedSuccess'),
        icon: 'success',
        background: '#1e293b',
        color: '#fff',
        confirmButtonColor: '#4f46e5'
      }).then(() => {
        navigate(`/rooms/${id}`);
      });
      
    } catch (err) {
      console.error('Failed to update room', err);
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
          <h1 className="text-2xl font-bold text-white tracking-tight">{t('editRoom')}</h1>
          <p className="text-slate-400 text-sm">{t('editRoomConfigDesc')} {formData.roomNumber}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-6 md:p-8 rounded-2xl border border-slate-700/50">
        
        <h3 className="text-lg font-medium text-white mb-6 flex items-center gap-2 pb-4 border-b border-slate-700/50">
          <Home className="w-5 h-5 text-indigo-400" /> {t('roomConfiguration')}
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">{t('roomNumber')} *</label>
            <input type="text" name="roomNumber" value={formData.roomNumber} onChange={handleChange} required className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-white" placeholder={t('roomNumberPlaceholder')} />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">{t('floorNumber')} *</label>
            <input type="number" name="floorNumber" value={formData.floorNumber} onChange={handleChange} required className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-white" placeholder={t('floorNumberPlaceholder')} />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">{t('roomType')} *</label>
            <select name="roomType" value={formData.roomType} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-white appearance-none">
              <option value="Single">{t('single')}</option>
              <option value="Double">{t('double')}</option>
              <option value="Triple">{t('triple')}</option>
              <option value="Dorm">{t('dorm')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">{t('bedCapacity')} *</label>
            <input type="number" name="capacity" value={formData.capacity} onChange={handleChange} required className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-white" placeholder={t('maxPersonsPlaceholder')} />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">{t('monthlyRent')} (₹) *</label>
            <input type="number" name="rent" value={formData.rent} onChange={handleChange} required className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-white" placeholder={t('rentPlaceholder')} />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">{t('roomSize')}</label>
            <input type="text" name="roomSize" value={formData.roomSize} onChange={handleChange} className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-white" placeholder={t('roomSizePlaceholder')} />
          </div>
        </div>

        <h3 className="text-lg font-medium text-white mb-6 flex items-center gap-2 pb-4 border-b border-slate-700/50 mt-8">
          <Info className="w-5 h-5 text-indigo-400" /> {t('additionalDetails')}
        </h3>

        <div className="mb-8">
          <label className="block text-sm font-medium text-slate-300 mb-1">{t('descriptionOptional')}</label>
          <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-white" placeholder={t('featuresAttachedBathroom')}></textarea>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-700/50">
          <button type="submit" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50">
            {isSubmitting ? t('saving') : <><Save className="w-5 h-5" /> {t('updateRoom')}</>}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default EditRoom;
