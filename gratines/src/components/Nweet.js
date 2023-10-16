import { dbService, storageService } from "fbase";
import { deleteObject, ref } from "@firebase/storage";
import { doc, deleteDoc, updateDoc, collection, getDocs, query, addDoc, where, onSnapshot  } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import React, { useEffect, useState } from "react";

const Nweet = ({ nweetObj, isOwner, isOrder, orderWhat, orderText, isWhole, isDice, isBuy, isAttack, isCure, hpValue, isHpRest}) => {
    const NweetTextRef = doc(dbService, "nweets", `${nweetObj.id}`); //nweetObj.id 는 쓴 트윗의 고유 id임. userObj.id와 다름.
    const NweetImgRef = ref(storageService, nweetObj.attachmentUrl); //nweetObj.attachmentUrl의 레퍼런스를 얻음
    //console.log(nweetObj.id) //쓴 데이터 갯수만큼 실행 됨 그래서 모든 트윗의 id를 보여줌.
    const auth = getAuth();
    const [editing, setEditing] = useState(false);
    const [newNweet, setNewNweet] = useState(nweetObj.text);
    const defaultProfile = 'https://firebasestorage.googleapis.com/v0/b/gratia-2cdd0.appspot.com/o/gratine%2Fdefault_profile.png?alt=media&token=9003c59f-8f33-4d0a-822c-034682416355';
    const [smallVic, setSmallVic] = useState(false);
    const [bigVic, setBigVic] = useState(false);
    const [fullVic, setFullVic] = useState(false);
    const [middleVic, setMiddleVic] = useState(false);

    //최소,중간,최대 값대로 출력하기
    useEffect(() => {
        if (isAttack || isCure) {
            if (nweetObj.diceNum > 39) {
                setFullVic(true)
            }
            else if (nweetObj.diceNum > 30) {
                setBigVic(true)
            }
            else if (nweetObj.diceNum < 10) {
                setSmallVic(true)
            }
            else {
                setMiddleVic(true)
            }
        }
        else return;
    }, [nweetObj]);


    //전체 공지 지우기
    const onDeleteClick = async () => {
        const ok = window.confirm("공지를 진짜 삭제할래요?");
        if (ok) {
            await deleteDoc(NweetTextRef);
            if (nweetObj.attachmentUrl !== "") {
                await deleteObject(NweetImgRef);
            }
        }
    }

    //이미지 클릭시 새창에 띄워주기
    const openImageInNewWindow = (imageUrl) => {
        // 새 창을 열어 이미지를 표시합니다.
        window.open(imageUrl, '_blank', 'noopener noreferrer');
    };

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
            <div className={'chatting-list ' + (isOwner? 'myChat ':'') + (isDice || isAttack || isCure? 'orderChat ':'') + (isBuy? 'buyChat ':'') + (isWhole || isHpRest? 'wholeChat ':'')}>
                <div className="profile-box">
                    {/* <img src={nweetObj.creatorImg} /> */}
                    {nweetObj.creatorImg ? <img src={nweetObj.creatorImg} /> : <img src={defaultProfile} />}
                </div>
                <div className="txt-box">
                    <div className="name-box">
                        <b>{nweetObj.creatorName}</b>
                        {hpValue &&
                            <p className="hpValue">
                                hp : {nweetObj.hp}
                            </p>
                        }
                    </div>
                    {isDice || isWhole || isAttack || isCure || isHpRest ?
                        <>
                            {isHpRest && <p>🍀 모두의 체력을 100으로 리셋했습니다. 🍀</p>}
                            {isWhole && <>
                                <p>{nweetObj.orderText}</p>
                                {isOwner && <button onClick={onDeleteClick}><span className="material-icons-round">close</span></button>}
                            </>}
                            {isDice && <p>[🎲주사위 {nweetObj.orderText}] <span>{nweetObj.creatorName}</span>님이 주사위 <b>{nweetObj.diceNum}</b>을 굴렸습니다. </p>}
                            {isAttack && <>
                                {fullVic &&
                                    <p>[🔪🔪🔪공격 최고성공!!]<span>{nweetObj.creatorName}</span>님이 <span>{nweetObj.orderText}</span>님을 진심을 담아 공격합니다!<b>{nweetObj.diceNum}</b> 어마어마한 데미지가 들어갔습니다!</p>
                                }
                                {bigVic &&
                                    <p>[🔪🔪공격 대성공!]<span>{nweetObj.creatorName}</span>님이 <span>{nweetObj.orderText}</span>님을 공격합니다!<b>{nweetObj.diceNum}</b> 크리티컬 데미지가 들어갔습니다!</p>
                                }
                                {middleVic &&
                                    <p>[🔪공격]<span>{nweetObj.creatorName}</span>님이 <span>{nweetObj.orderText}</span>님을 공격합니다.<b>{nweetObj.diceNum}</b>데미지가 들어갔습니다.</p>
                                }
                                {smallVic &&
                                    <p>[🔪공격..?]<span>{nweetObj.creatorName}</span>님이 <span>{nweetObj.orderText}</span>님을 공격했습니다만...<b>{nweetObj.diceNum}</b>데미지가 잔잔하게 스쳤습니다.</p>
                                }
                                {/* <p>[ <span>{nweetObj.creatorName}</span> : {nweetObj.hp} ] vs [ <span>{nweetObj.orderText}</span> : {enemyHp} ]</p> */}
                            </>
                            }
                            {isCure && <>
                                {fullVic &&
                                    <p>[💖💖💖치유 최고성공!!]<span>{nweetObj.creatorName}</span>님이 <span>{nweetObj.orderText}</span>님을 치유합니다! 세계수의 신이 강림해 <b>{nweetObj.diceNum}</b>의 체력을 거의 전부 복구시켰습니다. </p>
                                }
                                {bigVic &&
                                    <p>[💖💖치유 대성공!]<span>{nweetObj.creatorName}</span>님이 <span>{nweetObj.orderText}</span>님을 치유합니다! 세계수의 가호로 <b>{nweetObj.diceNum}</b>의 체력이 크게 복구됩니다. </p>
                                }
                                {middleVic &&
                                    <p>[💖치유]<span>{nweetObj.creatorName}</span>님이 <span>{nweetObj.orderText}</span>님을 치유합니다.<b>{nweetObj.diceNum}</b>의 체력이 복구됩니다. </p>
                                }
                                {smallVic &&
                                    <p>[💖침바르기]<span>{nweetObj.creatorName}</span>님이 <span>{nweetObj.orderText}</span>님께 침을 발랐습니다. <b>{nweetObj.diceNum}</b>의 미미한 체력이 복구됩니다. </p>
                                }
                            </>
                            }
                        </> :
                        <>
                            <pre>{nweetObj.text}</pre>
                        </>
                    }
                    {nweetObj.attachmentUrl && <img onClick={() => openImageInNewWindow(nweetObj.attachmentUrl)} src={nweetObj.attachmentUrl} />}
                </div>
            </div>
        </>
    )
}

export default Nweet;