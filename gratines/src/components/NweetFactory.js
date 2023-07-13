import React, { useEffect, useState } from "react";
import { dbService, storageService } from '../fbase';
import { v4 as uuidv4 } from 'uuid';
import { collection, addDoc, query, orderBy, doc, getDocs} from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "@firebase/storage";


const NweetFactory = ( {userObj} ) => {
    const [nweet, setNweet] = useState("");
    const [attachment, setAttachment] = useState("");
    const [totalAttend, setTotalAttend] = useState();

    const onSubmit = async (e) => {
        e.preventDefault();
        var jsonUser = JSON.parse(localStorage.getItem("gratineUser"));
        var jsonGame = JSON.parse(localStorage.getItem("gratineGame"));


        //특수 명령어 입력기능
        let orderWhat = '';
        let orderText = '';
        let orderList = ['/전체','/출석','/주사위']
        if (nweet[0] === '/') {
            orderWhat = nweet.split(" ")[0];
            if (orderList.includes(orderWhat)) {
                orderText = nweet.substr(orderWhat.length);
            }
        }
        //채팅 쓴 날짜 기능
        let todayOrigin = new Date();
        let today = todayOrigin.toLocaleString();


        //주사위, 출석 기능
        let diceNum = 0;
        let attendNum = 0;
        let totalAttend = 0;
        let newAttendPrice = 0;

        if (orderWhat !== '' && orderText !=='') {
            //전체 말하기 기능
            if (orderWhat === '/전체') {
            }
            //주사위 기능
            else if (orderWhat === '/주사위') {
                if (orderText == ' 10') {
                    diceNum = Math.ceil(Math.random() * (10 - 1) + 1)
                }
                else if (orderText == ' 50') {
                    diceNum = Math.ceil(Math.random() * (50 - 1) + 1)
                }
                else if (orderText == ' 100') {
                    diceNum = Math.ceil(Math.random() * (100 - 1) + 1)
                }
            }
            //출석 기능
            else if (orderWhat === '/출석') {
                //1. 출석점수 받아오기
                const q = query(
                    collection(dbService, "game"),
                    orderBy("createdDate", "desc")
                );
                const querySnapshot = await getDocs(q);
                const lastGameData = querySnapshot._snapshot.docChanges[0].doc.data.value.mapValue.fields;

                //2. 기존 점수에 새 점수 더하기
                //출석점수가 비어있다면(초기)
                if (lastGameData.attendNum.integerValue === '0') {
                    console.log('출석처음해')
                    attendNum = Math.ceil(Math.random() * (10 - 1) + 1)
                    newAttendPrice += attendNum;
                }
                //출석점수가 있다면(사용중)
                else {
                    console.log('출석계속해')
                    attendNum = Math.ceil(Math.random() * (10 - 1) + 1)
                    totalAttend = Number(lastGameData.totalAttend.integerValue);
                    newAttendPrice = totalAttend + attendNum;
                }
            
                //3. 새 점수 저장하기
                const gameObj = {
                    attendNum: attendNum,
                    totalAttend: newAttendPrice,
                    creatorName: jsonUser.displayName,
                    createdDate: today,
                }
                await addDoc(collection(dbService, "game"), gameObj);
                console.log('저장한닷')
            }
        }
        
        //이미지 첨부하지 않고 텍스트만 올리고 싶을 때도 있기 때문에 attachment가 있을때만 아래 코드 실행
        //이미지 첨부하지 않은 경우엔 attachmentUrl=""이 된다.
        let attachmentUrl = "";
        if (attachment !== "") {
            //랜덤 uuid 생성하여 파일 경로 참조 만들기
            const attachmentRef = ref(storageService, `${jsonUser.uid}/${uuidv4()}`);
            //storage 참조 경로로 파일 업로드 하기 (data_url 은 포맷임)
            const response = await uploadString(attachmentRef, attachment, "data_url");
            //storage 참조 경로에 있는 파일의 URL을 다운로드해서 attachmentUrl 변수에 넣어서 업데이트
            attachmentUrl = await getDownloadURL(response.ref);
        }


        //////////////////////////////////////////////////////////////////////////////////////////////
        //트윗 오브젝트 저장
        const nweetObj = {
            text: nweet,
            createdAt: Date.now(),
            createdDate: today,
            creatorId: jsonUser.uid,
            attachmentUrl,
            creatorName: jsonUser.displayName,
            creatorImg: jsonUser.photoURL,
            orderWhat: orderWhat,
            orderText: orderText,
            diceNum: diceNum,
            attendNum: attendNum,
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
    const onChange = (e) => {
        setNweet(e.target.value);
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