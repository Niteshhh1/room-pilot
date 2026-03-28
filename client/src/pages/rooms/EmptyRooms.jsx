import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import PGFilter from '../../components/PGFilter';
import { motion, AnimatePresence } from 'framer-motion';
import { DoorOpen, Users, Building, MapPin, Search, ArrowRight, UserPlus, Layers } from 'lucide-react';
import { useT } from '../../hooks/useT';

const EmptyRooms = () => {
  const { t } = useT();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPg, setSelectedPg] = useState(null);
  const [floorFilter, setFloorFilter] = useState('');

  const fetchEmptyRooms = async () => {
    setIsLoading(true);
    try {
      let url = '/rooms/empty?';
      if (selectedPg) url += `pgId=${selectedPg}&`;
      if (floorFilter) url += `floorNumber=${floorFilter}`;
      
      const { data } = await api.get(url);
      setRooms(data);
    } catch (error) {
      console.error('Failed to fetch empty rooms', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmptyRooms();
  }, [selectedPg, floorFilter]);

  // Extract unique floors from returned rooms if no filter is applied, for the floor dropdown hints
  const uniqueFloors = [...new Set(rooms.map(r => r.floorNumber))].sort((a,b)=>a-b);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Profile */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-indigo-500/10 to-transparent p-6 rounded-2xl border border-indigo-500/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full filter blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-indigo-200 tracking-tight flex items-center gap-3">
            <DoorOpen className="w-8 h-8 text-indigo-400" /> 
            Available Rooms
          </h1>
          <p className="text-indigo-200/70 text-sm mt-2 max-w-lg">Discover rooms with empty beds and maximize your property occupancy instantly.</p>
        </div>
        <div className="relative z-10 bg-indigo-500/20 border border-indigo-500/30 px-6 py-4 rounded-2xl flex items-center gap-4">
          <div className="text-center">
            <p className="text-xs text-indigo-300 font-medium uppercase tracking-wider">Empty Beds found</p>
            <p className="text-3xl font-black text-white">{rooms.reduce((acc, r) => acc + r.availableBeds, 0)}</p>
          </div>
        </div>
      </div>

      {/* Futuristic Filters */}
      <div className="glass-card p-2 rounded-2xl border border-slate-700/50 flex flex-col md:flex-row gap-3 items-center justify-between shadow-xl relative z-30">
        <div className="w-full md:w-1/3 flex-1">
          <PGFilter selectedPg={selectedPg} onSelectPg={setSelectedPg} />
        </div>
        <div className="w-full md:w-auto relative px-2 md:px-4 flex items-center gap-2 bg-slate-800/80 border border-slate-700 py-1.5 rounded-xl">
          <Layers className="w-5 h-5 text-slate-400" />
          <select
            value={floorFilter}
            onChange={(e) => setFloorFilter(e.target.value)}
            className="w-full md:w-32 bg-transparent text-white font-medium focus:outline-none focus:ring-0 cursor-pointer appearance-none py-1"
          >
            <option className="bg-slate-800" value="">All Floors</option>
            {uniqueFloors.length > 0 
              ? uniqueFloors.map(f => (
                  <option className="bg-slate-800" key={f} value={f}>Floor {f}</option>
                ))
              : [1,2,3,4,5].map(f => (
                  <option className="bg-slate-800" key={f} value={f}>Floor {f}</option>
                ))}
          </select>
        </div>
      </div>

      {/* Grid Canvas */}
      <div className="min-h-[400px]">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
             <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : rooms.length === 0 ? (
          <motion.div initial={{opacity:0, y:20}} animate={{opacity:1,y:0}} className="glass-card p-16 rounded-3xl text-center border border-slate-700/50">
            <div className="bg-indigo-500/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <DoorOpen className="w-10 h-10 text-indigo-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No Available Rooms</h3>
            <p className="text-slate-400 max-w-md mx-auto">All rooms are currently operating at maximum capacity based on your active filters. Great job!</p>
          </motion.div>
        ) : (
          <motion.div 
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.1 } }
            }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {rooms.map((room) => (
              <motion.div 
                key={room._id} 
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}
                className="group relative bg-slate-800/40 backdrop-blur-md rounded-3xl overflow-hidden border border-slate-700/50 hover:border-indigo-500/50 transition-all duration-500 hover:shadow-[0_0_40px_-15px_rgba(99,102,241,0.4)]"
              >
                {/* Available Badge */}
                <div className="absolute top-4 right-4 bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg shadow-emerald-500/30 flex items-center gap-1.5 z-10">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                  {room.availableBeds} {room.availableBeds === 1 ? 'bed' : 'beds'} empty
                </div>

                <div className="p-6">
                  {/* Room Identity */}
                  <div className="flex items-end gap-3 mb-6">
                    <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-500 tracking-tighter">
                      {room.roomNumber}
                    </h2>
                    <span className="text-sm font-medium text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md mb-1 border border-slate-700">
                      {room.roomType}
                    </span>
                  </div>

                  {/* Room Spec */}
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-3 text-slate-300">
                      <div className="w-8 h-8 rounded-full bg-slate-700/50 flex items-center justify-center shrink-0">
                        <Users className="w-4 h-4 text-indigo-300" />
                      </div>
                      <div className="text-sm">
                        <span className="text-white font-medium">{room.activeTenants}</span> / {room.capacity} Tenants Currently
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 text-slate-300">
                      <div className="w-8 h-8 rounded-full bg-slate-700/50 flex items-center justify-center shrink-0">
                        <Building className="w-4 h-4 text-emerald-300" />
                      </div>
                      <div className="text-sm">
                        Floor <span className="text-white font-medium">{room.floorNumber}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-slate-300">
                      <div className="w-8 h-8 rounded-full bg-slate-700/50 flex items-center justify-center shrink-0">
                        <MapPin className="w-4 h-4 text-rose-300" />
                      </div>
                      <div className="text-sm truncate pr-2">
                        <span className="text-white font-medium">{room.pgId?.name}</span>
                      </div>
                    </div>
                  </div>

                  {/* Pricing / Action */}
                  <div className="border-t border-slate-700/50 pt-5 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-0.5">Monthly Rent</p>
                      <p className="text-lg font-bold text-white">₹{room.rent?.toLocaleString()}</p>
                    </div>

                    <button 
                      onClick={() => navigate(`/rooms/${room._id}`)}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:w-full group-hover:gap-2 shadow-lg shadow-indigo-600/20 overflow-hidden"
                    >
                      <UserPlus className="w-5 h-5 shrink-0 group-hover:hidden" />
                      <span className="hidden group-hover:inline font-medium text-sm whitespace-nowrap">Manage Room</span>
                      <ArrowRight className="w-4 h-4 hidden group-hover:block" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default EmptyRooms;
