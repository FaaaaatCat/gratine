import React, { useState } from "react";
import AuthForm from "components/AuthForm";
import sunShine from "../images/lensFlare.jpg"

const Auth = ({ userObj, refreshUser, fbUserObj }) => {
    const [theme, setTheme] = useState('theme-wood');
    const changeTheme = (e) => {
        e.preventDefault();
        const selectedTheme = 'theme-' + e.target.innerHTML
        setTheme(selectedTheme)
    }
    return (
        <div className={'login-area ' + theme}>
            <img className="sunshine" src={sunShine}></img>
            <div className="logo logo_black"></div>
            <AuthForm userObj={userObj} fbUserObj={fbUserObj} refreshUser={refreshUser}  />
            <div className="copyright">
                Copyright 2023. @topports All rights reserved.
            </div>
            {/* <div className="theme-btn">
                <button onClick={changeTheme}>spring</button>
                <button onClick={changeTheme}>wood</button>
            </div> */}
        </div>
    )
}
export default Auth;