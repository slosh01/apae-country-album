import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { db } from '../firebase/config';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { useToast } from '../components/CustomToast';

const TOTAL_CARDS = 42;

export function Album() {
  const { userDetails, setUserDetails } = useStore();
  const { addToast } = useToast();
  const [cardsInfo, setCardsInfo] = useState<any[]>([]);

  // Estados para o popup de coleta (igual ao de pacotes)
  const [showCollectPopup, setShowCollectPopup] = useState(false);
  const [newCards, setNewCards] = useState<any[]>([]);
  const [collectedCount, setCollectedCount] = useState(0);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'cards'), (snap) => {
      const dbCards = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      const fullAlbumSlots = Array.from({ length: TOTAL_CARDS }, (_, i) => {
        const id = `fig${i + 1}`;
        const found = dbCards.find(c => c.id === id);
        return found || { id, name: `Figurinha ${i + 1}`, image: `/cards/${id}.png` };
      });
      setCardsInfo(fullAlbumSlots);
    });
    return () => unsub();
  }, []);

  const userOwnedCards = new Set(userDetails?.cards || []);
  const totalOwnedCount = cardsInfo.filter(c => userOwnedCards.has(c.id)).length;
  const progressPercent = Math.round((totalOwnedCount / TOTAL_CARDS) * 100);

  return (
    <div className="w-full min-h-full px-4 pt-6 pb-28 bg-[#F2E4CC]">
      <div className="text-center mb-6">
        <h2 className="font-alfa text-xl text-[#422422] uppercase">Meu Álbum</h2>
        <p className="text-[9px] text-[#524D35] tracking-[0.3em] mt-1">XV APAE COUNTRY</p>
      </div>

      <div className="bg-[#422422]/5 p-3 mb-6 max-w-md mx-auto rounded-xl">
        <div className="flex justify-between items-center mb-2 font-alfa text-[8px] text-[#422422] uppercase">
          <span>Progresso</span>
          <span>{totalOwnedCount} / {TOTAL_CARDS}</span>
        </div>
        <div className="w-full bg-[#422422]/10 h-2 rounded-full overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 0.8 }} className="bg-[#8F5D2C] h-full" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1 max-w-lg mx-auto">
        {cardsInfo.map((card, index) => {
          const isOwned = userOwnedCards.has(card.id);
          return (
            <div key={card.id} className="relative aspect-[3/4.5] flex items-center justify-center overflow-hidden pointer-events-none">
              {isOwned ? (
                <img src={card.image} alt={card.name} className="w-full h-full object-contain" loading="lazy" />
              ) : (
                <>
                  <img src="/cards/figbase.png" alt="Bloqueado" className="w-full h-full object-contain" />
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[#422422] font-alfa text-[10px] opacity-60">
                    {index + 1}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* Pop-up de Coleta (Trocas) */}
      <AnimatePresence>
        {showCollectPopup && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[3000] flex flex-col items-center justify-center p-6 bg-black/95">
            <h2 className="font-alfa text-xs text-white mb-12 uppercase tracking-widest">
              COLETAR {collectedCount + 1}/{newCards.length}
            </h2>
            <div className="relative w-[220px] h-[360px] flex items-center justify-center">
              <AnimatePresence mode="popLayout">
                {newCards.slice(collectedCount).reverse().map((c, idx) => {
                  const actualIndex = newCards.length - 1 - idx;
                  const stackIdx = actualIndex - collectedCount;
                  const isTop = actualIndex === collectedCount;
                  const rotation = isTop ? 0 : (stackIdx === 1 ? -22.5 : -45);

                  return (
                    <motion.div
                      key={c.id + '-' + actualIndex}
                      style={{ zIndex: 100 - actualIndex }}
                      initial={{ scale: 0, y: 50 }}
                      animate={{ scale: 1, y: isTop ? 0 : stackIdx * 8, rotate: rotation, opacity: 1 }}
                      exit={{ x: 300, opacity: 0, transition: { duration: 0.3 } }}
                      onClick={() => {
                        if (isTop) {
                          setCollectedCount(prev => prev + 1);
                          if (collectedCount + 1 >= newCards.length) {
                            setTimeout(() => {
                              setShowCollectPopup(false);
                              setCollectedCount(0);
                              setNewCards([]);
                            }, 400);
                          }
                        }
                      }}
                      className="absolute inset-0 cursor-pointer"
                    >
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

      <ExchangeSection
        cardsInfo={cardsInfo}
        userOwnedCardsArray={userDetails?.cards || []}
        userUid={userDetails?.uid}
        setUserDetails={setUserDetails}
        addToast={addToast}
        onSuccess={(rewarded: any[]) => {
            setNewCards(rewarded);
            setShowCollectPopup(true);
        }}
      />
    </div>
  );
}

function ExchangeSection({ cardsInfo, userOwnedCardsArray, userUid, setUserDetails, addToast, onSuccess }: any) {
  const [isProcessing, setIsProcessing] = useState(false);
  if (!userUid) return null;

  const counts: Record<string, number> = {};
  userOwnedCardsArray.forEach((id: string) => { counts[id] = (counts[id] || 0) + 1; });
  let totalDuplicates = 0;
  const duplicatesList: string[] = [];
  Object.entries(counts).forEach(([id, count]) => { if (count > 1) { totalDuplicates += (count - 1); for (let i = 0; i < count - 1; i++) duplicatesList.push(id); } });

  const handleExchange = async (req: number, rew: number) => {
    if (totalDuplicates < req) { addToast(`Necessário ${req} repetidas`, "error"); return; }
    const ownedSet = new Set(userOwnedCardsArray);
    const missing = cardsInfo.filter((c: any) => !ownedSet.has(c.id));
    if (missing.length === 0) { addToast("Álbum Completo!", "info"); return; }

    setIsProcessing(true);
    try {
      const drawn = [...missing].sort(() => 0.5 - Math.random()).slice(0, rew);
      const updated = [...userOwnedCardsArray];
      const spent = duplicatesList.slice(0, req);
      spent.forEach(sid => { const idx = updated.indexOf(sid); if (idx > -1) updated.splice(idx, 1); });
      drawn.forEach((c: any) => updated.push(c.id));

      const userRef = doc(db, 'users', userUid);
      await updateDoc(userRef, { cards: updated });

      // ATUALIZAÇÃO REAL-TIME: Atualiza o store global imediatamente
      setUserDetails({ ...useStore.getState().userDetails, cards: updated } as any);

      onSuccess(drawn);
      addToast("Troca realizada!", "success");
    } catch (e) { addToast("Erro na troca", "error"); } finally { setIsProcessing(false); }
  };

  return (
    <div className="mt-12 bg-[#422422]/5 p-5 max-w-md mx-auto text-center rounded-xl">
      <h3 className="font-alfa text-sm text-[#422422] uppercase mb-4">Trocas</h3>
      <p className="text-[8px] text-[#524D35] mb-6 uppercase font-bold tracking-widest">Repetidas: {totalDuplicates}</p>
      <div className="flex flex-col gap-3">
        <button onClick={() => handleExchange(3, 1)} disabled={isProcessing || totalDuplicates < 3} className="bg-[#422422] text-[#F2E4CC] py-3 rounded-lg text-[8px] uppercase font-alfa tracking-widest disabled:opacity-30">3 por 1 Faltante</button>
        <button onClick={() => handleExchange(5, 2)} disabled={isProcessing || totalDuplicates < 5} className="bg-[#8F5D2C] text-white py-3 rounded-lg text-[8px] uppercase font-alfa tracking-widest disabled:opacity-30">5 por 2 Faltantes</button>
      </div>
    </div>
  );
}
