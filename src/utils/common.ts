export const convertStringIntoArray = <P = string>(data: string | string[] | undefined): P[] => {
  if (!data) return [];

  if (Array.isArray(data)) return data as P[];

  if (data.includes(",")) {
    return (data as string).split(",").map((g) => g.trim()) as P[];
  }

  return [data as P];
};
