import { Request as R } from 'express';

export type Request<P = any> = R<any, any, P, P>;