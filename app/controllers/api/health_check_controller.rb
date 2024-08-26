class Api::HealthCheckController < ApplicationController
  skip_before_action :authorized_employee

  def index
    render json: {
      meta: {},
      data: {
        status: 'ok',
        gitsha: `git rev-parse HEAD`.chomp
      }
    }
  end
end
