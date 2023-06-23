import React, { useEffect, useState } from "react";
import { getAuth, signOut, updateProfile  } from "firebase/auth";
import { authService, dbService } from "fbase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";

const EditProfile = ({ refreshUser, userObj }) => {
    return (
        <div>
        </div>
    )
};
export default EditProfile;