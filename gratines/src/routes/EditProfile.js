import React, { useEffect, useState } from "react";
import { getAuth, signOut, updateProfile  } from "firebase/auth";
import { authService, dbService, storageService } from "fbase";
import { collection, getDocs, query, where, orderBy, addDoc, doc, updateDoc } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';
import { ref, uploadString, getDownloadURL } from "@firebase/storage";

const EditProfile = ({ refreshUser, userObj, fbUserObj }) => {
    const auth = getAuth();
    const [newDisplayName, setNewDisplayName] = useState(fbUserObj.displayName);
    const [newGold, setNewGold] = useState(fbUserObj.gold);
    const [newItem, setNewItem] = useState(fbUserObj.item);
    const [newProfilePic, setNewProfilePic] = useState(fbUserObj.photoURL);
    const defaultProfile = 'https://firebasestorage.googleapis.com/v0/b/gratia-2cdd0.appspot.com/o/gratine%2Fdefault_profile.png?alt=media&token=9003c59f-8f33-4d0a-822c-034682416355';
    //새 소지금액 인풋
    const onGoldChange = (e) => {
        setNewGold(Number(e.target.value));
    };
    //새 소지품 인풋
    const onItemChange = (e) => {
        setNewItem(e.target.value);
    };
    //새 닉네임 인풋
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
        e.preventDefault();
        let creatorPicUrl = "";
        //만일 프로필사진을 새로 올렸다면
        if (newProfilePic !== defaultProfile && newProfilePic !== userObj.photoURL) {
            const profileRef = ref(storageService, `${userObj.uid}/${uuidv4()}`);
            const profileResponse = await uploadString(profileRef, newProfilePic, "data_url");
            creatorPicUrl = await getDownloadURL(profileResponse.ref);
        }
        //만일 프로필사진을 변경하지 않았다면
        else if (newProfilePic === fbUserObj.photoURL) {
            creatorPicUrl = fbUserObj.photoURL;
        }
        //만일 프로필사진이 비어있다면
        else if (newProfilePic === defaultProfile) {
            creatorPicUrl = defaultProfile;
        }

        //바뀐데이터 저장
        await updateProfile(auth.currentUser, {
            displayName: newDisplayName,
            photoURL: creatorPicUrl,
        });
        const q = query(
            collection(dbService, "user"),
            where("uid", "==", userObj.uid)
        );
        const querySnapshot = await getDocs(q);
        const currentUserGameData_Id = querySnapshot.docs[0].id;
        const UserGameRef = doc(dbService, "user", currentUserGameData_Id);
        await updateDoc(UserGameRef, {
            gold : newGold,
            item: newItem,
            displayName: newDisplayName,
            photoURL: creatorPicUrl,
        })

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
                {/* {newProfilePic ? <img src={newProfilePic} /> : <img src={defaultProfile} />} */}
                <img src={newProfilePic} />
                <button onClick={onClearProfileUrl}>
                    <span className="material-icons-round">close</span>
                </button>
            </div>
            <form onSubmit={onSubmit} className="profile-detail-wrap">
                <label htmlFor="profile">
                    <div className="picture-upload-btn mt-2">
                        <span className="material-icons-round">image</span>
                        사진 업로드
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
                <div className="label">이름</div>
                <input
                    className="gtn-input"
                    onChange={onNameChange}
                    value={newDisplayName}
                    type="text"
                    placeholder="닉네임을 적어주세요"
                />
                <div className="label">소지금(Gold)</div>
                <input
                    type="number"
                    className="gtn-input"
                    onChange={onGoldChange}
                    value={newGold}
                />
                <div className="label">소지품</div>
                <input
                    type="text"
                    className="gtn-input"
                    placeholder="소지품을 입력해주세요"
                    onChange={onItemChange}
                    value={newItem}
                />
                <input
                    className="gtn-btn btn-brown mt-4"
                    type="submit"
                    value="저장"
                />
            </form>
        </>
    )
};
export default EditProfile;