import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { HTTP } from '../utils/statuscodes';

type SchemaTarget = 'body' | 'query' | 'params';

const validateRequest = (schema: Joi.ObjectSchema, target: SchemaTarget = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req[target], { abortEarly: false, stripUnknown: true });
    if (error) {
      const message = error.details.map((d) => d.message).join('; ');
      res.status(HTTP.BAD_REQUEST).json({ success: false, message });
      return;
    }
    req[target] = value;
    next();
  };
};

export default validateRequest;
