# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[7.0].define(version: 2024_08_13_103542) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.string "service_name", null: false
    t.bigint "byte_size", null: false
    t.string "checksum"
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "active_storage_variant_records", force: :cascade do |t|
    t.bigint "blob_id", null: false
    t.string "variation_digest", null: false
    t.index ["blob_id", "variation_digest"], name: "index_active_storage_variant_records_uniqueness", unique: true
  end

  create_table "availabilities", force: :cascade do |t|
    t.date "availability_date"
    t.bigint "employee_location_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["employee_location_id"], name: "index_availabilities_on_employee_location_id"
  end

  create_table "availability_timings", force: :cascade do |t|
    t.time "start_time"
    t.time "end_time"
    t.bigint "availabilities_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["availabilities_id"], name: "index_availability_timings_on_availabilities_id"
  end

  create_table "chart_entries", force: :cascade do |t|
    t.string "name"
    t.jsonb "chart_histroy"
    t.bigint "employee_id", null: false
    t.bigint "client_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["client_id"], name: "index_chart_entries_on_client_id"
    t.index ["employee_id"], name: "index_chart_entries_on_employee_id"
  end

  create_table "clients", force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "email"
    t.string "temp_password"
    t.string "password_digest"
    t.string "stripe_id"
    t.string "timezone", default: "UTC"
  end

  create_table "employee_clients", force: :cascade do |t|
    t.bigint "employee_id", null: false
    t.bigint "client_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["client_id"], name: "index_employee_clients_on_client_id"
    t.index ["employee_id"], name: "index_employee_clients_on_employee_id"
  end

  create_table "employee_locations", force: :cascade do |t|
    t.bigint "employee_id", null: false
    t.bigint "location_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["employee_id"], name: "index_employee_locations_on_employee_id"
    t.index ["location_id"], name: "index_employee_locations_on_location_id"
  end

  create_table "employee_mentors", force: :cascade do |t|
    t.integer "employee_id"
    t.integer "mentor_id"
    t.integer "mentor_percentage", default: 0, null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "employees", force: :cascade do |t|
    t.string "name"
    t.string "email"
    t.string "password_digest"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "temp_password"
    t.boolean "gfe"
    t.integer "service_percentage"
    t.integer "retail_percentage", default: 0
    t.string "has_access_only_to", default: "all"
    t.string "vendor_name"
    t.string "reference_number"
    t.boolean "pay_50", default: false
  end

  create_table "employees_inventories", force: :cascade do |t|
    t.integer "employee_id"
    t.integer "product_id"
    t.float "quantity"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "employees_roles", id: false, force: :cascade do |t|
    t.bigint "employee_id"
    t.bigint "role_id"
    t.index ["employee_id", "role_id"], name: "index_employees_roles_on_employee_id_and_role_id"
    t.index ["employee_id"], name: "index_employees_roles_on_employee_id"
    t.index ["role_id"], name: "index_employees_roles_on_role_id"
  end

  create_table "intake_forms", force: :cascade do |t|
    t.string "name"
    t.integer "prompt_type"
    t.date "effective_date"
    t.string "valid_for"
    t.text "introduction"
    t.jsonb "form_data"
    t.bigint "employee_id", null: false
    t.boolean "deleted", default: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["employee_id"], name: "index_intake_forms_on_employee_id"
  end

  create_table "inventories", force: :cascade do |t|
    t.integer "product_id"
    t.float "quantity"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "inventory_prompts", force: :cascade do |t|
    t.integer "employee_id"
    t.integer "product_id"
    t.float "quantity"
    t.string "assigned_by", default: "Inventory Manager"
    t.boolean "is_accepted", default: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "inventory_requests", force: :cascade do |t|
    t.integer "requestor_id"
    t.float "quantity_asked"
    t.datetime "date_of_use"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "is_approved", default: false
    t.integer "inventory_id"
  end

  create_table "invoice_groups", force: :cascade do |t|
    t.boolean "finalized_totally", default: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "invoices", force: :cascade do |t|
    t.string "employee_id"
    t.integer "client_id"
    t.float "charge"
    t.boolean "is_finalized", default: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.date "date_of_service"
    t.integer "paid_by_client_cash"
    t.integer "paid_by_client_credit"
    t.text "comments"
    t.integer "personal_discount"
    t.integer "tip"
    t.boolean "concierge_fee_paid"
    t.boolean "gfe"
    t.string "overhead_fee_type"
    t.float "overhead_fee_value"
    t.jsonb "products_hash", default: {}
    t.boolean "semag_consult_fee", default: false
    t.integer "invoice_group_id"
    t.float "total_consumable_cost"
    t.integer "source_invoice_id"
  end

  create_table "locations", force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "payments", force: :cascade do |t|
    t.string "session_id"
    t.string "status"
    t.bigint "client_id"
    t.bigint "schedule_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "amount"
    t.index ["client_id"], name: "index_payments_on_client_id"
    t.index ["schedule_id"], name: "index_payments_on_schedule_id"
  end

  create_table "products", force: :cascade do |t|
    t.string "name"
    t.string "product_type"
    t.float "cost_price"
    t.float "retail_price"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "products_invoices", force: :cascade do |t|
    t.integer "invoice_id"
    t.integer "product_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "questionnaires", force: :cascade do |t|
    t.string "name"
    t.jsonb "template"
    t.bigint "employee_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["employee_id"], name: "index_questionnaires_on_employee_id"
  end

  create_table "response_intake_forms", force: :cascade do |t|
    t.integer "intake_form_id", null: false
    t.integer "client_id", null: false
    t.jsonb "response_form_data"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "roles", force: :cascade do |t|
    t.string "name"
    t.string "resource_type"
    t.bigint "resource_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["name", "resource_type", "resource_id"], name: "index_roles_on_name_and_resource_type_and_resource_id"
    t.index ["resource_type", "resource_id"], name: "index_roles_on_resource"
  end

  create_table "schedules", force: :cascade do |t|
    t.string "product_type"
    t.datetime "start_time"
    t.datetime "end_time"
    t.datetime "date"
    t.bigint "employee_id", null: false
    t.bigint "product_id", null: false
    t.bigint "client_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "treatment_id"
    t.integer "location_id"
    t.string "reminder", default: [], array: true
    t.integer "cancelled_by"
    t.datetime "cancelled_at"
    t.boolean "is_cancelled", default: false
    t.index ["client_id"], name: "index_schedules_on_client_id"
    t.index ["employee_id"], name: "index_schedules_on_employee_id"
    t.index ["product_id"], name: "index_schedules_on_product_id"
    t.index ["treatment_id"], name: "index_schedules_on_treatment_id"
  end

  create_table "treatment_intake_forms", force: :cascade do |t|
    t.bigint "treatment_id", null: false
    t.bigint "intake_form_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["intake_form_id"], name: "index_treatment_intake_forms_on_intake_form_id"
    t.index ["treatment_id"], name: "index_treatment_intake_forms_on_treatment_id"
  end

  create_table "treatments", force: :cascade do |t|
    t.string "name"
    t.string "duration"
    t.bigint "product_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "created_by"
    t.text "description"
    t.float "cost"
    t.integer "quantity"
    t.index ["product_id"], name: "index_treatments_on_product_id"
  end

  create_table "unavailabilities", force: :cascade do |t|
    t.datetime "start_time"
    t.datetime "end_time"
    t.boolean "available"
    t.bigint "employee_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "every_week", default: false
    t.index ["employee_id"], name: "index_unavailabilities_on_employee_id"
  end

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
  add_foreign_key "availabilities", "employee_locations"
  add_foreign_key "availability_timings", "availabilities", column: "availabilities_id"
  add_foreign_key "chart_entries", "clients"
  add_foreign_key "chart_entries", "employees"
  add_foreign_key "employee_clients", "clients"
  add_foreign_key "employee_clients", "employees"
  add_foreign_key "employee_locations", "employees"
  add_foreign_key "employee_locations", "locations"
  add_foreign_key "intake_forms", "employees"
  add_foreign_key "questionnaires", "employees"
  add_foreign_key "schedules", "clients"
  add_foreign_key "schedules", "employees"
  add_foreign_key "schedules", "products"
  add_foreign_key "schedules", "treatments"
  add_foreign_key "treatment_intake_forms", "intake_forms"
  add_foreign_key "treatment_intake_forms", "treatments"
  add_foreign_key "unavailabilities", "employees"
end
