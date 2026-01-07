import { NotFound } from '@ainexsuite/ui';

export default function AdminNotFound() {
  return (
    <NotFound
      appName="admin"
      homeHref="/workspace"
      accentClass="text-zinc-500"
    />
  );
}
