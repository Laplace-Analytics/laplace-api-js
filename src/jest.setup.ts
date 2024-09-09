import 'jest';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeEmpty(): R;
    }
  }
}

expect.extend({
  toBeEmpty(received: any) {
    if (Array.isArray(received) || typeof received === 'string') {
      return {
        message: () => `expected ${received} to be empty`,
        pass: received.length === 0,
      };
    } else if (typeof received === 'object' && received !== null) {
      return {
        message: () => `expected ${received} to be empty`,
        pass: Object.keys(received).length === 0,
      };
    }
    return {
      message: () => `expected ${received} to be empty`,
      pass: false,
    };
  },
});