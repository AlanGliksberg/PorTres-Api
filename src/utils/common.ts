export const convertStringIntoArray = <P = string>(data: string | string[] | undefined): P[] => {
  if (!data) return [];

  if (Array.isArray(data)) return data as P[];

  if (data.includes(",")) {
    return (data as string).split(",").map((g) => g.trim()) as P[];
  }

  return [data as P];
};

export const parsePagesFilters = (page: string, pageSize: string): [number, number] => {
  const pageNumber = parseInt(page, 10) || 1;
  const pageSizeNumber = parseInt(pageSize, 10) || 10;
  return [pageNumber, pageSizeNumber];
};
