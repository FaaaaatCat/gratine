import React, { useState } from "react";
import { getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider
} from "firebase/auth";
import { dbService, storageService } from '../fbase';
import { collection, addDoc } from "firebase/firestore";
import symbol from "../images/symbol.png"
import border from "../images/decoLine_1.png"
import frame from "../images/frame_1.png"

const AuthForm = ({userObj, refreshUser}) => {
    const auth = getAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [newAccount, setNewAccount] = useState(false);
    const [error, setError] = useState("");
    const [profilePic, setProfilePic] = useState("");
    const defaultProfile = 'https://firebasestorage.googleapis.com/v0/b/gratia-2cdd0.appspot.com/o/gratine%2Fdefault_profile.png?alt=media&token=9003c59f-8f33-4d0a-822c-034682416355';

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

    const onSubmit = async (event) => { 
        event.preventDefault();
        try{
            let data;
            if(newAccount){
                data = await createUserWithEmailAndPassword(
                    auth, email, password
                )
                //[회원가입시] 유저 정보 저장
                const fbUserObj = {
                    uid: auth.currentUser.uid,
                    email: email,
                    gold: 0,
                    item: '완드, 학생증',
                    hp: 100,
                    login: true,
                    displayName: auth.currentUser.email.split("@")[0],
                    photoURL: defaultProfile,
                    attendCount : 0,
                    attendRanNum: 0,
                    totalAttend: 0,
                    attendDate: '',
                }
                await addDoc(collection(dbService, "user"), fbUserObj);
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
        <>
            <div className={"login-letter"}>
                <div className="frame-1"></div>
                <div className="frame-2"></div>
                <div className="frame-3"></div>
                <div className="frame-4"></div>
                {/* <button className="gtn-btn btn-google" onClick={onSocialClick} name="google">구글 계정으로 로그인</button> */}
                <img src={symbol} className="symbol" alt="" />
                <div className="login-cont-wrap">
                    <div className="login-txt-wrap">
                        <div className="login-title">
                            {newAccount ?  <p><span>그라티네의 정원</span><br></br>가입하기</p> : <p><span>그라티네의 정원</span>에<br></br>어서오세요</p>}
                        </div>
                        <p>*현재 회원가입을 <br></br> 받고 있지 않습니다.</p>
                        {/* <span className="login-sub-txt" onClick={toggleAccount}>
                            {newAccount ?
                                <div>이미 계정이 있나요?
                                    <span>로그인</span>
                                </div>
                                : <div>신입생인가요?
                                    <span>회원가입</span>
                                </div>}
                        </span> */}
                    </div>
                    <form onSubmit={onSubmit}>
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
                </div>
                <div className="border">
                    <div className="line">
                        <div></div>
                        <div></div>
                    </div>
                    <img src={frame} alt="" />
                </div>
                {newAccount ? 
                    <>
                        <div className="notice-box">
                            <b>[ 회원가입 시 유의사항 ]</b>
                            <p>아이디는 <b>'자유@gratine.com'</b> 으로 생성해주세요.</p>
                            <p>비밀번호 찾기 기능이 없으므로 기억하기 <b>쉬운 비밀번호로</b> 가입하시는것을 권장합니다.</p>
                            <p>회원가입 정보는 커뮤엔딩과 함께 <b>모두 삭제</b>됩니다.</p>
                        </div>
                    </> :
                    <>
                        <div className="notice-box">
                            <p>커뮤니티 [그라티네의 정원]의 전용 사이트입니다.</p>
                            <a href="https://docs.google.com/document/d/1Po3q7xZiM9nLc_9CzYb7xaNNjJLknul85RWugzW5Ljs/edit?usp=sharing" target="_blank">▶ 시스템 문서 바로가기</a>
                        </div>
                        {/* <div className="login-functions">
                            <div className="function-item">
                                <div className="img"></div>
                                <p>공지사항</p>
                            </div>
                            <div className="function-item">
                                <div className="img"></div>
                                <p>상점계</p>
                            </div>
                            <div className="function-item">
                                <div className="img"></div>
                                <p>진행계</p>
                            </div>
                        </div> */}
                    </>
                }
            </div>
        </>
    );
};

export default AuthForm;