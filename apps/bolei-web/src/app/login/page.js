'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, Eye, EyeOff, Coins } from 'lucide-react';
import useStore from '@/store/useStore';

export default function LoginPage() {
  const [tab,      setTab]      = useState('login');
  const [name,     setName]     = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const { login, isLoggedIn } = useStore();
  const router = useRouter();

  useEffect(() => {
    if (isLoggedIn) router.replace('/dashboard');
  }, [isLoggedIn, router]);

  function validate() {
    if (tab === 'register' && !name.trim()) return 'Digite seu nome.';
    if (!email.includes('@')) return 'Email inválido.';
    if (password.length < 6)  return 'Senha deve ter ao menos 6 caracteres.';
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 700));
    login(name || email.split('@')[0], email);
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="fixed inset-0 bg-green/5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(0,230,118,0.12), transparent)' }} />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-green-glow border-2 border-green/40 flex items-center justify-center mx-auto mb-4 text-3xl font-black text-green">
            B
          </div>
          <h1 className="text-3xl font-black text-white">Bolei</h1>
          <p className="text-sub text-sm mt-1">Fantasy Futebol · Snake Draft · Leilões</p>
        </div>

        {/* Card */}
        <div className="card p-6">
          {/* Tabs */}
          <div className="flex bg-bg rounded-lg p-1 mb-6 gap-1">
            {[['login','Entrar'],['register','Criar conta']].map(([key, label]) => (
              <button
                key={key}
                onClick={() => { setTab(key); setError(''); }}
                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                  tab === key
                    ? 'bg-surface text-white border border-rim'
                    : 'text-sub hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'register' && (
              <Field label="Nome" icon={<User size={15} className="text-sub" />}>
                <input
                  type="text"
                  placeholder="Como você quer aparecer na liga"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="flex-1 bg-transparent text-white text-sm placeholder-muted outline-none"
                />
              </Field>
            )}

            <Field label="Email" icon={<Mail size={15} className="text-sub" />}>
              <input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="flex-1 bg-transparent text-white text-sm placeholder-muted outline-none"
              />
            </Field>

            <Field label="Senha" icon={<Lock size={15} className="text-sub" />} suffix={
              <button type="button" onClick={() => setShowPass(!showPass)} className="text-sub hover:text-white transition-colors">
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            }>
              <input
                type={showPass ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="flex-1 bg-transparent text-white text-sm placeholder-muted outline-none"
              />
            </Field>

            {error && (
              <p className="text-danger text-xs bg-danger/10 border border-danger/30 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green text-bg font-bold py-3 rounded-lg text-sm hover:bg-green-dark transition-colors disabled:opacity-60 mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-bg border-t-transparent rounded-full animate-spin" />
                  Entrando...
                </span>
              ) : tab === 'login' ? 'Entrar' : 'Criar conta e jogar'}
            </button>
          </form>

          {/* Bonus banner */}
          {tab === 'register' && (
            <div className="mt-4 flex items-center gap-2 bg-gold/10 border border-gold/30 rounded-lg px-3 py-2.5">
              <Coins size={14} className="text-gold shrink-0" />
              <p className="text-xs text-sub">
                Você começa com{' '}
                <span className="text-gold font-bold">1.000 moedas</span>{' '}
                para usar no draft e leilões!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, icon, suffix, children }) {
  return (
    <div>
      <label className="text-xs text-sub font-semibold mb-1.5 block">{label}</label>
      <div className="flex items-center gap-2 bg-input border border-rim rounded-lg px-3 py-2.5 focus-within:border-green/50 transition-colors">
        {icon}
        {children}
        {suffix}
      </div>
    </div>
  );
}
