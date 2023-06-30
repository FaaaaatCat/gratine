import React, { useEffect, useState } from "react";
import { getAuth, signOut, updateProfile  } from "firebase/auth";
import { authService, dbService, storageService } from "fbase";
import { collection, getDocs, query, where, orderBy, addDoc } from "firebase/firestore";
import { Navigate, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';
import { ref, uploadString, getDownloadURL } from "@firebase/storage";

const Profile = ({ refreshUser, userObj }) => {
    const [newDisplayName, setNewDisplayName] = useState(userObj.displayName);
    // const [newProfilePic, setNewProfilePic] = useState(userObj.photoURL);
    const [profilePic, setProfilePic] = useState("https://picsum.photos/140");
    const auth = getAuth();
    const navigate = useNavigate();
    const [editProfile, setEditProfile] = useState(false);
    const photoURL = userObj.photoURL;

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

    //새 이미지 업로드 기능
    const onProfileChange = async (e) => {
        const tjPic = e.target.files[0];
        const picReader = new FileReader();
        picReader.onloadend = (finishedEvent) => {
            setProfilePic(finishedEvent.currentTarget.result) //이거 개짱김
        }
        picReader.readAsDataURL(tjPic);
        // const {
        //     target: { files },
        // } = e;
        // const theFile = files[0]; //name, size, type, 등등 파일의 정보
        // const reader = new FileReader();
        // reader.onloadend = (finishedEvent) => {
        //     setProfilePic(finishedEvent.target.result)
        // }
        // reader.readAsDataURL(theFile);
   };

    //새 닉네임을 얻는 기능
    const onNameChange = (e) => {
        setNewDisplayName(e.target.value);
    };
    //프로필 수정 완료버튼
    const onEditProfile = (e) => {
        setEditProfile(true);
    }
    const onSubmit = async (e) => {
        e.preventDefault();
        //원래이름에서 수정되었을때만 실행해라
        // if(userObj.displayName !== newDisplayName){
        //     await updateProfile(auth.currentUser, {
        //         displayName: newDisplayName,
        //         // photoURL: newProfilePic
        //         photoURL : "https://picsum.photos/140"
        //     });
        //     refreshUser();
        // }
        let profileUrl = "";
        const profileRef = ref(storageService, `${userObj.uid}/${uuidv4()}`);
        const profileResponse = await uploadString(profileRef, profilePic);
        profileUrl = await getDownloadURL(profileResponse.ref);
        console.log('profileResponse =>', profileResponse)
        console.log('profileUrl =>', profileUrl)

        await updateProfile(auth.currentUser, {
            displayName: newDisplayName,
            // photoURL: profilePic
        });

        //프로필의 데이터를 저장
        const userData = {
            profileUrl
        }
        await addDoc(collection(dbService, "user"), userData); 

        refreshUser();
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
                            <div className="profile-box__my">
                                <img src={profilePic} />
                            </div>
                            <form onSubmit={onSubmit} className="profile-wrap">
                                {/* <label htmlFor="profile">
                                    <div className="picture-upload-btn">
                                        <span className="material-icons-round">image</span>
                                        프로필 사진 업로드
                                    </div>
                                </label> */}
                                <input
                                    className="gtn-input"
                                    onChange = {onProfileChange}
                                    type="file"
                                    name="file"
                                    id="profile"
                                    accept="image/*"
                                />
                                <input
                                    className="gtn-input"
                                    onChange={onNameChange}
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
                            <div className="profile-box__my">
                                <img src={photoURL} />
                            </div>
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