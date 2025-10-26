/**
 * Firebase Cloud Functions for AINexSuite
 *
 * Functions:
 * 1. generateSessionCookie - Creates SSO session cookies on .ainexsuite.com domain
 * 2. checkAuthStatus - Verifies authentication across all apps
 * 3. chatWithGrok - Handles AI assistant requests with streaming responses
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

const GROK_API_KEY = process.env.GROK_API_KEY || '';
const GROK_MODEL = 'grok-beta';
const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 14 * 1000; // 14 days in milliseconds

/**
 * Generate session cookie for SSO across subdomains
 * Called after Firebase Auth login to create a session cookie
 */
export const generateSessionCookie = functions
  .region('us-central1')
  .https.onCall(async (data, context) => {
    const { idToken } = data;

    if (!idToken) {
      throw new functions.https.HttpsError('invalid-argument', 'ID token is required');
    }

    try {
      // Verify the ID token
      const decodedToken = await admin.auth().verifyIdToken(idToken);

      // Create session cookie
      const sessionCookie = await admin
        .auth()
        .createSessionCookie(idToken, { expiresIn: SESSION_COOKIE_MAX_AGE });

      // Get user data
      const userRecord = await admin.auth().getUser(decodedToken.uid);

      // Get or create user profile in Firestore
      const userDoc = await admin.firestore().collection('users').doc(decodedToken.uid).get();

      let userData;
      if (!userDoc.exists) {
        // Create new user profile with Suite tracking
        const now = Date.now();
        userData = {
          uid: decodedToken.uid,
          email: userRecord.email || '',
          displayName: userRecord.displayName || '',
          photoURL: userRecord.photoURL || '',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
          preferences: {
            theme: 'dark',
            language: 'en',
            timezone: 'America/New_York',
            notifications: {
              email: true,
              push: true,
              inApp: true,
            },
          },
          apps: {
            notes: false,
            journal: false,
            todo: false,
            track: false,
            moments: false,
            grow: false,
            pulse: false,
            fit: false,
          },
          // Suite upsell tracking
          appsUsed: {},
          trialStartDate: now,
          subscriptionStatus: 'trial',
          suiteAccess: false,
        };

        await admin.firestore().collection('users').doc(decodedToken.uid).set(userData);
      } else {
        userData = userDoc.data();
        
        // Migrate existing users to new Suite tracking fields if needed
        const updateFields: any = {
          lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        
        if (!userData.appsUsed) {
          updateFields.appsUsed = {};
        }
        if (!userData.trialStartDate) {
          updateFields.trialStartDate = userData.createdAt || Date.now();
        }
        if (!userData.subscriptionStatus) {
          updateFields.subscriptionStatus = 'trial';
        }
        if (userData.suiteAccess === undefined) {
          updateFields.suiteAccess = false;
        }
        
        // Only update if there are fields to migrate
        if (Object.keys(updateFields).length > 1) {
          await admin.firestore().collection('users').doc(decodedToken.uid).update(updateFields);
          // Merge updated fields into userData
          userData = { ...userData, ...updateFields };
        } else {
          // Just update last login
          await admin.firestore().collection('users').doc(decodedToken.uid).update({
            lastLoginAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      }

      return {
        sessionCookie,
        user: userData,
      };
    } catch (error) {
      console.error('Error generating session cookie:', error);
      throw new functions.https.HttpsError('internal', 'Failed to generate session cookie');
    }
  });

/**
 * Check authentication status
 * Verifies session cookie and returns user data
 */
export const checkAuthStatus = functions
  .region('us-central1')
  .https.onCall(async (data, context) => {
    const { sessionCookie } = data;

    if (!sessionCookie) {
      throw new functions.https.HttpsError('unauthenticated', 'No session cookie provided');
    }

    try {
      // Verify the session cookie
      const decodedClaims = await admin.auth().verifySessionCookie(sessionCookie, true);

      // Get user data from Firestore
      const userDoc = await admin.firestore().collection('users').doc(decodedClaims.uid).get();

      if (!userDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'User not found');
      }

      return {
        authenticated: true,
        user: userDoc.data(),
      };
    } catch (error) {
      console.error('Error checking auth status:', error);
      return {
        authenticated: false,
        user: null,
      };
    }
  });

/**
 * Chat with Grok AI assistant
 * Handles AI requests with streaming responses
 */
export const chatWithGrok = functions
  .region('us-central1')
  .https.onCall(async (data, context) => {
    // Verify user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be authenticated');
    }

    const { appName, messages, systemPrompt, userContext } = data;

    if (!appName || !messages) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'appName and messages are required'
      );
    }

    try {
      // Get user data for context
      const userDoc = await admin
        .firestore()
        .collection('users')
        .doc(context.auth.uid)
        .get();

      const userData = userDoc.data();

      // Build system prompt with context
      const fullSystemPrompt = systemPrompt || buildDefaultSystemPrompt(appName, userData, userContext);

      // Call Grok API
      const response = await fetch('https://api.x.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${GROK_API_KEY}`,
        },
        body: JSON.stringify({
          model: GROK_MODEL,
          messages: [
            { role: 'system', content: fullSystemPrompt },
            ...messages,
          ],
          max_tokens: 2048,
          temperature: 0.7,
          stream: false, // Non-streaming for Cloud Functions
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Grok API error:', errorText);
        throw new functions.https.HttpsError('internal', 'AI service error');
      }

      const result = await response.json();
      const assistantMessage = result.choices[0]?.message?.content || 'No response';

      return {
        content: assistantMessage,
        usage: result.usage,
      };
    } catch (error) {
      console.error('Error calling Grok:', error);
      throw new functions.https.HttpsError('internal', 'Failed to get AI response');
    }
  });

/**
 * Build default system prompt for an app
 */
function buildDefaultSystemPrompt(
  appName: string,
  userData: any,
  userContext: any
): string {
  const basePrompt = `You are the AI assistant for the ${appName} app, part of the AINexSuite productivity suite.

User Information:
- Name: ${userData?.displayName || 'User'}
- Email: ${userData?.email || ''}

Current Date: ${new Date().toLocaleDateString()}

Be helpful, concise, and context-aware. Provide actionable suggestions based on the user's data.`;

  // Add app-specific context if provided
  if (userContext) {
    return `${basePrompt}\n\nContext:\n${JSON.stringify(userContext, null, 2)}`;
  }

  return basePrompt;
}
