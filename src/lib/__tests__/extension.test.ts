/**
 * getTypeFromExtension
 * 1. Valid mapping per category
 * 2. Missing extension (undefined, empty string)
 * 3. Unregistered extension
 * 4. Case-insensitive matching
 */

import { getTypeFromExtension } from '../extension';

describe('getTypeFromExtension', () => {
  it.each([
    ['png', 'image'],
    ['xlsx', 'excel'],
    ['pdf', 'pdf'],
    ['mp4', 'video'],
    ['docx', 'word'],
    ['pptx', 'pptx'],
    ['mp3', 'music'],
    ['zip', 'zip'],
    ['psd', 'photoshop'],
  ])('should return "%s" → "%s"', (ext, expected) => {
    expect(getTypeFromExtension(ext)).toBe(expected);
  });

  it("should return 'free' for undefined extension", () => {
    expect(getTypeFromExtension(undefined)).toBe('free');
  });

  it("should return 'free' for empty string", () => {
    expect(getTypeFromExtension('')).toBe('free');
  });

  it("should return 'free' for unknown extension", () => {
    expect(getTypeFromExtension('unknown')).toBe('free');
  });

  it('should return the correct type for uppercase extension', () => {
    expect(getTypeFromExtension('PNG')).toBe('image');
    expect(getTypeFromExtension('PDF')).toBe('pdf');
  });
});
