import React from "react";
import {HashRouter as Router, Routes, Route, Navigate} from "react-router-dom";
import Auth from "../routes/Auth";
import Home from "../routes/Home";
import Profile from "../routes/Profile";
import Navigation from "./Navigation";

const AppRouter = ({isLoggedIn, userObj, refreshUser}) => {
    // const [isLoggedIn, setIsLoggedIn] = useState(true);
    return(
        <div className="app-container">
            <Router>
                {isLoggedIn && <Navigation userObj={userObj} />}
                <Routes>
                    {isLoggedIn ? (
                        <>
                            <Route exact path="/" element={<Home userObj={userObj} refreshUser={refreshUser} />} />
                            {/* <Route exact path="/profile" element={<Profile userObj={userObj} refreshUser={refreshUser} />} /> */}
                        </>
                    ) : (
                        <>
                            <Route exact path="/" element={<Auth userObj={userObj} refreshUser={refreshUser}  />} />
                        </>
                    )}
                    <Route path="*" element={<Navigate replace to="/" />} /> 
                </Routes>
            </Router>
        </div>
    )
}
export default AppRouter;