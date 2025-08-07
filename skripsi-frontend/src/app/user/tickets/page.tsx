'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { tiketApi, containerApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import DashboardLayout from '@/components/layout/DashboardLayout';
import toast from 'react-hot-toast';
import { 
  TicketIcon,
  PlusIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  XMarkIcon,
  ChatBubbleBottomCenterTextIcon
} from '@heroicons/react/24/outline';

interface Ticket {
  id: number;
  containerId: number;
  deskripsi: string;
  status: 'open' | 'in-progress' | 'closed';
  createdAt: string;
  updatedAt: string;
  container?: {
    id: number;
    name: string;
    imageName: string;
  };
}

interface Container {
  id: number;
  name: string;
  imageName: string;
  status: string;
}

export default function UserTicketsPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [containers, setContainers] = useState<Container[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [formData, setFormData] = useState({
    containerName: '',
    deskripsi: ''
  });
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'in-progress' | 'closed'>('all');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    fetchTickets();
    fetchContainers();
  }, [user, router]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await tiketApi.getMyTickets();
      // Ensure tickets is always an array
      let ticketData = [];
      if (Array.isArray(response.data.data)) {
        ticketData = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        ticketData = response.data;
      }
      setTickets(ticketData);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to fetch tickets');
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchContainers = async () => {
    try {
      const response = await containerApi.getMyContainers();
      // Ensure containers is always an array
      let containerData = [];
      if (Array.isArray(response.data.data)) {
        containerData = response.data.data;
      } else if (response.data.data?.containers && Array.isArray(response.data.data.containers)) {
        containerData = response.data.data.containers;
      } else if (response.data && Array.isArray(response.data)) {
        containerData = response.data;
      }
      setContainers(containerData);
    } catch (error) {
      console.error('Error fetching containers:', error);
      setContainers([]);
    }
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await tiketApi.createTicket(formData.containerName, {
        deskripsi: formData.deskripsi
      });
      
      toast.success('Ticket created successfully');
      setShowCreateModal(false);
      resetForm();
      fetchTickets();
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast.error('Failed to create ticket');
    }
  };

  const resetForm = () => {
    setFormData({
      containerName: '',
      deskripsi: ''
    });
  };

  const viewTicketDetails = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowDetailsModal(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
            <ClockIcon className="h-3 w-3" />
            Open
          </span>
        );
      case 'in-progress':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
            <ExclamationCircleIcon className="h-3 w-3" />
            In Progress
          </span>
        );
      case 'closed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
            <CheckCircleIcon className="h-3 w-3" />
            Closed
          </span>
        );
      default:
        return null;
    }
  };

  const filteredTickets = tickets.filter(ticket => 
    filterStatus === 'all' || ticket.status === filterStatus
  );

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Support Tickets</h1>
            <p className="text-gray-600">Get help with your container issues</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            disabled={containers.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <PlusIcon className="h-5 w-5" />
            New Ticket
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {(['all', 'open', 'in-progress', 'closed'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`
                  py-2 px-1 border-b-2 font-medium text-sm capitalize
                  ${filterStatus === status
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {status === 'all' ? 'All Tickets' : status.replace('-', ' ')}
                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                  {status === 'all' 
                    ? tickets.length 
                    : tickets.filter(t => t.status === status).length
                  }
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tickets List */}
        <div className="bg-white rounded-lg shadow-sm">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-12">
              <TicketIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {filterStatus === 'all' ? 'No tickets found' : `No ${filterStatus} tickets`}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {containers.length === 0 
                  ? 'You need to have containers to create support tickets'
                  : filterStatus === 'all' 
                    ? 'Create a ticket if you need help with your containers'
                    : `You have no tickets with ${filterStatus} status`
                }
              </p>
              {filterStatus === 'all' && containers.length > 0 && (
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  <PlusIcon className="h-5 w-5" />
                  New Ticket
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredTickets.map((ticket) => (
                <div key={ticket.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-sm font-semibold text-gray-900">
                          Ticket #{ticket.id}
                        </h3>
                        {getStatusBadge(ticket.status)}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        Container: <span className="font-medium">{ticket.container?.name || 'N/A'}</span>
                      </p>
                      <p className="text-sm text-gray-700 line-clamp-2">
                        {ticket.deskripsi}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Created: {new Date(ticket.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <button
                      onClick={() => viewTicketDetails(ticket)}
                      className="ml-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Ticket Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Create Support Ticket</h2>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleCreateTicket}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Container
                    </label>
                    <select
                      value={formData.containerName}
                      onChange={(e) => setFormData({ ...formData, containerName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Choose a container...</option>
                      {containers.map((container) => (
                        <option key={container.id} value={container.name}>
                          {container.name} ({container.imageName})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Issue Description
                    </label>
                    <textarea
                      value={formData.deskripsi}
                      onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={5}
                      placeholder="Describe the issue you're experiencing..."
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Create Ticket
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Ticket Details Modal */}
        {showDetailsModal && selectedTicket && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-bold">Ticket #{selectedTicket.id}</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Created: {new Date(selectedTicket.createdAt).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedTicket(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <div>{getStatusBadge(selectedTicket.status)}</div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Container</label>
                  <p className="text-sm text-gray-900">
                    {selectedTicket.container?.name || 'N/A'}
                    {selectedTicket.container?.imageName && (
                      <span className="text-gray-500"> ({selectedTicket.container.imageName})</span>
                    )}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">
                      {selectedTicket.deskripsi}
                    </p>
                  </div>
                </div>

                {selectedTicket.status === 'closed' && (
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex">
                      <CheckCircleIcon className="h-5 w-5 text-green-400" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-green-800">Ticket Resolved</h3>
                        <p className="mt-1 text-sm text-green-700">
                          This ticket has been closed. If you need further assistance, please create a new ticket.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedTicket.status === 'in-progress' && (
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex">
                      <ExclamationCircleIcon className="h-5 w-5 text-blue-400" />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-blue-800">In Progress</h3>
                        <p className="mt-1 text-sm text-blue-700">
                          Our support team is currently working on your issue.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedTicket(null);
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
