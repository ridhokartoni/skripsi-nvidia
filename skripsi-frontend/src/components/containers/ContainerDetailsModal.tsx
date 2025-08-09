import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Container, ContainerStats } from '@/types';
import { containerApi } from '@/lib/api';
import { XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface ContainerDetailsModalProps {
  container: Container;
  isOpen: boolean;
  onClose: () => void;
}

export default function ContainerDetailsModal({
  container,
  isOpen,
  onClose,
}: ContainerDetailsModalProps) {
  const [activeTab, setActiveTab] = useState('info');
  const [stats, setStats] = useState<ContainerStats | null>(null);
  const [logs, setLogs] = useState<string>('');
  const [jupyterLink, setJupyterLink] = useState<string>('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  // Track the latest password for display in the Access tab
  const [displayPassword, setDisplayPassword] = useState<string>(container.password);

  // Auto-refresh stats every 2 seconds while the modal is open on the "stats" tab
  useEffect(() => {
    if (!(isOpen && activeTab === 'stats')) return;

    // initial fetch
    fetchStats();

    const intervalId = setInterval(() => {
      fetchStats();
    }, 2000); // 2 seconds

    return () => clearInterval(intervalId);
  }, [isOpen, activeTab, container.name]);

  // Sync display password when switching containers or opening modal
  useEffect(() => {
    if (isOpen) setDisplayPassword(container.password);
  }, [isOpen, container.password, container.name]);

  // Fetch logs on demand when switching to the "logs" tab
  useEffect(() => {
    if (isOpen && activeTab === 'logs') {
      fetchLogs();
    }
  }, [isOpen, activeTab, container.name]);

  const fetchStats = async () => {
    try {
      const response = await containerApi.getContainerStats(container.name);
      setStats(response.data.data.stats);
    } catch (error) {
      // Keep showing previous values; optionally notify
    }
  };

  const fetchLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const response = await containerApi.getContainerLogs(container.name);
      setLogs(response.data.data.log);
    } catch (error) {
      toast.error('Failed to fetch container logs');
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const fetchJupyterLink = async () => {
    try {
      const response = await containerApi.getJupyterLink(container.name);
      setJupyterLink(response.data.data.jupyterLink);
      window.open(response.data.data.jupyterLink, '_blank');
    } catch (error) {
      toast.error('Failed to get Jupyter link');
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      await containerApi.changePassword(container.name, newPassword);
      toast.success('Password changed successfully');
      setDisplayPassword(newPassword);
      setNewPassword('');
    } catch (error) {
      toast.error('Failed to change password');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl">
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                      Container Details: {container.name}
                    </Dialog.Title>
                    <button
                      onClick={onClose}
                      className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  {/* Tabs */}
                  <div className="border-b border-gray-200 mb-4">
                    <nav className="-mb-px flex space-x-8">
                      {['info', 'stats', 'logs', 'access', 'settings'].map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`
                            py-2 px-1 border-b-2 font-medium text-sm capitalize
                            ${activeTab === tab
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }
                          `}
                        >
                          {tab}
                        </button>
                      ))}
                    </nav>
                  </div>

                  {/* Tab Content */}
                  <div className="mt-4">
                    {activeTab === 'info' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Container Name</h4>
                            <p className="mt-1 text-sm text-gray-900">{container.name}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Image</h4>
                            <p className="mt-1 text-sm text-gray-900">{container.imageName}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">CPU</h4>
                            <p className="mt-1 text-sm text-gray-900">{container.CPU} cores</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">RAM</h4>
                            <p className="mt-1 text-sm text-gray-900">{container.RAM}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">GPU</h4>
                            <p className="mt-1 text-sm text-gray-900">{container.GPU}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">SSH Port</h4>
                            <p className="mt-1 text-sm text-gray-900">{container.sshPort}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Jupyter Port</h4>
                            <p className="mt-1 text-sm text-gray-900">{container.jupyterPort}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Password</h4>
                            <p className="mt-1 text-sm text-gray-900 font-mono">{container.password}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'stats' && (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">CPU Usage</h4>
                            <p className="mt-1 text-2xl font-semibold text-gray-900">{stats?.CPUPerc ?? '0.00%'}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Memory Usage</h4>
                            <p className="mt-1 text-2xl font-semibold text-gray-900">{stats?.MemPerc ?? '0.00%'}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Memory</h4>
                            <p className="mt-1 text-sm text-gray-900">{stats?.MemUsage ?? '0B / 0B'}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Network I/O</h4>
                            <p className="mt-1 text-sm text-gray-900">{stats?.NetIO ?? '0B / 0B'}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">Block I/O</h4>
                            <p className="mt-1 text-sm text-gray-900">{stats?.BlockIO ?? '0B / 0B'}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-gray-500">PIDs</h4>
                            <p className="mt-1 text-sm text-gray-900">{stats?.PIDs ?? '0'}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'logs' && (
                      <div>
                        {isLoadingLogs ? (
                          <div className="flex justify-center py-8">
                            <div className="loading-spinner"></div>
                          </div>
                        ) : (
                          <div className="bg-gray-900 rounded-lg p-4 max-h-96 overflow-y-auto">
                            <pre className="text-green-400 text-xs font-mono whitespace-pre-wrap">
                              {logs || 'No logs available'}
                            </pre>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'access' && (
                      <div className="space-y-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">SSH Access</h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <code className="text-sm bg-white px-3 py-1 rounded border">
                                ssh root@localhost -p {container.sshPort}
                              </code>
                              <button
                                onClick={() => copyToClipboard(`ssh root@localhost -p ${container.sshPort}`)}
                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                              >
                                Copy
                              </button>
                            </div>
                            <p className="text-xs text-gray-500">Password: {displayPassword}</p>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Jupyter Notebook</h4>
                          <button
                            onClick={fetchJupyterLink}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                          >
                            Open Jupyter Notebook
                          </button>
                        </div>
                      </div>
                    )}

                    {activeTab === 'settings' && (
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Change Password</h4>
                          <div className="flex space-x-2">
                            <input
                              type="password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="New password (min 6 characters)"
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              onClick={handleChangePassword}
                              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                            >
                              Change Password
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
