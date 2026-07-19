const Spinner = ({ size = 24 }) => (
  <div className="spinner" style={{ width: size, height: size }} aria-label="Loading">
    <div className="spinner-ring" />
  </div>
);

export default Spinner;
