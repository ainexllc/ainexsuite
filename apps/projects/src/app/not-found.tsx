import { NotFound } from '@ainexsuite/ui';

export default function ProjectsNotFound() {
  return (
    <NotFound
      appName="projects"
      homeHref="/workspace"
      accentClass="text-indigo-500"
    />
  );
}
