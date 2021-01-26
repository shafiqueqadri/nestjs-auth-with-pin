import { IQuery } from 'src/interfaces';
import { trim } from 'lodash';
export const makeQuery = (query: IQuery): IQuery => {
  const keyword = trim(query.keyword) || '';
  const limit = Number(query.limit) || 10;
  const page = Number(query.page) || 1;
  const skip = (page - 1) * limit;
  return {
    ...query,
    keyword,
    limit,
    page,
    skip,
  };
};

const rgx = (key: string) => new RegExp(`.*${key}.*`);
export const searchable = (key: string) => ({
  $regex: rgx(key),
  $options: 'i',
});
