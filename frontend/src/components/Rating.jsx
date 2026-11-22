// Звёзды рейтинга. Для экранного диктора — текст «Рейтинг 4,8 из 5».
export default function Rating({ value, count }) {
  const label = `Рейтинг ${String(value).replace('.', ',')} из 5`;
  return (
    <span className="rating">
      <i className="bi bi-star-fill rating__star" aria-hidden="true"></i>
      <span className="visually-hidden">{label}</span>
      <strong aria-hidden="true">{String(value).replace('.', ',')}</strong>
      {count !== undefined && <span className="rating__count">({count} отз.)</span>}
    </span>
  );
}
