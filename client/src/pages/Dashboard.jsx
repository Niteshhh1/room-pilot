import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line, Legend
} from 'recharts';
import { Building, Users, Home, TrendingUp, IndianRupee, AlertCircle, DoorOpen, Activity, Wallet, DollarSign } from 'lucide-react';
import api from '../services/api';
import { useT } from '../hooks/useT';

const StatCard = ({ title, value, icon: Icon, color, sub, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className="glass-card p-6 rounded-2xl relative overflow-hidden group hover:border-indigo-500/50 transition-colors border border-slate-700/50"
  >
    <div className={`absolute top-0 right-0 w-32 h-32 bg-${color}-500/10 rounded-full blur-3xl group-hover:bg-${color}-500/20 transition-all`}></div>
    <div className="flex justify-between items-start relative z-10">
      <div>
        <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-3xl font-bold text-white">{value}</h3>
        {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
      </div>
      <div className={`p-3 rounded-xl bg-${color}-500/20 text-${color}-400`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t } = useT();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const { data } = await api.get('/payments/analytics');
        setAnalytics(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const revenueData = analytics?.revenueHistory || [];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">{t('dashboardOverview')}</h1>
          <p className="text-slate-400 mt-1">{t('welcomeBack')}</p>
        </div>
      </div>

      {/* Primary Stats Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t('totalPGs')}
          value={analytics?.totalPGs ?? 0}
          icon={Building}
          color="indigo"
          delay={0.1}
        />
        <StatCard
          title={t('totalRooms')}
          value={analytics?.totalRooms ?? 0}
          icon={DoorOpen}
          color="blue"
          delay={0.15}
        />
        <StatCard
          title={t('activeTenants')}
          value={analytics?.totalTenants ?? 0}
          icon={Users}
          color="green"
          delay={0.2}
          sub={`${analytics?.pastMembers ?? 0} ${t('pastMembers').toLowerCase()}`}
        />
        <StatCard
          title={t('availableBeds')}
          value={analytics?.totalAvailableBeds ?? 0}
          icon={Home}
          color="amber"
          delay={0.25}
          sub={t('acrossAllPGs')}
        />
      </div>

      {/* Financial Stats Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title={t('monthlyExpected') || 'Expected Rent'}
          value={`₹${(analytics?.expectedRent ?? 0).toLocaleString()}`}
          icon={TrendingUp}
          color="purple"
          delay={0.3}
          sub={t('basedOnActiveTenants')}
        />
        <StatCard
          title={t('rentReceived') || 'Rent Received'}
          value={`₹${(analytics?.receivedRent ?? 0).toLocaleString()}`}
          icon={IndianRupee}
          color="green"
          delay={0.35}
        />
        <StatCard
          title={t('monthlyExpenses') || 'Monthly Expenses'}
          value={`₹${(analytics?.monthlyExpenses ?? 0).toLocaleString()}`}
          icon={Wallet}
          color="rose"
          delay={0.4}
        />
        <StatCard
          title={t('monthlyProfit') || 'Profit'}
          value={`₹${(analytics?.profit ?? 0).toLocaleString()}`}
          icon={DollarSign}
          color="blue"
          delay={0.45}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-700/50"
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-semibold text-white">{t('revenueOverview')}</h3>
              <p className="text-slate-400 text-xs mt-0.5">{t('last6MonthsRealData')}</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-1 rounded bg-indigo-400"></span> {t('received')}</span>
              <span className="flex items-center gap-1.5"><span className="inline-block w-3 h-1 rounded bg-green-400" style={{borderStyle:'dashed'}}></span> {t('expected')}</span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} tickFormatter={(val) => val >= 1000 ? `₹${val/1000}k` : `₹${val}`} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.5rem', color: '#fff' }}
                  itemStyle={{ color: '#e2e8f0' }}
                  formatter={(value) => [`₹${value.toLocaleString()}`, undefined]}
                />
                <Line type="monotone" dataKey="received" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name={t('received')} />
                <Line type="monotone" dataKey="expected" stroke="#22c55e" strokeWidth={2} strokeDasharray="5 5" dot={false} name={t('expected')} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Quick Insights */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="glass-card p-6 rounded-2xl border border-slate-700/50 flex flex-col"
        >
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" /> {t('quickInsights')}
          </h3>

          <div className="space-y-3 flex-1">
            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-red-400 font-medium text-sm">{t('pendingRent')}</h4>
                <p className="text-2xl font-bold text-white mt-0.5">₹{(analytics?.remainingRent ?? 0).toLocaleString()}</p>
                <p className="text-xs text-slate-400 mt-0.5">{t('needsImmediateCollection')}</p>
              </div>
            </div>

            {[
              { label: t('totalPGs'), value: analytics?.totalPGs ?? 0, sub: t('propertiesManaged'), Icon: Building, color: 'indigo' },
              { label: t('totalRooms'), value: analytics?.totalRooms ?? 0, sub: t('acrossAllProperties'), Icon: DoorOpen, color: 'blue' },
              { label: t('availableBeds'), value: analytics?.totalAvailableBeds ?? 0, sub: t('readyToOccupy'), Icon: Home, color: 'green' },
              { label: t('pastMembers'), value: analytics?.pastMembers ?? 0, sub: t('historicalData'), Icon: Users, color: 'slate' },
            ].map(({ label, value, sub, Icon, color }) => (
              <div key={label} className="bg-slate-800/50 p-3 rounded-xl flex justify-between items-center hover:bg-slate-800 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`p-2 bg-${color}-500/20 text-${color}-400 rounded-lg`}><Icon className="w-4 h-4" /></div>
                  <div>
                    <p className="text-sm text-slate-300 font-medium">{label}</p>
                    <p className="text-xs text-slate-500">{sub}</p>
                  </div>
                </div>
                <span className="text-lg font-bold text-white">{value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Occupancy Bar Chart */}
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.4 }}
          className="glass-card p-6 rounded-2xl border border-slate-700/50"
      >
        <h3 className="text-lg font-semibold text-white mb-6">{t('occupancyByProperty')}</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics?.occupancyData || []} margin={{ top: 5, right: 0, bottom: 5, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis dataKey="name" stroke="#94a3b8" axisLine={false} tickLine={false} />
              <YAxis stroke="#94a3b8" axisLine={false} tickLine={false} />
              <RechartsTooltip
                cursor={{ fill: '#1e293b' }}
                contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', borderRadius: '0.5rem', color: '#fff' }}
              />
              <Legend wrapperStyle={{ color: '#94a3b8', fontSize: '0.75rem' }} />
              <Bar dataKey="occupied" stackId="a" fill="#6366f1" radius={[0, 0, 4, 4]} name={t('occupiedBeds')} />
              <Bar dataKey="available" stackId="a" fill="#22c55e" radius={[4, 4, 0, 0]} name={t('availableBedsLabel')} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
