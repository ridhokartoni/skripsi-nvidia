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
  deviceId?: number;
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
  const [formData, setFormData] = useState({ name: '', deviceId: '' });

  // Live discovery (read-only)
  const [discovery, setDiscovery] = useState<any[]>([]);
  const [discoverLoading, setDiscoverLoading] = useState(false);

  // MIG and Topology (future panes, safe on hosts without GPUs)
  const [migSummary, setMigSummary] = useState<any[]>([]);
  const [migInstances, setMigInstances] = useState<any[]>([]);
  const [migLoading, setMigLoading] = useState(false);
  const [topology, setTopology] = useState<string>('');
  const [topoLoading, setTopoLoading] = useState(false);

  useEffect(() => {
    if (user === null) return; // wait for hydration
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

  const fetchDiscovery = async () => {
    try {
      setDiscoverLoading(true);
      const response = await gpuApi.getDiscovery();
      setDiscovery(response.data.data || []);
    } catch (error) {
      console.error('Error discovering GPUs:', error);
      toast.error('Failed to run GPU discovery');
    } finally {
      setDiscoverLoading(false);
    }
  };

  const fetchMig = async () => {
    try {
      setMigLoading(true);
      const [summary, instances] = await Promise.all([
        gpuApi.getMigSummary(),
        gpuApi.getMigInstances(),
      ]);
      setMigSummary(summary.data.data || []);
      setMigInstances(instances.data.data || []);
    } catch (error) {
      console.error('Error fetching MIG data:', error);
      toast.error('MIG data unavailable on this host');
    } finally {
      setMigLoading(false);
    }
  };

  const fetchTopology = async () => {
    try {
      setTopoLoading(true);
      const res = await gpuApi.getTopology();
      setTopology(res.data.data?.raw || '');
    } catch (error) {
      console.error('Error fetching topology:', error);
      toast.error('Topology unavailable on this host');
    } finally {
      setTopoLoading(false);
    }
  };

  const handleAddGPU = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('GPU name is required');
      return;
    }
    if (formData.deviceId.trim() === '' || isNaN(parseInt(formData.deviceId))) {
      toast.error('Valid device ID is required (e.g., 0, 1, 2)');
      return;
    }

    try {
      await gpuApi.createGPU({ name: formData.name, deviceId: parseInt(formData.deviceId) });
      toast.success('GPU added successfully');
      setShowAddModal(false);
      setFormData({ name: '', deviceId: '' });
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
      const payload: any = { name: formData.name };
      if (formData.deviceId.trim() !== '' && !isNaN(parseInt(formData.deviceId))) {
        payload.deviceId = parseInt(formData.deviceId);
      }
      await gpuApi.updateGPU(selectedGpu.id, payload);
      toast.success('GPU updated successfully');
      setShowEditModal(false);
      setSelectedGpu(null);
      setFormData({ name: '', deviceId: '' });
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
    setFormData({ name: gpu.name, deviceId: typeof gpu.deviceId === 'number' ? String(gpu.deviceId) : '' });
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
          <div className="flex gap-2">
            <button
              onClick={fetchDiscovery}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 transition"
              title="Discover live GPUs (DGX)"
            >
              Refresh Live GPUs
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              <PlusIcon className="h-5 w-5" />
              Add GPU
            </button>
          </div>
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
                        {typeof (gpu as any).deviceId === 'number' && (
                          <p className="text-sm text-gray-500">Device: {gpu.deviceId}</p>
                        )}
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

        {/* Live DGX GPU Discovery */}
        <div className="mt-6 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-semibold text-gray-900">Live DGX GPU Inventory</h2>
            <button
              onClick={fetchDiscovery}
              disabled={discoverLoading}
              className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-60"
            >
              {discoverLoading ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
          <div className="p-4">
            {discoverLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : discovery.length === 0 ? (
              <p className="text-sm text-gray-600">No live data yet. Click Refresh to query nvidia-smi on the server.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-600">
                      <th className="p-2">Index</th>
                      <th className="p-2">Name</th>
                      <th className="p-2">UUID</th>
                      <th className="p-2">Driver</th>
                      <th className="p-2">Mem (Used/Total MB)</th>
                      <th className="p-2">Util %</th>
                      <th className="p-2">Temp °C</th>
                      <th className="p-2">SM MHz</th>
                      <th className="p-2">Compute Mode</th>
                    </tr>
                  </thead>
                  <tbody>
                    {discovery.map((g: any) => (
                      <tr key={g.uuid || g.index} className="border-t">
                        <td className="p-2">{g.index}</td>
                        <td className="p-2">{g.name}</td>
                        <td className="p-2 font-mono text-xs">{g.uuid}</td>
                        <td className="p-2">{g.driverVersion}</td>
                        <td className="p-2">{g.memoryUsedMB} / {g.memoryTotalMB}</td>
                        <td className="p-2">{g.utilizationPercent}</td>
                        <td className="p-2">{g.temperatureC}</td>
                        <td className="p-2">{g.smClockMHz}</td>
                        <td className="p-2">{g.computeMode}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="mt-3 text-xs text-gray-500">
              Read-only data pulled from nvidia-smi. For MIG partitioning and multi-GPU NVLink topology, we can extend this with additional endpoints as a next step.
            </p>
          </div>
        </div>

        {/* MIG (Future Pane) */}
        <div className="mt-6 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-semibold text-gray-900">MIG Layout (Preview)</h2>
            <button
              onClick={fetchMig}
              disabled={migLoading}
              className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-60"
            >
              {migLoading ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
          <div className="p-4 space-y-4">
            {migLoading ? (
              <div className="flex justify-center items-center h-24">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Summary</h3>
                  {migSummary.length === 0 ? (
                    <p className="text-sm text-gray-600">MIG data unavailable on this host.</p>
                  ) : (
                    <ul className="list-disc pl-5 text-sm text-gray-800">
                      {migSummary.map((x, i) => (
                        <li key={i} className="font-mono text-xs">{x.line}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Instances</h3>
                  {migInstances.length === 0 ? (
                    <p className="text-sm text-gray-600">No MIG instances detected.</p>
                  ) : (
                    <ul className="list-disc pl-5 text-sm text-gray-800">
                      {migInstances.map((x, i) => (
                        <li key={i} className="font-mono text-xs">{x.line}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </>
            )}
            <p className="mt-1 text-xs text-gray-500">Best-effort parsing; shown as raw lines for now.</p>
          </div>
        </div>

        {/* Topology (Future Pane) */}
        <div className="mt-6 bg-white rounded-lg shadow-sm">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="font-semibold text-gray-900">NVLink / NVSwitch Topology (Preview)</h2>
            <button
              onClick={fetchTopology}
              disabled={topoLoading}
              className="px-3 py-1.5 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-60"
            >
              {topoLoading ? 'Refreshing…' : 'Refresh'}
            </button>
          </div>
          <div className="p-4">
            {topoLoading ? (
              <div className="flex justify-center items-center h-24">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : topology ? (
              <pre className="text-xs bg-gray-50 p-3 rounded-md overflow-x-auto whitespace-pre-wrap">{topology}</pre>
            ) : (
              <p className="text-sm text-gray-600">Topology data unavailable on this host.</p>
            )}
          </div>
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
                    setFormData({ name: '', deviceId: '' });
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
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., NVIDIA DGX A100"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">Tip: Click a suggestion below to auto-fill name and device ID from live discovery.</p>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Device ID</label>
                  <input
                    type="number"
                    value={formData.deviceId}
                    onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 0 or 1"
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">Device ID corresponds to the GPU index as shown by nvidia-smi.</p>
                </div>

                {/* Suggestions from discovery */}
                <div className="mb-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">Suggestions</div>
                  <div className="flex flex-wrap gap-2">
                    {discovery.length === 0 ? (
                      <span className="text-xs text-gray-500">No live GPUs discovered. Click "Refresh Live GPUs" above first.</span>
                    ) : (
                      discovery.map((g: any) => (
                        <button
                          key={g.uuid || g.index}
                          type="button"
                          onClick={() => setFormData({ name: g.name, deviceId: String(g.index) })}
                          className="px-2 py-1 text-xs border rounded hover:bg-gray-50"
                          title={`Set ${g.name} (device ${g.index})`}
                        >
                          {g.name} (device {g.index})
                        </button>
                      ))
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setFormData({ name: '', deviceId: '' });
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
                    setFormData({ name: '', deviceId: '' });
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
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., NVIDIA DGX A100"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Device ID</label>
                  <input
                    type="number"
                    value={formData.deviceId}
                    onChange={(e) => setFormData({ ...formData, deviceId: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., 0 or 1"
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      setSelectedGpu(null);
                      setFormData({ name: '', deviceId: '' });
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
