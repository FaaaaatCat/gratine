import React from "react";
import AuthForm from "components/AuthForm";

const Auth = () => {
    return (
        <div className="login-area">
            <div className="logo-box">로고 이미지</div>
            <div className="login-box">
                <AuthForm />
            </div>
        </div>
    )
}
export default Auth;