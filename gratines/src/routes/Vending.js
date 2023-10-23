import React, { useState } from 'react';
import { dbService, storageService } from '../fbase';
import { collection, addDoc, query, onSnapshot, orderBy,where, doc, getDocs, updateDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import quillImg from '../images/item_quill.png'
import bookmarkImg from '../images/item_bookmark.png'
import crystallImg from '../images/item_crystall.png'
import magichatImg from '../images/item_magichat.png'
import diamondImg from '../images/item_diamond.png'
import storeImg from '../images/item_store.png'
import duckImg from '../images/item_doll1.png'
import ducksImg from '../images/item_doll2.png'
import magiceggImg from '../images/item_magicegg.png'
import pochunImg from '../images/item_fortune.png'
import Modal from 'react-modal';
Modal.setAppElement('#root');

const Vending = ({userObj, fbUserObj, refreshUser}) => {
    const [modalIsOpen, setModalIsOpen] = useState(false);

    //포춘글귀 모음
    let fortune_1 = '우리는 나이가 들면서 변하는 게 아니다. 보다 자기 다워지는 것이다.'
    let fortune_2 = '게으르지 않음은 영원한 삶의 집이요, 게으름은 죽음의 집이다.'
    let fortune_3 = '나는 날마다, 모든 면에서, 점점 더 좋아지고 있다.'
    let fortune_4 = '인생에 뜻을 세우는데 적당한 때는 없다.'
    let fortune_5 = '실패는 잊어라. 하지만 그것이 준 교훈은 절대 잊으면 안 된다.'
    let fortuneList = [fortune_1, fortune_2, fortune_3, fortune_4, fortune_5];
    
    //오리인형 모음
    let duck_1 = 'https://firebasestorage.googleapis.com/v0/b/gratia-2cdd0.appspot.com/o/gratine%2Fbears_1.JPG?alt=media&token=d1844607-6814-4969-95b7-f62a84d9d247'
    let duck_2 = 'https://firebasestorage.googleapis.com/v0/b/gratia-2cdd0.appspot.com/o/gratine%2Fbears_2.JPG?alt=media&token=4942eb5d-6e7b-444f-ba5b-e71e58b70cf2'
    let duck_3 = 'https://firebasestorage.googleapis.com/v0/b/gratia-2cdd0.appspot.com/o/gratine%2Fbears_3.JPG?alt=media&token=f54417dc-4018-4d53-949a-431810186f01'
    let duck_4 = 'https://firebasestorage.googleapis.com/v0/b/gratia-2cdd0.appspot.com/o/gratine%2Fbears_4.JPG?alt=media&token=2640217f-6083-4b81-8314-4c1b6e384f55'
    let duck_5 = 'https://firebasestorage.googleapis.com/v0/b/gratia-2cdd0.appspot.com/o/gratine%2Fbears_5.JPG?alt=media&token=bade5db1-55dd-4b02-ac9f-74fb6247bb54'
    let duckList = [duck_1, duck_2, duck_3, duck_4, duck_5];
    
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
                let buyMention;
                let diceNum;
                switch (itemName) {
                    case '매직 에그':
                        buyMention = `[구매완료] ${itemName}(${itemPrice})을 구매했습니다. \n남은 소지금 : ${fbUserObj.gold - extractedNumber} Gold / 구매일자 : ${todayfull}\n\n아래 14개의 색상 중 총 5개를 선택해 진행계DM으로 알려주세요.\n색상종류 : 빨강, 주황, 노랑, 초록, 파랑, 남색, 보라, 흰색, 검은색, 민트, 분홍, 은색, 금색, 갈색`
                        break;
                    case '예언의 쿠키':
                        var random_index = Math.floor(Math.random() * fortuneList.length);
                        let random_fortune = fortuneList[random_index]
                        buyMention = `예언의 쿠키를 까보니 이런말이 적혀있네요. \n"${random_fortune}"\n\n[구매완료] ${itemName}(${itemPrice})을 구매했습니다. \n남은 소지금 : ${fbUserObj.gold - extractedNumber} Gold / 구매일자 : ${todayfull}`
                        break;
                    case '인형 척척박사':
                        const rollDice = Math.ceil(Math.random() * (2 - 0) + 0)
                        if (rollDice === 1) diceNum = '1번'
                        else diceNum = '2번'
                        buyMention = `척척박사가 말씀하시길, ${diceNum}에 신비한 힘이 느껴진다고 합니다.\n\n[구매완료] ${itemName}(${itemPrice})을 구매했습니다. \n남은 소지금 : ${fbUserObj.gold - extractedNumber} Gold / 구매일자 : ${todayfull}`
                        break;
                    case '행운의 돌':
                        diceNum = Math.ceil(Math.random() * (10 - 1) + 1)
                        buyMention = `세계수의 힘으로 화분이 ${diceNum} 만큼 추가로 성장할것 같습니다...!\n(운영진에게 해당 화면을 찍어 DM 보내주세요) \n\n[구매완료] ${itemName}(${itemPrice})을 구매했습니다. \n남은 소지금 : ${fbUserObj.gold - extractedNumber} Gold / 구매일자 : ${todayfull}`
                        break;
                    default:
                        buyMention = `[구매완료] ${itemName}(${itemPrice})을 구매했습니다. \n남은 소지금 : ${fbUserObj.gold - extractedNumber} Gold / 구매일자 : ${todayfull}`
                        break;
                }
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
        
        var random_index = Math.floor(Math.random() * duckList.length);
        let random_duck = duckList[random_index]
        let attachmentUrl = random_duck;

        const ok = window.confirm(`${itemName}(${itemPrice})을 구매하시겠습니까?`);
        if (ok) {
            if (extractedNumber <= fbUserObj.gold) {
                const buyMention = `[구매완료] ${itemName}(${itemPrice})을 구매했습니다. \n남은 소지금 : ${fbUserObj.gold - extractedNumber} Gold / 구매일자 : ${todayfull}`
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

    //인형(랜덤)구매 여러개 기능
    const doBuyFiveDolls = async (e) => {
        const itemName = e.target.children[1].children[0].innerText;
        const itemPrice = e.target.children[1].children[1].innerText;
        const extractedNumber = parseInt(itemPrice, 10);
        
        const numbers = [];
        while (numbers.length < 5) {
            const randomNumber = Math.floor(Math.random() * duckList.length) + 0;
            if (!numbers.includes(randomNumber)) {
                numbers.push(randomNumber);
            }
        }

        let attachmentUrl_1 = duckList[numbers[0]];
        let attachmentUrl_2 = duckList[numbers[1]];
        let attachmentUrl_3 = duckList[numbers[2]];
        let attachmentUrl_4 = duckList[numbers[3]];
        let attachmentUrl_5 = duckList[numbers[4]];

        const ok = window.confirm(`${itemName}(${itemPrice})을 구매하시겠습니까?`);
        if (ok) {
            if (extractedNumber <= fbUserObj.gold) {
                const buyMention = `[구매완료] ${itemName}(${itemPrice})을 구매했습니다. \n남은 소지금 : ${fbUserObj.gold - extractedNumber} Gold / 구매일자 : ${todayfull}`
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
                    imgBig: true,
                    attachmentUrl_1,
                    attachmentUrl_2,
                    attachmentUrl_3,
                    attachmentUrl_4,
                    attachmentUrl_5,
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
        const itemName = e.target.children[1].children[0].innerText;
        const itemPrice = e.target.children[1].children[1].innerText;
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
                {/* <div className="vending-item soldOut">
                    <div className="img-box">
                        <img src={cocktailImg} alt="" />
                    </div>
                    <div className="txt-box">
                        <p>아이템 이름</p>
                        <span>100 G</span>
                    </div>
                </div> */}
                {/* <div className="vending-item" onClick={doBuyCocktail}>
                    <div className='eventTag'>event</div>
                    <div className="img-box">
                        <img src={cocktailImg} alt="" />
                    </div>
                    <div className="txt-box">
                        <p>칵테일 재료</p>
                        <span className='bg-purple'>0 G</span>
                    </div>
                </div> */}
                <div className="vending-item" onClick={doBuy}>
                    <div className="img-box">
                        <img src={pochunImg} alt="" />
                    </div>
                    <div className="txt-box">
                        <p>예언의 쿠키</p>
                        <span>10 G</span>
                    </div>
                </div>
                <div className="vending-item" onClick={doBuy}>
                    <div className="img-box">
                        <img src={magichatImg} alt="" />
                    </div>
                    <div className="txt-box">
                        <p>인형 척척박사</p>
                        <span>20 G</span>
                    </div>
                </div>
                <div className="vending-item" onClick={doBuy}>
                    <div className="img-box">
                        <img src={quillImg} alt="" />
                    </div>
                    <div className="txt-box">
                        <p>저절로 깃펜</p>
                        <span>70 G</span>
                    </div>
                </div>
                <div className="vending-item" onClick={doBuy}>
                    <div className="img-box">
                        <img src={crystallImg} alt="" />
                    </div>
                    <div className="txt-box">
                        <p>추억의 수정구</p>
                        <span>70 G</span>
                    </div>
                </div>
                <div className="vending-item" onClick={doBuy}>
                    <div className="img-box">
                        <img src={bookmarkImg} alt="" />
                    </div>
                    <div className="txt-box">
                        <p>마법의 책갈피</p>
                        <span>70 G</span>
                    </div>
                </div>
                <div className="vending-item" onClick={doBuy}>
                    <div className="img-box">
                        <img src={magiceggImg} alt="" />
                    </div>
                    <div className="txt-box">
                        <p>매직 에그</p>
                        <span>100 G</span>
                    </div>
                    <div className='eventTag'>주1회</div>
                </div>
                <div className="vending-item" onClick={doBuyDolls}>
                    <div className="img-box">
                        <img src={duckImg} alt="" />
                    </div>
                    <div className="txt-box">
                        <p>오리인형(랜덤)</p>
                        <span>300 G</span>
                    </div>
                </div>
                <div className="vending-item" onClick={doBuyFiveDolls}>
                    <div className="img-box">
                        <img src={ducksImg} alt="" />
                    </div>
                    <div className="txt-box">
                        <p>오리인형(랜덤)</p>
                        <span>1500 G</span>
                    </div>
                    <div className='eventTag'>5 + 1 이벤트</div>
                </div>
                <div className="vending-item" onClick={doBuy}>
                    <div className="img-box">
                        <img src={diamondImg} alt="" />
                    </div>
                    <div className="txt-box">
                        <p>행운의 돌</p>
                        <span>1000 G</span>
                    </div>
                    <div className='eventTag'>한정수량</div>
                </div>
                <div className="vending-item" onClick={doBuy}>
                    <div className="img-box">
                        <img src={storeImg} alt="" />
                    </div>
                    <div className="txt-box">
                        <p>1일 가판대</p>
                        <span>1500 G</span>
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