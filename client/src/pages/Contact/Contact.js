import React, {useState} from 'react'
import './Contact.css'
import axios from 'axios'
import {toast} from 'react-toastify'
import { FaLinkedin, FaGithub, FaGoogle } from "react-icons/fa";


const Contact = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault();
    try{
      if(!name || !email || !msg){
        toast.error('Please fill out all fields')
      }
      else if(!email.includes('@')){
        toast.error('Please enter a valid email')
      }
      else{
        const res = await axios.post('https://resume-portfolio-api.vercel.app/api/v1/portfolio/sendEmail', {name, email, msg})   //ISSUES
        if(res.data.success){
          toast.success('Your Message was Sent')
          setName('')
          setEmail('')
          setMsg('')
        }
        else{
          toast.error('Your message failed to send')
        }
        console.log(name, email, msg)
      }
      }
    catch(error){
      console.log(error)
      toast.error('somethings not working' + error)
    }
  }
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
                    <input className='mb-4' type='text' name='name' placeholder='Enter your name' value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className='row px-3'>
                    <label className='mb-1'>
                      <h6 className='mb-0 text-sm'>Email Address</h6>
                    </label>
                    <input className='mb-4' type='text' name='email' placeholder='Enter a valid email address' value={email} onChange={(e) => setEmail(e.target.value)}/>
                  </div>
                  <div className='row px-3'>
                    <label className='mb-1'>
                      <h6 className='mb-0 text-sm'>Message</h6>
                    </label>
                    <textarea className='mb-4' rows='5' cols='50' name='message' placeholder='Enter a message' value = {msg} onChange={(e) => setMsg(e.target.value)}/>
                  </div>
                  <div className='row mb-3 px-3'>
                    <button type='submit' className='btn btn-blue text-center' onClick={handleSubmit}>Send</button>
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