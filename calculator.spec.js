const { test, expect } = require('@playwright/test');

test.describe('Pocket Calculator App Test Suite', () => {

  test.beforeEach(async ({ page }) => {
    // Chạy cục bộ hoặc trỏ đến file index.html được build sẵn
    await page.goto('file://' + __dirname + '/index.html');
  });

  test('[SC-01] Thực hiện phép tính cơ bản thành công', async ({ page }) => {
    // Thực hiện phép tính: 12 + 8.5 * 2 = 29
    // Click số 1
    await page.click('button[data-val="1"]');
    // Click số 2
    await page.click('button[data-val="2"]');
    // Click dấu +
    await page.click('button[data-val="+"]');
    // Click số 8
    await page.click('button[data-val="8"]');
    // Click dấu thập phân
    await page.click('button[data-val="."]');
    // Click số 5
    await page.click('button[data-val="5"]');
    
    // Kiểm tra hiển thị màn hình LCD phụ
    const formulaDisplay = await page.textContent('#display-formula');
    expect(formulaDisplay.trim()).toContain('12 +');

    // Click dấu Bằng để xem kết quả trung gian
    await page.click('button[data-val="="]');
    await expect(page.locator('[data-testid="display-primary"]')).toHaveText('20.5');

    // Tiếp tục nhân với 2
    await page.click('button[data-val="*"]');
    await page.click('button[data-val="2"]');
    await page.click('button[data-val="="]');
    await expect(page.locator('[data-testid="display-primary"]')).toHaveText('41');
  });

  test('[SC-02] Ngăn chặn nhập nhiều dấu thập phân liên tiếp trong cùng một số', async ({ page }) => {
    // Nhập "3.1.4" -> Phải tự động chặn dấu chấm thứ 2 và hiển thị là "3.14"
    await page.click('button[data-val="3"]');
    await page.click('button[data-val="."]');
    await page.click('button[data-val="1"]');
    await page.click('button[data-val="."]'); // Dấu chấm không hợp lệ
    await page.click('button[data-val="4"]');

    await expect(page.locator('[data-testid="display-primary"]')).toHaveText('3.14');
  });

  test('[SC-02] Xử lý ngoại lệ phân chia cho không (Division by zero)', async ({ page }) => {
    // Phép tính: 9 / 0 = Error
    await page.click('button[data-val="9"]');
    await page.click('button[data-val="/"]');
    await page.click('button[data-val="0"]');
    await page.click('button[data-val="="]');

    // Màn hình hiển thị thông điệp lỗi trực quan
    await expect(page.locator('[data-testid="display-primary"]')).toHaveText('Error: Division by zero');

    // Các nút bấm số và phép tính khác phải bị vô hiệu hóa
    const btnSeven = page.locator('button[data-val="7"]');
    await expect(btnSeven).toBeDisabled();

    // Nhấn "C" để giải phóng trạng thái khóa
    await page.click('button[data-val="C"]');
    await expect(btnSeven).not.toBeDisabled();
    await expect(page.locator('[data-testid="display-primary"]')).toHaveText('0');
  });

  test('[SC-03] Lưu trữ và truy xuất lịch sử từ LocalStorage', async ({ page }) => {
    // Thực hiện phép tính để ghi nhận lịch sử: 5 * 6 = 30
    await page.click('button[data-val="5"]');
    await page.click('button[data-val="*"]');
    await page.click('button[data-val="6"]');
    await page.click('button[data-val="="]');

    // Kiểm tra xem mục lịch sử có xuất hiện trên panel bên cạnh không
    const historyItem = page.locator('#history-list >> text=5 × 6');
    await expect(historyItem).toBeVisible();

    // Click nút CLEAR máy tính để reset màn hình về 0
    await page.click('button[data-val="C"]');
    await expect(page.locator('[data-testid="display-primary"]')).toHaveText('0');

    // Click vào dòng lịch sử vừa rồi để nạp lại kết quả "30"
    await page.click('#history-list >> text=30');
    await expect(page.locator('[data-testid="display-primary"]')).toHaveText('30');

    // Kiểm tra tính năng xóa lịch sử
    await page.click('#btn-clear-history');
    await expect(page.locator('#history-list')).toContainText('Chưa có dữ liệu tính toán');
  });

  test('[SC-04] Hỗ trợ đầy đủ phím tắt bàn phím vật lý', async ({ page }) => {
    // Giả lập gõ phím từ bàn phím: 7, *, 8, Enter (=)
    await page.keyboard.press('7');
    await page.keyboard.press('*');
    await page.keyboard.press('8');
    await page.keyboard.press('Enter');

    await expect(page.locator('[data-testid="display-primary"]')).toHaveText('56');
  });

});