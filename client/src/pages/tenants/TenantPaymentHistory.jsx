import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useT } from '../../hooks/useT';
import { motion } from 'framer-motion';
import { ArrowLeft, CreditCard, IndianRupee, Calendar, CheckCircle, Clock } from 'lucide-react';

const TenantPaymentHistory = () => {
  const { t } = useT();
  const { id } = useParams(); // tenant ID
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);

  // Use translated month names from i18n
  const monthNames = t('monthNames', { returnObjects: true }) || [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tenantRes, paymentsRes] = await Promise.all([
          api.get(`/tenants/${id}`),
          api.get(`/payments/tenant/${id}`)
        ]);
        setTenant(tenantRes.data);
        setPayments(paymentsRes.data);
      } catch (err) {
        console.error('Failed to fetch payment history', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-6">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 glass-card hover:bg-slate-800 rounded-xl text-slate-300">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">{t('paymentHistory')}</h1>
          <p className="text-slate-400 text-sm">
            {tenant ? `${tenant.name} • ${t('room')} ${tenant.room?.roomNumber}` : t('loading')}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div whileHover={{ y: -3 }} className="glass-card p-5 rounded-2xl border border-slate-700/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-indigo-500/20 rounded-xl">
              <CreditCard className="w-5 h-5 text-indigo-400" />
            </div>
            <span className="text-slate-400 text-sm font-medium">{t('totalPayments')}</span>
          </div>
          <p className="text-3xl font-bold text-white">{payments.length}</p>
        </motion.div>

        <motion.div whileHover={{ y: -3 }} className="glass-card p-5 rounded-2xl border border-slate-700/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-500/20 rounded-xl">
              <IndianRupee className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-slate-400 text-sm font-medium">{t('totalAmountPaid')}</span>
          </div>
          <p className="text-3xl font-bold text-green-400">₹{totalPaid.toLocaleString()}</p>
        </motion.div>

        <motion.div whileHover={{ y: -3 }} className="glass-card p-5 rounded-2xl border border-slate-700/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-500/20 rounded-xl">
              <Calendar className="w-5 h-5 text-purple-400" />
            </div>
            <span className="text-slate-400 text-sm font-medium">{t('monthlyRent')}</span>
          </div>
          <p className="text-3xl font-bold text-white">₹{tenant?.monthlyRent?.toLocaleString()}</p>
        </motion.div>
      </div>

      {/* Payment Table */}
      <div className="glass-card rounded-2xl border border-slate-700/50 overflow-hidden">
        <div className="p-6 border-b border-slate-700/50">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-indigo-400" /> {t('allTransactions')}
          </h2>
        </div>

        {payments.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="w-8 h-8 text-slate-600" />
            </div>
            <p className="text-slate-400 font-medium">{t('noPaymentsYet')}</p>
            <p className="text-slate-500 text-sm mt-1">{t('receiveRentInstructions')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-700/50 text-slate-400 text-sm">
                  <th className="py-3 px-6 font-medium">{t('month')} / {t('year')}</th>
                  <th className="py-3 px-6 font-medium">{t('amount')}</th>
                  <th className="py-3 px-6 font-medium">{t('paymentDate')}</th>
                  <th className="py-3 px-6 font-medium">{t('time')}</th>
                  <th className="py-3 px-6 font-medium">{t('status')}</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment, idx) => {
                  const payDate = payment.paymentDate ? new Date(payment.paymentDate) : new Date(payment.createdAt);
                  return (
                    <motion.tr
                      key={payment._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className="border-b border-slate-700/30 hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                            <span className="text-indigo-400 font-bold text-xs">{String(payment.month).padStart(2, '0')}</span>
                          </div>
                          <div>
                            <p className="text-white font-medium">{monthNames[payment.month - 1]}</p>
                            <p className="text-slate-500 text-xs">{payment.year}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-green-400 font-bold text-lg">₹{payment.amount.toLocaleString()}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-slate-300">
                          <Calendar className="w-4 h-4 text-slate-500" />
                          {payDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                          <Clock className="w-4 h-4 text-slate-500" />
                          {payDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                          payment.paymentStatus === 'paid'
                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                            : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                        }`}>
                          <CheckCircle className="w-3 h-3" />
                          {payment.paymentStatus === 'paid' ? t('paid') : t('unpaid')}
                        </span>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default TenantPaymentHistory;
