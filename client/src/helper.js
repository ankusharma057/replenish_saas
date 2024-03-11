/**
 * remove same elements from both arrays
 *
 */
export const removeDuplicateElements = (arr1, arr2) => {
  let array1 = [...arr1];
  let array2 = [...arr2];

  arr1.map((i, index1) => {
    arr2.map((j, index2) => {
      if (i == j) {
        array1[index1] = "";
        array2[index2] = "";
      }
    });
  });

  const updatedArray1 = array1.filter((item) => item !== "");
  const updatedArray2 = array2.filter((item) => item !== "");
  return { updatedArray1, updatedArray2 };
};

export const getDatesInRange = (startDate, endDate) => {
  const date = new Date(startDate);

  const dates = [];
  while (date <= new Date(endDate)) {
    dates.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return dates;
};
