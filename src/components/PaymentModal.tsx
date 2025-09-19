'use client';

import { useState, useEffect } from 'react';
import { useWeb3 } from '@/context/Web3Context';
import { contractService } from '@/lib/contract';
import { X, Wallet, CreditCard, Shield, Clock, CheckCircle } from 'lucide-react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: {
    id?: string;
    title?: string;
    price?: number;
    location?: string;
    state?: string;
  };
  onPaymentSuccess: () => void;
}

export default function PaymentModal({ isOpen, onClose, listing, onPaymentSuccess }: PaymentModalProps) {
  const { isConnected, account, signer } = useWeb3();
  const [paymentMethod, setPaymentMethod] = useState<'crypto' | 'traditional'>('crypto');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'method' | 'confirm' | 'processing' | 'success'>('method');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setPaymentStep('method');
      setError(null);
    }
  }, [isOpen]);

  const handleCryptoPayment = async () => {
    if (!isConnected || !signer) {
      setError('Please connect your wallet first');
      return;
    }

    try {
      setIsProcessing(true);
      setPaymentStep('processing');
      setError(null);

      // Initialize contract service
      await contractService.initialize(signer);

      // For demo purposes, we'll simulate a payment
      // In a real app, you would call the actual smart contract methods
      await new Promise(resolve => setTimeout(resolve, 2000));

      setPaymentStep('success');
      onPaymentSuccess();
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.');
      setPaymentStep('method');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTraditionalPayment = () => {
    // Redirect to traditional payment processor
    alert('Traditional payment integration coming soon!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Complete Payment</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Property Info */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">{listing.title || 'Property'}</h3>
            <p className="text-sm text-gray-600 mb-2">{listing.location || 'Location'}, {listing.state || 'State'}</p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-blue-600">${(listing.price || 0).toLocaleString()}</span>
              <span className="text-sm text-gray-500">/month</span>
            </div>
          </div>

          {/* Payment Steps */}
          {paymentStep === 'method' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 mb-4">Choose Payment Method</h3>
              
              {/* Crypto Payment Option */}
              <div
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                  paymentMethod === 'crypto'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setPaymentMethod('crypto')}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    paymentMethod === 'crypto'
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {paymentMethod === 'crypto' && (
                      <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                    )}
                  </div>
                  <Wallet className="w-6 h-6 text-blue-600" />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">Cryptocurrency Payment</h4>
                    <p className="text-sm text-gray-600">Pay with ETH using MetaMask</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center space-x-1 text-xs text-green-600">
                        <Shield className="w-3 h-3" />
                        <span>Secure</span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-blue-600">
                        <Clock className="w-3 h-3" />
                        <span>Instant</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Traditional Payment Option */}
              <div
                className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                  paymentMethod === 'traditional'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => setPaymentMethod('traditional')}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full border-2 ${
                    paymentMethod === 'traditional'
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {paymentMethod === 'traditional' && (
                      <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                    )}
                  </div>
                  <CreditCard className="w-6 h-6 text-gray-600" />
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">Traditional Payment</h4>
                    <p className="text-sm text-gray-600">Credit card or bank transfer</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>2-3 days</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <button
                onClick={paymentMethod === 'crypto' ? handleCryptoPayment : handleTraditionalPayment}
                disabled={!isConnected && paymentMethod === 'crypto'}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {paymentMethod === 'crypto' && !isConnected
                  ? 'Connect Wallet First'
                  : `Pay $${(listing.price || 0).toLocaleString()}`
                }
              </button>
            </div>
          )}

          {paymentStep === 'processing' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Payment</h3>
              <p className="text-gray-600">Please wait while we process your payment...</p>
            </div>
          )}

          {paymentStep === 'success' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Successful!</h3>
              <p className="text-gray-600 mb-6">Your payment has been processed successfully.</p>
              <button
                onClick={onClose}
                className="w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors duration-200"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
