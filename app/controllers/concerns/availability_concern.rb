module AvailabilityConcern
  extend ActiveSupport::Concern

  def create_or_update_availability
    create_or_update_availability_with_timings
    render json: { success: true }
  rescue StandardError => e
    render json: { error: e.message }, status: :unprocessable_entity
  end

  def availability_params
    params.require(:availability).permit(:employee_id, :location_id, :start_date, :end_date, 
                                           availability_timings: [:day, timings: [:start_time, :end_time]])
  end

  def create_or_update_availability_with_timings
    params_with_employee_location = availability_params
    employee_location = EmployeeLocation.find_by(employee_id: params_with_employee_location[:employee_id],
                                                 location_id: params_with_employee_location[:location_id])

    unless employee_location
      raise StandardError.new('Employee location not found')
    end

    start_date = Date.parse(params_with_employee_location[:start_date])
    end_date = Date.parse(params_with_employee_location[:end_date])
    availability_timings = params_with_employee_location[:availability_timings]

    all_availabilities = []
    (start_date..end_date).each do |date|
      if date > Date.today
        day = date.strftime('%A').downcase
        matching_timings = availability_timings.find { |timing| timing[:day].downcase == day }

        if matching_timings
          availability = Availabilities.find_or_initialize_by(
            employee_location_id: employee_location.id,
            availability_date: date,
          )
          availabilities = []

          matching_timings[:timings].each do |timing|
            availabilities << availability.availability_timings.build(start_time: timing[:start_time], end_time: timing[:end_time])
          end
          availability.availability_timings = availabilities

          availability.save!
          all_availabilities << availability
        end
      end
    end

    all_availabilities
  end
end
