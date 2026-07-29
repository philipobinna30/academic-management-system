import React from "react";

/**
 * Reusable error display component
 * Works for API errors, form validation, and system messages
 */

const ErrorMessage = ({ message, type = "error" }) => {
  if (!message) return null;

  const styles = {
    error: {
      background: "#fee2e2",
      color: "#b91c1c",
      border: "1px solid #fecaca",
    },
    warning: {
      background: "#fef3c7",
      color: "#92400e",
      border: "1px solid #fde68a",
    },
    info: {
      background: "#dbeafe",
      color: "#1e40af",
      border: "1px solid #bfdbfe",
    },
  };

  return (
    <div
      style={{
        padding: "10px 12px",
        borderRadius: "6px",
        margin: "10px 0",
        fontSize: "14px",
        ...styles[type],
      }}
    >
      {message}
    </div>
  );
};

export default ErrorMessage;