import React from "react";
import { getAuth,
    signInWithPopup,
    GoogleAuthProvider, } from "firebase/auth";
import AuthForm from "components/AuthForm";

const Auth = () => {
    const auth = getAuth();

    //소셜 로그인 기능
    const onSocialClick = async(event) => {
        const {
            target: { name },
        } = event;
        let provider;
        if(name === "google"){
            provider = new GoogleAuthProvider();
            // const result = await signInWithPopup(auth, provider);
            // const credential = GoogleAuthProvider.credentialFromResult(result);
        }
        await signInWithPopup(auth, provider);
    }

    return (
        <div>
            <AuthForm />
            <button onClick={onSocialClick} name="google">Continue with Google</button>
        </div>
    )
}
export default Auth;