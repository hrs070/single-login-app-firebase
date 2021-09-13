import React from 'react';
import ReactDOM from 'react-dom';
import App from './components/App.jsx';

import { initializeApp } from "firebase/app";


const firebaseConfig = {
    apiKey: "AIzaSyAIdOpeGwznuGnLXWFTsAoyK6B1jE-3RqI",
    authDomain: "single-login-app-firebase.firebaseapp.com",
    projectId: "single-login-app-firebase",
    storageBucket: "single-login-app-firebase.appspot.com",
    messagingSenderId: "810121660608",
    appId: "1:810121660608:web:38b2b6599e3c4321380525"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);


ReactDOM.render(<App />, document.getElementById('root'))