export const constructDateFilter = (startDate: string, endDate: string) => {
  const filter: any = {};
  if (startDate && endDate) {
    filter.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  } else if (startDate) {
    filter.timestamp = { $gte: new Date(startDate) };
  } else if (endDate) {
    filter.timestamp = { $lte: new Date(endDate) };
  }
  return filter;
};
