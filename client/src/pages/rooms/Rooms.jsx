import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useT } from '../../hooks/useT';
import { motion } from 'framer-motion';
import { DoorOpen, Search, BedDouble, PlusCircle } from 'lucide-react';
import PGFilter from '../../components/PGFilter';

const RoomsGlobal = () => {
  const navigate = useNavigate();
  const { t } = useT();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPgId, setSelectedPgId] = useState('');

  useEffect(() => {
    const fetchAllRooms = async () => {
      try {
        const { data } = await api.get('/rooms');
        setRooms(data);
      } catch (error) {
        console.error('Failed to fetch rooms:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAllRooms();
  }, []);

  const filteredRooms = rooms
    .filter(r => selectedPgId ? r.pgId?._id === selectedPgId : true)
    .filter(r =>
      (r.roomNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.roomType || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.pgId?.name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">{t('All Rooms') || 'All Rooms'}</h1>
          <p className="text-slate-400 mt-1">{t('Manage Rooms Desc') || 'Overview of all rooms across all properties'}</p>
        </div>
      </div>

      <div className="glass-card p-6 rounded-2xl border border-slate-700/50 flex flex-col min-h-[500px]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={t('Search Rooms Placeholder') || 'Search by room no, type, or PG...'}
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
          ) : filteredRooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-12 text-slate-500 gap-3">
              <DoorOpen className="w-12 h-12 opacity-50" />
              <p>{t('noRoomsFound') || 'No rooms found.'}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredRooms.map((room, idx) => (
                <motion.div
                  key={room._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  onClick={() => navigate(`/rooms/${room._id}`)}
                  className="bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/50 rounded-xl p-4 cursor-pointer transition-all hover:border-indigo-500/30 group"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="bg-indigo-500/10 text-indigo-400 p-2 rounded-lg">
                      <BedDouble className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-semibold text-slate-300 bg-slate-700/50 px-2 py-1 rounded-md">
                      {room.roomType}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">
                    {t('roomLabel') || 'Room'} {room.roomNumber}
                  </h3>
                  <p className="text-sm text-slate-400 truncate mb-3">{room.pgId?.name || 'Unknown PG'}</p>

                  <div className="flex justify-between items-center text-sm pt-3 border-t border-slate-700/50">
                    <span className="text-slate-400">
                      {room.capacity} {t('seaterLabel') || 'Seater'}
                    </span>
                    <span className="font-semibold text-indigo-400 text-base">
                      ₹{room.rent}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomsGlobal;
