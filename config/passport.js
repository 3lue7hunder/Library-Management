const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const { getDB } = require('./database');
const { ObjectId } = require('mongodb');

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL || "http://localhost:3000/auth/github/callback"
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const db = getDB();
    
    // Check if user already exists with this GitHub ID
    let user = await db.collection('users').findOne({ 
      githubId: profile.id 
    });
    
    if (user) {
      // User exists, update their info
      await db.collection('users').updateOne(
        { _id: user._id },
        {
          $set: {
            lastLogin: new Date(),
            accessToken: accessToken,
            profile: {
              displayName: profile.displayName,
              username: profile.username,
              profileUrl: profile.profileUrl,
              avatar: profile.photos[0]?.value
            }
          }
        }
      );
      return done(null, user);
    }
    
    // Check if user exists with same email (from GitHub profile)
    const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
    if (email) {
      user = await db.collection('users').findOne({ email: email });
      if (user) {
        // Link GitHub account to existing user
        await db.collection('users').updateOne(
          { _id: user._id },
          {
            $set: {
              githubId: profile.id,
              lastLogin: new Date(),
              accessToken: accessToken,
              profile: {
                displayName: profile.displayName,
                username: profile.username,
                profileUrl: profile.profileUrl,
                avatar: profile.photos[0]?.value
              }
            }
          }
        );
        return done(null, user);
      }
    }
    
    // Create new user
    const newUser = {
      githubId: profile.id,
      username: profile.username || profile.displayName,
      email: email || `${profile.username}@github.user`,
      role: 'user',
      authProvider: 'github',
      profile: {
        displayName: profile.displayName,
        username: profile.username,
        profileUrl: profile.profileUrl,
        avatar: profile.photos[0]?.value
      },
      accessToken: accessToken,
      createdAt: new Date(),
      lastLogin: new Date()
    };
    
    const result = await db.collection('users').insertOne(newUser);
    newUser._id = result.insertedId;
    
    return done(null, newUser);
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    return done(error, null);
  }
}));

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const db = getDB();
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(id) },
      { projection: { accessToken: 0 } } 
    );
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;