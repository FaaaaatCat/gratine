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
    let todayfull = new Date().toLocaleString();

    //명령어 모음
    let orderList = ['10', '50', '100']
    
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
            // if (nweetArray[0].orderWhat === "/칵테일"){
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

    const countAttend = async () => {
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
        const ok = window.confirm("출석하시나요? 출석은 하루에 한번만 눌러주세요!");
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
        //트윗으로도 알리기(오류도 있고 굳이 싶어 안넣음)
        // const attendMention = `[출석완료] ${userObj.displayName} 님이 출석했습니다. ${todayfull} `
        // const attendNweetObj = {
        //     text: attendMention,
        //     createdAt: Date.now(),
        //     createdDate: todayfull,
        //     creatorId: userObj.uid,
        //     creatorName: userObj.displayName,
        // };
        // await addDoc(collection(dbService, "nweets"), attendNweetObj);
    }

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
                            isCock={nweet.orderWhat === "/칵테일"}
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
                    <div className="attend-info"><b>{ attendObj.attendCount }</b>회 출석했습니다</div>
                    <button className="gtn-btn mr-auto ml-auto" onClick={countAttend}>
                        출석하기
                    </button>
                    <button
                        className="gtn-btn mr-auto ml-auto"
                        onClick={resetAttend}
                    >화분 리셋 (테스트용)</button>
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
                    <div className="title">기본 명령어</div>
                    <div className="function-list-container">
                        <div className="function-list">
                            <b>/전체</b>
                            <p>전체 말하기</p>
                        </div>
                        <div className="function-list">
                            <b>/주사위 10</b>
                            <p>주사위굴리기 (1~10사이)</p>
                        </div>
                        <div className="function-list">
                            <b>/주사위 50</b>
                            <p>주사위굴리기 (1~50사이)</p>
                        </div>
                        <div className="function-list">
                            <b>/주사위 100</b>
                            <p>주사위굴리기 (1~100사이)</p>
                        </div>
                        {/* <div className="function-list">
                            <p>주사위굴리기 (Yes or No)</p>
                            <b>/주사위 선택</b>
                        </div> */}
                    </div>
                </div>
                <div className="function-area">
                    <div className="title">특수 명령어</div>
                    <div className="function-list-container">
                        <div className="function-list">
                            <b>/칵테일</b>
                            <p>칵테일 제조</p>
                        </div>
                        <div className="function-list">
                            <b>/인형</b>
                            <p>랜덤 인형 뽑기</p>
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