import React, {useState} from 'react'
import './Skills.css'
import {languages, tools, other} from '../../utils/skilllist'
const Skills = () => {
    const [selectedSkill, setSelectedSkill] = useState(null);

    const handleCardHover = (skill) => {
        setSelectedSkill(skill);
    };

    const handleCardLeave = () => {
        setSelectedSkill(null);
    };

  return (
    <>
        <div className='skills'>
            <div className='container row skills-heading'>
                <h1 className='text-center'>
                    My Skills 
                </h1>
                <hr />
                <p className='text-center'>
                    Languages, frameworks, and other relevant skills!
                </p>
                <div className="skill-info-container">
                    {selectedSkill ? (''):(
                    <>
                    <h5> Hover over a box for more details! </h5>
                    Proficiency
                    <div class="progress" >
                        <div class="progress-bar bg-success progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" style={{width: '0%', color:'green'}}></div>
                    </div>
                    </>
                        
                    )}
                    {selectedSkill && (
                    <div>
                        <h5>{selectedSkill.name}</h5>
                        Proficiency
                        <div class="progress" >
                            <div class="progress-bar bg-success progress-bar-striped progress-bar-animated" role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100" style={{width: selectedSkill.proficiency, color:'green'}}></div>
                         </div>
                        <p>{selectedSkill.desc}</p>
                        
                    </div>
                    )}
                </div>


                <div className='row'>
                <h4 className='text-center'>
                    Languages
                </h4>
                {languages.map(tech => (
                    <div className='col-md-3'>
                        <div className='card m-2' onMouseOver={() => handleCardHover(tech)} onMouseLeave={handleCardLeave}>
                            <div className='card-content'> 
                                <div className='card-body'>
                                    <div className='media d-flex justify-content-center' >
                                        <div className='alig-self-center'>
                                            <tech.icon className="tech-icon" />
                                        </div>
                                        <div className='media-body'>
                                            <h5>{tech.name}</h5>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
             </div>

             <div className='row'>
                <h4 className='text-center'>
                    Tools and Frameworks
                </h4>
                {tools.map(tech => (
                    <div className='col-md-3'>
                        <div className='card m-2' onMouseOver={() => handleCardHover(tech)} onMouseLeave={handleCardLeave}>
                            <div className='card-content'> 
                                <div className='card-body'>
                                    <div className='media d-flex justify-content-center' >
                                        <div className='alig-self-center'>
                                            <tech.icon className="tech-icon" />
                                        </div>
                                        <div className='media-body'>
                                            <h5>{tech.name}</h5>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
             </div>
             
             <div className='row'>
                <h4 className='text-center'>
                    Other Skills!
                </h4>
                {other.map(tech => (
                    <div className='col-md-3'>
                        <div className='card m-2' onMouseOver={() => handleCardHover(tech)} onMouseLeave={handleCardLeave}>
                            <div className='card-content'> 
                                <div className='card-body'>
                                    <div className='media d-flex justify-content-center' >
                                        <div className='alig-self-center'>
                                            <tech.icon className="tech-icon" />
                                        </div>
                                        <div className='media-body'>
                                            <h5>{tech.name}</h5>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
             </div>
            </div>
            <p></p>

        </div>
    </>
  )
}

export default Skills