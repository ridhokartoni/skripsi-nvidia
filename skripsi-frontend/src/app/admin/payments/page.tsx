'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { paymentApi, paketApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import DashboardLayout from '@/components/layout/DashboardLayout';
import toast from 'react-hot-toast';
import { 
  CreditCardIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  BanknotesIcon,
  CalendarIcon,
  UserIcon,
  CubeIcon
} from '@heroicons/react/24/outline';

interface Payment {
  id: number;
  paketId: number;
  status: number;
  harga: number;
  userId: number;
  tujuanPenelitian: string;
  rejectionReason?: string | null;
  createdAt?: string;
  updatedAt?: string;
  user: {
    id: number;
    email: string;
    fullName: string;
  };
  paket: {
    id: number;
    name: string;
    CPU: number;
    RAM: number;
    GPU: number;
    durasi: number;
  };
}

export default function AdminPaymentsPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    if (user === null) return; // wait for store hydration
    if (!user?.isAdmin) {
      router.push('/login');
      return;
    }
    fetchPayments();
  }, [user, router]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await paymentApi.getAllPayments();
      setPayments(response.data.data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async (paymentId: number) => {
    if (!confirm('Are you sure you want to confirm this payment?')) return;
    
    try {
      await paymentApi.confirmPayment(paymentId);
      toast.success('Payment confirmed successfully');
      // Redirect to containers page with prefill
      router.push(`/admin/containers?prefillPaymentId=${paymentId}`);
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast.error('Failed to confirm payment');
    }
  };

  const handleRejectPayment = async (paymentId: number) => {
    const reason = prompt('Please provide a reason for rejecting this payment:');
    if (!reason) {
      toast.error('Rejection reason is required');
      return;
    }
    
    if (!confirm(`Are you sure you want to reject this payment?\n\nReason: ${reason}`)) return;
    
    try {
      await paymentApi.rejectPayment(paymentId, reason);
      toast.success('Payment rejected successfully');
      fetchPayments();
    } catch (error) {
      console.error('Error rejecting payment:', error);
      toast.error('Failed to reject payment');
    }
  };

  const filteredPayments = payments.filter(payment => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'pending') return payment.status === 0;
    if (filterStatus === 'approved') return payment.status === 1;
    if (filterStatus === 'rejected') return payment.status === 2;
    return true;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  const getStatusBadge = (status: number, rejectionReason?: string | null) => {
    switch (status) {
      case 0:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
            <ClockIcon className="h-3 w-3" />
            Pending
          </span>
        );
      case 1:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
            <CheckCircleIcon className="h-3 w-3" />
            Approved
          </span>
        );
      case 2:
        return (
          <div>
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
              <XCircleIcon className="h-3 w-3" />
              Rejected
            </span>
            {rejectionReason && (
              <div className="text-xs text-red-600 mt-1">
                Reason: {rejectionReason}
              </div>
            )}
          </div>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
            Unknown
          </span>
        );
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payments Management</h1>
          <p className="text-gray-600">Review and confirm user payments</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                <BanknotesIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Payments</p>
                <p className="text-lg font-semibold text-gray-900">{payments.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-lg font-semibold text-gray-900">
                  {payments.filter(p => p.status === 0).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Approved</p>
                <p className="text-lg font-semibold text-gray-900">
                  {payments.filter(p => p.status === 1).length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-100 rounded-lg p-3">
                <XCircleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Rejected</p>
                <p className="text-lg font-semibold text-gray-900">
                  {payments.filter(p => p.status === 2).length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Payments</option>
            <option value="pending">Pending Only</option>
            <option value="approved">Approved Only</option>
            <option value="rejected">Rejected Only</option>
          </select>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-12">
              <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No payments found</h3>
              <p className="mt-1 text-sm text-gray-500">
                No payments match your current filter
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Package
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Research Purpose
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        #{payment.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <UserIcon className="h-5 w-5 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {payment.user?.fullName || 'Unknown User'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {payment.user?.email || 'No email'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <CubeIcon className="h-5 w-5 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {payment.paket?.name || 'Unknown Package'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {payment.paket?.CPU || 0} CPU, {payment.paket?.RAM || 0} GB RAM, {payment.paket?.GPU || 0} GPU
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(payment.harga)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {payment.paket?.durasi || 0} days
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {payment.tujuanPenelitian || 'Not specified'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(payment.status, payment.rejectionReason)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {payment.status === 0 && (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleConfirmPayment(payment.id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              <CheckCircleIcon className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleRejectPayment(payment.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <XCircleIcon className="h-5 w-5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
