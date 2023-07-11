import { dbService, storageService } from "fbase";
import { deleteObject, ref } from "@firebase/storage";
import { doc, deleteDoc, updateDoc, collection, getDocs, query, } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import React, { useEffect, useState } from "react";

const Nweet = ({ nweetObj, isOwner, isOrder, orderWhat, orderText, isWhole, isDice, isAttend }) => {
    const NweetTextRef = doc(dbService, "nweets", `${nweetObj.id}`); //nweetObj.id 는 쓴 트윗의 고유 id임. userObj.id와 다름.
    const NweetImgRef = ref(storageService, nweetObj.attachmentUrl); //nweetObj.attachmentUrl의 레퍼런스를 얻음
    //console.log(nweetObj.id) //쓴 데이터 갯수만큼 실행 됨 그래서 모든 트윗의 id를 보여줌.

    const [editing, setEditing] = useState(false);
    const [newNweet, setNewNweet] = useState(nweetObj.text);
    const [ranNum, setRanNum] = useState("")
    const [today, setToday] = useState("")

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
    useEffect(() => {
        //주사위 기능

        if (isOrder) {
            if (orderWhat === '/전체') {
            }
            else if (orderWhat === '/주사위') {
                if (orderText == ' 10') {
                    var ranNumOrigin = Math.random() * (10 - 1) + 1;
                }
                else if (orderText == ' 50') {
                    var ranNumOrigin = Math.random() * (50 - 1) + 1;
                }
                else if (orderText == ' 100') {
                    var ranNumOrigin = Math.random() * (100 - 1) + 1;
                }
                var ranNum = Math.ceil(ranNumOrigin)
                setRanNum(ranNum)
            }
            else if (orderWhat === '/출석') {
                var ranNumOrigin = Math.random() * (10 - 1) + 1;
                var ranNum = Math.ceil(ranNumOrigin)
                let today = new Date();
                setRanNum(ranNum)
                setToday(today.toLocaleString())
            }
        }
    },[])

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
            <div className={'chatting-list ' + (isOwner? 'myChat ':'') + (isOrder? 'orderChat ':'') + (isWhole? 'wholeChat ':'')}>
                <div className="profile-box">
                    <img src={nweetObj.creatorImg} />
                </div>
                <div className="txt-box">
                    <b>{nweetObj.creatorName}</b>
                    {isOrder ?
                        <>
                            {
                                isWhole ?
                                <>
                                    <p>{nweetObj.orderText}</p>
                                    {isOwner && <button onClick={onDeleteClick}><span className="material-icons-round">close</span></button>}
                                </> :
                                <>
                                    {isDice && <p><span>{nweetObj.creatorName}</span>가 주사위 <span>{ranNum}</span>을 굴렸습니다</p>}
                                    {isAttend && <p><span>{nweetObj.creatorName}</span>가 출석점수 <span>{ranNum}</span>을 받았습니다. <span>({today})</span></p>}
                                </>
                            }
                            
                        </> :
                        <>
                            <p>{nweetObj.text}</p>
                        </>
                    }
                    {nweetObj.attachmentUrl && <img src={nweetObj.attachmentUrl} />}
                </div>
            </div>
        </>
    )
}

export default Nweet;