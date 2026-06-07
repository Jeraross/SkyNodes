import { useRef, useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import gsap from 'gsap';

const PIXEL = { fontFamily: "'Press Start 2P', monospace" };
const MONO  = { fontFamily: 'ui-monospace, SFMono-Regular, monospace' };

export default function LoginPage() {
  const [, navigate] = useLocation();
  const [mode, setMode]     = useState<'login' | 'register'>('login');
  const [name, setName]     = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]   = useState('');
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(pageRef.current, { x: '100vw', opacity: 0 }, { x: 0, opacity: 1, duration: 0.45, ease: 'power3.out' });
    if (localStorage.getItem('aerotale_player')) navigate('/game');
  }, [navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !password.trim()) {
      setError('Preencha todos os campos.');
      return;
    }
    localStorage.setItem('aerotale_player', name.trim());
    gsap.to(pageRef.current, {
      x: '-100vw', opacity: 0, duration: 0.35, ease: 'power3.in',
      onComplete: () => navigate('/game'),
    });
  };

  const handleBack = () => {
    gsap.to(pageRef.current, {
      x: '100vw', opacity: 0, duration: 0.35, ease: 'power3.in',
      onComplete: () => navigate('/game'),
    });
  };

  return (
    <div
      ref={pageRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#020617]"
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8 flex flex-col gap-6"
        style={{ background: '#0a111f', border: '1px solid rgba(6,182,212,0.2)', boxShadow: '0 30px 80px rgba(0,0,0,0.9)' }}
      >
        <p style={{ ...PIXEL, fontSize: 12 }} className="text-cyan-400 text-center tracking-widest">
          {mode === 'login' ? 'ENTRAR' : 'CRIAR CONTA'}
        </p>

        <div className="flex gap-2">
          {(['login', 'register'] as const).map(m => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); }}
              className="flex-1 py-2 rounded-lg border transition-all cursor-pointer"
              style={{
                borderColor: mode === m ? '#22d3ee' : 'rgba(6,182,212,0.2)',
                background:  mode === m ? 'rgba(6,182,212,0.12)' : 'transparent',
              }}
            >
              <p style={{ ...PIXEL, fontSize: 7 }} className={mode === m ? 'text-cyan-300' : 'text-slate-500'}>
                {m === 'login' ? 'ENTRAR' : 'CADASTRAR'}
              </p>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label style={{ ...PIXEL, fontSize: 7 }} className="text-slate-400">NOME DE USUARIO</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-cyan-500/20 text-white outline-none focus:border-cyan-400 transition-colors"
              style={MONO}
              placeholder="seu_nome"
              autoComplete="username"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label style={{ ...PIXEL, fontSize: 7 }} className="text-slate-400">SENHA</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-slate-900 border border-cyan-500/20 text-white outline-none focus:border-cyan-400 transition-colors"
              style={MONO}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </div>

          {error && (
            <p style={{ ...MONO, fontSize: 12 }} className="text-red-400 text-center">{error}</p>
          )}

          <button
            type="submit"
            className="w-full py-3 rounded-xl border-2 border-cyan-500/60 cursor-pointer transition-all"
            style={{ background: 'rgba(6,182,212,0.12)' }}
          >
            <p style={{ ...PIXEL, fontSize: 9 }} className="text-cyan-300">
              {mode === 'login' ? 'ENTRAR' : 'CRIAR CONTA'}
            </p>
          </button>
        </form>

        <button onClick={handleBack} className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">
          <p style={{ ...PIXEL, fontSize: 7 }}>← VOLTAR</p>
        </button>
      </div>
    </div>
  );
}
