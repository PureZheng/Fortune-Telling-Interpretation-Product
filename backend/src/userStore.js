const users = new Map();

function saveUserProfile(profile) {
  const now = new Date().toISOString();
  const existing = users.get(profile.userId) || {};
  const next = {
    ...existing,
    ...profile,
    updatedAt: now,
    createdAt: existing.createdAt || now,
  };
  users.set(profile.userId, next);
  return next;
}

function getUserProfile(userId) {
  return users.get(userId) || null;
}

module.exports = {
  saveUserProfile,
  getUserProfile,
};
