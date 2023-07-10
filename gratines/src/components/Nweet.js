import { dbService, storageService } from "fbase";
import { deleteObject, ref } from "@firebase/storage";
import { doc, deleteDoc, updateDoc, collection, getDocs, query, } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import React, { useEffect, useState } from "react";

const Nweet = ({ nweetObj, isOwner, userObj, refreshUser, isOrder, orderWhat, orderText }) => {
    const NweetTextRef = doc(dbService, "nweets", `${nweetObj.id}`); //nweetObj.id 는 쓴 트윗의 고유 id임. userObj.id와 다름.
    const NweetImgRef = ref(storageService, nweetObj.attachmentUrl); //nweetObj.attachmentUrl의 레퍼런스를 얻음
    //console.log(nweetObj.id) //쓴 데이터 갯수만큼 실행 됨 그래서 모든 트윗의 id를 보여줌.

    const [editing, setEditing] = useState(false);
    const [newNweet, setNewNweet] = useState(nweetObj.text);

    //전체 공지 지우기
    const onDeleteClick = async () => {
        const ok = window.confirm("공지를 진짜 삭제할래요?");
        if (ok) {
            //await dbService.doc(`nweets/${nweetObj.id}`).delete();
            await deleteDoc(NweetTextRef);
            //await deleteObject(NweetImgRef);
            if (nweetObj.attachmentUrl !== "") {
                await deleteObject(NweetImgRef);
            }
        }
    }

    ///////////////////////////////////////////////////////////////////////////////
    //ect. 편집하기
    const toggleEditing = () => setEditing((prev) => !prev);
    const onSubmit = async (event) => {
        event.preventDefault();
        await updateDoc(NweetTextRef, {
            text: newNweet,
        });
        setEditing(false);
    }
    const onChange = (e) => {
        setNewNweet(e.target.value);
    };

    return (
        <>
            <div className={'chatting-list ' + (isOwner? 'myChat ':'') + (isOrder? 'wholeChat ':'')}>
                <div className="profile-box">
                    <img src={nweetObj.creatorImg} />
                </div>
                <div className="txt-box">
                    <b>{nweetObj.creatorName}</b>
                    {isOrder ?
                        <>
                            <p>{nweetObj.orderWhat}</p>
                            {isOwner && <button onClick={onDeleteClick}><span className="material-icons-round">close</span></button>}
                        </> : <>
                            <p>{nweetObj.text}</p>
                        </>}
                    {nweetObj.attachmentUrl && <img src={nweetObj.attachmentUrl} />}
                </div>
            </div>
        </>
    )
}

export default Nweet;