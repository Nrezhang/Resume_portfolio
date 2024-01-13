import React from 'react'
import './Contact.css'
import { FaLinkedin, FaGithub, FaGoogle } from "react-icons/fa";


const Contact = () => {
  return (
    <div className='contact' id='contact'>
      <div className='contact-container'>
        <div className='card card0 border-0'>
            <div className='col-md-6 col-lg-6 col-xk-6 col-sm-12'>
              <div className='card2'>
                <div className='row'>
                  <div className='card2 border-0 px-4 py-5'>
                    <h1>Find me at:</h1>
                    <h5>
                      <a className='a' href='https://www.linkedin.com/in/henryszhang/' target='_blank'><FaLinkedin className='icon' /></a>
                      <a id='b' href='https://github.com/Nrezhang' target='_blank'><FaGithub className='icon' /></a>
                      <a id='c' href= "mailto: hsz2011@nyu.edu"><FaGoogle className='icon' /></a>
                    </h5>
                  </div>
                  <div className='row px-3 mb-4'>
                    <div className='line'></div>
                    <small className='or text-center'>OR</small>
                    <div className='line'></div>
                  </div>
                  <div className='row px-3'>
                    <label className='mb-1'>
                      <h6 className='mb-0 text-sm'> Name</h6>
                    </label>
                    <input className='mb-4' type='text' name='name' placeholder='Enter your name' />
                  </div>
                  <div className='row px-3'>
                    <label className='mb-1'>
                      <h6 className='mb-0 text-sm'>Email Address</h6>
                    </label>
                    <input className='mb-4' type='text' name='email' placeholder='Enter a valid email address' />
                  </div>
                  <div className='row px-3'>
                    <label className='mb-1'>
                      <h6 className='mb-0 text-sm'>Message</h6>
                    </label>
                    <textarea className='mb-4' rows='5' cols='50' name='message' placeholder='Enter a message' />
                  </div>
                  <div className='row mb-3 px-3'>
                    <button type='submit' className='btn btn-blue text-center'>Send</button>
                  </div>
                </div>
              </div>
              </div>
  
  
            </div>
        </div>
        
    </div>
  )
}

export default Contact