import React, { useEffect, useState } from "react";
import { dbService, storageService } from '../fbase';
import { v4 as uuidv4 } from 'uuid';
import { collection, addDoc, query, orderBy, where, doc, getDocs, updateDoc} from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "@firebase/storage";
import moment from "moment";

const NweetFactory = ({ userObj, fbUserObj, gameObj }) => {
    const UserGameRef = doc(dbService, "userGame", `${gameObj?.id}`);
    const [nweet, setNweet] = useState("");
    const [attachment, setAttachment] = useState("");
    const [tooltip, setTooltip] = useState(false);

    //텍스트 읽는 부분
    const onChange = (e) => {
        setNweet(e.target.value);
        if (e.target.value[0] === '/') {
            setTooltip(true)
        }
        else {
            setTooltip(false)
        }
    };

    //전송
    const onSubmit = async (e) => {
        e.preventDefault();

        //특수 명령어 입력기능
        let orderWhat = '';
        let orderText = '';
        let orderList = ['/전체','/주사위', '/칵테일', '/인형']
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
            }
        }
        //칵테일 기능
        let selectedCock = '';
        if (orderWhat === '/칵테일') {
            let cockList = ['칵1', '칵2', '칵3', '칵4', '칵5', '칵6', '칵7', '칵8', '칵9', '칵10']
            var random_index_1 = Math.floor(Math.random() * cockList.length);
            var random_index_2 = Math.floor(Math.random() * cockList.length);
            var random_index_3 = Math.floor(Math.random() * cockList.length);
            var random_index_4 = Math.floor(Math.random() * cockList.length);
            var random_cock_1 = cockList[random_index_1];
            var random_cock_2 = cockList[random_index_2];
            var random_cock_3 = cockList[random_index_3];
            var random_cock_4 = cockList[random_index_4];
            let selectedCockArr = [random_cock_1, random_cock_2, random_cock_3, random_cock_4]
            selectedCock = selectedCockArr.join(' ,');
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

        //인형 기능
        let random_bear = '';
        if (orderWhat === '/인형') {
            let bear_1 = 'https://firebasestorage.googleapis.com/v0/b/gratia-2cdd0.appspot.com/o/gratine%2Fbears_1.JPG?alt=media&token=d1844607-6814-4969-95b7-f62a84d9d247'
            let bear_2 = 'https://firebasestorage.googleapis.com/v0/b/gratia-2cdd0.appspot.com/o/gratine%2Fbears_2.JPG?alt=media&token=4942eb5d-6e7b-444f-ba5b-e71e58b70cf2'
            let bear_3 = 'https://firebasestorage.googleapis.com/v0/b/gratia-2cdd0.appspot.com/o/gratine%2Fbears_3.JPG?alt=media&token=f54417dc-4018-4d53-949a-431810186f01'
            let bear_4 = 'https://firebasestorage.googleapis.com/v0/b/gratia-2cdd0.appspot.com/o/gratine%2Fbears_4.JPG?alt=media&token=2640217f-6083-4b81-8314-4c1b6e384f55'
            let bear_5 = 'https://firebasestorage.googleapis.com/v0/b/gratia-2cdd0.appspot.com/o/gratine%2Fbears_5.JPG?alt=media&token=bade5db1-55dd-4b02-ac9f-74fb6247bb54'
            let bearList = [bear_1, bear_2, bear_3, bear_4, bear_5];
            var random_index = Math.floor(Math.random() * bearList.length);
            random_bear = bearList[random_index]
            attachmentUrl = random_bear;
        }

        let blackNweet = nweet.trim();
        //이미지도 글자도 없을땐 무시한다.
        if (nweet == '' && attachment == "") {
            setNweet("");
            return;
        }
        if (blackNweet == '' || nweet == null) {
            setNweet("");
            return;
        }

        //////////////////////////////////////////////////////////////////////////////////////////////
        //트윗 오브젝트 저장
        const nweetObj = {
            text: nweet,
            createdAt: Date.now(),
            createdDate: todayfull,
            creatorId: userObj.uid,
            attachmentUrl,
            creatorName: userObj.displayName,
            creatorImg: userObj.photoURL,
            orderWhat: orderWhat,
            orderText: orderText,
            diceNum: diceNum,
            selectedCock: selectedCock,
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

    //엔터눌러서 채팅치기
    const handleKeyPress = (e) => {
        if(e.keyCode === 13){
            onSubmit(e);
            setTooltip(false)
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
                                <b>/전체 메세지</b>
                                <p>전체 말하기</p>
                            </div>
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
                                <p>주사위굴리기 (Yes or No)</p>
                                <b>/주사위 선택</b>
                            </div> */}
                        </div>
                        <div className="function-list-container">
                            <div className="title"><span className="material-icons-round">info_outline</span>특수 명령어</div>
                            <div className="function-list">
                                <b>/칵테일</b>
                                <p>칵테일 제조</p>
                            </div>
                            <div className="function-list">
                                <b>/인형</b>
                                <p>랜덤 인형 뽑기</p>
                            </div>
                        </div>
                    </div>
                }
                <textarea
                    className="chatting-textarea"
                    role="textarea"
                    title="Text Chat Input"
                    autoComplete="off"
                    value={nweet}
                    onChange={onChange}
                    onKeyDown={handleKeyPress}
                    placeholder=""
                    // maxLength={120} //글자제한
                />
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
                <input
                    className="gtn-btn"
                    type="submit"
                    value="전송"
                />
            </form>
        </>
    )
}
export default NweetFactory;