import React, { useEffect, useState } from "react";
import { dbService, storageService } from '../fbase';
import { getAuth, onAuthStateChanged, reauthenticateWithCredential, EmailAuthProvider, deleteUser } from "firebase/auth";
import { collection, onSnapshot, addDoc, deleteDoc, query, orderBy, where, doc, getDocs, updateDoc} from "firebase/firestore";
import { Navigate, useNavigate } from "react-router-dom";
import Modal from 'react-modal';
Modal.setAppElement('#root');

const Member = ({ isLoggedIn, fbUserObj, userObj, loginUsers }) => {
    const auth = getAuth();
    const user = auth.currentUser;
    const navigate = useNavigate();
    //const [loginUsers, setLoginUsers] = useState([]);
    const [firstModalOpen, setFirstModalOpen] = useState(false);
    const [secondModalOpen, setSecondModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState('');
    const [password, setPassword] = useState('');
    const [isMe, setIsMe] = useState(false);
    const defaultProfile = 'https://firebasestorage.googleapis.com/v0/b/gratia-2cdd0.appspot.com/o/gratine%2Fdefault_profile.png?alt=media&token=9003c59f-8f33-4d0a-822c-034682416355';
    
    // 회원탈퇴 기능
    const reauthenticateAndDelete = async () => {
        const credential = EmailAuthProvider.credential(user.email, password);
        try {
            deleteUserData();
            await reauthenticateWithCredential(user, credential);
            await deleteUser(user);
            auth.signOut();
            navigate("/login");
            window.confirm("회원탈퇴가 성공적으로 처리되었습니다.")
        } catch (error) {
            console.error("회원탈퇴 중 오류가 발생하였습니다.", error);
        }
    };
    
    //회원정보 삭제 기능
    const deleteUserData = async () => {
        const index = loginUsers.findIndex(item => item.uid === user.uid);
        const UserRef = doc(dbService, "user", loginUsers[index].id);
        await deleteDoc(UserRef);
    }


    const deleteUserAccount = async () => {
        const index = loginUsers.findIndex(item => item.uid === user.uid);
        const UserRef = doc(dbService, "user", loginUsers[index].id);
        const ok = window.confirm("탈퇴하시겠습니까? 개인정보는 안전하게 모두 삭제되지만, 채팅기록은 삭제되지 않습니다.")
        if (ok) {
            await deleteUser(user).then(() => {
                window.confirm("회원탈퇴가 성공적으로 처리되었ㄶㄴ습니다.")
                deleteUserData(UserRef);
                auth.signOut();
                navigate("/login");
            }).catch((error) => {
                console.error("회원탈퇴 중 오류가 발생하였습니다.", error);
            });
        }
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////
    //모달
    const openFirstModal  = (loginUser) => {
        setFirstModalOpen(true)
        setSelectedItem(loginUser);
        if (loginUser.uid == fbUserObj.uid) {
            setIsMe(true)
        }
        else {
            setIsMe(false)
        }
    };
    const closeFirstModal = () => {
        setFirstModalOpen(false)
        setSelectedItem('');
    };
    const openSecondModal = () => {
        closeFirstModal();
        setSecondModalOpen(true);
    };

    const closeSecondModal = () => {
        setSecondModalOpen(false);
    };

    //유저정보를 로그아웃으로 만드는 기능(*접속여부를 알고싶어서 시도중이나, 오류가 많아 아직 사용하진 않음)
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

    return (
        <>
            <div className="member-list-container">
                {isLoggedIn ?
                    <>
                        {loginUsers.map((loginUser, index) => (
                            <div
                                key={loginUser.id}
                                className="member-list"
                                onClick={() => openFirstModal (loginUser)}
                            >
                                {fbUserObj.photoURL ? <img className="profile-box" src={loginUser.photoURL} /> : <img className="profile-box" src={defaultProfile} />}
                                <p>{loginUser.displayName}</p>
                            </div>
                        ) )}
                    </>
                    :
                    <></>
                }
            </div>

            <Modal isOpen={firstModalOpen} className="modal__member">
                <div className="modal-header">
                    <p>멤버 프로필</p>
                    <span onClick={()=> closeFirstModal()} className="material-icons-round">close</span>
                </div>
                <div className="modal-body">
                    <div className="profile-img">
                        <img src={selectedItem.photoURL} alt="" />
                    </div>
                    <div className="nameplate">
                        {selectedItem.displayName}
                    </div>
                    <div className="profile-info">
                        <div className="info-item">
                            <span className="material-icons-round">business_center</span>
                            <p>{selectedItem.item}</p>
                        </div>
                    </div>
                </div>
                <div className="modal-btn">
                    {isMe && <button className="gtn-btn" onClick={() => openSecondModal()}>회원 탈퇴</button>}
                    <button className="gtn-btn btn-brown" onClick={()=> closeFirstModal()}>확인</button>
                </div>
            </Modal>

            <Modal isOpen={secondModalOpen} className="modal__member">
                <div className="modal-header">
                    <p>회원 탈퇴</p>
                    <span onClick={()=> closeSecondModal()} className="material-icons-round">close</span>
                </div>
                <div className="modal-body flx-start">
                    <p className="mb-3">탈퇴하시겠습니까? 개인정보는 안전하게 모두 삭제되지만, 채팅기록은 삭제되지 않습니다.</p>
                    <b>탈퇴하려면 비밀번호를 입력해주세요.</b>
                    <input
                        type="password"
                        placeholder="비밀번호"
                        value={password}
                        className="gtn-input"
                        onChange={e => setPassword(e.target.value)}
                    />
                </div>
                <div className="modal-btn">
                    <button className="gtn-btn" onClick={() => reauthenticateAndDelete()}>탈퇴 하기</button>
                    <button className="gtn-btn btn-brown" onClick={()=> closeSecondModal()}>취소</button>
                </div>
            </Modal>
        </>
    );
};

export default Member;