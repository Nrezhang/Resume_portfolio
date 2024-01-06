import React from 'react'
import './Home.css'
import Typewriter from 'typewriter-effect'
import resume from '../../static/docs/resume.pdf'
const Home = () => {
  return (
    <>
        <div className='container-fluid home-container'>
            <div className='container home-content'>
                <h1> Henry Zhang</h1>
                <h2>
                    <Typewriter options={{
                    strings: ['CS @ NYU', 'Web Developer'],
                    autoStart: true,
                    loop: true,
                }}/>
                </h2>
                <p>Welcome to my site! I love all things code, and find enjoyment in problem solving :)</p>
                <div className='home-buttons'>
                    <button className='btn btn-hire'> Get in Touch</button>
                    <a className='btn btn-cv' href={resume} download="ZhangHenry_Resume.pdf"> My Resume</a>
                </div>
            </div>
        </div>
    </>
  )
}

export default Home