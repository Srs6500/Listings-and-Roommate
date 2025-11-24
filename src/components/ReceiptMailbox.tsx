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
      const queryLower = searchQuery.toLowerCase();
      filtered = filtered.filter(receipt =>
        (receipt.property?.title || '').toLowerCase().includes(queryLower) ||
        (receipt.property?.location || '').toLowerCase().includes(queryLower) ||
        (receipt.id || '').toLowerCase().includes(queryLower)
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(receipt => receipt.status === statusFilter);
    }

    // Sort receipts for left-to-right display (newest/A/lowest on left)
    // Note: Array is sorted so first item appears on left in grid
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          // Newest first (leftmost) - newer items (larger timestamp) should be at index 0
          // If currently on right, reverse: put smaller timestamps first, then reverse array
          return a.timestamp - b.timestamp;
        case 'oldest':
          // Oldest first (leftmost) - older items (smaller timestamp) should be at index 0
          // If currently on right, reverse: put larger timestamps first, then reverse array
          return b.timestamp - a.timestamp;
        case 'price':
          // High to Low (highest first, leftmost) - higher prices should be at index 0
          // If currently on right, reverse: put smaller prices first, then reverse array
          return a.property.price - b.property.price;
        case 'price-low':
          // Low to High (lowest first, leftmost) - lower prices should be at index 0
          // If currently on right, reverse: put larger prices first, then reverse array
          return b.property.price - a.property.price;
        case 'name':
          // A-Z (A first, leftmost) - A should be at index 0
          // If currently on right, reverse: put Z first, then reverse array
          return b.property.title.localeCompare(a.property.title);
        default:
          return a.timestamp - b.timestamp;
      }
    });

    // Reverse the sorted array to fix left-to-right display
    // This ensures the "first" item in sort order appears on the left
    filtered.reverse();

    setFilteredReceipts(filtered);
  }, [receipts, searchQuery, statusFilter, sortBy]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" style={{ color: 'var(--warning)' }} />;
      case 'approved': return <CheckCircle className="w-4 h-4" style={{ color: 'var(--success)' }} />;
      case 'rejected': return <XCircle className="w-4 h-4" style={{ color: 'var(--error)' }} />;
      default: return <Clock className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return { backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)' };
      case 'approved': return { backgroundColor: 'rgba(34, 197, 94, 0.1)', color: 'var(--success)' };
      case 'rejected': return { backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)' };
      default: return { backgroundColor: 'var(--surface-primary)', color: 'var(--text-secondary)' };
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
          <h2 className="text-2xl font-bold flex items-center" style={{ color: 'var(--text-primary)' }}>
            <Receipt className="w-6 h-6 mr-2" style={{ color: 'var(--accent-primary)' }} />
            Property Receipts
          </h2>
          <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
            {filteredReceipts.length} receipt{filteredReceipts.length !== 1 ? 's' : ''} found
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div 
        className="rounded-xl shadow-lg border p-4"
        style={{ 
          backgroundColor: 'var(--surface-primary)', 
          borderColor: 'var(--border-default)'
        }}
      >
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search receipts by property name, location, or receipt ID..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:outline-none transition-all"
              style={{
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border-default)',
                color: 'var(--text-primary)'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-primary)';
                e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-light)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-default)';
                e.currentTarget.style.boxShadow = 'none';
              }}
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
                className="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                style={{
                  backgroundColor: statusFilter === key
                    ? 'var(--accent-primary)'
                    : 'var(--surface-secondary)',
                  color: statusFilter === key
                    ? 'var(--text-primary)'
                    : 'var(--text-secondary)'
                }}
                onMouseEnter={(e) => {
                  if (statusFilter !== key) {
                    e.currentTarget.style.backgroundColor = 'var(--surface-elevated)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (statusFilter !== key) {
                    e.currentTarget.style.backgroundColor = 'var(--surface-secondary)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                {label} ({count})
              </button>
            ))}
          </div>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:outline-none transition-all"
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border-default)',
              color: 'var(--text-primary)'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--accent-primary)';
              e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-light)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--border-default)';
              e.currentTarget.style.boxShadow = 'none';
            }}
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
              className="rounded-xl shadow-lg border p-4 hover:shadow-xl transition-all duration-200 cursor-pointer group"
              style={{ 
                backgroundColor: 'var(--surface-secondary)', 
                borderColor: 'var(--border-default)'
              }}
            >
              {/* Receipt Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getStatusIcon(receipt.status)}
                  <span 
                    className="px-2 py-1 rounded-full text-xs font-medium"
                    style={getStatusColor(receipt.status)}
                  >
                    {receipt.status.toUpperCase()}
                  </span>
                </div>
                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(receipt.timestamp)}</span>
              </div>

              {/* Property Info */}
              <div className="space-y-2 mb-4">
                <h3 
                  className="font-semibold transition-colors"
                  style={{ color: 'var(--text-primary)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                >
                  {receipt.property.title}
                </h3>
                <div className="flex items-center text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{receipt.property.location}, {receipt.property.state}</span>
                </div>
                <div className="flex items-center text-lg font-bold" style={{ color: 'var(--accent-primary)' }}>
                  <DollarSign className="w-4 h-4 mr-1" />
                  <span>{receipt.property.price.toLocaleString()}/mo</span>
                </div>
              </div>

              {/* Receipt ID */}
              <div 
                className="rounded-lg p-3"
                style={{ backgroundColor: 'var(--surface-primary)' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Receipt ID</p>
                    <p className="font-mono text-sm" style={{ color: 'var(--text-primary)' }}>{receipt.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Transaction</p>
                    <p className="font-mono text-xs" style={{ color: 'var(--text-secondary)' }}>
                      {receipt.transactionHash.slice(0, 8)}...{receipt.transactionHash.slice(-6)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Indicator */}
              <div className="mt-3 pt-3" style={{ borderTopColor: 'var(--border-default)' }}>
                <div className="flex items-center justify-between text-sm">
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {receipt.status === 'pending' && 'Waiting for owner response'}
                    {receipt.status === 'approved' && 'Request approved - Chat available'}
                    {receipt.status === 'rejected' && 'Request declined'}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span 
                      className="font-medium transition-colors"
                      style={{ color: 'var(--accent-primary)' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-hover)'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'var(--accent-primary)'}
                    >
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
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: 'var(--surface-secondary)' }}
          >
            <Receipt className="w-8 h-8" style={{ color: 'var(--text-muted)' }} />
          </div>
          <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>No receipts found</h3>
          <p style={{ color: 'var(--text-secondary)' }}>
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
