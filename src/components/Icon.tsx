// Material Symbols icon. size in px.
interface IconProps {
  name: string;
  size?: number;
  fill?: boolean;
  className?: string;
}

export default function Icon({ name, size = 20, fill = false, className = '' }: IconProps) {
  return (
    <span aria-hidden="true" className={`icon ${fill ? 'icon-fill' : ''} ${className}`} style={{ fontSize: size }}>
      {name}
    </span>
  );
}
