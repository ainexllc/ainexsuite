import { NotFound } from '@ainexsuite/ui';

export default function TodoNotFound() {
  return (
    <NotFound
      appName="Todo"
      homeHref="/workspace"
      accentClass="text-violet-500"
    />
  );
}
