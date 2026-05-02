import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Contact from "../Contact";

// Mock the contactSubmissions module
vi.mock("@/firebase/contactSubmissions", () => ({
  submitContactForm: vi.fn(),
}));

import { submitContactForm } from "@/firebase/contactSubmissions";

describe("Contact", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should render contact form with all fields", () => {
    render(<Contact />);

    expect(screen.getByText(/full name/i)).toBeInTheDocument();
    expect(screen.getByText(/email address/i)).toBeInTheDocument();
    expect(screen.getByText(/phone number/i)).toBeInTheDocument();
    // "Subject" appears multiple times, use getAllByText
    expect(screen.getAllByText(/subject/i).length).toBeGreaterThan(0);
    // "Message" appears in button and label
    expect(screen.getAllByText(/message/i).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /send message/i })).toBeInTheDocument();
  });

  it("should render contact information section", () => {
    render(<Contact />);

    expect(screen.getByText(/get in touch/i)).toBeInTheDocument();
    // Multiple elements contain "Horti", use getAllByText
    expect(screen.getAllByText(/Horti/i).length).toBeGreaterThan(0);
  });

  it("should submit form with valid data", async () => {
    const user = userEvent.setup();

    (submitContactForm as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      error: null,
    });

    render(<Contact />);

    // Get form inputs by their type and position
    const textInputs = screen.getAllByRole("textbox") as HTMLInputElement[];
    const selectInput = screen.getByRole("combobox");

    // Fill in the form - inputs are: name, phone, email, message (textarea)
    await user.type(textInputs[0], "John Doe"); // name
    await user.type(textInputs[1], "9876543210"); // phone
    await user.type(textInputs[2], "john@example.com"); // email
    await user.selectOptions(selectInput, "admissions");
    await user.type(textInputs[3], "I want to know about admissions"); // message

    const submitButton = screen.getByRole("button", { name: /send message/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(submitContactForm).toHaveBeenCalledWith({
        full_name: "John Doe",
        email: "john@example.com",
        phone: "9876543210",
        subject: "admissions",
        message: "I want to know about admissions",
      });
    });
  });

  it("should show success message after successful submission", async () => {
    const user = userEvent.setup();

    (submitContactForm as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      error: null,
    });

    render(<Contact />);

    const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
    const selectInput = screen.getByRole("combobox");

    await user.type(inputs[0], "Jane Doe");
    await user.type(inputs[2], "jane@example.com");
    await user.selectOptions(selectInput, "academics");
    await user.type(inputs[3], "General inquiry");

    await user.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => {
      expect(screen.getByText(/sent successfully/i)).toBeInTheDocument();
    });
  });

  it("should show error message when submission fails", async () => {
    const user = userEvent.setup();

    (submitContactForm as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: false,
      error: "Network error",
    });

    render(<Contact />);

    const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
    const selectInput = screen.getByRole("combobox");

    await user.type(inputs[0], "Test User");
    await user.type(inputs[2], "test@example.com");
    await user.selectOptions(selectInput, "fees");
    await user.type(inputs[3], "Test message");

    await user.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => {
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });

  it("should clear form after successful submission", async () => {
    const user = userEvent.setup();

    (submitContactForm as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
      error: null,
    });

    render(<Contact />);

    const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
    const nameInput = inputs[0];
    const emailInput = inputs[2];
    const messageInput = inputs[3];
    const selectInput = screen.getByRole("combobox");

    await user.type(nameInput, "Clear Test");
    await user.type(emailInput, "clear@example.com");
    await user.selectOptions(selectInput, "other");
    await user.type(messageInput, "This should be cleared");

    await user.click(screen.getByRole("button", { name: /send message/i }));

    await waitFor(() => {
      expect(nameInput.value).toBe("");
      expect(emailInput.value).toBe("");
      expect(messageInput.value).toBe("");
    });
  });

  it("should disable submit button while submitting", async () => {
    const user = userEvent.setup();

    let resolveSubmit: (value: { success: boolean; error: null }) => void;
    const submitPromise = new Promise<{ success: boolean; error: null }>((resolve) => {
      resolveSubmit = resolve;
    });

    (submitContactForm as ReturnType<typeof vi.fn>).mockReturnValue(submitPromise);

    render(<Contact />);

    const inputs = screen.getAllByRole("textbox") as HTMLInputElement[];
    const selectInput = screen.getByRole("combobox");

    await user.type(inputs[0], "Test");
    await user.type(inputs[2], "test@test.com");
    await user.selectOptions(selectInput, "admissions");
    await user.type(inputs[3], "Test");

    const submitButton = screen.getByRole("button", { name: /send message/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/sending/i)).toBeInTheDocument();
    });

    resolveSubmit!({ success: true, error: null });

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /send message/i })).toBeInTheDocument();
    });
  });

  it("should have all subject options", () => {
    render(<Contact />);

    const subjectSelect = screen.getByRole("combobox");
    const options = subjectSelect.querySelectorAll("option");

    const optionValues = Array.from(options).map((opt) => opt.value);
    expect(optionValues).toContain("admissions");
    expect(optionValues).toContain("academics");
    expect(optionValues).toContain("fees");
    expect(optionValues).toContain("other");
  });

  it("should render map section", () => {
    render(<Contact />);

    expect(screen.getByText(/vijayapura/i)).toBeInTheDocument();
  });

  it("should show phone number in contact info", () => {
    render(<Contact />);

    expect(screen.getByText(/8352 240315/)).toBeInTheDocument();
  });

  it("should show email in contact info", () => {
    render(<Contact />);

    expect(screen.getByText(/info@oxfordacademy.edu/i)).toBeInTheDocument();
  });

  it("should render section header", () => {
    render(<Contact />);

    expect(screen.getByText("Contact Us")).toBeInTheDocument();
    expect(screen.getByText(/have questions/i)).toBeInTheDocument();
  });

  it("should render office hours", () => {
    render(<Contact />);

    expect(screen.getByText(/office hours/i)).toBeInTheDocument();
    expect(screen.getByText(/mon - sat/i)).toBeInTheDocument();
  });
});
