import React, { useEffect, useState } from "react";
import { dbService, storageService } from '../fbase';
import { getAuth, onAuthStateChanged, deleteUser } from "firebase/auth";
import { collection, onSnapshot, addDoc, deleteDoc, query, orderBy, where, doc, getDocs, updateDoc} from "firebase/firestore";
import { Navigate, useNavigate } from "react-router-dom";
import Modal from 'react-modal';
Modal.setAppElement('#root');

const Member = ({ isLoggedIn, fbUserObj, userObj }) => {
    const auth = getAuth();
    const user = auth.currentUser;
    const navigate = useNavigate();
    const [loginUsers, setLoginUsers] = useState([]);
    const [userGameData, setUserGameData] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState('');
    const [isMe, setIsMe] = useState(false);

    useEffect(() => {
        if (isLoggedIn) {
            readLoginUser();
            readUSerGameData();
        }
        else {
            //setLogOut();
        }
    }, []);

    //로그인된 유저데이터 (user, userGame) 불러오는 기능
    const readLoginUser = async () => {
        const q = query(
          collection(dbService, "user"),
          //where("login", "==", true)
        );
        const unsubscribe = onSnapshot(q, (Snapshot) => {
            const loginUserArray = Snapshot.docs.map((doc) => { //snapshot : 트윗을 받을때마다 알림 받는곳. 새로운 스냅샷을 받을때 nweetArray 라는 배열을 만듬
                return {
                    id: doc.id,
                    ...doc.data(), //...은 데이터의 내용물, 즉 spread attribute 기능임
                };
            });
            setLoginUsers(loginUserArray);
        });
        onAuthStateChanged(auth, (user) => {
            if (user == null) {
                unsubscribe();
            }
        });
        // querySnapshot.forEach((doc) => {
        //     return (
        //         console.log(doc._document.data.value.mapValue.fields)
        //     )
        // });
    }
    const readUSerGameData = async () => {
        const q = query(
          collection(dbService, "userGame")
        );
        const unsubscribe = onSnapshot(q, (Snapshot) => {
            const userGameArray = Snapshot.docs.map((doc) => { //snapshot : 트윗을 받을때마다 알림 받는곳. 새로운 스냅샷을 받을때 nweetArray 라는 배열을 만듬
                return {
                    id: doc.id,
                    ...doc.data(), //...은 데이터의 내용물, 즉 spread attribute 기능임
                };
            });
            setUserGameData(userGameArray);
        });
        onAuthStateChanged(auth, (user) => {
            if (user == null) {
                unsubscribe();
            }
        });
    }

    // 회원탈퇴 기능
    const deleteUserAccount = async() => {
        const ok = window.confirm("탈퇴하시겠습니까? 개인정보는 안전하게 모두 삭제되지만, 채팅기록은 삭제되지 않습니다.")
        if (ok) {
            await deleteUser(user).then(() => {
                window.confirm("회원탈퇴가 성공적으로 처리되었습니다.")
                deleteUserData();
                deleteUserGameData();
                auth.signOut();
                navigate("/login");
                console.log("회원탈퇴가 성공적으로 처리되었습니다.")
            }).catch((error) => {
                console.error("회원탈퇴 중 오류가 발생하였습니다.", error);
            });
        }
    }

    //회원정보 삭제 기능
    const userRef = doc(dbService, "user", `${loginUsers.id}`);
    const userGameRef = doc(dbService, "user", `${userGameData.id}`);
    const deleteUserData = async () => {
        await deleteDoc(userRef);
    }
    const deleteUserGameData = async () => {
        await deleteDoc(userGameRef);
    }


    /////////////////////////////////////////////////////////////////////////////////////////////////
    //모달
    const openModal = (loginUser) => {
        setModalIsOpen(true)
        setSelectedItem(loginUser);
        if (loginUser.uid == fbUserObj.uid) {
            setIsMe(true)
        }
        else {
            setIsMe(false)
        }
    };
    const closeModal = () => {
        setModalIsOpen(false)
        setSelectedItem('');
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
                                onClick={() => openModal(loginUser)}
                            >
                                <img src={loginUser.photoURL} className="profile-box" />
                                <p>{loginUser.displayName}</p>
                            </div>
                        ) )}
                    </>
                    :
                    <></>
                }
            </div>
            <Modal isOpen={modalIsOpen} className="modal__member">
                <div className="modal-header">
                    <p>멤버 프로필</p>
                    <span onClick={()=> closeModal()} className="material-icons-round">close</span>
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
                    {isMe && <button className="gtn-btn" onClick={() => deleteUserAccount()}>회원 탈퇴</button>}
                    <button className="gtn-btn btn-brown" onClick={()=> closeModal()}>확인</button>
                </div>
            </Modal>
        </>
    );
};

export default Member;