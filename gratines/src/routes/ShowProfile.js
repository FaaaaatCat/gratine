import React, { useEffect, useState } from "react";

const ShowProfile = ({userObj, refreshUser}) => {
    var jsonUser = JSON.parse(localStorage.getItem("gratineUser"));
    var jsonGame = JSON.parse(localStorage.getItem("gratineGame"));
    const [isProfile, setIsProfile] = useState();
    const defaultProfile = 'https://firebasestorage.googleapis.com/v0/b/gratia-2cdd0.appspot.com/o/gratine%2Fdefault_profile.jpg?alt=media&token=b173d6e0-7a8e-4e49-a06e-9b377bb186a0';
    return (
        <>
            <div className="profile-box__my">
                
                {jsonUser.photoURL ? <img src={jsonUser.photoURL} /> : <img src={defaultProfile} />}
            </div>
            <h4>
                {jsonUser.displayName ? <>{jsonUser.displayName}</> : <>이름을 적어주세요</>}
            </h4>
            <div className="profile-info">
                <div>
                    <p>HP : </p>
                    <b>90</b>
                    <span> / 100</span>
                </div>
                <div>
                    <p>소지금 : </p>
                    <b>{jsonGame.money}</b>
                    <span> Gold</span>
                </div>
                <div>
                    <p>소지품 : </p>
                    <b>인형, 칼, 총</b>
                </div>
            </div>
        </>
    );
};

export default ShowProfile;