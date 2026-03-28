import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useT } from '../../hooks/useT';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Phone, Mail, MapPin, 
  Calendar, CreditCard, ShieldCheck, 
  Clock, ArrowLeft, History, Plus,
  CheckCircle2, AlertCircle, Edit, MinusCircle,
  Key, Ban, ShieldAlert
} from 'lucide-react';
import Swal from 'sweetalert2';

const TenantDetail = () => {
  const { t } = useT();
  const { id } = useParams();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTenantDetails();
  }, [id]);

  const fetchTenantDetails = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/tenants/${id}`);
      setTenant(data);
    } catch (err) {
      console.error('Failed to fetch tenant details', err);
      Swal.fire({
        title: t('error'),
        text: t('failedToLoadTenantData'),
        icon: 'error',
        background: '#1e293b',
        color: '#fff',
        confirmButtonColor: '#4f46e5'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePayRent = async () => {
    try {
      const result = await Swal.fire({
        title: t('confirmPayment'),
        text: t('recordRentPaymentDesc').replace('{{amount}}', tenant.monthlyRent),
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#4f46e5',
        cancelButtonColor: '#ef4444',
        confirmButtonText: t('yesRecordPayment'),
        background: '#1e293b',
        color: '#fff'
      });
      
      if (!result.isConfirmed) return;
      
      const payload = {
        tenantId: tenant._id,
        roomId: tenant.room._id,
        pgId: tenant.pg._id,
        amount: tenant.monthlyRent,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
      };
      
      await api.post('/payments', payload);
      await fetchTenantDetails();
      
      Swal.fire({
        title: t('paymentRecorded'),
        text: t('paymentLoggedSuccess'),
        icon: 'success',
        background: '#1e293b',
        color: '#fff',
        confirmButtonColor: '#4f46e5'
      });
    } catch (err) {
      console.error('Failed to process payment', err);
      Swal.fire({
        title: t('error'),
        text: t('paymentFailed'),
        icon: 'error',
        background: '#1e293b',
        color: '#fff',
        confirmButtonColor: '#4f46e5'
      });
    }
  };

  const toggleTenantStatus = async () => {
    const newStatus = tenant.status === 'Active' ? 'Inactive' : 'Active';
    const translatedNewStatus = newStatus === 'Active' ? t('active') : t('inactive');
    
    const result = await Swal.fire({
      title: t('changeStatusQuestion'),
      text: t('changeStatusDesc').replace('{{status}}', translatedNewStatus),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4f46e5',
      cancelButtonColor: '#ef4444',
      confirmButtonText: t('yesChangeIt'),
      background: '#1e293b',
      color: '#fff'
    });
    
    if (result.isConfirmed) {
      try {
        await api.put(`/tenants/${id}/status`, { status: newStatus });
        await fetchTenantDetails();
        Swal.fire({
          title: t('statusUpdated'),
          icon: 'success',
          background: '#1e293b',
          color: '#fff',
          confirmButtonColor: '#4f46e5'
        });
      } catch (err) {
        console.error('Failed to update status', err);
        Swal.fire({
          title: t('error'),
          text: t('error'),
          icon: 'error',
          background: '#1e293b',
          color: '#fff',
          confirmButtonColor: '#4f46e5'
        });
      }
    }
  };

  if (loading || !tenant) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-6">
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 glass-card p-6 rounded-2xl border border-slate-700/50">
        <div className="flex items-center gap-6 w-full md:w-auto">
          <button onClick={() => navigate(-1)} className="p-2 glass-card hover:bg-slate-700/50 rounded-xl text-slate-300 transition-all hover:scale-105 active:scale-95 duration-300">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <motion.div 
            initial={{ scale: 0.8, rotateY: -90 }}
            animate={{ scale: 1, rotateY: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-2xl shadow-[0_0_30px_rgba(99,102,241,0.4)] border border-white/10 shrink-0"
          >
            {tenant.name.charAt(0)}
          </motion.div>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white tracking-tight">{tenant.name}</h1>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${tenant.status === 'Active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                {tenant.status === 'Active' ? t('active') : t('inactive')}
              </span>
            </div>
            <p className="text-slate-400 mt-1 flex items-center gap-1.5 text-sm">
              <Key className="w-4 h-4" /> {t('room')} {tenant.room.roomNumber} • {tenant.pg.name}
            </p>
          </div>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0 flex-wrap">
          <button 
            onClick={() => navigate(`/tenants/${id}/edit`)}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all border bg-slate-700/30 hover:bg-slate-700/60 text-slate-300 border-slate-600/40"
          >
            {t('editProfile')}
          </button>

          <button 
            onClick={() => navigate(`/tenants/${id}/payments`)}
            className="flex-1 md:flex-none px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all border bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border-purple-500/20"
          >
            {t('paymentHistory')}
          </button>

          {(tenant.rentStatus === 'Unpaid' || !tenant.rentStatus) && tenant.status === 'Active' && (
            <button 
              onClick={handlePayRent}
              className="flex-1 md:flex-none bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
            >
              <CreditCard className="w-4 h-4" /> {t('receiveRent')}
            </button>
          )}
          
          <button 
            onClick={toggleTenantStatus}
            className={`flex-1 md:flex-none px-4 py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all border ${
              tenant.status === 'Active' 
                ? 'bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/20' 
                : 'bg-green-500/10 hover:bg-green-500/20 text-green-500 border-green-500/20'
            }`}
          >
            <Ban className="w-4 h-4" /> {tenant.status === 'Active' ? t('markInactive') : t('markActive')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact Info */}
        <motion.div 
          initial={{ opacity: 0, x: -20, rotateY: 10 }}
          animate={{ opacity: 1, x: 0, rotateY: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="glass-card p-6 rounded-2xl border border-slate-700/50 space-y-6 relative overflow-hidden group hover:border-indigo-500/30 transition-all duration-500"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <h3 className="text-lg font-medium text-white border-b border-slate-700/50 pb-3 relative z-10">{t('contactDetails')}</h3>
          
          <div className="space-y-4 relative z-10">
            <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-800/30 transition-colors">
              <div className="p-2 bg-slate-800 rounded-lg text-slate-400"><Phone className="w-4 h-4" /></div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">{t('primaryContact')}</p>
                <p className="text-white font-medium">{tenant.contactNumber}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-800/30 transition-colors">
              <div className="p-2 bg-slate-800 rounded-lg text-slate-400"><Mail className="w-4 h-4" /></div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">{t('emailAddress')}</p>
                <p className="text-white font-medium">{tenant.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-800/30 transition-colors">
              <div className="p-2 bg-slate-800 rounded-lg text-slate-400"><MapPin className="w-4 h-4" /></div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">{t('hometown')}</p>
                <p className="text-white font-medium">{tenant.hometown || 'N/A'}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-800/30 transition-colors">
              <div className="p-2 bg-red-500/10 text-red-400 rounded-lg"><ShieldAlert className="w-4 h-4" /></div>
              <div>
                <p className="text-xs text-slate-500 mb-0.5">{t('emergencyContact')}</p>
                <p className="text-white font-medium">{tenant.emergencyContact || 'N/A'}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stay Info */}
        <motion.div 
          initial={{ opacity: 0, x: 20, rotateY: -10 }}
          animate={{ opacity: 1, x: 0, rotateY: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-700/50 space-y-6 relative overflow-hidden group hover:border-purple-500/30 transition-all duration-500"
        >
          <div className="absolute inset-0 bg-gradient-to-bl from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <h3 className="text-lg font-medium text-white border-b border-slate-700/50 pb-3 relative z-10">{t('rentalInformation')}</h3>
          
          <div className="grid grid-cols-2 gap-6 relative z-10">
            <motion.div whileHover={{ y: -5, scale: 1.02 }} className="bg-slate-800/40 p-5 rounded-xl border border-slate-700/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-sm transition-all duration-300">
              <p className="text-xs text-slate-400 mb-1 font-medium tracking-wide">{t('moveInDate')}</p>
              <p className="text-lg font-bold text-white">
                {new Date(tenant.moveInDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </motion.div>
            <motion.div whileHover={{ y: -5, scale: 1.02 }} className="bg-slate-800/40 p-5 rounded-xl border border-slate-700/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-sm transition-all duration-300">
              <p className="text-xs text-slate-500 mb-1">{t('status')} ({new Date().toLocaleString('default', { month: 'short' })})</p>
              {tenant.rentStatus === 'Paid' ? (
                <p className="text-lg font-medium text-green-400">{t('paid')}</p>
              ) : tenant.rentStatus === 'Upcoming' ? (
                <p className="text-lg font-medium text-yellow-400">{t('upcoming')}</p>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-lg font-medium text-red-400">{t('unpaid')} (₹{tenant.monthlyRent})</p>
                </div>
              )}
            </motion.div>
            
            <motion.div whileHover={{ y: -5, scale: 1.02 }} className="bg-slate-800/40 p-5 rounded-xl border border-slate-700/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-sm transition-all duration-300">
               <p className="text-xs text-slate-400 mb-1 font-medium tracking-wide">{t('agreedMonthlyRent')}</p>
               <p className="text-lg font-bold text-indigo-400">₹{tenant.monthlyRent}</p>
            </motion.div>
            <motion.div whileHover={{ y: -5, scale: 1.02 }} className="bg-slate-800/40 p-5 rounded-xl border border-slate-700/30 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-sm transition-all duration-300">
              <p className="text-xs text-slate-400 mb-1 font-medium tracking-wide">{t('securityDeposit')}</p>
              <p className="text-lg font-bold text-slate-300">₹{tenant.securityDeposit}</p>
            </motion.div>
          </div>

          <h3 className="text-lg font-medium text-white border-b border-slate-700/50 pb-3 mt-8 pt-4 relative z-10">{t('identityDocument')}</h3>
          
          <div className="flex flex-col gap-4 relative z-10">
            <motion.div whileHover={{ x: 5 }} className="bg-slate-800/20 p-4 rounded-xl border border-slate-700/20">
              <p className="text-xs text-slate-400 mb-1 font-medium tracking-wide">{t('aadharNumber')}</p>
              <p className="text-lg font-medium text-slate-300 tracking-wider">
                {tenant.aadharNumber.replace(/(\d{4})/g, '$1 ').trim()}
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default TenantDetail;

