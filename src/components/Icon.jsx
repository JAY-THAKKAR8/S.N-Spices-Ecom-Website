// Material Symbols icon. size in px.
export default function Icon({ name, size = 20, fill = false, className = '' }) {
  return (
    <span aria-hidden="true" className={`icon ${fill ? 'icon-fill' : ''} ${className}`} style={{ fontSize: size }}>
      {name}
    </span>
  );
}
