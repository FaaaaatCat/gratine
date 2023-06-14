// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: process.env.REACT_APP_API_KEY,
//   authDomain: process.env.REACT_APP_AUTH_DOMAIN,
//   projectId: process.env.REACT_APP_PROJECT_ID,
//   storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
//   messagingSenderId: process.env.REACT_APP_MESSAGIN_ID,
//   appId: process.env.REACT_APP_APP_ID,
//   databaseURL : process.env.REACT_APP_DATABASE_URL
// };
const firebaseConfig = {
  apiKey: "AIzaSyBFoddpLfQEeKDQj3UvG9UXLCUsX_DBiuU",
  authDomain: "gratia-2cdd0.firebaseapp.com",
  projectId: "gratia-2cdd0",
  storageBucket: "gratia-2cdd0.appspot.com",
  messagingSenderId: "136156569760",
  appId: "1:136156569760:web:f1d37bb4aca89f8fe5e9c5",
  databaseURL : "https://gratia-2cdd0.firebaseio.com"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);
export default app;
export const auth = getAuth(app);
export const dbService = getFirestore(app);