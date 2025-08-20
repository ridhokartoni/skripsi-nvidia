'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition, Menu } from '@headlessui/react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuthStore } from '@/store/authStore';
import {
  Bars3Icon,
  XMarkIcon,
  ServerStackIcon,
  CreditCardIcon,
  TicketIcon,
  CubeIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  UsersIcon,
  CpuChipIcon,
  HomeIcon,
  ChartBarIcon,
  ChevronUpIcon,
  SparklesIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const userNavigation = [
  { name: 'Dashboard', href: '/user', icon: HomeIcon },
  { name: 'My Containers', href: '/user/containers', icon: ServerStackIcon },
  { name: 'Payments', href: '/user/payments', icon: CreditCardIcon },
  { name: 'Support Tickets', href: '/user/tickets', icon: TicketIcon },
  { name: 'Packages', href: '/user/packages', icon: CubeIcon },
  { name: 'Profile', href: '/user/profile', icon: UserCircleIcon },
];

const adminNavigation = [
  { name: 'Dashboard', href: '/admin', icon: HomeIcon },
  { name: 'Monitoring', href: '/admin/monitoring', icon: ChartBarIcon },
  { name: 'All Containers', href: '/admin/containers', icon: ServerStackIcon },
  { name: 'Users', href: '/admin/users', icon: UsersIcon },
  { name: 'Payments', href: '/admin/payments', icon: CreditCardIcon },
  { name: 'Tickets', href: '/admin/tickets', icon: TicketIcon },
  { name: 'Packages', href: '/admin/packages', icon: CubeIcon },
  { name: 'GPU Management', href: '/admin/gpu', icon: CpuChipIcon },
  //{ name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAdmin, logout } = useAuthStore();

  const navigation = isAdmin ? adminNavigation : userNavigation;

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button
                      type="button"
                      className="-m-2.5 p-2.5"
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>

                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4">
                  <div className="flex h-16 shrink-0 items-center gap-3">
                    <Image
                      src="/ipb-logo.svg"
                      alt="IPB University"
                      width={40}
                      height={40}
                      className="h-10 w-auto"
                    />
                    <div>
                      <h1 className="text-sm font-bold text-ipb-blue-700">
                        IPB University
                      </h1>
                      <p className="text-xs text-gray-600">GPU Platform</p>
                    </div>
                  </div>
                  <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                      <li>
                        <ul role="list" className="-mx-2 space-y-1">
                          {navigation.map((item) => (
                            <li key={item.name}>
                              <Link
                                href={item.href}
                                className={`
                                  group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold
                                  ${pathname === item.href
                                    ? 'bg-ipb-blue-50 text-ipb-blue-700'
                                    : 'text-gray-700 hover:text-ipb-blue-600 hover:bg-gray-50'
                                  }
                                `}
                              >
                                <item.icon
                                  className={`h-6 w-6 shrink-0 ${pathname === item.href ? 'text-ipb-blue-600' : 'text-gray-400 group-hover:text-ipb-blue-600'
                                    }`}
                                  aria-hidden="true"
                                />
                                {item.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </li>
                      <li className="mt-auto">
                        <button
                          onClick={handleLogout}
                          className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700 hover:bg-gray-50 hover:text-red-600 w-full"
                        >
                          <ArrowLeftOnRectangleIcon
                            className="h-6 w-6 shrink-0 text-gray-400 group-hover:text-red-600"
                            aria-hidden="true"
                          />
                          Sign out
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col overflow-hidden border-r border-gray-200 bg-gradient-to-b from-white to-blue-50/30">
          {/* Header with animated background */}
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-purple-600/10"></div>
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-400/20 rounded-full blur-2xl animate-pulse animation-delay-2000"></div>

            <div className="relative flex h-20 shrink-0 items-center gap-3 px-6 border-b border-blue-100/50">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-lg opacity-25 animate-pulse"></div>
                <Image
                  src="/ipb-logo.svg"
                  alt="IPB University"
                  width={45}
                  height={45}
                  className="h-11 w-auto relative z-10"
                />
              </div>
              <div>
                <h1 className="text-sm font-bold bg-gradient-to-r from-blue-700 to-purple-700 bg-clip-text text-transparent">
                  IPB University
                </h1>
                <p className="text-xs text-gray-600">GPU Container Platform</p>
              </div>
            </div>
          </div>
          <nav className="flex flex-1 flex-col px-6 py-4">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <div className="flex items-center justify-between mb-4">
                  <div className="text-xs font-semibold leading-6 text-gray-500 uppercase tracking-wider">
                    {isAdmin ? 'Admin Panel' : 'User Panel'}
                  </div>
                  <SparklesIcon className="h-4 w-4 text-yellow-500 animate-pulse" />
                </div>
                <ul role="list" className="space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`
                          group relative flex gap-x-3 rounded-xl p-3 text-sm leading-6 font-medium transition-all duration-200
                          ${pathname === item.href
                            ? 'bg-ipb-blue-600 text-white shadow-lg transform scale-105'
                            : 'text-gray-700 hover:bg-blue-50 hover:shadow-md hover:scale-105'
                          }
                        `}
                      >
                        <item.icon
                          className={`h-5 w-5 shrink-0 relative z-10 ${pathname === item.href
                            ? 'text-white'
                            : 'text-gray-500 group-hover:text-ipb-blue-600'
                            }`}
                          aria-hidden="true"
                        />
                        <span className="relative z-10">{item.name}</span>
                        {pathname === item.href && (
                          <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                          </div>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </nav>

          {/* User Profile Section - Redesigned */}
          <div className="mt-auto border-t border-gray-200 bg-blue-50 p-4">
            <div className="relative">
              {/* User Card */}
              <div
                className="flex items-center gap-3 p-3 rounded-xl bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <div className="relative">
                  <div className="h-10 w-10 rounded-xl bg-ipb-blue-600 flex items-center justify-center text-white font-bold shadow-lg">
                    {user?.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-900">{user?.fullName}</p>
                  <p className="text-xs text-gray-500">
                    {isAdmin ? (
                      <span className="inline-flex items-center gap-1">
                        <span className="w-2 h-2 bg-ipb-blue-700 rounded-full"></span>
                        Administrator
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        <span className="w-2 h-2 bg-ipb-blue-500 rounded-full"></span>
                        User Account
                      </span>
                    )}
                  </p>
                </div>
                <ChevronUpIcon className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
              </div>

              {/* Dropdown Menu */}
              <Transition
                show={userMenuOpen}
                enter="transition ease-out duration-200"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-150"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">
                  <Link
                    href={isAdmin ? "/admin/settings" : "/user/settings"}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <Cog6ToothIcon className="h-5 w-5 text-gray-500" />
                    <span className="text-sm text-gray-700">Settings</span>
                  </Link>
                  <div className="border-t border-gray-100">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors w-full text-left group"
                    >
                      <ArrowLeftOnRectangleIcon className="h-5 w-5 text-gray-500 group-hover:text-red-600" />
                      <span className="text-sm text-gray-700 group-hover:text-red-600">Sign out</span>
                    </button>
                  </div>
                </div>
              </Transition>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Enhanced Header Bar */}
        <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
          <div className="relative overflow-hidden">
            {/* Animated gradient line */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 animate-gradient"></div>

            <div className="flex h-16 items-center gap-x-4 px-4 sm:gap-x-6 sm:px-6 lg:px-8">
              <button
                type="button"
                className="-m-2.5 p-2.5 text-gray-700 lg:hidden hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setSidebarOpen(true)}
              >
                <span className="sr-only">Open sidebar</span>
                <Bars3Icon className="h-6 w-6" aria-hidden="true" />
              </button>

              <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6 items-center">
                <div className="flex flex-1 items-center gap-4">
                  {/* Greeting with time-based message */}
                  <div>
                    <h2 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                      Welcome back, {user?.fullName}
                    </h2>
                    <p className="text-xs text-gray-500">
                      {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                  </div>
                </div>

                {/* Right side actions */}
                <div className="flex items-center gap-x-3">
                  {/* Status badge */}
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full border border-blue-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-gray-700">
                      {isAdmin ? 'Admin Mode' : 'User Mode'}
                    </span>
                  </div>

                  {/* Quick stats */}
                  <div className="hidden lg:flex items-center gap-4 px-4 py-2 bg-gray-50 rounded-xl">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Active</p>
                      <p className="text-sm font-bold text-blue-600">GPU</p>
                    </div>
                    <div className="w-px h-8 bg-gray-300"></div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Status</p>
                      <p className="text-sm font-bold text-green-600">Online</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content area with pattern background */}
        <main className="relative min-h-[calc(100vh-4rem)]">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30"></div>
          <div className="absolute inset-0 pattern-dots opacity-5"></div>

          {/* Floating decorative elements */}
          <div className="absolute top-20 right-10 w-64 h-64 bg-blue-200/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-purple-200/10 rounded-full blur-3xl"></div>

          <div className="relative py-10">
            <div className="px-4 sm:px-6 lg:px-8">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
}
