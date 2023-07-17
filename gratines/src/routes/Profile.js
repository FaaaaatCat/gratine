import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { authService, dbService, storageService } from "fbase";
import { collection, getDocs, query, where, orderBy, addDoc, onSnapshot } from "firebase/firestore";
import { Navigate, useNavigate } from "react-router-dom";
import EditProfile from "./EditProfile";
import ShowProfile from "./ShowProfile";

const Profile = ({ refreshUser, userObj, fbUserObj, gameObj }) => {
    const auth = getAuth();
    const navigate = useNavigate();

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
    const onLogOutClick = () => {
        auth.signOut();
        navigate("/login");
    }  

    return (
        <div className="profile-area">
            <div className="logo">로고</div>
            <div className="profile-wrap">
                {editing ?
                    (
                        <EditProfile
                            refreshUser={refreshUser}
                            userObj={userObj}
                            fbUserObj={fbUserObj}
                            gameObj={gameObj}
                        />
                    ): (
                        <ShowProfile
                            refreshUser={refreshUser}
                            userObj={userObj}
                            fbUserObj={fbUserObj}
                            gameObj={gameObj}
                        />
                    )
                }
            </div>
            <div className="flx-row gap-1 w-100">
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