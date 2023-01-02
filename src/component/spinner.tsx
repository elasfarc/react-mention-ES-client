import { ColorRing } from "react-loader-spinner";

function Spinner() {
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <ColorRing
        visible={true}
        height="80"
        width="80"
        ariaLabel="blocks-loading"
        colors={["#e15b64", "#f47e60", "#f8b26a", "#abbd81", "#849b87"]}
      />
    </div>
  );
}

export default Spinner;
