'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { containerApi, paymentApi, tiketApi } from '@/lib/api';
import { useAuthProtected } from '@/hooks/useAuth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Link from 'next/link';
import { 
  ServerStackIcon,
  CreditCardIcon,
  TicketIcon,
  ArrowRightIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

export default function UserDashboard() {
  const router = useRouter();
  const { user, isReady, isLoading: authLoading } = useAuthProtected();
  const [stats, setStats] = useState({
    containers: 0,
    activeContainers: 0,
    pendingPayments: 0,
    openTickets: 0
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch containers
      try {
        const containersRes = await containerApi.getMyContainers();
        // Ensure containers is always an array
        let containers = [];
        if (Array.isArray(containersRes.data.data)) {
          containers = containersRes.data.data;
        } else if (containersRes.data.data?.containers && Array.isArray(containersRes.data.data.containers)) {
          containers = containersRes.data.data.containers;
        }
        
        setStats(prev => ({
          ...prev,
          containers: containers.length,
          activeContainers: containers.filter((c: any) => c.status === 'running').length
        }));
      } catch (error) {
        console.error('Error fetching containers:', error);
        // Set default values on error
        setStats(prev => ({
          ...prev,
          containers: 0,
          activeContainers: 0
        }));
      }

      // Fetch payments
      try {
        const paymentsRes = await paymentApi.getMyPayments();
        // Ensure payments is always an array
        const payments = Array.isArray(paymentsRes.data.data) ? paymentsRes.data.data : [];
        setStats(prev => ({
          ...prev,
          pendingPayments: payments.filter((p: any) => p.status === 0).length
        }));
      } catch (error) {
        console.error('Error fetching payments:', error);
        setStats(prev => ({
          ...prev,
          pendingPayments: 0
        }));
      }

      // Fetch tickets
      try {
        const ticketsRes = await tiketApi.getMyTickets();
        // Ensure tickets is always an array
        const tickets = Array.isArray(ticketsRes.data.data) ? ticketsRes.data.data : [];
        setStats(prev => ({
          ...prev,
          openTickets: tickets.filter((t: any) => t.status === 'open').length
        }));
      } catch (error) {
        console.error('Error fetching tickets:', error);
        setStats(prev => ({
          ...prev,
          openTickets: 0
        }));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    if (isReady && user) {
      fetchDashboardData();
    }
  }, [isReady, user, fetchDashboardData]);

  // Auto-refresh on focus
  useEffect(() => {
    const handleFocus = () => {
      if (document.visibilityState === 'visible') {
        fetchDashboardData();
      }
    };

    document.addEventListener('visibilitychange', handleFocus);
    window.addEventListener('focus', handleFocus);

    // Set up polling interval (every 20 seconds)
    const interval = setInterval(fetchDashboardData, 20000);

    return () => {
      document.removeEventListener('visibilitychange', handleFocus);
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, [fetchDashboardData]);

  const dashboardCards = [
    {
      title: 'My Containers',
      value: stats.containers,
      subValue: `${stats.activeContainers} active`,
      icon: ServerStackIcon,
      href: '/user/containers',
      color: 'blue',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600'
    },
    {
      title: 'Pending Payments',
      value: stats.pendingPayments,
      subValue: 'Awaiting approval',
      icon: CreditCardIcon,
      href: '/user/payments',
      color: 'yellow',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Open Tickets',
      value: stats.openTickets,
      subValue: 'Active support requests',
      icon: TicketIcon,
      href: '/user/tickets',
      color: 'purple',
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-600'
    }
  ];

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.fullName}!
          </h1>
          <p className="text-gray-600">
            Here's an overview of your GPU container platform activity.
          </p>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {dashboardCards.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                    <p className="text-3xl font-bold text-gray-900">{card.value}</p>
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
        )}

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/user/packages"
              className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <span className="text-sm font-medium text-gray-700">Browse Packages</span>
            </Link>
            <Link
              href="/user/containers"
              className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <span className="text-sm font-medium text-gray-700">Manage Containers</span>
            </Link>
            <Link
              href="/user/payments"
              className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <span className="text-sm font-medium text-gray-700">View Payments</span>
            </Link>
            <Link
              href="/user/tickets"
              className="flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              <span className="text-sm font-medium text-gray-700">Support Tickets</span>
            </Link>
          </div>
        </div>

        {/* Information Cards */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 rounded-lg p-6">
            <div className="flex items-start">
              <ExclamationTriangleIcon className="h-6 w-6 text-blue-600 mt-1" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-900">Container Limits</h3>
                <p className="mt-1 text-sm text-blue-700">
                  Remember to stop unused containers to save resources. Each package has specific CPU, RAM, and GPU limits.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-6">
            <div className="flex items-start">
              <CheckCircleIcon className="h-6 w-6 text-green-600 mt-1" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-green-900">Need Help?</h3>
                <p className="mt-1 text-sm text-green-700">
                  If you encounter any issues with your containers, create a support ticket and our team will assist you.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
