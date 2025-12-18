import { NotFound } from '@ainexsuite/ui';

export default function AlbumNotFound() {
  return (
    <NotFound
      appName="Album"
      homeHref="/workspace"
      accentClass="text-pink-500"
    />
  );
}
