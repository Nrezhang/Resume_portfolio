import React from 'react'
import './Menus.css'
import profilepic from '../../static/images/profilepic.jpg'
import { Link } from 'react-scroll';
import { AiOutlineIdcard, AiOutlineHome, AiOutlineFileDone, AiOutlineDesktop, AiOutlineBank, AiOutlineFolderOpen, AiOutlineBulb, AiOutlineLink} from "react-icons/ai";
const Menus = ({toggle}) => {
  return (
    <>
    {toggle ?  (
        <div> 
        <div className='nav-items row'>
            {/* <div className='spacer'></div> */}
            <div className='nav-item'>
                <div className='nav-link'> 
                <Link to="home" spy = {true} smooth={true} duration={100} offset={0}>

                    <AiOutlineHome title='Home' size = {25} /> 
                </Link>
                 </div>
            </div>
            <div className='nav-item'>
                <div className='nav-link'> 
                <Link to="about" spy = {true} smooth={true} duration={100} offset={0}>
                   <AiOutlineIdcard title='About' size = {25}/>
                 </Link>  </div>
            </div>
            <div className='nav-item'>
                <div className='nav-link'> 
                <Link to="experience" spy = {true} smooth={true} duration={100} offset={0}>
                <AiOutlineDesktop title='Experience' size = {25}/>  
                </Link></div>
            </div>
            <div className='nav-item'>
                <div className='nav-link'> 
                <Link to="skills" spy = {true} smooth={true} duration={100} offset={0}>
                   <AiOutlineFileDone title='Skills' size = {25}/>  
                </Link>
                </div>
            </div>
            <div className='nav-item'>
                <div className='nav-link'>
                    <Link to="education" spy = {true} smooth={true} duration={100} offset={0}>
                     <AiOutlineBank title= 'Education' size = {25}/>  
                    </Link>
                </div>
            </div>
            <div className='nav-item'>
                <div className='nav-link'>
                <Link to="projects" spy = {true} smooth={true} duration={100} offset={0}>
                 <AiOutlineFolderOpen title='Projects' size = {25}/> 
                 </Link>
                  </div>
            </div>
            {/* <div className='nav-item'>
                <div className='nav-link'> <AiOutlineBulb title = 'Other' size = {25}/>   </div>
            </div> */}
            <div className='nav-item'>
                <div className='nav-link'>
                <Link to="contact" spy = {true} smooth={true} duration={100} offset={0}>
                     <AiOutlineLink title='Contact' size = {25}/> 
                     </Link>
                      </div>
            </div>
        </div>
        </div>
        ) : (
        <div>
        <div className="navbar-profile-pic">
            <img src={profilepic} alt="profile pic" />
        </div>
        <div className='nav-items row'>
            <div className='nav-item'>
                <div className='nav-link'>
                    <Link to="home" spy = {true} smooth={true} duration={100} offset={0}>
                        <AiOutlineHome/> Home
                    </Link> 
                 </div>
            </div>
            <div className='nav-item'>
                <div className='nav-link'>
                <Link to="about" spy = {true} smooth={true} duration={100} offset={0}>
                     <AiOutlineIdcard/> About 
                </Link>
                </div>
            </div>
            <div className='nav-item'>
                <div className='nav-link'> 
                <Link to="experience" spy = {true} smooth={true} duration={100} offset={0}>
                    <AiOutlineDesktop/> Experience 
                </Link>
                </div>
            </div>
            <div className='nav-item'>
                <div className='nav-link'>
                <Link to="skills" spy = {true} smooth={true} duration={100} offset={0}>

                    <AiOutlineFileDone/> Skills 
                </Link>
                </div>
            </div>
            <div className='nav-item'>
                <div className='nav-link'>
                <Link to="education" spy = {true} smooth={true} duration={100} offset={0}>

                     <AiOutlineBank/> Education 
                </Link>
                </div>
            </div>
            <div className='nav-item'>
                <div className='nav-link'> 
                <Link to="projects" spy = {true} smooth={true} duration={100} offset={0}>

                    <AiOutlineFolderOpen/> Projects 
                </Link>
                </div>
            </div>
            {/* <div className='nav-item'>
                <div className='nav-link'> <AiOutlineBulb/> Other  </div>
            </div> */}
            <div className='nav-item'>
                <div className='nav-link'> 
                <Link to="contact" spy = {true} smooth={true} duration={100} offset={0}>

                    <AiOutlineLink/> Contact 
                </Link>
                </div>
            </div>
        </div>
        </div>
        )}
        
    </>
  )
}

export default Menus