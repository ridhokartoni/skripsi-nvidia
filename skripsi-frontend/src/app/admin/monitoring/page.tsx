'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuthProtected } from '@/hooks/useAuth';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { containerApi, gpuApi } from '@/lib/api';
import toast from 'react-hot-toast';
import {
  CpuChipIcon,
  ServerStackIcon,
  ArrowPathIcon,
  SignalIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

interface ContainerStats {
  name: string;
  status: string;
  cpu: number;
  memory: number;
  memoryLimit: number;
  networkRx: number;
  networkTx: number;
}

interface GPUStats {
  id: number;
  name: string;
  deviceId: number;
  utilization?: number;
  memoryUsed?: number;
  memoryTotal?: number;
  temperature?: number;
  powerDraw?: number;
  status?: 'online' | 'offline' | 'error';
}

export default function MonitoringPage() {
  const { user, isReady } = useAuthProtected({ requireAdmin: true });
  const [containers, setContainers] = useState<any[]>([]);
  const [containerStats, setContainerStats] = useState<Record<string, ContainerStats>>({});
  const [gpus, setGpus] = useState<GPUStats[]>([]);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all containers
  const fetchContainers = useCallback(async () => {
    try {
      const response = await containerApi.getAllContainers();
      const containerData = response.data.data?.containers || response.data.data || [];
      setContainers(containerData);
      return containerData;
    } catch (err) {
      console.error('Error fetching containers:', err);
      return [];
    }
  }, []);

  // Fetch stats for a single container
  const fetchContainerStats = useCallback(async (containerName: string) => {
    try {
      const response = await containerApi.getContainerStats(containerName);
      const stats = response.data.data?.stats;

      if (stats) {
        // Parse Docker stats format
        const cpuPercent = parseFloat(stats.CPUPerc?.replace('%', '') || '0');
        const memUsage = stats.MemUsage?.split(' / ')[0] || '0B';
        const memLimit = stats.MemUsage?.split(' / ')[1] || '0B';
        const netIO = stats.NetIO?.split(' / ') || ['0B', '0B'];
        const pids = stats.PIDs ? parseInt(stats.PIDs) : 0;

        const newStatus = pids > 0 ? 'running' : 'exited';

        // Convert memory values to bytes
        const parseMemory = (mem: string) => {
          const units: any = { 'B': 1, 'KiB': 1024, 'MiB': 1048576, 'GiB': 1073741824 };
          const match = mem.match(/([0-9.]+)([A-Za-z]+)/);
          if (match) {
            return parseFloat(match[1]) * (units[match[2]] || 1);
          }
          return 0;
        };

        setContainerStats(prev => ({
          ...prev,
          [containerName]: {
            name: containerName,
            status: newStatus,
            cpu: cpuPercent,
            memory: parseMemory(memUsage),
            memoryLimit: parseMemory(memLimit),
            networkRx: parseMemory(netIO[0]),
            networkTx: parseMemory(netIO[1]),
          }
        }));
      }
    } catch (err: any) {
      // If stats fetching fails, the container is likely stopped or exited.
      setContainerStats(prev => ({
        ...prev,
        [containerName]: {
          ...(prev[containerName] || { name: containerName, memoryLimit: 0 }),
          status: 'exited',
          cpu: 0,
          memory: 0,
          networkRx: 0,
          networkTx: 0,
        }
      }));

      // Silently handle errors for individual container stats
      if (err.response?.status !== 403) {
        console.error(`Error fetching stats for ${containerName}:`, err);
      }
    }
  }, []);

  // Fetch manually added GPUs and their stats
  const fetchGPUStats = useCallback(async () => {
    try {
      // First get the manually added GPUs from database
      const gpuResponse = await gpuApi.getAllGPUs();
      const dbGpus = gpuResponse.data.data || [];

      // Then try to get live GPU stats
      try {
        const discoveryResponse = await gpuApi.getDiscovery();
        const liveGpus = discoveryResponse.data.data || [];

        // Map database GPUs with their live stats
        const gpusWithStats = dbGpus.map((dbGpu: any) => {
          const liveGpu = liveGpus.find((lg: any) => lg.index === dbGpu.deviceId);

          return {
            id: dbGpu.id,
            name: dbGpu.name,
            deviceId: dbGpu.deviceId,
            utilization: liveGpu?.utilizationPercent || 0,
            memoryUsed: liveGpu?.memoryUsedMB || 0,
            memoryTotal: liveGpu?.memoryTotalMB || 1,
            temperature: liveGpu?.temperatureC || 0,
            powerDraw: liveGpu?.powerDrawW || 0,
            status: liveGpu ? 'online' : 'offline'
          };
        });

        setGpus(gpusWithStats);
      } catch (discoveryErr) {
        // If discovery fails, just show GPUs without live stats
        console.error('GPU discovery unavailable:', discoveryErr);
        setGpus(dbGpus.map((dbGpu: any) => ({
          id: dbGpu.id,
          name: dbGpu.name,
          deviceId: dbGpu.deviceId,
          status: 'error'
        })));
      }
    } catch (err) {
      console.error('Error fetching GPU stats:', err);
      setGpus([]);
    }
  }, []);

  // Main refresh function
  const refreshData = useCallback(async () => {
    if (!isAutoRefresh) return;

    try {
      // Fetch containers and GPUs in parallel
      const [containerList] = await Promise.all([
        fetchContainers(),
        fetchGPUStats()
      ]);

      // Fetch stats for all containers in parallel
      if (containerList.length > 0) {
        await Promise.all(
          containerList.map((container: any) =>
            fetchContainerStats(container.name)
          )
        );
      }

      setLastUpdate(new Date());
      setError(null);
    } catch (err) {
      console.error('Error refreshing data:', err);
      setError('Failed to refresh monitoring data');
    } finally {
      setLoading(false);
    }
  }, [isAutoRefresh, fetchContainers, fetchGPUStats, fetchContainerStats]);

  // Initial load
  useEffect(() => {
    if (isReady && user) {
      refreshData();
    }
  }, [isReady, user, refreshData]);

  // Auto-refresh every 500ms (0.5 seconds)
  useEffect(() => {
    if (!isAutoRefresh || !isReady) return;

    const interval = setInterval(() => {
      refreshData();
    }, 500);

    return () => clearInterval(interval);
  }, [isAutoRefresh, isReady, refreshData]);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'running':
      case 'online':
        return 'text-green-600';
      case 'stopped':
      case 'exited':
      case 'offline':
        return 'text-gray-500';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'running':
      case 'online':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'stopped':
      case 'exited':
      case 'offline':
        return <ExclamationTriangleIcon className="h-5 w-5 text-gray-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
      default:
        return <SignalIcon className="h-5 w-5 text-yellow-600" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">System Monitoring</h1>
            <p className="text-gray-600">Real-time monitoring of containers and GPUs</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
            <button
              onClick={() => setIsAutoRefresh(!isAutoRefresh)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${isAutoRefresh
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              <ArrowPathIcon className={`h-5 w-5 ${isAutoRefresh ? 'animate-spin' : ''}`} />
              {isAutoRefresh ? 'Auto-Refresh ON' : 'Auto-Refresh OFF'}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* GPU Monitoring Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <CpuChipIcon className="h-6 w-6" />
              GPU Resources ({gpus.length} registered)
            </h2>
          </div>
          <div className="p-6">
            {gpus.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No GPUs have been added. Add GPUs from the GPU Management page.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {gpus.map((gpu) => (
                  <div key={gpu.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{gpu.name}</h3>
                        <p className="text-sm text-gray-500">Device ID: {gpu.deviceId}</p>
                      </div>
                      {getStatusBadge(gpu.status || 'offline')}
                    </div>

                    {gpu.status === 'online' ? (
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Utilization</span>
                            <span className="font-medium">{gpu.utilization || 0}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${gpu.utilization || 0}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Memory</span>
                            <span className="font-medium">
                              {gpu.memoryUsed || 0} / {gpu.memoryTotal || 0} MB
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className="bg-green-600 h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${((gpu.memoryUsed || 0) / (gpu.memoryTotal || 1)) * 100}%`
                              }}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-600">Temperature: </span>
                            <span className={`font-medium ${(gpu.temperature || 0) > 80 ? 'text-red-600' : 'text-gray-900'
                              }`}>
                              {gpu.temperature || 0}°C
                            </span>
                          </div>
                          {gpu.powerDraw !== undefined && (
                            <div>
                              <span className="text-gray-600">Power: </span>
                              <span className="font-medium">{gpu.powerDraw}W</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        {gpu.status === 'error' ? 'Unable to fetch stats' : 'GPU Offline'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Container Monitoring Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <ServerStackIcon className="h-6 w-6" />
              Container Resources ({containers.length} total)
            </h2>
          </div>
          <div className="p-6">
            {loading && containers.length === 0 ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : containers.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No containers found</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-600 border-b">
                      <th className="pb-2 pr-4">Container Name</th>
                      <th className="pb-2 px-4">Status</th>
                      <th className="pb-2 px-4">CPU Usage</th>
                      <th className="pb-2 px-4">Memory Usage</th>
                      <th className="pb-2 px-4">Network I/O</th>
                    </tr>
                  </thead>
                  <tbody>
                    {containers.map((container) => {
                      const stats = containerStats[container.name];
                      return (
                        <tr key={container.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 pr-4">
                            <div>
                              <p className="font-medium text-gray-900">{container.name}</p>
                              <p className="text-sm text-gray-500">{container.imageName}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 ${getStatusColor(stats?.status || container.status)
                              }`}>
                              {getStatusBadge(stats?.status || container.status)}
                              {stats?.status || container.status || 'Unknown'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {stats ? (
                              <div>
                                <div className="text-sm font-medium">{stats.cpu.toFixed(2)}%</div>
                                <div className="w-24 bg-gray-200 rounded-full h-1.5 mt-1">
                                  <div
                                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                                    style={{ width: `${Math.min(stats.cpu, 100)}%` }}
                                  />
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {stats ? (
                              <div>
                                <div className="text-sm font-medium">
                                  {formatBytes(stats.memory)} / {formatBytes(stats.memoryLimit)}
                                </div>
                                <div className="w-24 bg-gray-200 rounded-full h-1.5 mt-1">
                                  <div
                                    className="bg-green-600 h-1.5 rounded-full transition-all duration-300"
                                    style={{
                                      width: `${Math.min((stats.memory / stats.memoryLimit) * 100, 100)}%`
                                    }}
                                  />
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {stats ? (
                              <div className="text-sm">
                                <div>↓ {formatBytes(stats.networkRx)}</div>
                                <div>↑ {formatBytes(stats.networkTx)}</div>
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
