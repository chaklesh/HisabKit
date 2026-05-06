import { expect, test } from "@playwright/test";

test.describe("Ledger Management Happy Path", () => {
  test("should login and manage a customer ledger", async ({ page }) => {
    // 1. Visit Login
    await page.goto("/auth/login");
    await expect(page).toHaveTitle(/HisabKit/);

    // 2. Perform Login (using default credentials if available or mocking)
    await page.getByPlaceholder("Enter your username").fill("admin");
    await page.getByPlaceholder("Enter your password").fill("admin123");
    await page.getByRole("button", { name: /Sign in with password/i }).click();

    // 3. Verify Dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.getByText(/Shop Dashboard/i)).toBeVisible();

    // 4. Navigate to Ledger
    await page.getByRole("link", { name: /Ledger/i }).click();
    await expect(page).toHaveURL(/.*ledger/);

    // 5. Create Customer
    await page.getByRole("button", { name: /Add Customer/i }).click();
    await page.getByPlaceholder(/Name/i).fill("E2E Test Customer");
    await page.getByPlaceholder(/Phone/i).fill("1234567890");
    await page.getByRole("button", { name: /Create/i }).click();

    // 6. Verify Customer in List
    await expect(page.getByText("E2E Test Customer")).toBeVisible();

    // 7. Open Transaction Form
    await page.getByText("E2E Test Customer").click();
    await page.getByRole("button", { name: /Add Entry/i }).click();

    // 8. Add SALE Entry
    await page.getByPlaceholder(/Total Amount/i).fill("1000");
    await page.getByPlaceholder(/Paid Amount/i).fill("200");
    await page.getByRole("button", { name: /Save Entry/i }).click();

    // 9. Verify Balance
    await expect(page.getByText(/800/)).toBeVisible();
  });
});
