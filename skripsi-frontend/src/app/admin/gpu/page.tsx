'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { gpuApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import DashboardLayout from '@/components/layout/DashboardLayout';
import toast from 'react-hot-toast';
import { 
  CpuChipIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface GPU {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminGPUPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [gpus, setGpus] = useState<GPU[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedGpu, setSelectedGpu] = useState<GPU | null>(null);
  const [formData, setFormData] = useState({ name: '' });

  useEffect(() => {
    if (!user?.isAdmin) {
      router.push('/login');
      return;
    }
    fetchGPUs();
  }, [user, router]);

  const fetchGPUs = async () => {
    try {
      setLoading(true);
      const response = await gpuApi.getAllGPUs();
      setGpus(response.data.data);
    } catch (error) {
      console.error('Error fetching GPUs:', error);
      toast.error('Failed to fetch GPUs');
    } finally {
      setLoading(false);
    }
  };

  const handleAddGPU = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('GPU name is required');
      return;
    }

    try {
      await gpuApi.createGPU({ name: formData.name });
      toast.success('GPU added successfully');
      setShowAddModal(false);
      setFormData({ name: '' });
      fetchGPUs();
    } catch (error) {
      console.error('Error adding GPU:', error);
      toast.error('Failed to add GPU');
    }
  };

  const handleEditGPU = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGpu || !formData.name.trim()) return;

    try {
      await gpuApi.updateGPU(selectedGpu.id, { name: formData.name });
      toast.success('GPU updated successfully');
      setShowEditModal(false);
      setSelectedGpu(null);
      setFormData({ name: '' });
      fetchGPUs();
    } catch (error) {
      console.error('Error updating GPU:', error);
      toast.error('Failed to update GPU');
    }
  };

  const handleDeleteGPU = async (gpuId: number) => {
    if (!confirm('Are you sure you want to delete this GPU?')) return;
    
    try {
      await gpuApi.deleteGPU(gpuId);
      toast.success('GPU deleted successfully');
      fetchGPUs();
    } catch (error) {
      console.error('Error deleting GPU:', error);
      toast.error('Failed to delete GPU');
    }
  };

  const openEditModal = (gpu: GPU) => {
    setSelectedGpu(gpu);
    setFormData({ name: gpu.name });
    setShowEditModal(true);
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">GPU Management</h1>
            <p className="text-gray-600">Manage available GPU resources</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <PlusIcon className="h-5 w-5" />
            Add GPU
          </button>
        </div>

        {/* GPUs Grid */}
        <div className="bg-white rounded-lg shadow-sm">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : gpus.length === 0 ? (
            <div className="text-center py-12">
              <CpuChipIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No GPUs found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Add your first GPU to get started
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                <PlusIcon className="h-5 w-5" />
                Add GPU
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
              {gpus.map((gpu) => (
                <div key={gpu.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <CpuChipIcon className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{gpu.name}</h3>
                        <p className="text-sm text-gray-500">ID: {gpu.id}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          Added: {new Date(gpu.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEditModal(gpu)}
                        className="p-1 text-gray-600 hover:text-blue-600 transition"
                        title="Edit GPU"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteGPU(gpu.id)}
                        className="p-1 text-gray-600 hover:text-red-600 transition"
                        title="Delete GPU"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add GPU Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Add New GPU</h2>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setFormData({ name: '' });
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleAddGPU}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GPU Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., NVIDIA RTX 3080"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setFormData({ name: '' });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Add GPU
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit GPU Modal */}
        {showEditModal && selectedGpu && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Edit GPU</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedGpu(null);
                    setFormData({ name: '' });
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <form onSubmit={handleEditGPU}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GPU Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., NVIDIA RTX 3080"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedGpu(null);
                      setFormData({ name: '' });
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Update GPU
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
