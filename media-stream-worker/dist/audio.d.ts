/**
 * µ-law audio utilities for Twilio Media Streams.
 * Twilio sends/receives 8-bit µ-law encoded audio at 8kHz.
 */
/**
 * Convert base64 µ-law payload to 16-bit PCM samples.
 */
export declare function muLawToPcm(base64Payload: string): Int16Array;
/**
 * Convert 16-bit PCM samples to base64 µ-law payload.
 */
export declare function pcmToMuLaw(samples: Int16Array): string;
/**
 * Convert a single µ-law byte to 16-bit linear PCM.
 */
export declare function muLawToLinear(muLawByte: number): number;
/**
 * Convert a 16-bit linear PCM sample to a µ-law byte.
 */
export declare function linearToMuLaw(sample: number): number;
/**
 * Serialize PCM samples to base64 µ-law for Twilio.
 */
export declare function pcmToBase64MuLaw(samples: Int16Array): string;
//# sourceMappingURL=audio.d.ts.map