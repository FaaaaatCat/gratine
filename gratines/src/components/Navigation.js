import React from "react";
import { Link } from "react-router-dom";

const Navigation = ({ userObj, refreshUser }) => {
    return (
        <>
            <nav className="nav">
                <ul>
                    <li>
                        <Link to="/">Home</Link>
                    </li>
                    <li>
                        <Link to="/History" target="_blank">히스토리 가기</Link>
                    </li>
                </ul>
            </nav>
        </>
    )
};
export default Navigation;