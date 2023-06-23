import React, { useEffect, useState } from "react";
import { getAuth, signOut, updateProfile  } from "firebase/auth";
import { authService, dbService } from "fbase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { Navigate, useNavigate } from "react-router-dom";

const Profile = ({ refreshUser, userObj }) => {
    const [newDisplayName, setNewDisplayName] = useState(userObj.displayName);
    const auth = getAuth();
    const navigate = useNavigate();
    const [editProfile, setEditProfile] = useState(false);

    ///////////////////////////////////////////////////////////////////////////////
    //1. 내 nweets 정보 얻기 (useEffect로 최초 한번만 실행)
    const getMyNweets = async () => {
        const q = query(
            collection(dbService, "nweets"),
            where("creatorId", "==", userObj.uid), //필터링하기
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
        getMyNweets();
    },[])
    
    ///////////////////////////////////////////////////////////////////////////////
    //2. 프로필 수정 기능
    const onEditProfile = (e) => {
        setEditProfile(true);
    }
    const onChange = (e) => {
        //새 닉네임을 얻는 기능
        setNewDisplayName(e.target.value);
    };
    const onSubmit = async (e) => {
        e.preventDefault();
        //원래이름에서 수정되었을때만 실행해라
        if(userObj.displayName !== newDisplayName){
            await updateProfile(auth.currentUser, { displayName: newDisplayName });
            refreshUser();
        }
        setEditProfile(false);
    }

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
                {editProfile ?
                    (
                        <>
                            <form onSubmit={onSubmit}>
                                <input
                                    className="gtn-input"
                                    onChange={onChange}
                                    value={newDisplayName}
                                    type="text"
                                    placeholder="닉네임을 적어주세요"
                                />
                                <input
                                    className="gtn-btn"
                                    type="submit"
                                    value="수정 완료"
                                />
                            </form>
                        </>
                    ): (
                        <>
                            <div className="profile-box__my">내 프로필사진</div>
                            <h4>{userObj.displayName}</h4>
                            <div className="profile-info">
                                <div>
                                    <p>HP : </p>
                                    <b>90</b>
                                    <span> / 100</span>
                                </div>
                                <div>
                                    <p>소지금 : </p>
                                    <b>1200</b>
                                    <span> Gold</span>
                                </div>
                                <div>
                                    <p>소지품 : </p>
                                    <b>인형, 칼, 총</b>
                                </div>
                            </div>
                        </>
                    )
                }
            </div>
            <div className="flx-row gap-1 w-100">
                <button className="gtn-btn" onClick={onEditProfile}>프로필 수정</button>
                <button className="gtn-btn" onClick={onLogOutClick}>로그 아웃</button>
            </div>
        </div>
    )
};
export default Profile;