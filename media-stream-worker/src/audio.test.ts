import { describe, it, expect } from "vitest";
import { muLawToPcm, pcmToMuLaw, muLawToLinear, linearToMuLaw } from "./audio.js";

describe("audio", () => {
  it("converts mu-law to PCM and back", () => {
    const original = new Int16Array([0, 100, -100, 1000, -1000, 32767, -32768]);

    const muLaw = pcmToMuLaw(original);
    const decoded = muLawToPcm(muLaw);

    expect(decoded.length).toBe(original.length);
  });

  it("muLawToLinear produces valid range", () => {
    const result = muLawToLinear(0);
    expect(typeof result).toBe("number");
    expect(result).not.toBeNaN();
  });

  it("linearToMuLaw produces a byte", () => {
    const result = linearToMuLaw(0);
    expect(result).toBeGreaterThanOrEqual(0);
    expect(result).toBeLessThanOrEqual(255);
  });

  it("muLawToLinear handles extremes", () => {
    const min = muLawToLinear(0x00);
    const max = muLawToLinear(0xff);
    expect(typeof min).toBe("number");
    expect(typeof max).toBe("number");
    expect(isNaN(min)).toBe(false);
    expect(isNaN(max)).toBe(false);
  });
});
