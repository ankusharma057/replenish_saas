class IntakeForm < ApplicationRecord
  attr_accessor :submitted

  belongs_to :employee
  has_many :response_intake_forms, dependent: :destroy

  has_many :treatment_intake_forms, dependent: :destroy
  has_many :treatments, through: :treatment_intake_forms, dependent: :destroy


  validates :name, presence: { message: "Name can't be blank"  }, uniqueness: { message: "Form name already exists" }
  validates :prompt_type, presence: { message: "Prompt type can't be blank"  }
  validates :valid_for, presence: { message: "Valid for can't be blank"  }
  validates :form_data, presence: { message: "Form data can't be blank"  }

  enum prompt_type: { automatic: 0, manual: 1 }

  enum appointment_type: { all_appointments: 0, specific_staff: 1, specific_treatment: 2 }

  def self.treatment_intake_forms(params)
    if params[:treatment_id].present?
      where.not(id: TreatmentIntakeForm.where(treatment_id: params[:treatment_id]).map(&:intake_form_id).uniq)
    else
      all
    end
  end

  def self.client_intake_forms(params, current_client)
    if params[:treatment_id].present? && current_client.present?
      intake_forms = IntakeForm.joins(:treatments).includes(:response_intake_forms).where(treatments: { id: params[:treatment_id] })

      intake_forms.each do |intake_form|
        if intake_form.response_intake_forms.blank?
          intake_form.submitted = false
        else
          intake_form.response_intake_forms.where(client_id: current_client.id).each do |response|
            if valid_response?(intake_form, response)
              intake_form.submitted = true
            else
              intake_form.submitted = false
            end
          end
        end
      end

      intake_forms
    else
      all
    end
  end

  def self.valid_response?(intake_form, response)
    if intake_form.effective_date.nil?
      is_effective_date_valid = true
    else
      is_effective_date_valid = response.created_at >= intake_form.effective_date
    end
    is_valid_for = intake_form.valid_for.present? || Date.today <= intake_form.valid_for_expired_date(response)
    is_effective_date_valid && is_valid_for
  end

  def valid_for_expired_date(response)
    return nil if valid_for == 'forever' || 'Forever'

    match = valid_for.match(/(\d+)\s*(\w+)/)
    return nil unless match

    duration = match[1].to_i
    unit = match[2]

    case unit.downcase
    when 'Day', 'Days', 'day', 'days'
      response.created_at + duration.days
    when 'Week', 'Weeks', 'week', 'weeks'
      response.created_at + duration.weeks
    when 'Month', 'Months', 'month', 'months'
      response.created_at + duration.months
    when 'Year', 'Years', 'year', 'years'
      response.created_at + duration.years
    else
      nil
    end
  end
end