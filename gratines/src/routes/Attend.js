import React, { useEffect, useState } from "react";
import { dbService, storageService } from '../fbase';
import { collection, addDoc, query, onSnapshot, orderBy,where, doc, getDocs, updateDoc } from "firebase/firestore";
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import plantImg from '../images/plant.png'
import dayjs from "dayjs";


const Attend = ({ attendObj, userObj, refreshUser }) => {
    const [attendAble, setAttendAble] = useState(true);
    //오늘 날짜
    // let today = new Date();
    let today = dayjs();
    let todayFormat = today.format("YYYY.MM.DD");
    let todayfull = new Date().toLocaleString();
    // let todayTrim = todayfull.trim("오");

    // console.log(today)
    // console.log(todayfull)
    // console.log(todayTrim)

    //var date = dayjs("2023-08-16");
    // var today = new Date();
    // var year = today.getFullYear();
    // var month = ('0' + (today.getMonth() + 1)).slice(-2);
    // var day = ('0' + today.getDate()).slice(-2);
    // var seconds = ('0' + today.getSeconds()).slice(-2);
    
    // var todayString = year + '-' + month  + '-' + day;

    // console.log(todayString);


    let timer;
    const startClock = () => {
        function clock() {
        }
        timer = setInterval(clock, 1000);
    }
    const stopClock = () => {
        clearInterval(timer);
    }
    startClock();
    //stopClock();
        
    //출석횟수 업데이트
    const countAttend = async () => {
        //출석을 안눌렀다면
        if (attendAble) {
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
            const ok = window.confirm("출석 완료! XX Gold를 드립니다. 소지금에 추가해주세요!");
            if (ok) {
                const UserGameRef = doc(dbService, "userGame", currentUserGameData_Id);
                await updateDoc(UserGameRef, {
                    attendRanNum : attendRanNum,
                    attendCount : currentUserGameData_AttendCount + 1,
                    totalAttend: currentUserGameData_Total + attendRanNum,
                    attendDate: todayFormat,
                })
                refreshUser();
            }
            setAttendAble(false);
        }
        //출석을 이미 눌렀다면
        else {
            setAttendAble(false);
            return;
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


    //새로고침시 출석 리셋기능
    const refreshAttend = async () => {
        const q = query(
            collection(dbService, "userGame"),
            where("uid", "==", userObj.uid), //내꺼만 필터링하기
        );
        const querySnapshot = await getDocs(q);
        const lastAttendDate = querySnapshot.docs[0]._document.data.value.mapValue.fields.attendDate.stringValue
        console.log('lastAttendDate =>',lastAttendDate)
        console.log('todayFormat=>', todayFormat)
        if (lastAttendDate === todayFormat) {
            setAttendAble(false);
            return;
        }
        else {
            setAttendAble(true);
        }
    };
    useEffect(() => {
        refreshAttend();
    },[])

    //출석점수 완전 리셋 기능
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
        <div className="content-wrap">
            <div className="attend-gauge-wrap">
                <img src={plantImg} alt="" />
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
                            // stroke: '#E7E7E7',
                            stroke: 'white',
                            strokeLinecap: 'round',
                        },
                        background: {
                            fill: 'transparent',
                            //fill: 'white',
                        },
                    }}
                />
            </div>
            <div className="attend-info">
                <div><b>{attendObj.attendCount}</b>회 출석했습니다</div>
                <button
                    className={'gtn-btn ' + (attendAble? 'btn-mint' : 'btn-disable')}
                    onClick={countAttend}
                    disabled = {attendAble? false : true}
                >
                    {attendAble? '출석하기' : '오늘 출석은 완료했어요'}
                </button>
            </div>
            {/* <button
                className="gtn-btn mr-auto ml-auto"
                onClick={resetAttend}
            >화분 리셋 (테스트용)</button> */}
        </div>
    );
};

export default Attend;