import React from "react";

const LoadingEft = () => {
    const containerStyle = {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "320px",              // Adjust width as needed
        height: "120px",            // Adjust height as needed
        margin: "0 auto",          // Center horizontally
        backgroundColor: "#f9f9f9", // Background color
        color: "#51545D",           // Text color
        fontSize: "14pt",           // Font size
        fontWeight: 400, 
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", // Add box shadow
      };

  return (
    <div style={containerStyle}>
        <div className="loading-text">
            <span className="dots">
                <span>.</span>
                <span>.</span>
                <span>.</span>
            </span>
            proceed to payment
        </div>
    </div>
  );
};

export default LoadingEft;
