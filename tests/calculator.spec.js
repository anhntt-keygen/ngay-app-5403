const { test, expect } = require('@playwright/test');

const TARGET_URL = 'http://localhost:3000';

test.describe('Pocket Calculator E2E Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(TARGET_URL);
  });

  test('[SC-01] Perform standard mathematical expressions successfully', async ({ page }) => {
    // 7 + 8 * 2 = 30 (Using operations hierarchy manually as standard calculator: 7 + 8 = 15; 15 * 2 = 30)
    await page.click('button[data-type="number"][data-val="7"]');
    await page.click('button[data-type="operator"][data-val="+"]');
    await page.click('button[data-type="number"][data-val="8"]');
    await page.click('button[data-type="equals"]'); // Result 15
    
    await expect(page.locator('#display')).toHaveText('15');

    await page.click('button[data-type="operator"][data-val="*"]');
    await page.click('button[data-type="number"][data-val="2"]');
    await page.click('button[data-type="equals"]'); // Result 30

    await expect(page.locator('#display')).toHaveText('30');
  });

  test('[SC-02] Division by Zero displays clear error state and locks ops', async ({ page }) => {
    // 9 / 0 = Error
    await page.click('button[data-type="number"][data-val="9"]');
    await page.click('button[data-type="operator"][data-val="/"]');
    await page.click('button[data-type="number"][data-val="0"]');
    await page.click('button[data-type="equals"]');

    await expect(page.locator('#display')).toHaveText('Error: Division by zero');

    // Chặn không cho nhập số tiếp sau khi lỗi nếu chưa nhấn Clear
    await page.click('button[data-type="number"][data-val="5"]');
    await expect(page.locator('#display')).toHaveText('Error: Division by zero');

    // Nhấn Clear để reset trạng thái hoạt động bình thường
    await page.click('button[data-type="clear"]');
    await expect(page.locator('#display')).toHaveText('0');
  });

  test('[SC-02] Check decimal dots entry safety constraint', async ({ page }) => {
    // 1.5.3 should result in 1.53
    await page.click('button[data-type="number"][data-val="1"]');
    await page.click('button[data-type="decimal"]');
    await page.click('button[data-type="number"][data-val="5"]');
    await page.click('button[data-type="decimal"]'); // should be ignored
    await page.click('button[data-type="number"][data-val="3"]');

    await expect(page.locator('#display')).toHaveText('1.53');
  });

  test('[SC-03] History stores computation records, loads and clears them', async ({ page }) => {
    // Prepare computation: 12 + 13 = 25
    await page.click('button[data-type="number"][data-val="1"]');
    await page.click('button[data-type="number"][data-val="2"]');
    await page.click('button[data-type="operator"][data-val="+"]');
    await page.click('button[data-type="number"][data-val="1"]');
    await page.click('button[data-type="number"][data-val="3"]');
    await page.click('button[data-type="equals"]');

    await expect(page.locator('#display')).toHaveText('25');

    // Verify history dynamic container updated
    const historyItem = page.locator('#history-list .history-item').first();
    await expect(historyItem).toBeVisible();
    await expect(historyItem.locator('.text-emerald-400')).toHaveText('25');

    // Clean display first
    await page.click('button[data-type="clear"]');
    await expect(page.locator('#display')).toHaveText('0');

    // Restore calculation by clicking on history item
    await historyItem.click();
    await expect(page.locator('#display')).toHaveText('25');

    // Click Clear History and assert reset state
    await page.click('#clear-history-btn');
    await expect(page.locator('#no-history-placeholder')).toBeVisible();
  });

  test('[SC-04] Virtual-keyboard mappings synchronization', async ({ page }) => {
    // Focus context
    await page.focus('body');
    
    // Simulate keyboard keys: 4 * 5 = 20
    await page.keyboard.press('4');
    await page.keyboard.press('*');
    await page.keyboard.press('5');
    await page.keyboard.press('Enter');

    await expect(page.locator('#display')).toHaveText('20');
  });
});