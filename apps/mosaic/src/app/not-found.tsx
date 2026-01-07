import { NotFound } from '@ainexsuite/ui';

export default function DisplayNotFound() {
  return (
    <NotFound
      appName="display"
      homeHref="/workspace"
      accentClass="text-red-500"
    />
  );
}
