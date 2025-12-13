import { NotFound } from '@ainexsuite/ui';

export default function WorkflowNotFound() {
  return (
    <NotFound
      appName="Workflow"
      homeHref="/workspace"
      accentClass="text-cyan-500"
    />
  );
}
