import React, { useState } from "react";
import { getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider} from "firebase/auth";

const AuthForm = () => {
    const auth = getAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [newAccount, setNewAccount] = useState(true);
    const [error, setError] = useState("");

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

    //로그인 기능
    const onChange = (event) => {
        const {
            target: {name, value}
        } = event;
        if(name ==="email"){
            setEmail(value);
        }
        else if (name === "password"){
            setPassword(value);
        }
    };

    const onSubmit = async(event) => {
        event.preventDefault();
        try{
            let data;
            if(newAccount){
                //create account
                // data = await auth.createUserWithEmailAndPassword(
                //     email, password
                // )
                data = await createUserWithEmailAndPassword(
                    auth, email, password
                )
            }
            else{
                //log in
                data = await signInWithEmailAndPassword(
                    auth, email, password
                )
            }
            //console.log(data)
        }
        catch(error){
            setError(error.message);
        }
    }

    const toggleAccount = () => setNewAccount((prev) => !prev);
    
    return (
        <div className="login-form-wrap">
            <button className="gtn-btn btn-google" onClick={onSocialClick} name="google">구글 계정으로 로그인</button>
            <div className="login-title">
                {newAccount ? <p>그라티네의 정원 <span>가입하기</span></p> : <span>로그인</span>}
            </div>
            <form onSubmit={onSubmit}>
                <input
                    className="gtn-input"
                    name="email"
                    type="email"
                    placeholder="Email"
                    required
                    value={email}
                    onChange={onChange}
                />
                <input
                    className="gtn-input"
                    name="password"
                    type="password"
                    placeholder="Password"
                    required
                    value={password}
                    onChange={onChange}
                />
                <button className="gtn-btn w-100" type="submit">{newAccount ? "Create Account" : "Log In"}</button>
                {error}
            </form>
            <span className="login-sub-txt" onClick={toggleAccount}>
                {newAccount ? <div>이미 계정이 있나요? <span>로그인</span></div> : "새 계정 만들기"}
            </span>
        </div>
    );
};

export default AuthForm;