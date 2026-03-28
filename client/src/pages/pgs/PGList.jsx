import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePGStore } from '../../store/pgStore';
import { useT } from '../../hooks/useT';
import { motion } from 'framer-motion';
import { Plus, Building, MapPin, Users, Home } from 'lucide-react';

const PGList = () => {
  const { pgs, fetchPGs, isLoading } = usePGStore();
  const navigate = useNavigate();
  const { t } = useT();

  useEffect(() => {
    fetchPGs();
  }, [fetchPGs]);

  return (
    <div className="space-y-6 flex flex-col min-h-[85vh]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">{t('allProperties')}</h1>
          <p className="text-slate-400 mt-1">{t('managePGsDesc')}</p>
        </div>
        <button
          onClick={() => navigate('/pgs/add')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20 shrink-0"
        >
          <Plus className="w-5 h-5" /> {t('addProperty')}
        </button>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      ) : pgs.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center glass-card rounded-2xl border border-slate-700/50 p-12 text-center">
          <div className="bg-slate-800/50 p-6 rounded-full mb-6 border border-slate-700 flex items-center justify-center">
            <Building className="w-16 h-16 text-slate-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{t('noPropertiesYet')}</h3>
          <p className="text-slate-400 max-w-md mb-8">{t('addFirstPG')}</p>
          <button
            onClick={() => navigate('/pgs/add')}
            className="bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 px-6 py-3 rounded-xl font-medium transition-all"
          >
            {t('addProperty')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pgs.map((pg, idx) => (
            <motion.div
              key={pg._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => navigate(`/pgs/${pg._id}`)}
              className="glass-card rounded-2xl border border-slate-700/50 overflow-hidden cursor-pointer hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 transition-all group"
            >
              <div className="h-40 bg-slate-800 relative overflow-hidden">
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 border-b border-slate-700/50">
                  <Building className="w-12 h-12 text-slate-600" />
                </div>
                <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-white border border-white/10 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span> {t('active')}
                </div>
              </div>
              
              <div className="p-5">
                <h3 className="text-xl font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">{pg.name}</h3>
                <div className="flex items-start gap-2 text-slate-400 text-sm mb-4">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                  <p className="line-clamp-2">{pg.address}, {pg.city}, {pg.state}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-700/50">
                  <div className="bg-slate-800/50 p-3 rounded-xl flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-lg"><Home className="w-4 h-4" /></div>
                    <div>
                      <p className="text-xs text-slate-500">{t('rooms')}</p>
                      <p className="text-white font-bold">{pg.totalRooms}</p>
                    </div>
                  </div>
                  <div className="bg-slate-800/50 p-3 rounded-xl flex items-center gap-3">
                    <div className="p-2 bg-green-500/20 text-green-400 rounded-lg"><Users className="w-4 h-4" /></div>
                    <div>
                      <p className="text-xs text-slate-500">{t('totalCapacity')}</p>
                      <p className="text-white font-bold">{pg.totalCapacity}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PGList;
