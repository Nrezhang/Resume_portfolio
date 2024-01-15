import React from 'react'
import './Experience.css'
import { MdOutlineWorkOutline, MdAccountBalance, MdCall } from "react-icons/md";
import {VerticalTimeline, VerticalTimelineElement} from 'react-vertical-timeline-component'
import 'react-vertical-timeline-component/style.min.css'
const Experience = () => {
  return (
    <>
        <div className='experience' id='experience'>
            <div className='experience-container container'>
                < h1 className='col-12 mt-3 mb-1 pt-30 text-center text-uppercase'>Experience</h1>
                <hr/>

                <VerticalTimeline>

                    <VerticalTimelineElement
                        className="vertical-timeline-element--work"
                        contentStyle={{ background: 'white', color: 'black', boxShadow:'0px 0px 0px 0px white', borderTop:'5px solid dodgerblue' }}
                        contentArrowStyle={{ borderRight: '7px solid dodgerblue' }}
                        date="February 2023 - May 2023"
                        iconStyle={{ background: 'dodgerblue', color: 'white' }}
                        icon={<MdOutlineWorkOutline />}
                    >
                        <h3 className="vertical-timeline-element-title">Technical Project Manager</h3>
                        <h4 className="vertical-timeline-element-subtitle"><a href='jika.io' target='_blank'>Jika.io</a> Intern</h4>
                        <p>
                        Implemented schema to <b>extract</b>, <b>transform</b>, and <b>load</b> user analytics from mongodb to BigQuery
                        </p>
                  
                  </VerticalTimelineElement>

                  <VerticalTimelineElement
                        className="vertical-timeline-element--edu"
                        contentStyle={{ background: 'white', color: 'black', boxShadow:'0px 0px 0px 0px white', borderTop:'5px solid mediumpurple' }}
                        contentArrowStyle={{ borderRight: '7px solid mediumpurple' }}
                        date="2023"
                        iconStyle={{ background: 'mediumpurple', color: 'white' }}
                        icon={<MdAccountBalance />}
                    >
                        <h3 className="vertical-timeline-element-title">Director of Technology</h3>
                        <h4 className="vertical-timeline-element-subtitle"><a href='https://tamidgroup.org/technical-consulting/' target='_blank'>TAMID</a> NYUSH</h4>
                        <p>
                        In charge of inaugural Technical Consulting Chapter at NYU Shanghai. Includes education for members, managing project teams, and correspondence with TAMID Global
                        </p>
                  
                  </VerticalTimelineElement>

                  <VerticalTimelineElement
                        className="vertical-timeline-element--work"
                        contentStyle={{ background: 'white', color: 'black', boxShadow:'0px 0px 0px 0px white', borderTop:'5px solid dodgerblue' }}
                        contentArrowStyle={{ borderRight: '7px solid dodgerblue' }}
                        date="May 2023 - August 2023"
                        iconStyle={{ background: 'dodgerblue', color: 'white' }}
                        icon={<MdOutlineWorkOutline />}
                    >
                        <h3 className="vertical-timeline-element-title">Software Development Intern</h3>
                        <h4 className="vertical-timeline-element-subtitle"><a href='https://aiotlabs.microsoft.com/en' target='_blank'>Microsoft AI Co-Innocation Labs</a> Shanghai</h4>
                        <p>
                        Developed application using AI to facilitate <b>employee-database</b> communication.
                        </p>
                  
                  </VerticalTimelineElement>
                  <VerticalTimelineElement
                        className="vertical-timeline-element--edu"
                        contentStyle={{ background: 'white', color: 'black', boxShadow:'0px 0px 0px 0px white', borderTop:'5px solid mediumpurple' }}
                        contentArrowStyle={{ borderRight: '7px solid mediumpurple' }}
                        date="August 2023 - December 2023"
                        iconStyle={{ background: 'mediumpurple', color: 'white' }}
                        icon={<MdAccountBalance />}
                    >
                        <h3 className="vertical-timeline-element-title">Tech Trek Tutor</h3>
                        <h4 className="vertical-timeline-element-subtitle"><a href='https://techatnyu.org/techtreks' target='_blank'>Tech@NYU</a></h4>
                        <p>
                            Guided project groups in their projects using <b>agile development</b>, using my previous experience with web development, AI, and other necessary tools.

                        </p>
                  
                  </VerticalTimelineElement>

                  <VerticalTimelineElement
                        className="vertical-timeline-element--work"
                        contentStyle={{ background: 'white', color: 'black', boxShadow:'0px 0px 0px 0px white', borderTop:'5px solid orange' }}
                        contentArrowStyle={{ borderRight: '7px solid orange' }}
                        date="present"
                        iconStyle={{ background: 'orange', color: 'white' }}
                        icon={<MdCall />}
                    >
                        <h3 className="vertical-timeline-element-title"><a href="#">Hire Me!</a></h3>

                  
                  </VerticalTimelineElement>
                </VerticalTimeline>

            </div>
        </div>
    </>
  )
}

export default Experience