'use client';

import { useState, useEffect } from 'react';
import { Receipt, Clock, CheckCircle, XCircle, MapPin, DollarSign, Calendar, Filter, Search } from 'lucide-react';

interface ReceiptData {
  id: string;
  propertyId: string;
  userAddress: string;
  timestamp: number;
  status: 'pending' | 'approved' | 'rejected';
  transactionHash: string;
  property: {
    id: string;
    title: string;
    location: string;
    state: string;
    price: number;
    image: string;
    description: string;
  };
}

interface ReceiptMailboxProps {
  receipts: ReceiptData[];
  onReceiptClick: (receipt: ReceiptData) => void;
  onRemoveReceipt?: (receiptId: string) => void;
  className?: string;
}

export default function ReceiptMailbox({ receipts, onReceiptClick, onRemoveReceipt, className = '' }: ReceiptMailboxProps) {
  const [filteredReceipts, setFilteredReceipts] = useState<ReceiptData[]>(receipts);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'price' | 'price-low' | 'name'>('newest');

  useEffect(() => {
    let filtered = receipts;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(receipt =>
        receipt.property.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        receipt.property.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        receipt.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(receipt => receipt.status === statusFilter);
    }

    // Sort receipts
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.timestamp - a.timestamp; // Newest first (leftmost)
        case 'oldest':
          return a.timestamp - b.timestamp; // Oldest first (leftmost)
        case 'price':
          return b.property.price - a.property.price; // High to Low (highest first)
        case 'price-low':
          return a.property.price - b.property.price; // Low to High (lowest first)
        case 'name':
          return a.property.title.localeCompare(b.property.title); // A-Z (A first)
        default:
          return b.timestamp - a.timestamp;
      }
    });

    setFilteredReceipts(filtered);
  }, [receipts, searchQuery, statusFilter, sortBy]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getStatusCounts = () => {
    const counts = {
      all: receipts.length,
      pending: receipts.filter(r => r.status === 'pending').length,
      approved: receipts.filter(r => r.status === 'approved').length,
      rejected: receipts.filter(r => r.status === 'rejected').length
    };
    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Receipt className="w-6 h-6 mr-2 text-blue-600" />
            Property Receipts
          </h2>
          <p className="text-gray-600 mt-1">
            {filteredReceipts.length} receipt{filteredReceipts.length !== 1 ? 's' : ''} found
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search receipts by property name, location, or receipt ID..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="flex space-x-2">
            {[
              { key: 'all', label: 'All', count: statusCounts.all },
              { key: 'pending', label: 'Pending', count: statusCounts.pending },
              { key: 'approved', label: 'Approved', count: statusCounts.approved },
              { key: 'rejected', label: 'Rejected', count: statusCounts.rejected }
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key as any)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price">Price High to Low</option>
            <option value="price-low">Price Low to High</option>
            <option value="name">Property Name A-Z</option>
          </select>
        </div>
      </div>

      {/* Receipts Grid */}
      {filteredReceipts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReceipts.map((receipt) => (
            <div
              key={receipt.id}
              onClick={() => onReceiptClick(receipt)}
              className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 hover:shadow-xl transition-all duration-200 cursor-pointer group"
            >
              {/* Receipt Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(receipt.status)}
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(receipt.status)}`}>
                    {receipt.status.toUpperCase()}
                  </span>
                </div>
                <span className="text-xs text-gray-500">{formatDate(receipt.timestamp)}</span>
              </div>

              {/* Property Info */}
              <div className="space-y-2 mb-4">
                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {receipt.property.title}
                </h3>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{receipt.property.location}, {receipt.property.state}</span>
                </div>
                <div className="flex items-center text-lg font-bold text-blue-600">
                  <DollarSign className="w-4 h-4 mr-1" />
                  <span>{receipt.property.price.toLocaleString()}/mo</span>
                </div>
              </div>

              {/* Receipt ID */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Receipt ID</p>
                    <p className="font-mono text-sm text-gray-800">{receipt.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Transaction</p>
                    <p className="font-mono text-xs text-gray-600">
                      {receipt.transactionHash.slice(0, 8)}...{receipt.transactionHash.slice(-6)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Indicator */}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    {receipt.status === 'pending' && 'Waiting for owner response'}
                    {receipt.status === 'approved' && 'Request approved - Chat available'}
                    {receipt.status === 'rejected' && 'Request declined'}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className="text-blue-600 group-hover:text-blue-700 font-medium">
                      View Details →
                    </span>
                    {onRemoveReceipt && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveReceipt(receipt.id);
                        }}
                        className="text-red-500 hover:text-red-700 font-medium text-xs px-2 py-1 rounded hover:bg-red-50 transition-colors"
                        title="Remove receipt"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Receipt className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No receipts found</h3>
          <p className="text-gray-600">
            {searchQuery || statusFilter !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Start by clicking "Rent Now" on any property to generate your first receipt'
            }
          </p>
        </div>
      )}
    </div>
  );
}
