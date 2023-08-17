import React, { useEffect, useState } from "react";
import leafImg from '../images/leaf.png'

const ShowProfile = ({userObj, refreshUser, fbUserObj}) => {
    const [isProfile, setIsProfile] = useState();
    const defaultProfile = 'https://firebasestorage.googleapis.com/v0/b/gratia-2cdd0.appspot.com/o/gratine%2Fdefault_profile.png?alt=media&token=9003c59f-8f33-4d0a-822c-034682416355';
    return (
        <>
            <div className="profile-box__my">
                {fbUserObj.photoURL ? <img src={fbUserObj.photoURL} /> : <img src={defaultProfile} />}
            </div>
            <div className="nameplate">
                <img src={leafImg} alt="" />
                <div className="name-wrap">
                    <h4>
                        {fbUserObj.displayName ? <>{fbUserObj.displayName}</> : <>이름을 적어주세요</>}
                    </h4>
                    <p>Gratines Student</p>
                </div>
                <img src={leafImg} alt="" />
            </div>
            
            <div className="profile-info">
                <div className="profile-item">
                    <p>소지금</p>
                    <div>
                        <b>{fbUserObj.gold}</b>
                        <span> Gold</span>
                    </div>
                </div>
                <div className="profile-item">
                    <p>소지품</p>
                    <div>
                        <b>{fbUserObj.item}</b>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ShowProfile;