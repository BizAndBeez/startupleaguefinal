import React from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import QRCode from 'react-qr-code';
import './TicketPage.css'
import TicketImg from '../../assets/TicketImg.jpg';

const TicketContainer = ({ ticketDetails }) => {
  if (!ticketDetails) {
    return <div>No ticket data available</div>;
  }

  const {
    firstName,
    secondName,
    email,
    phoneNumber,
    paymentId,
    orderId,
    tickets = [], // Default to an empty array if tickets are undefined
    venueDetails,
  } = ticketDetails;

  const totalTickets = tickets.length > 0 ? tickets.reduce((sum, ticket) => sum + ticket.quantity, 0) : 0;

  const handleDownload = () => {
    const ticketElement = document.getElementById('download-tkt');
    html2canvas(ticketElement, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Startup_League_Ticket_${orderId}.pdf`);
    });
  };
  
  

  return (
    <div className="ticket-container" id='download-tkt'>
      <h1 className='startup-headtext'>Startup League Event 2025</h1>

      <div className="ticket-img-container">
        <img src={TicketImg} alt="Ticket" className="ticket-img" />
      </div>

      <div className="ticket-details-container">
        <h2>Your Details</h2>
        <p><strong>Name:</strong> {`${firstName} ${secondName}`}</p>
        <p><strong>Email:</strong> {email}</p>
        <p><strong>Phone:</strong> {phoneNumber}</p>
      </div>

      <div className="venue-details-container">
        <h2>Venue Details</h2>
        <p><strong>Venue:</strong> HITEX Exhibition Center, Hyderabad, Telangana 500084
        </p>
        {/* <p><strong>Address:</strong> {venueDetails?.address || 'N/A'}</p> */}
        <p><strong>Date:</strong>23rd Feb 2025</p>
        <p><strong>Time:</strong> 8:30AM to 6:30PM</p>
      </div>

      <div className="order-summary-container">
        <h2>Order Summary</h2>
        {tickets.length > 0 ? (
          tickets.map((ticket, index) => (
            <p key={index}><strong>{ticket.type}:</strong> {ticket.quantity} ticket(s)</p>
          ))
        ) : (
          <p>No tickets available</p>
        )}
        <p><strong>Total Tickets:</strong> {totalTickets}</p>
        <p><strong>Payment ID:</strong> {paymentId}</p>
        <p><strong>Order ID:</strong> {orderId}</p>
      </div>

      <div className="qr-code qr-code-container">
        <h2>Scan for Details</h2>
        <QRCode className='qr-code-img'
          value={JSON.stringify({
            name: `${firstName} ${secondName}`,
            email,
            phoneNumber,
            tickets,
            venueDetails,
            paymentId,
            orderId,
          })}
        />
      </div>

      <div className="download-container">
        <button className="download-btn" onClick={handleDownload}>
          Download Ticket
        </button>
      </div>
    </div>
  );
};

export default TicketContainer;
