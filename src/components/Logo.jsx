import { Link } from 'react-router-dom';

// Text logo. Swap the SN mark for the client's real logo file when you get it.
export default function Logo({ small = false }) {
  return (
    <Link to="/" className="flex items-center gap-2 shrink-0" aria-label="S.N Spices home">
      <span className="grid place-items-center w-9 h-9 rounded-full bg-primary text-on-primary font-serif text-[15px] font-semibold tracking-tight">
        SN
      </span>
      <span className={`font-serif text-primary font-semibold tracking-tight ${small ? 'text-[20px]' : 'text-headline-md'}`}>S.N Spices</span>
    </Link>
  );
}
