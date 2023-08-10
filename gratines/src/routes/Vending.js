import React, { useState } from 'react';
import { dbService, storageService } from '../fbase';
import { collection, addDoc, query, onSnapshot, orderBy,where, doc, getDocs, updateDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import moment from "moment";
import bearImg1 from '../images/bears/bears_1.JPG'
import bearImg2 from '../images/bears/bears_2.JPG'
import bearImg3 from '../images/bears/bears_3.JPG'
import bearImg4 from '../images/bears/bears_4.JPG'
import bearImg5 from '../images/bears/bears_5.JPG'

const Vending = ({userObj, fbUserObj}) => {
    const [item, setItem] = useState("");

    //오늘 날짜
    let today = moment().format("YYMMDD")
    let todayfull = new Date().toLocaleString();

    const doBuy = async (e) => {
        const itemName = e.target.children[1].children[0].innerText;
        const itemPrice = e.target.children[1].children[1].innerText;

        const ok = window.confirm("아이템을 구매하시겠습니까? 구매 후엔 직접 소지금을 수정해주세요.");
        if (ok) {
            const buyMention = `[구매완료] ${itemName}(${itemPrice})을 구매했습니다. 소지금을 수정하겠습니다. (${todayfull}) `
            const buyNweetObj = {
                text: buyMention,
                createdAt: Date.now(),
                createdDate: todayfull,
                creatorId: userObj.uid,
                creatorName: userObj.displayName,
            };
            await addDoc(collection(dbService, "nweets"), buyNweetObj);
        }
    }
    return (
        <>
            <div className="vending-list-container">
                <div className="vending-item soldOut">
                    <div className="img-box">
                        <img src={bearImg1} alt="" />
                    </div>
                    <div className="txt-box">
                        <p>아이템 이름</p>
                        <span>100 G</span>
                    </div>
                </div>
                <div className="vending-item" onClick={doBuy}>
                    <div className="img-box">
                        <img src={bearImg2} alt="" />
                    </div>
                    <div className="txt-box">
                        <p>아이템 이름</p>
                        <span>100 G</span>
                    </div>
                </div>
                <div className="vending-item">
                    <div className="img-box">
                        <img src={bearImg3} alt="" />
                    </div>
                    <div className="txt-box">
                        <p>아이템 이름</p>
                        <span>100 G</span>
                    </div>
                </div>
                <div className="vending-item">
                    <div className="img-box">
                        <img src={bearImg4} alt="" />
                    </div>
                    <div className="txt-box">
                        <p>아이템 이름</p>
                        <span>100 G</span>
                    </div>
                </div>
                <div className="vending-item">
                    <div className="img-box">
                        <img src={bearImg5} alt="" />
                    </div>
                    <div className="txt-box">
                        <p>아이템 이름</p>
                        <span>100 G</span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Vending;