'use client';

import { useState, useEffect } from 'react';
import { Copy, Check, ExternalLink, Shield, Clock, MapPin, DollarSign, FileText, Users, Zap } from 'lucide-react';

interface Property {
  id: string;
  title: string;
  location: string;
  state: string;
  price: number;
  image: string;
  description: string;
  stateLaws?: {
    securityDeposit: string;
    noticePeriod: string;
    evictionRules: string;
    rentControl: string;
  };
}

interface CryptoReceiptProps {
  property: Property;
  userAddress: string;
  isOpen: boolean;
  onClose: () => void;
  onSaveToMailbox: (receipt: ReceiptData) => void;
  existingReceipt?: ReceiptData; // For viewing existing receipts
}

interface ReceiptData {
  id: string;
  propertyId: string;
  userAddress: string;
  timestamp: number;
  status: 'pending' | 'approved' | 'rejected';
  transactionHash: string;
  property: Property;
}

export default function CryptoReceipt({ property, userAddress, isOpen, onClose, onSaveToMailbox, existingReceipt }: CryptoReceiptProps) {
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (isOpen && property) {
      if (existingReceipt) {
        // View existing receipt - no duplication
        setReceiptData(existingReceipt);
        setIsGenerating(false);
      } else {
        // Generate new receipt only when creating new request
        generateReceipt();
      }
    }
  }, [isOpen, property, existingReceipt]);

  const generateReceipt = async () => {
    setIsGenerating(true);
    
    // Generate unique receipt data
    const receiptId = generateReceiptId();
    const transactionHash = generateTransactionHash();
    const timestamp = Date.now();
    
    const receipt: ReceiptData = {
      id: receiptId,
      propertyId: property.id || '',
      userAddress,
      timestamp,
      status: 'pending',
      transactionHash,
      property
    };
    
    setReceiptData(receipt);
    setIsGenerating(false);
    
    // Auto-save to mailbox
    onSaveToMailbox(receipt);
  };

  const generateReceiptId = () => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return `PF-${timestamp}-${random}`.toUpperCase();
  };

  const generateTransactionHash = () => {
    const chars = '0123456789abcdef';
    let hash = '0x';
    for (let i = 0; i < 64; i++) {
      hash += chars[Math.floor(Math.random() * chars.length)];
    }
    return hash;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'approved': return 'text-green-600 bg-green-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (!isOpen || !receiptData) return null;

  return (
    <div 
      className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      style={{ backgroundColor: 'rgba(15, 15, 15, 0.8)' }}
    >
      <div 
        className="rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: 'var(--surface-primary)' }}
      >
        {/* Receipt Header */}
        <div 
          className="p-6 rounded-t-2xl"
          style={{ 
            background: 'linear-gradient(135deg, var(--accent-primary) 0%, var(--accent-hover) 100%)',
            color: 'var(--text-primary)'
          }}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold">PropertyFinder Receipt</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90">Receipt ID</p>
              <p className="font-mono text-lg">{receiptData.id}</p>
            </div>
            <div className="text-right">
              <p className="text-sm opacity-90">Status</p>
              <div 
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={{
                  backgroundColor: receiptData.status === 'pending' 
                    ? 'rgba(245, 158, 11, 0.2)' 
                    : receiptData.status === 'approved'
                      ? 'rgba(34, 197, 94, 0.2)'
                      : 'rgba(239, 68, 68, 0.2)',
                  color: receiptData.status === 'pending' 
                    ? 'var(--warning)' 
                    : receiptData.status === 'approved'
                      ? 'var(--success)'
                      : 'var(--error)'
                }}
              >
                {receiptData.status.toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Receipt Content */}
        <div className="p-6 space-y-6" style={{ color: 'var(--text-primary)' }}>
          {/* Transaction Details */}
          <div 
            className="rounded-xl p-4 border"
            style={{ 
              backgroundColor: 'var(--surface-secondary)', 
              borderColor: 'var(--border-default)'
            }}
          >
            <h3 className="font-semibold mb-3 flex items-center" style={{ color: 'var(--text-primary)' }}>
              <Zap className="w-4 h-4 mr-2" style={{ color: 'var(--accent-primary)' }} />
              Transaction Details
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Transaction Hash</span>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs" style={{ color: 'var(--text-primary)' }}>
                    {receiptData.transactionHash.slice(0, 12)}...{receiptData.transactionHash.slice(-8)}
                  </span>
                  <button
                    onClick={() => copyToClipboard(receiptData.transactionHash)}
                    className="transition-colors"
                    style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
                    onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-secondary)'}
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Timestamp</span>
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{formatTimestamp(receiptData.timestamp)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>User Address</span>
                <span className="font-mono text-xs" style={{ color: 'var(--text-primary)' }}>
                  {receiptData.userAddress.slice(0, 8)}...{receiptData.userAddress.slice(-6)}
                </span>
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div 
            className="rounded-xl p-4 border"
            style={{ 
              backgroundColor: 'var(--accent-light)', 
              borderColor: 'var(--border-default)'
            }}
          >
            <h3 className="font-semibold mb-3 flex items-center" style={{ color: 'var(--text-primary)' }}>
              <MapPin className="w-4 h-4 mr-2" style={{ color: 'var(--accent-primary)' }} />
              Property Details
            </h3>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium" style={{ color: 'var(--text-primary)' }}>{property.title}</h4>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{property.location}, {property.state}</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Monthly Rent</span>
                <span className="text-lg font-bold" style={{ color: 'var(--accent-primary)' }}>${property.price.toLocaleString()}</span>
              </div>
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                <p className="line-clamp-2">{property.description}</p>
              </div>
            </div>
          </div>

          {/* State Laws */}
          {property.stateLaws && (
            <div 
              className="rounded-xl p-4 border"
              style={{ 
                backgroundColor: 'rgba(34, 197, 94, 0.1)', 
                borderColor: 'var(--success)'
              }}
            >
              <h3 className="font-semibold mb-3 flex items-center" style={{ color: 'var(--text-primary)' }}>
                <FileText className="w-4 h-4 mr-2" style={{ color: 'var(--success)' }} />
                {property.state} Rental Laws
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Security Deposit:</span>
                  <span className="ml-2" style={{ color: 'var(--text-secondary)' }}>{property.stateLaws.securityDeposit}</span>
                </div>
                <div>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Notice Period:</span>
                  <span className="ml-2" style={{ color: 'var(--text-secondary)' }}>{property.stateLaws.noticePeriod}</span>
                </div>
                <div>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Eviction Rules:</span>
                  <span className="ml-2" style={{ color: 'var(--text-secondary)' }}>{property.stateLaws.evictionRules}</span>
                </div>
              </div>
            </div>
          )}

          {/* Questions to Ask */}
          <div 
            className="rounded-xl p-4 border"
            style={{ 
              backgroundColor: 'var(--surface-secondary)', 
              borderColor: 'var(--border-default)'
            }}
          >
            <h3 className="font-semibold mb-3 flex items-center" style={{ color: 'var(--text-primary)' }}>
              <Users className="w-4 h-4 mr-2" style={{ color: 'var(--accent-primary)' }} />
              Questions to Ask
            </h3>
            <div className="space-y-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
              <p>• What's included in the rent (utilities, parking, etc.)?</p>
              <p>• Are pets allowed?</p>
              <p>• What's the neighborhood like?</p>
              <p>• How close is public transportation?</p>
              <p>• Are there any additional fees or deposits?</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={() => copyToClipboard(receiptData.id)}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-colors"
              style={{ 
                backgroundColor: 'var(--surface-secondary)', 
                color: 'var(--text-primary)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-elevated)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-secondary)'}
            >
              <Copy className="w-4 h-4" />
              <span>Copy Receipt ID</span>
            </button>
            <button
              onClick={() => window.open(`https://etherscan.io/tx/${receiptData.transactionHash}`, '_blank')}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-colors"
              style={{ 
                backgroundColor: 'var(--accent-primary)', 
                color: 'var(--text-primary)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-primary)'}
            >
              <ExternalLink className="w-4 h-4" />
              <span>View on Etherscan</span>
            </button>
          </div>

          {/* Status Message */}
          <div 
            className="border rounded-lg p-4"
            style={{ 
              backgroundColor: 'rgba(245, 158, 11, 0.1)', 
              borderColor: 'var(--warning)'
            }}
          >
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5" style={{ color: 'var(--warning)' }} />
              <div>
                <p className="font-medium" style={{ color: 'var(--warning)' }}>Request Pending</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Your request has been sent to the property owner. You'll be notified when they respond.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
