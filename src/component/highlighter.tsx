import { Text } from "../types/api";

function Highlighter({ paragraphes }: { paragraphes: Text[] }) {
  return (
    <div
      style={{
        overflowWrap: "break-word",
        whiteSpace: "pre-wrap",
        position: "relative",
        width: "400px",
        border: "1px solid transparent",
        padding: "2px",
        color: "transparent",
        lineHeight: "2em",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {paragraphes.map((paragraph, index) => (
        <span
          key={index}
          style={{
            backgroundColor: `${
              paragraph.label === "employee"
                ? "#ff000063"
                : paragraph.label === "customer"
                ? "#61dafb63"
                : "none"
            } `,
            position: "relative",
            zIndex: 1,
          }}
        >
          {paragraph.content}
        </span>
      ))}
    </div>
  );
}

export default Highlighter;
