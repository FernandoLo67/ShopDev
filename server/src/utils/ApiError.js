export class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
  }

  static badRequest(msg, details) {
    return new ApiError(400, msg, details);
  }

  static unauthorized(msg = 'No autorizado') {
    return new ApiError(401, msg);
  }

  static forbidden(msg = 'Acceso denegado') {
    return new ApiError(403, msg);
  }

  static notFound(msg = 'Recurso no encontrado') {
    return new ApiError(404, msg);
  }

  static conflict(msg) {
    return new ApiError(409, msg);
  }
}
