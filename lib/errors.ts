// 도메인 에러. status 는 REST 응답 코드로 그대로 사용됩니다.
export class AppError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
    this.name = "ValidationError";
  }
}

export class InsufficientFundsError extends AppError {
  constructor(message = "잔액이 부족합니다.") {
    super(message, 400);
    this.name = "InsufficientFundsError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "학생을 찾을 수 없거나 QR이 만료되었습니다.") {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

export class AuthError extends AppError {
  constructor(message = "유효하지 않은 API 키입니다.") {
    super(message, 401);
    this.name = "AuthError";
  }
}

export class RateLimitError extends AppError {
  constructor(message = "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.") {
    super(message, 429);
    this.name = "RateLimitError";
  }
}
