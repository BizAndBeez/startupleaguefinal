import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import QRCode from "react-qr-code";
import startupleague_logo from '../../assets/startupleague_logo.png';
import './BookingPage.css';
import TicketPage from '../../Components/TicketPage/TicketPage';

const fetchWithRetry = async (url, options = {}, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        credentials: 'include',
        mode: 'cors',
      });

      if (response.ok) return response.json();
      throw new Error(`HTTP error! status: ${response.status}`);
    } catch (err) {
      if (i === retries - 1) throw err;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

const BookingPage = () => {
  const location = useLocation(); 
  const { tickets = [], totalAmount = 0 } = location.state || {};

  const [isOpen, setIsOpen] = useState(false);
  const [showTicket, setShowTicket] = useState(false);
  const [ticketDetails, setTicketDetails] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    secondName: '',
    phoneNumber: '',
    email: '',
  });
  const [formErrors, setFormErrors] = useState({
    firstName: false,
    secondName: false,
    phoneNumber: false,
    email: false,
  });
  const [isFormValid, setIsFormValid] = useState(false);

  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => {
        console.log('Razorpay script loaded successfully');
        resolve(true);
      };
      script.onerror = (error) => {
        console.error('Razorpay script load error:', error);
        reject(false);
      };
      document.body.appendChild(script);
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    validateForm({ ...formData, [name]: value });
  };

  const validateForm = (data) => {
    const errors = {
      firstName: !data.firstName,
      secondName: !data.secondName,
      phoneNumber: !data.phoneNumber,
      email: !data.email || !/\S+@\S+\.\S+/.test(data.email),
    };
    setFormErrors(errors);
    setIsFormValid(!Object.values(errors).includes(true));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    validateForm(formData);
    if (isFormValid) {
      setIsOpen(true);
    }
  };

  const initializeRazorpay = async () => {
    try {
      const loadScript = (src) => {
        return new Promise((resolve) => {
          const script = document.createElement("script");
          script.src = src;
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
      };
  
      const razorpayLoaded = await loadScript("https://checkout.razorpay.com/v1/checkout.js");
      if (!razorpayLoaded) {
        alert("Razorpay SDK failed to load. Check your internet connection.");
        return;
      }
  
      const orderDetails = await fetchWithRetry("https://startupleaguefinal.onrender.com/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: totalAmount,
          currency: "INR",
          receipt: `receipt_${Date.now()}`,
        }),
      });
  
      if (!orderDetails?.order?.id) {
        alert("Failed to create order. Please try again.");
        return;
      }
  
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: orderDetails.order.amount,
        currency: orderDetails.order.currency,
        order_id: orderDetails.order.id,
        name: "Startup League",
        description: "Event Payment",
        image: "/logo.png",
        handler: async (response) => {
          try {
            // Validate payment
            const validateResponse = await fetchWithRetry(
              "https://startupleaguefinal.onrender.com/validate",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(response),
              }
            );
  
            if (validateResponse.success) {
              // Save booking data
              const saveBookingResponse = await fetchWithRetry(
                "https://startupleaguefinal.onrender.com/save-booking",
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    ...formData,
                    tickets,
                    totalAmount,
                    paymentId: response.razorpay_payment_id,
                    orderId: response.razorpay_order_id,
                  }),
                }
              );
  
              if (saveBookingResponse.success) {
                alert("Payment Successful! Booking data saved.");
                setTicketDetails({
                  ...formData,
                  tickets,
                  totalAmount,
                  paymentId: response.razorpay_payment_id,
                  orderId: response.razorpay_order_id,
                });
                setShowTicket(true);
              } else {
                alert("Payment Successful, but failed to save booking data.");
              }
            } else {
              alert("Payment validation failed!");
            }
          } catch (err) {
            alert("Error processing payment. Please try again.");
          }
        },
        prefill: {
          name: `${formData.firstName} ${formData.secondName}`,
          email: formData.email,
          contact: formData.phoneNumber,
        },
        theme: {
          color: "#3399cc",
        },
      };
  
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err) {
      console.error("Razorpay Error:", err.message);
      alert("Error initializing Razorpay. Please try again.");
    }
  };
  
  
  
  return (
    <section className='Booking-Page-Container'>
      <img src={startupleague_logo} className='booking-startup-logo' alt='Startup League Logo' />
      {!showTicket ? (
        <div className='form-container'>
          <div className='form-container-2'>
            <span className='start-text'>1. Add your details</span>

            <div className='first-input-container'>
              <div className='first-name-container'>
                <span>First Name</span>
                <input
                  type='text'
                  className={`first-name ${formErrors.firstName ? 'error' : ''}`}
                  name='firstName'
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
                {formErrors.firstName && <span className='error-message'>First name is required</span>}
              </div>

              <div className='second-name-container'>
                <span>Second Name</span>
                <input
                  type='text'
                  className={`second-name ${formErrors.secondName ? 'error' : ''}`}
                  name='secondName'
                  value={formData.secondName}
                  onChange={handleInputChange}
                  required
                />
                {formErrors.secondName && <span className='error-message'>Second name is required</span>}
              </div>
            </div>

            <div className='second-input-container'>
              <div className='phone-number-container'>
                <span>*Phone Number</span>
                <input
                  type='text'
                  className={`phone-number ${formErrors.phoneNumber ? 'error' : ''}`}
                  name='phoneNumber'
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  required
                />
                {formErrors.phoneNumber && <span className='error-message'>Phone number is required</span>}
              </div>
            </div>

            <div className='email-container'>
              <span>*Email</span>
              <input
                type='email'
                className={`email ${formErrors.email ? 'error' : ''}`}
                name='email'
                value={formData.email}
                onChange={handleInputChange}
                required
                pattern='[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$'
                title='Please enter a valid email address (e.g., user@example.com)'
                placeholder=''
              />
              {formErrors.email && <span className='error-message'>A valid email is required</span>}
            </div>

            <span className='button-container'>
              <button
                className='submit-button'
                onClick={handleSubmit}
                disabled={!isFormValid}
              >
                Continue
              </button>
            </span>
          </div>
        </div>
      ) : (
        <div className='ticket-container'>
          <TicketPage ticketDetails={ticketDetails} />
        </div>
      )}

      {isOpen && !showTicket && (
        <div className='payment-container'>
          <div>
            <h3 className='payment-header'>2. Payment</h3>
          </div>
          <div className='payment-button-container'>
            {isFormValid && (
              <button onClick={initializeRazorpay} className='payment-button'>
                Pay
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default BookingPage;
