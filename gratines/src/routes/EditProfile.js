import React, { useEffect, useState } from "react";
import { getAuth, signOut, updateProfile  } from "firebase/auth";
import { authService, dbService, storageService } from "fbase";
import { collection, getDocs, query, where, orderBy, addDoc } from "firebase/firestore";
import { v4 as uuidv4 } from 'uuid';
import { ref, uploadString, getDownloadURL } from "@firebase/storage";

const EditProfile = ({ refreshUser, userObj }) => {
    const auth = getAuth();
    const [newDisplayName, setNewDisplayName] = useState(userObj.displayName);
    const [newProfilePic, setNewProfilePic] = useState(userObj.photoURL);


    
    //사진파일 업로드 전 지우기
    const onClearProfileUrl = () => setNewProfilePic("")

    //새 닉네임을 얻는 기능
    const onNameChange = (e) => {
        setNewDisplayName(e.target.value);
    };

    //프로필 수정 저장
    const onSubmit = async (e) => {
        e.preventDefault();
        let creatorPicUrl = "";
        if (newProfilePic !== "") {
            const profileRef = ref(storageService, `${userObj.uid}/${uuidv4()}`);
            const profileResponse = await uploadString(profileRef, newProfilePic, "data_url");
            creatorPicUrl = await getDownloadURL(profileResponse.ref);
        }



        //프로필의 데이터를 저장
        // const userData = {
        //     creatorPicUrl,
        //     creatorName : userObj.displayName
        // }
        // await addDoc(collection(dbService, "user"), userData);

        //트윗 오브젝트
        const nweetObj = {
            creatorImgUrl : creatorPicUrl
        };
        await addDoc(collection(dbService, "nweets"), nweetObj); 

        //프로필 업데이트
        await updateProfile(auth.currentUser, {
            displayName: newDisplayName,
            photoURL: nweetObj.creatorImgUrl,
        });

        

        //console.log('newProfilePic =>', newProfilePic)
        console.log('creatorPicUrl =>', nweetObj.creatorImgUrl)
        console.log('userObj.photoURL =>', userObj.photoURL)
        console.log('userObj =>', userObj);
        console.log('newDisplayName =>', newDisplayName);

        //완료
        refreshUser();

        console.log('userObj.displayName =>', userObj.displayName);
        //setNewProfilePic("")
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
            <div className="profile-box__my">
                <img src={newProfilePic} />
            </div>
            <button onClick={onClearProfileUrl}>이미지 삭제</button>
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
                    value="저장"
                />
            </form>
        </>
    )
};
export default EditProfile;