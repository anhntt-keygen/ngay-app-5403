/**
 * Pocket Calculator - Core Business Logic & State Machine
 */

class PocketCalculator {
  constructor() {
    this.displayPrimary = document.getElementById('display-primary');
    this.displayFormula = document.getElementById('display-formula');
    this.historyListContainer = document.getElementById('history-list');
    
    this.clearAll();
    this.loadHistoryFromStorage();
    this.registerEvents();
  }

  clearAll() {
    this.currentOperand = '0';
    this.previousOperand = '';
    this.operation = undefined;
    this.shouldResetScreen = false;
    this.isErrorState = false;
    this.updateDisplay();
    this.toggleButtonsState(false);
  }

  clearLastEntry() {
    if (this.isErrorState) {
      this.clearAll();
      return;
    }
    if (this.currentOperand.length <= 1) {
      this.currentOperand = '0';
    } else {
      this.currentOperand = this.currentOperand.slice(0, -1);
    }
    this.updateDisplay();
  }

  appendNumber(number) {
    if (this.isErrorState) return;
    
    // Nếu màn hình vừa hoàn tất một phép tính trước đó, nhấn số mới sẽ ghi đè lên
    if (this.shouldResetScreen) {
      this.currentOperand = '';
      this.shouldResetScreen = false;
    }

    // Ngăn chặn nhập nhiều dấu thập phân liên tiếp trong cùng một số
    if (number === '.' && this.currentOperand.includes('.')) return;

    // Quản lý số 0 ở đầu
    if (this.currentOperand === '0' && number !== '.') {
      this.currentOperand = number;
    } else {
      this.currentOperand += number;
    }
    
    this.updateDisplay();
  }

  chooseOperation(op) {
    if (this.isErrorState) return;
    if (this.currentOperand === '') return;
    
    if (this.previousOperand !== '') {
      this.compute();
      if (this.isErrorState) return;
    }

    this.operation = op;
    this.previousOperand = this.currentOperand;
    this.currentOperand = '';
    this.shouldResetScreen = false;
    this.updateDisplay();
  }

  /**
   * Tính toán chính xác bằng cách khử sai số dấu phẩy động (Floating point precision)
   */
  compute() {
    let result;
    const prev = parseFloat(this.previousOperand);
    const current = parseFloat(this.currentOperand);

    if (isNaN(prev) || isNaN(current)) return;

    // Giải quyết vấn đề chia cho 0
    if (this.operation === '/' && current === 0) {
      this.handleError("Error: Division by zero");
      return;
    }

    // Triệt tiêu sai số dấu phẩy động của JS bằng cách mở rộng tỷ lệ (Scale Factor)
    const multiplier = 100000000; // 10^8
    switch (this.operation) {
      case '+':
        result = (prev * multiplier + current * multiplier) / multiplier;
        break;
      case '-':
        result = (prev * multiplier - current * multiplier) / multiplier;
        break;
      case '*':
        result = ((prev * multiplier) * (current * multiplier)) / (multiplier * multiplier);
        break;
      case '/':
        result = (prev * multiplier) / (current * multiplier);
        break;
      default:
        return;
    }

    const fullFormula = `${this.previousOperand} ${this.formatOperator(this.operation)} ${this.currentOperand}`;
    
    // Tự động rút gọn định dạng số hiển thị tránh tràn màn hình (Làm tròn tối đa 8 số thập phân)
    this.currentOperand = this.formatResult(result);
    
    // Thêm vào lịch sử tính toán
    this.saveToHistory(fullFormula, this.currentOperand);

    this.operation = undefined;
    this.previousOperand = '';
    this.shouldResetScreen = true;
    this.updateDisplay();
  }

  formatResult(num) {
    if (isNaN(num)) return '0';
    // Nếu kết quả là số thập phân quá dài, làm tròn 8 chữ số
    if (num.toString().includes('.')) {
      return parseFloat(num.toFixed(8)).toString();
    }
    return num.toString();
  }

  formatOperator(op) {
    if (op === '*') return '×';
    if (op === '/') return '÷';
    return op;
  }

  handleError(msg) {
    this.currentOperand = msg;
    this.previousOperand = '';
    this.operation = undefined;
    this.isErrorState = true;
    this.updateDisplay();
    this.toggleButtonsState(true);
  }

