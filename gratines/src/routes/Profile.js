import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { authService, dbService, storageService } from "fbase";
import { collection, getDocs, query, onSnapshot, where, orderBy, doc, updateDoc } from "firebase/firestore";
import { Navigate, useNavigate } from "react-router-dom";
import EditProfile from "./EditProfile";
import ShowProfile from "./ShowProfile";
import bg from "../images/테스트_전신.png"

const Profile = ({ refreshUser, userObj, fbUserObj, onHpCheckedChange, nweetObj, userList}) => {
    const auth = getAuth();
    const navigate = useNavigate();


    // //공격을 감지해서 hp를 깎는 기능
    // const minusHp = async() => {
    //     const q = query(
    //         collection(dbService, "user"),
    //         where("displayName", "==", nweetObj[0].orderText)
    //     );
    //     const querySnapshot = await getDocs(q);
    //     const UserData_Id = querySnapshot.docs[0].id;
    //     const UserHp = querySnapshot.docs[0]._document.data.value.mapValue.fields.hp.integerValue;
    //     const UserRef = doc(dbService, "user", UserData_Id);
    //     let newHp = Number(UserHp) - nweetObj[0].diceNum
    //     if (newHp < 0) {
    //         newHp = 0;
    //     }
    //     await updateDoc(UserRef, {
    //         hp: newHp
    //     })
    //     refreshHp();
    //     return;
    // }
    // //치유를 감지해서 hp를 더하는 기능
    // const plusHp = async() => {
    //     const q = query(
    //         collection(dbService, "user"),
    //         where("displayName", "==", nweetObj[0].orderText)
    //     );
    //     const querySnapshot = await getDocs(q);
    //     const UserData_Id = querySnapshot.docs[0].id;
    //     const UserHp = querySnapshot.docs[0]._document.data.value.mapValue.fields.hp.integerValue;
    //     const UserRef = doc(dbService, "user", UserData_Id);
    //     let newHp = Number(UserHp) + nweetObj[0].diceNum
    //     if (newHp > 100) {
    //         newHp = 100;
    //     }
    //     await updateDoc(UserRef, { 
    //         hp: newHp
    //     })
    //     //console.log('치유했음')
    //     //refreshHp();
    //     return;
    // }

    // const refreshHp = async() => {
    //     const q = query(
    //         collection(dbService, "nweets"),
    //         where("creatorName", "==", nweetObj[0].orderText)
    //     )
    //     const querySnapshot = await getDocs(q);
    //     const EnemyHp = querySnapshot.docs[0]._document.data.value.mapValue.fields.hp.integerValue;
    //     console.log(EnemyHp)
    //     // querySnapshot.forEach((doc) => {
    //     //     console.log('data =>',doc.data());
    //     // })
    //     // onSnapshot(doc(dbService, "user", "0VqgwHaXVl6RNcwWcNDb"), (doc) => {
    //     //     //console.log('치유했음')
    //     //     console.log("Current data: ", doc.data());
    //     // });
    // }

    // //혼자할땐 괜찮지만, 다른유저를 공격,치유할땐 알수없는값으로 자동계산되어 우선 빼둠
    // useEffect(() => {
    //     //공격,치유 할때만 refresh 함
    //     if (userList.length == 0 || nweetObj.length == 0) return;
    //     if (!nweetObj[0].orderText || nweetObj[0].orderText == '') return;
    //     if (userList.includes(nweetObj[0].orderText)) {
    //         if (nweetObj[0].orderWhat === "/공격") {
    //             console.log('공격감지함')
    //             minusHp();
    //             return;
    //         }
    //         else if (nweetObj[0].orderWhat === "/치유") {
    //             console.log('치유감지함')
    //             plusHp();
    //             return;
    //         }
    //     }
    //     else{return}
    // },[nweetObj])

    ///////////////////////////////////////////////////////////////////////////////
    //hp 정보 보여줄지말지
    const [hpChecked, setHpChecked] = useState(false);
    const handleToggleChange = (newChecked) => {
        setHpChecked(newChecked); // isCheced 값을 show,edit.js로 전달
        onHpCheckedChange(newChecked); // isChecked 값을 Parent.js로 전달
    };

    ///////////////////////////////////////////////////////////////////////////////
    //1. 내 nweets 정보 얻기 (useEffect로 최초 한번만 실행)
    const getMyNweets = async () => {
        const q = query(
            collection(dbService, "nweets"),
            where("creatorId", "==", userObj.uid), //내꺼만 필터링하기
            orderBy("createdAt", "desc") //정렬하기, 내림차순(desc), 오름차순(aece)
        );
        const querySnapshot = await getDocs(q);
        //원하는값을 필터링 하는법
        querySnapshot.forEach((doc) => {
            // console.log(doc.id);
            // console.log(doc.data());
        });
    };
    useEffect(() => {
        //getMyNweets();
    },[])
    
    ///////////////////////////////////////////////////////////////////////////////
    //2. 프로필 수정 기능
    const [editing, setEditing] = useState(false);
    const toggleEditing = () => setEditing((prev) => !prev);

    ///////////////////////////////////////////////////////////////////////////////
    //3. 로그아웃 기능

    //유저정보를 로그아웃으로 만드는 기능
    const setLogOut = async () => {
        const q = query(
            collection(dbService, "user"),
            where("uid", "==", userObj.uid)
        );
        const querySnapshot = await getDocs(q);
        const currentUserGameData_Id = querySnapshot.docs[0].id;
        const UserGameRef = doc(dbService, "user", currentUserGameData_Id);
        await updateDoc(UserGameRef, {
            login : false,
        })
    }

    //완전 로그아웃 기능
    const onLogOutClick = async() => {
        //setLogOut();
        auth.signOut();
        navigate("/login");
    }

    return (
        <div className="profile-area">
            <div className="logo logo_black">로고</div>
            <div className="profile-wrap">
                {editing ?
                    (
                        <EditProfile
                            refreshUser={refreshUser}
                            userObj={userObj}
                            fbUserObj={fbUserObj}
                        />
                    ): (
                        <ShowProfile
                            refreshUser={refreshUser}
                            userObj={userObj}
                            fbUserObj={fbUserObj}
                            onToggleChange={handleToggleChange}
                        />
                    )
                }
                <div className="bg-test d-none">
                    <img src={bg} alt="" />
                </div>
            </div>
            <div className="profile-btns">
                {editing ?
                    (
                        <button className="gtn-btn w-100" onClick={toggleEditing}>프로필 화면으로</button>
                    ) : (
                        <>
                            <button className="gtn-btn" onClick={toggleEditing}>프로필 수정</button>
                            <button className="gtn-btn" onClick={onLogOutClick}>로그 아웃</button>
                        </>
                    )
                }
            </div>
        </div>
    )
};
export default Profile;