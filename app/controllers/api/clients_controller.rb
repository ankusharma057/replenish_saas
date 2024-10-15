# frozen_string_literal: true

class Api::ClientsController < ApplicationController
  before_action :find_client, only: [:sign_in, :password_update]
  skip_before_action :authorized_employee

  def index
    clients = current_employee&.is_admin? ? Client.all : current_employee&.clients
    clients = clients.includes(:employees) if clients.present?
    render json: clients, status: :ok
  end

  def profile
    client = Client.includes(:client_detail, :schedules).find_by(id: params[:id])
    if client
      render json: client, status: :ok
    else
      render json: { errors: "Not Authorized" }, status: :unauthorized
    end
  end

  def create
    client = Client.new(client_params)
    if client.save
      if (!current_employee.is_admin?)
        client.employee_ids = [current_employee.id]
      end

      session[:client_id] = client.id if params[:skip_login] != "true"
      render json: client, status: :ok
    else
      render json: { error: client.errors.as_json }, status: :ok
    end
  end

  def sign_in
    if @client && @client.authenticate(params[:password])
      session[:client_id] = @client.id
      render json: @client, status: :ok
    elsif trying_with_temp_password?
      session[:client_id] = @client.id
      render json: @client, status: 302
    else
      render json: { error: "Invalid email or password" }, status: 401
    end
  end

  def sign_out
    session.delete :client_id
    head :no_content
  end

  def password_update
    if @client.update!(password: params[:password], temp_password: nil)
      render json: @client, status: :ok
    else
      render json: {error: 'Failed to update password!'}, status: :unprocessable_entity
    end
  end

  def signup
    @employee = Employee.find_by(id: params[:employee_id])
    if @employee
      @employee.clients.create(sign_up_params)
      render json: { message: 'Signed up successfully' }, status: :created
    else
      render json: { error: 'Employee not found' }, status: :not_found
    end
  end

  def update
    client = Client.includes(:client_detail, :schedules).find_by(id: params[:id])
    if client.nil?
      render json: { error: 'Client not found' }, status: :not_found and return
    end
    if client.update(client_params)
       render json: client, serializer: ClientSerializer, status: :ok
    else
      render json: { errors: @client.errors.full_messages }, status: :unprocessable_entity
    end
  end


  private

  def client_params
    params.require(:client).permit(
      :created_at,
      :profile_photo,
      :email, 
      :name, 
      :last_name,
      :preferred_name,
      :pronouns,
      :prefix,
      :middle_name,
      :password, 
      :temp_password, 
      :address, 
      :phone_number,
      :online_Booking_Policy,
      :online_Booking_Payment_Policy,
      :how_heard_about_us,
      :referred_employee_id,
      notification_settings: [
        :email_reminder_2_days, 
        :sms_reminder_2_days, 
        :sms_reminder_24_hours, 
        :email_new_cancelled, 
        :email_waitlist_openings, 
        :sms_waitlist_openings, 
        :ok_to_send_marketing_emails, 
        :send_ratings_emails,
        :do_not_email
      ],
      online_Booking_Policy: [
        :online_booking_allowed,
        :online_booking_disabled
      ],
      online_Booking_Payment_Policy: [
        :no_payment_reqired,
        :requires_deposit,
        :requires_full_payment,
        :requires_credit_card_on_file
      ],
      client_detail_attributes: [  
        :city, 
        :state, 
        :zip_code, 
        :country, 
        :gender,
        :sex,
        :home_phone,
        :mobile_phone,
        :work_phone,
        :fax_phone,
        :date_of_birth, 
        :personal_health_number, 
        :family_doctor, 
        :family_doctor_phone, 
        :family_doctor_email, 
        :referring_professional, 
        :referring_professional_phone, 
        :referring_professional_email, 
        :emergency_contact, 
        :emergency_contact_phone, 
        :emergency_contact_relationship, 
        :parent_guardian, 
        :occupation, 
        :employer
      ]
    )
  end

  def random_str
    5.times.map { (4...8).map { ('a'..'z').to_a[rand(26)] }.join }.join("").gsub(/\s+/, "")
  end
  
  def find_client
    @client = Client.find_by("lower(email) = ?", params[:email]&.downcase)
  end

  def trying_with_temp_password?
    @client&.temp_password == params[:password]
  end
end



