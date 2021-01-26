export interface IDynamic {
  [key: string]: any;
}

export interface IQuery extends IDynamic {
  page: number;
  limit: number;
  keyword: string;
  skip: number;
}
