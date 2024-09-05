import React, { useState, useEffect } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';

const DynamicInput = (props) => {
    const { fieldArr, handleChange } = props;
    const [formFields, setFormFields] = useState(
        fieldArr.length > 0 ? fieldArr : [{ field: '', value: '' }],
    );

    useEffect(() => {
        if (fieldArr.length > 0) {
            setFormFields(fieldArr);
        }
    }, [fieldArr]);

    const handleFormChange = (event, index) => {
        let data = [...formFields];
        data[index][event.target.name] = event.target.value;
        setFormFields(data);
        handleChange(data);
    };

    const addFields = () => {
        let object = {
            field: '',
            value: '',
        };
        setFormFields([...formFields, object]);
    };

    const removeFields = (index) => {
        let data = [...formFields];
        data.splice(index, 1);
        setFormFields(data);
    };
    return (
        <>
            {formFields.map((form, index) => {
                return (
                    <div className="grid my-2" key={index}>
                        <div className="col-5">
                            <InputText
                                name="field"
                                onChange={(event) =>
                                    handleFormChange(event, index)
                                }
                                value={form.field}
                                placeholder="Field"
                                className="mr-2"
                            />
                        </div>
                        <div className="col-5">
                            <InputText
                                name="value"
                                onChange={(event) =>
                                    handleFormChange(event, index)
                                }
                                value={form.value}
                                placeholder=""
                                className="mr-2"
                            />
                        </div>
                        <div className="col-2">
                            <div className="flex">
                                {formFields.length - 1 == index && (
                                    <Button
                                        icon="pi pi-plus"
                                        className="p-button-rounded mr-2"
                                        aria-label="Add"
                                        onClick={addFields}
                                        type="button"
                                    />
                                )}

                                <Button
                                    icon="pi pi-times"
                                    className="p-button-rounded p-button-danger"
                                    aria-label="Remove"
                                    onClick={removeFields}
                                    type="button"
                                />
                            </div>
                        </div>
                    </div>
                );
            })}
        </>
    );
};

export default DynamicInput;
