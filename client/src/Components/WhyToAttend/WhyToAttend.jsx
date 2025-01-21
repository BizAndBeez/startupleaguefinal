import React from 'react'
import './WhyToAttend.css'

const WhyToAttend = () => {
  return (
    <section id='WhyToAttend'>
      <div className='whytoattend-container'>
        <div>
          <h3 className='whytoattend-headtext'>Why Attend Startup League 2025?</h3>
        </div>
        <div className='whyto-container-individual'>
          <div className='whytoattend-individual-container'>
            <div>
              <h4 className='whytoattend-individual-container-headtext'>For Entrepreneurs</h4>
            </div>
            <div className='whytoattend-individual-container-paracontainer'>
              <p className='whytoattend-individual-container-paratext'>Get the opportunity to pitch your idea, showcase your product, and connect with investors who can bring your vision to life.</p>
            </div>
          </div>

          <div className='whytoattend-individual-container'>
            <div>
              <h4 className='whytoattend-individual-container-headtext'>For Investors</h4>
            </div>
            <div className='whytoattend-individual-container-paracontainer'>
              <p className='whytoattend-individual-container-paratext'> Discover game-changing startups, connect with brilliant founders, and invest in the future.</p>
            </div>
          </div>

          <div className='whytoattend-individual-container'>
            <div>
              <h4 className='whytoattend-individual-container-headtext'>For Innovators and Enthusiasts</h4>
            </div>
            <div className='whytoattend-individual-container-paracontainer'>
              <p className='whytoattend-individual-container-paratext'>Gain inspiration from success stories, participate in thought-provoking discussions, and witness the future of innovation.</p>
            </div>
          </div>
        </div>
        <div className='whytoattend-endpara-container'>
          <p className='whytoattend-endpara1'>Don’t miss this golden opportunity to be part of Startup League Event 2025. Join us in creating the next big wave of innovation and entrepreneurship!</p>
          <p className='whytoattend-endpara2'>Reserve your spot today and let’s build the future together.</p>
        </div>
      </div>
    </section>
  )
}

export default WhyToAttend