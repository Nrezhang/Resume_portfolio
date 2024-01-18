import React from 'react'
import './Projects.css'
import widget from '../../static/images/widget.png'
import airline from '../../static/images/airline.png'
import homepage from '../../static/images/homepage.png'


const Projects = () => {
  return (
    <>
        <div className='project' id='projects'>
            <div className='project-container'>
                <h1 className='col-12 mt-3 mb-1 text-center text-uppercase'>Some Projects</h1>
                <hr/>
                <p className='pb-3 text-center'>
                    Here are links to some of my Recent Projects
                </p>
                <div className='row' id='ads'>
                    <div className='col-md-4'>
                        <div className='card'>
                            <div className='card-image'>
                                <span className='card-notify-badge'>2024</span>
                                <img src={homepage} alt= "project1"/>
                            </div>
                            <div className='card-image-overly'>
                                <span className='card-detail-badge'>MERN</span>
                                <span className='card-detail-badge'> HTML/CSS</span>
                                <span className='card-detail-badge'>Deployment</span>
                            </div>
                            <div className='card-body'>
                                <div className='ad-title'>
                                    <h5>Resume Portfolio</h5>
                                    <p>This Website! Coded from scratch so you can learn about me!</p>
                                </div>
                                <a className='ad-btn' href="#">view</a>
                            </div>
                        </div>
                    </div>
                    <div className='col-md-4'>
                        <div className='card'>
                            <div className='card-image'>
                                <span className='card-notify-badge'>2023</span>
                                <img src={widget} alt= "project1"/>
                            </div>
                            <div className='card-image-overly'>
                                <span className='card-detail-badge'>OpenAI </span>
                                <span className='card-detail-badge'> REST API</span>
                                <span className='card-detail-badge'> React.js</span>
                                <span className='card-detail-badge'> Postgres</span>
                                <span className='card-detail-badge'> Python</span>
                            </div>
                            <div className='card-body'>
                                <div className='ad-title'>
                                    <h5>Natural Language to Database Communication</h5>
                                    <p>Utilizing Langchain Agents, created a chatbot component to enable database communication with AI to generate reports on relational data</p>
                                </div>
                                <a className='ad-btn' target="_blank" href="https://www.canva.com/design/DAFqrVJmc2o/abxTLWYPVzbUUnqm7SZNvQ/view?utm_content=DAFqrVJmc2o&utm_campaign=designshare&utm_medium=link&utm_source=publishsharelink">Presentation</a>
                            </div>
                        </div>
                    </div>
                    <div className='col-md-4'>
                        <div className='card'>
                            <div className='card-image'>
                                <span className='card-notify-badge'>2023</span>
                                <img src={airline} alt= "project1"/>
                            </div>
                            <div className='card-image-overly'>
                                <span className='card-detail-badge'>Django </span>
                                <span className='card-detail-badge'> MySQL</span>
                                <span className='card-detail-badge'> HTML/CSS</span>
                                <span className='card-detail-badge'> User Auth</span>
                            </div>
                            <div className='card-body'>
                                <div className='ad-title'>
                                    <h5>Airline Flight Booking Simulator</h5>
                                    <p>Created a Relational database for the information reqired, and enabled User Authentication for Customers, airlines, and agents to view, change, and purchace flights</p>
                                </div>
                                <a className='ad-btn' target="_blank" href="https://github.com/Nrezhang/AirlineSim">Source Code</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
    
  )
}

export default Projects