import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ content, children }) => {
  const [open, setOpen] = useState(false);

  return (
    <div 
      className="relative flex items-center gap-1 group"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onClick={() => setOpen(!open)}
    >
      {children}
      <button type="button" className="text-slate-500 hover:text-orange-400 focus:outline-none hidden md:block">
        <Info className="w-4 h-4 ml-1" />
      </button>

      <AnimatePresence>
        {open && (
           <motion.div 
             initial={{ opacity: 0, y: 5 }} 
             animate={{ opacity: 1, y: 0 }} 
             exit={{ opacity: 0, y: 5 }}
             className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-slate-900 border border-slate-700 text-slate-100 text-xs p-3 rounded-lg shadow-xl shadow-black/50 z-50 pointer-events-none"
           >
             {content}
             {/* Caret */}
             <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-700 w-0 h-0"></div>
             <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900 w-0 h-0 -mt-[1px]"></div>
           </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
