// pages/LoginPage.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Lock, Mail, ShieldCheck } from 'lucide-react';
import { useMarkets } from '../contexts/MarketContext';

const LoginPage: React.FC = () => {
  const { login } = useMarkets();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Tentative de connexion
    const success = login(email, password);

    if (success) {
      navigate('/'); // Succès : on va au tableau de bord
    } else {
      setError("Identifiants incorrects. Pour le test Admin, utilisez le code : EDC2025");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6">
      <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 w-full max-w-md border border-slate-100">
        
        <div className="text-center mb-8">
           <div className="w-16 h-16 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-slate-900/20">
              <LogIn size={32} />
           </div>
           <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Connexion</h1>
           <p className="text-xs text-slate-400 font-medium mt-2">EDC Marchés360</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
           
           {error && (
             <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-[10px] font-bold rounded-xl text-center animate-pulse">
               {error}
             </div>
           )}

           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-3">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="email" 
                  required
                  placeholder="admin@edc.cm"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold text-slate-700 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-400 ml-3">Mot de passe / Code</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                <input 
                  type="password" 
                  required
                  placeholder="Code générique ou mot de passe"
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-xs font-bold text-slate-700 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
           </div>

           <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:scale-[1.02] transition-transform mt-4 flex justify-center items-center gap-2">
             <ShieldCheck size={16} /> Se connecter
           </button>

        </form>

        <div className="mt-8 text-center pt-6 border-t border-slate-100">
           <p className="text-[10px] text-slate-400 mb-2">Pas encore de compte ?</p>
           <Link to="/register" className="text-xs font-black text-primary hover:text-blue-700 uppercase tracking-wider">
             Créer un compte invité
           </Link>
        </div>

        {/* Note pour le test Admin */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl text-center border border-blue-100">
           <p className="text-[9px] font-bold text-blue-800 uppercase tracking-widest mb-1">Code Admin (Test)</p>
           <p className="text-xs font-mono font-black text-blue-600 bg-white px-2 py-1 rounded inline-block border border-blue-200">EDC2025</p>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;