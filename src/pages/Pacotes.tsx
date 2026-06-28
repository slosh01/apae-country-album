import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, X, MessageCircle } from 'lucide-react';
import { useStore } from '../store';
import { db } from '../firebase/config';
import { doc, getDocs, collection, query, where, updateDoc, increment, onSnapshot, getDoc } from 'firebase/firestore';
import Pack3D from '../components/Pack3D';
import * as confettiPkg from 'canvas-confetti';
import { useToast } from '../components/CustomToast';

const confetti = (confettiPkg as any).default || confettiPkg;

export function Pacotes() {
  const { userDetails, setUserDetails } = useStore();
  const { addToast } = useToast();
  const [showPopup, setShowPopup] = useState(false);
  const [code, setCode] = useState('');
  const [isOpening, setIsOpening] = useState(false);
  const [isProcessingDB, setIsProcessingDB] = useState(false);
  const [newCards, setNewCards] = useState<any[]>([]);
  const [showCardsPopup, setShowCardsPopup] = useState(false);
  const [collectedCount, setCollectedCount] = useState(0);
  const [localInventory, setLocalInventory] = useState({ premium: 0, basic: 0 });

  useEffect(() => {
    if (!userDetails?.uid) return;
    const unsub = onSnapshot(doc(db, 'users', userDetails.uid), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        let p = data.premiumPacks || 0;
        let b = data.freePacks || 0;
        if (!isOpening && !isProcessingDB && !showCardsPopup) {
          setLocalInventory({ premium: p, basic: b });
          setUserDetails({ uid: docSnap.id, ...data } as any);
        }
      }
    });
    return () => unsub();
  }, [userDetails?.uid, isOpening, isProcessingDB, showCardsPopup, setUserDetails]);

  const handleOpenComplete = async () => {
    if (isProcessingDB || !userDetails) return;
    setIsOpening(true);
    setIsProcessingDB(true);
    try {
      const userRef = doc(db, 'users', userDetails.uid);
      const freshSnap = await getDoc(userRef);
      const freshData = freshSnap.data() || {};
      const p = freshData.premiumPacks || 0;
      const b = freshData.freePacks || 0;
      const type = p > 0 ? 'premium' : (b > 0 ? 'basic' : null);
      if (!type) { setIsOpening(false); setIsProcessingDB(false); return; }

      const cardsSnap = await getDocs(collection(db, 'cards'));
      const allCards = cardsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const owned = new Set(freshData.cards || []);
      const missing = allCards.filter(c => !owned.has(c.id));

      let drawn: any[] = [];
      if (type === 'basic') {
        const rand = Math.random() * 100;
        let uniqueCount = 0;
        if (rand <= 0.1) uniqueCount = 3;
        else if (rand <= 0.6) uniqueCount = 2;
        else if (rand <= 15.6) uniqueCount = 1;
        const finalUniqueToGive = Math.min(uniqueCount, missing.length);
        if (finalUniqueToGive > 0) {
          drawn = [...missing].sort(() => 0.5 - Math.random()).slice(0, finalUniqueToGive);
        }
        while (drawn.length < 3) drawn.push(allCards[Math.floor(Math.random() * allCards.length)]);
      } else {
        if (missing.length > 0) {
          drawn = [...missing].sort(() => 0.5 - Math.random()).slice(0, 2);
        } else {
          for (let i = 0; i < 2; i++) drawn.push(allCards[Math.floor(Math.random() * allCards.length)]);
        }
      }

      await updateDoc(userRef, {
        cards: [...(freshData.cards || []), ...drawn.map(d => d.id)],
        [type === 'premium' ? 'premiumPacks' : 'freePacks']: increment(-1)
      });

      setLocalInventory(prev => ({ ...prev, [type]: Math.max(0, prev[type as keyof typeof prev] - 1) }));
      setNewCards(drawn);
      confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      setShowCardsPopup(true);
    } catch (e) {
        setIsOpening(false);
    } finally {
        setIsProcessingDB(false);
    }
  };

  const totalPacks = localInventory.premium + localInventory.basic;
  const currentModelType = localInventory.premium > 0 ? 'premium' : (localInventory.basic > 0 ? 'basic' : null);
  const modelPath = currentModelType === 'premium' ? "/models/packedPREMIUM.glb" : "/models/packedfree.glb";

  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-[#F2E4CC] relative overflow-hidden px-4">
      <button onClick={() => setShowPopup(true)} className="absolute top-10 left-6 bg-[#422422] text-[#F2E4CC] p-4 rounded-full shadow-lg z-50 active:scale-95 transition-all"><Plus size={20} /></button>
      <div className="absolute right-6 top-10 bg-[#422422] text-[#F2E4CC] px-4 py-2 font-alfa text-[10px] rounded-xl z-20">{totalPacks}x</div>

      <div className="flex-1 w-full flex flex-col items-center justify-center relative">
        {currentModelType && !showCardsPopup ? (
          <Pack3D
            key={currentModelType}
            modelPath={modelPath}
            onOpenComplete={handleOpenComplete}
            isOpeningExternally={isOpening}
          />
        ) : !showCardsPopup && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-6">
            <div className="opacity-20"><span className="font-alfa text-[#422422] text-sm uppercase tracking-widest leading-tight text-center block">Sem pacotes<br/>disponíveis</span></div>
            <a href="https://wa.me/5531995977942?text=Olá! Gostaria de solicitar meus códigos de pacotes para o Álbum APAE Country." target="_blank" rel="noopener noreferrer" className="bg-[#422422] text-[#F2E4CC] px-6 py-4 rounded-2xl font-alfa text-[10px] uppercase tracking-wider shadow-xl flex items-center gap-3 active:scale-95 transition-all"><MessageCircle size={18} />Solicitar códigos</a>
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {showPopup && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-[#F2E4CC] w-full max-w-sm p-8 rounded-3xl border-4 border-[#422422] relative">
              <button onClick={() => setShowPopup(false)} className="absolute top-4 right-4 text-[#422422]/50"><X size={20}/></button>
              <h3 className="font-alfa text-sm text-[#422422] text-center mb-6 uppercase tracking-widest">Resgatar Código</h3>
              <div className="space-y-4">
                <input type="text" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="CÓDIGO DE KIT" className="w-full bg-[#422422]/5 border-2 border-[#422422]/20 rounded-xl py-3 text-center font-alfa text-[10px] outline-none focus:border-[#422422]" />
                <button onClick={async () => { if (!code || !userDetails) return; setIsProcessingDB(true); try { const q = query(collection(db, 'codes'), where('code', '==', code.trim()), where('usesLeft', '>', 0)); const snap = await getDocs(q); if (!snap.empty) { const codeDoc = snap.docs[0]; const codeData = codeDoc.data(); await updateDoc(doc(db, 'codes', codeDoc.id), { usesLeft: increment(-1), lastUsedBy: userDetails.uid }); if (codeData.isKit) { await updateDoc(doc(db, 'users', userDetails.uid), { premiumPacks: increment(codeData.kitAmount || 1), freePacks: increment(codeData.kitAmount || 1) }); addToast("Kit resgatado!", "success"); } else { const isPremiumCode = codeData.premium === true; await updateDoc(doc(db, 'users', userDetails.uid), { [isPremiumCode ? 'premiumPacks' : 'freePacks']: increment(1) }); addToast("Pacote resgatado!", "success"); } setShowPopup(false); setCode(''); } else { addToast("Código inválido!", "error"); } } catch (e) { addToast("Erro!", "error"); } finally { setIsProcessingDB(false); } }} disabled={isProcessingDB} className="w-full bg-[#422422] text-[#F2E4CC] py-3 rounded-xl font-alfa text-[9px] uppercase tracking-widest disabled:opacity-50">Confirmar</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCardsPopup && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[3000] flex flex-col items-center justify-center p-6 bg-black/95">
            <h2 className="font-alfa text-xs text-white mb-12 uppercase tracking-widest">COLETAR {collectedCount + 1}/{newCards.length}</h2>
            <div className="relative w-[220px] h-[360px] flex items-center justify-center">
              <AnimatePresence mode="popLayout">
                {newCards.slice(collectedCount).reverse().map((c, idx) => {
                  const actualIndex = newCards.length - 1 - idx;
                  const stackIdx = actualIndex - collectedCount;
                  const isTop = actualIndex === collectedCount;
                  const rotation = isTop ? 0 : (stackIdx === 1 ? -22.5 : -45);
                  return (
                    <motion.div key={c.id + '-' + actualIndex} style={{ zIndex: 100 - actualIndex }} initial={{ scale: 0, y: 50 }} animate={{ scale: 1, y: isTop ? 0 : stackIdx * 8, rotate: rotation, opacity: 1 }} exit={{ x: 300, opacity: 0, transition: { duration: 0.3 } }} onClick={() => { if (isTop) { setCollectedCount(prev => prev + 1); if (collectedCount + 1 >= newCards.length) { setTimeout(() => { setShowCardsPopup(false); setCollectedCount(0); setNewCards([]); setIsOpening(false); }, 400); } } }} className="absolute inset-0 cursor-pointer">
                      <img src={`/cards/${c.id}.png`} alt={c.id} className="w-full h-full object-contain drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]" />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
            <p className="mt-12 text-[#8F5D2C] font-alfa text-[7px] uppercase tracking-widest animate-pulse">Toque para coletar</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
