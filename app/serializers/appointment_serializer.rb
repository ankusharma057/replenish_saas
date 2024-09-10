class AppointmentSerializer < ActiveModel::Serializer
    attributes :id, :client, :product, :employee, :product_type, :treatment, :start_time, :end_time, :date, :total_amount, :paid_amount, :remaining_amount, :reminder, :location

    def client
      {
        id: object.client.id,
        name: object.client.name
      }
    end

    def product
      {
        id: object.product.id,
        name: object.product.name
      }
    end

    def employee
      {
        id: object.employee.id,
        name: object.employee.name
      }
    end

    def treatment
      {
        id: object.treatment.id,
        name: object.treatment.name
      }
    end

    def location
      {
        id: object.location.id,
        name: object.location.name
      }
    end
  
    def total_amount
      object.amount
    end
  
    def remaining_amount
      object.remaining_amt
    end
  
    def paid_amount
      object.paid_amt
    end
end