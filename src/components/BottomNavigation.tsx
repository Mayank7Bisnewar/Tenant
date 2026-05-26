import { User, Send, BookOpen, Plus, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface Tab {
  id: string;
  label: string;
  icon: React.ReactNode;
  type: 'nav' | 'action';
}

const tabs: Tab[] = [
  { id: 'tenant', label: 'Tenants', icon: <User className="w-5 h-5" />, type: 'nav' },
  { id: 'send', label: 'Summary', icon: <Send className="w-5 h-5" />, type: 'nav' },
  { id: 'add', label: 'Add', icon: <Plus className="w-5 h-5" />, type: 'action' },
  { id: 'directory', label: 'Directory', icon: <BookOpen className="w-5 h-5" />, type: 'nav' },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" />, type: 'action' },
];

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onAddClick: () => void;
  onSettingsClick: () => void;
}

export function BottomNavigation({ activeTab, onTabChange, onAddClick, onSettingsClick }: BottomNavigationProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex justify-center px-5 overflow-visible"
      style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)', overflow: 'visible', background: 'transparent' }}
    >
      {/* Single floating pill bar */}
      <div
        className="flex items-center justify-around h-[58px] w-full max-w-[340px] rounded-full"
        style={{
          backdropFilter: 'blur(90px) saturate(5)',
          WebkitBackdropFilter: 'blur(20px) saturate(5)',
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.type === 'action') {
                  if (tab.id === 'add') onAddClick();
                  if (tab.id === 'settings') onSettingsClick();
                } else {
                  onTabChange(tab.id);
                }
              }}
              className="relative flex items-center justify-center w-10 h-10 tap-highlight"
            >
              {/* Active indicator — uses app primary teal */}
              {isActive && (
                <motion.div
                  layoutId="nav-active-circle"
                  className="absolute inset-0 m-auto w-9 h-9 rounded-full "
                  style={{
                    background: 'hsl(var())',
                    boxShadow: '0 0px 12px -2px hsl(var(--primary) / 0.5)',
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <motion.div
                animate={{ scale: tab.id === 'add' ? 1.15 : isActive ? 1.1 : 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                className={cn(
                  'relative z-0 transition-all duration-300 flex items-center justify-center',
                  
                  tab.id === 'add'
                    ? 'w-12 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-900 text-white shadow-[0_0_10px_rgba(59,130,246,0.7)] -mt- border-4 border-background'
                    : isActive
                    ? 'text-primary-foreground'
                    : 'text-muted-foreground'
                )}
              >
                {tab.icon}
              </motion.div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

