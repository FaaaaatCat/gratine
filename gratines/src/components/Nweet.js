import { dbService } from "fbase";
import { doc, deleteDoc, updateDoc } from "firebase/firestore";
import React, { useState } from "react";

const Nweet = ({ nweetObj, isOwner }) => {
    const NweetTextRef = doc(dbService, "nweets", `${nweetObj.id}`);

    const [editing, setEditing] = useState(false);
    const [newNweet, setNewNweet] = useState(nweetObj.text);
    //지우기
    const onDeleteClick = async () => {
        const ok = window.confirm("진짜 삭제할래요?");
        if (ok) {
            //await dbService.doc(`nweets/${nweetObj.id}`).delete();
            await deleteDoc(NweetTextRef );
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
    const onChange = (event) => {
        const {
            target: { value },
        } = event;
        setNewNweet(value);
    }
    return (
        <div>
            {editing ? (
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
            ): (
                <>
                   <h4>{nweetObj.text}</h4>
                    {isOwner && (
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