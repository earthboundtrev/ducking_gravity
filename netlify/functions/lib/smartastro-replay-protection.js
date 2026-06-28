const MAX_IDEMPOTENCY_KEYS = 100;
const IDEMPOTENCY_RETENTION_MS = 24 * 60 * 60 * 1000;

function hasSeenIdempotencyKey(state, key) {
  if (!key || !Array.isArray(state.idempotencyKeys)) return false;
  return state.idempotencyKeys.some((entry) => entry && entry.key === key);
}

function rememberIdempotencyKey(state, key) {
  if (!key) return state;

  const now = Date.now();
  const retained = Array.isArray(state.idempotencyKeys)
    ? state.idempotencyKeys.filter((entry) => {
        const seenAt = Date.parse(entry && entry.seenAt);
        return Number.isFinite(seenAt) && now - seenAt <= IDEMPOTENCY_RETENTION_MS;
      })
    : [];

  return {
    ...state,
    idempotencyKeys: [
      ...retained,
      { key, seenAt: new Date(now).toISOString() },
    ].slice(-MAX_IDEMPOTENCY_KEYS),
  };
}

module.exports = {
  IDEMPOTENCY_RETENTION_MS,
  MAX_IDEMPOTENCY_KEYS,
  hasSeenIdempotencyKey,
  rememberIdempotencyKey,
};
