'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { containerApi, userApi } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import CreateContainerModal from '@/components/containers/CreateContainerModal';
import SSHModal from '@/components/containers/SSHModal';
import { Container, User } from '@/types';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  PlayIcon,
  StopIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  CommandLineIcon,
} from '@heroicons/react/24/outline';

export default function AdminContainersPage() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [sshModalOpen, setSshModalOpen] = useState(false);
  const [selectedContainer, setSelectedContainer] = useState<Container | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [loadingContainers, setLoadingContainers] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();

  const { data: containers, isLoading } = useQuery({
    queryKey: ['allContainers'],
    queryFn: async () => {
      const response = await containerApi.getAllContainers();
      return response.data.data.containers;
    },
  });

  const { data: users } = useQuery({
    queryKey: ['allUsers'],
    queryFn: async () => {
      const response = await userApi.getAllUsers();
      return response.data.data;
    },
  });

  const startMutation = useMutation({
    mutationFn: (containerName: string) => {
      setLoadingContainers(prev => new Set(Array.from(prev).concat(containerName)));
      return containerApi.startContainer(containerName);
    },
    onSuccess: (_, containerName) => {
      toast.success('Container started successfully');
      queryClient.invalidateQueries({ queryKey: ['allContainers'] });
      setLoadingContainers(prev => {
        const newSet = new Set(prev);
        newSet.delete(containerName);
        return newSet;
      });
    },
    onError: (error: any, containerName) => {
      const errorMessage = error.response?.data?.message || error.message || '';
      if (errorMessage.includes('No such container')) {
        toast.error('Container does not exist in Docker. This is an orphaned database record that should be deleted.');
      } else if (errorMessage.includes('already started') || errorMessage.includes('is already running')) {
        toast('Container is already running', { icon: '⚠️' });
      } else {
        toast.error(errorMessage || 'Failed to start container');
      }
      setLoadingContainers(prev => {
        const newSet = new Set(prev);
        newSet.delete(containerName);
        return newSet;
      });
    },
  });

  const stopMutation = useMutation({
    mutationFn: (containerName: string) => {
      setLoadingContainers(prev => new Set(Array.from(prev).concat(containerName)));
      return containerApi.stopContainer(containerName);
    },
    onSuccess: (_, containerName) => {
      toast.success('Container stopped successfully');
      queryClient.invalidateQueries({ queryKey: ['allContainers'] });
      setLoadingContainers(prev => {
        const newSet = new Set(prev);
        newSet.delete(containerName);
        return newSet;
      });
    },
    onError: (error: any, containerName) => {
      if (error.response?.data?.message?.includes('No such container')) {
        toast.error('Container not found in Docker. Consider removing this orphaned record.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to stop container');
      }
      setLoadingContainers(prev => {
        const newSet = new Set(prev);
        newSet.delete(containerName);
        return newSet;
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (containerName: string) => containerApi.deleteContainer(containerName),
    onSuccess: () => {
      toast.success('Container deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['allContainers'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete container');
    },
  });

  const filteredContainers = containers?.filter((container: Container) => {
    const matchesSearch = container.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      container.imageName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getUserName = (userId: number) => {
    const user = users?.find((u: User) => u.id === userId);
    return user?.fullName || 'Unknown User';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">All Containers</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage all user containers across the platform
            </p>
          </div>
          <button
            onClick={() => setCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Container
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search containers..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="running">Running</option>
              <option value="stopped">Stopped</option>
            </select>
          </div>
        </div>

        {/* Containers Table */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Container
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Resources
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ports
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
                {filteredContainers?.map((container: Container) => (
                  <tr key={container.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{container.name}</div>
                        <div className="text-sm text-gray-500">{container.imageName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{getUserName(container.userId)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {container.CPU} CPU, {container.RAM} RAM, {container.GPU} GPU
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        SSH: {container.sshPort}
                        <br />
                        Jupyter: {container.jupyterPort}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        container.status === 'running' 
                          ? 'bg-green-100 text-green-800' 
                          : container.status === 'exited' || container.status === 'stopped'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {container.status || 'No Status'}
                      </span>
                      {!container.status && (
                        <span className="ml-2 text-xs text-gray-500" title="Status not synced with Docker">
                          ℹ️ Check Docker
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => {
                            setSelectedContainer(container);
                            setSshModalOpen(true);
                          }}
                          className="text-blue-600 hover:text-blue-900"
                          title="SSH Details"
                        >
                          <CommandLineIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => stopMutation.mutate(container.name)}
                          disabled={loadingContainers.has(container.name) || container.status === 'stopped' || container.status === 'exited'}
                          className={`${
                            loadingContainers.has(container.name) || container.status === 'stopped' || container.status === 'exited'
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-yellow-600 hover:text-yellow-900'
                          }`}
                          title={container.status === 'running' ? 'Stop Container' : 'Container is not running'}
                        >
                          {loadingContainers.has(container.name) ? (
                            <div className="w-5 h-5 border-2 border-gray-300 border-t-yellow-600 rounded-full animate-spin"></div>
                          ) : (
                            <StopIcon className="h-5 w-5" />
                          )}
                        </button>
                        <button
                          onClick={() => startMutation.mutate(container.name)}
                          disabled={loadingContainers.has(container.name) || container.status === 'running'}
                          className={`${
                            loadingContainers.has(container.name) || container.status === 'running'
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-green-600 hover:text-green-900'
                          }`}
                          title={container.status === 'running' ? 'Container already running' : 'Start Container'}
                        >
                          {loadingContainers.has(container.name) ? (
                            <div className="w-5 h-5 border-2 border-gray-300 border-t-green-600 rounded-full animate-spin"></div>
                          ) : (
                            <PlayIcon className="h-5 w-5" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this container?')) {
                              deleteMutation.mutate(container.name);
                            }
                          }}
                          className="text-red-600 hover:text-red-900"
                          title="Delete Container"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(!filteredContainers || filteredContainers.length === 0) && (
              <div className="text-center py-8">
                <p className="text-gray-500">No containers found</p>
              </div>
            )}
          </div>
        )}

        <CreateContainerModal
          isOpen={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          users={users || []}
        />
        
        {selectedContainer && (
          <SSHModal
            isOpen={sshModalOpen}
            onClose={() => {
              setSshModalOpen(false);
              setSelectedContainer(null);
            }}
            container={selectedContainer}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
