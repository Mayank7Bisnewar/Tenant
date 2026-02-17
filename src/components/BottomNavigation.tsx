import { User, Send, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const tabs: Tab[] = [
  { id: 'tenant', label: 'Tenants', icon: <User className="w-5 h-5" /> },
  { id: 'send', label: 'Summary', icon: <Send className="w-5 h-5" /> },
  { id: 'directory', label: 'Directory', icon: <BookOpen className="w-5 h-5" /> },
];

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function BottomNavigation({ activeTab, onTabChange }: BottomNavigationProps) {
  const activeIndex = tabs.findIndex(t => t.id === activeTab);

  return (
    <nav className="flex-none safe-area-bottom z-50">
      <div className="relative flex max-w-md mx-auto px-2 h-12">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                "relative flex-1 flex flex-col items-center justify-center transition-colors duration-200 z-10 tap-highlight",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <motion.div
                animate={{ scale: isActive ? 1.15 : 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className="mb-0.5"
              >
                {tab.icon}
              </motion.div>
              <motion.span
                animate={{
                  fontWeight: isActive ? 800 : 500,
                  opacity: isActive ? 1 : 0.7
                }}
                className="text-[10px] uppercase tracking-wider"
              >
                {tab.label}
              </motion.span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
