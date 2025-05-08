import { Request as R } from "express";

export type Request<P = any> = R<any, any, P, P>;

export type PageFilterString = {
  page: string;
  pageSize: string;
};

export type PageFilterNumber = {
  page: number;
  pageSize: number;
};
