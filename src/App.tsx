import React, { useState, Suspense } from 'react';
import { useStore } from './store';
import { Album } from './pages/Album';
import { Pacotes } from './pages/Pacotes';
import { Ranking } from './pages/Ranking';
import { Admin } from './pages/Admin';
import { Perfil } from './pages/Perfil';
import { CustomToastContainer } from './components/CustomToast';

// Ícones reduzidos
const AlbumIcon = ({ active }: { active: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={active ? "#8F5D2C" : "#F2E4CC"} className="transition-colors">
    <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z" />
  </svg>
);
const PackIcon = ({ active }: { active: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={active ? "#8F5D2C" : "#F2E4CC"} className="transition-colors">
    <path d="M20 6h-2.18c.11-.31.18-.65.18-1 0-1.66-1.34-3-3-3-1.05 0-1.96.54-2.5 1.35l-.5.65-.5-.65C10.96 2.54 10.05 2 9 2 7.34 2 6 3.34 6 5c0 .35.07.69.18 1H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2z" />
  </svg>
);
const TrophyIcon = ({ active }: { active: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={active ? "#8F5D2C" : "#F2E4CC"} className="transition-colors">
    <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94A5.01 5.01 0 0 0 11 15.9V19H7v2h10v-2h-4v-3.1a5.01 5.01 0 0 0 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2z" />
  </svg>
);
const UserIcon = ({ active }: { active: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill={active ? "#8F5D2C" : "#F2E4CC"} className="transition-colors">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);
const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="#F2E4CC" className="opacity-40">
    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
  </svg>
);

export default function App() {
  const [tab, setTab] = useState('perfil');
  const { userDetails } = useStore();
  const isAuth = !!userDetails;

  const renderTab = () => {
    if (!isAuth && tab !== 'perfil') return <Perfil setTab={setTab} />;
    switch (tab) {
      case 'album': return <Album />;
      case 'pacotes': return <Pacotes />;
      case 'ranking': return <Ranking />;
      case 'perfil': return <Perfil setTab={setTab} />;
      case 'admin': return <Admin />;
      default: return <Perfil setTab={setTab} />;
    }
  };

  const handleTabChange = (t: string) => {
    if (!isAuth && t !== 'perfil') return;
    setTab(t);
  };

  return (
    <div className="fixed inset-0 bg-[#F2E4CC] font-alfa text-[#422422] select-none touch-manipulation overflow-hidden flex flex-col">
      <CustomToastContainer />

      <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
        <Suspense fallback={null}>{renderTab()}</Suspense>
      </main>

      {/* Barra de Navegação Reajustada - Pouco maior (max-w-[360px]) e mais centralizada */}
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 w-[92%] max-w-[360px] h-14 pointer-events-none z-[5000]">
        <div
            className="absolute inset-0 h-full pointer-events-none"
            style={{
                backgroundImage: 'url(/itens/BarraNavegação.svg)',
                backgroundSize: '100% 100%',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        />
        {/* Nav ajustada com 80% de largura interna para afastar das bordas laterais do SVG */}
        <nav className="relative z-10 w-[80%] mx-auto flex justify-around items-center h-full pointer-events-auto">
          <button onClick={() => handleTabChange('album')} className="flex flex-col items-center flex-1 h-full justify-center">
            {isAuth ? <AlbumIcon active={tab === 'album'} /> : <LockIcon />}
            <span className={`text-[6px] uppercase mt-0.5 ${isAuth && tab === 'album' ? 'text-[#8F5D2C]' : 'text-[#F2E4CC]'}`}>Álbum</span>
          </button>
          <button onClick={() => handleTabChange('pacotes')} className="flex flex-col items-center flex-1 h-full justify-center">
            {isAuth ? <PackIcon active={tab === 'pacotes'} /> : <LockIcon />}
            <span className={`text-[6px] uppercase mt-0.5 ${isAuth && tab === 'pacotes' ? 'text-[#8F5D2C]' : 'text-[#F2E4CC]'}`}>Pacotes</span>
          </button>
          <button onClick={() => handleTabChange('ranking')} className="flex flex-col items-center flex-1 h-full justify-center">
            {isAuth ? <TrophyIcon active={tab === 'ranking'} /> : <LockIcon />}
            <span className={`text-[6px] uppercase mt-0.5 ${isAuth && tab === 'ranking' ? 'text-[#8F5D2C]' : 'text-[#F2E4CC]'}`}>Ranking</span>
          </button>
          <button onClick={() => setTab('perfil')} className="flex flex-col items-center flex-1 h-full justify-center">
            <UserIcon active={tab === 'perfil'} />
            <span className={`text-[7px] uppercase mt-0.5 ${tab === 'perfil' ? 'text-[#8F5D2C]' : 'text-[#F2E4CC]'}`}>{userDetails ? 'Perfil' : 'Entrar'}</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
