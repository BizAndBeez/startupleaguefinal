import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './LandingPage.css';
import logo from '../../assets/startupleague_logo.png';
import landingpageimg from '../../assets/landingpageimg.png';

const LandingPage = () => {
  const [ticketCounts, setTicketCounts] = useState({
    earlyBird: 0,
    goldDelegate: 0,
    platinumAccess: 0,
  });
  const [checkoutAmount, setCheckoutAmount] = useState(null); // Holds the total amount to display after checkout

  const navigate = useNavigate();

  const ticketPrices = {
    earlyBird: 2, // ₹999 + ₹179.82 GST
    goldDelegate: 1, // ₹1999 + ₹359.82 GST
    platinumAccess: 1, // ₹2999 + ₹539.82 GST
  };

  const incrementTicket = (type) => {
    setTicketCounts({ ...ticketCounts, [type]: ticketCounts[type] + 1 });
  };

  const decrementTicket = (type) => {
    if (ticketCounts[type] > 0) {
      setTicketCounts({ ...ticketCounts, [type]: ticketCounts[type] - 1 });
    }
  };

  const calculateTotal = () => {
    return (
      ticketCounts.earlyBird * ticketPrices.earlyBird +
      ticketCounts.goldDelegate * ticketPrices.goldDelegate +
      ticketCounts.platinumAccess * ticketPrices.platinumAccess
    ).toFixed(2);
  };

  const handleCheckout = () => {
    const total = calculateTotal();
    setCheckoutAmount(total); // Update the state with the total amount
  };

  const handleProceedToPayment = () => {
    const selectedTickets = Object.entries(ticketCounts)
      .filter(([, quantity]) => quantity > 0)
      .map(([type, quantity]) => ({
        type,
        quantity,
      }));

    if (selectedTickets.length === 0) {
      alert('Please select at least one ticket before proceeding to payment.');
      return;
    }

    const ticketData = {
      tickets: selectedTickets,
      totalAmount: calculateTotal(),
    };

    // Navigate to BookingPage with ticket data
    navigate('/payment', { state: ticketData });
  };


  return (
    <section id="LandingPage">
      <div>
        {/* Logo */}
        <div>
          <img className="logo" src={logo} alt="Startup League Logo" />
        </div>

        {/* Main Content */}
        <div className="landingpage-home-container">
          <span>
            <h1 className="landingpage-headtext">STARTUP LEAGUE 2025 | <br /> HYDERABAD</h1>
          </span>
          <span>
            <h2 className="landingpage-home-datelocation-text">Sun, 23 FEB | HITEX Exhibition Centre, Hyderabad</h2>
          </span>
          <span className="landingpage-home-subtext-container">
            <p className="landingpage-home-subtext">
              A platform empowering investors, founders, and aspiring entrepreneurs to build, manage, and scale their businesses.
            </p>
          </span>
          {/* <button className="landingpage-home-btn">Buy Tickets</button> */}
        </div>

        <div className="landingpageimg-container">
          <img className="landingpageimg" src={landingpageimg} alt="Landing Page Illustration" />
        </div>

        {/* Ticket Picker Section */}
        <div className="ticketpicker-container">
          <div className="tickets-headtext-container">
            <h4 className="tickets-headtext">Tickets</h4>
            <h4 className="quantity-headtext">Quantity</h4>
          </div>
          <div className="conatiner-of-ticketpicker">
            {/* Early Bird Ticket */}
            <div className="individual-ticketpicker-container">
              <div className="ticket-type-container">
                <h4 className="ticket-type-text">Ticket Type</h4>
                <h5 className="ticket-category-text">Early Bird (No Lunch)</h5>
                <h6 className="more-info-text">More info</h6>
              </div>
              <div className="ticketpicker-pricecontainer">
                <div>
                  <h4 className="price-btn">Price</h4>
                  <h5 className="rate-btn">₹ 999.00 <br /> + ₹ 179.82 GST</h5>
                </div>
                <div className="increment-decrement-container">
                  
                    <button className="decrement-btn" onClick={() => decrementTicket('earlyBird')}>-</button>
                    {ticketCounts.earlyBird}
                    <button className="increment-btn" onClick={() => incrementTicket('earlyBird')}>+</button>
        
                </div>
              </div>
            </div>

            {/* Gold Delegate Ticket */}
            <div className="individual-ticketpicker-container">
              <div className="ticket-type-container">
                <h4 className="ticket-type-text">Ticket Type</h4>
                <h5 className="ticket-category-text">Gold Delegate (Full Access)</h5>
                <h6 className="more-info-text">More info</h6>
              </div>
              <div className="ticketpicker-pricecontainer">
                <div>
                  <h4 className="price-btn">Price</h4>
                  <h5 className="rate-btn">₹ 1999.00 <br /> + ₹ 359.82 GST</h5>
                </div>
                <div className="increment-decrement-container">
                  
                    <button className="decrement-btn" onClick={() => decrementTicket('goldDelegate')}>-</button>
                    {ticketCounts.goldDelegate}
                    <button className="increment-btn" onClick={() => incrementTicket('goldDelegate')}>+</button>
                  
                </div>
              </div>
            </div>

            {/* Platinum Access Ticket */}
            <div className="individual-ticketpicker-container">
              <div className="ticket-type-container">
                <h4 className="ticket-type-text">Ticket Type</h4>
                <h5 className="ticket-category-text">Platinum Access (VIP)</h5>
                <h6 className="more-info-text">More info</h6>
              </div>
              <div className="ticketpicker-pricecontainer">
                <div>
                  <h4 className="price-btn">Price</h4>
                  <h5 className="rate-btn">₹ 2999.00 <br /> <span>+ ₹ 539.82 GST</span></h5>
                </div>
                <div className="increment-decrement-container">
                  
                    <button className="decrement-btn" onClick={() => decrementTicket('platinumAccess')}>-</button>
                    {ticketCounts.platinumAccess}
                    <button className="increment-btn" onClick={() => incrementTicket('platinumAccess')}>+</button>
                  
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Checkout Section */}
        <div className="checkout-container">
          <div className="checkout-amount-container">
            <button className="checkout-btn" onClick={handleCheckout}>Checkout</button>
            {checkoutAmount !== null && (
              <h3 className="total-amount">Total Amount: ₹ {checkoutAmount}</h3>
            )}
          </div>

          <div className="proceed-container">
            <button className="proceed-btn" onClick={handleProceedToPayment}>Proceed to Payment</button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingPage;
