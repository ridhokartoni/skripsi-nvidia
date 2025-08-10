'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
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
  { name: 'All Containers', href: '/admin/containers', icon: ServerStackIcon },
  { name: 'Users', href: '/admin/users', icon: UsersIcon },
  { name: 'Payments', href: '/admin/payments', icon: CreditCardIcon },
  { name: 'Tickets', href: '/admin/tickets', icon: TicketIcon },
  { name: 'Packages', href: '/admin/packages', icon: CubeIcon },
  { name: 'GPU Management', href: '/admin/gpu', icon: CpuChipIcon },
  { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
                  <div className="flex h-16 shrink-0 items-center">
                    <h1 className="text-xl font-bold text-gray-900">
                      GPU Platform
                    </h1>
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
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                                  }
                                `}
                              >
                                <item.icon
                                  className={`h-6 w-6 shrink-0 ${pathname === item.href ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'
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
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <h1 className="text-xl font-bold text-gray-900">
              GPU Container Platform
            </h1>
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <div className="text-xs font-semibold leading-6 text-gray-400 mb-2">
                  {isAdmin ? 'ADMIN PANEL' : 'USER PANEL'}
                </div>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`
                          group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold
                          ${pathname.startsWith(item.href)
                            ? 'bg-blue-50 text-blue-600'
                            : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                          }
                        `}
                      >
                        <item.icon
                          className={`h-6 w-6 shrink-0 ${pathname.startsWith(item.href) ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-600'
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
                <div className="flex items-center gap-x-4 px-2 py-3 text-sm font-semibold leading-6 text-gray-900">
                  <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white">
                    {user?.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <span className="sr-only">Your profile</span>
                  <span aria-hidden="true" className="flex-1">
                    {user?.fullName}
                  </span>
                </div>
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
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1 items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Welcome back, {user?.fullName}
              </h2>
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              <span className="text-sm text-gray-500">
                {isAdmin ? 'Administrator' : 'User'}
              </span>
            </div>
          </div>
        </div>

        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
