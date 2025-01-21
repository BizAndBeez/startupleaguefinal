import React from 'react'
import './Features.css'
import dynamicImg from '../../assets/dynamicimg.png'
import fundimg from '../../assets/fundimg.png'
import educationimg from '../../assets/educationimg.png'
import mentorshipimg from '../../assets/mentorshipimg.png'
import showcasingimg from '../../assets/showcasingimg.png'
import networkimg from '../../assets/networkimg.png'

const Features = () => {
  return (
    <section id='Features'>
      <div className='features-container'>
        <div>
          <h2 className='features-headtext'>Key Features and Offerings</h2>
        </div>
        <div className='offerings-container'>
          <div className='individual-offer-container'>
            <img className='individual-offer-icon' src={dynamicImg} alt="startup league" />
            <h3 className='individual-offer-headtext'>Dynamic Event Listing</h3>
            <div className='individual-offer-paracontainer'>
              <p className='individual-offer-paratext'>We feature a comprehensive calendar of upcoming
                startup events, including pitch competitions, networking
                sessions, workshops, and industry conferences.
              </p>
            </div>
          </div>
          <div className='individual-offer-container'>
            <img className='individual-offer-icon' src={networkimg} alt="startup league" />
            <h3 className='individual-offer-headtext'>NETWORKING OPPORTUNITES</h3>
            <div className='individual-offer-paracontainer'>
              <p className='individual-offer-paratext'>Our events are designed to connect entrepreneurs with mentors,
                investors, and industry leaders. Participants will have the chance
                to network during designated sessions and informal meet-ups, opening
                doors to potential partnerships and collaborations.
              </p>
            </div>
          </div>
          <div className='individual-offer-container'>
            <img className='individual-offer-icon' src={fundimg} alt="startup league" />
            <h3 className='individual-offer-headtext'>ACCESS FUNDING</h3>
            <div className='individual-offer-paracontainer'>
              <p className='individual-offer-paratext'>We feature a comprehensive calendar of upcoming
                sStartup League events host a variety of investors looking to fund innovative
                ideas. Entrepreneurs can pitch their startups directly to these potential
                investors, gaining invaluable exposure and the chance to secure financial backing.
              </p>
            </div>
          </div>
          <div className='individual-offer-container'>
            <img className='individual-offer-icon' src={mentorshipimg} alt="startup league" />
            <h3 className='individual-offer-headtext'>Mentorship  From Experts</h3>
            <div className='individual-offer-paracontainer'>
              <p className='individual-offer-paratext'>We facilitate access to seasoned entrepreneurs and business leaders who
                offer guidance, insights, and feedback to attending startups. This mentorship
                is critical for helping new businesses navigate challenges, refine their
                strategies, and accelerate growth.
              </p>
            </div>
          </div>
          <div className='individual-offer-container'>
            <img className='individual-offer-icon' src={educationimg} alt="startup league" />
            <h3 className='individual-offer-headtext'>Educational Workshops </h3>
            <div className='individual-offer-paracontainer'>
              <p className='individual-offer-paratext'>Workshops focusing on essential topics such as fundraising strategies, marketing
                techniques, product development, and business scalability are integral to our events.
                These sessions are aimed at equipping entrepreneurs with the tools they need to succeed.
              </p>
            </div>
          </div>
          <div className='individual-offer-container'>
            <img className='individual-offer-icon' src={showcasingimg} alt="startup league" />
            <h3 className='individual-offer-headtext'>Showcasing Innovation</h3>
            <div className='individual-offer-paracontainer'>
              <p className='individual-offer-paratext'>Our events provide startups with a platform to exhibit their groundbreaking solutions through
                live demonstrations. This unique opportunity allows entrepreneurs to connect directly with
                investors, industry leaders, and attendees, gathering valuable feedback while amplifying
                visibility and fostering potential collaborations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Features