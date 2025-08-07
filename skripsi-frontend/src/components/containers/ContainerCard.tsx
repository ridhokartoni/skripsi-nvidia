import { Container } from '@/types';
import {
  ServerIcon,
  CpuChipIcon,
  CircleStackIcon,
  KeyIcon,
  ArrowPathIcon,
  ArrowUturnLeftIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';

interface ContainerCardProps {
  container: Container;
  onRestart: () => void;
  onReset: () => void;
  onViewDetails: () => void;
}

export default function ContainerCard({
  container,
  onRestart,
  onReset,
  onViewDetails,
}: ContainerCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{container.name}</h3>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Active
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center text-sm text-gray-600">
            <ServerIcon className="h-4 w-4 mr-2 text-gray-400" />
            <span className="font-medium">Image:</span>
            <span className="ml-2 truncate">{container.imageName}</span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <CpuChipIcon className="h-4 w-4 mr-2 text-gray-400" />
            <span className="font-medium">Resources:</span>
            <span className="ml-2">
              {container.CPU} CPU, {container.RAM} RAM, {container.GPU} GPU
            </span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <CircleStackIcon className="h-4 w-4 mr-2 text-gray-400" />
            <span className="font-medium">Ports:</span>
            <span className="ml-2">
              SSH: {container.sshPort}, Jupyter: {container.jupyterPort}
            </span>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <KeyIcon className="h-4 w-4 mr-2 text-gray-400" />
            <span className="font-medium">Password:</span>
            <span className="ml-2 font-mono text-xs bg-gray-100 px-2 py-1 rounded">
              {container.password}
            </span>
          </div>
        </div>

        <div className="mt-6 flex space-x-2">
          <button
            onClick={onViewDetails}
            className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <EyeIcon className="h-4 w-4 mr-1" />
            Details
          </button>
          <button
            onClick={onRestart}
            className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowPathIcon className="h-4 w-4 mr-1" />
            Restart
          </button>
          <button
            onClick={onReset}
            className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowUturnLeftIcon className="h-4 w-4 mr-1" />
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
