import { NotFound } from '@ainexsuite/ui';

export default function HabitsNotFound() {
  return (
    <NotFound
      appName="Habits"
      homeHref="/workspace"
      accentClass="text-teal-500"
    />
  );
}
