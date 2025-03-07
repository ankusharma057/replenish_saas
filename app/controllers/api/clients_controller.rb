# frozen_string_literal: true

class Api::ClientsController < ApplicationController
  before_action :find_client, only: [:sign_in, :password_update]
  skip_before_action :authorized_employee

  def index
    clients = current_employee&.is_admin? ? Client.includes(:client_detail, :file_uploads, profile_photo_attachment: :blob) : current_employee&.clients
    clients = clients.includes(:employees) if clients.present?
    render json: clients, status: :ok
  end

  def profile
    client = Client.find_by(id: params[:id])
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
      render json: { error: client.errors.as_json }, status: 422
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
    client = Client.find_by(id: params[:id])
    if client.nil?
      render json: { error: 'Client not found' }, status: :not_found and return
    end
    permitted_params = client_params
    if permitted_params[:notification_settings].present?
      existing_settings = client.notification_settings || {}
      new_settings = permitted_params[:notification_settings]
      merged_settings = existing_settings.merge(new_settings)
      permitted_params[:notification_settings] = merged_settings
    end
    if client.update(permitted_params)
      render json: client, serializer: ClientSerializer, status: :ok
    else
      render json: { errors: client.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def list_files
    @client = Client.find_by(id: params[:id])
    
    if @client.nil?
      render json: { error: 'Client not found' }, status: :not_found and return
    end

    file_uploads = @client.file_uploads 
    if file_uploads.any?
      files = file_uploads.map do |file_upload|
        if file_upload.file_data.attached?
          {
            file_url: url_for(file_upload.file_data),
            description: file_upload.description,
            created_at: file_upload.created_at
          }
        else
          {
            description: file_upload.description,
            error: 'No file attached'
          }
        end
      end
      render json: { files: files }, status: :ok
    else
      render json: { message: 'No files uploaded for this client' }, status: :ok
    end
  end


  def upload_files
    @client = Client.find_by(id: params[:id])
    uploaded_file = params[:files]
    description = params[:descriptions] || "" 
    if uploaded_file.present?
      file_upload = @client.file_uploads.create(description: description)
      file_upload.file_data.attach(io: uploaded_file.tempfile, filename: uploaded_file.original_filename)
      if file_upload.save
        render json: { success: 'File uploaded successfully' }, status: :ok
      else
        render json: { error: 'Failed to upload file', details: file_upload.errors.full_messages }, status: :unprocessable_entity
      end
    else
      render json: { error: 'No file uploaded' }, status: :unprocessable_entity
    end
  end

  def delete_file
    file = @client.file_uploads.find(params[:file_id])
    file.purge
    render json: { message: 'File deleted successfully' }, status: :ok
  end

  def add_group
    @client = Client.find(params[:id])
    if @client.nil?
      render json: { error: 'Client not found' }, status: :not_found
      return
    end

    group_name = params[:group_name]
    client_id = params[:client_ids]    
    @client.groups ||= []
    existing_group = @client.groups.find { |group| group[:group_name] == group_name }
    
    if existing_group
      unless existing_group[:client_ids].include?(client_id)
        existing_group[:client_ids] << client_id
      end
      group_note = existing_group
    else
      next_id = @client.groups.size + 1 
      group_note = {
        id: next_id,
        group_name: group_name,
        client_ids: client_id
      }
      @client.groups << group_note
    end
    if @client.save
      render json: { message: "Client added to group #{group_name}", group: group_note }, status: :ok
    else
      render json: { error: 'Failed to add client to group' }, status: :unprocessable_entity
    end
  end

  def update_group
    @client = Client.find(params[:id])
    if @client.nil?
      render json: { error: 'Client not found' }, status: :not_found
      return
    end
    group_id = params[:group_id]
    if group_id.nil?
      render json: { error: 'Group ID is required to update a group' }, status: :unprocessable_entity
      return
    end    
    group = @client.groups.find { |g| g["id"] == group_id }

    if group.nil?
      render json: { error: "Group with ID #{group_id} not found" }, status: :not_found
      return
    end
    new_group_name = params[:new_group_name]
    new_client_ids = params[:client_ids]
    if new_group_name.present?
      group[:group_name] = new_group_name
    end
    if new_client_ids.present?
      group[:client_ids] = new_client_ids
    end
    if @client.save
      render json: { message: "Group updated successfully", groups: @client.groups }, status: :ok
    else
      render json: { error: 'Failed to update group' }, status: :unprocessable_entity
    end
  end

  def delete_group
    @client = Client.find(params[:id])
    if @client.nil?
      render json: { error: 'Client not found' }, status: :not_found
      return
    end

    group_id = params[:group_id]
    group = @client.groups.find { |g| g["id"] == group_id }

    if group.nil?
      render json: { error: "Group with ID #{group_id} not found" }, status: :not_found
      return
    end
    @client.groups.delete(group)
    if @client.save
      render json: { message: "Group with ID #{group_id} deleted successfully", groups: @client.groups }, status: :ok
    else
      render json: { error: 'Failed to delete group' }, status: :unprocessable_entity
    end
  end

  private

  def client_params
    params.require(:client).permit(
      :created_at,
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
      :profile_photo,
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
      online_booking_policy: [
        :online_booking_allowed,
        :online_booking_disabled
      ],
      online_booking_payment_policy: [
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



