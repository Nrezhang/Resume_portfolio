import React from 'react'
import './About.css'
import profilepic from '../../static/images/profilepic.jpg'


const About = () => {
  return (
    <>
        <div className='about' id='about'>
            <div className='row'>
                <div className='col-md-6 about-img'>                
                  <img src={profilepic} alt="profile pic" />
                </div>
                <div className='col-md-6 about-content'>
                  <h1> About me</h1>
                  <p>

                    Hello, I'm Henry!
                    I'm a Computer Science major at <b>NYU Shanghai</b> with a passion for AI and machine learning, aiming to secure a role
                    that allows me to apply my skills in developing and optimizing AI-driven applications. Bringing
                    hands-on experience with <b> embedding models, data pipelines, and AI development </b> from
                    internships at leading tech firms, I am excited to contribute to cutting-edge AI projects.
                    I enjoy making cool things, and playing around with <b>web development</b> and <b>AI</b>
                    <br></br>
                    I've lived in Virginia, New York, and Shanghai and enjoy learning about new cultures.
                    

                  </p>
                </div>
            </div>
        </div>
    </>
  )
}

export default About