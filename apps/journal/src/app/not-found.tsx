import { NotFound } from '@ainexsuite/ui';

export default function JournalNotFound() {
  return (
    <NotFound
      appName="journal"
      homeHref="/workspace"
      accentClass="text-orange-500"
    />
  );
}
