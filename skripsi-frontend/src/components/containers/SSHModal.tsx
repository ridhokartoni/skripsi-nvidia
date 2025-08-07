'use client';

import { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  ClipboardDocumentIcon,
  CheckIcon,
  CommandLineIcon,
  KeyIcon,
  ServerIcon
} from '@heroicons/react/24/outline';
import { Container } from '@/types';

interface SSHModalProps {
  isOpen: boolean;
  onClose: () => void;
  container: Container | null;
}

export default function SSHModal({ isOpen, onClose, container }: SSHModalProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ssh' | 'jupyter' | 'docker'>('ssh');

  if (!isOpen || !container) return null;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const sshCommand = `ssh -p ${container.sshPort} root@localhost`;
  const jupyterUrl = `http://localhost:${container.jupyterPort}`;
  const dockerExecCommand = `docker exec -it ${container.name} bash`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Container Access</h2>
            <p className="text-sm text-gray-500 mt-1">
              Container: <span className="font-mono font-semibold">{container.name}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('ssh')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'ssh'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <CommandLineIcon className="inline-block h-5 w-5 mr-2" />
              SSH Access
            </button>
            <button
              onClick={() => setActiveTab('jupyter')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'jupyter'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ServerIcon className="inline-block h-5 w-5 mr-2" />
              Jupyter Notebook
            </button>
            <button
              onClick={() => setActiveTab('docker')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'docker'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <ServerIcon className="inline-block h-5 w-5 mr-2" />
              Docker Direct
            </button>
          </nav>
        </div>

        {/* SSH Tab */}
        {activeTab === 'ssh' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">SSH Connection</h3>
              <p className="text-sm text-gray-600 mb-4">
                Connect to the container using SSH from your terminal
              </p>
              
              <div className="bg-gray-900 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center">
                  <code className="text-green-400 text-sm font-mono">
                    {sshCommand}
                  </code>
                  <button
                    onClick={() => copyToClipboard(sshCommand, 'ssh')}
                    className="ml-4 p-2 hover:bg-gray-800 rounded transition"
                  >
                    {copied === 'ssh' ? (
                      <CheckIcon className="h-5 w-5 text-green-400" />
                    ) : (
                      <ClipboardDocumentIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Host
                  </label>
                  <div className="bg-gray-50 rounded px-3 py-2">
                    <code className="text-sm">localhost</code>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Port
                  </label>
                  <div className="bg-gray-50 rounded px-3 py-2">
                    <code className="text-sm">{container.sshPort}</code>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <div className="bg-gray-50 rounded px-3 py-2">
                    <code className="text-sm">root</code>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="bg-gray-50 rounded px-3 py-2 flex justify-between items-center">
                    <code className="text-sm">{container.password || '(Check database)'}</code>
                    {container.password && (
                      <button
                        onClick={() => copyToClipboard(container.password, 'password')}
                        className="ml-2"
                      >
                        {copied === 'password' ? (
                          <CheckIcon className="h-4 w-4 text-green-600" />
                        ) : (
                          <ClipboardDocumentIcon className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-900 mb-2">
                  <KeyIcon className="inline-block h-4 w-4 mr-1" />
                  Getting the Password
                </h4>
                <p className="text-sm text-blue-800">
                  If the password is not shown, you can retrieve it from the database:
                </p>
                <div className="mt-2 bg-white rounded p-2">
                  <code className="text-xs text-gray-800">
                    docker exec -it postgres-container psql -U qaisjabbar -d nvidia -c 
                    "SELECT password FROM \"Container\" WHERE name = '{container.name}';"
                  </code>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Jupyter Tab */}
        {activeTab === 'jupyter' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Jupyter Notebook Access</h3>
              <p className="text-sm text-gray-600 mb-4">
                Access the Jupyter Notebook server running in the container
              </p>
              
              <div className="bg-gray-900 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center">
                  <code className="text-green-400 text-sm font-mono">
                    {jupyterUrl}
                  </code>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(jupyterUrl, 'jupyter')}
                      className="p-2 hover:bg-gray-800 rounded transition"
                    >
                      {copied === 'jupyter' ? (
                        <CheckIcon className="h-5 w-5 text-green-400" />
                      ) : (
                        <ClipboardDocumentIcon className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                    <a
                      href={jupyterUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-sm"
                    >
                      Open Jupyter
                    </a>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg">
                <h4 className="text-sm font-semibold text-yellow-900 mb-2">
                  Authentication Required
                </h4>
                <p className="text-sm text-yellow-800">
                  You may need a token or password to access Jupyter. To get the token, SSH into the container and run:
                </p>
                <div className="mt-2 bg-white rounded p-2">
                  <code className="text-xs text-gray-800">
                    jupyter notebook list
                  </code>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Docker Tab */}
        {activeTab === 'docker' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Docker Direct Access</h3>
              <p className="text-sm text-gray-600 mb-4">
                Execute commands directly in the container using Docker
              </p>
              
              <div className="bg-gray-900 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center">
                  <code className="text-green-400 text-sm font-mono">
                    {dockerExecCommand}
                  </code>
                  <button
                    onClick={() => copyToClipboard(dockerExecCommand, 'docker')}
                    className="ml-4 p-2 hover:bg-gray-800 rounded transition"
                  >
                    {copied === 'docker' ? (
                      <CheckIcon className="h-5 w-5 text-green-400" />
                    ) : (
                      <ClipboardDocumentIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-900">Other Useful Docker Commands:</h4>
                
                <div className="space-y-2">
                  <div className="bg-gray-50 rounded p-3">
                    <p className="text-xs text-gray-600 mb-1">View container logs:</p>
                    <code className="text-xs text-gray-800">docker logs {container.name}</code>
                  </div>
                  
                  <div className="bg-gray-50 rounded p-3">
                    <p className="text-xs text-gray-600 mb-1">Monitor resource usage:</p>
                    <code className="text-xs text-gray-800">docker stats {container.name}</code>
                  </div>
                  
                  <div className="bg-gray-50 rounded p-3">
                    <p className="text-xs text-gray-600 mb-1">Inspect container details:</p>
                    <code className="text-xs text-gray-800">docker inspect {container.name}</code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Container Info */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Container Information</h4>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Image:</span>
              <p className="font-mono mt-1">{container.imageName}</p>
            </div>
            <div>
              <span className="text-gray-500">Resources:</span>
              <p className="mt-1">{container.CPU} CPU, {container.RAM} RAM, {container.GPU} GPU</p>
            </div>
            <div>
              <span className="text-gray-500">User ID:</span>
              <p className="mt-1">{container.userId}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
