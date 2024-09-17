class EmployeesOnlySerializer < ActiveModel::Serializer
  attributes :id, :name, :vendor_name, :email, :password, :gfe,
  :service_percentage, :retail_percentage, :pay_50, :employees_inventories, :has_access_only_to, :reference_number,
  :is_admin, :is_inv_manager, :is_mentor, :employee_locations, :employee_mentors

  def employee_locations
    object.employee_locations.map do |loc|
      {
        id: loc.id,
        location: {
          id: loc.location.id,
          name: loc.location.name
        }
      }
    end
  end

  def employees_inventories
    object.employees_inventories.map do |emp_inv|
      {
        id: emp_inv.id,
        product: {
          id: emp_inv.product.id,
          name: emp_inv.product.name
        },
        quantity: emp_inv.quantity
      }
    end
  end

  def employee_mentors
    object.employee_mentors.map do |ment|
      {
        id: ment.id,
        mentor_percentage: ment.mentor_percentage,
        mentor: {
          id: ment.mentor.id,
          name: ment.mentor.name
        }
      }
    end
  end

  def is_admin
    object.is_admin?
  end

  def is_inv_manager
    object.is_inv_manager?
  end

  def is_mentor
    object.is_mentor?
  end 
end