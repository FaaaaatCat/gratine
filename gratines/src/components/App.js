import React, { useEffect, useState } from "react";
import AppRouter from "./Router";
import fbase from "../fbase";
import { getAuth } from "firebase/auth";

function App() {
  const [ init, setInit ] = useState(false);
  const auth = getAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [updateProfile, setUpdateProfile] = useState(false);
  const [userObj, setUserObj] = useState(null);
  useEffect(()=>{
    auth.onAuthStateChanged((user) => {
      //로그인 되었다면
      if(user){
        setIsLoggedIn(true);
        // setUserObj(user); //user을 가져오면 너무 많은 데이터를 갖고오게 되어 리액트가 햇갈림
        setUserObj({
          displayName: user.displayName,
          uid: user.uid,
          updateProfile: (args) => updateProfile(user, { displayName: user.displayName }),
        });
        //이메일로 로그인 했을때의 첫 세팅이름
        if (user.displayName === null) {
          const name = user.email.split("@")[0];
          user.updateProfile({
            displayName: name, //이메일 이름값 말고 다른거 넣고싶으면 name을 "고정값"으로 변경
            //photoURL: user.photoURL // 포토 넣는거!!!!
          });
        }
      }
      //로그인 안되었다면
      else{
        setIsLoggedIn(false);
      }
      setInit(true);
    });
  }, [])

  //유저네임 변경시 자동 리프레쉬 업데이트
  const refreshUser = () => {
    const user = auth.currentUser;
    setUserObj({
      displayName: user.displayName,
      uid: user.uid,
      updateProfile: (args) => updateProfile(user, { displayName: user.displayName }),
    });
  }
  // setInterval(()=>{
  //   console.log(auth.currentUser)
  // },2000)
  return (
    <>
      {init ? <AppRouter
                isLoggedIn={isLoggedIn}
                userObj={userObj}
                refreshUser={refreshUser}
              /> : "Initializing..."}
      
      <footer>$copy{new Date().getFullYear()} Gratine</footer>
    </>
  );
}

export default App;
