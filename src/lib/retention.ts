export const MESSAGE_RETENTION_DAYS = 30;

export function getRetentionCutoffIso(days = MESSAGE_RETENTION_DAYS) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
}
