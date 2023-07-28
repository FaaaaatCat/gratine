import React from "react";
import AuthForm from "components/AuthForm";

const Auth = ({userObj, refreshUser, fbUserObj}) => {
    return (
        <div className="login-area">
            <div className="logo-box">로고 이미지</div>
            <div className="login-box">
                <AuthForm userObj={userObj} fbUserObj={fbUserObj} refreshUser={refreshUser}  />
            </div>
            <div className="mt-1">v.0.5</div>
        </div>
    )
}
export default Auth;