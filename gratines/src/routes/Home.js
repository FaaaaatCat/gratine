import React, { useEffect, useState } from "react";
import { dbService, storageService } from '../fbase';
import { collection, addDoc, query, onSnapshot, orderBy,where, doc, getDocs, updateDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import Nweet from "components/Nweet";
import NweetFactory from "components/NweetFactory";
import Profile from "./Profile";
import plantImg from '../images/plant.png'
import moment from "moment";

const Home = ({ userObj, refreshUser, isLoggedIn, fbUserObj, attendObj }) => {
    var gratineUser = JSON.parse(localStorage.getItem("gratineUser"));
    const auth = getAuth();
    const [nweets, setNweets] = useState([]);
    const [gameObj, setGameObj] = useState(null);

    // var uid = auth.currentUser.uid;
    // const userStatusDatabaseRef = ref(storageService, `/status/${userObj.uid}`);
    // var isOfflineForDatabase = {
    //     state: 'offline',
    //     last_changed: storageService.ServerValue.TIMESTAMP,
    // };
    // var isOnlineForDatabase = {
    //     state: 'online',
    //     last_changed: storageService.ServerValue.TIMESTAMP,
    // };
    // ref(storageService, '.info/connected').on('value', function(snapshot) {
    //     if (snapshot.val() == false) {
    //         return;
    //     };
    //     userStatusDatabaseRef.onDisconnect().set(isOfflineForDatabase).then(function() {
    //         userStatusDatabaseRef.set(isOnlineForDatabase);
    //     });
    // });

    //채팅 쓴 날짜 기능
    let today = moment().format("YYMMDD")

    //명령어 모음
    let orderList = [' 10', ' 50', ' 100']
    
    useEffect(() => {
        //트윗 받기
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
            // getMyAttend();
            //(**보류)트윗쓸때마다 출석했는지 확인하고 기능넣기
            // if (nweetArray[0].orderWhat === "/출석" && nweetArray[0].orderText !== '') {
            //     getAttend();
            // }
        });
        onAuthStateChanged(auth, (user) => {
            if (user == null) {
                unsubscribe();
            }
        });
    }, []);

    //출석점수 기능(**전체 출석기능 할때 만들었음. 지금은 사용 안함)
    // const getTotalAttend = async () => {
    //     //1. 게임 데이터 받아오기
    //     const q = query(
    //         collection(dbService, "game"),
    //         orderBy("createdDate", "desc")
    //     );
    //     const querySnapshot = await getDocs(q);
    //     const lastGameData = querySnapshot._snapshot.docChanges[0].doc.data.value.mapValue.fields;
        
    //     //2. 세팅하기
    //     setAtdTotal(lastGameData.totalAttend.integerValue);
    //     //다 가져오기
    //     // querySnapshot.forEach(doc => console.log(doc));
    // };

    const testAccount = async () => {
        //1. 게임 데이터 경로 생성
        const q = query(
            collection(dbService, "userGame"),
            where("uid", "==", userObj.uid)
        );
        const querySnapshot = await getDocs(q);
        const currentUserGameData = querySnapshot.docs[0]._document.data.value.mapValue.fields;
        const currentUserGameData_Id = querySnapshot.docs[0].id;
        const currentUserGameData_Total = Number(currentUserGameData.totalAttend.integerValue);
        const currentUserGameData_AttendCount = Number(currentUserGameData.attendCount.integerValue);
        let attendRanNum = Math.ceil(Math.random() * (10 - 1) + 1);
        const ok = window.confirm("출석하시나요?");
        //2. 출석횟수 업데이트(+1)
        if (ok) {
            const UserGameRef = doc(dbService, "userGame", currentUserGameData_Id);
            await updateDoc(UserGameRef, {
                attendRanNum : attendRanNum,
                attendCount : currentUserGameData_AttendCount + 1,
                totalAttend : currentUserGameData_Total + attendRanNum,
            })
            refreshUser();
        }
    }

    // //출석점수 기능
    // const displayMyAttend = async () => {
    //     //1. 게임 데이터 받아오기
    //     const q = query(
    //         collection(dbService, "userGame"),
    //         where("uid", "==", userObj.uid)
    //     );
    //     const querySnapshot = await getDocs(q);
    //     const UserGameData = querySnapshot.docs.map(doc => ({
    //         id: doc.id,
    //         ...doc.data()
    //     }));
    //     console.log(UserGameData[0].attendCount)
    //     //2. 세팅하기
    //     setAtdTotal(UserGameData[0].totalAttend);
    //     setGameObj(UserGameData[0])
    //     setAttendCount(UserGameData[0].attendCount)
    //     console.log('출석함')
    // };

    //출석 리셋 기능
    const resetAttend = async () => {
        const q = query(
            collection(dbService, "userGame"),
            where("uid", "==", userObj.uid)
        );
        const querySnapshot = await getDocs(q);
        const currentUserGameData_Id = querySnapshot.docs[0].id;
        const ok = window.confirm("화분 게이지를 진짜 삭제할래요?");
        const UserGameRef = doc(dbService, "userGame", currentUserGameData_Id);
        if (ok) {
            await updateDoc(UserGameRef, {
                totalAttend: 0,
                attendCount: 0,
            })
            refreshUser();
        }
    }



    
    return (
        <>
            <Profile
                userObj={userObj}
                refreshUser={refreshUser}
                fbUserObj={fbUserObj}
                gameObj={gameObj}
            />
            <div className="chatting-area">
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
                            isAttend={nweet.orderWhat === "/출석"}
                            gameObj={gameObj}
                        />
                    ))}
                </div>
                <div className="chatting-form-box">
                    <NweetFactory
                        userObj={userObj}
                        refreshUser={refreshUser}
                        fbUserObj={fbUserObj}
                        gameObj={gameObj}
                    />
                </div>
            </div>
            <div className="side-area">
                <div className="attend-area">
                    <div className="title">화분키우기 (출석 보상)</div>
                    <div className="attend-gauge-wrap">
                        
                        <CircularProgressbar
                            counterClockwise
                            background
                            value={attendObj.totalAttend}
                            maxValue={100}
                            text={`${attendObj.totalAttend}%`}
                            styles={{
                                path: {
                                    // stroke: `rgba(102, 234, 218, ${percentage / 100})`,
                                    stroke: '#44D9C7',
                                    strokeLinecap: 'round', //butt
                                    transition: 'stroke-dashoffset 0.5s ease 0s',
                                    transformOrigin: 'center center',
                                },
                                trail: {
                                    stroke: '#E3F1EF',
                                    strokeLinecap: 'round',
                                },
                                text: {
                                    fill: '#44D9C7',
                                    fontSize: '16px',
                                    fontWeight: '800',
                                },
                                background: {
                                    // fill: '#E3F1EF',
                                    fill: 'transparent',
                                },
                            }}
                        />
                        <img src={plantImg} alt="" />
                    </div>
                    <div>{ attendObj.attendCount }회 출석했습니다</div>
                    <button
                        className="gtn-btn mr-auto ml-auto"
                        onClick={resetAttend}
                    >화분 리셋 (테스트용)</button>
                    <button className="gtn-btn mr-auto ml-auto" onClick={testAccount}>
                        출석하기
                    </button>
                </div>
                <div className="member-area d-none">
                    <div className="title">접속중 인원</div>
                    <div className="member-list-container">
                        <div className="member-list">
                            <div className="profile-box"></div>
                            <p>User Name</p>
                        </div>
                        <div className="member-list">
                            <div className="profile-box"></div>
                            <p>User Name</p>
                        </div>
                    </div>
                </div>
                <div className="function-area">
                    <div className="title">명령어 보기</div>
                    <div className="function-list-container">
                        <div className="function-list">
                            <p>전체 말하기</p>
                            <b>/전체</b>
                        </div>
                        <div className="function-list">
                            <p>출석하기</p>
                            <b>/출석 {today}</b>
                        </div>
                        <div className="function-list">
                            <p>주사위굴리기 (1~10사이)</p>
                            <b>/주사위 10</b>
                        </div>
                        <div className="function-list">
                            <p>주사위굴리기 (1~50사이)</p>
                            <b>/주사위 50</b>
                        </div>
                        <div className="function-list">
                            <p>주사위굴리기 (1~100사이)</p>
                            <b>/주사위 100</b>
                        </div>
                    </div>
                </div>
                <div className="history-area d-none">
                    <div className="title">지난 대화 기록 불러오기</div>
                    <span className="material-icons-round">arrow_forward</span>
                </div>
            </div>
        </>
    );
}
export default Home;