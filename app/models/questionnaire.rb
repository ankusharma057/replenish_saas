class Questionnaire < ApplicationRecord
  belongs_to :employee

  validates :name, presence: { message: "Name can't be blank"  }, uniqueness: { message: "Form name already exists" }
  validates :template, presence: { message: "Template can't be blank"  }
  
  def self.employee_questionnaires(params)
    if params[:employee_id].present?
      where(employee_id: params[:employee_id])
    else
      all
    end
  end
end
