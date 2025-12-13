import { NotFound } from '@ainexsuite/ui';

export default function ProjectsNotFound() {
  return (
    <NotFound
      appName="Projects"
      homeHref="/workspace"
      accentClass="text-indigo-500"
    />
  );
}
