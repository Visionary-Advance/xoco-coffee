'use client';

import { useState, useEffect } from 'react';
import { CreditCard, PaymentForm } from "react-square-web-payments-sdk";
import { FaChevronUp, FaChevronDown } from "react-icons/fa";
import OrderSummaryDropdown from '@/Components/CheckOutDropDown';

export default function Checkout() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState('idle'); // 'idle', 'processing', 'success', 'error'
  const [paymentResult, setPaymentResult] = useState(null);
  const [paymentError, setPaymentError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTip, setSelectedTip] = useState(null); 
const [customTip, setCustomTip] = useState('');


  
  const appId = 'sandbox-sq0idb-6j0gJSljj_EWTNcVUttbnQ';
  const locationId = 'L3ZBNPD54KQT1';

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

  // Calculate subtotal from cart items
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  // Convert dollar amount to cents for Square API
  // const calculateAmountInCents = () => {
  //   return Math.round(parseFloat(calculateSubtotal()) * 100);
  // };

  
  
  const subtotal = parseFloat(calculateSubtotal());
  
const getTipAmount = () => {
  if (selectedTip === 'custom') {
    return parseFloat(customTip) || 0;
  }
  if (selectedTip) {
    return +(subtotal * (parseFloat(selectedTip) / 100)).toFixed(2);
  }
  return 0;
};

const totalWithTip = (subtotal + getTipAmount()).toFixed(2);

const amountWithTipCents = Math.round((subtotal + getTipAmount()) * 100);
// Handle Square payment process
const handlePayment = async (token) => {
  setPaymentStatus('processing');
  setPaymentError(null);
  
  try {
    const response = await fetch('/api/submit-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        sourceId: token.token,
        locationId,
        amount: amountWithTipCents,
        orderDetails: {
          items: cartItems.map(item => ({
            name: item.title,
            size: item.size,
            temperature: item.temperature,
            quantity: item.quantity,
            unitPrice: item.price
          }))
        }
      }),
    });
    
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Payment failed with status: ${response.status}`);
      }

      const result = await response.json();
      setPaymentResult(result);
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
            <h2 className="text-3xl font-bold mb-2">Order Confirmed!</h2>
            <p className="text-gray-600 mb-6">Thank you for your purchase.</p>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
              <p className="mb-2"><strong>Order ID:</strong> {paymentResult.id}</p>
              <p className="mb-2"><strong>Status:</strong> {paymentResult.status}</p>
              <p className="mb-2"><strong>Amount:</strong> ${parseFloat(paymentResult.amount) / 100}</p>
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

  return (
    <div className="container mx-auto py-16 px-4">
      <div className="flex flex-col place-items-center gap-8">
        
        {/* Order Summary */}
        <div className="lg:w-1/2">
        <OrderSummaryDropdown cartItems={cartItems} calculateTip={getTipAmount} calculateSubtotal={calculateSubtotal}/>
          
          <div className="bg-white mt-10 rounded-lg shadow-md p-6">
            <h3 className="text-xl font-bold mb-4">Pickup Instructions</h3>
            <p className="mb-4">Your order will be available for pickup at our store within 15-20 minutes after payment is confirmed.</p>
            <p className="text-gray-600">
              Xoco Coffee<br />
              123 Main Street<br />
              Anytown, US 12345
            </p>
          </div>
        </div>
        
        {/* Payment Section */}
        <div className="lg:w-1/2">
          <h2 className="text-3xl libre text-white text-center font-bold mb-4">Card Information</h2>
          <div className=" rounded-lg p-6">
            {paymentStatus === 'error' && (
              <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6">
                <p className="font-medium">Payment failed</p>
                <p>{paymentError}</p>
              </div>
            )}
            
            
            
            <PaymentForm
              applicationId={appId}
              locationId={locationId}
              cardTokenizeResponseReceived={handlePayment}
              createPaymentRequest={() => ({
                countryCode: "US",
                currencyCode: "USD",
                total: {
                  amount: totalWithTip,
                  label: "Total with Tip",
                }
              })}
            >
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
            <div className=" libre p-6 rounded-md mb-6">
  <h2 className="text-center text-2xl font-serif mb-4 text-black">Add a Tip</h2>
  <div className="grid grid-cols-4 gap-4">
    {['10', '15', '20'].map(percent => (
      <button
        key={percent}
        onClick={() => {
          setSelectedTip(percent);
          setCustomTip('');
        }}
        className={`p-4 rounded-lg shadow text-center ${
          selectedTip === percent ? 'bg-black text-white' : 'bg-white text-black'
        }`}
      >
        <div className="text-2xl font-semibold">{percent}%</div>
        <div className="text-sm">${(subtotal * (parseInt(percent) / 100)).toFixed(2)}</div>
      </button>
    ))}

    {/* Custom Option */}
    <button
      onClick={() => setSelectedTip('custom')}
      className={`p-4 rounded-lg shadow text-center ${
        selectedTip === 'custom' ? 'bg-black text-white' : 'bg-white text-black'
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
        className="w-full p-2 border rounded"
        placeholder="e.g. 1.50"
      />
    </div>
  )}
</div>
          </div>
        </div>
        <div className='border border-white h-0.5 w-full'></div>
        <div className='lg:w-1/2'>
        <h3 className="text-3xl libre text-[white] mb-2">Total: ${totalWithTip}</h3>
        </div>

      </div>
    </div>
  );
}