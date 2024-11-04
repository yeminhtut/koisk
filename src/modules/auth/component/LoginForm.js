import React from "react";
import { useFormik } from "formik";
import classNames from "classnames";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Button } from "primereact/button";
import ToshibaIcon from "../../../assets/icons/toshiba-01.svg";

const LoginForm = (props) => {
    const { onClickLoginBtn, error } = props;

    const formik = useFormik({
        initialValues: {
            userid: "",
            password: ""
        },
        validate: (data) => {
            let errors = {};

            if (!data.userid) {
                errors.userid = "User id is required.";
            }

            if (!data.password) {
                errors.password = "Password is required.";
            }

            return errors;
        },
        enableReinitialize: true,
        onSubmit: (data) => {
            onClickLoginBtn(data);
        },
    });

    const isFormFieldValid = (name) =>
        !!(formik.touched[name] && formik.errors[name]);

    const getFormErrorMessage = (name) => {
        return (
            isFormFieldValid(name) && (
                <small className="p-error">{formik.errors[name]}</small>
            )
        );
    };

    return (
        <div className="p-4 w-full">
            <div>
            <span className="text-900 text-2xl font-medium mb-4 block text-center mb-5">
                Login
            </span>
            <span className="text-600 font-medium line-height-3 block text-center mb-5">
                Please login to your account
            </span>
            <form onSubmit={formik.handleSubmit} className="p-fluid">
                <div className="mb-5">
                    <span className="p-float-label">
                        <InputText
                            id="userid"
                            name="userid"
                            value={formik.values.userid}
                            onChange={formik.handleChange}
                            className={classNames({
                                "p-invalid": isFormFieldValid("userid"),
                            })}
                        />
                        <label
                            htmlFor="userid"
                            className={classNames({
                                "p-error": isFormFieldValid("usrid"),
                            })}
                        >
                            User Name*
                        </label>
                    </span>
                    {getFormErrorMessage("userid")}
                </div>
                <div className="mb-5">
                    <span className="p-float-label">
                        <Password
                            id="password"
                            name="password"
                            value={formik.values.password}
                            onChange={formik.handleChange}
                            toggleMask
                            className={classNames({
                                "p-invalid": isFormFieldValid("password"),
                            })}
                        />
                        <label
                            htmlFor="password"
                            className={classNames({
                                "p-error": isFormFieldValid("password"),
                            })}
                        >
                            Password*
                        </label>
                    </span>
                    {getFormErrorMessage("password")}
                </div>

                <Button type="submit" label="Submit" />
            </form>
            {error && (
                    <div className="invalid-feedback-log pv-20">{error.message}</div>
                  )}
            <div className="col-12">
                <div className="text-center mb-5 mt-5 flex align-items-center justify-content-center flex-column">
                    <img
                        src={ToshibaIcon}
                        style={{ width: "84px" }}
                        alt="logo"
                    />
                    <span className="font-medium text-500 mb-3">
                        2024 © Toshiba Global Commerce Solutions
                    </span>
                </div>
            </div>
            </div>
        </div>
    );
};

export default LoginForm;
