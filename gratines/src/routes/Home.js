import React, { useEffect, useState } from "react";
import { dbService, storageService } from '../fbase';
import { collection, query, onSnapshot, orderBy } from "firebase/firestore";
import Nweet from "components/Nweet";
import NweetFactory from "components/NweetFactory";
import Profile from "./Profile";

const Home = ({ userObj, refreshUser }) => {
    const [nweets, setNweets] = useState([]);
    
    //forEach를 사용하지 않는 방법(reRender 하지 않아서 더 빨라짐)
    useEffect(() => {
        const q = query(
            collection(dbService, "nweets"),
            orderBy("createdAt", "desc")
        );
        
        onSnapshot(q, (snapshot) => {
            const nweetArray = snapshot.docs.map((document) => ({ //snapshot : 트윗을 받을때마다 알림 받는곳. 새로운 스냅샷을 받을때 nweetArray 라는 배열을 만듬
                id: document.id,
                // currentUser: '현재 이 글을 쓴 사람의 아이디',
                ...document.data(), //...은 데이터의 내용물, 즉 spread attribute 기능임
            }));
            setNweets(nweetArray); //nweets에 nweetArray 라는 배열을 집어 넣음. 배열엔 doc.id와 doc.data()가 있음
        });
    }, []);

    //채팅하나 칠때마다 nweetObj에 저장하는 방법

    
    //Array를 먼저 만들고 forEach로 갖고오는 방법
    // const getNweets = async () => {
    //     const q = query(collection(dbService, "nweets"));
    //     const dbNweets = await getDocs(q);
    //     dbNweets.forEach((document) => {
    //         const nweetObject = {
    //             ...document.data(), 
    //             id: document.id,
    //         }
    //         setNweets(prev => [nweetObject, ...prev]);
    //     });
    // };
    // useEffect(() => {
    //     getNweets();
    //     dbService.collection("nweets").onSnapshot(snapshot => {
    //     })
    // }, []);
    // const onSubmit = (event) => {
    //     event.preventDefault();
    //     dbService.collection("nweets").add({
    //         nweet,
    //         createAt: Date.now(),
    //     })
    //     setNweet("");
    // }
    
    return (
        <>
            <Profile
                userObj={userObj}
                refreshUser={refreshUser}
            />
            <div className="chatting-area">
                <div className="chatting-list-container">
                    {nweets.map((nweet) => ( //map은 for과 유사함. 배열안의 값들을 다 불러와주는 기능 / 지금으로썬, nweets 배열안의 데이터(doc.id / doc.data())를 다 불러옴
                        <Nweet
                            key={nweet.id}
                            nweetObj={nweet} //id, createdAt, text, attachmentUrl 4가지 값 갖고있음
                            isOwner={nweet.creatorId === userObj.uid} //내가 실제 주인인지 //맞으면 true 값 뱉음
                            userObj={userObj}
                            refreshUser={refreshUser}
                        />
                    ))}
                </div>
                <div className="chatting-form-box">
                    <NweetFactory userObj={userObj} />
                </div>
            </div>
            <div className="side-area">
                <div className="member-area">
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
                            <p>상점 이용하기</p>
                            <b>/상점</b>
                        </div>
                        <div className="function-list">
                            <p>공격하기</p>
                            <b>/공격</b>
                        </div>
                    </div>
                </div>
                <div className="history-area">
                    <div className="title">지난 대화 기록 불러오기</div>
                    <span className="material-icons-round">arrow_forward</span>
                </div>
            </div>
        </>
    );
}
export default Home;