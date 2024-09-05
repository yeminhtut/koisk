import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { classNames } from 'primereact/utils';

// Validation schema
const validationSchema = Yup.object().shape({
    storeId: Yup.string().required('Store ID is required'),
    terminalId: Yup.string().required('Terminal ID is required'),
    category: Yup.string().required('Category is required'),
});

const Setting = () => {
    const initialValues = {
        storeId: '',
        terminalId: '',
        category: '',
    };

    const categoryOptions = [
        { label: 'Category 1', value: 'category1' },
        { label: 'Category 2', value: 'category2' },
        { label: 'Category 3', value: 'category3' },
    ];

    const onSubmit = (values, { setSubmitting, resetForm }) => {
        // Store form values in local storage
        localStorage.setItem('formValues', JSON.stringify(values));

        // Reset the form
        resetForm();

        // Stop the submitting state
        setSubmitting(false);

        // You can add more actions here, like displaying a success message
        alert('Form submitted and data saved to local storage!');
    };

    const getFormErrorMessage = (name, errors, touched) => {
        return errors[name] && touched[name] && (
            <small className="p-error">{errors[name]}</small>
        );
    };

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
        >
            {({ errors, touched, isSubmitting, setFieldValue }) => (
                <Form>
                    <div className="p-field">
                        <label htmlFor="storeId">Store ID</label>
                        <Field
                            name="storeId"
                            render={({ field }) => (
                                <InputText
                                    id="storeId"
                                    {...field}
                                    className={classNames({ 'p-invalid': errors.storeId && touched.storeId })}
                                />
                            )}
                        />
                        {getFormErrorMessage('storeId', errors, touched)}
                    </div>

                    <div className="p-field">
                        <label htmlFor="terminalId">Terminal ID</label>
                        <Field
                            name="terminalId"
                            render={({ field }) => (
                                <InputText
                                    id="terminalId"
                                    {...field}
                                    className={classNames({ 'p-invalid': errors.terminalId && touched.terminalId })}
                                />
                            )}
                        />
                        {getFormErrorMessage('terminalId', errors, touched)}
                    </div>

                    <div className="p-field">
                        <label htmlFor="category">Category</label>
                        <Field
                            name="category"
                            render={({ field }) => (
                                <Dropdown
                                    id="category"
                                    {...field}
                                    options={categoryOptions}
                                    onChange={(e) => setFieldValue('category', e.value)}
                                    placeholder="Select a Category"
                                    className={classNames({ 'p-invalid': errors.category && touched.category })}
                                />
                            )}
                        />
                        {getFormErrorMessage('category', errors, touched)}
                    </div>

                    <Button type="submit" label="Submit" icon="pi pi-check" loading={isSubmitting} />
                </Form>
            )}
        </Formik>
    );
};

export default Setting;
