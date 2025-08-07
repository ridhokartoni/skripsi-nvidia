'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { containerApi } from '@/lib/api';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ContainerCard from '@/components/containers/ContainerCard';
import ContainerDetailsModal from '@/components/containers/ContainerDetailsModal';
import { Container } from '@/types';
import toast from 'react-hot-toast';
import { PlusIcon } from '@heroicons/react/24/outline';

export default function UserContainersPage() {
  const [selectedContainer, setSelectedContainer] = useState<Container | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [loadingContainers, setLoadingContainers] = useState<Set<string>>(new Set());
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: containers, isLoading, error } = useQuery({
    queryKey: ['userContainers'],
    queryFn: async () => {
      try {
        const response = await containerApi.getMyContainers();
        return response.data.data?.containers || [];
      } catch (err) {
        console.error('Error fetching containers:', err);
        return [];
      }
    },
    retry: 1,
  });

  const restartMutation = useMutation({
    mutationFn: (containerName: string) => {
      setLoadingContainers(prev => new Set(Array.from(prev).concat(containerName)));
      return containerApi.restartContainer(containerName);
    },
    onSuccess: (_, containerName) => {
      toast.success('Container restarted successfully');
      queryClient.invalidateQueries({ queryKey: ['userContainers'] });
      setLoadingContainers(prev => {
        const newSet = new Set(prev);
        newSet.delete(containerName);
        return newSet;
      });
    },
    onError: (_, containerName) => {
      setLoadingContainers(prev => {
        const newSet = new Set(prev);
        newSet.delete(containerName);
        return newSet;
      });
    },
  });

  const resetMutation = useMutation({
    mutationFn: (containerName: string) => {
      setLoadingContainers(prev => new Set(Array.from(prev).concat(containerName)));
      return containerApi.resetContainer(containerName);
    },
    onSuccess: (_, containerName) => {
      toast.success('Container reset successfully');
      queryClient.invalidateQueries({ queryKey: ['userContainers'] });
      setLoadingContainers(prev => {
        const newSet = new Set(prev);
        newSet.delete(containerName);
        return newSet;
      });
    },
    onError: (_, containerName) => {
      setLoadingContainers(prev => {
        const newSet = new Set(prev);
        newSet.delete(containerName);
        return newSet;
      });
    },
  });

  const handleViewDetails = (container: Container) => {
    setSelectedContainer(container);
    setDetailsModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Containers</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage your GPU-enabled containers and development environments
            </p>
          </div>
          <button
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => router.push('/user/packages')}
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Request New Container
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="loading-spinner"></div>
          </div>
        ) : containers && containers.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {containers.map((container: Container) => (
              <ContainerCard
                key={container.id}
                container={container}
                onRestart={() => restartMutation.mutate(container.name)}
                onReset={() => resetMutation.mutate(container.name)}
                onViewDetails={() => handleViewDetails(container)}
                isLoading={loadingContainers.has(container.name)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No containers</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by requesting a new container package.
            </p>
            <div className="mt-6">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => router.push('/user/packages')}
              >
                <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Browse Packages
              </button>
            </div>
          </div>
        )}

        {selectedContainer && (
          <ContainerDetailsModal
            container={selectedContainer}
            isOpen={detailsModalOpen}
            onClose={() => {
              setDetailsModalOpen(false);
              setSelectedContainer(null);
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
