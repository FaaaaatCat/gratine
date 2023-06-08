import React from "react";
import { getAuth, signOut } from "firebase/auth";

const Profile = () => {
    const auth = getAuth();
    const onLogOutClick = () => auth.signOut();
    return (
        <>
            <button onClick={onLogOutClick}>Log Out</button>
        </>
    )
};
export default Profile;