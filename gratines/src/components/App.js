import React, { useState } from "react";
import AppRouter from "./Router";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  return (
    <>
      <AppRouter isLoggedIn={isLoggedIn} />
      <footer>$copy{new Date().getFullYear()} Gratine</footer>
    </>
    
  );
}

export default App;
