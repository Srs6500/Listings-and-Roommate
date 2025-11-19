'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  MessageCircle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  Calendar,
  Send,
  Eye,
  AlertCircle
} from 'lucide-react';

interface PropertyRequest {
  id: string;
  propertyId: string;
  propertyTitle: string;
  requesterId: string;
  requesterName: string;
  requesterEmail: string;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  status: 'pending' | 'approved' | 'rejected';
  message: string;
  requestedAt: any;
  respondedAt?: any;
  responseMessage?: string;
  chatEnabled: boolean;
  chatRoomId?: string;
}

interface PropertyRequestSystemProps {
  property: {
    id: string;
    title: string;
    uploadedBy: string;
    type: 'api' | 'community';
    fakeUser?: {
      name: string;
      avatar: string;
      initials: string;
      personality?: string;
      interests?: string[];
    };
  };
  onRequestSent?: (request: PropertyRequest) => void;
  onRequestApproved?: (request: PropertyRequest) => void;
  className?: string;
}

export default function PropertyRequestSystem({ 
  property, 
  onRequestSent, 
  onRequestApproved,
  className = '' 
}: PropertyRequestSystemProps) {
  const { user } = useAuth();
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestMessage, setRequestMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingRequest, setExistingRequest] = useState<PropertyRequest | null>(null);
  const [ownerRequests, setOwnerRequests] = useState<PropertyRequest[]>([]);
  const [showOwnerPanel, setShowOwnerPanel] = useState(false);

  // Check if user is the property owner
  const isOwner = user?.uid === property.uploadedBy;

  useEffect(() => {
    if (user) {
      if (isOwner) {
        loadOwnerRequests();
      } else {
        checkExistingRequest();
      }
    }
  }, [user, property.id, isOwner]);

  const checkExistingRequest = async () => {
    if (!user) return;

    try {
      const requestsRef = collection(db, 'propertyRequests');
      const q = query(
        requestsRef,
        where('propertyId', '==', property.id),
        where('requesterId', '==', user.uid)
      );
      
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const request = snapshot.docs[0].data() as PropertyRequest;
        setExistingRequest({ ...request, id: snapshot.docs[0].id });
      }
    } catch (error) {
      console.error('Error checking existing request:', error);
    }
  };

  const loadOwnerRequests = async () => {
    if (!user) return;

    try {
      const requestsRef = collection(db, 'propertyRequests');
      const q = query(
        requestsRef,
        where('propertyId', '==', property.id),
        where('ownerId', '==', user.uid),
        orderBy('requestedAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PropertyRequest[];
      
      setOwnerRequests(requests);
    } catch (error) {
      console.error('Error loading owner requests:', error);
    }
  };

  const submitRequest = async () => {
    if (!user || !requestMessage.trim()) return;

    setIsSubmitting(true);
    try {
      const requestData = {
        propertyId: property.id,
        propertyTitle: property.title,
        requesterId: user.uid,
        requesterName: user.displayName || 'Anonymous User',
        requesterEmail: user.email || '',
        ownerId: property.uploadedBy,
        ownerName: 'Property Owner', // Would need to fetch from user profile
        ownerEmail: 'owner@example.com', // Would need to fetch from user profile
        status: 'pending',
        message: requestMessage.trim(),
        requestedAt: serverTimestamp(),
        chatEnabled: false
      };

      const docRef = await addDoc(collection(db, 'propertyRequests'), requestData);
      const newRequest = { id: docRef.id, ...requestData } as PropertyRequest;
      
      setExistingRequest(newRequest);
      setShowRequestForm(false);
      setRequestMessage('');
      
      if (onRequestSent) {
        onRequestSent(newRequest);
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      alert('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const respondToRequest = async (requestId: string, status: 'approved' | 'rejected', responseMessage?: string) => {
    try {
      const requestRef = doc(db, 'propertyRequests', requestId);
      await updateDoc(requestRef, {
        status,
        responseMessage: responseMessage || '',
        respondedAt: serverTimestamp(),
        chatEnabled: status === 'approved'
      });

      // Update local state
      setOwnerRequests(prev => 
        prev.map(req => 
          req.id === requestId 
            ? { ...req, status, responseMessage, respondedAt: new Date() }
            : req
        )
      );

      if (status === 'approved' && onRequestApproved) {
        const approvedRequest = ownerRequests.find(req => req.id === requestId);
        if (approvedRequest) {
          onRequestApproved({ ...approvedRequest, status, responseMessage });
        }
      }
    } catch (error) {
      console.error('Error responding to request:', error);
      alert('Failed to respond to request. Please try again.');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!user) {
    return (
      <div className={`p-4 bg-gray-50 rounded-lg border border-gray-200 ${className}`}>
        <p className="text-gray-600 text-center">Please sign in to request property access</p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Request Button for Non-Owners */}
      {!isOwner && (
        <div className="space-y-3">
          {!existingRequest ? (
            <button
              onClick={() => setShowRequestForm(true)}
              className="w-full py-3 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Request Property Access</span>
            </button>
          ) : (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">Your Request Status</h4>
                {getStatusIcon(existingRequest.status)}
              </div>
              <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(existingRequest.status)}`}>
                {existingRequest.status.charAt(0).toUpperCase() + existingRequest.status.slice(1)}
              </div>
              {existingRequest.responseMessage && (
                <p className="mt-2 text-sm text-gray-600">
                  <strong>Owner Response:</strong> {existingRequest.responseMessage}
                </p>
              )}
              {existingRequest.status === 'approved' && existingRequest.chatEnabled && (
                <button className="mt-3 w-full py-2 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2">
                  <MessageCircle className="w-4 h-4" />
                  <span>Start Chat</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Owner Panel */}
      {isOwner && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-gray-900">Property Requests</h4>
            <button
              onClick={() => setShowOwnerPanel(!showOwnerPanel)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              {showOwnerPanel ? 'Hide' : 'View'} ({ownerRequests.length})
            </button>
          </div>

          {showOwnerPanel && (
            <div className="space-y-3">
              {ownerRequests.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">No requests yet</p>
              ) : (
                ownerRequests.map((request) => (
                  <div key={request.id} className="p-4 bg-white rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <User className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{request.requesterName}</p>
                          <p className="text-sm text-gray-500">{request.requesterEmail}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(request.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-sm text-gray-700">
                        <strong>Message:</strong> {request.message}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-3 h-3" />
                        <span>Requested {new Date(request.requestedAt?.toDate?.() || request.requestedAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {request.status === 'pending' && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => respondToRequest(request.id, 'approved', 'Welcome! You can now chat about the property details.')}
                          className="flex-1 py-2 px-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => respondToRequest(request.id, 'rejected', 'Thank you for your interest, but this property is no longer available.')}
                          className="flex-1 py-2 px-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                        >
                          Reject
                        </button>
                      </div>
                    )}

                    {request.status === 'approved' && request.chatEnabled && (
                      <button className="w-full py-2 px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center space-x-2">
                        <MessageCircle className="w-4 h-4" />
                        <span>Open Chat</span>
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Request Form Modal */}
      {showRequestForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Request Property Access</h3>
            
            {/* Property Owner Info */}
            {property.fakeUser && (
              <div className="flex items-center space-x-3 mb-4 p-3 bg-gray-50 rounded-lg">
                <div className={`w-10 h-10 rounded-full ${property.fakeUser.avatar} flex items-center justify-center text-white text-sm font-semibold`}>
                  {property.fakeUser.initials}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">Contacting {property.fakeUser.name}</div>
                  {property.fakeUser.personality && (
                    <div className="text-sm text-gray-600">{property.fakeUser.personality}</div>
                  )}
                  {property.fakeUser.interests && property.fakeUser.interests.length > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      Interests: {property.fakeUser.interests.slice(0, 3).join(', ')}
                      {property.fakeUser.interests.length > 3 && '...'}
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <p className="text-sm text-gray-600 mb-4">
              Send a message to the property owner to request access and start a conversation.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Message
                </label>
                <textarea
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  placeholder="Tell the owner why you're interested in this property..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={4}
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowRequestForm(false)}
                className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitRequest}
                disabled={!requestMessage.trim() || isSubmitting}
                className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Request</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
