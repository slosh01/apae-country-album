import { Home, BookOpen, PackageOpen, Trophy, User } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface BottomNavProps {
  currentTab: string;
  setTab: (tab: string) => void;
}

export default function BottomNav({ currentTab, setTab }: BottomNavProps) {
  const tabs = [
    { id: 'entrada', icon: Home, label: 'Entrada' },
    { id: 'album', icon: BookOpen, label: 'Álbum' },
    { id: 'pacotes', icon: PackageOpen, label: 'Pacotes' },
    { id: 'ranking', icon: Trophy, label: 'Ranking' },
    { id: 'perfil', icon: User, label: 'Perfil' },
  ];

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <div className="bg-cordel-dark/95 backdrop-blur-sm rounded-full p-2 flex items-center gap-2 shadow-xl border-2 border-cordel-wood/50 pointer-events-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={cn(
                "p-3 rounded-full transition-all duration-300 relative flex items-center justify-center",
                isActive ? "bg-cordel-accent text-cordel-paper" : "text-cordel-light hover:bg-cordel-wood/50"
              )}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              {isActive && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-cordel-paper rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
