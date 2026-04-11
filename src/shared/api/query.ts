export interface AsyncState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export const createIdleState = <T>(): AsyncState<T> => ({
  data: null,
  error: null,
  loading: false,
});

export const createLoadingState = <T>(previousData: T | null = null): AsyncState<T> => ({
  data: previousData,
  error: null,
  loading: true,
});

export const createSuccessState = <T>(data: T): AsyncState<T> => ({
  data,
  error: null,
  loading: false,
});

export const createErrorState = <T>(message: string, previousData: T | null = null): AsyncState<T> => ({
  data: previousData,
  error: message,
  loading: false,
});
