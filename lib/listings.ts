// Indian-style pricing: ₹ with Cr / Lakh abbreviations for large values
export const price = (n: number) => {
  if (n >= 10000000) {
    const v = (n / 10000000).toFixed(2).replace(/\.?0+$/, "");
    return `₹${v} Cr`;
  }
  if (n >= 100000) {
    const v = (n / 100000).toFixed(2).replace(/\.?0+$/, "");
    return `₹${v} L`;
  }
  return "₹" + n.toLocaleString("en-IN");
};
