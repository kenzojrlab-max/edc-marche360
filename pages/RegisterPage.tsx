// pages/RegisterPage.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, UserRole } from '../types';
import { useMarkets } from '../contexts/MarketContext';
import { UserPlus, Mail, Lock, User as UserIcon, ArrowLeft } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const { addUser } = useMarkets();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert("Les mots de passe ne correspondent pas.");
      return;
    }

    // Création de l'utilisateur avec le rôle INVITE (GUEST)
    const newUser: User = {
      id: `u${Date.now()}`,
      email: formData.email,
      nom_complet: formData.fullName,
      role: UserRole.GUEST, // Rôle par défaut : Lecture seule sans téléchargement
      projets_autorises: [],
      password: formData.password
    };

    addUser(newUser);
    
    alert("Compte créé avec succès ! Vous êtes actuellement en mode 'Invité'. Contactez l'administrateur pour obtenir des droits d'accès complets.");
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6">
      <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 w-full max-w-md border border-slate-100">
        
        <div className="text-center mb-8">
           <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-4 text-primary">
              <UserPlus size={32} />
           </div>
           <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Créer un compte</h1>
           <p className="text-xs text-slate-400 font-medium mt-2">Accès immédiat en mode consultation (Invité)</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
           
           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-3">Nom Complet</label>
              <div className="relative">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="text" 
                  required
                  placeholder="Ex: Jean Dupont"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold text-slate-700 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  value={formData.fullName}
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                />
              </div>
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-3">Email Professionnel</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="email" 
                  required
                  placeholder="Ex: j.dupont@edc.cm"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold text-slate-700 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-3">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold text-slate-700 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-3">Confirmer mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold text-slate-700 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                />
              </div>
           </div>

           <button type="submit" className="w-full bg-primary text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform mt-4">
             S'inscrire
           </button>

        </form>

        <div className="mt-8 text-center">
           <Link to="/" className="text-[10px] font-bold text-slate-400 hover:text-slate-600 flex items-center justify-center gap-2">
             <ArrowLeft size={12} /> Retour à l'accueil
           </Link>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;