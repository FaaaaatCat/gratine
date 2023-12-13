import React, { useEffect, useState } from "react";
import { dbService, storageService } from '../fbase';
import { collection, addDoc, query, onSnapshot, orderBy,where, doc, getDocs, updateDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Nweet from "components/Nweet";

const History = () => {
    const auth = getAuth();
    const [nweets, setNweets] = useState([]);

    //명령어 모음
    let orderList = ['10', '50', '100', '선택']
    
    //트윗들 받아오는 기능
    useEffect(() => {
        const q = query(
            collection(dbService, "nweets"),
            orderBy("createdAt", "desc")
        );
        const unsubscribe = onSnapshot(q, (Snapshot) => {
            const nweetArray = Snapshot.docs.map((doc) => {
                return {
                    id: doc.id,
                    ...doc.data(),
                };
            });
            setNweets(nweetArray);
        });
        onAuthStateChanged(auth, (user) => {
            if (user == null) {
                unsubscribe();
            }
        });
    }, []);

    //보고싶은 페이지수 선택하는 기능
    const options = [
        { value: 20, label: '20' },
        { value: 50, label: '50' },
        { value: 100, label: '100' },
        { value: 200, label: '200' },
    ];
    const [selectedOption, setSelectedOption] = useState(options[0].value);
    const handleOptionChange = (event) => {
        setSelectedOption(event.target.value);
    };

    //페이지 넘기는 기능
    const data = nweets;
    // const ITEMS_PER_PAGE = selectedOption;
    const ITEMS_PER_PAGE = 200;
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(data.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentPageData = data.slice(startIndex, endIndex);
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    return (
        <div className='history-page'>
            <div className="history-wrap">
                <div className="title-wrap">
                    <div className="title">
                        Chat Archive
                    </div>
                    <div className="pagination">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => handlePageChange(currentPage - 1)}
                            className = {`gtn-btn btn-icon-only ${currentPage === 1 ? 'btn-disable' : ''}`}
                        >
                            <span className="material-icons-round">chevron_left</span>
                        </button>
                        <p>{currentPage} / {totalPages}</p>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => handlePageChange(currentPage + 1)}
                            className = {`gtn-btn btn-icon-only ${currentPage === totalPages ? 'btn-disable' : ''}`}
                        >
                            <span className="material-icons-round">chevron_right</span>
                        </button>
                        <div className="flx-row gap-1 ml-auto">
                            <button
                                onClick={() => handlePageChange(1)}
                                className = {`gtn-btn btn-white w-unset ${currentPage === 1 ? 'btn-disable' : ''}`}
                            >
                                first
                            </button>
                            <button
                                onClick={() => handlePageChange(totalPages)}
                                className = {`gtn-btn btn-white w-unset ${currentPage === totalPages ? 'btn-disable' : ''}`}
                            >
                                last
                            </button>
                        </div>
                        {/* <select className="gtn-select ml-auto" value={selectedOption} onChange={handleOptionChange}>
                            {options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                            ))}
                        </select> */}
                    </div>
                </div>
                
                <div className="log-wrap">
                    <div className="chatting-list-container">
                        {currentPageData.map((nweet) => (
                            <Nweet
                                key={nweet.id}
                                nweetObj={nweet} //id, createdAt, text 등 생성한 값 갖고있음
                                isOwner={nweet.creatorId === auth.currentUser.uid} //내가 실제 주인인지 //맞으면 true 값 뱉음
                                isOrder={nweet.orderText !== ""}
                                orderText={nweet.orderText}
                                orderWhat={nweet.orderWhat}
                                isWhole={nweet.orderWhat === "/전체"}
                                isDice={nweet.orderWhat === "/주사위" && orderList.includes(nweet.orderText)}
                                isBuy={nweet.buy === true}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default History;