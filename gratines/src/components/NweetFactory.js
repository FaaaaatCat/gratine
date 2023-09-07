import React, { useEffect, useState } from "react";
import { dbService, storageService } from '../fbase';
import { v4 as uuidv4 } from 'uuid';
import { collection, addDoc, query, orderBy, where, doc, getDocs, updateDoc} from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "@firebase/storage";

const NweetFactory = ({ userObj, fbUserObj}) => {
    const [nweet, setNweet] = useState("");
    const [attachment, setAttachment] = useState("");
    const [tooltip, setTooltip] = useState(false);
    const [usertooltip, setUsertooltip] = useState(false);
    const [textHeight, setTextHeight] = useState(0);
    const [userArray, setUserArray] = useState([]);

    //텍스트 읽는 부분
    const onChange = (e) => {
        setNweet(e.target.value);
        //슬래시 기능
        if (e.target.value[0] === '/') {
            setTooltip(true)
        }
        else {
            setTooltip(false)
        }
        console.log(usertooltip)
    };


    //유저이름 탐지
    const dataList = ["빨간색", "파란색", "노란색", "검정색"];
    const $autoComplete = document.querySelector(".autocomplete");
    let nowIndex = 0;
    const handleKeyUp = (e) => {
        if (nweet == '') {
            setTextHeight(32)
            setUsertooltip(false)
        }
        else {
            //@눌렀을때
            if (nweet.includes('@')) {
                console.log('yo')
                showWholeList();
                setUsertooltip(true)
                // "@" 이전 단어 추출
                const beforeAtMatch = nweet.match(/(\S+)\s*@/);
                const beforeAtWord = beforeAtMatch ? beforeAtMatch[1] : '';
                // "@" 이후 단어 추출
                const afterAtMatch = nweet.match(/@(\S+)/);
                const afterAtWord = afterAtMatch ? afterAtMatch[1] : '';
                if (afterAtMatch && afterAtMatch[1]) {
                    //매치되는 키워드를 입력하면, 매치된 데이터들 datalist에 담기
                    const extractedUserName = afterAtMatch[1];
                    const matchDataList = extractedUserName
                        ? dataList.filter((label) => label.includes(extractedUserName))
                        : [];
                    //필요부분 잘라내기
                    const indexOfExtractedWord = nweet.indexOf("@" + extractedUserName);
                    let remainingPart = nweet;
                    if (indexOfExtractedWord !== -1) {
                        remainingPart = nweet.substring(0, indexOfExtractedWord) + " ";
                    }
                    switch (e.keyCode) {
                        // UP KEY
                        case 38:
                            nowIndex = Math.max(nowIndex - 1, 0);
                            break;

                        // DOWN KEY
                        case 40:
                            nowIndex = Math.min(nowIndex + 1, matchDataList.length - 1);
                            break;

                        // ENTER KEY
                        case 13:
                            const replaceText = `<span style="color: red;">${matchDataList[nowIndex]}</span>`;
                            //여기에 리플레이텍스트 넣으려다 실패함
                            //1. textarea 대신 <div contentEditable="true"> 써보기
                            //2. 그냥 @ 치면 showWholeList가 뜨지않음
                            //3. @뒤에 ? 치면 오류남
                            setNweet(remainingPart + matchDataList[nowIndex])
                            // 초기화
                            setUsertooltip(false)
                            nowIndex = 0;
                            matchDataList.length = 0;
                            break;
                        // 그외 다시 초기화
                        default:
                            nowIndex = 0;
                            break;
                    }
                    showList(matchDataList, extractedUserName, nowIndex);
                }
                //매치되지 않는 키워드를 입력하면
                else {
                    setUsertooltip(false)
                }
            }
            
            else {
                setUsertooltip(false)
            }
        }
    };

    // dataArray의 각 아이템을 검색하고 스타일을 적용
    const decoUserTag = () => {
        dataList.forEach(item => {
            const searchRegExp = new RegExp(item, 'g');
            const replaceText = `<span style="color: red;">${item}</span>`;
            nweet = nweet.replace(searchRegExp, replaceText);
        })
    }

    const showWholeList = () => {
        const regex = new RegExp(`(${dataList})`, "g");
        $autoComplete.innerHTML = dataList.map(
        (label, index) => `
            <div>
                ${label.replace(regex, "<mark>$1</mark>")}
            </div>
        `).join("");
    }
    const showList = (matchDataList, extractedUserName, nowIndex) => {
        const regex = new RegExp(`(${extractedUserName})`, "g");
        $autoComplete.innerHTML = matchDataList
        .map(
        (label, index) => `
        <div class='${nowIndex === index ? "active" : ""}'>
            ${label.replace(regex, "<mark>$1</mark>")}
        </div>
        `
        )
        .join("");
    };


    //유저 이름들 읽는 부분
    useEffect(() => {
        // const q = query(
        //   collection(dbService, "user")
        // );
        // const querySnapshot = await getDocs(q);
        // setUserArray(querySnapshot.docs)
    }, []);

    //전송
    const onSubmit = async (e) => {
        e.preventDefault();

        //특수 명령어 입력기능
        let orderWhat = '';
        let orderText = '';
        let orderList = ['/전체','/주사위','/전투','/소지금추가']
        if (nweet[0] === '/') {
            orderWhat = nweet.split(" ")[0];
            if (orderList.includes(orderWhat)) {
                orderText = nweet.substr(orderWhat.length + 1);
            }
        }
        //유저 찾기 기능
        // const regex = /@([^ ]+)/;
        // const match = nweet.match(regex);
        // if (match && match[1]) {
        //     const extractedText = match[1]; // 'user' 부분 추출
        //     console.log(extractedText); // 출력: 'user'
        // } else {
        //     console.log('매치되는 부분이 없습니다.');
        // }


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

        //소지금추가 기능
        // if (orderWhat === '/소지금추가') {
            
        // }

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
                else if (orderText == '선택') {
                    const rollDice = Math.ceil(Math.random() * (2 - 0) + 0)
                    if (rollDice === 1) {
                        diceNum = 'YES'
                    }
                    else {
                        diceNum = 'NO'
                    }
                }
            }
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


    //엔터 & shift+엔터
    const onKeyDown = (e) => {
        if (nweet == '') {
            setTextHeight(32)
        }
        if (e.keyCode == 13) {
            e.preventDefault();
            if (usertooltip) {
                return;
            }
            if (e.shiftKey) {
                const text = nweet;
                const lines = text.split('\n').length;
                const selectionStart = e.target.selectionStart;
                const selectionEnd = e.target.selectionEnd;
                const newText = text.substring(0, selectionStart) + '\n' + text.substring(selectionEnd);
                setNweet(newText)
                setTextHeight(32 + lines * 15)

                // 줄 바꾸기 이후 커서 위치 조정
                const newCursorPos = selectionStart + 1;
                e.target.selectionStart = newCursorPos;
                e.target.selectionEnd = newCursorPos;
            }
            else {
                onSubmit(e);
                setTooltip(false)
                setTextHeight(32)
            }
        }
    }

    return (
        <>
            {attachment &&
                <div className="img-thumb-area">
                    <img src={attachment} />
                    <button onClick={onClearAttachment}>이미지 삭제</button>
                </div>
            }
            <form onSubmit={onSubmit}>
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
                            <div className="function-list">
                                <b>/주사위 선택</b>
                                <p>주사위굴리기 (Yes or No)</p>
                            </div>
                        </div>
                        <div className="function-list-container">
                            <div className="title"><span className="material-icons-round">info_outline</span>관리자 명령어</div>
                            <div className="function-list">
                                <b>/전체</b>
                                <p>전체 말하기</p>
                            </div>
                            {/* <div className="function-list">
                                <b>/소지금추가 @전체 $100</b>
                                <p>입력한 금액($100)을 전체에 추가</p>
                            </div>
                            <div className="function-list">
                                <b>/소지금추가 @유저이름 $100</b>
                                <p>입력한 금액($100)을 @유저에 추가</p>
                            </div> */}
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
                    onKeyUp={handleKeyUp}
                    onKeyDown={onKeyDown}
                    placeholder=""
                    style={{height: textHeight + 'px'}}
                    // maxLength={120} //글자제한
                />
                <div class={"autocomplete " + (usertooltip ? "" : "d-none")}></div>
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
                >
                    전송
                    <span className="material-icons-round">send</span>
                </button>
            </form>
        </>
    )
}
export default NweetFactory;