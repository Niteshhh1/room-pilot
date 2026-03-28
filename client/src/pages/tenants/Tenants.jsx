import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useT } from '../../hooks/useT';
import { motion } from 'framer-motion';
import { Users, Search, MoreHorizontal } from 'lucide-react';
import PGFilter from '../../components/PGFilter';

const TenantsGlobal = () => {
  const navigate = useNavigate();
  const { t } = useT();
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('Active');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPgId, setSelectedPgId] = useState('');

  useEffect(() => {
    const fetchAllTenants = async () => {
      try {
        const { data } = await api.get('/tenants');
        setTenants(data);
      } catch (error) {
        console.error('Failed to fetch all tenants', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllTenants();
  }, []);

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
      await api.put(`/tenants/${id}/status`, { status: newStatus });
      setTenants(tenants.map(t => t._id === id ? { ...t, status: newStatus } : t));
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  const filteredTenants = tenants
    .filter(t => t.status === filterStatus)
    .filter(t => selectedPgId ? t.pg?._id === selectedPgId : true)
    .filter(t => 
      (t.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (t.pg?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">{t('allTenants')}</h1>
          <p className="text-slate-400 mt-1">{t('manageTenantsDesc')}</p>
        </div>
        {/* Status Toggle Tabs */}
        <div className="flex bg-slate-800/50 p-1 rounded-xl border border-slate-700">
          <button onClick={() => setFilterStatus('Active')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterStatus === 'Active' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'}`}>
            {t('active')}
          </button>
          <button onClick={() => setFilterStatus('Inactive')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterStatus === 'Inactive' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}>
            {t('inactive')}
          </button>
        </div>
      </div>

      <div className="glass-card p-6 rounded-2xl border border-slate-700/50 flex flex-col min-h-[500px]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder={t('searchTenantsPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 text-white text-sm"
            />
          </div>
          
          <PGFilter selectedPg={selectedPgId} onSelectPg={setSelectedPgId} />
        </div>

        <div className="flex-1 overflow-x-auto custom-scrollbar">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : filteredTenants.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-slate-500 gap-3">
              <Users className="w-12 h-12 opacity-50" />
              <p>{t('noTenantsFound')}</p>
            </div>
          ) : (
            <table className="w-full text-left min-w-[700px]">
              <thead className="border-b border-slate-700/50">
                <tr className="text-slate-400 text-sm">
                  <th className="pb-3 px-4 font-medium">{t('tenants')}</th>
                  <th className="pb-3 px-4 font-medium">{t('pgLabel')}</th>
                  <th className="pb-3 px-4 font-medium">{t('roomLabel')}</th>
                  <th className="pb-3 px-4 font-medium">{t('contactNumber')}</th>
                  <th className="pb-3 px-4 font-medium">{t('joiningDate')}</th>
                  <th className="pb-3 px-4 font-medium">{t('status')}</th>
                  <th className="pb-3 px-4 font-medium text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="text-slate-200">
                {filteredTenants.map((tenant, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={tenant._id} 
                    className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors group"
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shrink-0">
                          {tenant.name.charAt(0)}
                        </div>
                        <div className="font-medium text-white">{tenant.name}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">{tenant.pg?.name || 'Unknown'}</td>
                    <td className="py-4 px-4">{tenant.room?.roomNumber || 'Unknown'}</td>
                    <td className="py-4 px-4">{tenant.contactNumber || 'N/A'}</td>
                    <td className="py-4 px-4">{new Date(tenant.moveInDate).toLocaleDateString()}</td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${tenant.status === 'Active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
                        {tenant.status === 'Active' ? t('active') : t('inactive')}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => navigate(`/tenants/${tenant._id}`)}
                          className="text-indigo-400 hover:text-white font-medium text-sm transition-all shadow-[0_4px_10px_rgba(99,102,241,0.2)] bg-indigo-500/10 hover:bg-indigo-600/50 hover:shadow-[0_4px_15px_rgba(99,102,241,0.4)] px-4 py-2 rounded-xl"
                        >
                          {t('manage')}
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default TenantsGlobal;
