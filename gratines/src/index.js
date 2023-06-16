import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import "css/base.css";

const root = ReactDOM.createRoot(document.getElementById('root'));

const link = document.createElement("link");
// link.href = "https://fonts.googleapis.com/icon?family=Material+Icons";
link.href = "https://fonts.googleapis.com/css?family=Material+Icons|Material+Icons+Outlined|Material+Icons+Two+Tone|Material+Icons+Round|Material+Icons+Sharp";
link.rel = "stylesheet";
document.head.appendChild(link)


root.render(
  <App />,
  document.getElementById('root')
);

// root.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );