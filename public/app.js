/**
 * Pocket Calculator Core State Machine
 * Phát triển bởi Vibecode Senior Full-Stack Developer
 */

class PocketCalculator {
  constructor() {
    this.expressionDisplay = document.getElementById('expression');
    this.outputDisplay = document.getElementById('display');
    this.historyList = document.getElementById('history-list');
    this.clearHistoryBtn = document.getElementById('clear-history-btn');
    this.noHistoryPlaceholder = document.getElementById('no-history-placeholder');

    // States initialization
    this.resetState();
    
    // Load existing history from LocalStorage
    this.history = JSON.parse(localStorage.getItem('calc_history')) || [];
    this.renderHistory();

    // Event registrations
    this.registerDomEvents();
    this.registerKeyboardEvents();
  }

  resetState() {
    this.currentVal = '0';
    this.previousVal = '';
    this.operator = null;
    this.isCalculated = false;
    this.hasError = false;
  }

  // --- BUSINESS LOGIC ---

  appendNumber(number) {
    if (this.hasError) return;

    if (this.isCalculated) {
      this.currentVal = number;
      this.isCalculated = false;
    } else {
      if (this.currentVal === '0') {
        this.currentVal = number;
      } else {
        this.currentVal += number;
      }
    }
    this.updateScreen();
  }

  appendDecimal() {
    if (this.hasError) return;

    if (this.isCalculated) {
      this.currentVal = '0.';
      this.isCalculated = false;
      this.updateScreen();
      return;
    }

    if (!this.currentVal.includes('.')) {
      this.currentVal += '.';
    }
    this.updateScreen();
  }

  setOperator(op) {
    if (this.hasError) return;

    if (this.operator && !this.isCalculated && this.currentVal !== '0' && this.currentVal !== '') {
      this.calculate();
    }

    if (this.hasError) return;

    this.operator = op;
    this.previousVal = this.currentVal;
    this.currentVal = '';
    this.isCalculated = false;
    this.updateScreen();
    this.highlightActiveOperator();
  }

  calculate() {
    if (this.hasError || !this.operator || this.previousVal === '') return;

    const prev = parseFloat(this.previousVal);
    const current = parseFloat(this.currentVal || this.previousVal);
    let result = 0;

    switch (this.operator) {
      case '+':
        result = prev + current;
        break;
      case '-':
        result = prev - current;
        break;
      case '*':
        result = prev * current;
        break;
      case '/':
        if (current === 0) {
          this.triggerError('Error: Division by zero');
          return;
        }
        result = prev / current;
        break;
      default:
        return;
    }

    // Fix float point errors e.g. 0.1 + 0.2
    result = this.stripPrecision(result);

    const formattedExpression = `${this.previousVal} ${this.getOpSymbol(this.operator)} ${this.currentVal || this.previousVal}`;
    this.addHistoryRecord(formattedExpression, result);

    this.currentVal = result.toString();
    this.operator = null;
    this.previousVal = '';
    this.isCalculated = true;
    this.updateScreen();
    this.clearOperatorHighlights();
  }

  toggleSign() {
    if (this.hasError) return;
    if (this.currentVal === '0' || this.currentVal === '') return;

    this.currentVal = (parseFloat(this.currentVal) * -1).toString();
    this.updateScreen();
  }

  applyPercent() {
    if (this.hasError) return;
    if (this.currentVal === '0' || this.currentVal === '') return;

    const val = parseFloat(this.currentVal);
    this.currentVal = this.stripPrecision(val / 100).toString();
    this.updateScreen();
  }

  backspace() {
    if (this.hasError || this.isCalculated) return;

    if (this.currentVal.length > 1) {
      this.currentVal = this.currentVal.slice(0, -1);
    } else {
      this.currentVal = '0';
    }
    this.updateScreen();
  }

  clear() {
    this.resetState();
    this.updateScreen();
    this.clearOperatorHighlights();
  }

  triggerError(msg) {
    this.hasError = true;
    this.currentVal = msg;
    this.updateScreen();
    this.clearOperatorHighlights();
  }

  stripPrecision(number, precision = 12) {
    return parseFloat(Number(number).toPrecision(precision));
  }

  getOpSymbol(op) {
    switch (op) {
      case '/': return '÷';
      case '*': return '×';
      case '-': return '−';
      case '+': return '+';
      default: return op;
    }
  }

  // --- UI CONTROLLER ---

  updateScreen() {
    // Top small display (Expression summary)
    if (this.hasError) {
      this.expressionDisplay.textContent = 'Trạng thái: Lỗi';
      this.outputDisplay.textContent = this.currentVal;
      return;
    }

    if (this.operator && this.previousVal !== '') {
      this.expressionDisplay.textContent = `${this.previousVal} ${this.getOpSymbol(this.operator)}`;
    } else {
      this.expressionDisplay.textContent = '';
    }

    // Primary display
    this.outputDisplay.textContent = this.formatDisplayNumber(this.currentVal);
  }

