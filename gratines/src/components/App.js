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
  const [attendObj, setAttendObj] = useState(null);
  const defaultProfile = 'https://firebasestorage.googleapis.com/v0/b/gratia-2cdd0.appspot.com/o/gratine%2Fdefault_profile.png?alt=media&token=9003c59f-8f33-4d0a-822c-034682416355';
  //const name = user.email.split("@")[0];

  useEffect(()=>{
    onAuthStateChanged(auth, (user) => {
      //로그인 되었다면(가장처음세팅)
      //새로고침 후에도 적용
      if (user) {
        setIsLoggedIn(true);
        //유저정보 저장
        setUserObj({
          uid: user.uid,
          displayName: user.displayName,
          photoURL: user.photoURL,
        });
        //게임유저 저장
        setFbUserObj({
          uid: user.uid,
          email: user.email,
          password: '',
          gold: 0,
          item: '',
          login: true,
        })
        //출석점수 저장
        setAttendObj({
          uid: user.uid,
          email: user.email,
          attendCount : 0,
          attendRanNum : 0,
          totalAttend: 0,
        });
        //await 끝난후 (새로고침마다) 불러오기
        getFbUserObj(user);
        getUserAttendObj(user);
        refreshUser();
      }
      //로그인 안되었다면
      else {
        setIsLoggedIn(false);
        setUserObj(null);
        setFbUserObj(null);
        setAttendObj(null);
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
      email: fbUserData[0].email,
      password: fbUserData[0].password,
      gold: fbUserData[0].gold,
      item: fbUserData[0].item,
      login: true,
    })
  };
  //유저의 게임데이터 읽어오기
  const getUserAttendObj = async (user) => {
    //1. 현재 uid와 일치하는 유저 데이터 받아오기
      const q = query(
          collection(dbService, "userGame"),
          where("uid", "==", user.uid)
      );
    //updateFbUserObj(user)
    const querySnapshot = await getDocs(q);
    const userAtdData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setAttendObj({
      uid: user.uid,
      email : user.email,
      attendCount : userAtdData[0].attendCount,
      attendRanNum : userAtdData[0].attendRanNum,
      totalAttend: userAtdData[0].totalAttend,
    })
  };
  //유저네임 변경시 자동 리프레쉬 업데이트
  const refreshUser = async () => {

    const user = auth.currentUser;
    getUserAttendObj(user);
    getFbUserObj(user);
    await updateCurrentUser(auth, user);

    //이름 또는 사진이 없을시 디폴트로 저장
    if (user.displayName === '' || user.displayName === null) {
      if (user.photoURL === '' || user.photoURL === null) {
        setUserObj({
          uid: user.uid,
          displayName: 'user',
          photoURL: defaultProfile,
          updateProfile: (args) => updateProfile(user, {
            displayName: 'user',
            photoURL: defaultProfile,
          })
        });
      }
      else {
        setUserObj({
          uid: user.uid,
          displayName: 'user',
          photoURL: user.photoURL,
          updateProfile: (args) => updateProfile(user, {
            displayName: 'user',
            photoURL: user.photoURL,
          })
        });
      }
    }
    //이름 또는 사진이 있다면 바뀐값으로 저장
    else {
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
  }
  return (
    <>
      {init ?
        <AppRouter
          isLoggedIn={isLoggedIn}
          userObj={userObj}
          fbUserObj={fbUserObj}
          attendObj = {attendObj}
          refreshUser={refreshUser}
        /> : "Initializing..."
      }
      {/* <footer>$copy{new Date().getFullYear()} Gratine</footer> */}
    </>
  );
}

export default App;