  toggleButtonsState(disabled) {
    // Vô hiệu hóa tất cả các nút toán tử và số trừ nút Clear 'C' khi rơi vào trạng thái Error
    const buttons = document.querySelectorAll('.btn:not(#btn-clear)');
    buttons.forEach(btn => {
      btn.disabled = disabled;
    });
  }

  updateDisplay() {
    this.displayPrimary.innerText = this.currentOperand;
    if (this.operation != null) {
      this.displayFormula.innerText = `${this.previousOperand} ${this.formatOperator(this.operation)}`;
    } else {
      this.displayFormula.innerText = '';
    }
  }

  // --- PHÂN HỆ QUẢN LÝ LỊCH SỬ ---
  saveToHistory(formula, result) {
    const item = { formula, result, timestamp: Date.now() };
    let history = this.getHistory();
    history.unshift(item); // Đưa lên đầu danh sách
    // Lưu tối đa 20 dòng lịch sử gần nhất
    if (history.length > 20) history.pop();
    localStorage.setItem('calc_history', JSON.stringify(history));
    this.renderHistory();
  }

  getHistory() {
    const raw = localStorage.getItem('calc_history');
    return raw ? JSON.parse(raw) : [];
  }

  loadHistoryFromStorage() {
    this.renderHistory();
  }

  clearHistory() {
    localStorage.removeItem('calc_history');
    this.renderHistory();
  }

  renderHistory() {
    const history = this.getHistory();
    this.historyListContainer.innerHTML = '';

    if (history.length === 0) {
      this.historyListContainer.innerHTML = `
        <div class="text-slate-500 italic text-center py-8">Chưa có dữ liệu tính toán</div>
      `;
      return;
    }

    history.forEach(item => {
      const div = document.createElement('div');
      div.className = "bg-slate-900/60 hover:bg-slate-700/50 p-3 rounded-xl border border-slate-700/30 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] group relative";
      div.innerHTML = `
        <div class="text-xs text-slate-400 group-hover:text-slate-300 truncate">${item.formula} =</div>
        <div class="text-base font-bold text-emerald-400 truncate mt-1">${item.result}</div>
      `;
      // Khôi phục phép tính khi click vào mục lịch sử
      div.addEventListener('click', () => {
        if (this.isErrorState) return;
        this.currentOperand = item.result;
        this.previousOperand = '';
        this.operation = undefined;
        this.shouldResetScreen = true;
        this.updateDisplay();
      });
      this.historyListContainer.appendChild(div);
    });
  }

  // --- ĐỒNG BỘ SỰ KIỆN PHÍM CƠ & CLICK CHUỘT ---
  registerEvents() {
    // Sự kiện click nút bấm trên UI
    document.querySelectorAll('.btn').forEach(button => {
      button.addEventListener('click', () => {
        const val = button.getAttribute('data-val');
        this.handleInput(val);
        this.animateButtonClick(button);
      });
    });

    // Lắng nghe phím tắt vật lý (Physical Keyboard)
    document.addEventListener('keydown', (e) => {
      let key = e.key;
      
      // Chuẩn hóa các phím tắt
      if (key === 'Enter') key = '=';
      if (key === 'Escape') key = 'C';
      if (key === 'Backspace') key = 'Backspace';

      const validKeys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '+', '-', '*', '/', '=', 'C', 'Backspace'];
      if (validKeys.includes(key)) {
        e.preventDefault();
        this.handleInput(key);
        
        // Tìm button tương ứng trên UI để kích hoạt hiệu ứng ấn cơ học trực quan
        const btn = document.querySelector(`.btn[data-val="${key}"]`);
        if (btn) this.animateButtonClick(btn);
      }
    });

    // Sự kiện xóa lịch sử
    document.getElementById('btn-clear-history').addEventListener('click', () => {
      this.clearHistory();
    });
  }

  handleInput(input) {
    if (input === 'C') {
      this.clearAll();
    } else if (input === 'Backspace') {
      this.clearLastEntry();
    } else if (input === '=') {
      this.compute();
    } else if (['+', '-', '*', '/'].includes(input)) {
      this.chooseOperation(input);
    } else {
      this.appendNumber(input);
    }
  }

  animateButtonClick(button) {
    button.classList.add('active');
    setTimeout(() => {
      button.classList.remove('active');
    }, 100);
  }
}

// Khởi chạy ứng dụng
document.addEventListener('DOMContentLoaded', () => {
  window.calculator = new PocketCalculator();
});
```

---