import { NotFound } from '@ainexsuite/ui';

export default function AdminNotFound() {
  return (
    <NotFound
      appName="Admin"
      homeHref="/workspace"
      accentClass="text-zinc-500"
    />
  );
}
