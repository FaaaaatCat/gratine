import React, { useEffect, useState } from "react";
import { getAuth, signOut, updateProfile  } from "firebase/auth";
import { authService, dbService } from "fbase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { Navigate, useNavigate } from "react-router-dom";

const Profile = ({ refreshUser, userObj }) => {
    const [newDisplayName, setNewDisplayName] = useState(userObj.displayName);
    const auth = getAuth();
    const navigate = useNavigate();

    //1. 로그아웃 기능
    const onLogOutClick = () => {
        auth.signOut();
        navigate("/");
    }

    //2. 내 nweets 얻는 function 생성
    const getMyNweets = async () => {
        const q = query(
            collection(dbService, "nweets"),
            where("creatorId", "==", userObj.uid), //필터링하기
            orderBy("createdAt", "desc") //정렬하기, 내림차순(desc), 오름차순(aece)
        );
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            console.log(doc.id, " => ", doc.data()); //원하는값을 필터링 하는법
        });
    };
    // const getMyNweets = async() => {
    //     const nweets = await dbService
    //     .collection("nweets")
    //     .where("creatorId", "==", userObj.uid)
    //     .orderBy("createdAt")
    //     .get();
    //     console.log(nweets.docs.map((doc) => doc.data()));
    // };
    useEffect(() => {
        getMyNweets();
    },[])
    
    //3. 새 닉네임을 얻는 기능
    const onChange = (e) => {
        setNewDisplayName(e.target.value);
    };
    const onSubmit = async (e) => {
        e.preventDefault();
        //원래이름에서 수정되었을때만 실행해라
        if(userObj.displayName !== newDisplayName){
            await updateProfile(auth.currentUser, { displayName: newDisplayName });
            refreshUser();
        }
    }
    return (
        <div className="pg-profile">
            <span className="title">This is Profile</span>
            <form onSubmit={onSubmit}>
                <input
                    onChange={onChange}
                    value={newDisplayName}
                    type="text"
                    placeholder="닉네임을 적어주세요"
                />
                <input
                    type="submit"
                    value="Update Profile"
                />
            </form>
            <button className="gtn-btn" onClick={onLogOutClick}>Log Out</button>
        </div>
    )
};
export default Profile;