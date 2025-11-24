'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  DollarSign,
  Eye,
  MessageCircle,
  Calendar
} from 'lucide-react';

interface PropertyRequest {
  id: string;
  propertyId: string;
  propertyTitle: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  requesterPhone?: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date | string;
  updatedAt: Date | string;
  receiptId?: string;
  transactionHash?: string;
}

interface PropertyOwnerDashboardProps {
  className?: string;
}

export default function PropertyOwnerDashboard({ className = '' }: PropertyOwnerDashboardProps) {
  const { user } = useAuth();
  const [requests, setRequests] = useState<PropertyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<PropertyRequest | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    const loadRequests = async () => {
      try {
        const { data, error } = await supabase
          .from('property_requests')
          .select('*')
          .eq('owner_id', user.id)
          .order('requested_at', { ascending: false });
        
        if (error) {
          console.error('Error loading requests:', error);
          setLoading(false);
          return;
        }
        
        if (data) {
          // Transform Supabase data to PropertyRequest format
          const requests = data.map((req: any) => ({
            id: req.id,
            propertyId: req.property_id,
            propertyTitle: req.property_title,
            requesterId: req.requester_id,
            requesterName: req.requester_name,
            requesterEmail: req.requester_email,
            requesterPhone: req.requester_phone,
            message: req.message || '',
            status: req.status,
            createdAt: req.requested_at ? new Date(req.requested_at) : new Date(),
            updatedAt: req.responded_at ? new Date(req.responded_at) : new Date(),
            receiptId: req.receipt_id,
            transactionHash: req.transaction_hash
          })) as PropertyRequest[];
          
          setRequests(requests);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading requests:', error);
        setLoading(false);
      }
    };

    loadRequests();

    // Set up real-time subscription
    const subscription = supabase
      .channel('property_owner_requests')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'property_requests',
          filter: `owner_id=eq.${user.id}`
        },
        () => {
          loadRequests(); // Reload when changes occur
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const handleApproveRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('property_requests')
        .update({
          status: 'approved',
          responded_at: new Date().toISOString(),
          chat_enabled: true
        })
        .eq('id', requestId);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'approved', updatedAt: new Date() }
          : req
      ));
      
      // Send notification to requester
      await sendNotification(requestId, 'approved');
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      const { error } = await supabase
        .from('property_requests')
        .update({
          status: 'rejected',
          responded_at: new Date().toISOString()
        })
        .eq('id', requestId);
      
      if (error) {
        throw error;
      }
      
      // Update local state
      setRequests(prev => prev.map(req => 
        req.id === requestId 
          ? { ...req, status: 'rejected', updatedAt: new Date() }
          : req
      ));
      
      // Send notification to requester
      await sendNotification(requestId, 'rejected');
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  const sendNotification = async (requestId: string, status: 'approved' | 'rejected') => {
    // This would integrate with your notification system
    console.log(`Notification sent for request ${requestId}: ${status}`);
  };

  const filteredRequests = requests.filter(request => {
    if (filter === 'all') return true;
    return request.status === filter;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl shadow-lg ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Property Requests</h2>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Total: {requests.length}</span>
            <span className="text-sm text-yellow-600">Pending: {requests.filter(r => r.status === 'pending').length}</span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mt-4 flex space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { key: 'all', label: 'All Requests' },
            { key: 'pending', label: 'Pending' },
            { key: 'approved', label: 'Approved' },
            { key: 'rejected', label: 'Rejected' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                filter === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      <div className="divide-y divide-gray-200">
        {filteredRequests.length === 0 ? (
          <div className="p-8 text-center">
            <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? "You haven't received any property requests yet."
                : `No ${filter} requests found.`
              }
            </p>
          </div>
        ) : (
          filteredRequests.map(request => (
            <div key={request.id} className="p-6 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    {getStatusIcon(request.status)}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {request.propertyTitle}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Request from {request.requesterName}
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      <span>{request.requesterName}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>{request.requesterEmail}</span>
                    </div>
                    {request.requesterPhone && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Phone className="w-4 h-4" />
                        <span>{request.requesterPhone}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{request.createdAt instanceof Date ? request.createdAt.toLocaleDateString() : new Date(request.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {request.message && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-4">
                      <p className="text-sm text-gray-700">
                        <strong>Message:</strong> {request.message}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    {request.receiptId && (
                      <>
                        <span>Receipt ID: {request.receiptId}</span>
                        <span>•</span>
                      </>
                    )}
                    {request.transactionHash && (
                      <span>Transaction: {request.transactionHash.slice(0, 10)}...</span>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {request.status === 'pending' && (
                  <div className="flex flex-col space-y-2 ml-4">
                    <button
                      onClick={() => handleApproveRequest(request.id)}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleRejectRequest(request.id)}
                      className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                    <button
                      onClick={() => setSelectedRequest(request)}
                      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </button>
                  </div>
                )}

                {request.status !== 'pending' && (
                  <div className="flex flex-col space-y-2 ml-4">
                    <button
                      onClick={() => setSelectedRequest(request)}
                      className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </button>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      <span>Message</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Request Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Request Details</h3>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Property Information</h4>
                  <p className="text-gray-700">{selectedRequest.propertyTitle}</p>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Requester Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Name</p>
                      <p className="text-gray-900">{selectedRequest.requesterName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Email</p>
                      <p className="text-gray-900">{selectedRequest.requesterEmail}</p>
                    </div>
                    {selectedRequest.requesterPhone && (
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="text-gray-900">{selectedRequest.requesterPhone}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-600">Request Date</p>
                      <p className="text-gray-900">{selectedRequest.createdAt instanceof Date ? selectedRequest.createdAt.toLocaleString() : new Date(selectedRequest.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {selectedRequest.message && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Message</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700">{selectedRequest.message}</p>
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Transaction Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Receipt ID</p>
                      <p className="text-gray-900 font-mono text-sm">{selectedRequest.receiptId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Transaction Hash</p>
                      <p className="text-gray-900 font-mono text-sm">{selectedRequest.transactionHash}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(selectedRequest.status)}
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedRequest.status)}`}>
                      {selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1)}
                    </span>
                  </div>
                  
                  {selectedRequest.status === 'pending' && (
                    <div className="flex space-x-3">
                      <button
                        onClick={() => {
                          handleApproveRequest(selectedRequest.id);
                          setSelectedRequest(null);
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Approve Request
                      </button>
                      <button
                        onClick={() => {
                          handleRejectRequest(selectedRequest.id);
                          setSelectedRequest(null);
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Reject Request
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
