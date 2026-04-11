import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiAward, FiArrowRight } from 'react-icons/fi';
import { useAuthStore } from '../store/useAuthStore';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      // Error handled by store
    }
  };

  const fillDemo = (type) => {
    if (type === 'admin') {
      setEmail('admin@demo.com');
      setPassword('password123');
    } else if (type === 'judge') {
      setEmail('judge@demo.com');
      setPassword('password123');
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 mb-4">
            <FiAward className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold gradient-text">HackArena Pro</h1>
          <p className="text-zinc-500 mt-2">Professional Hackathon Platform</p>
        </div>

        <div className="glass-card p-8">
          <h2 className="text-xl font-semibold mb-6">Welcome Back</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2 text-zinc-400">Email</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-11"
                  placeholder="admin@demo.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-zinc-400">Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-11"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <FiArrowRight />
                </>
              )}
            </button>
          </form>

          {/* Demo Buttons */}
          <div className="mt-6 pt-6 border-t border-dark-800">
            <p className="text-xs text-center text-zinc-500 mb-3">Quick Demo Login:</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => fillDemo('admin')}
                className="p-3 bg-primary-500/10 hover:bg-primary-500/20 rounded-xl text-center transition"
              >
                <span className="block text-primary-400 font-medium">Admin</span>
                <span className="block text-xs text-zinc-500">Dashboard</span>
              </button>
              <button
                onClick={() => fillDemo('judge')}
                className="p-3 bg-accent-500/10 hover:bg-accent-500/20 rounded-xl text-center transition"
              >
                <span className="block text-accent-400 font-medium">Judge</span>
                <span className="block text-xs text-zinc-500">Scanner</span>
              </button>
            </div>
          </div>

          <div className="mt-6 p-4 bg-dark-800/50 rounded-xl">
            <p className="text-xs text-zinc-500 mb-2">Demo Credentials:</p>
            <p className="text-sm font-mono text-zinc-400">admin@demo.com / password123</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}