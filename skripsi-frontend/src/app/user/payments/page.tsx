'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { paymentApi, paketApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import DashboardLayout from '@/components/layout/DashboardLayout';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { 
  CreditCardIcon,
  PlusIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentTextIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface Payment {
  id: number;
  userId: number;
  paketId: number;
  tujuanPenelitian: string;
  harga: number;
  status: number; // 0: pending, 1: approved, 2: rejected
  createdAt: string;
  updatedAt: string;
  paket?: {
    name: string;
    CPU: number;
    RAM: number;
    GPU: number;
    durasi: number;
  };
}

interface Paket {
  id: number;
  name: string;
  CPU: number;
  RAM: number;
  GPU: number;
  harga: number;
  durasi: number;
}

export default function UserPaymentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [packages, setPackages] = useState<Paket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Paket | null>(null);
  const [generatedPrice, setGeneratedPrice] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    paketId: '',
    tujuanPenelitian: '',
    pj: user?.pj || ''
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchPayments();
    fetchPackages();
    
    // Check if there's a package parameter in the URL
    const packageId = searchParams.get('package');
    if (packageId) {
      setShowCreateModal(true);
      // Will set the package after packages are loaded
    }
  }, [user, router, searchParams]);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await paymentApi.getMyPayments();
      setPayments(response.data.data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
      toast.error('Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  const fetchPackages = async () => {
    try {
      const response = await paketApi.getAllPakets();
      const packagesData = response.data.data || [];
      setPackages(packagesData);
      
      // If there's a package ID in the URL, pre-select it
      const packageId = searchParams.get('package');
      if (packageId && packagesData.length > 0) {
        const selected = packagesData.find((p: Paket) => p.id === parseInt(packageId));
        if (selected) {
          setFormData(prev => ({ ...prev, paketId: packageId }));
          setSelectedPackage(selected);
          // Generate price for the pre-selected package
          const price = await generatePrice(packageId);
          setGeneratedPrice(price);
        }
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
    }
  };

  const generatePrice = async (paketId: string) => {
    try {
      const response = await paketApi.generatePrice(parseInt(paketId));
      setGeneratedPrice(response.data.data.harga);
      return response.data.data.harga;
    } catch (error) {
      console.error('Error generating price:', error);
      toast.error('Failed to generate price');
      return null;
    }
  };

  const handlePackageSelect = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const paketId = e.target.value;
    setFormData({ ...formData, paketId });
    
    if (paketId) {
      const selected = packages.find(p => p.id === parseInt(paketId));
      setSelectedPackage(selected || null);
      const price = await generatePrice(paketId);
      setGeneratedPrice(price);
    } else {
      setSelectedPackage(null);
      setGeneratedPrice(null);
    }
  };

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!generatedPrice) {
      toast.error('Please select a package first');
      return;
    }

    try {
      await paymentApi.createPayment({
        paketId: parseInt(formData.paketId),
        tujuanPenelitian: formData.tujuanPenelitian,
        pj: formData.pj,
        harga: generatedPrice
      });
      
      toast.success('Payment created successfully');
      setShowCreateModal(false);
      resetForm();
      fetchPayments();
    } catch (error) {
      console.error('Error creating payment:', error);
      toast.error('Failed to create payment');
    }
  };

  const resetForm = () => {
    setFormData({
      paketId: '',
      tujuanPenelitian: '',
      pj: user?.pj || ''
    });
    setSelectedPackage(null);
    setGeneratedPrice(null);
  };

  const getStatusBadge = (status: number) => {
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
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
            <XCircleIcon className="h-3 w-3" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">My Payments</h1>
            <p className="text-gray-600">Manage your package payments</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <PlusIcon className="h-5 w-5" />
            New Payment
          </button>
        </div>

        {/* Payments Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-12">
              <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No payments found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Create your first payment to get started with a package
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <PlusIcon className="h-5 w-5" />
                New Payment
              </button>
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
                      Package
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Purpose
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{payment.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{payment.paket?.name || 'N/A'}</div>
                        {payment.paket && (
                          <div className="text-xs text-gray-500">
                            {payment.paket.CPU} CPU • {payment.paket.RAM}GB RAM • {payment.paket.GPU} GPU
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {payment.tujuanPenelitian}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatCurrency(payment.harga)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(payment.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Payment Instructions */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <div className="flex">
            <DocumentTextIcon className="h-5 w-5 text-blue-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Payment Instructions</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ol className="list-decimal list-inside space-y-1">
                  <li>Select a package and fill in the research purpose</li>
                  <li>Submit the payment request</li>
                  <li>Transfer the amount to the provided bank account</li>
                  <li>Wait for admin approval</li>
                  <li>Once approved, your container will be created</li>
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Create Payment Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Create New Payment</h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleCreatePayment}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Package
                    </label>
                    <select
                      value={formData.paketId}
                      onChange={handlePackageSelect}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Choose a package...</option>
                      {packages.map((paket) => (
                        <option key={paket.id} value={paket.id}>
                          {paket.name} - {paket.CPU} CPU, {paket.RAM}GB RAM, {paket.GPU} GPU ({paket.durasi} days)
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedPackage && generatedPrice && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-2">Package Details</h3>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">CPU:</span> {selectedPackage.CPU} cores
                        </div>
                        <div>
                          <span className="text-gray-500">RAM:</span> {selectedPackage.RAM} GB
                        </div>
                        <div>
                          <span className="text-gray-500">GPU:</span> {selectedPackage.GPU}
                        </div>
                        <div>
                          <span className="text-gray-500">Duration:</span> {selectedPackage.durasi} days
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-900">Total Price:</span>
                          <span className="text-lg font-bold text-blue-600">
                            {formatCurrency(generatedPrice)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Research Purpose
                    </label>
                    <textarea
                      value={formData.tujuanPenelitian}
                      onChange={(e) => setFormData({ ...formData, tujuanPenelitian: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                      placeholder="Describe your research purpose..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Person in Charge (PJ)
                    </label>
                    <input
                      type="text"
                      value={formData.pj}
                      onChange={(e) => setFormData({ ...formData, pj: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter person in charge name"
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!generatedPrice}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create Payment
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
