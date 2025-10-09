'use client';

import { useState, useEffect } from 'react';
import { CreditCard, ApplePay, GooglePay, PaymentForm } from "react-square-web-payments-sdk";
import OrderSummaryDropdown from '@/Components/CheckOutDropDown';
import { isShopOpen, getShopStatus } from '@/lib/businessHours';

export default function Checkout() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState('idle'); // 'idle', 'processing', 'success', 'error'
  const [paymentResult, setPaymentResult] = useState(null);
  const [paymentError, setPaymentError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTip, setSelectedTip] = useState(null); 
  const [customTip, setCustomTip] = useState('');
  
  // New states for customer info and payment method
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('online'); // 'online' or 'instore'
  const [nameError, setNameError] = useState('');

  const shopStatus = getShopStatus();

  const appId = process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID;
  const locationId = NEXT_PUBLIC_SQUARE_LOCATION_ID;

  // Load cart items from localStorage on component mount
  useEffect(() => {
    const loadCart = () => {
      try {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          setCartItems(JSON.parse(savedCart));
        }
      } catch (error) {
        console.error('Failed to load cart:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadCart();
  }, []);

  // Reset tip when switching to in-store payment
  useEffect(() => {
    if (paymentMethod === 'instore') {
      setSelectedTip(null);
      setCustomTip('');
    }
  }, [paymentMethod]);

  // Calculate subtotal from cart items
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  const subtotal = parseFloat(calculateSubtotal());
  
  const getTipAmount = () => {
    // Only calculate tip for online payments
    if (paymentMethod !== 'online') {
      return 0;
    }
    
    if (selectedTip === 'custom') {
      return parseFloat(customTip) || 0;
    }
    if (selectedTip && subtotal > 0) {
      return +(subtotal * (parseFloat(selectedTip) / 100)).toFixed(2);
    }
    return 0;
  };

  const totalWithTip = (subtotal + getTipAmount()).toFixed(2);
  const amountWithTipCents = Math.round((subtotal + getTipAmount()) * 100);

  // Validate customer name
  const validateName = (name) => {
    if (!name.trim()) {
      return 'Please enter your name for the order';
    }
    if (name.trim().length < 2) {
      return 'Name must be at least 2 characters';
    }
    return '';
  };

  // Handle in-store payment (no actual payment processing)
  const handleInStorePayment = async () => {
    const nameValidationError = validateName(customerName);
    if (nameValidationError) {
      setNameError(nameValidationError);
      return;
    }

    if (!isShopOpen()) {
      setPaymentError("Sorry, we're currently closed and cannot process orders.");
      setPaymentStatus('error');
      return;
    }

    setPaymentStatus('processing');
    setPaymentError(null);
    setNameError('');

    try {
      // Create order without payment processing - use the submit-order endpoint
      console.log("About to make fetch request to /api/submit-order");
      
      const response = await fetch('/api/submit-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          customerName: customerName.trim(),
          paymentMethod: 'instore',
          locationId,
          orderDetails: {
            items: cartItems.map(item => ({
              id: item.id,
              name: item.name,
              size: item.size,
              temperature: item.temperature,
              quantity: item.quantity,
              unitPrice: item.price,
              modifiers: item.modifiers || [],
              specialInstructions: item.specialInstructions || '' 
            }))
          }
        }),
      });
      
      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);
      
      // Check if response is ok first
      if (!response.ok) {
        // Try to get error text first, then parse as JSON if possible
        const errorText = await response.text();
        console.log("Error response text:", errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          // If it's not JSON, use the text as the error message
          throw new Error(`Server error (${response.status}): ${errorText || 'Unknown error'}`);
        }
        
        throw new Error(errorData.message || `Order failed with status: ${response.status}`);
      }
      
      // Try to parse JSON response
      const responseText = await response.text();
      console.log("Success response text:", responseText);
      
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error("Failed to parse JSON:", parseError);
        throw new Error(`Invalid response from server: ${responseText}`);
      }

      setPaymentResult({
        id: result.orderId, // Use orderId as the main ID for consistency
        orderId: result.orderId,
        status: result.status,
        amount: result.totalAmount,
        paymentMethod: 'instore',
        customerName: customerName.trim(),
        orderSummary: result.orderSummary,
        message: result.message
      });
      setPaymentStatus('success');
      
      // Clear cart after successful order
      localStorage.removeItem('cart');
      setCartItems([]);
      
    } catch (error) {
      console.error("Order error:", error);
      setPaymentError(error.message);
      setPaymentStatus('error');
    }
  };

  // Handle Square payment process - works for all payment methods (card, Apple Pay, Google Pay)
  const handleOnlinePayment = async (token, buyer) => {
    const nameValidationError = validateName(customerName);
    if (nameValidationError) {
      setNameError(nameValidationError);
      return;
    }

    if (!isShopOpen()) {
      setPaymentError("Sorry, we're currently closed and cannot process orders.");
      setPaymentStatus('error');
      return;
    }
    
    setPaymentStatus('processing');
    setPaymentError(null);
    setNameError('');

    try {
      console.log("About to send payment request with:", {
        subtotal: subtotal,
        tipAmount: getTipAmount(),
        totalWithTip: totalWithTip,
        amountWithTipCents: amountWithTipCents,
        selectedTip: selectedTip,
        customTip: customTip
      });

      const response = await fetch('/api/submit-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sourceId: token.token,
          customerName: customerName.trim(),
          paymentMethod: 'online',
          locationId,
          amount: amountWithTipCents,
          orderDetails: {
            items: cartItems.map(item => ({
              id: item.id,
              name: item.name,
              size: item.size,
              temperature: item.temperature,
              quantity: item.quantity,
              unitPrice: item.price,
              modifiers: item.modifiers || [],
              specialInstructions: item.specialInstructions || '' 
            }))
          }
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Payment failed with status: ${response.status}`);
      }

      const result = await response.json();
      setPaymentResult({
        ...result,
        paymentMethod: 'online',
        customerName: customerName.trim()
      });
      setPaymentStatus('success');
      
      // Clear cart after successful payment
      localStorage.removeItem('cart');
      setCartItems([]);
      
    } catch (error) {
      console.error("Payment error:", error);
      setPaymentError(error.message);
      setPaymentStatus('error');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-16 px-4">
        <div className="text-center">
          <p className="text-xl">Loading your cart...</p>
        </div>
      </div>
    );
  }

  // Show empty cart message if there are no items
  if (cartItems.length === 0 && paymentStatus !== 'success') {
    return (
      <div className="container mx-auto py-16 px-4">
        <div className="max-w-lg mx-auto text-center">
          <h1 className="text-3xl font-bold mb-6">Checkout</h1>
          <div className="bg-white rounded-lg shadow-md p-8">
            <p className="text-xl mb-4">Your cart is empty</p>
            <a 
              href="/"
              className="inline-block py-3 px-6 bg-[#50311D] text-white rounded hover:bg-[#3d2416] transition-colors"
            >
              Continue Shopping
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Show success message after payment
  if (paymentStatus === 'success' && paymentResult) {
    return (
      <div className="container mx-auto py-16 px-4">
        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="w-16 h-16 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
                <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold mb-2">
              {paymentResult.paymentMethod === 'online' ? 'Order Confirmed!' : 'Order Received!'}
            </h2>
            <p className="text-gray-600 mb-6">
              {paymentResult.paymentMethod === 'online' 
                ? 'Thank you for your purchase.' 
                : 'Please pay when you arrive to pick up your order.'
              }
            </p>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
              <p className="mb-2"><strong>Customer:</strong> {paymentResult.customerName}</p>
              <p className="mb-2"><strong>Order ID:</strong> {paymentResult.id || paymentResult.orderId}</p>
              {paymentResult.paymentMethod === 'online' && (
                <>
                  <p className="mb-2"><strong>Status:</strong> {paymentResult.status}</p>
                  <p className="mb-2"><strong>Amount:</strong> ${parseFloat(paymentResult.amount) / 100}</p>
                </>
              )}
              {paymentResult.paymentMethod === 'instore' && (
                <p className="mb-2"><strong>Payment:</strong> Pay in-store (${subtotal.toFixed(2)})</p>
              )}
              <p className="mb-2">
                <strong>Payment Method:</strong> {paymentResult.paymentMethod === 'online' ? 'Paid Online' : 'Pay In-Store'}
              </p>
              {paymentResult.receiptUrl && (
                <a 
                  href={paymentResult.receiptUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline block mt-2"
                >
                  View Receipt
                </a>
              )}
            </div>
            
            <a 
              href="/"
              className="inline-block py-3 px-6 bg-[#50311D] text-white rounded hover:bg-[#3d2416] transition-colors"
            >
              Continue Shopping
            </a>
          </div>
        </div>
      </div>
    );
  }

  if (!shopStatus.isOpen) {
    return (
      <div className="container mx-auto py-16 px-4">
        <div className="max-w-lg mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
            <div className="w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">We're Currently Closed</h2>
            <p className="text-gray-600 mb-6">{shopStatus.message}</p>
            <a 
              href="/menu"
              className="inline-block py-3 px-6 bg-[#50311D] text-white rounded hover:bg-[#3d2416] transition-colors"
            >
              Browse Menu
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-16 px-4">
      <div className="flex flex-col place-items-center gap-8">
        
        {/* Order Summary */}
        <div className="lg:w-1/2">
          <OrderSummaryDropdown 
            cartItems={cartItems} 
            calculateTip={getTipAmount} 
            calculateSubtotal={calculateSubtotal}
          />
          
          <div className="bg-white mt-10 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">Pickup Instructions</h3>
            <p className="mb-4">Your order will be available for pickup at our store within 15-20 minutes after confirmation.</p>
            <p className="text-gray-600">
              Xoco Coffee<br />
              123 Main Street<br />
              Anytown, US 12345
            </p>
          </div>
        </div>
        
        {/* Customer Info & Payment Section */}
        <div className="lg:w-1/2">
          {/* Customer Name */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-bold mb-4">Customer Information</h3>
            <div>
              <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-2">
                Name for Order *
              </label>
              <input
                type="text"
                id="customerName"
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  if (nameError) setNameError('');
                }}
                className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-[#50311D] focus:border-transparent ${
                  nameError ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter your name"
                required
              />
              {nameError && (
                <p className="mt-1 text-sm text-red-600">{nameError}</p>
              )}
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-bold mb-4">Payment Method</h3>
            <div className="space-y-3">
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="online"
                  checked={paymentMethod === 'online'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3 text-[#50311D] focus:ring-[#50311D]"
                />
                <div>
                  <div className="font-medium">Pay Online</div>
                  <div className="text-sm text-gray-600">Pay now with card, Apple Pay, or Google Pay</div>
                </div>
              </label>
              
              <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="instore"
                  checked={paymentMethod === 'instore'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-3 text-[#50311D] focus:ring-[#50311D]"
                />
                <div>
                  <div className="font-medium">Pay In-Store</div>
                  <div className="text-sm text-gray-600">Order now, pay when you pick up</div>
                </div>
              </label>
            </div>
          </div>

          {/* Tip Selection - Only for online payments */}
          {paymentMethod === 'online' && (
            <div className="libre p-6 rounded-md mb-6">
              <h2 className="text-center text-2xl font-serif mb-4 text-black">Add a Tip</h2>
              <div className="grid grid-cols-4 gap-4">
                {['10', '15', '20'].map(percent => (
                  <button
                    key={percent}
                    onClick={() => {
                      setSelectedTip(percent);
                      setCustomTip('');
                    }}
                    className={`p-4 rounded-lg shadow text-center transition-colors ${
                      selectedTip === percent ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-2xl font-semibold">{percent}%</div>
                    <div className="text-sm">${(subtotal * (parseInt(percent) / 100)).toFixed(2)}</div>
                  </button>
                ))}

                {/* Custom Option */}
                <button
                  onClick={() => setSelectedTip('custom')}
                  className={`p-4 rounded-lg shadow text-center transition-colors ${
                    selectedTip === 'custom' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-50'
                  }`}
                >
                  <div className="text-xl font-semibold">Custom</div>
                </button>
              </div>

              {/* Custom Input */}
              {selectedTip === 'custom' && (
                <div className="mt-4">
                  <label htmlFor="customTip" className="block mb-1 text-sm text-black font-medium">
                    Enter Custom Tip Amount
                  </label>
                  <input
                    id="customTip"
                    type="number"
                    step="0.01"
                    min="0"
                    value={customTip}
                    onChange={(e) => setCustomTip(e.target.value)}
                    className="w-full p-2 border rounded focus:ring-2 focus:ring-[#50311D] focus:border-transparent"
                    placeholder="e.g. 1.50"
                  />
                </div>
              )}
            </div>
          )}

          {/* Payment Processing Section */}
          <div className="rounded-lg p-6">
            {paymentStatus === 'error' && (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
                <p className="font-medium">
                  {paymentMethod === 'online' ? 'Payment failed' : 'Order failed'}
                </p>
                <p>{paymentError}</p>
              </div>
            )}

            {paymentMethod === 'online' ? (
              // Online Payment Options
              <>
                <h2 className="text-3xl libre text-white text-center font-bold mb-4">Payment Options</h2>
          <PaymentForm
  applicationId={appId}
  locationId={locationId}
  cardTokenizeResponseReceived={handleOnlinePayment}
  createPaymentRequest={() => ({
    countryCode: "US",
    currencyCode: "USD",
    total: {
      amount: totalWithTip,
      label: getTipAmount() > 0 
        ? `Total: ${subtotal.toFixed(2)} + ${getTipAmount().toFixed(2)} tip`
        : `Total: ${subtotal.toFixed(2)}`,
    }
  })}
>
{paymentMethod === 'online' && getTipAmount() > 0 && (
  <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-6">
    <div className="flex">
      <div className="flex-shrink-0">
        <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="ml-3">
        <h3 className="text-sm font-medium text-amber-800">
          Payment Total Notice
        </h3>
        <div className="mt-2 text-sm text-amber-700">
          <p className="font-semibold">
            You will be charged ${totalWithTip} total
          </p>
          <p className="mt-1">
            • Order: ${subtotal.toFixed(2)}
          </p>
          <p>
            • Tip ({selectedTip === 'custom' ? 'Custom' : selectedTip + '%'}): ${getTipAmount().toFixed(2)}
          </p>
          <p className="mt-2 text-xs">
            Note: Google Pay and Apple Pay may initially show only the order amount, but your card will be charged the full total including tip.
          </p>
        </div>
      </div>
    </div>
  </div>

)}
  {/* Digital Wallet Options */}
  <div className="space-y-4 mb-6">
    <ApplePay 
      buttonProps={{
        css: {
          width: '100%',
          height: '48px',
          borderRadius: '8px',
        }
      }}
    />
    
    <GooglePay 
      buttonColor="black"
      buttonType="long"
      buttonSizeMode="fill"
      buttonProps={{
        css: {
          width: '100%',
          height: '48px',
          borderRadius: '8px',
        }
      }}
    />
  </div>

  {/* Divider */}
  <div className="relative my-6">
    <div className="absolute inset-0 flex items-center">
      <div className="w-full border-t border-gray-300"></div>
    </div>
    <div className="relative flex justify-center text-sm">
      <span className="px-2 bg-gray-50 text-gray-500">Or pay with card</span>
    </div>
  </div>

  {/* Credit Card Form */}
  <CreditCard 
    buttonProps={{
      isLoading: paymentStatus === 'processing',
      css: {
        backgroundColor: '#50311D',
        color: 'white',
        '&:hover': {
          backgroundColor: '#3d2416',
        },
        marginTop: '1rem',
        width: '100%',
        padding: '0.75rem',
        borderRadius: '0.25rem',
        fontSize: '1rem',
        fontWeight: '600',
      }
    }}
  />
</PaymentForm>
              </>
            ) : (
              // In-Store Payment Option
              <div className="text-center">
                <h2 className="text-3xl libre text-white text-center font-bold mb-6">Confirm Your Order</h2>
                <div className="bg-white rounded-lg p-6 mb-6">
                  <div className="text-gray-600 mb-4">
                    <p className="text-lg mb-2">Your order will be prepared and ready for pickup.</p>
                    <p>Please pay when you arrive at the store.</p>
                  </div>
                  <div className="text-2xl font-bold text-[#50311D]">
                    Total: ${subtotal.toFixed(2)}
                  </div>
                </div>
                <button
                  onClick={handleInStorePayment}
                  disabled={paymentStatus === 'processing' || !customerName.trim()}
                  className="w-full py-4 px-6 bg-[#50311D] text-white rounded-lg hover:bg-[#3d2416] disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors text-lg font-semibold"
                >
                  {paymentStatus === 'processing' ? 'Confirming Order...' : 'Confirm Order'}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className='border border-white h-0.5 w-full'></div>
        
        <div className='lg:w-1/2'>
          <h3 className="text-3xl libre text-white mb-2">
            {paymentMethod === 'online' ? (
              <>
                Total: ${totalWithTip}
                {getTipAmount() > 0 && (
                  <span className="text-lg text-gray-300 block">
                    (Subtotal: ${subtotal.toFixed(2)} + Tip: ${getTipAmount().toFixed(2)})
                  </span>
                )}
              </>
            ) : (
              <>
                Total: ${subtotal.toFixed(2)}
                <span className="text-lg text-gray-300 block">(Pay in-store + tip in person)</span>
              </>
            )}
          </h3>
        </div>
      </div>
    </div>
  );
}