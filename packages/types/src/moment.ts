import type { BaseDocument } from './common';

export interface Moment extends BaseDocument {
  title: string;
  caption: string;
  photoUrl: string;
  thumbnailUrl: string;
  date: number; // timestamp
  location: string;
  tags: string[];
  collectionId: string | null;
}

export type CreateMomentInput = Omit<Moment, 'id' | 'createdAt' | 'updatedAt' | 'thumbnailUrl'>;

export type UpdateMomentInput = Partial<Omit<Moment, 'id' | 'ownerId' | 'createdAt' | 'photoUrl' | 'thumbnailUrl'>>;

export interface MomentCollection {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  coverPhotoUrl: string;
  momentCount: number;
  createdAt: number;
}

export type CreateMomentCollectionInput = Omit<MomentCollection, 'id' | 'momentCount' | 'createdAt'>;

export type UpdateMomentCollectionInput = Partial<Omit<MomentCollection, 'id' | 'ownerId' | 'momentCount' | 'createdAt'>>;
