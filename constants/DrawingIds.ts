/**
 * Shared constants for drawing IDs across the application
 * This ensures consistency and prevents UUID-related bugs
 */

// Fixed UUID for daily challenge drawings
// This UUID is used consistently across the app for daily challenge functionality
export const DAILY_CHALLENGE_DRAWING_ID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

/**
 * Check if a drawing ID represents a daily challenge
 * @param drawingId - The drawing ID to check
 * @returns true if the ID represents a daily challenge
 */
export const isDailyChallengeId = (drawingId: string): boolean => {
  return drawingId === DAILY_CHALLENGE_DRAWING_ID;
};
