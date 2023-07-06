import React, { useEffect, useState } from "react";
import AppRouter from "./Router";
import {
  getAuth,
  onAuthStateChanged,
  updateCurrentUser,
  UserInfo,
  createUserWithEmailAndPassword,
  updateProfile 
} from "firebase/auth";

function App() {
  const auth = getAuth();
  const [ init, setInit ] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [updateProfile, setUpdateProfile] = useState(false);
  const [userObj, setUserObj] = useState(null);
  const defaultProfile = 'https://firebasestorage.googleapis.com/v0/b/gratia-2cdd0.appspot.com/o/gratine%2Fdefault_profile.jpg?alt=media&token=b173d6e0-7a8e-4e49-a06e-9b377bb186a0';

  useEffect(()=>{
    onAuthStateChanged(auth, (user) => {
      //로그인 되었다면
      if (user) {
        setIsLoggedIn(true);
        const name = user.email.split("@")[0];
        //유저정보에 저장(가장처음세팅)
        setUserObj({
          uid: user.uid,
          displayName: name,
          email: user.email,
          photoURL: defaultProfile,
        });
        //로컬스토리지에 저장(가장처음세팅)
        localStorage.setItem(
          'gratineUser',
          JSON.stringify({
            uid: user.uid,
            displayName: name,
            email: user.email,
            photoURL: defaultProfile,
          })
        )
        refreshUser();
      }
      //로그인 안되었다면
      else{
        setIsLoggedIn(false);
        setUserObj(null);
      }
      setInit(true);
    });
  }, [])

  //유저네임 변경시 자동 리프레쉬 업데이트
  const refreshUser = () => {
    const user = auth.currentUser;
    setUserObj({
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      updateProfile: (args) => updateProfile(user, {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
      })
    });
  }
  return (
    <>
      {init ?
        <AppRouter
          isLoggedIn={isLoggedIn}
            userObj={userObj}
            refreshUser={refreshUser}
        /> : "Initializing..."
      }
      {/* <footer>$copy{new Date().getFullYear()} Gratine</footer> */}
    </>
  );
}

export default App;
