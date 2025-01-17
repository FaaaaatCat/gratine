import React, { useEffect, useState, useRef } from "react";
import { dbService, storageService } from '../fbase';
import { v4 as uuidv4 } from 'uuid';
import { collection, addDoc, query, writeBatch , where, doc, getDocs, updateDoc} from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "@firebase/storage";

const NweetFactory = ({ userObj, fbUserObj, loginUsers, refreshUser}) => {
    const [nweet, setNweet] = useState("");
    const [attachment, setAttachment] = useState("");
    const [tooltip, setTooltip] = useState(false);
    const [textHeight, setTextHeight] = useState(0);
    const [autoCompleteList, setAutoCompleteList] = useState([]);
    const [selectedItemIndex, setSelectedItemIndex] = useState(0);
    const [hideText, setHideText] = useState(false);
    const usertooltip = autoCompleteList.length > 0; //autoComplete가 켜져있다면 true


    //input에 자동포커싱하는 기능
    const inputRef = useRef(null);
    useEffect(() => {
        inputRef.current.focus();
    }, [hideText]);

    //유저 이름들 읽는 부분
    const dataList = loginUsers.map(item => item.displayName);

    //텍스트 읽는 부분
    const onChange = (e) => {
        //nweet에 현재 텍스트 추가 기능
        const inputValue = e.target.value;
        setNweet(inputValue);

        //"/" 슬래시 기능
        if (inputValue[0] === '/') {
            setTooltip(true)
        }
        else {
            setTooltip(false)
        }

        //"@" 유저태그 기능
        const atIndex = inputValue.lastIndexOf('@');
        if (atIndex !== -1) {
            const searchTerm = inputValue.substring(atIndex + 1).toLowerCase();
            // 1. "@" 다음 문자와 dataList의 아이템을 비교하여 매치되는 아이템 추가
            if (searchTerm) {
                const matchedItems = dataList.filter((item) =>
                    item.toLowerCase().includes(searchTerm)
                );
                setAutoCompleteList(matchedItems);
            }
            // 2. "@"만 있는 경우
            else {
                setAutoCompleteList(dataList);
                setSelectedItemIndex(0);
            }
        }
        // "@" 없는 경우
        else {
            setAutoCompleteList([]);
        }
    };
    
    //Enter관련 기능 (그냥 Enter, Shift+Enter, @+Enter)
    const enterKeyWork = (e) => {
        if (e.key !== "Enter") return;
        if (usertooltip) {
            //1. @ + Enter
            if (selectedItemIndex >= 0) {
                //필요부분 잘라내기
                const afterAt = nweet.split('@')[1] || '';
                const beforeAt = nweet.split('@')[0] || '';
                const indexOfExtractedWord = nweet.indexOf("@" + afterAt);
                let remainingPart = nweet;
                if (indexOfExtractedWord !== -1) {
                    remainingPart = nweet.substring(0, indexOfExtractedWord);
                }
                // 선택된 아이템을 입력란에 채우기
                setNweet(remainingPart + '@' + autoCompleteList[selectedItemIndex]);
                // 자동 완성 목록 초기화
                setAutoCompleteList([]);
                e.preventDefault(); // Enter 키 기본 동작 방지
            }
        }
        else {
            //2. Shift + Enter
            if (e.nativeEvent.isComposing) return;
            if (e.key === 'Enter' && e.shiftKey) {
                const lines = nweet.split('\n').length;
                setTextHeight(32 + lines * 15)
                return;
            }
            //3. 그냥 Enter
            else if (e.key === 'Enter') {
                doRealEnter(e)
                // setTextHeight(32)
                // setTooltip(false)
                // setNweet('');
                // onSubmit(e);
                // let blackNweet = nweet.trim();
                // if (e.target.value == '' || blackNweet == '') {
                //     setHideText(false)
                // }
                // else {
                //     setHideText(true)
                //     setTimeout(function () {
                //         setHideText(false)
                //     }, 500);
                // }
            }
        }
    }
    const doRealEnter = (e) => {
        setTextHeight(32)
        setTooltip(false)
        setNweet('');
        onSubmit(e);
        let blackNweet = nweet.trim();
        if (e.target.value == '' || blackNweet == '') {
            setHideText(false)
        }
        else {
            setHideText(true)
            setTimeout(function () {
                setHideText(false)
            }, 500);
        }
    }

    //키보드 위아래로 유저 셀렉트 하는 함수
    const handleKeyDown = (e) => {
        if (autoCompleteList.length === 0) {
            return;
        }
        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                setSelectedItemIndex((prevIndex) =>
                prevIndex > 0 ? prevIndex - 1 : autoCompleteList.length - 1
                );
                break;
            case 'ArrowDown':
                e.preventDefault();
                setSelectedItemIndex((prevIndex) =>
                prevIndex < autoCompleteList.length - 1 ? prevIndex + 1 : 0
                );
                break;
            // case 'Enter':
            //     if (selectedItemIndex >= 0) {
            //         // 선택된 아이템을 입력란에 채우기
            //         setNweet(nweet + autoCompleteList[selectedItemIndex]);
            //         // 자동 완성 목록 초기화
            //         setAutoCompleteList([]);
            //         e.preventDefault(); // Enter 키 기본 동작 방지
            //     }
            //     break;
            default:
                break;
        }
    };

    // 입력값이 변경될 때 selectedItemIndex 초기화
    useEffect(() => {
        setSelectedItemIndex(0);
    }, [nweet]);

    // 입력한 단어를 하이라이트로 표시하는 함수
    const highlightMatch = (text, searchTerm) => {
        if (!searchTerm) {
            return text;
        }
        else{
            const escapedUserName = searchTerm.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'); // 이스케이프 처리
            const parts = text.split(new RegExp(`(${escapedUserName})`, 'gi'));
            return (
            <span>
                {parts.map((part, index) =>
                part.toLowerCase() === searchTerm.toLowerCase() ? (
                    <mark key={index}>{part}</mark>
                ) : (
                    part
                )
                )}
            </span>
            );    
        }
    };


    ///////////////////////////////////////////////////////////////////////
    //전송
    const onSubmit = async (e) => {
        e.preventDefault();

        //특수 명령어 입력기능
        let orderWhat = '';
        let orderText = '';
        let orderList = ['/전체','/주사위','/공격','/치유']
        if (nweet[0] === '/') {
            orderWhat = nweet.split(" ")[0];
            if (orderList.includes(orderWhat)) {
                orderText = nweet.substr(orderWhat.length + 1);
            }
        }

        //채팅 쓴 날짜 기능
        let todayfull = new Date().toLocaleString();

        //전체 말하기 기능
        let blankOrder = orderText.trim();
        if (orderWhat === '/전체' && orderText === '') {
            setNweet("");
            return;
        }
        if (orderWhat === '/전체' && blankOrder === '') {
            setNweet("");
            return;
        }

        //주사위 기능
        let diceNum = 0;
        if (orderWhat !== '' && orderText !=='') {
            //주사위 기능
            if (orderWhat === '/주사위') {
                if (orderText == '10') {
                    diceNum = Math.ceil(Math.random() * (10 - 1) + 1)
                }
                else if (orderText == '50') {
                    diceNum = Math.ceil(Math.random() * (50 - 1) + 1)
                }
                else if (orderText == '100') {
                    diceNum = Math.ceil(Math.random() * (100 - 1) + 1)
                }
                // else if (orderText == '선택') {
                //     const rollDice = Math.ceil(Math.random() * (2 - 0) + 0)
                //     if (rollDice === 1) {
                //         diceNum = 'YES'
                //     }
                //     else {
                //         diceNum = 'NO'
                //     }
                // }
            }
        }

        //공격, 치유 기능
        const extractedData = orderText.replace('@', '');
        if (dataList.includes(extractedData)) {
            orderText = extractedData;
            if (orderWhat === '/공격') {
                diceNum = Math.ceil(Math.random() * (40 - 1) + 1);
                minusHp({ extractedData, diceNum });
            }
            else if (orderWhat === '/치유') {
                diceNum = Math.ceil(Math.random() * (50 - 1) + 1);
                plusHp({ extractedData, diceNum });
            }
        }

        //체력리셋 기능
        if (orderWhat === '/체력리셋') {
            resetHp();
        }
        
        
        //이미지 첨부하지 않고 텍스트만 올리고 싶을 때도 있기 때문에 attachment가 있을때만 아래 코드 실행
        //이미지 첨부하지 않은 경우엔 attachmentUrl=""이 된다.
        let attachmentUrl = "";
        if (attachment !== "") {
            //랜덤 uuid 생성하여 파일 경로 참조 만들기
            const attachmentRef = ref(storageService, `${userObj.uid}/${uuidv4()}`);
            //storage 참조 경로로 파일 업로드 하기 (data_url 은 포맷임)
            const response = await uploadString(attachmentRef, attachment, "data_url");
            //storage 참조 경로에 있는 파일의 URL을 다운로드해서 attachmentUrl 변수에 넣어서 업데이트
            attachmentUrl = await getDownloadURL(response.ref);
        }
        else {
            //이미지도 글자도 없을땐 무시한다.
            let blackNweet = nweet.trim();
            if (nweet == '' && attachment == "") {
                setNweet("");
                return;
            }
            if (blackNweet == '' || nweet == null) {
                setNweet("");
                return;
            }
        }

        //////////////////////////////////////////////////////////////////////////////////////////////
        //트윗 오브젝트 저장
        const nweetObj = {
            text: nweet,
            createdAt: Date.now(),
            createdDate: todayfull,
            creatorId: userObj.uid,
            attachmentUrl,
            creatorName: fbUserObj.displayName,
            creatorImg: fbUserObj.photoURL,
            orderWhat: orderWhat,
            orderText: orderText,
            diceNum: diceNum,
            hp: fbUserObj.hp,
            //nweets에 새로운 데이터를 넣고싶으면 이곳에 추가하기.
            //그리고 파이어베이스 가서 데이터(pre-made query) 추가하기.
            //우리가 이 쿼리를 사용할거라고 데이터베이스에게 알려줘야 함.
        };


        //addDoc은 문서를 추가하는 함수. nweetObj의 항목을 nweets의 데이터베이스에 저장함.
        await addDoc(collection(dbService, "nweets"), nweetObj);

        //state 비워서 form 비우기
        setNweet("");
        //파일 미리보기 img src 비워주기
        setAttachment("");
        refreshUser();
        setHideText(false);
        inputRef.current.focus();
    };

    //사진파일 추가
    const onFileChange = (e) => {
        const theFile = e.target.files[0]; //name, size, type, 등등 파일의 정보
        const reader = new FileReader();
        reader.onloadend = (finishedEvent) => {
            setAttachment(finishedEvent.target.result)
        }
        reader.readAsDataURL(theFile);
    }
    //사진파일 업로드 전 지우기
    const onClearAttachment = () => setAttachment("")


    //공격을 감지해서 hp를 깎는 기능
    const minusHp = async({extractedData, diceNum}) => {
        const q = query(
            collection(dbService, "user"),
            where("displayName", "==", extractedData)
        );
        const querySnapshot = await getDocs(q);
        const UserData_Id = querySnapshot.docs[0].id;
        const UserHp = querySnapshot.docs[0]._document.data.value.mapValue.fields.hp.integerValue;
        const UserRef = doc(dbService, "user", UserData_Id);
        let newHp = Number(UserHp) - diceNum
        if (newHp < 0) {
            newHp = 0;
        }
        await updateDoc(UserRef, {
            hp: newHp
        })
    }
    //치유를 감지해서 hp를 더하는 기능
    const plusHp = async({extractedData, diceNum}) => {
        const q = query(
            collection(dbService, "user"),
            where("displayName", "==", extractedData)
        );
        const querySnapshot = await getDocs(q);
        const UserData_Id = querySnapshot.docs[0].id;
        const UserHp = querySnapshot.docs[0]._document.data.value.mapValue.fields.hp.integerValue;
        const UserRef = doc(dbService, "user", UserData_Id);
        let newHp = Number(UserHp) + diceNum
        if (newHp > 100) {
            newHp = 100;
        }
        await updateDoc(UserRef, { 
            hp: newHp
        })
    }

    //체력리셋을 감지해서 hp를 100으로 만드는 기능
    const batch = writeBatch(dbService);
    const resetHp = async () => {
        const q = query(
            collection(dbService, "user")
        );
        const querySnapshot = await getDocs(q);
        const wholeUserIdArray = querySnapshot.docs.map(item => item.id);
        for (let i = 0; i < wholeUserIdArray.length; i++){
            const hpRef = doc(dbService, "user", wholeUserIdArray[i]);
            batch.update(hpRef, { "hp": 100 });
        }
        await batch.commit();
    }


    return (
        <>
            {attachment &&
                <div className="img-thumb-area">
                    <img src={attachment} />
                    <button onClick={onClearAttachment}>이미지 삭제</button>
                </div>
            }
            {/* <form onSubmit={onSubmit} className={(hideText ? '' : '')}> */}
            <form onSubmit={onSubmit} className={(hideText ? 'loadingChat' : '')}>
                {tooltip &&
                    <div className="tooltip">
                        <div className="function-list-container">
                            <div className="title"><span className="material-icons-round">info_outline</span> 기본 명령어</div>
                            
                            <div className="function-list">
                                <b>/주사위 10</b>
                                <p>주사위굴리기 (1~10사이)</p>
                            </div>
                            <div className="function-list">
                                <b>/주사위 50</b>
                                <p>주사위굴리기 (1~50사이)</p>
                            </div>
                            <div className="function-list">
                                <b>/주사위 100</b>
                                <p>주사위굴리기 (1~100사이)</p>
                            </div>
                            {/* <div className="function-list">
                                <b>/주사위 선택</b>
                                <p>주사위굴리기 (Yes or No)</p>
                            </div> */}
                            <div className="function-list">
                                <b>/공격 @유저이름</b>
                                <p>@유저에게 1~40사이 대미지 부과</p>
                            </div>
                            <div className="function-list">
                                <b>/치유 @유저이름</b>
                                <p>@유저에게 1~50사이 체력 회복</p>
                            </div>
                        </div>
                        <div className="function-list-container">
                            <div className="title"><span className="material-icons-round">info_outline</span>관리자 명령어</div>
                            <div className="function-list">
                                <b>/전체</b>
                                <p>전체 말하기</p>
                            </div>
                            <div className="function-list">
                                <b>/체력리셋</b>
                                <p>모두의 체력을 100으로</p>
                            </div>
                            <p className="warning">* 러너는 '관리자 명령어' 사용을 금지합니다. *</p>
                        </div>
                    </div>
                }
                <textarea
                    className="chatting-textarea"
                    id="search"
                    autoComplete="off"
                    role="textarea"
                    title="Text Chat Input"
                    value={nweet}
                    onChange={onChange}
                    onKeyDown={(e) => {
                        handleKeyDown(e);
                        enterKeyWork(e);
                    }}
                    placeholder=""
                    style={{ height: textHeight + 'px' }}
                    ref={inputRef}
                    // maxLength={120} //글자제한
                />
                {usertooltip &&
                    <ul className="autoComplete">
                        {autoCompleteList.map((item, index) => (
                        <li
                            key={item}
                            className={index === selectedItemIndex ? 'selected' : ''}
                        >
                            {highlightMatch(item, nweet.split('@')[1])}
                        </li>
                        ))}
                    </ul>
                }
                <label htmlFor="file">
                    <div className="picture-upload-btn">
                        <span className="material-icons-round">image</span>
                        이미지 파일
                    </div>
                </label>
                <input
                    type="file"
                    name="file"
                    id="file"
                    accept="image/*"
                    onChange = {onFileChange}
                />
                <button
                    className="gtn-btn"
                    type="submit"
                    value="전송"
                    onClick={doRealEnter}
                >
                    전송
                    <span className="material-icons-round">send</span>
                </button>
            </form>
        </>
    )
}
export default NweetFactory;