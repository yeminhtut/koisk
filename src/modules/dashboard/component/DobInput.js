import React, { useState } from 'react';
import { InputText } from 'primereact/inputtext';

const DobInput = () => {
    const [dob, setDob] = useState('');
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\/(0[1-9]|1[0-2])\/\d{4}$/;
        let value = e.target.value.replace(/\D/g, ''); // Remove any non-numeric characters
        if (value.length > 2) {
            value = value.slice(0, 2) + '/' + value.slice(2);
        }
        if (value.length > 5) {
            value = value.slice(0, 5) + '/' + value.slice(5);
        }
        if (value.length > 10) {
            value = value.slice(0, 10); // Limit to 10 characters
        }
        setDob(value);
        if (value && !dateRegex.test(value)) {
            setError('Invalid date format. Use dd/mm/yyyy.');
        } else {
            setError('');
        }
    };

    return (
        <div>
            <InputText
                id="dob"
                value={dob}
                onChange={handleInputChange}
                placeholder="dd/mm/yyyy"
                style={{
                    width: '100%',
                }}
                maxLength={10} // Restrict to 10 characters
            />
            {error && (
                <span style={{ color: 'red', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                    {error}
                </span>
            )}
        </div>
    );
};

export default DobInput;
