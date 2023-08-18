import React, { useEffect, useState } from "react";
import { dbService, storageService } from '../fbase';
import { collection, addDoc, query, onSnapshot, orderBy,where, doc, getDocs, updateDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Link } from 'react-router-dom';
import Nweet from "components/Nweet";
import NweetFactory from "components/NweetFactory";
import Profile from "./Profile";
import Member from "./Member";
import Vending from "./Vending";
import Attend from "./Attend";
import plantImg from '../images/plant.png'
import light from '../images/후광.png'

const Home = ({ userObj, refreshUser, isLoggedIn, fbUserObj, attendObj }) => {
    const auth = getAuth();
    const [nweets, setNweets] = useState([]);
    const [infoView, setInfoView] = useState(false);

    //명령어 모음
    let orderList = ['10', '50', '100', '선택']
    
    //트윗 읽어오기 기능
    useEffect(() => {
        const q = query(
            collection(dbService, "nweets"),
            orderBy("createdAt", "desc")
        );
        const unsubscribe = onSnapshot(q, (Snapshot) => {
            const nweetArray = Snapshot.docs.map((doc) => { //snapshot : 트윗을 받을때마다 알림 받는곳. 새로운 스냅샷을 받을때 nweetArray 라는 배열을 만듬
                return {
                    id: doc.id,
                    ...doc.data(), //...은 데이터의 내용물, 즉 spread attribute 기능임
                };
            });
            setNweets(nweetArray); //nweets에 nweetArray 라는 배열을 집어 넣음. 배열엔 doc.id와 doc.data()가 있음
        });
        onAuthStateChanged(auth, (user) => {
            if (user == null) {
                unsubscribe();
            }
        });
    }, []);

    //출석창 info hover 기능
    const viewInfo = () => {
        setInfoView(true)
    }
    const hideInfo = () => {
        setInfoView(false)
    }

    //지난대화기록 새창 띄우기
    const openHistoryWindow = () => {
        const newWindow = window.open('', '_blank');
        newWindow.location.href = 'https://www.google.com';
        // newWindow.location.href = './History.js';
        //newWindow.document.write('<html><body><h1>New Window</h1></body></html>');
    };


    
    return (
        <>
            <Profile
                userObj={userObj}
                refreshUser={refreshUser}
                fbUserObj={fbUserObj}
            />
            <div className="chatting-area">
                <div className="logo-box">
                    <div className="logo">로고</div>
                </div>
                <div className="chatting-list-container">
                    {nweets.map((nweet) => ( //map은 for과 유사함. 배열안의 값들을 다 불러와주는 기능 / 지금으로썬, nweets 배열안의 데이터(doc.id / doc.data())를 다 불러옴
                        <Nweet
                            key={nweet.id}
                            nweetObj={nweet} //id, createdAt, text 등 생성한 값 갖고있음
                            isOwner={nweet.creatorId === userObj.uid} //내가 실제 주인인지 //맞으면 true 값 뱉음
                            isOrder={nweet.orderText !== ""}
                            orderText={nweet.orderText}
                            orderWhat={nweet.orderWhat}
                            isWhole={nweet.orderWhat === "/전체"}
                            isDice={nweet.orderWhat === "/주사위" && orderList.includes(nweet.orderText)}
                            isBuy={nweet.buy === true}
                        />
                    ))}
                </div>
                <div className="chatting-form-box">
                    <NweetFactory
                        userObj={userObj}
                        refreshUser={refreshUser}
                        fbUserObj={fbUserObj}
                    />
                </div>
            </div>
            <div className="side-area">
                <div className="member-area">
                    <div className="title">모든 멤버</div>
                    <Member
                        userObj={userObj}
                        isLoggedIn={isLoggedIn}
                        fbUserObj={fbUserObj}
                    />
                </div>
                <div className="attend-area">
                    <div className="title">화분키우기 (출석 보상)
                        <span className="info-wrap">
                            <div
                                className="info-btn"
                                onMouseOver={viewInfo}
                                onMouseOut={hideInfo}
                            >
                                <span className="material-icons-round">info</span>
                            </div>
                            <div className={'info-box ' + (infoView? '':'d-none')}>
                                <div className="img-wrap">
                                    <img src={plantImg} alt="" />
                                    <img src={light} alt="" />
                                </div>
                                <p>
                                    출석시 1~10 사이의 랜덤 경험치를 생성합니다.<br />
                                    경험치를 모아 화분을 완성해보세요.
                                </p>
                            </div>
                        </span>
                    </div>
                    <Attend
                        attendObj={attendObj}
                        userObj={userObj}
                        refreshUser={refreshUser}
                    />
                </div>
                <div className="vending-area">
                    <div className="title">상점</div>
                    <Vending
                        userObj={userObj}
                        fbUserObj={fbUserObj}
                    />
                </div>
                <div className="history-area">
                    <div className="title">지난 대화기록 보기
                        <button className="gtn-btn btn-icon-only ml-auto" onClick={openHistoryWindow}>
                            <span className="material-icons-round">arrow_forward</span>
                        </button>
                        {/* <Link to="/History" target="_blank">
                            테스트로 히스토리 가기
                        </Link> */}
                    </div>
                </div>
            </div>
        </>
    );
}
export default Home;