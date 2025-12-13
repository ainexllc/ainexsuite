import { NotFound } from '@ainexsuite/ui';

export default function NotesNotFound() {
  return (
    <NotFound
      appName="Notes"
      homeHref="/workspace"
      accentClass="text-yellow-500"
    />
  );
}
