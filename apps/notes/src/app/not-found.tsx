import { NotFound } from '@ainexsuite/ui';

export default function NotesNotFound() {
  return (
    <NotFound
      appName="notes"
      homeHref="/workspace"
      accentClass="text-yellow-500"
    />
  );
}
