import React, { useEffect, useState } from "react";
import { dbService, storageService } from '../fbase';
import { collection, addDoc, query, onSnapshot, orderBy,where, doc, getDocs, updateDoc } from "firebase/firestore";
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import plantImg from '../images/plant.png'
import dayjs from "dayjs";


const Attend = ({ fbUserObj, userObj, refreshUser }) => {
    const [attendAble, setAttendAble] = useState(true);
    const [userData, setUserData] = useState(null);

    //오늘 날짜
    let today = dayjs();
    let todayFormat = today.format("YYYY.MM.DD");

    //user 데이터 쿼리 불러오기
    const getUserData = async () => {
        const q = query(
            collection(dbService, "user"),
            where("uid", "==", userObj.uid)
        );
        const querySnapshot = await getDocs(q);
        //새로고침시 출석 리셋기능
        const lastAttendDate = querySnapshot.docs[0]._document.data.value.mapValue.fields.attendDate.stringValue
        if (lastAttendDate === todayFormat) {
            setAttendAble(false);
            return;
        }
        else {
            setAttendAble(true);
        }
        setUserData(querySnapshot)
    };
    useEffect(() => {
        getUserData();
    },[])


    //출석횟수 업데이트
    const countAttend = async () => {
        //출석을 안눌렀다면
        if (attendAble) {
            const q = query(
                collection(dbService, "user"),
                where("uid", "==", userObj.uid)
            );
            const querySnapshot = await getDocs(q);
            const UserGameData = querySnapshot.docs[0]._document.data.value.mapValue.fields;
            const UserGameData_Id = querySnapshot.docs[0].id;
            const UserGameData_Total = Number(UserGameData.totalAttend.integerValue);
            const UserGameData_AttendCount = Number(UserGameData.attendCount.integerValue);
            const UserGameData_Gold = Number(UserGameData.gold.integerValue);
            //let attendRanNum = Math.ceil(Math.random() * (15 - 5) + 5);
            let attendRanNum = 15;
            let attendGold = 100;
            const ok = window.confirm(`출석 완료! ${attendGold}G를 드립니다.`);
            if (ok) {
                const UserGameRef = doc(dbService, "user", UserGameData_Id);
                await updateDoc(UserGameRef, {
                    attendRanNum : attendRanNum,
                    attendCount : UserGameData_AttendCount + 1,
                    totalAttend: UserGameData_Total + attendRanNum,
                    attendDate: todayFormat,
                    gold: UserGameData_Gold + attendGold,
                })
                refreshUser();
                setAttendAble(false);
            }
        }
        //출석을 이미 눌렀다면
        else {
            setAttendAble(false);
            return;
        }
    }

    //출석점수 완전 리셋 기능
    const resetAttend = async () => {
        const UserGameData_Id = userData.docs[0].id;
        const ok = window.confirm("화분 게이지를 진짜 삭제할래요?");
        const UserGameRef = doc(dbService, "user", UserGameData_Id);
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
                    value={fbUserObj.totalAttend}
                    maxValue={100}
                    text={`${fbUserObj.totalAttend}%`}
                    styles={{
                        path: {
                            // stroke: `rgba(102, 234, 218, ${percentage / 100})`,
                            stroke: '#625bd3',
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
                <div><b>{fbUserObj.attendCount}</b>회 출석했습니다</div>
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