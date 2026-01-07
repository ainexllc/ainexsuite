import { NotFound } from '@ainexsuite/ui';

export default function CalendarNotFound() {
  return (
    <NotFound
      appName="calendar"
      homeHref="/workspace"
      accentClass="text-cyan-500"
    />
  );
}
