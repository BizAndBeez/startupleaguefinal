import React from 'react';
import './Contact.css';
import youtube from '../../assets/youtube.png'
import whatsapp from '../../assets/whatsapp.png'
import twitter from '../../assets/twitter.png'
import linkedin from '../../assets/linkedin.png'
import instagram from '../../assets/instagram.png'
import facebook from '../../assets/facebook.png'
import { FaLocationDot } from "react-icons/fa6";
import { FaPhone } from "react-icons/fa6";
import { IoMail } from "react-icons/io5";


const Contact = () => {
  return (
    <section className="contact-page">
      {/* Reach Us Container */}
      <div className="Reach-Us-container">
        <h1 className="reach-us-header">Reach Us</h1>
        <p className="reach-us-para">
          Have questions? Reach out to us! Send a message, give us a call, or drop us an email—<b>we'd love to hear from you.</b>
        </p>
        <div className='contact-container'>
          <span className="reach-us-content">
            <FaLocationDot size={30} color='#FF5A19' />
            <h2>Boss Towers, First Floor, Street No 2, Patrika Nagar, Madhapur, Hyderabad-500081</h2>
          </span>
          <span className="reach-us-content">
            <FaPhone size={20} color='#FF5A19' />
            <h1>+91 89777 39121</h1>
          </span>
          <span></span>
          <span className="reach-us-content">
            <IoMail color='#FF5A19' size={20} />
            <h2>startupleague25@gmail.com</h2>
          </span>
        </div>

        {/* Social Media Icons */}
        <span className="social-icons-container">
          <a href=""><img className="social-instagram-icon" src={instagram} alt="instagram" /></a>
          <a href=""><img className="social-icon" src={twitter} alt="instagram" /></a>
          <a href=""><img className="social-youtube-icon" src={youtube} alt="instagram" /></a>
          <a href=""><img className="social-icon" src={whatsapp} alt="instagram" /></a>
          <a href=""><img className="social-icon" src={linkedin} alt="linkedin" /></a>
          <a href=""><img className="social-icon" src={facebook} alt="facebook" /></a>
        </span>
      </div>

      {/* Enquiry Form Container */}
      <div className="enquiry-form-container">
        <h2 className="enquiry-form-header" >For Enquiry</h2>

        <div className="form-row">
          <input className="input-field" type="text" placeholder="Your Name" />
          <input className="input-field" type="tel" placeholder="Phone Number" />
          <input className="input-field" type="email" placeholder="Email Address" />
        </div>

        <div className="form-row">
          <textarea className="message-box" placeholder="Your Message"></textarea>
        </div>

        <div className="contact-submit-button-container">
          <button className="contact-submit-button">Send Message</button>
        </div>
      </div>

    </section>
  );
};

export default Contact;