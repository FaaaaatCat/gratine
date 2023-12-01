import React, { useEffect, useState } from "react";
import { dbService, storageService } from '../fbase';
import { getAuth, onAuthStateChanged, reauthenticateWithCredential, EmailAuthProvider, deleteUser } from "firebase/auth";
import { collection, onSnapshot, addDoc, deleteDoc, query, orderBy, where, doc, getDocs, updateDoc} from "firebase/firestore";
import { Navigate, useNavigate } from "react-router-dom";
import Modal from 'react-modal';
Modal.setAppElement('#root');

const Member = ({ isLoggedIn, fbUserObj, userObj, loginUsers, vendingManage, attendManage }) => {
    const auth = getAuth();
    const user = auth.currentUser;
    const navigate = useNavigate();
    //const [loginUsers, setLoginUsers] = useState([]);
    const [firstModalOpen, setFirstModalOpen] = useState(false);
    const [secondModalOpen, setSecondModalOpen] = useState(false);
    const [firstManageOpen, setFirstManageOpen] = useState(false);
    const [secondManageOpen, setSecondManageOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState('');
    const [password, setPassword] = useState('');
    const [managerPassword, setManagerPassword] = useState('');
    const [isMe, setIsMe] = useState(false);
    const defaultProfile = 'https://firebasestorage.googleapis.com/v0/b/gratia-2cdd0.appspot.com/o/gratine%2Fdefault_profile.png?alt=media&token=9003c59f-8f33-4d0a-822c-034682416355';
    const manageProfile = 'https://firebasestorage.googleapis.com/v0/b/gratia-2cdd0.appspot.com/o/gratine%2Fletter.png?alt=media&token=37e2fb0a-05ca-4061-a852-3a3cdf9f48c7'
    
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
    const openFirstModal = (loginUser) => {
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

    //매니저용 모달
    const openFirstManage = () => {
        setFirstManageOpen(true)
    }
    const closeFirstManage = () => {
        setFirstManageOpen(false)
    };
    const openSecondManage = () => {
        closeFirstManage();
        setSecondManageOpen(true);
    };
    const closeSecondManage = () => {
        setSecondManageOpen(false);
    };

    const handlePasswordChange = (e) => {
        setManagerPassword(e.target.value);
    };

    const checkPassword = () => {
        if (managerPassword === '1229') {
            alert('관리자가 맞습니다.');
            setFirstManageOpen(false);
            openSecondManage();
        } else {
            alert('비밀번호가 올바르지 않습니다.');
        }
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
            login: false,
        })
    }

    
    //상점오픈기능
    const doVendingOpen = async () => {
        const GameRef = doc(dbService, "game", 'DA2wcYWO6FIugdhHfSEw');
        await updateDoc(GameRef, { 
            vending: true
        })
        closeSecondManage();
    }
    const doVendingClose = async () => {
        const GameRef = doc(dbService, "game", 'DA2wcYWO6FIugdhHfSEw');
        await updateDoc(GameRef, { 
            vending: false
        })
        closeSecondManage();
    }

    //출석오픈기능
    const doAttendingOpen = async () => {
        const GameRef = doc(dbService, "game", 'DA2wcYWO6FIugdhHfSEw');
        await updateDoc(GameRef, { 
            attending: true
        })
        closeSecondManage();
    }
    const doAttendingClose = async () => {
        const GameRef = doc(dbService, "game", 'DA2wcYWO6FIugdhHfSEw');
        await updateDoc(GameRef, { 
            attending: false
        })
        closeSecondManage();
    }



    //매직에그 돌리기
    //오늘 날짜
    let todayfull = new Date().toLocaleString();
    //에그사진 모음
    let egg_1 = 'https://firebasestorage.googleapis.com/v0/b/gratia-2cdd0.appspot.com/o/gratine%2FmagicEgg%2F%EA%B0%88%EC%83%89.avif?alt=media&token=25d66771-8b72-4ec1-b3be-02ea575f213b'
    let egg_2 = 'https://firebasestorage.googleapis.com/v0/b/gratia-2cdd0.appspot.com/o/gratine%2FmagicEgg%2F%EA%B2%80%EC%9D%80%EC%83%89.avif?alt=media&token=69ac9d0a-f508-4641-8f0f-ed48eb48e2b4'
    let egg_3 = 'https://firebasestorage.googleapis.com/v0/b/gratia-2cdd0.appspot.com/o/gratine%2FmagicEgg%2F%EA%B8%88%EC%83%89.avif?alt=media&token=c4a1d164-fbd5-48d5-aa8d-1f6410324e82'
    let egg_4 = 'https://firebasestorage.googleapis.com/v0/b/gratia-2cdd0.appspot.com/o/gratine%2FmagicEgg%2F%EB%82%A8%EC%83%89.avif?alt=media&token=34ad82a4-310c-42f4-baea-1b50d3922d13'
    let egg_5 = 'https://firebasestorage.googleapis.com/v0/b/gratia-2cdd0.appspot.com/o/gratine%2FmagicEgg%2F%EB%85%B8%EB%9E%91.avif?alt=media&token=0ba28006-8bb2-4285-a802-6d3c4116435b'
    let egg_6 = 'https://firebasestorage.googleapis.com/v0/b/gratia-2cdd0.appspot.com/o/gratine%2FmagicEgg%2F%EB%AF%BC%ED%8A%B8%EC%83%89.avif?alt=media&token=779df891-066a-45ad-a7ae-443a79705bc3'
    let egg_7 = 'https://firebasestorage.googleapis.com/v0/b/gratia-2cdd0.appspot.com/o/gratine%2FmagicEgg%2F%EB%B3%B4%EB%9D%BC.avif?alt=media&token=09f31efe-d97e-42da-ae43-acca5182c19c'
    let egg_8 = 'https://firebasestorage.googleapis.com/v0/b/gratia-2cdd0.appspot.com/o/gratine%2FmagicEgg%2F%EB%B9%A8%EA%B0%95.avif?alt=media&token=45102225-99d4-46bd-a8cd-923900cc0dd3'
    let egg_9 = 'https://firebasestorage.googleapis.com/v0/b/gratia-2cdd0.appspot.com/o/gratine%2FmagicEgg%2F%EC%9D%80%EC%83%89.avif?alt=media&token=5da855ca-84f4-4a8c-a3a0-190f1d5ada98'
    let egg_10 = 'https://firebasestorage.googleapis.com/v0/b/gratia-2cdd0.appspot.com/o/gratine%2FmagicEgg%2F%EC%A3%BC%ED%99%A9.avif?alt=media&token=692718c4-2336-4a9e-9378-4caeaf0df474'
    let egg_11 = 'https://firebasestorage.googleapis.com/v0/b/gratia-2cdd0.appspot.com/o/gratine%2FmagicEgg%2F%EC%B4%88%EB%A1%9D.avif?alt=media&token=7ec83673-cf10-46e4-9d77-d34494f34c42'
    let egg_12 = 'https://firebasestorage.googleapis.com/v0/b/gratia-2cdd0.appspot.com/o/gratine%2FmagicEgg%2F%ED%8C%8C%EB%9E%91.avif?alt=media&token=c8f1f704-88ab-4e2a-9858-681fc7e2b94c'
    let egg_13 = 'https://firebasestorage.googleapis.com/v0/b/gratia-2cdd0.appspot.com/o/gratine%2FmagicEgg%2F%ED%95%91%ED%81%AC%EC%83%89.avif?alt=media&token=3e38d098-d195-4ada-b1f7-224e90de1cd1'
    let egg_14 = 'https://firebasestorage.googleapis.com/v0/b/gratia-2cdd0.appspot.com/o/gratine%2FmagicEgg%2F%ED%9D%B0%EC%83%89.avif?alt=media&token=e28847a4-66c8-4628-98d3-197ef297b75a'

    let color_1 = '갈색'
    let color_2 = '검은색'
    let color_3 = '금색'
    let color_4 = '남색'
    let color_5 = '노랑'
    let color_6 = '민트색'
    let color_7 = '보라색'
    let color_8 = '빨강색'
    let color_9 = '은색'
    let color_10 = '주황색'
    let color_11 = '초록색'
    let color_12 = '파랑색'
    let color_13 = '핑크색'
    let color_14 = '흰색'
    
    let eggList = [egg_1, egg_2, egg_3, egg_4, egg_5, egg_6, egg_7, egg_8, egg_9, egg_10, egg_11, egg_12, egg_13, egg_14];
    let colorList = [color_1, color_2, color_3, color_4, color_5, color_6, color_7, color_8, color_9, color_10, color_11, color_12, color_13, color_14];

    const doMagicEgg = async () => {
        const numbers = [];
        while (numbers.length < 5) {
            const randomNumber = Math.floor(Math.random() * eggList.length) + 0;
            if (!numbers.includes(randomNumber)) {
                numbers.push(randomNumber);
            }
        }
        //숫자를 글자로 변환

        let attachmentUrl_1 = eggList[numbers[0]];
        let attachmentUrl_2 = eggList[numbers[1]];
        let attachmentUrl_3 = eggList[numbers[2]];
        let attachmentUrl_4 = eggList[numbers[3]];
        let attachmentUrl_5 = eggList[numbers[4]];

        const buyMention = `[매직에그] 금주의 매직에그를 발표합니다. \n당첨 에그 : ${colorList[[numbers[0]]]}, ${colorList[[numbers[1]]]}, ${colorList[[numbers[2]]]}, ${colorList[[numbers[3]]]}, ${colorList[[numbers[4]]]},
        \n당첨자 분들은 진행계 DM으로 오시면 보상을 드립니다! \n(※당첨 주 주말이 지나면 보상이 사라지니 주의해 주세요)
        \n3등(총 3개 정답): 300G\n2등(총 4개 정답): 500G\n1등(총 5개 정답): 1500G
        \n발표일자 : ${todayfull}`
        const buyNweetObj = {
            text: buyMention,
            createdAt: Date.now(),
            createdDate: todayfull,
            creatorId: '관리자',
            creatorName: '관리자',
            creatorImg: manageProfile,
            buy: true,
            imgNums_5: true,
            attachmentUrl_1,
            attachmentUrl_2,
            attachmentUrl_3,
            attachmentUrl_4,
            attachmentUrl_5,
        };
        await addDoc(collection(dbService, "nweets"), buyNweetObj);
        closeSecondManage();
        return;
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
                        ))}
                        <div
                            className="member-list"
                            onClick={() => openFirstManage()}
                        >
                            <img className="profile-box" src={manageProfile} alt="" />
                            <p>관리자</p>
                        </div>
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

            <Modal isOpen={firstManageOpen} className="modal__manager">
                <div className="modal-header">
                    <p>관리자 메뉴</p>
                    <span onClick={()=> closeFirstManage()} className="material-icons-round">close</span>
                </div>
                <div className="modal-body">
                    <p>관리자 비밀번호를 입력해주세요</p>
                    <div className="flx-row gap-1 mt-3">
                        <input className="gtn-input" type="number" value={managerPassword} onChange={handlePasswordChange} />
                        <button className="gtn-btn btn-brown w-40" onClick={checkPassword}>확인</button>
                    </div>
                    
                </div>
                <div className="modal-btn">
                    <button className="gtn-btn" onClick={()=> closeFirstManage()}>닫기</button>
                </div>
            </Modal>

            <Modal isOpen={secondManageOpen} className="modal__manager">
                <div className="modal-header">
                    <p>관리자 메뉴</p>
                    <span onClick={()=> closeSecondManage()} className="material-icons-round">close</span>
                </div>
                <div className="modal-body flx-start">
                    <p>현재 시간이 <b>금요일 오후 6시</b> 인지 확인해주세요.</p>
                    <p>금주의 매직에그를 돌리겠습니까?</p>
                    <button
                        onClick={()=> doMagicEgg()}
                        className="gtn-btn btn-mint flx-row gap-2 mt-4"
                    >매직에그 돌리기 <span className="material-icons-round">arrow_forward</span></button>
                    <p className="mt-4 opacity-03">-----------------------------------------------------------------------</p>
                    <div>
                        <b className="txt-14">⭐️그외 기능</b>
                        <p className="mt-1">(선택 후 새로고침 (f5)을 꼭 해주세요.)</p>
                    </div>
                    <div className="flx-row gap-1 mt-3">
                        <p>✦ 상점 : </p>
                        <button
                            onClick={()=> doVendingOpen()}
                            className={'gtn-btn flx-row gap-2 w-unset ' + (vendingManage? 'btn-yellow':'btn-white')}
                        >상점 열기</button>
                        <button
                            onClick={() => doVendingClose()}
                            className={'gtn-btn flx-row gap-2 w-unset ' + (vendingManage? 'btn-white':'btn-yellow')}
                            
                        >상점 닫기</button>
                    </div>
                    <div className="flx-row gap-1">
                        <p>✦ 출석 : </p>
                        <button
                            onClick={()=> doAttendingOpen()}
                            className={'gtn-btn flx-row gap-2 w-unset ' + (attendManage? 'btn-yellow':'btn-white')}
                        >출석 시작</button>
                        <button
                            onClick={() => doAttendingClose()}
                            className={'gtn-btn flx-row gap-2 w-unset ' + (attendManage? 'btn-white':'btn-yellow')}
                            
                        >출석 닫기</button>
                    </div>
                </div>
                <div className="modal-btn">
                    <button className="gtn-btn" onClick={()=> closeSecondManage()}>닫기</button>
                </div>
            </Modal>
        </>
    );
};

export default Member;