import { dbService, storageService } from "fbase";
import { deleteObject, ref } from "@firebase/storage";
import { doc, deleteDoc, updateDoc, collection, getDocs, query, } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import React, { useEffect, useState } from "react";

const Nweet = ({ nweetObj, isOwner, userObj, refreshUser }) => {
    const NweetTextRef = doc(dbService, "nweets", `${nweetObj.id}`); //nweetObj.id 는 쓴 트윗의 고유 id임. userObj.id와 다름.
    const NweetImgRef = ref(storageService, nweetObj.attachmentUrl); //nweetObj.attachmentUrl의 레퍼런스를 얻음
    //console.log(nweetObj.id) //쓴 데이터 갯수만큼 실행 됨 그래서 모든 트윗의 id를 보여줌.

    const [editing, setEditing] = useState(false);
    const [newNweet, setNewNweet] = useState(nweetObj.text);

    // const getUserName = async () => {
    //     const userName = userObj.displayName;
    //     setUserName(userName);
    // };
    // useEffect(() => {
    //     getUserName();
    // },[])

    //지우기
    const onDeleteClick = async () => {
        const ok = window.confirm("진짜 삭제할래요?");
        if (ok) {
            //await dbService.doc(`nweets/${nweetObj.id}`).delete();
            await deleteDoc(NweetTextRef);
            //await deleteObject(NweetImgRef);
            if (nweetObj.attachmentUrl !== "") {
                await deleteObject(NweetImgRef);
            }
        }

    }
    //편집하기
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
    // const onChange = (event) => {
    //     const {
    //         target: { value },
    //     } = event;
    //     setNewNweet(value);
    // }

    return (
        <div className="chatting-list">
            <div className="profile-box"></div>
            <div className="txt-box">
                <b>유저닉네임</b>
                <p>{nweetObj.text}</p>
                {nweetObj.attachmentUrl && <img src={nweetObj.attachmentUrl} />}
            </div>
            {/* 트위터처럼 내가 쓴 글 편집및 삭제 하고싶으면 아래 하기 */}
            {/* {editing ? ( //편집중인가?
                <>
                    {isOwner && //주인인가? 주인일때만 아래 항목이 보이도록
                        <>
                            <form onSubmit={onSubmit}>
                                <input
                                    onChange={onChange}
                                    type="text"
                                    placeholder="편집할 내용을 적어주세요"
                                    value={newNweet}
                                    required />
                                <input
                                    type="submit"
                                    value="Update Nweet"
                                />
                            </form>
                            <button onClick={toggleEditing}>Cancle</button>
                        </>
                    }
     
                </>
            ): (
                <>
                    <h4>{nweetObj.text}</h4>
                    {nweetObj.attachmentUrl && <img src={nweetObj.attachmentUrl} width="50px" height="50px" />}
                    {isOwner && ( //주인인가? 주인일때만 편집, 삭제 버튼이 보이도록
                        <>
                            <button onClick={onDeleteClick}>Delete</button>
                            <button onClick={toggleEditing}>Edit</button>
                        </>
                    )}
                </>
            )} */}
        </div>
    )
}

export default Nweet;