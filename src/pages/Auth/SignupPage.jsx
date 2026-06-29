/**
 * @file src/pages/Auth/SignupPage.jsx
 * @description Sleek signup page with form validation, loading states, and premium animations.
 */

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { RiMailLine, RiLockPasswordLine, RiUserLine, RiEyeLine, RiEyeOffLine, RiErrorWarningLine } from 'react-icons/ri';

import { useAuth } from '@context/AuthContext.jsx';
import { ROUTES } from '@constants/routes.js';
import { SEO } from '@components/common';
import { cn } from '@utils/cn.js';

export default function SignupPage() {
  const { signup, error: authError, clearError, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');

  const from = location.state?.from?.pathname || ROUTES.HOME;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    clearError();

    if (!name || !email || !password) {
      setFormError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }

    const res = await signup(name, email, password);
    if (res.success) {
      navigate(from, { replace: true });
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4">
      <SEO title="Sign Up" />
      
      {/* Background Image & Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(https://assets.nflxext.com/ffe/siteui/vlv3/93da5c27-be66-427c-8b72-5cb39d275279/94eb5ad7-10d8-4cca-bf45-ac52e0a052c0/US-en-20240226-popsignuptwoweeks-perspective_alpha_website_large.jpg)' }}
      >
        <div className="absolute inset-0 bg-black/60 sm:bg-black/40 bg-gradient-to-t from-black via-black/80 to-black/30" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 300, damping: 25 }}
        className="relative z-10 w-full max-w-[450px] p-8 sm:p-14 rounded-2xl sm:rounded-3xl"
        style={{ 
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
        }}
      >
        <h1 className="text-3xl font-bold mb-8 text-white">Sign Up</h1>

        {(formError || authError) && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex items-start gap-2 p-3 mb-6 rounded-lg text-sm"
            style={{ background: '#e87c03', color: 'white' }}
          >
            <RiErrorWarningLine className="text-xl flex-shrink-0" />
            <p>{formError || authError}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Name Input */}
          <div className="relative">
            <RiUserLine className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); clearError(); setFormError(''); }}
              placeholder="Full name"
              className={cn(
                "w-full h-14 pl-12 pr-4 rounded-xl text-white outline-none transition-all",
                "bg-white/10 border border-white/20 focus:border-white focus:bg-white/20"
              )}
              required
            />
          </div>

          {/* Email Input */}
          <div className="relative">
            <RiMailLine className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); clearError(); setFormError(''); }}
              placeholder="Email address"
              className={cn(
                "w-full h-14 pl-12 pr-4 rounded-xl text-white outline-none transition-all",
                "bg-white/10 border border-white/20 focus:border-white focus:bg-white/20"
              )}
              required
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <RiLockPasswordLine className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); clearError(); setFormError(''); }}
              placeholder="Password (min 6 characters)"
              className={cn(
                "w-full h-14 pl-12 pr-12 rounded-xl text-white outline-none transition-all",
                "bg-white/10 border border-white/20 focus:border-white focus:bg-white/20"
              )}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              {showPassword ? <RiEyeOffLine className="text-xl" /> : <RiEyeLine className="text-xl" />}
            </button>
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="h-14 mt-4 rounded-xl font-bold text-white transition-colors relative overflow-hidden"
            style={{ background: '#e50914' }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing up...
              </div>
            ) : (
              'Sign Up'
            )}
          </motion.button>
        </form>

        <div className="mt-10 text-gray-400">
          <p>
            Already have an account?{' '}
            <Link to={ROUTES.LOGIN} className="text-white hover:underline font-semibold">
              Sign in now.
            </Link>
          </p>
          <p className="text-xs mt-4 opacity-70">
            This page is protected by Google reCAPTCHA to ensure you're not a bot.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
