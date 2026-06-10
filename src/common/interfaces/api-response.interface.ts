export interface CustomResponse<T> {
  status: number;
  message: string;
  code: string;
  data?: T;
  errors?: any;
  timestamp: string;
}
