import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";
import React from "react";

// Mock motion/react to avoid animation issues in tests
vi.mock("motion/react", () => {
  const createMotionComponent = (tag: string) => {
    return React.forwardRef(function MotionComponent(props: Record<string, unknown>, ref: unknown) {
      const {
        children,
        initial,
        animate,
        whileInView,
        viewport,
        transition,
        exit,
        whileHover,
        whileTap,
        ...rest
      } = props;
      return React.createElement(tag, { ...rest, ref }, children as React.ReactNode);
    });
  };

  return {
    motion: {
      div: createMotionComponent("div"),
      section: createMotionComponent("section"),
      header: createMotionComponent("header"),
      span: createMotionComponent("span"),
      p: createMotionComponent("p"),
      button: createMotionComponent("button"),
      img: createMotionComponent("img"),
      a: createMotionComponent("a"),
      nav: createMotionComponent("nav"),
      ul: createMotionComponent("ul"),
      li: createMotionComponent("li"),
      form: createMotionComponent("form"),
      input: createMotionComponent("input"),
      h1: createMotionComponent("h1"),
      h2: createMotionComponent("h2"),
      h3: createMotionComponent("h3"),
    },
    AnimatePresence: ({ children }: { children: React.ReactNode }) => children,
  };
});

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Mock URL.createObjectURL
URL.createObjectURL = vi.fn(() => "blob:mock-url");
URL.revokeObjectURL = vi.fn();
