export class NetworkError extends Error {
  constructor(message = "Network error") {
    super(message)
    this.name = "NetworkError"
  }
}

export class NotFoundError extends Error {
  constructor(message = "Not found") {
    super(message)
    this.name = "NotFoundError"
  }
}

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message)
    this.name = "UnauthorizedError"
  }
}

export class ForbiddenError extends Error {
  constructor(message = "Forbidden") {
    super(message)
    this.name = "ForbiddenError"
  }
}

export class BadRequestError extends Error {
  constructor(message = "Bad request") {
    super(message)
    this.name = "BadRequestError"
  }
}

export class InternalServerError extends Error {
  constructor(message = "Internal server error") {
    super(message)
    this.name = "InternalServerError"
  }
}

export class OrganisationNotFoundError extends Error {
  constructor(message = "Organisation not found") {
    super(message)
    this.name = "OrganisationNotFoundError"
  }
}
