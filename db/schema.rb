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

ActiveRecord::Schema[7.0].define(version: 2023_07_18_182432) do
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

  create_table "clients", force: :cascade do |t|
    t.string "name"
    t.integer "employee_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "employees", force: :cascade do |t|
    t.string "name"
    t.string "email"
    t.string "password_digest"
    t.boolean "is_admin"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "temp_password"
    t.boolean "gfe"
    t.integer "service_percentage"
    t.boolean "is_inv_manager"
    t.integer "retail_percentage", default: 0
  end

  create_table "employees_inventories", force: :cascade do |t|
    t.integer "employee_id"
    t.integer "product_id"
    t.integer "quantity"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "inventories", force: :cascade do |t|
    t.integer "product_id"
    t.integer "quantity"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "inventory_prompts", force: :cascade do |t|
    t.integer "employee_id"
    t.integer "product_id"
    t.integer "quantity"
    t.string "assigned_by", default: "Inventory Manager"
    t.boolean "is_accepted", default: false
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

  add_foreign_key "active_storage_attachments", "active_storage_blobs", column: "blob_id"
  add_foreign_key "active_storage_variant_records", "active_storage_blobs", column: "blob_id"
end
