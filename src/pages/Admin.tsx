import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { db } from '../firebase/config';
import { collection, addDoc, getDocs, doc, updateDoc, setDoc, query, orderBy, deleteDoc } from 'firebase/firestore';
import { QrCode, Users, Gift, Eye, EyeOff, Trash2, Copy, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { useToast } from '../components/ToastContext'; // Assumindo que o context está sendo usado ou useToast do CustomToast

// Se useToast vier de CustomToast, importe de lá.
// Para este arquivo, vou usar o import que já funcionava ou simplificar.
import { useToast as useAppToast } from '../components/CustomToast';

export function Admin() {
  const { userDetails, setUserDetails } = useStore();
  const { addToast } = useAppToast();
  const [adminTab, setAdminTab] = useState<'codes' | 'users' | 'history'>('codes');
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);

  const [kitAmount, setKitAmount] = useState(1);
  const [generatedCode, setGeneratedCode] = useState('');
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allCodes, setAllCodes] = useState<any[]>([]);

  const handleMasterLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword === 'apae2026') {
      setIsAdminAuthenticated(true);
      setUserDetails({ uid: 'master-admin', name: 'Admin Master', role: 'admin', packs: 0, cards: [] } as any);
      addToast("Acesso liberado", "success");
    } else { addToast("Senha incorreta", "error"); }
  };

  const generateKitCode = async () => {
    try {
      const code = Math.random().toString(36).substring(2, 8).toUpperCase();
      await addDoc(collection(db, 'codes'), { code, usesLeft: 1, maxUses: 1, isKit: true, kitAmount, createdAt: new Date().toISOString() });
      setGeneratedCode(code); addToast("Código KIT Gerado", "success"); fetchCodes();
    } catch (e: any) { addToast("Erro: " + e.message, "error"); }
  };

  const syncAssets = async () => {
    if (!window.confirm("ATUALIZAR SERVIDOR? Isso irá sincronizar as 42 figurinhas.")) return;
    try {
      for (let i = 1; i <= 42; i++) {
        const id = `fig${i}`;
        await setDoc(doc(db, 'cards', id), {
          image: `/cards/${id}.png`,
          type: 'usuario',
          name: `Figurinha ${i}`,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }
      addToast("Assets sincronizados!", "success");
    } catch (e: any) { addToast("Erro: " + e.message, "error"); }
  };

  const fetchUsers = async () => {
    const snap = await getDocs(query(collection(db, 'users'), orderBy('name', 'asc')));
    setAllUsers(snap.docs.map(d => ({id: d.id, ...d.data()})));
  };

  const fetchCodes = async () => {
    const snap = await getDocs(query(collection(db, 'codes'), orderBy('createdAt', 'desc')));
    setAllCodes(snap.docs.map(d => ({id: d.id, ...d.data()})));
  };

  const toggleRankingVisibility = async (userId: string, currentHide: boolean) => {
    await updateDoc(doc(db, 'users', userId), { hideFromRanking: !currentHide });
    fetchUsers(); addToast("Visibilidade alterada", "success");
  };

  const deleteCode = async (id: string) => {
    if (!confirm("Excluir este código?")) return;
    await deleteDoc(doc(db, 'codes', id));
    fetchCodes(); addToast("Código excluído", "success");
  };

  const copyCode = (code: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(code);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = code;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      addToast("Copiado!", "success");
    } catch (err) {
      addToast("Erro ao copiar", "error");
    }
  };

  useEffect(() => {
    if (!isAdminAuthenticated) return;
    if (adminTab === 'users') fetchUsers();
    if (adminTab === 'history') fetchCodes();
  }, [adminTab, isAdminAuthenticated]);

  if (!isAdminAuthenticated) {
    return (
      <div className="p-6 pt-16 h-full flex flex-col justify-center items-center">
        <div className="bg-[#F2E4CC] p-8 rounded-2xl border-4 border-[#422422] text-center max-w-sm">
          <h2 className="font-alfa text-xl text-[#422422] mb-4">Admin</h2>
          <form onSubmit={handleMasterLogin} className="space-y-4">
            <input type="password" placeholder="Senha" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} className="w-full bg-white border-2 border-[#422422] rounded-xl p-3 text-center outline-none" />
            <button type="submit" className="w-full bg-[#422422] text-[#F2E4CC] font-alfa text-xs py-4 rounded-xl">Entrar</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 pt-12 pb-32 max-w-lg mx-auto overflow-y-auto h-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-alfa text-xl text-[#422422] uppercase">Painel</h1>
        <button onClick={syncAssets} className="p-2 bg-[#422422] text-[#F2E4CC] rounded-full hover:scale-110 transition-transform">
          <RefreshCw size={16} />
        </button>
      </div>
      
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button onClick={() => setAdminTab('codes')} className={`px-4 py-2 rounded-xl text-[8px] font-alfa ${adminTab === 'codes' ? 'bg-[#422422] text-[#F2E4CC]' : 'bg-white/30'}`}>GERAR</button>
        <button onClick={() => setAdminTab('history')} className={`px-4 py-2 rounded-xl text-[8px] font-alfa ${adminTab === 'history' ? 'bg-[#422422] text-[#F2E4CC]' : 'bg-white/30'}`}>CÓDIGOS</button>
        <button onClick={() => setAdminTab('users')} className={`px-4 py-2 rounded-xl text-[8px] font-alfa ${adminTab === 'users' ? 'bg-[#422422] text-[#F2E4CC]' : 'bg-white/30'}`}>USUÁRIOS</button>
      </div>

      <motion.div key={adminTab} initial={{opacity:0}} animate={{opacity:1}} className="bg-white/20 p-6 rounded-2xl border border-[#422422]/20">
        {adminTab === 'codes' && (
          <div className="space-y-4">
            <h2 className="font-alfa text-xs text-[#422422] uppercase flex items-center gap-2"><Gift size={14} /> Novo Kit</h2>
            <div className="space-y-2">
              <label className="block text-[9px] font-bold uppercase">KITS por código</label>
              <input type="number" value={kitAmount} onChange={e=>setKitAmount(Number(e.target.value))} className="w-full bg-white rounded-xl p-3 font-alfa text-center border border-[#422422]/20" />
            </div>
            <button onClick={generateKitCode} className="w-full bg-[#422422] text-[#F2E4CC] py-4 rounded-xl font-alfa text-[10px] uppercase tracking-widest">Gerar</button>
            {generatedCode && (
              <div className="mt-4 p-4 flex items-center justify-between bg-green-100 border-2 border-green-600 rounded-xl">
                <span className="font-alfa text-xl text-green-800">{generatedCode}</span>
                <button onClick={() => copyCode(generatedCode)} className="p-2 text-green-800 hover:scale-110 transition-transform">
                  <Copy size={20} />
                </button>
              </div>
            )}
          </div>
        )}

        {adminTab === 'history' && (
          <div className="space-y-3">
            <h2 className="font-alfa text-xs text-[#422422] uppercase mb-4">Gerenciamento</h2>
            {allCodes.map(c => (
              <div key={c.id} className="bg-white/40 p-3 rounded-xl border border-[#422422]/10 flex flex-col gap-1">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="font-alfa text-[10px] text-[#422422]">{c.code}</span>
                    <button onClick={() => copyCode(c.code)} className="opacity-40 hover:opacity-100"><Copy size={10}/></button>
                  </div>
                  <button onClick={() => deleteCode(c.id)} className="text-red-600 p-1"><Trash2 size={12}/></button>
                </div>
                <div className="flex justify-between text-[7px] font-bold text-[#524D35] uppercase">
                  <span>Kits: {c.kitAmount || 1}</span>
                  <span>{c.usesLeft > 0 ? 'Disponível' : 'Usado'}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {adminTab === 'users' && (
          <div className="space-y-3">
            <h2 className="font-alfa text-xs text-[#422422] uppercase mb-4">Usuários</h2>
            {allUsers.map(u => (
              <div key={u.id} className="bg-white/40 p-3 rounded-xl border border-[#422422]/10 flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="font-alfa text-[9px] uppercase truncate">{u.name}</p>
                  <p className="text-[7px] text-gray-500 uppercase font-bold">{u.cards?.length || 0} Fig | { (u.premiumPacks||0) + (u.freePacks||0) } Packs</p>
                </div>
                <button onClick={() => toggleRankingVisibility(u.id, u.hideFromRanking)} className="p-2 text-[#422422]">
                  {u.hideFromRanking ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
