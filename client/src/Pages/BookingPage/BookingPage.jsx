import React, { useState, useEffect } from 'react';
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
  const [allBookings, setAllBookings] = useState([]); // New state for fetching all bookings
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

  useEffect(() => {
    // Fetch all bookings on component mount
    const fetchBookings = async () => {
      try {
        const bookings = await fetchWithRetry("https://startupleaguefinal.onrender.com/bookings");
        setAllBookings(bookings.bookings);
      } catch (error) {
        console.error("Error fetching bookings:", error.message);
      }
    };

    fetchBookings();
  }, []);

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
            const validateResponse = await fetchWithRetry(
              "https://startupleaguefinal.onrender.com/validate",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(response),
              }
            );

            if (validateResponse.success) {
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
          {/* Form Section */}
          <div className='form-container-2'>
            <span className='start-text'>1. Add your details</span>
            {/* Form Inputs */}
            {/* Add Booking Form */}
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
