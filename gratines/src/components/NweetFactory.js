import React, { useEffect, useState } from "react";
import { dbService, storageService } from '../fbase';
import { v4 as uuidv4 } from 'uuid';
import { collection, addDoc} from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "@firebase/storage";


const NweetFactory = ( {userObj} ) => {
    const [nweet, setNweet] = useState("");
    const [attachment, setAttachment] = useState("");
    const onSubmit = async (e) => {
        e.preventDefault();

        //이미지 첨부하지 않고 텍스트만 올리고 싶을 때도 있기 때문에 attachment가 있을때만 아래 코드 실행
        //이미지 첨부하지 않은 경우엔 attachmentUrl=""이 된다.
        let attachmentUrl = "";
        if (attachment !== "") {
            //랜덤 uuid 생성하여 파일 경로 참조 만들기
            const attachmentRef = ref(storageService, `${userObj.uid}/${uuidv4()}`);
            //storage 참조 경로로 파일 업로드 하기
            const response = await uploadString(attachmentRef, attachment, "data_url");
            //storage 참조 경로에 있는 파일의 URL을 다운로드해서 attachmentUrl 변수에 넣어서 업데이트
            attachmentUrl = await getDownloadURL(response.ref);
        }
        //트윗 오브젝트
        const nweetObj = {
            text: nweet,
            createdAt: Date.now(),
            creatorId: userObj.uid,
            attachmentUrl,
            //nweets에 새로운 데이터를 넣고싶으면 이곳에 추가하기.
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
    const onFileChange = (event) => {
        // console.log(event.target.files)
        const {
            target: { files },
        } = event;
        const theFile = files[0]; //name, size, type, 등등 파일의 정보
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
                    class="chatting-textarea"
                    contenteditable="true"
                    role="textarea"
                    title="Text Chat Input"
                    autocomplete="off"
                    value={nweet}
                    onChange={onChange}
                    onKeyDown={handleKeyPress}
                    placeholder=""
                />
                {/* <input
                    className="chatting-txt-input"
                    value={nweet}
                    onChange={onChange}
                    type="text"
                    placeholder="What's on your mind?"
                    // maxLength={120} //글자제한
                /> */}
                {/* <input
                    className="chatting-picture-input"
                    type="file"
                    accept="image/*"
                    onChange = {onFileChange}
                /> */}
                <label for="file">
                    <div class="picture-upload-btn">
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
                    className="btn-on-input"
                    type="submit"
                    value="전송"
                />
            </form>
        </>
        
    )
}
export default NweetFactory;