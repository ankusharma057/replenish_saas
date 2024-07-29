class RemoveAppointmentTypeFromIntakeForms < ActiveRecord::Migration[7.0]
  def change
    remove_column :intake_forms, :appointment_type, :integer
  end
end
