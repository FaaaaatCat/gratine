import React, { useEffect, useState, useMemo } from "react";
import { dbService, storageService } from '../fbase';
import { collection, addDoc, query, onSnapshot, orderBy,where, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged, updateCurrentUser } from "firebase/auth";
import { useNavigate, Link } from 'react-router-dom';
import Nweet from "components/Nweet";
import NweetFactory from "components/NweetFactory";
import Profile from "./Profile";
import Member from "./Member";
import Vending from "./Vending";
import Attend from "./Attend";
import plantImg from '../images/plant.png'
import light from '../images/후광.png'

const Home = ({ userObj, refreshUser, isLoggedIn, fbUserObj, vendingManage, attendManage}) => {
    const auth = getAuth();
    const navigate = useNavigate();
    const [nweets, setNweets] = useState([]);
    const [infoView, setInfoView] = useState(false);
    const [loginUsers, setLoginUsers] = useState([]);
    const [mobileMenu, setMobileMenu] = useState(false);
    const [enemyHp, setEnemyHp] = useState(null);

    //유저이름 모음
    const userList = loginUsers.map(item => item.displayName);

    //명령어 모음
    let orderList = ['10', '50', '100']

    //hp 체크여부
    const [hpValue, setHpValue] = useState(false);
    const handleHpCheckedChange = (newIsChecked) => {
        setHpValue(newIsChecked);
    };

    //데이터 최대값 도달시 첫번째 데이터 삭제하기
    let maxData = 100;
    const [maxDataId, setMaxDataId] = useState(null)
    const deleteMaxData = async () => {
        const NweetTextRef = doc(dbService, "nweets", maxDataId);
        await deleteDoc(NweetTextRef);
    }


    const nweetQuery = useMemo(() => collection(dbService, "nweets"), []);
    useEffect(() => {
        const q = query(
            nweetQuery,
            orderBy("createdAt", "desc")
        )
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const nweetArray = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            setNweets(nweetArray);
            const nweetOrder = nweetArray.map(item => item.orderWhat);

            //데이터 최대값 도달시 첫번째 데이터 삭제하기
            if (nweetArray.length >= maxData) {
                //maxDataId = nweetArray[maxData - 1].id;
                setMaxDataId(nweetArray[maxData - 1].id)
                setIsMax(true)
            }
            else {
                setMaxDataId(null)
                setIsMax(false)
            }

            //공격 또는 치유를 감지한다.
            if (nweetOrder[0] == '/공격' || nweetOrder[0] == '/치유' || nweetOrder[0] == '/체력리셋') {
                setIsWar(true)
            }
            // if (nweetOrder[0] == '/공격' || nweetOrder[0] == '/치유' || nweetOrder[0] == '/체력리셋') {
            //     setIsWar(true)
            // }
            else {
                setIsWar(false)
            }
        });
        return () => { unsubscribe() }
    }, [nweetQuery])
    

    //로그인한 유저 읽어오기 기능
    useEffect(() => {
        const q = query(
            collection(dbService, "user"),
            //where("login", "==", true)
        );
        const unsubscribe = onSnapshot(q, (Snapshot) => {
            const loginUserArray = Snapshot.docs.map((doc) => {
                return {
                    id: doc.id,
                    ...doc.data(),
                };
            });
            setLoginUsers(loginUserArray);
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

    //로그아웃 기능
    const onLogOutClick = async () => {
        auth.signOut();
        navigate("/login");
    }

    //모바일메뉴 오픈 기능
    const openMobileMenu = () => {
        setMobileMenu(true)
    }
    const closeMobileMenu = () => {
        setMobileMenu(false)
    }
    
    // 체크 상태 변경 핸들러
    const handleToggle = () => {
        const newChecked = !hpValue;
        setHpValue(newChecked);
        window.localStorage.setItem("hpToggle", newChecked)
    };

    // 페이지 로드 시 체크 상태 복원
    useEffect(() => {
        const storedIsChecked = localStorage.getItem('hpToggle');
        if (storedIsChecked === 'true') {
            setHpValue(true);
        } else {
            setHpValue(false);
        }
    }, []);


    //useEffect와 onSnapshot 안에서 awiat(addDoc, updateDoc 등) 사용하면 이미있는 문서라고 오류나서
    //상태값만 받아와서 다른 wrap 함수 안에서 사용함.
    //알수없는 이유로... isWar이 true 일때만 isMax가 작동함.
    //이를 위해 /리셋캐쉬 기능 추가
    //해결하게 된다면 /리셋캐쉬 삭제
    const [isWar, setIsWar] = useState(false);
    const [isMax, setIsMax] = useState(false);
    useEffect(() => {
        if (isWar) {
            wrapRefreshUser();
        }
        else return;
        // 100개 문서 제한해도 파이어베이스 일일 할당량을 어차피 초과하기에 일단 지워둠
        // if (isMax) {
        //     wrapDeleteMaxData();
        // }
        // else return;
    }, [nweets]);


    const wrapRefreshUser = async () => {
        refreshUser();
    }
    const wrapDeleteMaxData = async () => {
        deleteMaxData();
    }

    
    return (
        <div className="home-wrap">
            <div className="home-bg"></div>
            <Profile
                userObj={userObj}
                refreshUser={refreshUser}
                fbUserObj={fbUserObj}
                onHpCheckedChange={handleHpCheckedChange}
                nweetObj={nweets}
                userList={userList}
                loginUsers={loginUsers}
            />
            <div className="chatting-area">
                <div className="mobile-header">
                    <div className="logo "></div>
                    <button
                        className="gtn-btn btn-icon-only"
                        onClick={openMobileMenu}
                    >
                        <span className="material-icons-round">menu</span>
                    </button>
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
                            isAttack={nweet.orderWhat === "/공격" && userList.includes(nweet.orderText)}
                            isCure={nweet.orderWhat === "/치유" && userList.includes(nweet.orderText)}
                            isHpRest={nweet.orderWhat === "/체력리셋"}
                            isBuy={nweet.buy === true}
                            hpValue={hpValue}
                            enemyHp={enemyHp}
                        />
                    ))}
                </div>
                <div className="chatting-form-box">
                    <NweetFactory
                        userObj={userObj}
                        refreshUser={refreshUser}
                        fbUserObj={fbUserObj}
                        loginUsers={loginUsers}
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
                        loginUsers={loginUsers}
                        vendingManage={vendingManage}
                        attendManage={attendManage}
                    />
                </div>
                <div className={'attend-area ' + (attendManage? '':'not-now')}>
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
                                    출석시 5~15 사이의 랜덤 경험치를 생성합니다.<br />
                                    경험치를 모아 화분을 완성해보세요.
                                </p>
                            </div>
                        </span>
                    </div>
                    <Attend
                        userObj={userObj}
                        fbUserObj={fbUserObj}
                        refreshUser={refreshUser}
                    />
                </div>
                <div className={'vending-area ' + (vendingManage? '':'not-now')}>
                    <div className="title">상점
                        <span className="info-wrap">
                            <div className="info-btn"
                                onClick={() => { window.open('https://docs.google.com/document/d/1XAY2QgPkd3CiMfJeXDBkkA0VxvMBpapsXfLpWeKR9tw/edit?usp=sharing', '_blank'); }}
                            >
                                <span className="material-icons-round">info</span>
                            </div>
                        </span>
                    </div>
                    <Vending
                        userObj={userObj}
                        fbUserObj={fbUserObj}
                        refreshUser={refreshUser}
                    />
                </div>
                <div className="history-area">
                    <div className="title">지난 대화기록 보기
                        <Link
                            to="/History"
                            target="_blank"
                            className="gtn-btn btn-icon-only ml-auto"
                        >
                            <span className="material-icons-round">arrow_forward</span>
                        </Link>
                    </div>
                </div>
            </div>
            {mobileMenu &&
                <div className="mobileMenu-area">
                    <div className="close-wrap">
                        <button className="gtn-btn btn-icon-only" onClick={closeMobileMenu}>
                            <span className="material-icons-round">close</span>
                        </button>
                    </div>
                    <div className="menu-wrap">
                        <div className="menu-item-wrap">
                            <div className="menu-item">
                                <span className="material-icons-round">favorite_border</span>
                                hp표시하기
                                <div className="mini-border ml-auto"></div>
                                <label className="gtn-toggle ml-2">
                                    <input
                                        role="switch"
                                        type="checkbox"
                                        checked={hpValue}
                                        onChange={handleToggle}
                                    />
                                </label>
                            </div>
                            {/* <div className="menu-item">
                                <span className="material-icons-round">task_alt</span>
                                출석하기
                                <span></span>
                            </div> */}
                            <div className="menu-item" onClick={onLogOutClick}>
                                <span className="material-icons-round">logout</span>
                                로그아웃
                            </div>
                        </div>
                    </div>
                </div>
            }
        </div>
    );
}
export default Home;