# 🧮 Pocket Calculator (Máy tính cầm tay đa năng)

Ứng dụng máy tính cầm tay bỏ túi giả lập cơ học thông minh với giao diện Neumorphism sang trọng. Hỗ trợ đầy đủ các phép toán phức tạp, quản lý lịch sử thông minh qua LocalStorage, tương tác phím tắt vật lý và thiết kế responsive tối ưu cho cả điện thoại di động và máy tính để bàn.

## 🌟 Tính năng chính

- **[SC-01] Phép tính cơ bản & Nâng cao:** Cộng (+), Trừ (-), Nhân (*), Chia (/), Tính phần trăm (%), Đổi dấu âm dương (+/-).
- **[SC-02] Xử lý ngoại lệ an toàn:**
  - Phát hiện và thông báo lỗi chia cho 0 (`Error: Division by zero`).
  - Chống nhập nhiều dấu chấm thập phân (`.`) trong cùng một số.
  - Sửa lỗi chính xác dấu phẩy động trong Javascript (Ví dụ: `0.1 + 0.2` ra đúng `0.3` thay vì `0.30000000000000004`).
- **[SC-03] Lịch sử tính toán:** 
  - Lưu trữ lịch sử tức thì vào `LocalStorage`.
  - Khôi phục phép tính cũ từ lịch sử để tính toán tiếp.
  - Xóa lịch sử nhanh gọn.
- **[SC-04] Trải nghiệm người dùng:**
  - Hỗ trợ đầy đủ phím tắt từ bàn phím vật lý.
  - Giao diện phản hồi xúc giác (Haptic-like button states).

---

## 📂 Cấu trúc thư mục dự án

```text
pocket-calculator/
├── package.json
├── server.js
├── public/
│   ├── index.html
│   ├── style.css
│   └── app.js
└── tests/
    └── calculator.spec.js
```

---

## 🛠️ Hướng dẫn cài đặt & Khởi chạy

### Bước 1: Cài đặt các thư viện phụ thuộc
Mở Terminal tại thư mục gốc và chạy lệnh:
```bash
npm install
```

### Bước 2: Khởi chạy máy chủ Web
Để khởi chạy ứng dụng, chạy lệnh sau:
```bash
npm start
```
Ứng dụng sẽ hoạt động tại địa chỉ: [http://localhost:3000](http://localhost:3000)

### Bước 3: Chạy Kiểm thử tự động (E2E Test với Playwright)
Để đảm bảo tất cả các chức năng hoạt động hoàn hảo và không có lỗi hồi quy:
```bash
npm test
```

---

## ⌨️ Danh sách phím tắt hỗ trợ (Keyboard Shortcuts)
- **Số `0-9` và dấu `.`** : Nhập số và dấu thập phân.
- **`+`, `-`, `*`, `/`** : Các phép toán cơ bản.
- **`Enter` hoặc `=`** : Thực hiện tính toán kết quả.
- **`Backspace`** : Xóa ký tự cuối cùng vừa nhập.
- **`Escape` hoặc `c` / `C`** : Xóa sạch toàn bộ màn hình (Clear All).
- **`%`** : Chia lấy phần trăm.
```

---