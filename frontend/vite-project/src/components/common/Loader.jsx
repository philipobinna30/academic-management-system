import React from "react";

/**
 * Reusable loading spinner component
 * Used for API calls, page loading, and suspense states
 */

const Loader = ({ message = "Loading..." }) => {
  return (
    <div style={styles.wrapper}>
      
      {/* Spinner */}
      <div style={styles.spinner} />

      {/* Message */}
      <p style={styles.text}>{message}</p>

      {/* Spinner animation */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

/* ================= STYLES ================= */

const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "200px",
    gap: "10px",
  },

  spinner: {
    width: "40px",
    height: "40px",
    border: "4px solid #e5e7eb",
    borderTop: "4px solid #3b82f6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },

  text: {
    color: "#6b7280",
    fontSize: "14px",
  },
};

export default Loader;