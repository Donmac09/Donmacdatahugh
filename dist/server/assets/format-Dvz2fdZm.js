const GHS = (n) => {
  const v = Number(n ?? 0);
  return `¢${v.toFixed(2)}`;
};
export {
  GHS as G
};
