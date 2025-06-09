// src/components/common/Loader.jsx
import "../../styles/loader.css";

const Loader = () => {
  return (
     <div className="loader-container">
      <div className="loader-ring-outer">
        <div className="loader-ring-inner"></div>
      </div>
    </div>
  );
};

export default Loader;
