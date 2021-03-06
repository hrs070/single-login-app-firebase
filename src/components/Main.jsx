import React, { useState, useEffect } from 'react';

import { getAuth, signOut, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getFirestore, getDoc, updateDoc, onSnapshot } from "firebase/firestore";

export default function Main() {

    const db = getFirestore();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [authenticatedUser, setAuthenticatedUser] = useState(false);
    const [copyName, setCopyName] = useState();
    const [copyEmail, setCopyEmail] = useState();
    const [copyUid, setCopyUid] = useState();
    const [copyResult, setCopyResult] = useState();
    const currentUserAgent = navigator.userAgent;

    const auth = getAuth();
    const provider = new GoogleAuthProvider();

    useEffect(() => {
        const storage = JSON.parse(localStorage.getItem("singleLoginWithFirebase"));
        if (storage !== null) {
            const result = storage?.result;
            const uid = storage?.uid;
            const name = storage?.name;
            const email = storage?.email;
            verifySignIn(name, email, result, uid);
        }

    }, [])

    async function listenChanges(uid) {
        let currentData = {};
        const unsub = onSnapshot(doc(db, "users", uid), (doc) => {
            currentData = doc.data().userAgent;
            console.log("Current data: ", currentData);
            if (currentData !== currentUserAgent) {
                setAuthenticatedUser(false);
            }
        });
    }

    function handleSignIn() {
        signInWithPopup(auth, provider)
            .then((result) => {
                const user = result.user;
                const uid = user.uid;
                const name = user.displayName;
                const email = user.email;
                console.log(uid);
                verifySignIn(name, email, result, uid)
            })
            .catch((error) => {
                console.log("Can not Sign In:", error);
            });
    }

    async function verifySignIn(name, email, result, uid) {

        let fetchedUser = {};
        const docRef = doc(db, "users", uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            fetchedUser = docSnap.data();
        } else {
            console.log("No such document!");
            fetchedUser = undefined;
        }

        if (fetchedUser === undefined || fetchedUser.userAgent === "") {
            setDoc(doc(db, "users", uid), {
                name: name,
                email: email,
                uid: uid,
                userAgent: currentUserAgent
            });
            GoogleAuthProvider.credentialFromResult(result);
            setIsLoggedIn(true);
            setAuthenticatedUser(true);
        }
        else if (fetchedUser.userAgent === currentUserAgent) {
            GoogleAuthProvider.credentialFromResult(result);
            setIsLoggedIn(true);
            setAuthenticatedUser(true);
        }
        else if (fetchedUser.userAgent !== currentUserAgent) {
            setIsLoggedIn(true);
            setAuthenticatedUser(false);
        }

        localStorage.setItem("singleLoginWithFirebase", JSON.stringify({ name: name, email: email, uid: uid, result: result }));
        listenChanges(uid);
        setCopyName(name);
        setCopyEmail(email);
        setCopyUid(uid);
        setCopyResult(result);
    }

    async function handleLogout() {
        let fetchedUser = {};
        const docRef = doc(db, "users", copyUid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            fetchedUser = docSnap.data();
        } else {
            console.log("No such document!");
            fetchedUser = undefined;
        }
        if (fetchedUser.userAgent === currentUserAgent) {
            await updateDoc(doc(db, "users", copyUid), {
                userAgent: ""
            });
        }
        signOut(auth).then(() => {
        })
        localStorage.removeItem("singleLoginWithFirebase");
        setIsLoggedIn(false);
    }

    async function handleLogoutOthers() {
        await updateDoc(doc(db, "users", copyUid), {
            userAgent: currentUserAgent
        });
        GoogleAuthProvider.credentialFromResult(copyResult);
        setIsLoggedIn(true);
        setAuthenticatedUser(true);
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
                                    <p className="user-name">{copyName}</p>
                                </div>
                                <div>
                                    <p className="small-text">Email</p>
                                    <p className="user-name">{copyEmail}</p>
                                </div>
                            </div>
                            <button className="button button-reject" onClick={handleLogout}>Log Out</button>
                        </div>

                        :

                        <div className="authenticated-user">
                            <p className="login-success">Can not Sign In</p>
                            <div className="user-details">
                                <p className="confirm-signout-others-msg">{copyName}, you are logged in somewhere else. Log out and Sign In here instead ?</p>
                            </div>
                            <div className="btn-div">
                                <button className="button button-reject" onClick={handleLogoutOthers}>Yes !</button>
                                <button className="button googleButton" onClick={handleSignIn}  >Sign In with Google</button>
                            </div>
                        </div>
                    }
                </div>
            }
        </div>
    )
}