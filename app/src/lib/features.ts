/**
 * Build-time feature flags.
 *
 * Everything defaults OFF; enable a flag by setting the matching
 * `VITE_FEATURE_*` env var to "1" (or "true") at build/dev time. This keeps
 * controls that aren't wired to a real backend yet (voice input, file
 * attachments) out of the shipped UI instead of showing dead buttons.
 */
const enabled = (v: unknown): boolean => v === '1' || v === 'true';

export const features = {
  voiceInput: enabled(import.meta.env.VITE_FEATURE_VOICE),
  attachments: enabled(import.meta.env.VITE_FEATURE_ATTACHMENTS),
} as const;
