import React from 'react';

const ImageIcon = ({iconName, style}) => {
    return (
        <img
            className='mr-2'
            title="refresh"
            src={`${process.env.PUBLIC_URL}/assets/icons/${iconName}`}
            alt="refresh"
            style={style}
        />
    );
};

export default ImageIcon;
