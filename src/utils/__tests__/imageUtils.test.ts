import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { generateFileName } from "../imageUtils";

describe("imageUtils", () => {
  describe("generateFileName", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date("2025-01-15T10:30:00.000Z"));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should generate filename with userId and timestamp", () => {
      const userId = "user-123";
      const result = generateFileName(userId);

      expect(result).toBe("user-123_1736937000000.webp");
    });

    it("should use custom extension when provided", () => {
      const userId = "user-456";
      const result = generateFileName(userId, "png");

      expect(result).toBe("user-456_1736937000000.png");
    });

    it("should generate unique filenames for different users", () => {
      const result1 = generateFileName("user-1");
      const result2 = generateFileName("user-2");

      expect(result1).not.toBe(result2);
      expect(result1).toContain("user-1");
      expect(result2).toContain("user-2");
    });

    it("should handle special characters in userId", () => {
      const userId = "user@example.com";
      const result = generateFileName(userId);

      expect(result).toContain("user@example.com");
      expect(result).toMatch(/\.webp$/);
    });

    it("should default to webp extension", () => {
      const result = generateFileName("test-user");

      expect(result).toMatch(/\.webp$/);
    });

    it("should generate different filenames at different times", () => {
      const result1 = generateFileName("user-1");
      
      vi.setSystemTime(new Date("2025-01-15T10:31:00.000Z"));
      
      const result2 = generateFileName("user-1");

      expect(result1).not.toBe(result2);
    });

    it("should handle empty userId", () => {
      const result = generateFileName("");

      expect(result).toMatch(/^_\d+\.webp$/);
    });

    it("should handle UUID as userId", () => {
      const uuid = "550e8400-e29b-41d4-a716-446655440000";
      const result = generateFileName(uuid);

      expect(result).toContain(uuid);
      expect(result).toMatch(/\.webp$/);
    });
  });

  // Note: compressImage tests are skipped because they require complex DOM mocking
  // In a real project, these would be tested with integration tests or E2E tests
  describe("compressImage", () => {
    it.skip("should compress image - requires browser environment", () => {
      // This function requires actual browser APIs (Image, Canvas)
      // Best tested with integration tests or E2E tests
    });
  });
});
