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
                    <div className="col-lg-6 col-xs-12 leftSpace" />
                    <div className="col-lg-6 col-xs-12 noMargin noPadding">
                        <LoginForm onClickLoginBtn={handleLogin} error={error} />
                    </div>
                </div>
            </div>
        )
    }

    return renderLoginForm();
};

export default Login;
