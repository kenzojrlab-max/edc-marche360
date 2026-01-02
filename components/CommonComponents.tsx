// components/CommonComponents.tsx
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom'; // IMPORT CRUCIAL
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
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  // Mise à jour de la position du menu
  const updatePosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      
      // Décision intelligente : Haut ou Bas ?
      const showAbove = spaceBelow < 200; // Si moins de 200px en bas, on affiche en haut

      setDropdownStyle({
        position: 'fixed', // On utilise fixed pour sortir du contexte du tableau
        left: `${rect.left}px`,
        width: `${rect.width}px`,
        top: showAbove ? 'auto' : `${rect.bottom + 5}px`,
        bottom: showAbove ? `${window.innerHeight - rect.top + 5}px` : 'auto',
        zIndex: 99999, // Très haut pour passer au-dessus de tout
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      // On met à jour la position si on scroll ou redimensionne
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isOpen]);

  // Fermeture au clic extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Contenu du menu déroulant (Portal)
  const dropdownMenu = (
    <div 
      style={dropdownStyle}
      className="bg-white border border-slate-200 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] p-2 max-h-64 overflow-y-auto animate-in fade-in duration-200"
    >
      {options.map((opt) => (
        <div 
          key={opt.value} 
          onMouseDown={(e) => { // onMouseDown pour éviter conflit avec le blur
            e.preventDefault();
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
  );

  return (
    <>
      <div 
        className={`relative w-full ${disabled ? 'pointer-events-none opacity-50' : ''}`} 
        ref={containerRef}
      >
        <div 
          onClick={() => !disabled && setIsOpen(!isOpen)} 
          className="w-full flex items-center justify-between cursor-pointer select-none bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-sm hover:border-primary/50 transition-colors"
        >
          <span className={`truncate text-[10px] font-black ${!selected ? 'text-slate-400' : 'text-slate-800'}`}>
            {selected ? selected.label : placeholder}
          </span>
          <ChevronDown 
            size={14} 
            className={`text-slate-400 transition-transform flex-shrink-0 ml-1 ${isOpen ? 'rotate-180' : ''}`} 
          />
        </div>
      </div>
      
      {/* Le menu est rendu hors du tableau via Portal */}
      {isOpen && createPortal(dropdownMenu, document.body)}
    </>
  );
};