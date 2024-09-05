import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import storage from '../../../utils/storage';

const AccessControl = (props) => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = storage.get('session');
        if (!token) {
            navigate('/', { replace: true });
        }
    }, [navigate]);

    return React.cloneElement(props.children);
};

export default AccessControl;
