import React from "react";
import { Link } from "react-router-dom";

const Navigation = ({ userObj, refreshUser }) => {
    if (userObj.displayName === null) {
        console.log(userObj.displayName)
        console.log(userObj.email)
        console.log(userObj.refreshUser)
        //const name = userObj.email.split('@')[0];
        //userObj.displayName = name;
    }
    return (
        <>
            <nav className="nav">
                <ul>
                    <li>
                        <Link to="/">Home</Link>
                    </li>
                    <li>
                        <Link to="/profile">{userObj.displayName}의 profile</Link>
                    </li>
                </ul>
            </nav>
        </>
    )
};
export default Navigation;