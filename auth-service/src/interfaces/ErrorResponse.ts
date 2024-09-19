import MessageResponse from './MessageResponse';
import {ValidationError} from "joi";

interface Imessage {
  field: string | number | boolean;
  errorCode: string | number;
  message: string;
}
export default interface ErrorResponse extends MessageResponse {
  stack?: string;
}

export const errorMessage = (errors: ValidationError, req? : any) => {
  const messages: Imessage[] = [];

  errors.details.forEach((error) => {
    if(error.path.length > 1){
      messages.push({
        field: `${error.path.join('.')}`,
        errorCode: 404,
        message: `${error.path[error.path.length - 1]} ${error.message}`
      })
    }else {
      messages.push({
        field: `${error.path.join('.')}`,
        errorCode: 404,
        message: `${error.path[0]} ${error.message}`
      })
    }
  });

  return messages;
}