import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import PGFilter from '../../components/PGFilter';
import { motion } from 'framer-motion';
import { 
  TrendingUp, IndianRupee, PieChart, Activity, 
  ArrowRight, AlertCircle, Calendar 
} from 'lucide-react';
import { useT } from '../../hooks/useT';

const Earnings = () => {
  const { t } = useT();
  const navigate = useNavigate();
  const [selectedPg, setSelectedPg] = useState(null);
  
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [earningsData, setEarningsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      if (!selectedPg) return;
      setIsLoading(true);
      try {
        const { data } = await api.get(`/earnings?pgId=${selectedPg}&year=${selectedYear}`);
        setEarningsData(data);
      } catch (error) {
        console.error('Failed to fetch earnings data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEarnings();
  }, [selectedPg, selectedYear]);

  // Generate Year Options
  const yearOptions = [];
  for (let y = currentYear - 2; y <= currentYear + 2; y++) {
    yearOptions.push(y);
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full filter blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight flex items-center gap-3">
            <PieChart className="w-8 h-8 text-emerald-400" /> 
            Yearly Earnings
          </h1>
          <p className="text-slate-400 text-sm mt-2 max-w-lg">Track your PG's financial performance month-by-month and identify unpaid rents.</p>
        </div>
      </div>

      {/* Filters (PG + Year) */}
      <div className="glass-card p-4 rounded-xl border border-slate-700/50 flex flex-col md:flex-row gap-4 items-center justify-between relative z-30">
        <div className="w-full md:w-1/3 flex-1">
          <PGFilter selectedPg={selectedPg} onSelectPg={setSelectedPg} />
        </div>
        <div className="w-full md:w-auto relative flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-xl transition-colors hover:bg-slate-700/80">
          <Calendar className="w-4 h-4 text-indigo-400" />
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="bg-transparent font-medium text-white focus:outline-none focus:ring-0 appearance-none cursor-pointer pr-4 py-1"
          >
            {yearOptions.map(y => (
              <option className="bg-slate-800" key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {!selectedPg ? (
         <div className="glass-card p-12 text-center rounded-2xl border border-slate-700/50">
           <Activity className="w-12 h-12 text-slate-500 mx-auto mb-4" />
           <h3 className="text-lg font-medium text-white">Select a PG</h3>
           <p className="text-slate-400 mt-2">Please select a PG from the dropdown above to view the yearly earnings report.</p>
         </div>
      ) : isLoading ? (
         <div className="flex justify-center items-center h-64">
           <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
         </div>
      ) : earningsData && (
        <>
          {/* Yearly Aggregates Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-6 rounded-2xl border border-indigo-500/30 bg-indigo-500/5">
              <p className="text-slate-400 text-sm font-medium mb-1">Yearly Expected</p>
              <h3 className="text-2xl font-bold text-white flex items-center"><IndianRupee className="w-5 h-5 mr-1 text-indigo-400"/> {earningsData.summary.expectedRent.toLocaleString()}</h3>
            </div>
            <div className="glass-card p-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/5">
              <p className="text-slate-400 text-sm font-medium mb-1">Yearly Received</p>
              <h3 className="text-2xl font-bold text-white flex items-center"><IndianRupee className="w-5 h-5 mr-1 text-emerald-400"/> {earningsData.summary.receivedRent.toLocaleString()}</h3>
            </div>
            <div className="glass-card p-6 rounded-2xl border border-amber-500/30 bg-amber-500/5">
              <p className="text-slate-400 text-sm font-medium mb-1 flex justify-between">Yearly Expenses</p>
              <h3 className="text-2xl font-bold text-white flex items-center"><IndianRupee className="w-5 h-5 mr-1 text-amber-400"/> {earningsData.summary.expense.toLocaleString()}</h3>
            </div>
            <div className="glass-card p-6 rounded-2xl border border-rose-500/30 bg-rose-500/5">
              <p className="text-slate-400 text-sm font-medium mb-1 flex justify-between">Yearly Remaining</p>
              <h3 className="text-2xl font-bold text-rose-400 flex items-center"><IndianRupee className="w-5 h-5 mr-1"/> {earningsData.summary.remainingRent.toLocaleString()}</h3>
            </div>
          </div>
          
          <div className="glass-card p-6 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-transparent">
             <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400"><TrendingUp className="w-6 h-6"/></div>
               <p className="text-emerald-200 text-base font-semibold tracking-wide">NET PROFIT ({selectedYear})</p>
             </div>
             <p className="text-4xl font-black text-white pl-14">₹{earningsData.summary.profit.toLocaleString()}</p>
          </div>

          {/* Monthly Breakdown Table */}
          <div className="glass-card overflow-hidden rounded-2xl border border-slate-700/50">
            <div className="p-5 border-b border-slate-700/50 bg-slate-800/40">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-400" /> Monthly Breakdown
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-800/80 border-b border-slate-700/80 text-xs uppercase tracking-wider text-slate-400 font-semibold">
                    <th className="p-4 pl-6">Month</th>
                    <th className="p-4">Expected</th>
                    <th className="p-4">Received</th>
                    <th className="p-4">Remaining</th>
                    <th className="p-4">Expense</th>
                    <th className="p-4 border-r border-slate-700/30">Profit</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50 text-sm font-medium">
                  {earningsData.months.map((month) => {
                    const isPending = month.remainingRent > 0;
                    return (
                      <tr key={month.monthNumber} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-4 pl-6 text-white text-base font-semibold">{month.monthName}</td>
                        <td className="p-4 text-slate-300">₹{month.expectedRent.toLocaleString()}</td>
                        <td className="p-4 text-emerald-400">₹{month.receivedRent.toLocaleString()}</td>
                        <td className="p-4">
                          {isPending ? (
                            <span className="text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded-md">
                              ₹{month.remainingRent.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-slate-500">₹0</span>
                          )}
                        </td>
                        <td className="p-4 text-amber-400">₹{month.expense.toLocaleString()}</td>
                        <td className="p-4 border-r border-slate-700/30 font-bold text-white">₹{month.profit.toLocaleString()}</td>
                        <td className="p-4 text-center">
                           <button
                             onClick={() => navigate(`/pending-rent?month=${month.monthNumber}&year=${selectedYear}`)}
                             className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 px-4 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 mx-auto transition-all"
                           >
                             <AlertCircle className="w-3.5 h-3.5" /> Remaining Rent Tenants
                           </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Earnings;
