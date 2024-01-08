import React from 'react'
import './Projects.css'

const Projects = () => {
  return (
    <div>
        <div className='project'>
            <div className='row'>
                <h1 className='col-12 mt-3 mb-1 text-center text-uppercase'>Some Projects</h1>
                <hr/>
                <p className='pb-3 text-center'>
                    Here are links to some of my Recent Projects
                </p>
                <div className='row' id='ads'>
                    <div className='col-md-4'>
                        <div className='card'>
                            <div className='card-image'>
                                <span className='card-notify-badge'>2023</span>
                                <img src="" alt= "project1"/>
                            </div>
                            <div className='card-image-overly'>
                                <span className='card-detail-badge'>info </span>
                                <span className='card-detail-badge'> more</span>
                                <span className='card-detail-badge'> database</span>
                                <span className='card-detail-badge'> React</span>
                            </div>
                            <div className='card-body'>
                                <div className='ad-title'>
                                    <h5>Widget project</h5>
                                    <p>info about project balh blah</p>
                                </div>
                                <a className='ad-btn' href="#">view</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
  )
}

export default Projects