import { NotFound } from '@ainexsuite/ui';

export default function HealthNotFound() {
  return (
    <NotFound
      appName="Health"
      homeHref="/workspace"
      accentClass="text-emerald-500"
    />
  );
}
