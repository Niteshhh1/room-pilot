import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { motion } from 'framer-motion';
import { ArrowLeft, History, Users } from 'lucide-react';
import { useT } from '../../hooks/useT';

const PastMembers = () => {
  const { t } = useT();
  const { id } = useParams();
  const navigate = useNavigate();
  const [tenants, setTenants] = useState([]);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPastMembers = async () => {
      try {
        const [roomRes, tenantsRes] = await Promise.all([
          api.get(`/rooms/${id}`),
          api.get(`/tenants/room/${id}/past`)
        ]);
        setRoom(roomRes.data);
        setTenants(tenantsRes.data);
      } catch (err) {
        console.error('Failed to fetch past members', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPastMembers();
  }, [id]);

  if (loading || !room) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(`/rooms/${id}`)} className="p-2 glass-card hover:bg-slate-800 rounded-xl text-slate-300">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{t('pastMembers')}</h1>
          <p className="text-slate-400 mt-1 text-sm">{t('historicalRecordsFor')} {t('room')} {room.roomNumber}</p>
        </div>
      </div>

      <div className="glass-card p-6 rounded-2xl border border-slate-700/50">
        <div className="flex items-center gap-2 mb-6">
          <History className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl font-bold text-white">{t('previousOccupants')}</h2>
        </div>

        {tenants.length === 0 ? (
          <div className="text-center py-12 bg-slate-800/30 rounded-xl border border-dashed border-slate-600">
            <Users className="w-12 h-12 text-slate-500 mx-auto mb-3" />
            <p className="text-slate-400">{t('noPastMembers')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700/50 text-slate-400 text-sm">
                  <th className="pb-3 pt-2 font-medium px-4">{t('fullName')}</th>
                  <th className="pb-3 pt-2 font-medium px-4">{t('contactNumber')}</th>
                  <th className="pb-3 pt-2 font-medium px-4">{t('moveInDate')}</th>
                  <th className="pb-3 pt-2 font-medium px-4 text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="text-slate-200">
                {tenants.map((tenant) => (
                  <tr key={tenant._id} className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors">
                    <td className="py-4 px-4 font-medium flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                        {tenant.name.charAt(0)}
                      </div>
                      {tenant.name}
                    </td>
                    <td className="py-4 px-4">{tenant.contactNumber}</td>
                    <td className="py-4 px-4">{new Date(tenant.moveInDate).toLocaleDateString()}</td>
                    <td className="py-4 px-4 text-right">
                      <button 
                        onClick={() => navigate(`/tenants/${tenant._id}`)}
                        className="text-indigo-400 hover:text-indigo-300 font-medium text-sm"
                      >
                        {t('viewRecord')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default PastMembers;
