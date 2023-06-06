import React, { useState } from "react";
import AppRouter from "./Router";
import fbase from "../fbase";
import { getAuth } from "firebase/auth";

function App() {
  const auth = getAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(auth.currentUser);
  return (
    <>
      <AppRouter isLoggedIn={isLoggedIn} />
      <footer>$copy{new Date().getFullYear()} Gratine</footer>
    </>
    
  );
}

export default App;
