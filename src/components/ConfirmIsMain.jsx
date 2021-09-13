import React from 'react';

export default function ConfirmIsMain() {

    function handleConfirm() {
        window.location.reload();
    }

    return (
        <div className="confirm-is-main">
            <p className="confirm-is-main-para">
                This app can only be used in one Tab at a time. Would you like to use the current tab instead ?
            </p>
            <div className="confirm-is-main-buttondiv">
                <button className="button button-confirm" onClick={handleConfirm}>Yes</button>
            </div>
        </div>
    )
}