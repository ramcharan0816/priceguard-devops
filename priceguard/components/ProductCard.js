export default function ProductCard({ product, onRemove }) {
  const belowTarget = product.current_price <= product.target_price;

  return (
    <div className="card">
      <div className="card-row">
        <div>
          <div className="product-name">{product.name}</div>
          <div className="target-line">TARGET ₹{product.target_price}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className={`price mono ${belowTarget ? "below-target" : "above-target"}`}>
            ₹{product.current_price}
          </div>
          <button className="remove-btn" onClick={() => onRemove(product.id)}>
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
