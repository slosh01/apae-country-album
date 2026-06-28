import React, { useState } from 'react';
import { useStore } from '../store';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { AlertCircle, LogOut } from 'lucide-react';

export function Perfil({ setTab }: { setTab: (t: string) => void }) {
  const { userDetails, setUserDetails } = useStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((phone === '31995977942' || phone === '31997004046') && dob === '06/09/2001') {
      setUserDetails({
        uid: phone === '31997004046' ? 'test-user-31997004046' : 'admin-test-id',
        name: phone === '31997004046' ? 'Julio Oliveira' : 'Admin Master',
        phone, dob, role: phone === '31997004046' ? 'user' : 'admin', packs: 0, cards: [],
      });
      if (phone !== '31997004046') setTab('admin');
      return;
    }
    setLoading(true); setError('');
    const q = query(collection(db, 'users'), where('phone', '==', phone), where('dob', '==', dob));
    try {
      const snap = await getDocs(q);
      if (!snap.empty) {
        const d = snap.docs[0];
        setUserDetails({ uid: d.id, ...d.data() } as any);
      } else {
        if (!name) { setError('Usuário não encontrado. Digite seu nome para criar.'); setLoading(false); return; }
        const newUserRef = doc(collection(db, 'users'));
        const newUserData = { name, phone, dob, role: 'user', packs: 0, cards: [], };
        await setDoc(newUserRef, newUserData);
        setUserDetails({ uid: newUserRef.id, ...newUserData } as any);
      }
    } catch (err: any) { setError('Erro no login.'); } finally { setLoading(false); }
  };

  if (userDetails) {
    return (
      <div className="px-6 pt-16 pb-32 max-w-lg mx-auto flex flex-col items-center">
        <h2 className="font-alfa text-2xl text-[#422422] text-center mb-8 uppercase">Perfil</h2>
        <div className="w-full space-y-6 text-center">
          <div>
            <p className="text-[10px] font-bold text-[#524D35] uppercase tracking-widest mb-1">Nome</p>
            <p className="text-xl text-[#422422]">{userDetails.name}</p>
          </div>
          <div className="flex gap-4 justify-center">
            <div className="text-center">
              <p className="text-[10px] text-[#524D35] uppercase font-bold">Pacotes</p>
              <p className="text-2xl text-[#8F5D2C]">{ (userDetails.premiumPacks || 0) + (userDetails.freePacks || 0) }</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] text-[#524D35] uppercase font-bold">Figurinhas</p>
              <p className="text-2xl text-[#8F5D2C]">{userDetails.cards?.length || 0}</p>
            </div>
          </div>
          {userDetails.role === 'admin' && (
            <button onClick={() => setTab('admin')} className="w-full py-4 bg-[#524D35] text-white rounded-xl font-alfa text-xs uppercase tracking-widest">Admin</button>
          )}
          <button onClick={() => setUserDetails(null)} className="w-full flex items-center justify-center gap-2 py-4 text-red-700 font-alfa text-[10px] uppercase tracking-widest">
            <LogOut size={16} /> Sair da Conta
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pt-16 pb-32 flex flex-col items-center justify-center min-h-full">
      <div className="w-full max-w-sm p-6 text-center">
        <h2 className="font-alfa text-xl text-[#422422] mb-2 uppercase">Entrar</h2>
        <p className="text-[9px] text-[#524D35] mb-8 uppercase tracking-widest">Coleção XV APAE Country</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} placeholder="TELEFONE" className="w-full bg-white/50 border-2 border-[#422422]/20 rounded-xl px-4 py-4 outline-none focus:border-[#8F5D2C] text-center font-alfa text-sm placeholder:opacity-30" />
          <input required type="tel" value={dob} onChange={(e) => {
            let v = e.target.value.replace(/\D/g, '');
            if (v.length > 2 && v.length <= 4) v = v.slice(0,2) + '/' + v.slice(2);
            else if (v.length > 4) v = v.slice(0,2) + '/' + v.slice(2,4) + '/' + v.slice(4,8);
            setDob(v);
          }} placeholder="DATA NASCIMENTO" maxLength={10} className="w-full bg-white/50 border-2 border-[#422422]/20 rounded-xl px-4 py-4 outline-none focus:border-[#8F5D2C] text-center font-alfa text-sm placeholder:opacity-30" />
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="SEU NOME (PARA CRIAR)" className="w-full bg-white/50 border-2 border-[#422422]/20 rounded-xl px-4 py-4 outline-none focus:border-[#8F5D2C] text-center font-alfa text-sm placeholder:opacity-30" />
          {error && <div className="text-red-600 text-[10px] mt-2 uppercase flex items-center gap-1 justify-center"><AlertCircle size={12}/>{error}</div>}
          <button type="submit" disabled={loading} className="w-full bg-[#422422] text-[#F2E4CC] py-4 rounded-xl mt-6 font-alfa text-xs uppercase tracking-widest">Entrar</button>
        </form>
      </div>
    </div>
  );
}
