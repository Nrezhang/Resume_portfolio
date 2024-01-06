import React from 'react'
import './Menus.css'
import profilepic from '../../static/images/profilepic.jpg'
import { AiOutlineIdcard, AiOutlineHome, AiOutlineFileDone, AiOutlineDesktop, AiOutlineBank, AiOutlineFolderOpen, AiOutlineBulb, AiOutlineLink} from "react-icons/ai";
const Menus = ({toggle}) => {
  return (
    <>
    {toggle ?  (
        <div> 
        <div className='nav-items'>
            {/* <div className='spacer'></div> */}
            <div className='nav-item'>
                <div className='nav-link'> <AiOutlineHome title='Home' size = {25} />  </div>
            </div>
            <div className='nav-item'>
                <div className='nav-link'> <AiOutlineIdcard title='About' size = {25}/>  </div>
            </div>
            <div className='nav-item'>
                <div className='nav-link'> <AiOutlineDesktop title='Experience' size = {25}/>  </div>
            </div>
            <div className='nav-item'>
                <div className='nav-link'> <AiOutlineFileDone title='Skills' size = {25}/>  </div>
            </div>
            <div className='nav-item'>
                <div className='nav-link'> <AiOutlineBank title= 'Education' size = {25}/>  </div>
            </div>
            <div className='nav-item'>
                <div className='nav-link'> <AiOutlineFolderOpen title='Projects' size = {25}/>  </div>
            </div>
            <div className='nav-item'>
                <div className='nav-link'> <AiOutlineBulb title = 'Other' size = {25}/>   </div>
            </div>
            <div className='nav-item'>
                <div className='nav-link'> <AiOutlineLink title='Contact' size = {25}/>  </div>
            </div>
        </div>
        </div>
        ) : (
        <div>
        <div className="navbar-profile-pic">
            <img src={profilepic} alt="profile pic" />
        </div>
        <div className='nav-items'>
            <div className='nav-item'>
                <div className='nav-link'> <AiOutlineHome/> Home </div>
            </div>
            <div className='nav-item'>
                <div className='nav-link'> <AiOutlineIdcard/> About </div>
            </div>
            <div className='nav-item'>
                <div className='nav-link'> <AiOutlineDesktop/> Experience </div>
            </div>
            <div className='nav-item'>
                <div className='nav-link'> <AiOutlineFileDone/> Skills </div>
            </div>
            <div className='nav-item'>
                <div className='nav-link'> <AiOutlineBank/> Education </div>
            </div>
            <div className='nav-item'>
                <div className='nav-link'> <AiOutlineFolderOpen/> Projects </div>
            </div>
            <div className='nav-item'>
                <div className='nav-link'> <AiOutlineBulb/> Other  </div>
            </div>
            <div className='nav-item'>
                <div className='nav-link'> <AiOutlineLink/> Contact </div>
            </div>
        </div>
        </div>
        )}
        
    </>
  )
}

export default Menus