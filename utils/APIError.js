class APIError {
  constructor(status, message) {
    this.status = status;
    this.message = message;
  }
}

export default APIError;
