/**
 * Moments app user preferences
 */
export interface MomentsPreferences {
  id: string;
  userId: string;
  defaultView: 'timeline' | 'masonry' | 'calendar';
  defaultSort: 'date' | 'createdAt' | 'title';
  showCaptions: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const DEFAULT_MOMENTS_PREFERENCES: Omit<MomentsPreferences, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
  defaultView: 'timeline',
  defaultSort: 'date',
  showCaptions: true,
};
