import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { authService, dbService, storageService } from "fbase";
import { collection, getDocs, query, onSnapshot, where, orderBy, doc, updateDoc } from "firebase/firestore";
import { Navigate, useNavigate } from "react-router-dom";
import EditProfile from "./EditProfile";
import ShowProfile from "./ShowProfile";

const Profile = ({ refreshUser, userObj, fbUserObj, onHpCheckedChange, nweetObj, userList}) => {
    const auth = getAuth();
    const navigate = useNavigate();


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