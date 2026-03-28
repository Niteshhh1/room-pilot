import React, { useState, useRef, useEffect } from 'react';
import { useT } from '../hooks/useT';
import { Search, ChevronDown, Check, Building } from 'lucide-react';
import api from '../services/api';

const PGFilter = ({ selectedPg, onSelectPg }) => {
  const { t } = useT();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [pgs, setPgs] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchPGs = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/pgs');
        setPgs(data);
      } catch (error) {
        console.error('Failed to fetch PGs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPGs();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredPgs = pgs.filter((pg) =>
    (pg.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (pg) => {
    onSelectPg(pg);
    setIsOpen(false);
    setSearchTerm('');
  };

  const selectedPgName = selectedPg ? pgs.find(p => p._id === selectedPg)?.name : t('All PGs') || 'All PGs';

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-[240px] px-4 py-2.5 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl transition-colors text-sm font-medium text-white shadow-sm"
      >
        <div className="flex items-center gap-2 truncate">
          <Building className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className="truncate">{selectedPgName}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 top-full left-0 mt-2 w-full sm:w-[250px] bg-slate-800 border border-slate-700 rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="p-3 border-b border-slate-700/50 bg-slate-800/90">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={t('Search PGs') || 'Search PGs...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-900/50 border border-slate-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 text-white text-sm"
                autoFocus
              />
            </div>
          </div>

          <div className="max-h-60 overflow-y-auto custom-scrollbar p-1.5 space-y-0.5 bg-slate-800">
            <button
              onClick={() => handleSelect('')}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${!selectedPg
                ? 'bg-indigo-600/20 text-indigo-400 font-semibold'
                : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
            >
              <span>{t('All PGs') || 'All PGs'}</span>
              {!selectedPg && <Check className="w-4 h-4 text-indigo-400" />}
            </button>

            {loading ? (
              <div className="px-3 py-4 text-center text-slate-400 text-sm">{t('loading') || 'Loading...'}</div>
            ) : filteredPgs.length > 0 ? (
              filteredPgs.map((pg) => (
                <button
                  key={pg._id}
                  onClick={() => handleSelect(pg._id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors ${selectedPg === pg._id
                    ? 'bg-indigo-600/20 text-indigo-400 font-semibold'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                >
                  <span className="truncate pr-4 text-left">{pg.name}</span>
                  {selectedPg === pg._id && <Check className="w-4 h-4 text-indigo-400 shrink-0" />}
                </button>
              ))
            ) : (
              <div className="px-3 py-4 text-center text-slate-500 text-sm">
                No matching PGs
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PGFilter;
