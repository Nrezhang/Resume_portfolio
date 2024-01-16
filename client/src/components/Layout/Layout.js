
import React, {useState} from 'react'
import Home from '../../pages/Home/Home'
import "./Layout.css"
import { MdOutlineMenu, MdMenuOpen } from "react-icons/md";
import Menus from '../Menus/Menus';
const Layout = () => {
    const [toggle, setToggle] = useState(true)
    const handleToggle = () => {
        setToggle(!toggle)
    }
  return (
    <>
    <div className = "sidebar-section">
        <div className = {toggle ?  "sidebar" : "sidebar-toggle sidebar"}>
            <div className="sidebar-toggle-icons">
                
                <div className="sidebar-toggle-icons-div" onClick={handleToggle}>
                    {
                        toggle? (
                        <MdOutlineMenu size = {30} />
                        ) : (
                        <MdMenuOpen size = {30} />
                        )
                    }
                </div>
                <Menus toggle = {toggle}/>
            </div>
        </div>

        <div className=''>
        <Home />
        </div>
    </div>
    </>
  )
}

export default Layout