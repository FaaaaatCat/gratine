import React from "react";
import AuthForm from "components/AuthForm";

const Auth = ({userObj, refreshUser, fbUserObj}) => {
    return (
        <div className="login-area">
            <div className="logo"></div>
            <div className="login-box">
                <AuthForm userObj={userObj} fbUserObj={fbUserObj} refreshUser={refreshUser}  />
            </div>
        </div>
    )
}
export default Auth;