import React, { useState } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";
import axios from "axios";
import DobInput from "./DobInput";

const {
  END_POINT: URL,
  AuthorizationHeader: token,
  MemberLookUp: memFunc,
} = window?.config || {};

const NewMemberDialog = ({ visible, onHide, handleNewMember }) => {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        dob: "",
        mobile: "",
    });

    const [errors, setErrors] = useState({});

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
          mobileno: formData.mobile,
          emailid: formData.email,
          dateofbirth: formData.dob, // Ensure DOB is formatted as 'dd-MM-yyyy'
      };
  
      const config = {
          method: "post",
          url: `${URL}/crm/v1/member/save`,
          headers: {
              Authorization: token,
              "Content-Type": "application/json"
          },
          data: JSON.stringify(apiData),
      };
  
      try {
          const response = await axios.request(config);
          if (response.status == 200) {
            handleNewMember(response.data)
          }
          else {
            handleNewMember()
          }
          // Optionally show a success message or perform further actions
          // alert("Member saved successfully!");
          onHide();
      } catch (error) {
          handleNewMember()
          onHide()
          //alert("An error occurred while saving the member. Please try again.");
      }
  };

    const renderFooter = () => (
        <div className="w-full">
            <Button
                label="Done"
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
        <Dialog
            header={
                <div style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ marginLeft: "8px" }}>
                        order as a new member
                    </span>
                </div>
            }
            visible={visible}
            style={{ width: "40vw" }}
            footer={renderFooter()}
            onHide={onHide}
        >
            <div className="p-fluid hnh-dialog">
                <div className="flex">
                    <div className="p-field mr-2" style={{ width: '50%'}}>
                        <label htmlFor="firstName">first name</label>
                        <InputText
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className={errors.firstName ? "p-invalid" : ""}
                        />
                        {errors.firstName && (
                            <small className="p-error">{errors.firstName}</small>
                        )}
                    </div>
                    <div className="p-field" style={{ width: '50%'}}>
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
                    <label htmlFor="mobile">mobile no.</label>
                    <InputNumber
                        id="mobile"
                        name="mobile"
                        value={formData.mobile}
                        onChange={(e) =>
                            handleChange({
                                target: { name: "mobile", value: e.value },
                            })
                        }
                    />
                </div>
            </div>
        </Dialog>
    );
};

export default NewMemberDialog;
