export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, "0");
  const month = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};

export const formatSafe = (value: string) => {
  if (!value) return value;
  const date = new Date(value);

  if (isNaN(date.getTime())) {
    return value;
  }

  return formatDate(value);
};
