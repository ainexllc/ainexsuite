import { NotFound } from '@ainexsuite/ui';

export default function PulseNotFound() {
  return (
    <NotFound
      appName="Pulse"
      homeHref="/workspace"
      accentClass="text-red-500"
    />
  );
}
