// components/CommonComponents.tsx
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface CustomBulleSelectProps {
  value: string;
  onChange: (e: { target: { value: string } }) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
}

export const CustomBulleSelect: React.FC<CustomBulleSelectProps> = ({ 
  value, 
  onChange, 
  options, 
  placeholder = "Choisir...", 
  disabled = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  // Ferme le dropdown si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div 
      className={`relative w-full ${disabled ? 'pointer-events-none opacity-50' : ''}`} 
      ref={containerRef}
    >
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)} 
        className="w-full flex items-center justify-between cursor-pointer select-none"
      >
        <span className={`truncate text-xs font-black ${!selected ? 'text-slate-400' : 'text-slate-800'}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown 
          size={16} 
          className={`text-slate-400 transition-transform flex-shrink-0 ml-2 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </div>
      
      {/* CORRECTION ICI : z-index élevé (z-50) et position absolue */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 p-2 max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200 w-full min-w-[150px]">
          {options.map((opt) => (
            <div 
              key={opt.value} 
              onClick={() => { 
                onChange({ target: { value: opt.value } }); 
                setIsOpen(false); 
              }} 
              className={`group flex items-center justify-between px-4 py-3 my-0.5 text-xs font-black rounded-xl cursor-pointer transition-all ${
                value === opt.value 
                  ? 'bg-primary text-white shadow-md' 
                  : 'text-slate-700 hover:bg-slate-50 hover:text-primary'
              }`}
            >
              <span className="truncate pr-2 uppercase">{opt.label}</span>
              {value === opt.value && <Check size={14} className="flex-shrink-0" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};