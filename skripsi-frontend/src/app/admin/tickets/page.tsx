'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ticketApi, containerApi } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import DashboardLayout from '@/components/layout/DashboardLayout';
import toast from 'react-hot-toast';
import { 
  TicketIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  ChatBubbleBottomCenterTextIcon,
  ServerIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

interface Ticket {
  id: number;
  deskripsi: string;
  status: string;
  containerId: number | null;
  container?: {
    id: number;
    name: string;
    user: {
      id: number;
      email: string;
      fullName: string;
      noHp?: string; // phone
    };
  } | null;
}

export default function AdminTicketsPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'in_progress' | 'resolved' | 'closed'>('all');

  useEffect(() => {
    if (user === null) return; // wait for hydration
    if (!user?.isAdmin) {
      router.push('/login');
      return;
    }
    fetchTickets();
  }, [user, router]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await ticketApi.getAllTickets();
      setTickets(response.data.data || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (ticketId: number, newStatus: string) => {
    try {
      await ticketApi.updateTicketStatus(ticketId, newStatus);
      toast.success('Ticket status updated successfully');
      fetchTickets();
    } catch (error) {
      console.error('Error updating ticket:', error);
      toast.error('Failed to update ticket status');
    }
  };

  const handleResolveTicket = async (ticketId: number) => {
    if (!confirm('Are you sure you want to mark this ticket as resolved?')) return;
    handleUpdateStatus(ticketId, 'resolved');
  };

  const handleCloseTicket = async (ticketId: number) => {
    if (!confirm('Are you sure you want to close this ticket?')) return;
    handleUpdateStatus(ticketId, 'closed');
  };

  const filteredTickets = tickets.filter(ticket => {
    if (filterStatus === 'all') return true;
    return ticket.status === filterStatus;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: {
        color: 'bg-blue-100 text-blue-800',
        icon: ExclamationCircleIcon,
        label: 'Open'
      },
      in_progress: {
        color: 'bg-yellow-100 text-yellow-800',
        icon: ClockIcon,
        label: 'In Progress'
      },
      resolved: {
        color: 'bg-green-100 text-green-800',
        icon: CheckCircleIcon,
        label: 'Resolved'
      },
      closed: {
        color: 'bg-gray-100 text-gray-800',
        icon: XCircleIcon,
        label: 'Closed'
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.open;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </span>
    );
  };

  const getPriorityColor = (description: string) => {
    const lowerDesc = description.toLowerCase();
    if (lowerDesc.includes('urgent') || lowerDesc.includes('critical')) {
      return 'text-red-600';
    }
    if (lowerDesc.includes('high')) {
      return 'text-orange-600';
    }
    return 'text-gray-600';
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Tickets Management</h1>
          <p className="text-gray-600">Manage and resolve user support tickets</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                <TicketIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Tickets</p>
                <p className="text-lg font-semibold text-gray-900">{tickets.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                <ExclamationCircleIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Open</p>
                <p className="text-lg font-semibold text-gray-900">
                  {tickets.filter(t => t.status === 'open').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">In Progress</p>
                <p className="text-lg font-semibold text-gray-900">
                  {tickets.filter(t => t.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Resolved</p>
                <p className="text-lg font-semibold text-gray-900">
                  {tickets.filter(t => t.status === 'resolved').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Tickets</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        {/* Tickets Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="text-center py-12">
              <TicketIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No tickets found</h3>
              <p className="mt-1 text-sm text-gray-500">
                No tickets match your current filter
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ticket ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Container
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
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
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        #{ticket.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <ServerIcon className="h-5 w-5 text-gray-400 mr-2" />
                          <div className="text-sm font-medium text-gray-900">
                            {ticket.container ? ticket.container.name : (
                              <span className="text-gray-500 italic">Container Deleted</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {ticket.container?.user?.fullName || (
                              <span className="text-gray-500 italic">N/A</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {ticket.container?.user?.email || (
                              <span className="italic">No container data</span>
                            )}
                          </div>
                          {ticket.container?.user?.noHp && (
                            <div className="text-sm text-gray-500">
                              Phone: {ticket.container.user.noHp}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`text-sm max-w-xs ${getPriorityColor(ticket.deskripsi)}`}>
                          <ChatBubbleBottomCenterTextIcon className="h-4 w-4 inline-block mr-1" />
                          {ticket.deskripsi}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(ticket.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          {ticket.status === 'open' && (
                            <button
                              onClick={() => handleUpdateStatus(ticket.id, 'in_progress')}
                              className="text-yellow-600 hover:text-yellow-900"
                              title="Start Progress"
                            >
                              <ClockIcon className="h-5 w-5" />
                            </button>
                          )}
                          {(ticket.status === 'open' || ticket.status === 'in_progress') && (
                            <>
                              <button
                                onClick={() => handleResolveTicket(ticket.id)}
                                className="text-green-600 hover:text-green-900"
                                title="Mark as Resolved"
                              >
                                <CheckCircleIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => handleCloseTicket(ticket.id)}
                                className="text-gray-600 hover:text-gray-900"
                                title="Close Ticket"
                              >
                                <XCircleIcon className="h-5 w-5" />
                              </button>
                            </>
                          )}
                          {ticket.status === 'resolved' && (
                            <button
                              onClick={() => handleCloseTicket(ticket.id)}
                              className="text-gray-600 hover:text-gray-900"
                              title="Close Ticket"
                            >
                              <XCircleIcon className="h-5 w-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
