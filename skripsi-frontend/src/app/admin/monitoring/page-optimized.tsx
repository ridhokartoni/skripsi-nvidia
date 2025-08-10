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

interface ContainerWithStats {
  id: number;
  name: string;
  imageName: string;
  status: string;
  stats?: any;
  pid?: number;
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

export default function OptimizedMonitoringPage() {
  const { user, isReady } = useAuthProtected({ requireAdmin: true });
  const [containers, setContainers] = useState<ContainerWithStats[]>([]);
  const [gpus, setGpus] = useState<GPUStats[]>([]);
  const [isAutoRefresh, setIsAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [dataFetched, setDataFetched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch container stats using batch API
  const fetchContainerStats = useCallback(async () => {
    try {
      const response = await containerApi.getBatchContainerStats();
      const data = response.data.data?.containers || [];

      // Process the data to extract stats
      const processedContainers = data.map((container: any) => {
        const stats = container.stats || {};
        const pids = stats.PIDs ? parseInt(stats.PIDs) : container.pid || 0;

        // Determine actual status based on PIDs
        let actualStatus = container.status;
        if (pids === 0 && actualStatus === 'running') {
          actualStatus = 'exited';
        }

        return {
          ...container,
          status: actualStatus,
          stats: stats,
          pid: pids
        };
      });

      setContainers(processedContainers);
      return processedContainers;
    } catch (err) {
      console.error('Error fetching batch container stats:', err);
      // Fallback to just getting container list without stats
      try {
        const response = await containerApi.getAllContainers();
        const containerData = response.data.data?.containers || [];
        setContainers(containerData);
        return containerData;
      } catch (fallbackErr) {
        console.error('Error fetching containers:', fallbackErr);
        return [];
      }
    }
  }, []);

  // Fetch GPU stats
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
      // Fetch both in parallel for maximum speed
      await Promise.all([
        fetchContainerStats(),
        fetchGPUStats()
      ]);

      setLastUpdate(new Date());
      setError(null);
      setDataFetched(true);
    } catch (err) {
      console.error('Error refreshing data:', err);
      setError('Failed to refresh monitoring data');
    }
  }, [isAutoRefresh, fetchContainerStats, fetchGPUStats]);

  // Initial load
  useEffect(() => {
    if (isReady && user) {
      refreshData();
    }
  }, [isReady, user, refreshData]);

  // Auto-refresh every 500ms
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

  const parseMemoryValue = (mem: string) => {
    if (!mem) return 0;
    const units: any = { 'B': 1, 'KiB': 1024, 'MiB': 1048576, 'GiB': 1073741824 };
    const match = mem.match(/([0-9.]+)([A-Za-z]+)/);
    if (match) {
      return parseFloat(match[1]) * (units[match[2]] || 1);
    }
    return 0;
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
            {!dataFetched ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading container data...</p>
                <p className="text-sm text-gray-400 mt-2">Fetching stats from Docker daemon</p>
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
                      const stats = container.stats;
                      const hasStats = stats && Object.keys(stats).length > 0;

                      // Parse CPU and memory from stats
                      const cpuPercent = hasStats ? parseFloat(stats.CPUPerc?.replace('%', '') || '0') : 0;
                      const memUsage = hasStats ? (stats.MemUsage?.split(' / ')[0] || '0B') : '0B';
                      const memLimit = hasStats ? (stats.MemUsage?.split(' / ')[1] || '0B') : '0B';
                      const netIO = hasStats ? (stats.NetIO?.split(' / ') || ['0B', '0B']) : ['0B', '0B'];

                      return (
                        <tr key={container.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 pr-4">
                            <div>
                              <p className="font-medium text-gray-900">{container.name}</p>
                              <p className="text-sm text-gray-500">{container.imageName}</p>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 ${getStatusColor(container.status)
                              }`}>
                              {getStatusBadge(container.status)}
                              {container.status || 'Unknown'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {hasStats ? (
                              <div>
                                <div className="text-sm font-medium">{cpuPercent.toFixed(2)}%</div>
                                <div className="w-24 bg-gray-200 rounded-full h-1.5 mt-1">
                                  <div
                                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                                    style={{ width: `${Math.min(cpuPercent, 100)}%` }}
                                  />
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {hasStats ? (
                              <div>
                                <div className="text-sm font-medium">
                                  {memUsage} / {memLimit}
                                </div>
                                <div className="w-24 bg-gray-200 rounded-full h-1.5 mt-1">
                                  <div
                                    className="bg-green-600 h-1.5 rounded-full transition-all duration-300"
                                    style={{
                                      width: `${Math.min((parseMemoryValue(memUsage) / parseMemoryValue(memLimit)) * 100, 100)}%`
                                    }}
                                  />
                                </div>
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {hasStats ? (
                              <div className="text-sm">
                                <div>↓ {netIO[0]}</div>
                                <div>↑ {netIO[1]}</div>
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
