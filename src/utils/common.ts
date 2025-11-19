export const formatName = (value?: string | null) =>
  value ? value.trim().toLowerCase().replace(/\b\p{L}/gu, (char) => char.toUpperCase()) : "";

export const convertStringIntoArray = <P = string>(data: string | string[] | undefined): P[] => {
  if (!data) return [];

  if (Array.isArray(data)) return data as P[];

  if (data.includes(",")) {
    return (data as string).split(",").map((g) => g.trim()) as P[];
  }

  return [data as P];
};

export const convertStringIntoNumberArray = (data: string | string[] | undefined): number[] => {
  if (!data) return [];

  if (Array.isArray(data)) return data.map((item) => Number(item));

  if (data.includes(",")) {
    return (data as string).split(",").map((g) => Number(g));
  }

  return [Number(data)];
};

export const parsePagesFilters = (page: string, pageSize: string): [number, number] => {
  const pageNumber = parseInt(page, 10) || 1;
  const pageSizeNumber = parseInt(pageSize, 10) || 10;
  return [pageNumber, pageSizeNumber];
};

export const getDateFromString = (dateString: string | undefined | null): Date | undefined => {
  if (!dateString) return undefined;

  const [day, month, year] = dateString.split("/").map(Number);
  if (isNaN(day) || isNaN(month) || isNaN(year)) return undefined;

  return new Date(year, month - 1, day);
};

export const getTimeFromString = (timeString: string | undefined | null): Date | undefined => {
  if (!timeString) return undefined;

  const [hours, minutes] = timeString.split(":").map(Number);
  if (isNaN(hours) || isNaN(minutes)) return undefined;

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

export const getLocalMinFromDate = (date: Date): number => {
  // epoch en segundos (UTC)
  const epochSeconds = Math.floor(date.getTime() / 1000);

  // Pasamos a minutos UTC
  const minutesUtc = Math.floor(epochSeconds / 60);

  // Offset fijo AR = -180 minutos (UTC-3)
  const minutesLocal = minutesUtc - 180;

  // Normalizamos a rango 0..1439
  const localMin = ((minutesLocal % 1440) + 1440) % 1440;

  return localMin;
};
