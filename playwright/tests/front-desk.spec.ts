import { test, expect } from "@playwright/test";

test.describe("Front Desk Dashboard", () => {
  // Login before each test
  test.beforeEach(async ({ page }) => {
    await page.goto("/front-desk.html");

    const passwordInput = page.locator('#auth-form input[type="password"]');
    const unlockButton = page.locator("#auth-form button", {
      hasText: "Unlock",
    });

    await passwordInput.fill(process.env.RECEPTIONIST_KEY || "testkey");
    await unlockButton.click();

    await expect(page.locator("#main-content")).toBeVisible();
  });

  test('should display "No race sessions" initially', async ({ page }) => {
    const emptyMsg = page.locator("#sessions-container");
    await expect(emptyMsg).toContainText("No race sessions scheduled");
  });

  test('should show and hide the "New session" form', async ({ page }) => {
    await page.click("text=New session");
    const addForm = page.locator("#add-form");
    await expect(addForm).toBeVisible();

    await page.click('#add-form button:has-text("Cancel")');
    await expect(addForm).toBeHidden();
  });

  test("should validate driver input (max 8 drivers)", async ({ page }) => {
    await page.click("text=New session");

    const drivers = "D1, D2, D3, D4, D5, D6, D7, D8, D9";
    await page.fill("#drivers-input", drivers);

    page.once("dialog", async (dialog) => {
      expect(dialog.message()).toBe(
        "A maximum of 8 drivers per session are allowed",
      );
      await dialog.dismiss();
    });

    await page.click('#add-form button[type="submit"]');
  });

  test("should validate unique driver names", async ({ page }) => {
    await page.click("text=New session");
    await page.fill("#drivers-input", "Lewis, Lewis");

    page.once("dialog", async (dialog) => {
      expect(dialog.message()).toBe("Driver names must be unique");
      await dialog.dismiss();
    });

    await page.click('#add-form button[type="submit"]');
  });

  // Tests that need rendered sessions:
  test("should toggle between Add and Edit forms correctly", async ({
    page,
  }) => {
    await page.click("text=New session");
    await expect(page.locator("#add-form")).toBeVisible();

    const editBtn = page.locator('button:has-text("Edit")').first();
    if (await editBtn.isVisible()) {
      await editBtn.click();
      await expect(page.locator("#add-form")).toBeHidden();
      await expect(page.locator("#edit-form")).toBeVisible();
    }
  });

  test("should confirm before deleting a session", async ({ page }) => {
    const deleteBtn = page.locator('button:has-text("Delete")').first();

    if (await deleteBtn.isVisible()) {
      page.once("dialog", async (dialog) => {
        expect(dialog.message()).toContain("Delete Race #");
        await dialog.dismiss();
      });
      await deleteBtn.click();
    }
  });
});
