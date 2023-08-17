import React, { useEffect, useState } from "react";
import { dbService, storageService } from '../fbase';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, addDoc, query, orderBy, where, doc, getDocs, updateDoc} from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "@firebase/storage";

const Member = ({ isLoggedIn, fbUserObj, userObj }) => {
    const auth = getAuth();
    const [loginUsers, setLoginUsers] = useState([]);
    useEffect(() => {
        if (isLoggedIn) {
            readLoginUser();
        }
        else {
            //setLogOut();
        }
    }, []);

    //유저정보를 로그아웃으로 만드는 기능
    const setLogOut = async () => {
        const q = query(
            collection(dbService, "user"),
            where("uid", "==", userObj.uid)
        );
        const querySnapshot = await getDocs(q);
        const currentUserGameData_Id = querySnapshot.docs[0].id;
        const UserGameRef = doc(dbService, "user", currentUserGameData_Id);
        await updateDoc(UserGameRef, {
            login : false,
        })
    }

    //로그인된 유저 불러오는 기능
    const readLoginUser = async () => {
        const q = query(
          collection(dbService, "user"),
          where("login", "==", true)
        );
        const unsubscribe = onSnapshot(q, (Snapshot) => {
            const loginUserArray = Snapshot.docs.map((doc) => { //snapshot : 트윗을 받을때마다 알림 받는곳. 새로운 스냅샷을 받을때 nweetArray 라는 배열을 만듬
                return {
                    // id: doc.id,
                    ...doc.data(), //...은 데이터의 내용물, 즉 spread attribute 기능임
                };
            });
            setLoginUsers(loginUserArray);
        });
        onAuthStateChanged(auth, (user) => {
            if (user == null) {
                unsubscribe();
            }
        });
        // querySnapshot.forEach((doc) => {
        //     return (
        //         console.log(doc._document.data.value.mapValue.fields)
        //     )
        // });
    }

    return (
        <>
            <div className="member-list-container">
                {isLoggedIn ?
                    <>
                        {loginUsers.map((loginUser) => (
                            <div className="member-list">
                                <img src={loginUser.photoURL} className="profile-box" />
                                <p>{loginUser.displayName}</p>
                            </div>
                        ) )}
                    </>
                    :
                    <></>
                }
            </div>
        </>
    );
};

export default Member;