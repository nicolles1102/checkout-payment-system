import { Result } from './result';

describe('Result<T, E>', () => {
  describe('ok', () => {
    it('should create a successful result with a value', () => {
      const result = Result.ok<number, Error>(42);
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe(42);
      expect(result.error).toBeUndefined();
    });

    it('should create a successful result with a string value', () => {
      const result = Result.ok<string, Error>('hello');
      expect(result.isSuccess).toBe(true);
      expect(result.value).toBe('hello');
      expect(result.error).toBeUndefined();
    });

    it('should create a successful result with an object', () => {
      const obj = { id: '1', name: 'test' };
      const result = Result.ok<typeof obj, Error>(obj);
      expect(result.isSuccess).toBe(true);
      expect(result.value).toEqual(obj);
      expect(result.error).toBeUndefined();
    });
  });

  describe('fail', () => {
    it('should create a failed result with an error', () => {
      const error = new Error('Something went wrong');
      const result = Result.fail<number, Error>(error);
      expect(result.isSuccess).toBe(false);
      expect(result.error).toBe(error);
      expect(result.value).toBeUndefined();
    });

    it('should create a failed result with a custom error message', () => {
      const error = new Error('Not found');
      const result = Result.fail<unknown, Error>(error);
      expect(result.isSuccess).toBe(false);
      expect(result.error?.message).toBe('Not found');
    });
  });

  describe('type narrowing', () => {
    it('should allow accessing value when isSuccess is true', () => {
      const result = Result.ok<number, Error>(100);
      if (result.isSuccess) {
        expect(result.value).toBe(100);
      } else {
        fail('Should not reach here');
      }
    });

    it('should allow accessing error when isSuccess is false', () => {
      const result = Result.fail<number, Error>(new Error('fail'));
      if (!result.isSuccess) {
        expect(result.error).toBeDefined();
        expect(result.error!.message).toBe('fail');
      } else {
        fail('Should not reach here');
      }
    });
  });
});