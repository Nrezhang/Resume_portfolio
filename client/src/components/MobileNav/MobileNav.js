import React, {useState} from 'react'
import "./MobileNav.css"
import { MdOutlineMenu, MdMenuOpen } from "react-icons/md";
import { Link } from 'react-scroll';
import { AiOutlineIdcard, AiOutlineHome, AiOutlineFileDone, AiOutlineDesktop, AiOutlineBank, AiOutlineFolderOpen, AiOutlineBulb, AiOutlineLink} from "react-icons/ai";


const MobileNav = () => {

    const[open, setOpen] = useState(false)
    const handleOpen = () => {
        setOpen(!open)
    }
  return (
    <>
    <div className = "mobile-nav">
            <div className = "mobile-nav-header">
                {open?(<MdMenuOpen size={30} onClick={handleOpen}/>):(<MdOutlineMenu size = {30} onClick={handleOpen} />)}
                
                <span className='mobile-nav-title'> My Portfolio</span>
            </div>

            {open && (
                  <div className='mobile-nav-items'>
                  <div className='nav-items row'>
                      <div className='nav-item'>
                          <div className='nav-link'>
                              <Link to="home" spy = {true} smooth={true} duration={100} offset={0} onClick={handleOpen}>
                                  <AiOutlineHome/> Home
                              </Link> 
                          </div>
                      </div>
                      <div className='nav-item'>
                          <div className='nav-link'>
                          <Link to="about" spy = {true} smooth={true} duration={100} offset={0} onClick={handleOpen}>
                              <AiOutlineIdcard/> About 
                          </Link>
                          </div>
                      </div>
                      <div className='nav-item'>
                          <div className='nav-link'> 
                          <Link to="experience" spy = {true} smooth={true} duration={100} offset={0} onClick={handleOpen}>
                              <AiOutlineDesktop/> Experience 
                          </Link>
                          </div>
                      </div>
                      <div className='nav-item'>
                          <div className='nav-link'>
                          <Link to="skills" spy = {true} smooth={true} duration={100} offset={0} onClick={handleOpen}>
  
                              <AiOutlineFileDone/> Skills 
                          </Link>
                          </div>
                      </div>
                      <div className='nav-item'>
                          <div className='nav-link'>
                          <Link to="education" spy = {true} smooth={true} duration={100} offset={0} onClick={handleOpen}>
  
                              <AiOutlineBank/> Education 
                          </Link>
                          </div>
                      </div>
                      <div className='nav-item'>
                          <div className='nav-link'> 
                          <Link to="projects" spy = {true} smooth={true} duration={100} offset={0} onClick={handleOpen}>
  
                              <AiOutlineFolderOpen/> Projects 
                          </Link>
                          </div>
                      </div>
                      {/* <div className='nav-item'>
                          <div className='nav-link'> <AiOutlineBulb/> Other  </div>
                      </div> */}
                      <div className='nav-item'>
                          <div className='nav-link'> 
                          <Link to="contact" spy = {true} smooth={true} duration={100} offset={0} onClick={handleOpen}>
  
                              <AiOutlineLink/> Contact 
                          </Link>
                          </div>
                      </div>
              </div>
              </div>
            )}
          
                
    </div>
    </>
  )
}

export default MobileNav