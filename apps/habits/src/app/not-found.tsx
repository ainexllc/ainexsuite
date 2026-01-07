import { NotFound } from '@ainexsuite/ui';

export default function HabitsNotFound() {
  return (
    <NotFound
      appName="habits"
      homeHref="/workspace"
      accentClass="text-teal-500"
    />
  );
}
