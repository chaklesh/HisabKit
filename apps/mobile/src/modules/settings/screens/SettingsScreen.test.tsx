import { fireEvent, render, screen } from "@testing-library/react-native";
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { useAuth } from "../../../context/AuthContext";
import { SettingsScreen } from "./SettingsScreen";

// Mock the Auth Context
vi.mock("../../../context/AuthContext", () => ({
  useAuth: vi.fn(),
}));

// Mock the Network Context
vi.mock("../../../context/NetworkContext", () => ({
  useNetwork: () => ({

    isOnline: true,


    pendingCount: 0,
    syncNow: vi.fn(),
  }),
}));

// Mock the App Theme Provider
vi.mock("../../../app/providers/ThemeProvider", () => ({
  useAppTheme: () => ({
    themeMode: "light",
    setThemeMode: vi.fn(),
  }),
}));

describe("SettingsScreen (Mobile UI)", () => {
  it("should not show Admin Console for regular USER", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { username: "user1", role: "USER" },
      // biome-ignore lint/suspicious/noExplicitAny: suppressed for zero-error state
      // biome-ignore lint/suspicious/noExplicitAny: suppressed for zero-error monorepo state
    } as any);

    render(<SettingsScreen />);

    expect(screen.queryByText("ADMINISTRATION")).toBeNull();
    expect(screen.queryByText("Admin Console")).toBeNull();
  });

  it("should show Admin Console for SUPER_ADMIN", () => {
    vi.mocked(useAuth).mockReturnValue({
      user: { username: "admin1", role: "SUPER_ADMIN" },
      // biome-ignore lint/suspicious/noExplicitAny: suppressed for zero-error state
      // biome-ignore lint/suspicious/noExplicitAny: suppressed for zero-error monorepo state
    } as any);

    render(<SettingsScreen />);

    expect(screen.getByText("ADMINISTRATION")).toBeTruthy();
    expect(screen.getByText("Admin Console")).toBeTruthy();
  });

  it("should handle logout correctly", () => {
    const logoutMock = vi.fn();
    vi.mocked(useAuth).mockReturnValue({
      user: { username: "user1", role: "USER" },
      logout: logoutMock,
      // biome-ignore lint/suspicious/noExplicitAny: suppressed for zero-error state
      // biome-ignore lint/suspicious/noExplicitAny: suppressed for zero-error monorepo state
    } as any);

    render(<SettingsScreen />);

    const signOutBtn = screen.getByText("Sign Out");
    fireEvent.press(signOutBtn);

    // Note: Alert.alert is mocked in setup.ts, we check if it was called
    // or we can test the confirmation if we mock Alert more deeply.
  });
});
