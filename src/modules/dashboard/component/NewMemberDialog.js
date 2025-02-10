import React, { useState, useEffect, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from 'primereact/inputnumber';
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import axios from "axios";
import DobInput from "./DobInput";

const {
    END_POINT: URL,
    AuthorizationHeader: token
} = window?.config || {};

const NewMemberDialog = ({ visible, onHide, handleNewMember }) => {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        dob: "",
        mobileno: "",
        countryCode: "+63",
        phNumber: ""
    });
    const toast = useRef(null);
    const [errors, setErrors] = useState({});
    const [keyboardOpen, setKeyboardOpen] = useState(false);

    
    useEffect(() => {
        const handleResize = () => {
            if (window.innerHeight < 600) { // Adjust based on tablet screen height
                setKeyboardOpen(true);
            } else {
                setKeyboardOpen(false);
            }
        };
    
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });

        // Clear errors for the field being modified
        if (errors[name]) {
            setErrors({
                ...errors,
                [name]: "",
            });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.firstName.trim()) {
            newErrors.firstName = "First name is required.";
        }
        if (!formData.lastName.trim()) {
            newErrors.lastName = "Last name is required.";
        }
        if (!formData.phNumber.trim()) {
            newErrors.mobileno = "Mobile number is required.";
        }
        if (!formData.email.trim()) {
            newErrors.email = "Email address is required.";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Email is not valid.";
        }
        return newErrors;
    };

    const handleSubmit = async () => {
        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
    
        // Prepare the data for the API call
        const apiData = {
            userid: "",
            signupby: "email",
            firstname: formData.firstName,
            lastname: formData.lastName,
            mobileno: `${formData.countryCode} ${formData.phNumber}`,
            emailid: formData.email,
            dateofbirth: formData.dob, // Ensure DOB is formatted as 'dd-MM-yyyy'
        };
    
        const config = {
            method: "post",
            url: `${URL}/crm/v1/member/save`,
            headers: {
                Authorization: token,
                "Content-Type": "application/json",
            },
            data: JSON.stringify(apiData),
        };
    
        try {
            const response = await axios.request(config);
    
            switch (response.status) {
                case 200:
                    handleNewMember(response.data);
                    onHide();
                    break;
    
                case 206:
                    toast.current.show({
                        severity: "contrast",
                        summary: "Error",
                        detail: response?.data?.message || "Partial success",
                        life: 10000,
                    });
                    onHide();
                    break;
    
                default:
                    handleNewMember(); // Optional fallback behavior
                    break;
            }
        } catch (error) {
            console.error("Error saving member:", error);
            alert("An error occurred while saving the member. Please try again.");
            onHide();
        }
    };
    

    const handleNumberChange = (e) => {
        const { name, value } = e.target;

        // Allow only numeric input
        const numericValue = value.replace(/[^0-9]/g, "");

        setFormData({
            ...formData,
            [name]: numericValue
        });
    };

    const renderFooter = () => (
        <div className="w-full">
            <Button
                label="done"
                onClick={handleSubmit}
                className="p-button-custom w-full"
                style={{
                    backgroundColor: "#51545D",
                    color: "#FFF",
                    fontSize: "18px",
                }}
            />
        </div>
    );
    return (
        <>
            <Toast ref={toast} />
            <Dialog
                className={`signup-dialog`}
                header={
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <span className="f-16pt">
                            order as a new member
                        </span>
                    </div>
                }
                style={{ width: '40vw'}}
                visible={visible}
                footer={renderFooter()}
                onHide={onHide}
            >
            <div className="p-fluid hnh-dialog">
                <div className="flex">
                    <div className="p-field mr-2" style={{ width: "50%" }}>
                        <label htmlFor="firstName">first name</label>
                        <InputText
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className={errors.firstName ? "p-invalid" : ""}
                        />
                        {errors.firstName && (
                            <small className="p-error">
                                {errors.firstName}
                            </small>
                        )}
                    </div>
                    <div className="p-field" style={{ width: "50%" }}>
                        <label htmlFor="lastName">last name</label>
                        <InputText
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className={errors.lastName ? "p-invalid" : ""}
                        />
                        {errors.lastName && (
                            <small className="p-error">{errors.lastName}</small>
                        )}
                    </div>
                </div>

                <div className="p-field">
                    <label htmlFor="email">email address</label>
                    <InputText
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={errors.email ? "p-invalid" : ""}
                    />
                    {errors.email && (
                        <small className="p-error">{errors.email}</small>
                    )}
                </div>

                <div className="p-field">
                    <label htmlFor="dob">date of birth (optional)</label>
                    <DobInput />
                </div>
                <div className="p-field">
                    <label htmlFor="mobileno">mobile no.</label>
                    <div className="flex">
                        <InputText
                            className="mr-2 col-4"
                            id="countryCode"
                            name="countryCode"
                            value={formData.countryCode}
                            onChange={handleNumberChange}
                            maxLength={3} // Optional: Limit the number of digits
                            placeholder="+63"
                        />
                        <InputText
                            id="phNumber"
                            name="phNumber"
                            value={formData.phNumber}
                            onChange={handleNumberChange}
                            maxLength={15} // Optional: Limit the number of digits
                        />
                    </div>
                    
                    {errors.mobileno && (
                        <small className="p-error">{errors.mobileno}</small>
                    )}
                </div>
            </div>
        </Dialog>
        </>
        
    );
};

export default NewMemberDialog;
