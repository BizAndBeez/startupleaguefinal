import React from 'react'
import { useNavigate } from 'react-router-dom'
import './Home.css'
import HomeBgImg from '../../assets/HomeBgImg.png'
import startupleague_logo from '../../assets/startupleague_logo.png'

const Home = () => {
  const navigate = useNavigate()
  const handleLandingPageClick =()=>{
    navigate('/booking')
  }
  return (
    <section id='Home'>
      <div className='HomeContainer'>
        <div className='logo-container'>
          <img className='startupleague_logo' src={startupleague_logo} alt="" />
        </div>
        <div className='home-text-container'> 
          <div className='home-headtext-container'>
            <h1 className='home-head-text'>Empowering Startups to Innovate and Connect</h1>
          </div>
          <div className='home-para-container'>
            <p className='home-para-text'>Join us to unlock growth opportunities and network with industry leaders today!</p>
          </div>
        </div>
        <div className='home-buy-tkts-container'>
          <button onClick={handleLandingPageClick} className='buy-tickets-btn'>Buy Tickets</button>
        </div>
      </div>
    </section>
  )
}

export default Home