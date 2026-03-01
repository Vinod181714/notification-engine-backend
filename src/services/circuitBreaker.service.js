class CircuitBreaker {
  constructor() {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
    this.lastFailureTime = null;
    this.failureThreshold = parseInt(process.env.AI_FAILURE_THRESHOLD || '5', 10);
    this.resetTimeout = parseInt(process.env.AI_RESET_TIMEOUT_MS || '30000', 10);
  }

  reportSuccess() {
    if (this.state === 'HALF_OPEN') {
      this.successCount += 1;
      if (this.successCount > 1) {
        this._reset();
      }
    }
  }

  reportFailure() {
    this.failureCount += 1;
    this.lastFailureTime = Date.now();
    if (this.state === 'HALF_OPEN' || this.failureCount >= this.failureThreshold) {
      this._open();
    }
  }

  _open() {
    this.state = 'OPEN';
    setTimeout(() => this._halfOpen(), this.resetTimeout);
  }

  _halfOpen() {
    this.state = 'HALF_OPEN';
    this.successCount = 0;
    this.failureCount = 0;
  }

  _reset() {
    this.state = 'CLOSED';
    this.successCount = 0;
    this.failureCount = 0;
  }

  getStatus() {
    return this.state;
  }
}

const breaker = new CircuitBreaker();
module.exports = breaker;