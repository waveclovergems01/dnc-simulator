import React from "react";

interface CreateItemPlaceholderProps {
  title: string;
}

const CreateItemPlaceholder: React.FC<CreateItemPlaceholderProps> = ({
  title,
}) => {
  return (
    <div
      style={{
        border: "1px solid #374151",
        borderRadius: "8px",
        backgroundColor: "#0f172a",
        padding: "16px",
        color: "#94a3b8",
        fontSize: "13px",
      }}
    >
      {title} form is not ready yet.
    </div>
  );
};

export default CreateItemPlaceholder;