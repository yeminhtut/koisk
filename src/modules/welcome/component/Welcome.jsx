import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from "react-router-dom";
import appActions from '../../../appActions';

const WelcomeComponent = () => {
    let navigate = useNavigate();
    const dispatch = useDispatch()

    useEffect(() => {
        dispatch(appActions.STORE_GET_REQUEST(1020));
    }, [])

    const handleClick = () => {
        navigate("/item-listing", { replace: true });
    }
    return (
        <div className="background">
            <div className="layer"></div>
            <div
                className="flex flex-column justify-center"
                style={{ zIndex: 1 }}
            >
                <div className="mb-8 flex justify-center">
                    <img
                        src={`${process.env.PUBLIC_URL}/assets/icons/harland-logo.png`}
                        alt=""
                        style={{ maxWidth: '300px' }}
                    />
                </div>
                <div>
                    <button className="start-button" style={{ width: '400px'}} onClick={handleClick}>touch to start</button>
                </div>
            </div>
        </div>
    );
};

export default WelcomeComponent