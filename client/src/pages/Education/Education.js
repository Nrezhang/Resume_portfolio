import React, {useRef, useState} from 'react'
import './Education.css'
import {VectorMap} from 'react-jvectormap'
const Education = () => {

    const mapRef = useRef();

  return (
    <>
        <div className='education'>
            <div className='education-container container'>
                < h1 className='col-12 mt-3 mb-1 text-center text-uppercase'>Education</h1>
                <hr/>

                <VectorMap
              
                    ref={mapRef}
                    // zoomOnScroll={false}
                    // zoomButtons={false}
                    map={"world_mill"}
                    backgroundColor="mediumpurple"
                    containerStyle={{
                        width: "100%",
                        height: "100%"
                    }}
                    markerStyle={{
                        initial: {
                        fill: "#5E32CA",
                        stroke: "#383f47"
                        }
                    }}
                    containerClassName="map"
                    markers={[
                        {
                        latLng: [31.2244, 121.4692],
                        name: "Shanghai"
                        },
                        {
                            latLng: [40.7128, -74.0060],
                            name: "New York"
                        },
                        {
                            latLng: [38.8181, -77.1680],
                            name: "Virginia"
                        }
                            
                    ]}
                    />

            </div>
        </div>
    </>
  )
}

export default Education