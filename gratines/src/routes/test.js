import React, { useEffect, useState } from "react";
import { getAuth, signOut, updateProfile  } from "firebase/auth";
import { authService, dbService, storageService } from "fbase";
import { collection, getDocs, query, where, orderBy, addDoc } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';
import { ref, uploadString, getDownloadURL } from "@firebase/storage";


const EditProfile = ({ refreshUser, userObj }) => {
    const auth = getAuth();
    //기존 로컬스토리지(사용자정보) 가져오기
    var json = JSON.parse(localStorage.getItem("gratineUser"));
    const [localUser, setlocalUser] = useState({
        displayName: "",
        photoURL: "",
        uid: "",
        email: ""
    });

    const defaultProfile = 'https://firebasestorage.googleapis.com/v0/b/gratia-2cdd0.appspot.com/o/gratine%2Fdefault_profile.jpg?alt=media&token=b173d6e0-7a8e-4e49-a06e-9b377bb186a0';

    const [newDisplayName, setNewDisplayName] = useState(userObj.displayName);
    const [newProfilePic, setNewProfilePic] = useState(json.photoURL);
    //사진파일 지우기
    const onClearProfileUrl = () => {
        alert('프로필 사진을 지울까요?')
        setNewProfilePic(defaultProfile)
        localStorage.setItem(
            'gratineUser',
            JSON.stringify({
                uid: json.uid,
                displayName: newDisplayName,
                photoURL: defaultProfile, //디폴트 프로필사진을 저장한다
                email: json.email
            })
        )
    }

    //새 닉네임을 얻는 기능
    const onNameChange = (e) => {
        setNewDisplayName(e.target.value);
    };

    //프로필 수정 저장
    const onSubmit = async (e) => {
        e.preventDefault();
        let creatorPicUrl = "";
        const profileRef = ref(storageService, `${userObj.uid}/${uuidv4()}`);
        const profileResponse = await uploadString(profileRef, newProfilePic, "data_url");
        creatorPicUrl = await getDownloadURL(profileResponse.ref);

        //기존 로컬스토리지(사용자정보) 가져오기
        var json = JSON.parse(localStorage.getItem("gratineUser"));
        //프로필사진 없이 저장하면
        if (json.photoURL === defaultProfile) {
            localStorage.setItem(
                'gratineUser',
                JSON.stringify({
                    uid: json.uid,
                    displayName: newDisplayName,
                    photoURL: creatorPicUrl, //디폴트 프로필사진을 저장한다
                    email: json.email
                })
            )
            console.log('프로필사진 없게')
        }
        //프로필사진 있게 저장하면
        else {
            localStorage.setItem(
                'gratineUser',
                JSON.stringify({
                    uid: json.uid,
                    displayName: newDisplayName,
                    photoURL: creatorPicUrl, //업로드한 프로필사진을 저장한다
                    email: json.email
                })
            )
            console.log('프로필사진 있게')
        }
        //프로필 업데이트
        await updateProfile(auth.currentUser, {
            displayName: newDisplayName,
            photoURL: creatorPicUrl,
        });
        //완료
        refreshUser();
        console.log('creatorPicUrl =>',creatorPicUrl);
        console.log('defaultProfile =>', defaultProfile);
    }

    //프로필 사진 추가
    const onProfileChange = async (e) => {
        console.log(newProfilePic)
        const thePic = e.target.files[0];
        const picReader = new FileReader();
        picReader.onloadend = (finishedEvent) => {
            setNewProfilePic(finishedEvent.target.result) //이거 개짱김
        }
        picReader.readAsDataURL(thePic);
    };

    return (
        <>
            <div className="profile-box__my profile-edit">
                <img src={newProfilePic} />
                <button onClick={onClearProfileUrl}>
                    <span className="material-icons-round">close</span>
                </button>
            </div>
            <form onSubmit={onSubmit} className="profile-wrap">
                <label htmlFor="profile">
                    <div className="picture-upload-btn">
                        <span className="material-icons-round">image</span>
                        프로필 사진 업로드
                    </div>
                </label>
                <input
                    className="gtn-input d-none"
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
                    value="저장"
                />
            </form>
        </>
    )
};
export default EditProfile;