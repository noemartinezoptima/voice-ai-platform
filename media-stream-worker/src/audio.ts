/**
 * µ-law audio utilities for Twilio Media Streams.
 * Twilio sends/receives 8-bit µ-law encoded audio at 8kHz.
 */

/**
 * Convert base64 µ-law payload to 16-bit PCM samples.
 */
export function muLawToPcm(base64Payload: string): Int16Array {
  const buf = Buffer.from(base64Payload, "base64");
  const pcm = new Int16Array(buf.length);

  for (let i = 0; i < buf.length; i++) {
    pcm[i] = muLawToLinear(buf[i]!);
  }

  return pcm;
}

/**
 * Convert 16-bit PCM samples to base64 µ-law payload.
 */
export function pcmToMuLaw(samples: Int16Array): string {
  const buf = Buffer.alloc(samples.length);

  for (let i = 0; i < samples.length; i++) {
    buf[i] = linearToMuLaw(samples[i]!);
  }

  return buf.toString("base64");
}

/**
 * Convert a single µ-law byte to 16-bit linear PCM.
 */
export function muLawToLinear(muLawByte: number): number {
  const sign = muLawByte & 0x80;
  let exponent = (muLawByte >> 4) & 0x07;
  let mantissa = muLawByte & 0x0f;

  if (exponent > 0) {
    mantissa = mantissa | 0x10;
  }

  let sample: number;

  if (exponent === 0) {
    sample = mantissa;
  } else {
    sample = (mantissa << (exponent + 3)) | (1 << (exponent + 2));
  }

  // Apply bias
  sample = sample - 0x84;

  // Apply sign
  if (sign === 0) {
    sample = -sample;
  }

  return sample;
}

/**
 * Convert a 16-bit linear PCM sample to a µ-law byte.
 */
export function linearToMuLaw(sample: number): number {
  const sign = sample < 0 ? 0x80 : 0x00;

  if (sample < 0) {
    sample = -sample;
  }

  // Add bias
  sample += 0x84;

  let exponent = 7;
  let expMask = 0x4000;

  // Find exponent
  while ((sample & expMask) === 0 && exponent > 0) {
    exponent--;
    expMask >>= 1;
  }

  let mantissa = (sample >> (exponent + 3)) & 0x0f;

  const muLawByte = sign | (exponent << 4) | mantissa;

  // Invert bitwise (µ-law encoding completes)
  return muLawByte ^ 0xff;
}

/**
 * Serialize PCM samples to base64 µ-law for Twilio.
 */
export function pcmToBase64MuLaw(samples: Int16Array): string {
  return pcmToMuLaw(samples);
}
