class ProductSerializer < ActiveModel::Serializer
  attributes :id, :name, :product_type, :cost_price, :retail_price, :duration, :purchased_type
  has_many :invoices, serializer: InvoiceSerializer, if: -> { instance_options[:include_invoices] }
  has_many :treatments, serializer: TreatmentSerializer, if: -> { instance_options[:include_treatments] }

  def duration
    if @instance_options[:include_treatments]
      object.treatments&.last&.duration
    end
  end
end

