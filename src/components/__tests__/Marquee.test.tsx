import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import Marquee from "../Marquee";

// Mock the marqueeMessages module
vi.mock("@/firebase/marqueeMessages", () => ({
  getActiveMarqueeMessages: vi.fn(),
}));

import { getActiveMarqueeMessages } from "@/firebase/marqueeMessages";

describe("Marquee", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render default announcements initially", () => {
    (getActiveMarqueeMessages as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      error: null,
    });

    render(<Marquee />);

    // Should show default messages before API loads (doubled for animation)
    expect(screen.getAllByText(/Admissions Open for 2025-26/i).length).toBeGreaterThan(0);
  });

  it("should fetch and display messages from database", async () => {
    const mockMessages = [
      { text: "Custom Message 1", icon: "Bell", highlight: true },
      { text: "Custom Message 2", icon: "Award", highlight: false },
    ];

    (getActiveMarqueeMessages as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: mockMessages,
      error: null,
    });

    render(<Marquee />);

    await waitFor(() => {
      expect(screen.getAllByText("Custom Message 1")).toHaveLength(2); // Doubled for animation
    });

    expect(screen.getAllByText("Custom Message 2")).toHaveLength(2);
  });

  it("should display NEW badge for highlighted messages", async () => {
    const mockMessages = [
      { text: "Highlighted Message", icon: "Bell", highlight: true },
      { text: "Normal Message", icon: "Award", highlight: false },
    ];

    (getActiveMarqueeMessages as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: mockMessages,
      error: null,
    });

    render(<Marquee />);

    await waitFor(() => {
      const newBadges = screen.getAllByText("NEW");
      expect(newBadges.length).toBeGreaterThan(0);
    });
  });

  it("should keep default messages when API returns error", async () => {
    (getActiveMarqueeMessages as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      error: "Network error",
    });

    render(<Marquee />);

    // Should still show default messages (doubled for animation)
    await waitFor(() => {
      expect(screen.getAllByText(/Admissions Open for 2025-26/i).length).toBeGreaterThan(0);
    });
  });

  it("should keep default messages when API returns empty array", async () => {
    (getActiveMarqueeMessages as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      error: null,
    });

    render(<Marquee />);

    // Should keep default messages when no data from API (doubled for animation)
    expect(screen.getAllByText(/Admissions Open for 2025-26/i).length).toBeGreaterThan(0);
  });

  it("should render with correct styling", () => {
    (getActiveMarqueeMessages as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: [],
      error: null,
    });

    const { container } = render(<Marquee />);

    // Check for yellow background
    const marqueeContainer = container.firstChild as HTMLElement;
    expect(marqueeContainer).toHaveClass("bg-[#f7c52d]");
  });

  it("should apply highlight color to highlighted messages", async () => {
    const mockMessages = [
      { text: "Red Highlighted", icon: "Bell", highlight: true },
    ];

    (getActiveMarqueeMessages as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: mockMessages,
      error: null,
    });

    render(<Marquee />);

    await waitFor(() => {
      const highlightedText = screen.getAllByText("Red Highlighted")[0];
      expect(highlightedText).toHaveClass("text-[#c41e3a]");
    });
  });

  it("should apply normal color to non-highlighted messages", async () => {
    const mockMessages = [
      { text: "Normal Text", icon: "Award", highlight: false },
    ];

    (getActiveMarqueeMessages as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: mockMessages,
      error: null,
    });

    render(<Marquee />);

    await waitFor(() => {
      const normalText = screen.getAllByText("Normal Text")[0];
      expect(normalText).toHaveClass("text-gray-800");
    });
  });

  it("should render correct icon based on icon prop", async () => {
    const mockMessages = [
      { text: "Bell Message", icon: "Bell", highlight: false },
      { text: "Award Message", icon: "Award", highlight: false },
      { text: "Calendar Message", icon: "Calendar", highlight: false },
    ];

    (getActiveMarqueeMessages as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: mockMessages,
      error: null,
    });

    render(<Marquee />);

    await waitFor(() => {
      expect(screen.getAllByText("Bell Message")).toHaveLength(2);
      expect(screen.getAllByText("Award Message")).toHaveLength(2);
      expect(screen.getAllByText("Calendar Message")).toHaveLength(2);
    });
  });

  it("should double messages for seamless animation", async () => {
    const mockMessages = [
      { text: "Single Message", icon: "Bell", highlight: false },
    ];

    (getActiveMarqueeMessages as ReturnType<typeof vi.fn>).mockResolvedValue({
      data: mockMessages,
      error: null,
    });

    render(<Marquee />);

    await waitFor(() => {
      const messages = screen.getAllByText("Single Message");
      expect(messages).toHaveLength(2); // Doubled for animation
    });
  });
});
