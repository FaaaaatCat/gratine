import React, { useState } from "react";
import { getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider
} from "firebase/auth";
import { dbService, storageService } from '../fbase';
import { collection, addDoc} from "firebase/firestore";

const AuthForm = ({userObj, refreshUser}) => {
    const auth = getAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [nickName, setnickName] = useState("");
    const [photo, setPhoto] = useState("");
    const [newAccount, setNewAccount] = useState(false);
    const [error, setError] = useState("");
    const [profilePic, setProfilePic] = useState("");

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
        // else if (name === "nickName"){
        //     setnickName(value);
        // }
    };

    const onSubmit = async (event) => {
        event.preventDefault();
        try{
            let data;
            if(newAccount){
                data = await createUserWithEmailAndPassword(
                    auth, email, password
                )
                //[회원가입시] 유저 정보 저장
                const userGameObj = {
                    uid: auth.currentUser.uid,
                    email: auth.currentUser.email,
                    attendCount : 0,
                    attendRanNum: 0,
                    totalAttend: 0,
                }
                const fbUserObj = {
                    uid: auth.currentUser.uid,
                    email: email,
                    password: password,
                    gold: 0,
                    item: '완드, 학생증',
                    login: true,
                    displayName: '',
                    photoURL: '',
                }
                await addDoc(collection(dbService, "user"), fbUserObj);
                await addDoc(collection(dbService, "userGame"), userGameObj);
            }
            else{
                data = await signInWithEmailAndPassword(
                    auth, email, password
                )
            }
        }
        catch(error){
            setError(error.message);
        }
    }

    //프로필 사진 추가
    const onProfileChange = async (e) => {
        const thePic = e.target.files[0];
        const picReader = new FileReader();
        picReader.onloadend = (finishedEvent) => {
            setProfilePic(finishedEvent.target.result) //이거 개짱김
        }
        picReader.readAsDataURL(thePic);
    };

    const toggleAccount = () => setNewAccount((prev) => !prev);
    
    return (
        <div className="login-form-wrap">
            {/* <button className="gtn-btn btn-google" onClick={onSocialClick} name="google">구글 계정으로 로그인</button> */}
            <div className="login-title">
                {newAccount ?  <p>그라티네의 정원 <span>가입하기</span></p> : <p>그라티네의 정원에 <span>어서오세요</span></p>}
            </div>
            <form onSubmit={onSubmit}>
                {newAccount && 
                    <>
                        <div className="notice-box">
                            <p>가입 전, 공지사항을 확인해주세요!</p>
                            <a href="https://www.naver.com/" target="_blank">▶ 공지사항 바로가기</a>
                        </div>
                        {/* <input
                            className="gtn-input"
                            name="nickName"
                            type="text"
                            placeholder="캐릭터 이름"
                            required
                            value={nickName}
                            onChange={onChange}
                        /> */}
                    </>
                }
                <input
                    className="gtn-input"
                    name="email"
                    type="email"
                    placeholder="이메일 (email@gratine.com)"
                    required
                    value={email}
                    onChange={onChange}
                />
                <input
                    className="gtn-input"
                    name="password"
                    type="password"
                    placeholder="비밀번호"
                    required
                    value={password}
                    onChange={onChange}
                />
                <button className="gtn-btn btn-white w-100" type="submit">
                    {newAccount ? "가입 완료" : "로그인"}
                    <span></span><span></span><span></span><span></span>
                </button>
                <p>{error}</p>
            </form>
            <span className="login-sub-txt" onClick={toggleAccount}>
                {newAccount ?
                    <div>이미 계정이 있나요?
                        <span>로그인</span>
                    </div>
                    : <div>신입생인가요?
                        <span>회원가입</span>
                    </div>}
            </span>
        </div>
    );
};

export default AuthForm;