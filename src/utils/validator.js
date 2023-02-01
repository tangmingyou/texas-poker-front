
// 判断数据是否为空
export const isEmpty = data => {
  return data === undefined || data === null || data === '' ||
      (Array.isArray(data) && data.length === 0) ||
      (typeof data === 'object' && Object.keys(data).length === 0);
}

// 如果数据为空, 则使用默认值
export const ifEmpty = (data, defaultValue) => {
  return isEmpty(data) ? defaultValue : data;
}
