import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../../services/api';
import { useT } from '../../hooks/useT';
import { motion } from 'framer-motion';
import { CreditCard, IndianRupee, Search, Filter, History } from 'lucide-react';
import Swal from 'sweetalert2';

const Payments = () => {
  const { t } = useT();
  const [tenantId, setTenantId] = useState('');
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // New State for Search
  const [allTenants, setAllTenants] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedTenantName, setSelectedTenantName] = useState('');

  // Use translated month names from i18n
  const monthNames = t('monthNames', { returnObjects: true }) || [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];
  
  const searchRef = React.useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [payFormData, setPayFormData] = useState({
    amount: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });
  
  const location = useLocation();

  useEffect(() => {
    // Fetch all tenants to power the typeahead search
    const fetchAllTenants = async () => {
      try {
        const { data } = await api.get('/tenants');
        setAllTenants(data);
      } catch (error) {
        console.error('Failed to fetch all tenants', error);
      }
    };
    fetchAllTenants();
  }, []);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const tId = queryParams.get('tenantId');
    if (tId) {
      setTenantId(tId);
      fetchPayments(tId);
      // Try to match name immediately if data is ready
      const matched = allTenants.find(t => t._id === tId);
      if (matched) {
        setSelectedTenantName(matched.name);
        setSearchTerm(matched.name);
      }
    }
  }, [location, allTenants]);

  const fetchPayments = async (id) => {
    if (!id) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/payments/tenant/${id}`);
      setPayments(data);
    } catch (err) {
      console.error('Failed to fetch payments', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchPayments(tenantId);
  };

  const handleSelectTenant = (tenant) => {
    setTenantId(tenant._id);
    setSelectedTenantName(tenant.name);
    setSearchTerm(tenant.name);
    setShowDropdown(false);
    fetchPayments(tenant._id);
    
    // Auto-fill rent amount
    setPayFormData(prev => ({ ...prev, amount: tenant.monthlyRent || '' }));
  };

  const filteredTenants = allTenants.filter(t => 
    (t.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (t.room?.roomNumber?.toString() || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePayRent = async (e) => {
    e.preventDefault();
    if (!tenantId) {
      return Swal.fire({
        title: t('selectTenant'),
        text: t('pleaseSearchAndSelectTenant'),
        icon: 'warning',
        background: '#1e293b',
        color: '#fff',
        confirmButtonColor: '#4f46e5'
      });
    }
    
    try {
      // Get tenant details first to get roomId and pgId
      const targetTenant = await api.get(`/tenants/${tenantId}`);
      
      const payload = {
        tenantId,
        roomId: targetTenant.data.room._id,
        pgId: targetTenant.data.pg._id,
        amount: Number(payFormData.amount),
        month: Number(payFormData.month),
        year: Number(payFormData.year)
      };

      await api.post('/payments', payload);
      Swal.fire({
        title: t('success'),
        text: t('paymentLoggedSuccess'),
        icon: 'success',
        background: '#1e293b',
        color: '#fff',
        confirmButtonColor: '#4f46e5'
      });
      fetchPayments(tenantId);
      setPayFormData({ ...payFormData, amount: '' });
    } catch (err) {
      console.error('Payment failed', err);
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">{t('paymentManagement')}</h1>
        <p className="text-slate-400 mt-1">{t('recordTrackRentPayments')}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Record Payment Form */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-card p-6 rounded-2xl border border-slate-700/50 flex flex-col h-[500px] z-20 relative">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-6 border-b border-slate-700/50 pb-4">
            <CreditCard className="w-5 h-5 text-indigo-400" /> {t('recordPayment')}
          </h2>
          
          <div className="mb-6 relative" ref={searchRef}>
            <label className="block text-sm font-medium text-slate-300 mb-1">{t('searchTenant')}</label>
            <div className="relative">
              <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                  if(e.target.value === '') setTenantId('');
                }}
                onFocus={() => setShowDropdown(true)}
                placeholder={t('searchByNameOrRoom')}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-white"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
            
            {showDropdown && searchTerm && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-50 max-h-60 overflow-y-auto custom-scrollbar">
                {filteredTenants.length > 0 ? (
                  filteredTenants.map(tenant => (
                    <div 
                      key={tenant._id}
                      onClick={() => handleSelectTenant(tenant)}
                      className="px-4 py-3 hover:bg-slate-700 cursor-pointer flex justify-between items-center transition-colors border-b border-slate-700/50 last:border-0"
                    >
                      <div>
                        <p className="text-white font-medium">{tenant.name}</p>
                        <p className="text-xs text-slate-400">{t('room')} {tenant.room?.roomNumber} • {tenant.pg?.name}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-md ${tenant.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {tenant.status === 'Active' ? t('active') : t('inactive')}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-3 text-slate-400 text-sm text-center">{t('noTenantsFound')}</div>
                )}
              </div>
            )}
          </div>

          <form onSubmit={handlePayRent} className="space-y-4 flex-1 flex flex-col">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">{t('amount')} (₹)</label>
              <input 
                type="number"
                value={payFormData.amount}
                onChange={(e) => setPayFormData({...payFormData, amount: e.target.value})}
                required
                className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-white"
                placeholder="e.g. 5000"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">{t('month')}</label>
                <select 
                  value={payFormData.month}
                  onChange={(e) => setPayFormData({...payFormData, month: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-white"
                >
                  {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                    <option key={m} value={m}>{monthNames[m - 1]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">{t('year')}</label>
                <input 
                  type="number"
                  value={payFormData.year}
                  onChange={(e) => setPayFormData({...payFormData, year: e.target.value})}
                  required
                  className="w-full px-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-white"
                />
              </div>
            </div>
            
            <button 
              type="submit" 
              className="mt-auto w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-green-500/20"
            >
              {t('confirmRentPayment')}
            </button>
          </form>
        </motion.div>

        {/* Payment History View */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-700/50 flex flex-col h-[500px]">
          <div className="flex justify-between items-center mb-6 border-b border-slate-700/50 pb-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-400" /> {t('paymentHistory')}
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            ) : payments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-3">
                <Filter className="w-12 h-12 opacity-50" />
                <p>{t('searchTenantIdToViewHistory')}</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-slate-900 z-10">
                  <tr className="text-slate-400 text-sm">
                    <th className="pb-3 px-4 font-medium">{t('date')}</th>
                    <th className="pb-3 px-4 font-medium">{t('period')}</th>
                    <th className="pb-3 px-4 font-medium">{t('amount')}</th>
                    <th className="pb-3 px-4 font-medium text-right">{t('status')}</th>
                  </tr>
                </thead>
                <tbody className="text-slate-200">
                  {payments.map(payment => (
                    <tr key={payment._id} className="border-b border-slate-700/30 hover:bg-slate-800/30">
                      <td className="py-4 px-4">{new Date(payment.paymentDate).toLocaleDateString()}</td>
                      <td className="py-4 px-4">{monthNames[payment.month - 1].substring(0, 3)} {payment.year}</td>
                      <td className="py-4 px-4 font-medium text-white flex items-center"><IndianRupee className="w-3 h-3 mr-1" />{payment.amount}</td>
                      <td className="py-4 px-4 text-right">
                        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
                          {payment.paymentStatus === 'paid' ? t('paid').toUpperCase() : t('unpaid').toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Payments;
