import { NotFound } from '@ainexsuite/ui';

export default function WorkflowNotFound() {
  return (
    <NotFound
      appName="workflow"
      homeHref="/workspace"
      accentClass="text-cyan-500"
    />
  );
}
