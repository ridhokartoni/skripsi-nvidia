'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { authApi } from '@/lib/api';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Image from 'next/image';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  noHp: string;
  nik: string;
  isMahasiswa: boolean;
  pj?: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>();

  const password = watch('password');
  const isMahasiswa = watch('isMahasiswa');

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      const { confirmPassword, ...registerData } = data;

      await authApi.register(registerData);

      toast.success('Registration successful! Please login.');
      router.push('/login');
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-cyan-100 via-purple-50 to-pink-100">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated blobs */}
        <div className="absolute -top-32 -left-32 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-1/3 -right-32 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/3 w-64 h-64 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        
        {/* Pattern overlay */}
        <div className="absolute inset-0 pattern-dots opacity-20"></div>
        
        {/* Floating shapes */}
        <div className="absolute top-1/4 left-1/4 w-24 h-24 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full opacity-20 animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-gradient-to-br from-pink-400 to-red-600 rounded-lg rotate-45 opacity-20 animate-float animation-delay-2000"></div>
        <div className="absolute top-3/4 left-3/4 w-20 h-20 bg-gradient-to-br from-green-400 to-teal-600 rounded-lg rotate-12 opacity-20 animate-float animation-delay-4000"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-5xl">
          {/* Header with logo */}
          <div className="text-center mb-10">
            <div className="inline-block relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-2xl opacity-30 animate-pulse"></div>
              <Image 
                src="/ipb-logo.svg" 
                alt="IPB University Logo" 
                width={100} 
                height={100}
                className="h-24 w-auto relative z-10 drop-shadow-xl"
              />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
              Join IPB University
            </h1>
            <p className="text-lg text-gray-600">Start your journey with GPU Container Platform</p>
          </div>

          {/* Main form card */}
          <div className="glass rounded-3xl shadow-2xl overflow-hidden">
            <div className="lg:flex">
              {/* Left side - Form */}
              <div className="lg:w-2/3 p-8 lg:p-12">

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                {...register('fullName', {
                  required: 'Full name is required',
                })}
                type="text"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white outline-none transition-all duration-200 hover:bg-gray-100"
                placeholder="John Doe"
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
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
                placeholder="you@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="noHp" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                {...register('noHp', {
                  required: 'Phone number is required',
                  pattern: {
                    value: /^[0-9+\-\s]+$/,
                    message: 'Invalid phone number',
                  },
                })}
                type="tel"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white outline-none transition-all duration-200 hover:bg-gray-100"
                placeholder="+62 812 3456 7890"
              />
              {errors.noHp && (
                <p className="mt-1 text-sm text-red-600">{errors.noHp.message}</p>
              )}
            </div>

            {/* NIK */}
            <div>
              <label htmlFor="nik" className="block text-sm font-medium text-gray-700 mb-2">
                NIK/NIM (Identity Number) *
              </label>
              <input
                {...register('nik', {
                  required: 'NIK/NIM is required',
                  pattern: {
                    value: /^[0-9]{16}$/,
                    message: 'NIK/NIM must be 16 digits',
                  },
                })}
                type="text"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white outline-none transition-all duration-200 hover:bg-gray-100"
                placeholder="1234567890123456"
              />
              {errors.nik && (
                <p className="mt-1 text-sm text-red-600">{errors.nik.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password *
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
                  className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white outline-none transition-all duration-200 hover:bg-gray-100"
                  placeholder="••••••••"
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

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Password *
              </label>
              <div className="relative">
                <input
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) =>
                      value === password || 'Passwords do not match',
                  })}
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="w-full px-4 py-3 pr-12 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white outline-none transition-all duration-200 hover:bg-gray-100"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
              )}
            </div>
          </div>

          {/* Student Checkbox */}
          <div className="flex items-center">
            <input
              {...register('isMahasiswa')}
              type="checkbox"
              id="isMahasiswa"
              className="h-4 w-4 text-ipb-blue-600 focus:ring-ipb-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="isMahasiswa" className="ml-2 block text-sm text-gray-700">
              I am a student
            </label>
          </div>

          {/* Supervisor (shown only for students) */}
          {isMahasiswa && (
            <div>
              <label htmlFor="pj" className="block text-sm font-medium text-gray-700 mb-2">
                Supervisor/Advisor Name
              </label>
              <input
                {...register('pj')}
                type="text"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white outline-none transition-all duration-200 hover:bg-gray-100"
                placeholder="Dr. Jane Smith"
              />
            </div>
          )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-ipb-blue-600 text-white py-3 px-4 rounded-xl font-semibold hover:bg-ipb-blue-700 hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="loading-spinner w-5 h-5 border-2 mr-2"></div>
                        Creating Account...
                      </div>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </form>
              </div>

              {/* Right side - Decorative */}
              <div className="lg:w-1/3 bg-ipb-blue-600 p-8 lg:p-12 text-white">
                <div className="h-full flex flex-col justify-center">
                  <h3 className="text-2xl font-bold mb-6">Why Join Us?</h3>
                  
                  <div className="space-y-6">
                    <div className="flex items-start">
                      <svg className="h-6 w-6 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <div>
                        <h4 className="font-semibold mb-1">High Performance</h4>
                        <p className="text-blue-100 text-sm">Access to powerful GPU resources for your research</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <svg className="h-6 w-6 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <h4 className="font-semibold mb-1">24/7 Availability</h4>
                        <p className="text-blue-100 text-sm">Run your experiments anytime, anywhere</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <svg className="h-6 w-6 mr-3 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      <div>
                        <h4 className="font-semibold mb-1">Secure Environment</h4>
                        <p className="text-blue-100 text-sm">Your data and experiments are protected</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-12 pt-8 border-t border-blue-400">
                    <p className="text-sm text-blue-100">Already have an account?</p>
                    <Link href="/login" className="inline-flex items-center mt-2 text-white font-semibold hover:underline">
                      Sign in here
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
