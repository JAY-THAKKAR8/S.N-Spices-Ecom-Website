import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="container-x py-20 text-center">
      <h1 className="font-serif text-headline-xl text-primary">Page not found</h1>
      <Link to="/" className="btn-primary mt-6">Go to home</Link>
    </div>
  );
}
