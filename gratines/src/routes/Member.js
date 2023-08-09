import React, { useEffect, useState } from "react";
import { dbService, storageService } from '../fbase';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot, addDoc, query, orderBy, where, doc, getDocs, updateDoc} from "firebase/firestore";
import { ref, uploadString, getDownloadURL } from "@firebase/storage";

const Member = ({ isLoggedIn, fbUserObj }) => {
    const auth = getAuth();
    const [appendDiv, setAppendDiv] = useState(false);
    const [loginUsers, setLoginUsers] = useState([]);
    useEffect(() => {
        if (isLoggedIn) {
            readLoginUser();
            //saveLoginUser();
        }
    }, []);
    const readLoginUser = async () => {
        const q = query(
          collection(dbService, "user"),
          where("login", "==", true)
        );
        const querySnapshot = await getDocs(q);
        const unsubscribe = onSnapshot(q, (Snapshot) => {
            const loginUserArray = Snapshot.docs.map((doc) => { //snapshot : 트윗을 받을때마다 알림 받는곳. 새로운 스냅샷을 받을때 nweetArray 라는 배열을 만듬
                return {
                    // id: doc.id,
                    ...doc.data(), //...은 데이터의 내용물, 즉 spread attribute 기능임
                };
            });
            setLoginUsers(loginUserArray);
            console.log(loginUserArray)
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
    const saveLoginUser = async () => {
        const loginUserData = {
            userName: auth.currentUser.displayName,
            userPhoto: auth.currentUser.photoURL,
        }
        await addDoc(collection(dbService, "loginUser"), loginUserData);
    }

    return (
        <>
            <div className="member-list-container">
                {isLoggedIn ?
                    <>
                        {loginUsers.map((loginUser) => (
                            <div className="member-list">
                                <div className="profile-box"></div>
                                <p>{loginUser.email}</p>
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