import React, { useState } from "react";
import axios from "axios";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Divider } from "primereact/divider";
import { Button } from "primereact/button";

const MemberDialog = ({
    visible,
    closeDialog,
    handleExistingMember,
    handleSkip,
    handleSignUpLink,
}) => {
    const [memberEmail, setMemberEmail] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const handleChangeEmail = (e) => {
        setMemberEmail(e.target.value);
        setErrorMessage(""); // Clear error when user types
    };

    const handleMember = () => {
        if (!memberEmail) {
            setErrorMessage("Please enter an email address.");
            return;
        }

        let config = {
            method: "get",
            url: `${URL}/crm/v1/member/search?search_field=emailid&search_condi=eq&search_value=${memberEmail}`,
            headers: {
                Authorization: "test",
            },
        };

        axios
            .request(config)
            .then((response) => {
                if (response.status === 200 && response.data?.length > 0) {
                    handleExistingMember(response.data[0]);
                } else {
                    setErrorMessage("Email address not found!");
                }
            })
            .catch((error) => {
                setErrorMessage("An error occurred. Please try again.");
            });
    };

    return (
        <Dialog
            visible={visible}
            onHide={closeDialog}
            header="Place order with an account"
            style={{ width: "350px" }}
            className="order-dialog"
            draggable={false}
            modal
        >
            <div className="order-form-container">
                <label htmlFor="email" className="email-label mb-2">
                    Email Address
                </label>
                <InputText
                    id="email"
                    className={`email-input w-full mt-2 ${
                        errorMessage ? "p-invalid" : ""
                    }`}
                    placeholder="ja12_123@gmail.com"
                    value={memberEmail}
                    onChange={handleChangeEmail}
                />
                {errorMessage && (
                    <small className="p-error">{errorMessage}</small>
                )}
                <Button
                    type="button"
                    className="w-full mt-2"
                    style={{
                        backgroundColor: "#707070",
                        color: "#FFF",
                        fontSize: "18px",
                    }}
                    onClick={handleMember}
                    label="done"
                />
                <Divider align="center">
                    <span>OR</span>
                </Divider>
                <p className="signup-text text-center">
                    <span className="signup-link" onClick={handleSignUpLink}>
                        Sign up
                    </span>
                </p>
                <p className="skip-link text-right cursor-pointer">
                    <span onClick={handleSkip}>skip</span>
                </p>
            </div>
        </Dialog>
    );
};

export default MemberDialog