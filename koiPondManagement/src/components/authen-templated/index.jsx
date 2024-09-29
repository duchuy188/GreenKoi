import React from 'react'
import "./index.css"

function AuthenTemplate({ children }) {
  return (
    <div className="authen-template">
        <div >
            <div className="authen-template_form">{ children }</div>
        </div>
    </div>
  )
}

export default AuthenTemplate