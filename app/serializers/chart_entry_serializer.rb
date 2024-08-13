class ChartEntrySerializer < ActiveModel::Serializer
  attributes :id, :name, :chart_histroy, :employee, :client
end