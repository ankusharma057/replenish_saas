class DataFilterService {
  specialInvManeger(invList, accessFiled, isAdmin, isProductList) {
    if (accessFiled === "all" || isAdmin) {
      return invList;
    } else {
      if (isProductList) {
        return invList?.filter((inventory) => {
          return inventory?.product_type !== accessFiled;
        });
      } else {
        return invList?.filter((inventory) => {
          return accessFiled?.includes(inventory?.product?.product_type);
        });
      }
    }
  }

  totalEmployeesInventory(data, authUserState) {
    const result = {};
    // Loop through the data
    data?.forEach((employee) => {
      // Loop through each employee's inventories
      employee.employees_inventories?.forEach((inventory) => {
        // Check if the product type matches authUserState.user.has_access_only_to
        const productTypeMatches =
          authUserState.user?.has_access_only_to === "all" ||
          authUserState.user?.has_access_only_to?.includes(
            inventory?.product?.product_type
          );

        // Continue processing only if the product type matches
        if (productTypeMatches) {
          // Check if the product is already in the result
          if (!result[inventory?.product?.name]) {
            result[inventory?.product?.name] = [];
          }

          // Check if the employee is already in the product's array
          const existingEmployee = result[inventory?.product?.name].find(
            (item) => item?.employee_name === employee?.name
          );

          // If the employee is not in the array, add them with quantity
          if (!existingEmployee) {
            result[inventory?.product?.name].push({
              employee_name: employee?.name,
              total_quantity: inventory?.quantity,
            });
          } else {
            // If the employee is already in the array, update the quantity
            existingEmployee.total_quantity += inventory?.quantity;
          }
        }
      });
    });

    return result;
  }

  invoiceGroupByFinalized(invoiceList) {
    const groupedInvoices = invoiceList.reduce((groups, invoice) => {
      const key = invoice.is_finalized ? "finalized" : "non-finalized";
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(invoice);
      return groups;
    }, {});

    for (const key in groupedInvoices) {
      if (groupedInvoices.hasOwnProperty(key)) {
        groupedInvoices[key].sort((a, b) => b.id - a.id);
      }
    }
    return groupedInvoices;
  }
}

// eslint-disable-next-line import/no-anonymous-default-export
export default new DataFilterService();
