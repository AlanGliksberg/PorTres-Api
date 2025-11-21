import { Request as R } from "express";

export type Request<B = any, Q = B> = R<any, any, B, Q>;

export type PageFilterString = {
  page: string;
  pageSize: string;
};

export type PageFilterNumber = {
  page: number;
  pageSize: number;
};
