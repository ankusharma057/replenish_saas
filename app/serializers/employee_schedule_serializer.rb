class EmployeeScheduleSerializer < ActiveModel::Serializer
  attributes :id, :name, :employee_locations

  def employee_locations
    object.employee_locations.map do |loc|
      {
        id: loc.id,
        employee: {
          id: loc.employee.id,
          name: loc.employee.name
        },
        location: {
          id: loc.location.id,
          name: loc.location.name
        }
      }
    end
  end
end