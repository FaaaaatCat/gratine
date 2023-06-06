import React, { useEffect, useState } from "react";
import AppRouter from "./Router";
import fbase from "../fbase";
import { getAuth } from "firebase/auth";

function App() {
  const [ init, setInit ] = useState(false);
  const auth = getAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(()=>{
    auth.onAuthStateChanged((user)=>{
      if(user){
        setIsLoggedIn(true);
      }
      else{
        setIsLoggedIn(false);
      }
      setInit(true);
    });
  },[])
  // setInterval(()=>{
  //   console.log(auth.currentUser)
  // },2000)
  return (
    <>
      {init ? <AppRouter isLoggedIn={isLoggedIn} /> : "Initializing..."}
      
      <footer>$copy{new Date().getFullYear()} Gratine</footer>
    </>
    
  );
}

export default App;
