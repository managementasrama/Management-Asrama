import React, { useState, useEffect } from 'react';
import { useAppContext, isSuperAdmin } from '../store';
import { User } from '../types';

export function Login() {
  const { login, users, showToast, appSettings } = useAppContext();

  // Kunci scrollbar laman utama selama halaman login aktif
  useEffect(() => {
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
    };
  }, []);
  const [rememberDevice, setRememberDevice] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('sim_haji_remember_session');
      return stored !== 'false';
    } catch {
      return true;
    }
  });

  const [username, setUsername] = useState<string>(() => {
    try {
      const isRemember = localStorage.getItem('sim_haji_remember_session');
      if (isRemember !== 'false') {
        return localStorage.getItem('sim_haji_remembered_username') || '';
      }
      return '';
    } catch {
      return '';
    }
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRoleGroup, setSelectedRoleGroup] = useState<string>('ALL');
  const [showQuickAccess, setShowQuickAccess] = useState(false);

  const executeLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = username.trim().toLowerCase();
    const foundUser = users.find(u => u.username.toLowerCase() === cleanUser);
    
    if (!foundUser) {
      showToast("Username / NIP tidak terdaftar di pangkalan data!", "error");
      return;
    }

    if (foundUser.status === 'Non-Aktif') {
      showToast("Akses Ditolak: Akun petugas ini berstatus Non-Aktif. Hubungi Administrator!", "error");
      return;
    }

    const expectedPassword = foundUser.password || '12345';
    if (password.trim() !== expectedPassword) {
      showToast("Kata sandi yang Anda masukkan tidak cocok!", "error");
      return;
    }

    try {
      if (rememberDevice) {
        localStorage.setItem('sim_haji_remember_session', 'true');
        localStorage.setItem('sim_haji_remembered_username', cleanUser);
      } else {
        localStorage.setItem('sim_haji_remember_session', 'false');
        localStorage.removeItem('sim_haji_remembered_username');
      }
    } catch (_) {}

    login(foundUser, undefined, rememberDevice);
  };

  const handleSelectUser = (user: User) => {
    setUsername(user.username);
    setPassword(user.password || '12345');
    try {
      if (rememberDevice) {
        localStorage.setItem('sim_haji_remember_session', 'true');
        localStorage.setItem('sim_haji_remembered_username', user.username);
      } else {
        localStorage.setItem('sim_haji_remember_session', 'false');
        localStorage.removeItem('sim_haji_remembered_username');
      }
    } catch (_) {}
    login(user, undefined, rememberDevice);
  };

  const roleGroups = [
    { id: 'ALL', label: 'Semua Peran', icon: 'fa-users' },
    { id: 'ADMIN', label: 'Pimpinan & Admin', icon: 'fa-user-shield' },
    { id: 'RECEPSIONIS', label: 'Resepsionis', icon: 'fa-bell-concierge' },
    { id: 'QC', label: 'Quality Control (QC)', icon: 'fa-clipboard-check' },
    { id: 'TEKNISI', label: 'Teknisi & Sarpras', icon: 'fa-screwdriver-wrench' },
    { id: 'KOPERASI', label: 'Koperasi & Konsumsi', icon: 'fa-utensils' },
  ];

  const filteredQuickUsers = users.filter(u => {
    if (selectedRoleGroup === 'ALL') return true;
    if (selectedRoleGroup === 'ADMIN') return isSuperAdmin(u.role) || u.username.toLowerCase() === 'admin';
    if (selectedRoleGroup === 'RECEPSIONIS') return u.role.includes('Resepsionis');
    if (selectedRoleGroup === 'QC') return u.role.includes('QC') || u.role.includes('Quality');
    if (selectedRoleGroup === 'TEKNISI') return u.role.includes('Teknisi');
    if (selectedRoleGroup === 'KOPERASI') return u.role.includes('Koperasi');
    return true;
  });

  return (
    <div className="h-screen w-full bg-[#2e1d11] relative flex items-center justify-center p-2 sm:p-4 overflow-hidden font-sans select-none">
      {/* Official Geometric Ambient Background */}
      <div className="absolute inset-0 bg-[radial-gradient(#cca241_1px,transparent_1px)] [background-size:28px_28px] opacity-15 pointer-events-none"></div>
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-hajj-700/40 blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-gold-500/25 blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-gold-500/40 relative z-10 flex flex-col max-h-[calc(100vh-1rem)] sm:max-h-[calc(100vh-1.5rem)] my-auto">
        {/* Official Header Banner - Kementerian Haji dan Umrah RI */}
        <div className="bg-gradient-to-b from-hajj-900 via-hajj-800 to-hajj-900 px-4 py-3 sm:px-5 sm:py-3.5 text-white text-center relative border-b-4 border-gold-500 shrink-0">
          <div className="flex items-center justify-center mb-2">
            <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center shadow-md overflow-hidden shrink-0 transition-transform ${appSettings?.appLogo && appSettings.appLogo.startsWith('data:') ? 'bg-white/10 backdrop-blur-xs p-1 border border-gold-400/30' : 'bg-gradient-to-br from-gold-400 via-gold-500 to-gold-600 text-hajj-950 border-2 border-gold-300 shadow-gold-500/20'}`}>
              {appSettings?.appLogo && appSettings.appLogo.startsWith('data:') ? (
                <img src={appSettings.appLogo} alt="Logo Asrama Haji" className="w-full h-full object-contain filter drop-shadow" />
              ) : (
                <i className={`fa-solid ${appSettings?.appLogo || 'fa-kaaba'} text-2xl sm:text-3xl`}></i>
              )}
            </div>
          </div>
          
          <span className="text-[9px] uppercase tracking-wider text-gold-300 font-extrabold bg-gold-400/15 border border-gold-400/40 px-2.5 py-0.5 rounded-full inline-block mb-1">
            {appSettings?.ministryName || 'KEMENTERIAN HAJI DAN UMRAH REPUBLIK INDONESIA'}
          </span>
          <h1 className="text-base sm:text-lg font-black text-white tracking-tight leading-snug">
            {appSettings?.organizationName || 'UPT ASRAMA HAJI JAKARTA'}
          </h1>
          <p className="text-[10px] sm:text-[10.5px] text-gold-100/90 mt-0.5 font-medium max-w-xs mx-auto">
            {appSettings?.subTitle || 'Sistem Informasi Manajemen Operasional Terpadu & Hunian'}
          </p>
        </div>

        {/* Login Form Container */}
        <div className="p-4 sm:p-5 space-y-2.5 sm:space-y-3 bg-white flex-1 overflow-y-auto custom-scrollbar">
          <form onSubmit={executeLogin} className="space-y-2.5 sm:space-y-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-800 uppercase tracking-wider mb-1">
                Username / NIP Petugas
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <i className="fa-solid fa-id-card-clip text-xs"></i>
                </span>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required 
                  className="w-full pl-9 pr-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-hajj-600 focus:border-hajj-600 focus:bg-white outline-none transition font-medium text-slate-900" 
                  placeholder="Masukkan username (contoh: superadmin atau admin)" 
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                  Kata Sandi
                </label>
                <span className="text-[10px] text-hajj-700 font-semibold hover:underline cursor-pointer">
                  Default: 12345
                </span>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <i className="fa-solid fa-lock text-xs"></i>
                </span>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                  className="w-full pl-9 pr-9 py-1.5 sm:py-2 text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-hajj-600 focus:border-hajj-600 focus:bg-white outline-none transition font-medium text-slate-900" 
                  placeholder="Masukkan kata sandi (contoh: 12345)" 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  title={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                >
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-xs`}></i>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 pt-0.5">
              <label htmlFor="rememberDeviceCheckbox" className="flex items-center space-x-1.5 cursor-pointer select-none py-0.5">
                <input 
                  id="rememberDeviceCheckbox"
                  type="checkbox" 
                  checked={rememberDevice}
                  onChange={(e) => {
                    const val = e.target.checked;
                    setRememberDevice(val);
                    try {
                      if (val) {
                        localStorage.setItem('sim_haji_remember_session', 'true');
                        if (username.trim()) {
                          localStorage.setItem('sim_haji_remembered_username', username.trim().toLowerCase());
                        }
                      } else {
                        localStorage.setItem('sim_haji_remember_session', 'false');
                        localStorage.removeItem('sim_haji_remembered_username');
                      }
                    } catch (_) {}
                  }}
                  className="rounded text-hajj-700 focus:ring-hajj-600 w-3.5 h-3.5 cursor-pointer accent-hajj-800" 
                />
                <span className="text-[11px] font-medium text-slate-700">Ingat sesi perangkat</span>
              </label>
              <div className="flex items-center space-x-1 text-emerald-700 font-semibold text-[11px]">
                <i className="fa-solid fa-database text-[10px]"></i>
                <span>Database Terpadu</span>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-2 sm:py-2.5 bg-gradient-to-r from-hajj-800 to-hajj-700 hover:from-hajj-900 hover:to-hajj-800 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2 cursor-pointer mt-1 text-xs sm:text-sm"
            >
              <span>Masuk Portal SIM-HAJI</span>
              <i className="fa-solid fa-arrow-right-to-bracket text-gold-300 text-xs"></i>
            </button>
          </form>

          {/* Quick Access / Pilihan Akun Berdasarkan Jabatan */}
          <div className="pt-2.5 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="text-xs font-bold text-slate-800 flex items-center">
                  <i className="fa-solid fa-users-gear mr-1.5 text-hajj-700"></i>
                  Pilihan Akun Cepat Petugas
                </span>
                <p className="text-[10px] text-slate-500">
                  Klik akun untuk langsung masuk tugas
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowQuickAccess(v => !v)}
                className="text-[11px] font-bold px-2.5 py-1 rounded-lg border border-gold-500/40 bg-gold-50 text-hajj-900 hover:bg-gold-100 transition flex items-center space-x-1 cursor-pointer shrink-0"
              >
                <span>{showQuickAccess ? 'Tutup' : 'Pilih Akun'}</span>
                <i className={`fa-solid fa-chevron-${showQuickAccess ? 'up' : 'down'} text-[9px]`}></i>
              </button>
            </div>

            {showQuickAccess && (
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-2 animate-in fade-in duration-150">
                {/* Role Group Filter Tabs */}
                <div className="flex items-center space-x-1 overflow-x-auto custom-scrollbar pb-1">
                  {roleGroups.map(div => (
                    <button
                      key={div.id}
                      type="button"
                      onClick={() => setSelectedRoleGroup(div.id)}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition flex items-center space-x-1 cursor-pointer ${
                        selectedRoleGroup === div.id
                          ? 'bg-hajj-800 text-gold-300 shadow-xs'
                          : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      <i className={`fa-solid ${div.icon} text-[9px]`}></i>
                      <span>{div.label}</span>
                    </button>
                  ))}
                </div>

                {/* User Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-36 sm:max-h-44 overflow-y-auto custom-scrollbar pr-1">
                  {filteredQuickUsers.map(u => {
                    const isAdmin = isSuperAdmin(u.role) || u.username.toLowerCase() === 'admin';
                    return (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => handleSelectUser(u)}
                        className="p-2 border rounded-xl text-left transition flex items-start justify-between shadow-xs group cursor-pointer bg-white hover:bg-gold-50/70 border-slate-200 hover:border-gold-400"
                      >
                        <div className="min-w-0 pr-2">
                          <div className="font-bold text-[11px] text-slate-900 group-hover:text-hajj-800 truncate flex items-center space-x-1">
                            <span>{u.fullName}</span>
                            {isAdmin && (
                              <span className="bg-hajj-800 text-gold-300 text-[8px] font-bold px-1 py-0.2 rounded">
                                ADMIN
                              </span>
                            )}
                          </div>
                          <div className="text-[9.5px] text-hajj-700 font-semibold truncate flex items-center space-x-1 mt-0.5">
                            <i className="fa-solid fa-id-badge text-[8.5px] text-gold-600"></i>
                            <span>{u.role}</span>
                          </div>
                          <div className="text-[8.5px] text-slate-400">
                            {u.department || 'Operasional'}
                          </div>
                        </div>
                        <div className="flex flex-col items-end shrink-0">
                          <span className="text-[8.5px] font-mono font-bold px-1 py-0.5 rounded border bg-slate-100 group-hover:bg-gold-200 text-slate-700 group-hover:text-hajj-900 border-slate-200">
                            {u.username}
                          </span>
                          <span className="text-[8.5px] text-slate-400 mt-0.5 font-mono">12345</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="text-center pt-1">
            <p className="text-[9.5px] text-slate-400">
              Hak Cipta © {new Date().getFullYear()} Kementerian Haji dan Umrah Republik Indonesia
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
