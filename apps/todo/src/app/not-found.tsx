import { NotFound } from '@ainexsuite/ui';

export default function TodoNotFound() {
  return (
    <NotFound
      appName="todo"
      homeHref="/workspace"
      accentClass="text-violet-500"
    />
  );
}
