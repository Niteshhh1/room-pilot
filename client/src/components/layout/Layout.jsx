import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useLanguageStore } from '../../store/languageStore';
import { useT } from '../../hooks/useT';
import { LANGUAGES } from '../../i18n/translations';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building, LayoutDashboard, Users, CreditCard, DoorOpen,
  LogOut, Menu, X, Compass, PlusCircle, Globe, ChevronDown, Wallet, Clock, Bed, PieChart
} from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active
      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
      }`}
  >
    <Icon className="w-5 h-5" />
    <span className="font-medium">{label}</span>
  </button>
);

const Layout = () => {
  const { admin, logout } = useAuthStore();
  const { language, setLanguage, isChanging } = useLanguageStore();
  const { t } = useT();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const navItems = [
    { label: t('Dashboard'), icon: LayoutDashboard, path: '/' },
    { label: t('PGs'), icon: Building, path: '/pgs' },
    { label: t('Rooms') || 'Rooms', icon: DoorOpen, path: '/rooms' },
    { label: t('Empty Rooms') || 'Empty Rooms', icon: Bed, path: '/rooms/empty' },
    { label: t('Tenants'), icon: Users, path: '/tenants' },
    { label: t('Pending Rent') || 'Pending Rent', icon: Clock, path: '/pending-rent' },
    { label: t('Payments'), icon: CreditCard, path: '/payments' },
    { label: t('PG Expenses') || 'PG Expenses', icon: Wallet, path: '/expenses' },
    { label: t('Yearly Earnings') || 'Yearly Earnings', icon: PieChart, path: '/earnings' },
  ];

  const navigateTo = (path) => { navigate(path); setIsMobileMenuOpen(false); };

  const handleLanguageSelect = (code) => {
    setIsLangOpen(false);
    if (code !== language) setLanguage(code);
  };

  const currentLang = LANGUAGES.find(l => l.code === language);

  return (
    <div className="h-screen bg-[#0f172a] text-slate-200 flex overflow-hidden selection:bg-indigo-500/30">

      {/* Language-change loading overlay */}
      <AnimatePresence>
        {isChanging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-[#0f172a]/90 backdrop-blur-sm flex flex-col items-center justify-center gap-4"
          >
            <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-indigo-500" />
            <p className="text-slate-300 text-sm font-medium animate-pulse">
              {t('changingLanguage')}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-72 glass-card border-r border-slate-700/50 z-50 flex flex-col transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        {/* Logo */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigateTo('/')}>
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl shadow-lg shadow-indigo-500/30">
              <Compass className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-wide">Room<span className="text-indigo-400">Pilot</span></h1>
          </div>
          <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Nav */}
        <div className="px-6 py-4 flex-1 custom-scrollbar overflow-y-auto w-full">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 ml-2">{t('mainMenu')}</p>
          <div className="space-y-2">
            {navItems.map((item) => (
              <SidebarItem
                key={item.path}
                icon={item.icon}
                label={item.label}
                active={item.path === '/rooms'
                  ? (location.pathname === '/rooms' || (location.pathname.startsWith('/rooms/') && location.pathname !== '/rooms/empty'))
                  : (location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== '/'))}
                onClick={() => navigateTo(item.path)}
              />
            ))}
          </div>

          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-8 mb-4 ml-2">{t('quickActions')}</p>
          <div className="space-y-2">
            <SidebarItem
              icon={PlusCircle}
              label={t('addNewPG')}
              path="/pgs/add"
              active={location.pathname === '/pgs/add'}
              onClick={() => navigateTo('/pgs/add')}
            />
          </div>

          {/* Language Switcher */}
          <div className="mt-8 relative">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 ml-2">{t('language')}</p>
            <button
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:bg-slate-800/50 hover:text-slate-100 transition-all"
            >
              <Globe className="w-5 h-5 text-indigo-400 shrink-0" />
              <span className="font-medium flex-1 text-left">{currentLang?.nativeName}</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {isLangOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-xl z-50"
                >
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageSelect(lang.code)}
                      className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors ${lang.code === language
                        ? 'bg-indigo-600/20 text-indigo-400'
                        : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                        }`}
                    >
                      <span>{lang.nativeName}</span>
                      <span className="text-xs text-slate-500">{lang.name}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Bottom — Profile + Sign Out */}
        <div className="p-6 border-t border-slate-700/50 mt-auto">
          <div
            onClick={() => { navigate('/profile'); setIsMobileMenuOpen(false); }}
            className="flex items-center gap-3 mb-4 bg-slate-800/50 p-3 rounded-xl border border-slate-700/50 cursor-pointer hover:bg-slate-700/50 hover:border-indigo-500/30 transition-all group"
            title="View Profile"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-indigo-500/20 shrink-0">
              {admin?.name?.charAt(0) || 'A'}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-medium text-white truncate group-hover:text-indigo-300 transition-colors">{admin?.name || 'Admin User'}</p>
              <p className="text-xs text-slate-400 truncate">{admin?.email}</p>
            </div>
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-2.5 text-red-400 hover:bg-red-400/10 rounded-xl transition-colors font-medium"
          >
            <LogOut className="w-4 h-4" />
            {t('signOut')}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen max-w-full overflow-hidden">
        <header className="lg:hidden glass-card sticky top-0 z-30 px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg"><Compass className="w-5 h-5 text-white" /></div>
            <h1 className="text-xl font-bold text-white">Room<span className="text-indigo-400">Pilot</span></h1>
          </div>
          <button className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white" onClick={() => setIsMobileMenuOpen(true)}>
            <Menu className="w-6 h-6" />
          </button>
        </header>

        <div className="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-8 custom-scrollbar relative h-full">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none"></div>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, filter: 'blur(5px)', scale: 0.98 }}
              animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
              exit={{ opacity: 0, filter: 'blur(5px)', scale: 1.02 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="relative z-10 w-full max-w-7xl mx-auto h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default Layout;
