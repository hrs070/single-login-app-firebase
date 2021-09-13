import React, { useState } from 'react';

import { getAuth, signOut, onAuthStateChanged, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc, onSnapshot, getFirestore } from "firebase/firestore";

export default function Main() {

    const db = getFirestore();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [authenticatedUser, setAuthenticatedUser] = useState(false);
    const currentUserAgent = navigator.userAgent;
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [uid, setUid] = useState("");
    const [googleResult, setGoogleResult] = useState(null);


    const auth = getAuth();
    const provider = new GoogleAuthProvider();

    // onAuthStateChanged(auth, (user) => {
    //     if (user) {
    //         setEmail(user.email)
    //         setName(user.displayName)
    //         setUid(user.uid);

    //         setIsLoggedIn(true);
    //         setAuthenticatedUser(true);
    //     } else {
    //         setIsLoggedIn(false);
    //         setAuthenticatedUser(false);
    //     }
    // });

    function handleSignIn() {
        signInWithPopup(auth, provider)
            .then((result) => {
                setGoogleResult(result);
                const user = result.user;
                setEmail(user.email)
                setName(user.displayName)
                setUid(user.uid);
                verifySignIn(name, email, result)
            })
            .catch((error) => {
                console.log("Can not Sign In:", error);
            });
    }


    function verifySignIn(name, email, result) {
        const database = onSnapshot(doc(db, "users", uid), (doc) => {
            console.log("current", doc.data());
        }, (error) => {
            console.log("db error:", error);
        });
        if (database() === undefined) {
            console.log("case:1", database(), name, email)
            setDoc(doc(db, "users", uid), {
                name: name,
                email: email,
                userAgent: currentUserAgent
            });
            GoogleAuthProvider.credentialFromResult(result);
            setIsLoggedIn(true);
            setAuthenticatedUser(true);
        }
        else if (database().userAgent === currentUserAgent) {
            console.log("case:2", database().userAgent);
            GoogleAuthProvider.credentialFromResult(result);
            setIsLoggedIn(true);
            setAuthenticatedUser(true);
        }
        else if (database().userAgent !== currentUserAgent) {
            console.log("case:3", database().userAgent, currentUserAgent);
            setIsLoggedIn(true);
            setAuthenticatedUser(false);

        }
    }

    function handleLogout() {
        signOut(auth).then(() => {
            console.log("Sign out");
        })
        setIsLoggedIn(false);
    }
    function handleLogoutOthers() {

    }


    return (
        <div className="main">
            {!isLoggedIn ?
                <button className="button googleButton" onClick={handleSignIn}  >
                    Sign In with Google
                </button>

                :

                <div className="user">
                    {authenticatedUser ?
                        <div className="authenticated-user">
                            <p className="login-success">Signed In</p>
                            <div className="user-details">
                                <div>
                                    <p className="small-text">Name</p>
                                    <p className="user-name">{name}</p>
                                </div>
                                <div>
                                    <p className="small-text">Email</p>
                                    <p className="user-name">{email}</p>
                                </div>
                            </div>
                            <button className="button button-reject" onClick={handleLogout}>Log Out</button>
                        </div>

                        :

                        <div className="authenticated-user">
                            <p className="login-success">Can not Sign In</p>
                            <div className="user-details">
                                <p className="confirm-signout-others-msg">{name}, you are logged in somewhere else. Log out and Sign In here instead ?</p>
                            </div>
                            <button className="button button-reject" onClick={handleLogoutOthers}>Log Out Others</button>
                        </div>
                    }
                </div>
            }
        </div>
    )
}