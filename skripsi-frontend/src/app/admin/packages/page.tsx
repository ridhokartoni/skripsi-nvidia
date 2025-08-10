'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { paketApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import DashboardLayout from '@/components/layout/DashboardLayout';
import toast from 'react-hot-toast';
import { 
  CubeIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  XMarkIcon,
  CpuChipIcon,
  ServerIcon,
  ClockIcon,
  CurrencyDollarIcon
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

export default function AdminPackagesPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [packages, setPackages] = useState<Paket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<Paket | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    CPU: '',
    RAM: '',
    GPU: '',
    harga: '',
    durasi: ''
  });

  useEffect(() => {
    if (user === null) return; // wait for hydration
    if (!user?.isAdmin) {
      router.push('/login');
      return;
    }
    fetchPackages();
  }, [user, router]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const response = await paketApi.getAllPakets();
      setPackages(response.data.data);
    } catch (error) {
      console.error('Error fetching packages:', error);
      toast.error('Failed to fetch packages');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await paketApi.createPaket({
        name: formData.name,
        CPU: parseInt(formData.CPU),
        RAM: parseInt(formData.RAM),
        GPU: parseInt(formData.GPU),
        harga: parseInt(formData.harga),
        durasi: parseInt(formData.durasi)
      });
      toast.success('Package added successfully');
      setShowAddModal(false);
      resetForm();
      fetchPackages();
    } catch (error) {
      console.error('Error adding package:', error);
      toast.error('Failed to add package');
    }
  };

  const handleEditPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage) return;

    try {
      await paketApi.updatePaket(selectedPackage.id, {
        name: formData.name,
        CPU: parseInt(formData.CPU),
        RAM: parseInt(formData.RAM),
        GPU: parseInt(formData.GPU),
        harga: parseInt(formData.harga),
        durasi: parseInt(formData.durasi)
      });
      toast.success('Package updated successfully');
      setShowEditModal(false);
      setSelectedPackage(null);
      resetForm();
      fetchPackages();
    } catch (error) {
      console.error('Error updating package:', error);
      toast.error('Failed to update package');
    }
  };

  const handleDeletePackage = async (packageId: number) => {
    if (!confirm('Are you sure you want to delete this package?')) return;
    
    try {
      await paketApi.deletePaket(packageId);
      toast.success('Package deleted successfully');
      fetchPackages();
    } catch (error) {
      console.error('Error deleting package:', error);
      toast.error('Failed to delete package');
    }
  };

  const openEditModal = (paket: Paket) => {
    setSelectedPackage(paket);
    setFormData({
      name: paket.name,
      CPU: paket.CPU.toString(),
      RAM: paket.RAM.toString(),
      GPU: paket.GPU.toString(),
      harga: paket.harga.toString(),
      durasi: paket.durasi.toString()
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      CPU: '',
      RAM: '',
      GPU: '',
      harga: '',
      durasi: ''
    });
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
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Package Management</h1>
            <p className="text-gray-600">Manage service packages</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <PlusIcon className="h-5 w-5" />
            Add Package
          </button>
        </div>

        {/* Packages Grid */}
        <div className="bg-white rounded-lg shadow-sm">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : packages.length === 0 ? (
            <div className="text-center py-12">
              <CubeIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No packages found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Add your first package to get started
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <PlusIcon className="h-5 w-5" />
                Add Package
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
              {packages.map((paket) => (
                <div key={paket.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg text-gray-900">{paket.name}</h3>
                    <div className="flex gap-1">
                      <button
                        onClick={() => openEditModal(paket)}
                        className="p-1 text-gray-600 hover:text-blue-600 transition"
                        title="Edit package"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePackage(paket.id)}
                        className="p-1 text-gray-600 hover:text-red-600 transition"
                        title="Delete package"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <CpuChipIcon className="h-4 w-4" />
                      <span>{paket.CPU} CPU Cores</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <ServerIcon className="h-4 w-4" />
                      <span>{paket.RAM} GB RAM</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <CpuChipIcon className="h-4 w-4" />
                      <span>{paket.GPU} GPU</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <ClockIcon className="h-4 w-4" />
                      <span>{paket.durasi} Days</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Price</span>
                      <span className="text-lg font-bold text-blue-600">
                        {formatCurrency(paket.harga)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add/Edit Modal */}
        {(showAddModal || showEditModal) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {showAddModal ? 'Add New Package' : 'Edit Package'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                    setSelectedPackage(null);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <form onSubmit={showAddModal ? handleAddPackage : handleEditPackage}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Package Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Basic Package"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CPU Cores
                      </label>
                      <input
                        type="number"
                        value={formData.CPU}
                        onChange={(e) => setFormData({ ...formData, CPU: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 4"
                        min="1"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        RAM (GB)
                      </label>
                      <input
                        type="number"
                        value={formData.RAM}
                        onChange={(e) => setFormData({ ...formData, RAM: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 8"
                        min="1"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        GPU Count
                      </label>
                      <input
                        type="number"
                        value={formData.GPU}
                        onChange={(e) => setFormData({ ...formData, GPU: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 1"
                        min="0"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duration (Days)
                      </label>
                      <input
                        type="number"
                        value={formData.durasi}
                        onChange={(e) => setFormData({ ...formData, durasi: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., 30"
                        min="1"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (IDR)
                    </label>
                    <input
                      type="number"
                      value={formData.harga}
                      onChange={(e) => setFormData({ ...formData, harga: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., 500000"
                      min="0"
                      required
                    />
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                      setSelectedPackage(null);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    {showAddModal ? 'Add Package' : 'Update Package'}
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
