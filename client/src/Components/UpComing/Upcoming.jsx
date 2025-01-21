import React from 'react'
import { useNavigate } from 'react-router-dom'
import './Upcoming.css'
import upcomingPoster from '../../assets/upcomingPoster.jpg'

const Upcoming = () => {
  const navigate = useNavigate()
  const handleLandingPageClick =()=>{
    navigate('/booking')
  }

  return (
    <section id='Upcoming'>
      <div className='upcoming-container'>
        <div className='upcoming-firstcontainer'>
          <div className='upcoming-firstcontainer-left'>
            <img className='upcomingPoster' src={upcomingPoster} alt="" />
          </div>
          <div className='upcoming-firstcontainer-right'>
            <h2 className='upcoming-firstconatiner-right-headtext'>UPCOMING EVENTS</h2>
            <div>
              <h3 className='upcoming-firstcontainer-right-title'>STARTUP LEAGUE 2025 | HYDERABAD</h3>
            </div>
            <div>
              <h4 className='upcoming-firstconatiner-right-subhead'>The Biggest Startup Event of the Year, Where Vision Meets Opportunity.</h4>
            </div>
            <div className='upcoming-firstconatiner-right-date-container'>
              <h5 className='upcoming-firstconatiner-right-datetext'>SUN, FEB 23 | HITEX EXHIBITION GROUNDS, HYDERABAD</h5>
            </div>
            <button onClick={handleLandingPageClick} className='upcoming-buy-tickets-btn'>BUY TICKETS</button>
          </div>
        </div>

        <div className='upcoming-secondcontainer'>
          <div className='upcoming-secondcontainer-paracontainer'>
            <p className='upcoming-secondcontainer-paratext'>
              Welcome to Startup League 2025, the ultimate platform for
              entrepreneurs, innovators, and investors to connect, collaborate,
              and create! This year’s event promises to be the largest and most impactful
              yet, bringing together 3,000+ entrepreneurs, 150+ investors, and an electrifying atmosphere of innovation.
            </p>
          </div>
        </div>

        <div className='upcoming-thirdcontainer'>
          <div className='upcoming-thirdcontainer-headcontainer'>
            <h3 className='upcoming-thirdcontainer-headtext'>Event Highlights</h3>
          </div>
          <div className='container'>
            <div className='upcoming-thirdcontainer-individualcontainer'>
              <h5 className='upcoming-thirdcontainer-individualcontainer-headtext'>A Gathering Like No Other</h5>
            </div>
            <ul className='upcoming-thirdcontainer-ul'>
              <li>3000+ Entrepreneurs from diverse industries sharing their dreams and showcasing ground breaking ideas.</li>
              <li>150+ Investors scouting for the next big thing to fund and mentor.</li>
            </ul>
          </div>
          <div className='container'>
            <div>
              <h5 className='upcoming-thirdcontainer-individualcontainer-headtext'>Interactive Stalls & Workshops</h5>
            </div>
            <ul className='upcoming-thirdcontainer-ul'>
              <li>20+ Stalls featuring cutting-edge products, services, and technologies.</li>
              <li>Engage in hands-on workshops to sharpen your entrepreneurial skills and gain actionable insights.</li>
            </ul>
          </div>
          <div className='container'>
            <div>
              <h5 className='upcoming-thirdcontainer-individualcontainer-headtext'>Awards for Innovation</h5>
            </div>
            <ul className='upcoming-thirdcontainer-ul'>
              <li>The Top 5 Startup Ideas will be awarded ₹1 Lakh each for their ingenuity and potential.</li>
            </ul>
          </div>
          <div className='container'>
            <div>
              <h5 className='upcoming-thirdcontainer-individualcontainer-headtext'>A Stage for Emotions and Ideas</h5>
            </div>
            <ul className='upcoming-thirdcontainer-ul'>
              <li>Experience a day where ideas flourish, emotions run high, and connections are forged.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Upcoming