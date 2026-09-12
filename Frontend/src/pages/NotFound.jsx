import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, Home } from 'lucide-react';
import { Button } from '../components/Button';

export const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-4">
      <Sprout className="w-16 h-16 text-emerald-600 mb-4 animate-bounce" />
      <h1 className="text-4xl font-black text-slate-900 tracking-tight">404 — Page Not Found</h1>
      <p className="text-sm text-slate-500 max-w-md my-3 font-medium">
        The agri-market page you are looking for does not exist or has been relocated.
      </p>
      <Link to="/" className="mt-2">
        <Button variant="primary" icon={Home}>
          Return to Home
        </Button>
      </Link>
    </div>
  );
};
