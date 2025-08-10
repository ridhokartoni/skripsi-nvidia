'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthProtected } from '@/hooks/useAuth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';
import { 
  UsersIcon,
  ServerStackIcon,
  CreditCardIcon,
  TicketIcon,
  CubeIcon,
  CpuChipIcon,
  ArrowRightIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { userApi, containerApi, paymentApi, tiketApi, paketApi } from '@/lib/api';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isReady, isLoading: authLoading } = useAuthProtected({ requireAdmin: true });
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalContainers: 0,
    runningContainers: 0,
    pendingPayments: 0,
    totalRevenue: 0,
    openTickets: 0,
    totalPackages: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isReady && user) {
      fetchDashboardData();
    }
  }, [isReady, user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch users
      try {
        const usersRes = await userApi.getAllUsers();
        const users = Array.isArray(usersRes.data.data) ? usersRes.data.data : [];
        setStats(prev => ({
          ...prev,
          totalUsers: users.length,
          activeUsers: users.filter((u: any) => u.isActive).length
        }));
      } catch (error) {
        console.error('Error fetching users:', error);
      }

      // Fetch containers
      try {
        const containersRes = await containerApi.getAllContainers();
        let containers = [];
        if (Array.isArray(containersRes.data.data)) {
          containers = containersRes.data.data;
        } else if (containersRes.data.data?.containers && Array.isArray(containersRes.data.data.containers)) {
          containers = containersRes.data.data.containers;
        }
        setStats(prev => ({
          ...prev,
          totalContainers: containers.length,
          runningContainers: containers.filter((c: any) => c.status === 'running').length
        }));
      } catch (error) {
        console.error('Error fetching containers:', error);
      }

      // Fetch payments
      try {
        const paymentsRes = await paymentApi.getAllPayments();
        const payments = Array.isArray(paymentsRes.data.data) ? paymentsRes.data.data : [];
        const pendingCount = payments.filter((p: any) => p.status === 0).length;
        const totalRevenue = payments
          .filter((p: any) => p.status === 1)
          .reduce((sum: number, p: any) => sum + (p.harga || 0), 0);
        
        setStats(prev => ({
          ...prev,
          pendingPayments: pendingCount,
          totalRevenue: totalRevenue
        }));
      } catch (error) {
        console.error('Error fetching payments:', error);
      }

      // Fetch tickets
      try {
        const ticketsRes = await tiketApi.getAllTickets();
        const tickets = Array.isArray(ticketsRes.data.data) ? ticketsRes.data.data : [];
        setStats(prev => ({
          ...prev,
          openTickets: tickets.filter((t: any) => t.status === 'open').length
        }));
      } catch (error) {
        console.error('Error fetching tickets:', error);
      }

      // Fetch packages
      try {
        const packagesRes = await paketApi.getAllPakets();
        const packages = Array.isArray(packagesRes.data.data) ? packagesRes.data.data : [];
        setStats(prev => ({
          ...prev,
          totalPackages: packages.length
        }));
      } catch (error) {
        console.error('Error fetching packages:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const dashboardCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      subValue: `${stats.activeUsers} active`,
      icon: UsersIcon,
      href: '/admin/users',
      color: 'blue',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600'
    },
    {
      title: 'Containers',
      value: stats.totalContainers,
      subValue: `${stats.runningContainers} running`,
      icon: ServerStackIcon,
      href: '/admin/containers',
      color: 'green',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600'
    },
    {
      title: 'Pending Payments',
      value: stats.pendingPayments,
      subValue: 'Awaiting approval',
      icon: CreditCardIcon,
      href: '/admin/payments',
      color: 'yellow',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Open Tickets',
      value: stats.openTickets,
      subValue: 'Need attention',
      icon: TicketIcon,
      href: '/admin/tickets',
      color: 'red',
      bgColor: 'bg-red-100',
      textColor: 'text-red-600'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue),
      subValue: 'Confirmed payments',
      icon: ChartBarIcon,
      href: '/admin/payments',
      color: 'purple',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600'
    },
    {
      title: 'Packages',
      value: stats.totalPackages,
      subValue: 'Available plans',
      icon: CubeIcon,
      href: '/admin/packages',
      color: 'indigo',
      bgColor: 'bg-indigo-100',
      textColor: 'text-indigo-600'
    }
  ];

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome back, {user?.fullName}! Here's an overview of your platform.
          </p>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {dashboardCards.map((card) => (
                <Link
                  key={card.title}
                  href={card.href}
                  className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                      <p className="text-sm text-gray-500 mt-1">{card.subValue}</p>
                    </div>
                    <div className={`${card.bgColor} p-3 rounded-lg`}>
                      <card.icon className={`h-6 w-6 ${card.textColor}`} />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className={`${card.textColor} font-medium`}>View details</span>
                    <ArrowRightIcon className={`ml-1 h-4 w-4 ${card.textColor}`} />
                  </div>
                </Link>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Link
                  href="/admin/users"
                  className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  <UsersIcon className="h-5 w-5 mr-2 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Manage Users</span>
                </Link>
                <Link
                  href="/admin/containers"
                  className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  <ServerStackIcon className="h-5 w-5 mr-2 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">View Containers</span>
                </Link>
                <Link
                  href="/admin/payments"
                  className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  <CreditCardIcon className="h-5 w-5 mr-2 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Review Payments</span>
                </Link>
                <Link
                  href="/admin/tickets"
                  className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                >
                  <TicketIcon className="h-5 w-5 mr-2 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Support Tickets</span>
                </Link>
              </div>
            </div>

            {/* System Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-50 rounded-lg p-6">
                <div className="flex items-start">
                  <CheckCircleIcon className="h-6 w-6 text-green-600 mt-1" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-900">System Status</h3>
                    <p className="mt-1 text-sm text-green-700">
                      All systems are operational. {stats.runningContainers} containers are currently running.
                    </p>
                  </div>
                </div>
              </div>
              
              {stats.pendingPayments > 0 && (
                <div className="bg-yellow-50 rounded-lg p-6">
                  <div className="flex items-start">
                    <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600 mt-1" />
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-900">Pending Actions</h3>
                      <p className="mt-1 text-sm text-yellow-700">
                        You have {stats.pendingPayments} payments waiting for approval and {stats.openTickets} open support tickets.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
