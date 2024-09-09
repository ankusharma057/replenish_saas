class Api::ScheduleLocationsController < ApplicationController
  def index
    locations = Location.exclude_locations_for_employee(params)
    
    render json: locations, each_serializer: ScheduleLocationSerializer, status: :ok
  end
end
