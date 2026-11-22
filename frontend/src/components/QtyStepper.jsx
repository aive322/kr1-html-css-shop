// Счётчик количества «− 1 +».
export default function QtyStepper({ value, onChange, min = 1, max = 10, label = 'Количество', size = '' }) {
  return (
    <div className={`qty ${size ? `qty--${size}` : ''}`} role="group" aria-label={label}>
      <button type="button" className="qty__btn" onClick={() => onChange(value - 1)} disabled={value <= min} aria-label="Уменьшить количество">
        <i className="bi bi-dash-lg" aria-hidden="true"></i>
      </button>
      <span className="qty__value" aria-live="polite" key={value}>{value}</span>
      <button type="button" className="qty__btn" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Увеличить количество">
        <i className="bi bi-plus-lg" aria-hidden="true"></i>
      </button>
    </div>
  );
}
