import React, { useEffect, useState } from "react";
import { getAuth, signOut, updateProfile  } from "firebase/auth";
import { authService, dbService, storageService } from "fbase";
import { collection, getDocs, query, where, orderBy, addDoc } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';
import { ref, uploadString, getDownloadURL } from "@firebase/storage";

const EditProfile = ({ refreshUser, userObj }) => {
    const auth = getAuth();
    var json = JSON.parse(localStorage.getItem("gratineUser"));
    const [newDisplayName, setNewDisplayName] = useState(json.displayName);
    const [newProfilePic, setNewProfilePic] = useState(json.photoURL);
    const defaultProfile = 'https://firebasestorage.googleapis.com/v0/b/gratia-2cdd0.appspot.com/o/gratine%2Fdefault_profile.jpg?alt=media&token=b173d6e0-7a8e-4e49-a06e-9b377bb186a0';

    //새 닉네임을 얻는 기능
    const onNameChange = (e) => {
        setNewDisplayName(e.target.value);
    };

    //사진파일 지우기
    const onClearProfileUrl = () => {
        alert('프로필 사진을 지울까요?')
        setNewProfilePic(defaultProfile)
    }

    //프로필 수정 저장
    const onSubmit = async (e) => {
        var json = JSON.parse(localStorage.getItem("gratineUser"));
        
        e.preventDefault();
        let creatorPicUrl = "";
        if (newProfilePic !== "" && newProfilePic !== defaultProfile) {
            const profileRef = ref(storageService, `${userObj.uid}/${uuidv4()}`);
            const profileResponse = await uploadString(profileRef, newProfilePic, "data_url");
            creatorPicUrl = await getDownloadURL(profileResponse.ref);
            localStorage.setItem(
                'gratineUser',
                JSON.stringify({
                    uid: json.uid,
                    displayName: newDisplayName,
                    photoURL: creatorPicUrl, //업로드한 프로필사진을 저장한다
                    email: json.email
                })
            )
        }
        else if (newProfilePic === defaultProfile) {
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
        else {
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
        //프로필 업데이트
        await updateProfile(auth.currentUser, {
            displayName: newDisplayName,
            photoURL: creatorPicUrl,
        });
        //완료
        refreshUser();
        alert('저장되었습니다')
    }

    //프로필 사진 추가
    const onProfileChange = async (e) => {
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