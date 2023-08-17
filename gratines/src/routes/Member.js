import React, { useEffect, useState } from "react";
import { dbService, storageService } from '../fbase';
import { getAuth, onAuthStateChanged, deleteUser } from "firebase/auth";
import { collection, onSnapshot, addDoc, query, orderBy, where, doc, getDocs, updateDoc} from "firebase/firestore";
import { Navigate, useNavigate } from "react-router-dom";
import Modal from 'react-modal';
Modal.setAppElement('#root');

const Member = ({ isLoggedIn, fbUserObj, userObj }) => {
    const auth = getAuth();
    const user = auth.currentUser;
    const navigate = useNavigate();
    const [loginUsers, setLoginUsers] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState('');
    const [isMe, setIsMe] = useState(false);

    useEffect(() => {
        if (isLoggedIn) {
            readLoginUser();
        }
        else {
            //setLogOut();
        }
    }, []);

    //유저정보를 로그아웃으로 만드는 기능
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

    //로그인된 유저 불러오는 기능
    const readLoginUser = async () => {
        const q = query(
          collection(dbService, "user"),
          where("login", "==", true)
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

    // 회원탈퇴 함수
    const deleteUserAccount = () => {
        const ok = window.confirm("탈퇴하시겠습니까? 개인정보는 안전하게 모두 삭제되지만, 채팅기록은 삭제되지 않습니다.")
        if (ok) {
            // if (user) {
            //     // 회원탈퇴 처리
            //     user.delete().then(function () {
            //         window.confirm("회원탈퇴가 성공적으로 처리되었습니다.")
            //         auth.signOut();
            //         navigate("/login");
            //         console.log("회원탈퇴가 성공적으로 처리되었습니다.")
            //         // 여기에 탈퇴 후 수행할 작업을 추가할 수 있습니다.
            //     }).catch(function(error) {
            //         console.error("회원탈퇴 중 오류가 발생하였습니다.", error);
            //     });
            // } else {
            //     console.log("로그인한 사용자가 없습니다.");
            // }
            deleteUser(user).then(() => {
                window.confirm("회원탈퇴가 성공적으로 처리되었습니다.")
                auth.signOut();
                navigate("/login");
                console.log("회원탈퇴가 성공적으로 처리되었습니다.")
            }).catch((error) => {
                console.error("회원탈퇴 중 오류가 발생하였습니다.", error);
            });
        }
    }

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
                    <button className="gtn-btn btn-brown">확인</button>
                </div>
            </Modal>
        </>
    );
};

export default Member;