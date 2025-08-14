'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { authApi, userApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { clearAllAuthData } from '@/lib/auth-utils';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Image from 'next/image';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface LoginForm {
  email: string;
  password: string;
  isAdmin: boolean;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((state) => state.setAuth);
  const { isAuthenticated, isAdmin: currentUserIsAdmin, isHydrated } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Get redirect URL from query params
  const redirectTo = searchParams?.get('from') || null;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<LoginForm>();

  const isAdminLogin = watch('isAdmin');

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      // Clear any existing auth data before login
      clearAllAuthData();
      
      // Use different login endpoint based on admin checkbox
      const loginApi = data.isAdmin ? authApi.adminLogin : authApi.login;
      const response = await loginApi({
        email: data.email,
        password: data.password,
      });

      const token = response.data.data.token;
      
      // Store token in localStorage first so it's available for the profile request
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', token);
      }
      
      // Get user profile (now the token is available in localStorage)
      const profileResponse = await userApi.getProfile();
      const user = profileResponse.data.data;

      // Store complete auth data
      setAuth(token, user);

      toast.success('Login successful!');
      
      // Redirect to the original page if exists, otherwise based on role
      if (redirectTo) {
        router.push(redirectTo);
      } else if (user.isAdmin) {
        router.push('/admin');
      } else {
        router.push('/user');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      // Remove token if login failed
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
      }
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-100 via-white to-cyan-100">
      {/* Animated background shapes */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        
        {/* Geometric patterns */}
        <div className="absolute top-0 left-0 w-full h-full pattern-grid opacity-30"></div>
        
        {/* Floating elements */}
        <div className="absolute top-20 right-20 w-20 h-20 bg-gradient-to-br from-blue-400 to-purple-600 rounded-lg rotate-45 animate-float opacity-20"></div>
        <div className="absolute bottom-20 left-20 w-16 h-16 bg-gradient-to-br from-green-400 to-blue-600 rounded-full animate-float animation-delay-2000 opacity-20"></div>
        <div className="absolute top-1/2 right-1/4 w-12 h-12 bg-gradient-to-br from-pink-400 to-orange-600 rounded-lg rotate-12 animate-float animation-delay-4000 opacity-20"></div>
      </div>

      <div className="min-h-screen flex">
        {/* Left side - Decorative */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center relative">
          <div className="relative z-10 p-12">
            <div className="text-center">
              <div className="mb-8 relative inline-block">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-2xl opacity-30 animate-pulse"></div>
                <Image 
                  src="/ipb-logo.svg" 
                  alt="IPB University Logo" 
                  width={150} 
                  height={150}
                  className="h-36 w-auto relative z-10 drop-shadow-2xl"
                />
              </div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                IPB University
              </h1>
              <p className="text-2xl text-gray-700 font-light mb-2">GPU Container Platform</p>
              <p className="text-gray-600 max-w-md mx-auto">
                Empowering research with high-performance computing resources
              </p>
              
              {/* Stats or features */}
              <div className="mt-12 grid grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">24/7</div>
                  <div className="text-sm text-gray-600">Availability</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">100+</div>
                  <div className="text-sm text-gray-600">GPU Cores</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-600">∞</div>
                  <div className="text-sm text-gray-600">Possibilities</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Login form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md relative">
            {/* Mobile logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-block relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-xl opacity-30"></div>
                <Image 
                  src="/ipb-logo.svg" 
                  alt="IPB University Logo" 
                  width={80} 
                  height={80}
                  className="h-20 w-auto relative z-10"
                />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mt-4">
                IPB University
              </h1>
            </div>

            {/* Form card with glassmorphism */}
            <div className="glass rounded-3xl p-8 shadow-2xl relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full filter blur-3xl opacity-20"></div>
              
              <div className="relative z-10">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  Welcome Back!
                </h2>
                <p className="text-gray-600 mb-8">Please enter your credentials to continue</p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
              type="email"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white outline-none transition-all duration-200 hover:bg-gray-100"
              placeholder="your.email@ipb.ac.id"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
                type={showPassword ? 'text' : 'password'}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white outline-none transition-all duration-200 hover:bg-gray-100 pr-12"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center">
            <input
              {...register('isAdmin')}
              type="checkbox"
              id="isAdmin"
              className="h-4 w-4 text-ipb-blue-600 focus:ring-ipb-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isAdmin" className="ml-2 block text-sm text-gray-700">
              Login as Administrator
            </label>
          </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-ipb-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-ipb-blue-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="loading-spinner w-5 h-5 border-2 mr-2"></div>
                        Signing in...
                      </div>
                    ) : (
                      `Sign in${isAdminLogin ? ' as Admin' : ''}`
                    )}
          </button>
        </form>

        <div className="mt-8">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white bg-opacity-95 text-gray-500">New to our platform?</span>
            </div>
          </div>
          <div className="mt-4 text-center">
            <Link href="/register" className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors">
              Create an account
              <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
