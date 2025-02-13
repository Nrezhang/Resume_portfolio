import React, {useState} from 'react'
import'./Home.css'
import Typewriter from 'typewriter-effect'
import resume from '../../static/docs/resume.pdf'
import { Link } from 'react-scroll';
const Home = () => {
    const [showValentine, setShowValentine] = useState(false);
  return (
    <>
        <div className='container-fluid home-container' id='home'>
            <div className='container home-content'>
                {showValentine ? (
                    <div className='valentine-content'>
                        <h1 className='valentine-title'>Jennifer,</h1>
                        <h2 className='valentine-message'>Will you be my Valentine? ❤️</h2>
                        <p className='valentine-text'>Thank you for going over my resume for me btw</p>
                    </div>
                ) : (
                <>
                <h1> Henry Zhang</h1>
                <h2>
                    <Typewriter options={{
                    strings: ['CS @ NYU', 'Web Developer'],
                    autoStart: true,
                    loop: true,
                }}/>
                </h2>
                <p>Welcome to my site! Scroll down for more!</p>
                <div className='home-buttons'>
                <Link to="contact" spy = {true} smooth={true} duration={100} offset={0}>
                <button className='btn btn-hire'> Get in Touch</button>
                </Link>
                    <a className='btn btn-cv' href={resume} target="_blank" > My Resume</a>
                </div>
                
                </>
                )}
                <div className='home-buttons'>
                 <button className='btn btn-love' onClick={() => setShowValentine(!showValentine)}>
                    {showValentine ? 'Back to Home' : '❤️'}
                </button>
                </div>
                
            </div>
        </div>
    </>
  )
}

export default Home