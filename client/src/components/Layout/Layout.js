
import React, {useState} from 'react'
import Home from '../../pages/Home/Home'
import "./Layout.css"
import { MdOutlineMenu } from "react-icons/md";
import { MdMenuOpen } from "react-icons/md";
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
                <p onClick={handleToggle}>
                    {
                        toggle? (<MdOutlineMenu size = {30} />) : (<MdMenuOpen size = {30} />)
                    }
                    
                </p>
            </div>
        </div>
        <div className='container'>
        <Home />
        </div>
    </div>
    </>
  )
}

export default Layout