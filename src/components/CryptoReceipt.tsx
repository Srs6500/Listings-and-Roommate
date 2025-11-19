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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Receipt Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 p-6 rounded-t-2xl text-white">
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
              <p className="text-blue-100 text-sm">Receipt ID</p>
              <p className="font-mono text-lg">{receiptData.id}</p>
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-sm">Status</p>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(receiptData.status)}`}>
                {receiptData.status.toUpperCase()}
              </div>
            </div>
          </div>
        </div>

        {/* Receipt Content */}
        <div className="p-6 space-y-6">
          {/* Transaction Details */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Zap className="w-4 h-4 mr-2 text-purple-600" />
              Transaction Details
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Transaction Hash</span>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs text-gray-800">
                    {receiptData.transactionHash.slice(0, 12)}...{receiptData.transactionHash.slice(-8)}
                  </span>
                  <button
                    onClick={() => copyToClipboard(receiptData.transactionHash)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Timestamp</span>
                <span className="text-sm text-gray-800">{formatTimestamp(receiptData.timestamp)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">User Address</span>
                <span className="font-mono text-xs text-gray-800">
                  {receiptData.userAddress.slice(0, 8)}...{receiptData.userAddress.slice(-6)}
                </span>
              </div>
            </div>
          </div>

          {/* Property Details */}
          <div className="bg-blue-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-blue-600" />
              Property Details
            </h3>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-gray-900">{property.title}</h4>
                <p className="text-sm text-gray-600">{property.location}, {property.state}</p>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Monthly Rent</span>
                <span className="text-lg font-bold text-blue-600">${property.price.toLocaleString()}</span>
              </div>
              <div className="text-sm text-gray-700">
                <p className="line-clamp-2">{property.description}</p>
              </div>
            </div>
          </div>

          {/* State Laws */}
          {property.stateLaws && (
            <div className="bg-green-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                <FileText className="w-4 h-4 mr-2 text-green-600" />
                {property.state} Rental Laws
              </h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Security Deposit:</span>
                  <span className="text-gray-600 ml-2">{property.stateLaws.securityDeposit}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Notice Period:</span>
                  <span className="text-gray-600 ml-2">{property.stateLaws.noticePeriod}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Eviction Rules:</span>
                  <span className="text-gray-600 ml-2">{property.stateLaws.evictionRules}</span>
                </div>
              </div>
            </div>
          )}

          {/* Questions to Ask */}
          <div className="bg-purple-50 rounded-xl p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Users className="w-4 h-4 mr-2 text-purple-600" />
              Questions to Ask
            </h3>
            <div className="space-y-2 text-sm text-gray-700">
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
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Copy className="w-4 h-4" />
              <span>Copy Receipt ID</span>
            </button>
            <button
              onClick={() => window.open(`https://etherscan.io/tx/${receiptData.transactionHash}`, '_blank')}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>View on Etherscan</span>
            </button>
          </div>

          {/* Status Message */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800">Request Pending</p>
                <p className="text-sm text-yellow-700">
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
