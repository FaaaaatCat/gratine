import React, { useState, useEffect } from 'react';
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
    let fortune_1 = '누군가의 말에 영감을 얻을 수 있어요. 주변을 잘 살펴보세요.';
    let fortune_2 = '원하던 것을 성취할 수 있어요. 대담하게 도전해 보세요.';
    let fortune_3 = '작은 변화로 주위의 호감도를 상승시킬 수 있습니다. 다른 누군가를 참고해 보세요.';
    let fortune_4 = '미소를 지어보세요. 행운은 늘 미소와 함께한답니다.';
    let fortune_5 = '오늘은 사람과 적당히 거리를 두는 게 좋겠네요! 상대를 곤란하게 만들지도 몰라요!';
    let fortune_6 = '신경 쓰이는 사람과 더 친해질 수 있을 것 같아요. 편지를 보내보는 건 어떨까요?';
    let fortune_7 = '생각지도 않던 사람에게서 연락이 올 지도 모르는 하루에요.';
    let fortune_8 = '동료들 사이에서 평가가 올라갈 수 있는 날이에요. 자신감을 가지고 도전해봐요!';
    let fortune_9 = '재미있는 계획을 생각해낼 수 있을 것 같아요. 힌트는 주변에서 찾아볼까요?';
    let fortune_10 = '열심히 하던 일에 진전이 생겨요. 만족스러운 하루가 돼요.';
    let fortune_11 = '오늘 바라던 소원이 이루어질지도 몰라요. 연하의 친구랑 같이 다녀볼까요?';
    let fortune_12 = '도중에 그만뒀던 일을 다시 시작해보는 건 어떨까요? 새로운 시선에서 그 일을 마주할 수 있을거예요.';
    let fortune_13 = '커뮤니케이션 능력이 높아지는 날입니다. 오늘은 평소보다 대화를 주도하기 쉬워질거예요!';
    let fortune_14 = '편한 마음으로 지낼 수 있을 것 같은 하루입니다. 좋아하는 책을 한 번 더 읽어볼까요?';
    let fortune_15 = '피로가 쌓여있지는 않나요? 주변의 시선은 적당히 무시하는 게 좋아요.';
    let fortune_16 = '소중한 물건이 없어질지도 몰라요. 없어진 물건이 없는지 꼭 확인하세요!';
    let fortune_17 = '과제를 미루는 건 좋지 않아요. 할 수 있는 것부터 하나하나 해 볼까요?';
    let fortune_18 = '비싼 가격으로 물건을 구매해서 후회할 수 있어요! 꼭 필요한 물건이었는지 냉정하게 판단해보세요.';
    let fortune_19 = '진정한 친구의 충고를 들을 수 있습니다. 뼈아프더라도 귀담아 들어보세요.';
    let fortune_20 = '타인의 실수에 엄격하게 굴기 쉽습니다. 조그마한 실수는 너그럽게 받아들여 봐요.';
    let fortune_21 = '친구와 호흡이 잘 맞아 효율성이 높아질 것 같아요. 친구의 아이디어를 따라 보세요!';
    let fortune_22 = '기운이 넘치는 하루가 될 것 같네요! 바쁜 스케줄도 완벽하게 해낼 수 있을 것 같아요!';
    let fortune_23 = '모처럼의 기회를 놓쳐버리기 쉽습니다. 목표를 확실히 정해보세요.';
    let fortune_24 = '모든것이 잘 풀리는 하루. 평소보다 화려한 옷차림을 해 보는걸 추천해요!';
    let fortune_25 = '고민하던 일이 해결될 것 같아요! 지금처럼만 하면 칭찬의 목소리가 들려올 겁니다.';
    let fortune_26 = '세심한 행동이 친구와 가까워지는 열쇠가 되어줄 거예요. 상대의 마음을 잘 들여다봐요.';
    let fortune_27 = '평소에 말을 안 하던 친구에게 말을 걸어보세요. 새로운 일의 힌트를 얻을 수 있을 거예요.';
    let fortune_28 = '단점을 지적받아 가라앉을 수 있어요. 나이가 많은 사람에게 상담을 받아보면 해결 방법이 보일 것 같네요.';
    let fortune_29 = '생각지도 못한 실수를 할 것 같아요! 매사에 꼼꼼하게 다시 한 번 살펴보는건 어떨까요?';
    let fortune_30 = '사람이든, 취미든 첫 눈에 푹 빠질 멋진 만남이 기다릴 예감. 친구와 펜팔을 시작해보는 게 도움이 될 것 같아요.';
    let fortune_31 = '오늘은 당신의 날! 맹활약할 수 있습니다. 다소 무리하더라도 끝까지 밀고 나가봐요!';
    let fortune_32 = '재물운이 좋은 날입니다. 원하던 물건이 손에 들어올 것 같아요. 쇼핑을 나가볼까요?';
    let fortune_33 = '무뚝뚝한 얼굴보다는 밝은 얼굴로 웃어 봐요. 오늘 하루도 밝아질 거예요.';
    let fortune_34 = '연하의 사람으로부터 예상외의 제안을 받을 수 있을 것 같아요. 큰 기회가 될 수 있으니 가벼이 넘기지 마세요!';
    let fortune_35 = '소문을 그대로 믿는 것은 위험합니다. 주변 사람에게 물어서 반드시 확인을 거치세요.';
    let fortune_36 = '감정적인 행동에 주의하세요. 친구에게 상처를 주고, 관계를 깨뜨릴 수 있어요.';
    let fortune_37 = '상대에게 너무 많은 것을 주고 있지는 않나요? 무엇보다 중요한 건 자신이에요. 스스로를 사랑해줘요.';
    let fortune_38 = '자신만의 방식을 고집하지 마세요. 오늘은 동갑 친구에게 조언을 구해봅시다.';
    let fortune_39 = '결과가 보이지 않는다면 잠시 쉬는 것도 좋습니다. 산책으로 기분 전환을 해 봐요.';
    let fortune_40 = '눈에 띄는 행동이 화를 불러옵니다. 오늘은 심플한 복장을 추천해요.';
    let fortune_41 = '쇼핑 욕구가 높아지는 날입니다. 무리한 쇼핑으로 후회하게 될 수 있으니 오늘은 얌전히 지내도록!';
    let fortune_42 = '말하지 않으면 몰라요. 직접적으로 마음속 이야기를 해 보세요! 친구와 티타임을 가지는 것도 도움이 됩니다.';
    let fortune_43 = '서로에 대해 더 잘 알 수 있는 기회가 생길 거예요. 고민하지 말고 솔직하게 속마음을 전해보세요. 더욱 가까워질 수 있을 거예요.';
    let fortune_44 = '금전운이 최고예요! 오늘만큼은 마음껏 돈을 사용해도 좋아요. 친구에게 선물을 해보는건 어떨까요?';
    let fortune_45 = '집중력이 떨어지는 하루가 될 수 있어요. 오늘은 쉬어가는 날이 되어도 좋을 것 같네요.';
    let fortune_46 = '추억을 중요하게 생각하세요. 과거의 순간들이 모여 당신을 만들어낸 것이랍니다.';
    let fortune_47 = '어린 사람의 조언도 오늘은 마음에 새겨들어 볼까요? 진정으로 필요한 도움을 얻을 수 있을지 몰라요.';
    let fortune_48 = '문제는 하나씩 차례대로 정리해 나가봐요. 주변에 도움을 청하면 일이 잘 풀립니다.';
    let fortune_49 = '어쩐지 축 처져서 기분 전환이 필요한 하루가 될 것 같아요. 산책을 하거나 식물을 돌보며 힐링해봐요.';
    let fortune_50 = '오늘은 달콤한 음식을 먹어봐요. 친구와 함께 나누면 사이가 가까워질 예감이 듭니다.';
    let fortune_51 = '마음이 잘 맞는 파트너를 만날 수 있습니다. 적극적이고 능동적인 태도로 친구에게 다가가볼까요?';
    let fortune_52 = '지출이 커지지 않도록 주의하세요. 예산을 정하고 쇼핑을 하는 것이 좋아요.';
    let fortune_53 = '충동구매는 위험합니다. 금전적으로 문제가 생길 수 있으니 주의하세요.';
    let fortune_54 = '친구와 다투게 될 지도 몰라요. 냉정을 잃지 않도록 주의합시다.';
    let fortune_55 = '가까운 곳에서 소중한 인연을 발견할 수 있을 것 같아요! 예전부터 알던 사람들 중 한 명이 접근해 올 것 같습니다. 놓치지 마세요.';
    let fortune_56 = '에너지가 넘치는 하루예요. 오늘은 상쾌한 바람을 느낄 수 있는 야외활동을 추천합니다. 스트레스를 날려버리자구요.';
    let fortune_57 = '행복함을 느낄 수 있는 하루. 지금까지 해보지 않은 새로운 활동에 도전해보는 건 어떨까요? 친구의 취미를 함께 즐겨봐요.';
    let fortune_58 = '의욕이 생기는 분야가 있나요? 새로운 공부를 시작하려면 바로 지금인 듯하네요! 도서관에서 멋진 만남이 있을 것 같습니다.';
    let fortune_59 = '친해지고 싶은 친구와 급격히 가까워질 수 있는 날이에요! 꽃 한송이를 선물해보는 건 어떨까요?';
    let fortune_60 = '그동안 원했던 것을 이룰 수 있습니다. 소원은 여기저기 소문내고 다니는 것이 좋아요!';
    let fortune_61 = '어렵다고 생각했던 일도 끝까지 노력해봐요. 분명 좋은 결과로 돌아올 겁니다. 자신감을 가지세요!';
    let fortune_62 = '건강에 신경을 쓰세요. 오늘은 해가 진 후에 산책을 나가볼까요? 숙면에 도움이 될 거예요.';
    let fortune_63 = '방 청소는 잘 하고 있나요? 방을 환기하고 청소하면 새로운 일을 시작하는데 도움이 될 것 같습니다. 친구에게 도움을 요청해보세요.';
    let fortune_64 = '과거의 일에 사로잡혀있는 경향이 있습니다. 신뢰가 가는 친구에게 털어놓는 것도 도움이 될 것 같아요.';
    let fortune_65 = '패션 센스가 빛나는 날. 헤어 스타일을 바꿔볼까요? 친구의 헤어스타일을 참고해보는 것도 좋을 것 같아요.';
    let fortune_66 = '친구에게 상냥하게 행동하면 호감도가 올라갈 것 같아요. 거만하게 굴지 않도록 주의합시다.';
    let fortuneList = [];
    for (let i = 1; i <= 66; i++) {
        fortuneList.push(eval(`fortune_${i}`));
    }
    
    //오리인형 모음
    let duck_1 = 'https://firebasestorage.googleapis.com/v0/b/gratia-2cdd0.appspot.com/o/gratine%2Fbears_1.JPG?alt=media&token=d1844607-6814-4969-95b7-f62a84d9d247'
    let duck_2 = 'https://firebasestorage.googleapis.com/v0/b/gratia-2cdd0.appspot.com/o/gratine%2Fbears_2.JPG?alt=media&token=4942eb5d-6e7b-444f-ba5b-e71e58b70cf2'
    let duck_3 = 'https://firebasestorage.googleapis.com/v0/b/gratia-2cdd0.appspot.com/o/gratine%2Fbears_3.JPG?alt=media&token=f54417dc-4018-4d53-949a-431810186f01'
    let duck_4 = 'https://firebasestorage.googleapis.com/v0/b/gratia-2cdd0.appspot.com/o/gratine%2Fbears_4.JPG?alt=media&token=2640217f-6083-4b81-8314-4c1b6e384f55'
    let duck_5 = 'https://firebasestorage.googleapis.com/v0/b/gratia-2cdd0.appspot.com/o/gratine%2Fbears_5.JPG?alt=media&token=bade5db1-55dd-4b02-ac9f-74fb6247bb54'
    let duck_6 = 'https://firebasestorage.googleapis.com/v0/b/gratia-2cdd0.appspot.com/o/gratine%2Fbears_5.JPG?alt=media&token=bade5db1-55dd-4b02-ac9f-74fb6247bb54'
    let duckList = [duck_1, duck_2, duck_3, duck_4, duck_5, duck_6];
    
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
        while (numbers.length < 6) {
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
        let attachmentUrl_6 = duckList[numbers[5]];

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
                    imgNums_6: true,
                    attachmentUrl_1,
                    attachmentUrl_2,
                    attachmentUrl_3,
                    attachmentUrl_4,
                    attachmentUrl_5,
                    attachmentUrl_6,
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