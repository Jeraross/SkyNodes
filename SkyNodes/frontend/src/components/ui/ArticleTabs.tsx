import { motion } from 'motion/react';

interface Tab {
  id: string;
  label: string;
}

interface ArticleTabsProps {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
}

export default function ArticleTabs({ tabs, active, onChange }: ArticleTabsProps) {
  return (
    <div className="flex gap-0 border-b border-white/10 mb-10">
      {tabs.map(tab => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`relative px-6 py-3 text-sm font-medium transition-colors duration-200 focus:outline-none ${
            active === tab.id ? 'text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          {tab.label}
          {active === tab.id && (
            <motion.div
              layoutId="article-tab-underline"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-400"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
            />
          )}
        </button>
      ))}
    </div>
  );
}
