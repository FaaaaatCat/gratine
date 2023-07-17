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
import { dbService, storageService } from '../fbase';
import { collection, addDoc, query, onSnapshot, orderBy, where, doc, getDocs,updateDoc } from "firebase/firestore";

function App() {
  const auth = getAuth();
  const [ init, setInit ] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [updateProfile, setUpdateProfile] = useState(false);
  const [userObj, setUserObj] = useState(null);
  const [fbUserObj, setFbUserObj] = useState(null);
  const [newUserObj, setNewUserObj] = useState(null);
  const [gameObj, setGameObj] = useState(null);
  //const name = user.email.split("@")[0];

  useEffect(()=>{
    onAuthStateChanged(auth, (user) => {
      console.log('APP이다')
      //로그인 되었다면(가장처음세팅)
      //새로고침 후에도 적용
      if (user) {
        setIsLoggedIn(true);
        console.log('APP - 유저정보 있다')
        console.log('1')
        //세팅
        setFbUserObj({
          uid: user.uid,
          email: user.email,
          password: '',
          nickName: '',
          gold: 100,
          hp: 100,
        })
        //유저정보 저장
        setUserObj({
          uid: user.uid,
          displayName: user.displayName,
          photoURL: user.photoURL,
        });
        //로컬스토리지에 저장
        // localStorage.setItem(
        //   'gratineUser',
        //   JSON.stringify({
        //     uid: user.uid,
        //     photoURL: user.photoURL,
        //   })
        // )
        //await 끝난후 (새로고침마다) 불러오기
        
        //getUserGameObj(user);
        getFbUserObj(user);
        refreshUser();
      }
      //로그인 안되었다면
      else {
        setIsLoggedIn(false);
        setUserObj(null);
        setFbUserObj(null);
      }
      setInit(true);
    });
  }, [])

  //회원가입한 유저데이터 읽어오기
  const getFbUserObj = async (user) => {
    //1. 현재 uid와 일치하는 유저 데이터 받아오기
    const q = query(
      collection(dbService, "user"),
      where("uid", "==", user.uid)
    );
    //updateFbUserObj(user)
    const querySnapshot = await getDocs(q);
    const fbUserData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setFbUserObj({
      uid: fbUserData[0].uid,
      nickName: fbUserData[0].nickName,
      email: fbUserData[0].email,
      password: fbUserData[0].password,
      gold: fbUserData[0].gold,
      hp: fbUserData[0].hp,
    })
  };
  //유저의 게임데이터 읽어오기
  const getUserGameObj = async (user) => {
    //1. 현재 uid와 일치하는 유저 데이터 받아오기
    const q = query(
      collection(dbService, "userGame"),
      where("uid", "==", user.uid)
    );
    //updateFbUserObj(user)
    const querySnapshot = await getDocs(q);
    const UserGameData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setGameObj(UserGameData[0])
  };
  //유저데이터 업데이트(덧씌우기)
  const updateFbUserObj = (user) => {
    // await updateDoc(FbUserRef, {
    //   uid: fbUserData[0].uid,
    //   nickName: fbUserData[0].nickName,
    //   email: fbUserData[0].email,
    //   password: fbUserData[0].password,
    //   gold: fbUserData[0].gold,
    //   hp: fbUserData[0].hp,
    // });
  }
  //유저네임 변경시 자동 리프레쉬 업데이트
  const refreshUser = async() => {
    const user = auth.currentUser;
    await updateCurrentUser(auth, user);
    setUserObj({
      uid: user.uid,
      displayName: user.displayName,
      photoURL: user.photoURL,
      updateProfile: (args) => updateProfile(user, {
        displayName: user.displayName,
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
          fbUserObj={fbUserObj}
          refreshUser={refreshUser}
        /> : "Initializing..."
      }
      {/* <footer>$copy{new Date().getFullYear()} Gratine</footer> */}
    </>
  );
}

export default App;
