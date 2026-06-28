import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, query, orderBy, limit, onSnapshot, where } from 'firebase/firestore';
import { motion } from 'motion/react';

export function Ranking() {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Busca apenas usuários que não estão ocultos
    const q = query(
      collection(db, 'users'),
      where('hideFromRanking', '!=', true),
      limit(50)
    );

    const unsub = onSnapshot(q, (snap) => {
      const users = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          name: data.name || 'Anônimo',
          count: Array.isArray(data.cards) ? new Set(data.cards).size : 0
        };
      }).sort((a, b) => b.count - a.count);
      setLeaders(users);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const top5 = leaders.slice(0, 5);
  const others = leaders.slice(5);

  if (loading) return <div className="h-full flex items-center justify-center font-alfa text-[8px] text-[#422422] uppercase">Carregando...</div>;

  return (
    <div className="w-full min-h-full px-4 pt-10 pb-28 bg-[#F2E4CC]">
      <div className="text-center mb-8">
        <h2 className="font-alfa text-xl text-[#422422] uppercase">Ranking</h2>
        <p className="text-[8px] text-[#524D35] tracking-[0.3em] mt-1">LÍDERES</p>
      </div>

      <div className="space-y-3 mb-10 max-w-md mx-auto">
        <h3 className="font-alfa text-xs text-[#422422] uppercase text-center mb-4 tracking-widest">TOP 5</h3>
        {top5.map((u, i) => (
          <motion.div
            key={u.id}
            initial={{ y: 5, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            className={`flex items-center gap-4 p-3 rounded-xl ${i === 0 ? 'bg-[#8F5D2C] text-white shadow-lg' : 'bg-[#422422]/10 text-[#422422]'}`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-alfa text-[10px] shrink-0 ${i === 0 ? 'bg-white text-[#8F5D2C]' : 'bg-[#422422] text-[#F2E4CC]'}`}>
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-alfa truncate uppercase text-[9px]">{u.name}</p>
            </div>
            <div className="shrink-0 text-[8px] font-alfa">
              {u.count} FIG.
            </div>
          </motion.div>
        ))}
      </div>

      <div className="max-w-md mx-auto space-y-2 opacity-50">
        {others.map((u, i) => (
          <div key={u.id} className="flex items-center justify-between py-2 border-b border-[#422422]/5">
            <div className="flex items-center gap-3">
              <span className="font-alfa text-[8px] text-[#524D35] w-4">{i + 6}</span>
              <span className="font-alfa text-[8px] text-[#422422] uppercase truncate max-w-[150px]">{u.name}</span>
            </div>
            <span className="font-alfa text-[7px] text-[#8F5D2C]">{u.count} FIG.</span>
          </div>
        ))}
      </div>
    </div>
  );
}
