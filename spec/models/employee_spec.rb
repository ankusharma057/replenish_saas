require 'rails_helper'

RSpec.describe Employee, type: :model do
  it 'is valid with valid attributes' do
    employee = Employee.new(email: 'test@example.com', password: 'password')
    expect(employee).to be_valid
  end
end
