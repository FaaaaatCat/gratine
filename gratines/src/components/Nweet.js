import { dbService } from "fbase";
import { doc, deleteDoc, updateDoc } from "firebase/firestore";
import React, { useState } from "react";

const Nweet = ({ nweetObj, isOwner }) => {
    const NweetTextRef = doc(dbService, "nweets", `${nweetObj.id}`); //nweetObj.id 는 쓴 트윗의 고유 id임. userObj.id와 다름.
    //console.log(nweetObj.id) //쓴 데이터 갯수만큼 실행 됨 그래서 모든 트윗의 id를 보여줌.

    const [editing, setEditing] = useState(false);
    const [newNweet, setNewNweet] = useState(nweetObj.text);
    //지우기
    const onDeleteClick = async () => {
        const ok = window.confirm("진짜 삭제할래요?");
        if (ok) {
            //await dbService.doc(`nweets/${nweetObj.id}`).delete();
            await deleteDoc(NweetTextRef);
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
        <div>
            {editing ? ( //편집중인가?
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
                    {isOwner && ( //주인인가? 주인일때만 편집, 삭제 버튼이 보이도록
                        <>
                            <button onClick={onDeleteClick}>Delete</button>
                            <button onClick={toggleEditing}>Edit</button>
                        </>
                    )}
                </>
            )}
        </div>
    )
}

export default Nweet;