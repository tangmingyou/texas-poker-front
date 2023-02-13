
export const isIn = (value, ...values) => {
  if (!values) {
    return false;
  }
  if (values.length === 1 && Array.isArray(values[0])) {
    values = values[0];
  }
  for (let i = 0; i < values.length; i++) {
    if (values[i] === value) {
      return true;
    }
  }
  return false;
}
