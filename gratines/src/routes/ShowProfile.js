import React, { useEffect, useState } from "react";

const ShowProfile = ({ userObj, refreshUser }) => {
    var json = JSON.parse(localStorage.getItem("gratineUser"));
    console.log('name ', json.displayName);
    console.log('photoURL ', json.photoURL);
    console.log('json ', json);
    return (
        <>
            <div className="profile-box__my">
                <img src={json.photoURL} />
            </div>
            <h4>{json.displayName}</h4>
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