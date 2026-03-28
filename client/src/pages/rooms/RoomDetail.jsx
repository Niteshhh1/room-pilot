import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { motion } from 'framer-motion';
import { ArrowLeft, Users, Home, IndianRupee, History, Plus, UserX } from 'lucide-react';
import { useT } from '../../hooks/useT';

const RoomDetail = () => {
  const { t } = useT();
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [roomRes, tenantsRes] = await Promise.all([
        api.get(`/rooms/${id}`),
        api.get(`/tenants/room/${id}`)
      ]);
      setRoom(roomRes.data);
      setTenants(tenantsRes.data.filter(t => t.status === 'Active'));
    } catch (err) {
      console.error('Failed to fetch room details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [id]);

  if (loading || !room) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const occupiedBeds = tenants.length;
  const availableBeds = room.capacity - occupiedBeds;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(`/pgs/${room.pgId._id}`)} className="p-2 glass-card hover:bg-slate-800 rounded-xl text-slate-300">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">{t('room')} {room.roomNumber}</h1>
          <p className="text-slate-400 mt-1 flex items-center gap-1.5 text-sm">
            <Home className="w-4 h-4" /> {room.pgId?.name} • {t('floor')} {room.floorNumber}
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-700/50">
          <div className="text-slate-400 text-sm mb-1">{t('roomType')}</div>
          <div className="text-xl font-bold text-white">{room.roomType}</div>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-slate-700/50">
          <div className="text-slate-400 text-sm mb-1">{t('monthlyRent')}</div>
          <div className="text-xl font-bold text-green-400 flex items-center"><IndianRupee className="w-4 h-4 mr-1" />{room.rent}</div>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-slate-700/50">
          <div className="text-slate-400 text-sm mb-1 flex justify-between">{t('occupied')} <span>{occupiedBeds}/{room.capacity}</span></div>
          <div className="w-full bg-slate-800 rounded-full h-2.5 mt-2">
            <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${(occupiedBeds/room.capacity)*100}%` }}></div>
          </div>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-slate-700/50 flex flex-col justify-center bg-slate-800/30 gap-3">
          <button 
            onClick={() => navigate(`/rooms/${id}/edit`)}
            className="flex items-center justify-center gap-2 text-indigo-400 font-medium hover:text-indigo-300 transition-colors w-full bg-indigo-500/10 hover:bg-indigo-500/20 py-2 rounded-xl"
          >
            {t('editRoom')}
          </button>
          <button 
            onClick={() => navigate(`/rooms/${id}/past-members`)}
            className="flex items-center justify-center gap-2 text-slate-300 font-medium hover:text-white transition-colors w-full"
          >
            <History className="w-5 h-5" /> {t('pastMembers')}
          </button>
        </div>
      </div>

      {/* Current Tenants */}
      <div className="glass-card p-6 rounded-2xl border border-slate-700/50">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" /> {t('currentTenants')}
          </h2>
          {availableBeds > 0 && (
            <button 
              onClick={() => navigate(`/rooms/${id}/tenants/add`)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" /> {t('addTenant')}
            </button>
          )}
        </div>

        {tenants.length === 0 ? (
          <div className="text-center py-10 bg-slate-800/30 rounded-xl border border-dashed border-slate-600">
            <p className="text-slate-400 mb-3">{t('roomIsEmpty')}</p>
            {availableBeds > 0 && (
              <button 
                onClick={() => navigate(`/rooms/${id}/tenants/add`)}
                className="text-indigo-400 hover:text-indigo-300 font-medium text-sm"
              >
                + {t('addTenant')}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tenants.map(tenant => (
              <div key={tenant._id} className="bg-slate-800/50 border border-slate-700/50 p-5 rounded-xl hover:border-indigo-500/30 transition-colors group cursor-pointer" onClick={() => navigate(`/tenants/${tenant._id}`)}>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                    {tenant.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-white font-medium group-hover:text-indigo-400 transition-colors">{tenant.name}</h3>
                    <p className="text-slate-400 text-xs mt-0.5">{tenant.contactNumber}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-slate-700/50 mt-auto">
                  <div className="text-xs text-slate-500">{t('rent')}: <span className="text-slate-300">₹{tenant.monthlyRent}</span></div>
                  <button className="text-indigo-400 text-xs font-medium hover:text-white transition-colors">{t('viewProfile')}</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </motion.div>
  );
};

export default RoomDetail;
