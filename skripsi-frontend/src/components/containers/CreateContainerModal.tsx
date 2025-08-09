import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { containerApi, gpuApi } from '@/lib/api';
import { User } from '@/types';
import { XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useEffect } from 'react';

interface CreateContainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
}

interface CreateContainerForm {
  userContainer: number;
  imageName: string;
  memoryLimit: string;
  cpus: number;
  gpus: string;
}

export default function CreateContainerModal({
  isOpen,
  onClose,
  users,
}: CreateContainerModalProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState('');
  const [gpuOptions, setGpuOptions] = useState<{ label: string; value: string }[]>([]);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CreateContainerForm>();

  // Load GPU options from backend to populate dropdown
  useEffect(() => {
    (async () => {
      try {
        const res = await gpuApi.getAllGPUs();
        const list = (res.data?.data || []) as Array<{ id: number; name: string }>;
        const opts = list.map((gpu, idx) => ({ label: `${gpu.name} (device ${idx})`, value: `device=${idx}` }));
        setGpuOptions([{ label: 'None', value: 'none' }, { label: 'All', value: 'all' }, ...opts]);
      } catch (e) {
        // fallback options
        setGpuOptions([{ label: 'None', value: 'none' }, { label: 'All', value: 'all' }]);
      }
    })();
  }, []);

  const createMutation = useMutation({
    mutationFn: (data: CreateContainerForm) => containerApi.createContainer(data),
    onSuccess: () => {
      toast.success('Container created successfully');
      queryClient.invalidateQueries({ queryKey: ['allContainers'] });
      reset();
      onClose();
    },
  });

  const searchImages = async (query: string) => {
    if (query.length < 2) {
      toast.error('Please enter at least 2 characters');
      return;
    }
    
    setIsSearching(true);
    try {
      const response = await containerApi.searchImages(query);
      setSearchResults(response.data.data);
    } catch (error) {
      toast.error('Failed to search images');
    } finally {
      setIsSearching(false);
    }
  };

  const onSubmit = (data: CreateContainerForm) => {
    createMutation.mutate(data);
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                      Create New Container
                    </Dialog.Title>
                    <button
                      onClick={onClose}
                      className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* User Selection */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select User *
                      </label>
                      <select
                        {...register('userContainer', { required: 'User is required' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select a user...</option>
                        {users.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.fullName} ({user.email})
                          </option>
                        ))}
                      </select>
                      {errors.userContainer && (
                        <p className="mt-1 text-sm text-red-600">{errors.userContainer.message}</p>
                      )}
                    </div>

                    {/* Image Search */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Docker Image *
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          placeholder="Search for Docker image..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              searchImages((e.target as HTMLInputElement).value);
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const input = document.querySelector('input[placeholder*="Docker image"]') as HTMLInputElement;
                            searchImages(input.value);
                          }}
                          className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                        >
                          Search
                        </button>
                      </div>
                      
                      {/* Search Results */}
                      {isSearching && <p className="mt-2 text-sm text-gray-500">Searching...</p>}
                      {searchResults.length > 0 && (
                        <div className="mt-2 max-h-40 overflow-y-auto border border-gray-200 rounded-md">
                          {searchResults.map((image, index) => (
                            <div
                              key={index}
                              className="px-3 py-2 hover:bg-gray-50 cursor-pointer"
                              onClick={() => {
                                setValue('imageName', image.name);
                                setSelectedImage(image.name);
                                setSearchResults([]);
                              }}
                            >
                              <div className="text-sm font-medium">{image.name}</div>
                              <div className="text-xs text-gray-500 truncate">{image.description}</div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Selected Image */}
                      <input
                        {...register('imageName', { required: 'Docker image is required' })}
                        type="text"
                        placeholder="Selected image name"
                        className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={selectedImage}
                        onChange={(e) => setSelectedImage(e.target.value)}
                      />
                      {errors.imageName && (
                        <p className="mt-1 text-sm text-red-600">{errors.imageName.message}</p>
                      )}
                    </div>

                    {/* Memory Limit */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Memory Limit *
                      </label>
                      <input
                        {...register('memoryLimit', { required: 'Memory limit is required' })}
                        type="text"
                        placeholder="e.g., 512m, 1g, 2g"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.memoryLimit && (
                        <p className="mt-1 text-sm text-red-600">{errors.memoryLimit.message}</p>
                      )}
                    </div>

                    {/* CPU Cores */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CPU Cores *
                      </label>
                      <input
                        {...register('cpus', { 
                          required: 'CPU cores is required',
                          min: { value: 0.5, message: 'Minimum 0.5 cores' },
                          max: { value: 16, message: 'Maximum 16 cores' }
                        })}
                        type="number"
                        step="0.5"
                        placeholder="e.g., 1, 2, 4"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.cpus && (
                        <p className="mt-1 text-sm text-red-600">{errors.cpus.message}</p>
                      )}
                    </div>

                    {/* GPU */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        GPU Allocation *
                      </label>
                      <select
                        {...register('gpus', { required: 'GPU allocation is required' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        defaultValue={gpuOptions[0]?.value}
                      >
                        {gpuOptions.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1 text-xs text-gray-500">Options map to Docker --gpus flag values.</p>
                      {errors.gpus && (
                        <p className="mt-1 text-sm text-red-600">{errors.gpus.message}</p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={createMutation.isPending}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {createMutation.isPending ? 'Creating...' : 'Create Container'}
                      </button>
                    </div>
                  </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
