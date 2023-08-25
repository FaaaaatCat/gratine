import React, { useState } from 'react';
import { dbService, storageService } from '../fbase';
import { collection, addDoc, query, onSnapshot, orderBy,where, doc, getDocs, updateDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import bearImg1 from '../images/bears/bears_1.JPG'
import bearImg2 from '../images/bears/bears_2.JPG'
import bearImg3 from '../images/bears/bears_3.JPG'
import bearImg4 from '../images/bears/bears_4.JPG'
import bearImg5 from '../images/bears/bears_5.JPG'
import cocktail from '../images/cocktail.png'
import doll from '../images/doll.png'
import Modal from 'react-modal';
Modal.setAppElement('#root');

const Vending = ({userObj, fbUserObj, refreshUser}) => {
    const [modalIsOpen, setModalIsOpen] = useState(false);

    //오늘 날짜
    let todayfull = new Date().toLocaleString();

    //소지금 데이터 불러오기
    const editGold = async (extractedNumber) => {
        const q = query(
            collection(dbService, "user"),
            where("uid", "==", userObj.uid)
        );
        const querySnapshot = await getDocs(q);
        const UserGameData_Id = querySnapshot.docs[0].id;
        const UserGameRef = doc(dbService, "user", UserGameData_Id);
        await updateDoc(UserGameRef, {
            gold: fbUserObj.gold - extractedNumber,
        })
        refreshUser();
    }

    //상품 구매 기능
    const doBuy = async (e) => {
        const itemName = e.target.children[1].children[0].innerText;
        const itemPrice = e.target.children[1].children[1].innerText;
        const extractedNumber = parseInt(itemPrice, 10);
        const ok = window.confirm(`${itemName}(${itemPrice})을 구매하시겠습니까?`);
        if (ok) {
            if (extractedNumber <= fbUserObj.gold) {
                const buyMention = `[구매완료] ${itemName}(${itemPrice})을 구매했습니다. 남은 소지금은 ${fbUserObj.gold - extractedNumber} Gold 입니다. (${todayfull}) `
                const buyNweetObj = {
                    text: buyMention,
                    createdAt: Date.now(),
                    createdDate: todayfull,
                    creatorId: userObj.uid,
                    creatorName: userObj.displayName,
                    creatorImg: userObj.photoURL,
                    buy: true,
                    buyItem: itemName,
                    buyPrice:itemPrice,
                };
                await addDoc(collection(dbService, "nweets"), buyNweetObj);
                editGold(extractedNumber)
            }
            else {
                window.confirm("소지금이 부족합니다ㅜㅜ");
            }
        }
    }
    //인형(랜덤)구매 기능
    const doBuyDolls = async (e) => {
        const itemName = e.target.children[1].children[0].innerText;
        const itemPrice = e.target.children[1].children[1].innerText;
        const extractedNumber = parseInt(itemPrice, 10);
        let bear_1 = 'https://firebasestorage.googleapis.com/v0/b/gratia-2cdd0.appspot.com/o/gratine%2Fbears_1.JPG?alt=media&token=d1844607-6814-4969-95b7-f62a84d9d247'
        let bear_2 = 'https://firebasestorage.googleapis.com/v0/b/gratia-2cdd0.appspot.com/o/gratine%2Fbears_2.JPG?alt=media&token=4942eb5d-6e7b-444f-ba5b-e71e58b70cf2'
        let bear_3 = 'https://firebasestorage.googleapis.com/v0/b/gratia-2cdd0.appspot.com/o/gratine%2Fbears_3.JPG?alt=media&token=f54417dc-4018-4d53-949a-431810186f01'
        let bear_4 = 'https://firebasestorage.googleapis.com/v0/b/gratia-2cdd0.appspot.com/o/gratine%2Fbears_4.JPG?alt=media&token=2640217f-6083-4b81-8314-4c1b6e384f55'
        let bear_5 = 'https://firebasestorage.googleapis.com/v0/b/gratia-2cdd0.appspot.com/o/gratine%2Fbears_5.JPG?alt=media&token=bade5db1-55dd-4b02-ac9f-74fb6247bb54'
        let bearList = [bear_1, bear_2, bear_3, bear_4, bear_5];
        var random_index = Math.floor(Math.random() * bearList.length);
        let random_bear = bearList[random_index]
        let attachmentUrl = random_bear;

        const ok = window.confirm(`${itemName}(${itemPrice})을 구매하시겠습니까?`);
        if (ok) {
            if (extractedNumber <= fbUserObj.gold) {
                const buyMention = `[구매완료] ${itemName}(${itemPrice})을 구매했습니다. 남은 소지금은 ${fbUserObj.gold - extractedNumber} Gold 입니다. (${todayfull}) `
                const buyNweetObj = {
                    text: buyMention,
                    createdAt: Date.now(),
                    createdDate: todayfull,
                    creatorId: userObj.uid,
                    creatorName: userObj.displayName,
                    creatorImg: userObj.photoURL,
                    buy: true,
                    buyItem: itemName,
                    buyPrice: itemPrice,
                    attachmentUrl,
                };
                await addDoc(collection(dbService, "nweets"), buyNweetObj);
                editGold(extractedNumber)
            }
            else {
                window.confirm("소지금이 부족합니다ㅜㅜ");
            }
        }
    }
    //칵테일재료(4개 랜덤)구매 기능
    const doBuyCocktail = async (e) => {
        const itemName = e.target.children[2].children[0].innerText;
        const itemPrice = e.target.children[2].children[1].innerText;
        const extractedNumber = parseInt(itemPrice, 10);
        let cockList = ['얼음', '계란', '계피 스틱', '콜라', '딸기', '커피', '민트초코', '아이스크림', '식용장미', '토닉워터', '무알콜 와인', '홍차', '휘핑크림', '타바스코', '초콜릿', '진저비어', '올리브', '블루 큐라소', '곰돌이젤리', '민트잎', '오이', '소금', '우유', '식초']
        var random_index_1 = Math.floor(Math.random() * cockList.length);
        var random_index_2 = Math.floor(Math.random() * cockList.length);
        var random_index_3 = Math.floor(Math.random() * cockList.length);
        var random_index_4 = Math.floor(Math.random() * cockList.length);
        var random_cock_1 = cockList[random_index_1];
        var random_cock_2 = cockList[random_index_2];
        var random_cock_3 = cockList[random_index_3];
        var random_cock_4 = cockList[random_index_4];
        let selectedCockArr = [random_cock_1, random_cock_2, random_cock_3, random_cock_4]
        let selectedCock = selectedCockArr.join(' ,');

        const ok = window.confirm("칵테일 재료를 구매하시겠습니까? 4개의 랜덤한 재료가 선택됩니다.");
        if (ok) {
            if (extractedNumber <= fbUserObj.gold) {
                const buyMention = `[칵테일 제조] 칵테일 재료(${selectedCock})을 구매했어요. 네 개의 재료들로 맛있는 칵테일 완성~! (${todayfull}) `
                const buyNweetObj = {
                    text: buyMention,
                    createdAt: Date.now(),
                    createdDate: todayfull,
                    creatorId: userObj.uid,
                    creatorName: userObj.displayName,
                    creatorImg: userObj.photoURL,
                    buy: true,
                    buyItem: '칵테일',
                    buyPrice: 0,
                };
                await addDoc(collection(dbService, "nweets"), buyNweetObj);
            }
            else {
                window.confirm("소지금이 부족합니다ㅜㅜ");
            }
        }
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////
    //모달
    const openModal = () => {
        setModalIsOpen(true)
    };
    const closeModal = () => {
        setModalIsOpen(false)
    };
    return (
        <>
            <div className="vending-list-container">
                <div className="vending-item soldOut">
                    <div className="img-box">
                        <img src={bearImg1} alt="" />
                    </div>
                    <div className="txt-box">
                        <p>아이템 이름</p>
                        <span>100 G</span>
                    </div>
                </div>
                <div className="vending-item" onClick={doBuyCocktail}>
                    <div className='eventTag'>event</div>
                    <div className="img-box">
                        <img src={cocktail} alt="" />
                    </div>
                    <div className="txt-box">
                        <p>칵테일 재료</p>
                        <span className='bg-purple'>0 G</span>
                    </div>
                </div>
                <div className="vending-item" onClick={doBuyDolls}>
                    <div className="img-box">
                        <img src={doll} alt="" />
                    </div>
                    <div className="txt-box">
                        <p>인형(랜덤)</p>
                        <span>999 G</span>
                    </div>
                </div>
                <div className="vending-item" onClick={doBuy}>
                    <div className="img-box">
                        <img src={bearImg3} alt="" />
                    </div>
                    <div className="txt-box">
                        <p>아이템 A</p>
                        <span>100 G</span>
                    </div>
                </div>
                <div className="vending-item" onClick={doBuy}>
                    <div className="img-box">
                        <img src={bearImg2} alt="" />
                    </div>
                    <div className="txt-box">
                        <p>아이템 B</p>
                        <span>120 G</span>
                    </div>
                </div>
                <div className="vending-item" onClick={doBuy}>
                    <div className="img-box">
                        <img src={bearImg5} alt="" />
                    </div>
                    <div className="txt-box">
                        <p>아이템 C</p>
                        <span>140 G</span>
                    </div>
                </div>
            </div>
            {/* <Modal isOpen={modalIsOpen} className="modal__member">
                <div className="modal-header">
                    <p>모달창 제목</p>
                    <span onClick={()=> closeModal()} className="material-icons-round">close</span>
                </div>
                <div className="modal-body">
                    내용이 들어갑니다.
                </div>
                <div className="modal-btn">
                    <button className="gtn-btn btn-brown" onClick={()=> closeModal()}>확인</button>
                </div>
            </Modal> */}
        </>
    );
};

export default Vending;