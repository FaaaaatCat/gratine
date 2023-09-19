import React, { useEffect, useState } from "react";
import leafImg from '../images/leaf.png'

const ShowProfile = ({userObj, refreshUser, fbUserObj, onToggleChange}) => {
    const defaultProfile = 'https://firebasestorage.googleapis.com/v0/b/gratia-2cdd0.appspot.com/o/gratine%2Fdefault_profile.png?alt=media&token=9003c59f-8f33-4d0a-822c-034682416355';
    const [isChecked, setIsChecked] = useState(false);
    
    // 체크 상태 변경 핸들러
    const handleToggle  = () => {
        const newChecked = !isChecked;
        setIsChecked(newChecked);
        onToggleChange(newChecked); // 부모 컴포넌트로 값을 전달
        window.localStorage.setItem("hpToggle", newChecked)
    };

    // 페이지 로드 시 체크 상태 복원
    useEffect(() => {
        const storedIsChecked = localStorage.getItem('hpToggle');
        if (storedIsChecked === 'true') {
            setIsChecked(true);
            onToggleChange(true);
        } else {
            setIsChecked(false);
            onToggleChange(false);
        }
    }, []);
        
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
                <div className="profile-item">
                    <p>체력</p>
                    <div>
                        <b>{fbUserObj.hp}</b>
                        <label className="gtn-toggle ml-2">
                            {/* <span>show</span> */}
                            <input
                                role="switch"
                                type="checkbox"
                                checked={isChecked}
                                onChange={handleToggle }
                            />
                        </label>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ShowProfile;