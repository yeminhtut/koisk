import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoginForm from "./LoginForm";
import { useDispatch, useSelector } from 'react-redux';
import appActions from '../../../appActions';

const Login = () => {
    let navigate = useNavigate();
    const dispatch = useDispatch();

    const authToken = useSelector((state) => state.auth.authToken);
    const error = useSelector((state) => state.auth.error);

    useEffect(() => {
        if (authToken) {
            navigate("/", { replace: true });
        }
    }, [authToken])

    const handleLogin = (data) => {
        dispatch(appActions.AUTH_CREATE_REQUEST(data));
    }

    const renderLoginForm = () => {
        return (
            <div className="h-100">
                <div className="grid h-100 mt-0">
                    <div className="col-12 xl:col-6 left-space leftSpace" />
                    <div className="col-12 xl:col-6 flex align-items-center justify-content-center">
                        <LoginForm onClickLoginBtn={handleLogin} error={error} />
                    </div>
                </div>
            </div>
        )
    }

    return renderLoginForm();
};

export default Login;