  formatDisplayNumber(valStr) {
    if (valStr.includes('Error')) return valStr;
    if (valStr === '') return '0';
    
    const parts = valStr.split('.');
    let integerPart = parts[0];
    const decimalPart = parts.length > 1 ? parts[1] : null;

    // Formatting thousands separators for high numbers
    const num = parseFloat(integerPart);
    if (!isNaN(num)) {
      integerPart = num.toLocaleString('en-US');
    }

    return decimalPart !== null ? `${integerPart}.${decimalPart}` : integerPart;
  }

  highlightActiveOperator() {
    this.clearOperatorHighlights();
    if (!this.operator) return;

    const opBtn = document.querySelector(`button[data-type="operator"][data-val="${this.operator}"]`);
    if (opBtn) {
      opBtn.classList.add('operator-active');
    }
  }

  clearOperatorHighlights() {
    document.querySelectorAll('button[data-type="operator"]').forEach(btn => {
      btn.classList.remove('operator-active');
    });
  }

  // --- HISTORY MANAGEMENT ---

  addHistoryRecord(expr, res) {
    const record = {
      id: Date.now(),
      expr: expr,
      res: res.toString()
    };
    this.history.unshift(record); // Prepend for LIFO flow
    if (this.history.length > 50) this.history.pop(); // Keep limit up to 50 items

    localStorage.setItem('calc_history', JSON.stringify(this.history));
    this.renderHistory();
  }

  renderHistory() {
    if (this.history.length === 0) {
      this.noHistoryPlaceholder.classList.remove('hidden');
      // Clear previous lists
      const existingItems = this.historyList.querySelectorAll('.history-item');
      existingItems.forEach(item => item.remove());
      return;
    }

    this.noHistoryPlaceholder.classList.add('hidden');
    // Remove only previous dynamic lists to prevent wiping structural placeholders
    const existingItems = this.historyList.querySelectorAll('.history-item');
    existingItems.forEach(item => item.remove());

    this.history.forEach(item => {
      const historyRow = document.createElement('div');
      historyRow.className = 'history-item bg-slate-800/40 p-3 rounded-xl border border-slate-800 hover:border-slate-700/80 transition duration-150 cursor-pointer flex flex-col items-end group';
      historyRow.innerHTML = `
        <span class="text-xs text-slate-500 font-mono tracking-wide group-hover:text-slate-400 transition-colors">${item.expr} =</span>
        <span class="text-emerald-400 font-bold font-mono text-base tracking-tight">${this.formatDisplayNumber(item.res)}</span>
      `;
      // Click on old history loads value back to calculator
      historyRow.addEventListener('click', () => {
        this.currentVal = item.res;
        this.previousVal = '';
        this.operator = null;
        this.isCalculated = true;
        this.hasError = false;
        this.updateScreen();
        this.clearOperatorHighlights();
      });

      this.historyList.appendChild(historyRow);
    });
  }

  clearAllHistory() {
    this.history = [];
    localStorage.removeItem('calc_history');
    this.renderHistory();
  }

  // --- EVENT ATTACHMENTS ---

  registerDomEvents() {
    // Physical button bindings
    document.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.getAttribute('data-type');
        const val = btn.getAttribute('data-val');

        switch (type) {
          case 'number':
            this.appendNumber(val);
            break;
          case 'decimal':
            this.appendDecimal();
            break;
          case 'operator':
            this.setOperator(val);
            break;
          case 'clear':
            this.clear();
            break;
          case 'sign':
            this.toggleSign();
            break;
          case 'percent':
            this.applyPercent();
            break;
          case 'backspace':
            this.backspace();
            break;
          case 'equals':
            this.calculate();
            break;
        }
      });
    });

    // Clear history button action
    this.clearHistoryBtn.addEventListener('click', () => this.clearAllHistory());
  }

  registerKeyboardEvents() {
    document.addEventListener('keydown', (e) => {
      // Prevent standard browser key behavior for page scrolls on Space/Enter
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
      }

      if (e.key >= '0' && e.key <= '9') {
        this.appendNumber(e.key);
      } else if (e.key === '.') {
        this.appendDecimal();
      } else if (['+', '-', '*', '/'].includes(e.key)) {
        this.setOperator(e.key);
      } else if (e.key === 'Enter' || e.key === '=') {
        this.calculate();
      } else if (e.key === 'Backspace') {
        this.backspace();
      } else if (e.key === 'Escape' || e.key.toLowerCase() === 'c') {
        this.clear();
      } else if (e.key === '%') {
        this.applyPercent();
      }
    });
  }
}

// Instantiate App once DOM is fully available
document.addEventListener('DOMContentLoaded', () => {
  window.AppInstance = new PocketCalculator();
});
```

---