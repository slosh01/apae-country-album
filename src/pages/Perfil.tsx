import React, { useState } from 'react';
import { useStore } from '../store';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, setDoc, doc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, LogOut, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

function FAQItem({ question, answer }: { question: string, answer: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-[#422422]/10 last:border-0 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex justify-between items-center text-left gap-4"
      >
        <span className="font-alfa text-[10px] uppercase text-[#422422] leading-tight">{question}</span>
        {isOpen ? <ChevronUp size={14} className="shrink-0 text-[#8F5D2C]" /> : <ChevronDown size={14} className="shrink-0 text-[#8F5D2C]" />}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="mt-3 text-[10px] text-[#524D35] font-roboto font-bold leading-relaxed uppercase tracking-wider">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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
      <div className="px-6 pt-12 pb-32 max-w-lg mx-auto flex flex-col items-center min-h-full bg-[#F2E4CC]">
        <h2 className="font-alfa text-2xl text-[#422422] text-center mb-8 uppercase tracking-widest">Seu Perfil</h2>

        <div className="w-full space-y-6 text-center mb-12 flex-1">
          <div>
            <p className="text-[9px] font-roboto font-bold text-[#524D35] uppercase tracking-[0.2em] mb-1 opacity-60">Nome do Colecionador</p>
            <p className="text-xl text-[#422422] uppercase tracking-tighter">{userDetails.name}</p>
          </div>

          <div className="flex gap-8 justify-center">
            <div className="text-center">
              <p className="text-[9px] font-roboto font-bold text-[#524D35] uppercase tracking-widest opacity-60">Packs</p>
              <p className="text-2xl text-[#8F5D2C] leading-none mt-1">{ (userDetails.premiumPacks || 0) + (userDetails.freePacks || 0) }</p>
            </div>
            <div className="text-center border-l border-[#422422]/10 pl-8">
              <p className="text-[9px] font-roboto font-bold text-[#524D35] uppercase tracking-widest opacity-60">Cartas</p>
              <p className="text-2xl text-[#8F5D2C] leading-none mt-1">{userDetails.cards?.length || 0}</p>
            </div>
          </div>

          <div className="pt-4 space-y-2">
            {userDetails.role === 'admin' && (
              <button onClick={() => setTab('admin')} className="w-full py-4 bg-[#422422] text-[#F2E4CC] rounded-2xl font-alfa text-[10px] uppercase tracking-[0.2em] shadow-lg">Painel Admin</button>
            )}
            <button onClick={() => setUserDetails(null)} className="w-full flex items-center justify-center gap-2 py-4 text-red-800 font-alfa text-[9px] uppercase tracking-[0.2em] opacity-60">
              <LogOut size={14} /> Sair da Conta
            </button>
          </div>

          <div className="w-full bg-[#422422]/5 rounded-3xl p-6 border border-[#422422]/5 mt-8">
            <div className="flex items-center gap-2 mb-6 justify-center">
              <HelpCircle size={18} className="text-[#8F5D2C]" />
              <h3 className="font-alfa text-sm text-[#422422] uppercase tracking-wider text-center">Ajuda & Regras</h3>
            </div>

            <div className="space-y-6 text-left">
              <div className="space-y-4">
                <div className="flex items-center gap-4 bg-white/40 p-3 rounded-2xl">
                  <img src="/itens/premium_preview.png" alt="Premium" className="w-10 h-10 object-contain" />
                  <div>
                    <p className="font-alfa text-[10px] text-[#8F5D2C] uppercase leading-tight">Pacote Premium</p>
                    <p className="text-[9px] text-[#524D35] font-roboto font-bold uppercase tracking-wider mt-1">Garante 2 cartas inéditas para o seu álbum.</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-white/40 p-3 rounded-2xl">
                  <img src="/itens/basic_preview.png" alt="Básico" className="w-10 h-10 object-contain" />
                  <div>
                    <p className="font-alfa text-[10px] text-[#422422] uppercase leading-tight">Pacote Básico</p>
                    <p className="text-[9px] text-[#524D35] font-roboto font-bold uppercase tracking-wider mt-1">Dá 3 cartas aleatórias. Pode conter repetidas ou inéditas.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <FAQItem
                  question="COMO GANHO NOVAS FIGURINHAS?"
                  answer="A cada 3 números vendidos, você recebe um kit com 1 pacote premium e 1 pacote básico. Entre em contato pelo WhatsApp (31) 99597-7942 para resgatar seu código."
                />
                <FAQItem
                  question="COMO FUNCIONAM AS TROCAS?"
                  answer="Vá até a Central de Trocas no final da página do Álbum. Lá você pode trocar 3 figurinhas repetidas por 1 inédita, ou 5 repetidas por 2 inéditas!"
                />
                <FAQItem
                  question="QUAL O PRÊMIO PARA QUEM COMPLETAR?"
                  answer="Os 5 primeiros colecionadores que completarem 100% do álbum ganharão um ensaio fotográfico exclusivo da Galantis Fotografias!"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center pb-8 pt-6">
          <img src="/itens/galantis-09.png" alt="Galantis" className="w-[120px]" />
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pt-16 pb-32 flex flex-col items-center justify-center min-h-full bg-[#F2E4CC]">
      <div className="w-full max-w-sm p-6 text-center flex-1 flex flex-col justify-center">
        <h2 className="font-alfa text-2xl text-[#422422] mb-2 uppercase tracking-widest">Entrar</h2>
        <p className="text-[10px] text-[#524D35] mb-12 uppercase tracking-[0.3em] font-roboto font-bold opacity-60">ÁLBUM XV APAE COUNTRY</p>
        <form onSubmit={handleLogin} className="space-y-4">
          {/* TEXTO E PLACEHOLDER MAIS VISÍVEIS (OPACITY 70 e 100) */}
          <input required type="tel" value={phone} onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} placeholder="SEU TELEFONE" className="w-full bg-white border-2 border-[#422422]/20 rounded-2xl px-4 py-5 outline-none focus:border-[#8F5D2C] text-center font-roboto font-bold text-sm text-[#422422] placeholder:text-[#422422]/70 transition-all shadow-sm" />
          <input required type="tel" value={dob} onChange={(e) => {
            let v = e.target.value.replace(/\D/g, '');
            if (v.length > 2 && v.length <= 4) v = v.slice(0,2) + '/' + v.slice(2);
            else if (v.length > 4) v = v.slice(0,2) + '/' + v.slice(2,4) + '/' + v.slice(4,8);
            setDob(v);
          }} placeholder="DATA DE NASCIMENTO" maxLength={10} className="w-full bg-white border-2 border-[#422422]/20 rounded-2xl px-4 py-5 outline-none focus:border-[#8F5D2C] text-center font-roboto font-bold text-sm text-[#422422] placeholder:text-[#422422]/70 transition-all shadow-sm" />
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="NOME COMPLETO (CASO SEJA NOVO)" className="w-full bg-white border-2 border-[#422422]/20 rounded-2xl px-4 py-5 outline-none focus:border-[#8F5D2C] text-center font-roboto font-bold text-sm text-[#422422] placeholder:text-[#422422]/70 transition-all shadow-sm" />
          {error && <div className="text-red-700 text-[9px] mt-2 uppercase font-bold flex items-center gap-2 justify-center bg-red-50 p-3 rounded-xl border border-red-100"><AlertCircle size={14}/>{error}</div>}
          <button type="submit" disabled={loading} className="w-full bg-[#422422] text-[#F2E4CC] py-5 rounded-2xl mt-8 font-alfa text-xs uppercase tracking-[0.2em] shadow-xl active:translate-y-1 transition-all">ENTRAR NO ÁLBUM</button>
        </form>
      </div>

      <div className="flex flex-col items-center mt-auto pb-4">
        <img src="/itens/galantis-09.png" alt="Galantis" className="w-[160px]" />
      </div>
    </div>
  );
}
