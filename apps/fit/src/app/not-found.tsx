import Link from 'next/link';
import { Dumbbell } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-[#3b82f6]/10 flex items-center justify-center">
            <Dumbbell className="h-8 w-8 text-[#3b82f6]" />
          </div>
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">404</h1>
          <h2 className="text-xl text-muted-foreground">Page Not Found</h2>
        </div>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#3b82f6] text-white hover:bg-[#3b82f6]/90 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
