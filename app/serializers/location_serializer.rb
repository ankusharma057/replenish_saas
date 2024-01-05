class LocationSerializer < ActiveModel::Serializer
  attributes :id, :name

  def initialize(object, options = {})
    super
    @employees = options[:employees]
  end

  attribute :employees do
    object.employees if @employees
  end
end
