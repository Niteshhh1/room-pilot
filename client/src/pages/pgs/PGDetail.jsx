import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePGStore } from '../../store/pgStore';
import api from '../../services/api';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Activity, Edit, Plus, Home } from 'lucide-react';
import Swal from 'sweetalert2';
import { useT } from '../../hooks/useT';

const PGDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentPG, fetchPGById, isLoading } = usePGStore();
  const [rooms, setRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const { t } = useT();

  useEffect(() => {
    fetchPGById(id);
    const fetchRooms = async () => {
      try {
        const { data } = await api.get(`/rooms/pg/${id}`);
        setRooms(data);
      } catch (err) {
        console.error('Failed to fetch rooms', err);
      } finally {
        setRoomsLoading(false);
      }
    };
    fetchRooms();
  }, [id, fetchPGById]);

  if (isLoading || !currentPG) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const handleDeletePG = async () => {
    const result = await Swal.fire({
      title: t('deleteProperty'),
      text: t('thisWillPermanentlyDelete'),
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#334155',
      confirmButtonText: t('deletePropertyConfirm'),
      background: '#1e293b',
      color: '#fff'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/pgs/${id}`);
        Swal.fire({
          title: t('deleted'),
          text: t('propertyDeleted'),
          icon: 'success',
          background: '#1e293b',
          color: '#fff',
          confirmButtonColor: '#4f46e5'
        });
        navigate('/pgs');
      } catch (err) {
        Swal.fire({
          title: t('error'),
          text: err.response?.data?.message || t('error'),
          icon: 'error',
          background: '#1e293b',
          color: '#fff',
          confirmButtonColor: '#4f46e5'
        });
      }
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      
      {/* Header */}
      <div className="flex sm:flex-row flex-col sm:items-center justify-between gap-4 group">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/pgs')} className="p-2 glass-card hover:bg-slate-800 rounded-xl text-slate-300">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">{currentPG.name}</h1>
            <p className="text-slate-400 mt-1 flex items-center gap-1.5 text-sm">
              <MapPin className="w-4 h-4" /> {currentPG.address}, {currentPG.city}
            </p>
          </div>
        </div>
        
        {/* Action Buttons visible only on hover of the header row */}
        <div className="opacity-0 group-hover:opacity-100 flex items-center gap-3 transition-opacity duration-200">
          <button 
            onClick={() => navigate(`/pgs/${id}/edit`)}
            className="flex items-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-medium border border-slate-700 transition-colors"
          >
            <Edit className="w-4 h-4" /> {t('edit')}
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-2xl border border-slate-700/50">
          <div className="text-slate-400 text-sm mb-1">{t('totalRooms')}</div>
          <div className="text-2xl font-bold text-white">{currentPG.totalRooms}</div>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-slate-700/50">
          <div className="text-slate-400 text-sm mb-1">{t('totalCapacity')}</div>
          <div className="text-2xl font-bold text-white">{currentPG.totalCapacity}</div>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-slate-700/50">
          <div className="text-slate-400 text-sm mb-1">{t('totalFloors')}</div>
          <div className="text-2xl font-bold text-white">{currentPG.totalFloors}</div>
        </div>
        <div className="glass-card p-5 rounded-2xl border border-slate-700/50 flex flex-col justify-center bg-indigo-500/10 border-indigo-500/20">
          <button className="flex items-center justify-center gap-2 text-indigo-400 font-medium hover:text-indigo-300 transition-colors">
            <Activity className="w-5 h-5" /> {t('viewAnalytics')}
          </button>
        </div>
      </div>

      {/* Rooms Section */}
      <div className="glass-card p-6 rounded-2xl border border-slate-700/50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Home className="w-5 h-5 text-indigo-400" /> {t('roomsList')}
          </h2>
          <button 
            onClick={() => navigate(`/pgs/${id}/rooms/add`)}
            className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-all border border-slate-600 shrink-0"
          >
            <Plus className="w-4 h-4" /> {t('addRoom')}
          </button>
        </div>

        {roomsLoading ? (
            <div className="animate-pulse flex flex-col gap-3">
              {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-800/50 rounded-xl"></div>)}
            </div>
        ) : rooms.length === 0 ? (
          <div className="text-center py-10 bg-slate-800/30 rounded-xl border border-dashed border-slate-600">
            <p className="text-slate-400 mb-3">{t('noRoomsAdded')}</p>
            <button 
              onClick={() => navigate(`/pgs/${id}/rooms/add`)}
              className="text-indigo-400 hover:text-indigo-300 font-medium text-sm"
            >
              {t('addFirstRoom')}
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-700/50 text-slate-400 text-sm">
                  <th className="pb-3 font-medium px-4">{t('roomNo')}</th>
                  <th className="pb-3 font-medium px-4">{t('floor')}</th>
                  <th className="pb-3 font-medium px-4">{t('type')}</th>
                  <th className="pb-3 font-medium px-4">{t('rent')}</th>
                  <th className="pb-3 font-medium px-4 text-right">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="text-slate-200">
                {rooms.map((room) => (
                  <tr key={room._id} className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors group">
                    <td className="py-4 px-4 font-medium">{room.roomNumber}</td>
                    <td className="py-4 px-4">{room.floorNumber}</td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-1 rounded bg-slate-800 border border-slate-700 text-xs text-slate-300">{room.roomType}</span>
                    </td>
                    <td className="py-4 px-4 font-medium text-green-400">₹{room.rent}</td>
                    <td className="py-4 px-4 text-right">
                      <button 
                        onClick={() => navigate(`/rooms/${room._id}`)}
                        className="text-indigo-400 hover:text-indigo-300 font-medium text-sm transition-colors bg-indigo-500/10 hover:bg-indigo-500/20 px-3 py-1.5 rounded-lg"
                      >
                        {t('manage')}
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

export default PGDetail;
