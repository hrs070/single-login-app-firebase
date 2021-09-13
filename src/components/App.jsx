import React from 'react';
import useIsMainWindow from './useIsMainWindow.js';
import Header from './Header.jsx';
import Main from './Main.jsx';
import ConfirmIsMain from './ConfirmIsMain.jsx';


export default function App() {
    const isMain = useIsMainWindow();

    return (
        <div className="app">
            <Header />
            <div className="container">
                {isMain ?
                    <Main /> :
                    <ConfirmIsMain />}
            </div>

        </div>
    )
}