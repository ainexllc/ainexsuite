import type { BaseDocument } from './common';

export interface Reaction {
  uid: string;
  type: string; // emoji
  timestamp: number;
}

export interface Comment {
  id: string;
  uid: string;
  text: string;
  timestamp: number;
}

export interface Moment extends BaseDocument {
  title: string;
  caption: string;
  photoUrl: string;
  thumbnailUrl: string;
  date: number; // timestamp
  location: string;
  tags: string[];
  people?: string[];
  mood?: string;
  weather?: string;
  collectionId: string | null;
  spaceId?: string;
  reactions?: Reaction[];
  comments?: Comment[];
}

export type CreateMomentInput = Omit<Moment, 'id' | 'createdAt' | 'updatedAt' | 'thumbnailUrl' | 'reactions' | 'comments'>;

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
