import React from "react";

const NameDisplay = () => {
    const userName = localStorage.getItem("userName");
    return <span style={{ paddingRight: "1em" }}>Hi, {`${userName} `}</span>;
};

export default NameDisplay;
