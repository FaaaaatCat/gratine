import React, { useEffect, useState } from "react";
import { getAuth, signOut, updateProfile  } from "firebase/auth";

const ShowProfile = ({ userObj, refreshUser }) => {
    const auth = getAuth();
    const user1 = auth.currentUser;
    return (
        <>
            <div className="profile-box__my">
                <img src={user1.photoURL} />
            </div>
            <h4>{user1.displayName}</h4>
            <div className="profile-info">
                <div>
                    <p>HP : </p>
                    <b>90</b>
                    <span> / 100</span>
                </div>
                <div>
                    <p>소지금 : </p>
                    <b>1200</b>
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