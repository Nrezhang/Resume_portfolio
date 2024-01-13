import React, {useRef, useState} from 'react'
import './Education.css'
import {MdAccountBalance} from "react-icons/md";
import {VerticalTimeline, VerticalTimelineElement} from 'react-vertical-timeline-component'
import 'react-vertical-timeline-component/style.min.css'

const Education = () => {

    const mapRef = useRef();

  return (
    <>
        <div className='education' id='`education'>
            <div className='education-container container '>
                < h1 className='col-12 mt-3 mb-1 text-center text-uppercase'>Education</h1>
                <hr/>
                <VerticalTimeline layout='1-column-left'>

                    <VerticalTimelineElement
                        
                        className="vertical-timeline-element--work"
                        contentStyle={{ background: 'white', color: 'black', boxShadow:'0px 0px 0px 0px white', borderTop:'5px solid mediumpurple' }}
                        contentArrowStyle={{ borderRight: '7px solid mediumpurple' }}
                        date="August 2021 - Present(expected graduation date: 2025)"
                        iconStyle={{ background: 'mediumpurple', color: 'white' }}
                        icon={<MdAccountBalance />}
                    >
                        <h3 className="vertical-timeline-element-title">BS in Computer Science with a Business Minor</h3>
                        <h4 className="vertical-timeline-element-subtitle">NYU Shanghai</h4>
                        <p>
                            Currently studying in both NYC and Shanghai
                            <br/>
                            GPA: 3.5/4.0 
                        </p>

                    </VerticalTimelineElement>
                    </VerticalTimeline>
                </div>

        </div>
    </>
  )
}

export default Education