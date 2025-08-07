'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { paketApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import DashboardLayout from '@/components/layout/DashboardLayout';
import toast from 'react-hot-toast';
import Link from 'next/link';
import { 
  CubeIcon,
  CpuChipIcon,
  ServerIcon,
  ClockIcon,
  CheckIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

interface Paket {
  id: number;
  name: string;
  CPU: number;
  RAM: number;
  GPU: number;
  harga: number;
  durasi: number;
  createdAt: string;
  updatedAt: string;
}

export default function UserPackagesPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [packages, setPackages] = useState<Paket[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchPackages();
  }, [user, router]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await paketApi.getAllPakets();
      setPackages(response.data.data || []);
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast.error('Failed to fetch packages');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const handleSelectPackage = (paketId: number) => {
    setSelectedPackage(paketId);
    // Navigate to payments page with selected package
    router.push(`/user/payments?package=${paketId}`);
  };

  const getPopularBadge = (paket: Paket) => {
    // Mark middle-tier packages as popular
    const sortedByPrice = [...packages].sort((a, b) => a.harga - b.harga);
    const midIndex = Math.floor(sortedByPrice.length / 2);
    if (sortedByPrice[midIndex]?.id === paket.id && packages.length > 2) {
      return (
        <span className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 px-2 py-1 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-pink-500 rounded-full">
          POPULAR
        </span>
      );
    }
    return null;
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Available Packages</h1>
          <p className="text-gray-600">Choose the perfect package for your research needs</p>
        </div>

        {/* Features Section */}
        <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">All packages include:</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <CheckIcon className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">24/7 Support</p>
                <p className="text-xs text-gray-600">Get help whenever you need it</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckIcon className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">Jupyter Notebook</p>
                <p className="text-xs text-gray-600">Pre-installed development environment</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckIcon className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900">SSH Access</p>
                <p className="text-xs text-gray-600">Full root access to your container</p>
              </div>
            </div>
          </div>
        </div>

        {/* Packages Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : packages.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <CubeIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No packages available</h3>
            <p className="mt-1 text-sm text-gray-500">
              Please check back later for available packages
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packages.map((paket) => (
              <div 
                key={paket.id} 
                className="relative bg-white rounded-lg shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden"
              >
                {getPopularBadge(paket)}
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{paket.name}</h3>
                  
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-blue-600">
                        {formatCurrency(paket.harga)}
                      </span>
                      <span className="text-gray-500">/ {paket.durasi} days</span>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <CpuChipIcon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{paket.CPU} CPU Cores</p>
                        <p className="text-xs text-gray-500">High-performance processors</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <ServerIcon className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{paket.RAM} GB RAM</p>
                        <p className="text-xs text-gray-500">DDR4 memory</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <CpuChipIcon className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{paket.GPU} GPU</p>
                        <p className="text-xs text-gray-500">NVIDIA graphics cards</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-lg">
                        <ClockIcon className="h-5 w-5 text-orange-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{paket.durasi} Days</p>
                        <p className="text-xs text-gray-500">Full access period</p>
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/user/payments?package=${paket.id}`}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transition"
                  >
                    Select Package
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Comparison Table */}
        {packages.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Package Comparison</h2>
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Feature
                      </th>
                      {packages.map((paket) => (
                        <th key={paket.id} className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {paket.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        CPU Cores
                      </td>
                      {packages.map((paket) => (
                        <td key={paket.id} className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                          {paket.CPU}
                        </td>
                      ))}
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        RAM (GB)
                      </td>
                      {packages.map((paket) => (
                        <td key={paket.id} className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                          {paket.RAM}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        GPU Count
                      </td>
                      {packages.map((paket) => (
                        <td key={paket.id} className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                          {paket.GPU}
                        </td>
                      ))}
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Duration
                      </td>
                      {packages.map((paket) => (
                        <td key={paket.id} className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500">
                          {paket.durasi} days
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        Price
                      </td>
                      {packages.map((paket) => (
                        <td key={paket.id} className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-blue-600">
                          {formatCurrency(paket.harga)}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* FAQ Section */}
        <div className="mt-12 bg-gray-50 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-900">Can I upgrade my package?</h3>
              <p className="text-sm text-gray-600 mt-1">
                Yes, you can upgrade to a higher package at any time. Contact support for assistance.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">What happens after my package expires?</h3>
              <p className="text-sm text-gray-600 mt-1">
                Your container will be stopped but data will be preserved for 7 days. You can renew to continue access.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-900">Is there a free trial?</h3>
              <p className="text-sm text-gray-600 mt-1">
                Please contact our support team to discuss trial options for your research needs.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
