import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useRentStore } from '../../store/rentStore';
import PGFilter from '../../components/PGFilter';
import { motion } from 'framer-motion';
import { AlertCircle, IndianRupee, Clock, CheckCircle, Calendar } from 'lucide-react';
import Swal from 'sweetalert2';
import { useT } from '../../hooks/useT';

const PendingRent = () => {
  const { t } = useT();
  const [searchParams, setSearchParams] = useSearchParams();
  const { pendingTenants, fetchPendingRent, payPendingRent, isLoading } = useRentStore();
  const [selectedPg, setSelectedPg] = useState(null);
  
  const initialMonth = searchParams.get('month') || '';
  const initialYear = searchParams.get('year') || '';
  
  const [monthFilter, setMonthFilter] = useState(initialMonth);
  const [yearFilter, setYearFilter] = useState(initialYear);

  useEffect(() => {
    fetchPendingRent(selectedPg || '', monthFilter, yearFilter);
    
    // Update URL logic silently
    const newParams = new URLSearchParams(searchParams);
    if (monthFilter && yearFilter) {
      newParams.set('month', monthFilter);
      newParams.set('year', yearFilter);
    } else {
      newParams.delete('month');
      newParams.delete('year');
    }
    setSearchParams(newParams, { replace: true });
    
  }, [selectedPg, fetchPendingRent, monthFilter, yearFilter]);

  const handlePay = async (tenant) => {
    const result = await Swal.fire({
      title: 'Confirm Payment?',
      html: `Record rent payment of <b>₹${tenant.monthlyRent.toLocaleString()}</b> for <b>${tenant.name}</b>?<br/><span style="font-size:12px;color:#94a3b8;">This will clear 1 pending month. Total pending: ${tenant.unpaidMonths} month(s).</span>`,
      icon: 'question',
      showCancelButton: true,
      background: '#1e293b',
      color: '#fff',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, Pay Now!'
    });

    if (result.isConfirmed) {
      const success = await payPendingRent(tenant._id);
      if (success) {
        Swal.fire({
          title: 'Payment Recorded!',
          text: `Payment for ${tenant.name} was successfully captured.`,
          icon: 'success',
          background: '#1e293b',
          color: '#fff',
          confirmButtonColor: '#4f46e5'
        });
        fetchPendingRent(selectedPg || '', monthFilter, yearFilter);
      } else {
        const { error } = useRentStore.getState();
        Swal.fire({
          title: 'Payment Failed',
          text: error || 'An unexpected error occurred while capturing payment.',
          icon: 'error',
          background: '#1e293b',
          color: '#fff',
          confirmButtonColor: '#ef4444'
        });
      }
    }
  };

  const totalPendingAmount = pendingTenants.reduce((sum, tenant) => sum + (tenant.pendingAmount || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Clock className="w-6 h-6 text-rose-400" /> 
            Pending Rent
          </h1>
          <p className="text-slate-400 text-sm mt-1">Track and manage overdue tenant payments</p>
        </div>
      </div>

      <div className="glass-card p-4 rounded-xl border border-slate-700/50 flex flex-col md:flex-row gap-4 items-center justify-between relative z-30">
        <div className="w-full md:w-1/3 flex-1">
          <PGFilter selectedPg={selectedPg} onSelectPg={setSelectedPg} />
        </div>
        
        <div className="w-full md:w-auto flex items-center gap-3">
          <div className="relative flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-xl transition-colors hover:bg-slate-700/80">
            <Calendar className="w-4 h-4 text-indigo-400" />
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="bg-transparent text-sm font-medium text-white focus:outline-none py-1 focus:ring-0 appearance-none pr-4 cursor-pointer"
            >
              <option className="bg-slate-800" value="">Current Month</option>
              <option className="bg-slate-800" value="1">January</option>
              <option className="bg-slate-800" value="2">February</option>
              <option className="bg-slate-800" value="3">March</option>
              <option className="bg-slate-800" value="4">April</option>
              <option className="bg-slate-800" value="5">May</option>
              <option className="bg-slate-800" value="6">June</option>
              <option className="bg-slate-800" value="7">July</option>
              <option className="bg-slate-800" value="8">August</option>
              <option className="bg-slate-800" value="9">September</option>
              <option className="bg-slate-800" value="10">October</option>
              <option className="bg-slate-800" value="11">November</option>
              <option className="bg-slate-800" value="12">December</option>
            </select>
          </div>
          <div className="relative flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-xl transition-colors hover:bg-slate-700/80">
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="bg-transparent text-sm font-medium text-white py-1 focus:outline-none focus:ring-0 appearance-none pr-4 cursor-pointer"
            >
              <option className="bg-slate-800" value="">Current Year</option>
              <option className="bg-slate-800" value="2024">2024</option>
              <option className="bg-slate-800" value="2025">2025</option>
              <option className="bg-slate-800" value="2026">2026</option>
              <option className="bg-slate-800" value="2027">2027</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-5 rounded-xl border border-rose-500/30 bg-gradient-to-br from-rose-500/10 to-transparent">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-rose-500/20 rounded-lg text-rose-400"><IndianRupee className="w-5 h-5"/></div>
            <p className="text-slate-400 text-sm font-medium">Total Pending Revenue</p>
          </div>
          <p className="text-3xl font-bold text-white pl-12">₹{totalPendingAmount.toLocaleString()}</p>
        </div>
      </div>

      <div className="glass-card overflow-hidden rounded-xl border border-slate-700/50 mt-4">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400">Loading pending rents...</div>
        ) : pendingTenants.length === 0 ? (
          <div className="p-12 text-center">
            <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-1">All Caught Up!</h3>
            <p className="text-slate-400">No active tenants have pending rent at this time.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="bg-slate-800/50 border-b border-slate-700">
                  <th className="p-4 text-sm font-medium text-slate-300">Tenant</th>
                  <th className="p-4 text-sm font-medium text-slate-300">Property / Room</th>
                  <th className="p-4 text-sm font-medium text-slate-300">Months Due</th>
                  <th className="p-4 text-sm font-medium text-slate-300 border-r border-slate-700/30">Pending Amount</th>
                  <th className="p-4 text-sm font-medium text-slate-300 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50 text-sm">
                {pendingTenants.map((tenant) => (
                  <tr key={tenant._id} className="hover:bg-slate-800/20 transition-colors">
                    <td className="p-4">
                      <div className="font-medium text-white">{tenant.name}</div>
                      <div className="text-xs text-slate-400">{tenant.contactNumber}</div>
                    </td>
                    <td className="p-4">
                      <div className="text-white">{tenant.pg?.name || 'Unknown PG'}</div>
                      <div className="text-xs text-indigo-300">Room {tenant.room?.roomNumber || 'N/A'}</div>
                    </td>
                    <td className="p-4">
                      <span className="bg-rose-500/20 text-rose-400 py-1 px-2.5 rounded-full text-xs font-semibold">
                        {tenant.unpaidMonths} Month(s)
                      </span>
                    </td>
                    <td className="p-4 border-r border-slate-700/30">
                      <div className="font-bold text-rose-400 text-base">₹{tenant.pendingAmount.toLocaleString()}</div>
                      <div className="text-xs text-slate-500">(₹{tenant.monthlyRent.toLocaleString()} / mo)</div>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handlePay(tenant)}
                        className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-4 py-2 rounded-lg font-medium flex items-center justify-center gap-2 hover:gap-3 transition-all ml-auto"
                      >
                        <CheckCircle className="w-4 h-4" /> Pay Now
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingRent;
