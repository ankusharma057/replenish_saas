class Api::AvailabilitiesController < ApplicationController
  include AvailabilityConcern
  skip_before_action :authorized_employee

  def create
    create_availability
  end
end
