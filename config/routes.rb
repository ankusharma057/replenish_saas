Rails.application.routes.draw do
  require 'sidekiq/web'
mount Sidekiq::Web => '/sidekiq'

  namespace :api do
    get 'health_check', to: 'health_check#index'
    get 'config', to: 'config#index'
    
    namespace :stripe do
      get '/pricing', to: 'checkout#pricing'
      post '/checkout', to: 'checkout#checkout'
      post '/billing_portal', to: 'billing_portal#create'
    end
    
    namespace :client do
      post '/sign_up', to: 'registrations#sign_up'
      post '/log_in', to: 'sessions#create'
      delete '/log_out', to: 'sessions#destroy'
      post '/password_update', to: 'sessions#password_update'
      get '/profile', to: 'clients#profile'
      post '/stripe/success', to: 'stripe#success'
      get '/stripe/success', to: 'stripe#success'
      get '/employee_unavailability', to: 'schedules#employee_unavailability'
      get '/appointments', to: 'schedules#appointments'
      get '/balance_due_schedules', to: 'schedules#balance_due_schedules'
      resources :locations, only: [ :index, :create] do
        get :employees, on: :member
      end

      resources :stripe do
        collection do
          get '/session_status', to: 'stripe#session_status'
          get '/list_attached_cards', to: 'stripe#list_attached_cards'
          get '/card_success', to: 'stripe#card_success'
          post '/create_checkout_session', to: 'stripe#create_checkout_session'
          post '/create_save_card_checkout_session', to: 'stripe#create_save_card_checkout_session'
          post '/confirm_payment', to: 'stripe#confirm_payment'
          delete '/remove_card', to: 'stripe#remove_card'
        end
      end

      resources :employees, only: %i(index show)

      resources :intake_forms
      resources :response_intake_forms, only: %i(index show)

      resources :schedules, only: %i(index create show destroy) do
        post :remaining_pay, on: :member
        post :reminder, on: :member
      end

      resources :products, only: %i(index)
    end

    resources :treatments
    resources :unavailabilities
    resources :locations, only: [ :index, :create, :update, :show] do
      collection do
        post :reorder_location
        get :get_locations
      end
    end
    resources :schedules, only: [:index, :create, :destroy, :show, :update] do
      post :remaining_paid, on: :member 
      patch 'update_note/:note_id', to: 'schedules#update_note'
      delete 'delete_note/:note_id', to: 'schedules#delete_note'
    end

    resources :clients do
      collection do
        post :sign_in
        delete :sign_out
        post :password_update
        get :profile
        patch :update
      end

      member do
        get :list_files
        post :upload_files
        delete :delete_file
        post :add_group
        patch :update_group
        delete :delete_group
      end
    end

    resources :employees, only: %i(index show create destroy update) do
      member do
        patch :update_inventories
        patch :update_plan
        get :locations
      end
    end

    resources :invoices, except: :create do
      collection do
        post :finalize_multiple
      end

      member do
        post :email_receipt
        get :client_invoices
        get :print_receipt
        post :finalize
        post :send_reject_mail
        get :download_attachment
        put :update_images
        patch :mark_paid
      end
    end

    resources :invoice_groups, only: %i(index create)

    resources :products

    resources :inventories, only: [:index, :create, :update, :destroy] do
      member do
        post 'assign'
      end
    end

    resources :inventory_prompts, only: :create do
      member do
        post 'accept'
        post 'reject'
      end
    end

    resources :inventory_requests, only: [:index, :create] do
      member do
        post 'accept'
        post 'reject'
      end
    end

    resources :availabilities, only: [:index, :create, :show, :edit, :update, :destroy]

    resources :intake_forms
    resources :response_intake_forms
    resources :questionnaires
    resources :chart_entries
    resources :employee_schedules, only: [:index]
    resources :invoice_lists, only: [:index]
    resources :treatment_products, only: [:index]
    resources :schedule_locations, only: [:index]
    resources :schedule_clients, only: [:index]
    resources :schedule_treatments, only: [:index]
    resources :appointments, only: [:index]
    resources :employees_only, only: [:index]


    post 'employee_inventories/transfer', to: 'employee_inventories#transfer'

    # Define your application routes per the DSL in https://guides.rubyonrails.org/routi
    get '/', to: 'application#hello_world'
    get '/employees', to: 'employee#index'
    get '/myprofile', to: 'employee#show'
    get '/products', to: 'product#index'
    get '/greeting/:name', to: 'employees#name'
    delete '/logout', to: 'sessions#destroy'
    patch '/updateproduct/:id', to: 'products#update'
    post '/products/new', to: 'products#create'
    post '/employees/new', to: 'employees#create'
    get '/employees/:id/send_reset_password_link', to: 'employees#send_reset_password_link'
    patch '/employees/:id', to: 'employees#update'
    post '/employees/reset_password', to: 'employees#reset_password'
    post '/login', to: 'sessions#create'
    get '/clients', to: 'clients#index'
    delete '/products', to: 'products#destroy'
    get '/base_treatments', to: 'treatments#base_treatments'
    get '/client_schedules', to: 'schedules#get_client_schedule'
    get '/locations/:id/employees', to: 'employee_schedules#employees'
    get '/employee_invoices', to: 'invoice_lists#employee_invoices'
    get 'client_schedules_only', to: 'schedules#get_client_schedule_only'
    get '/mentorship_invoices', to: 'invoice_lists#mentorship_invoices'
    get '/export_invoices', to: 'invoice_lists#export_invoices'
    get '/summary', to: 'invoice_lists#summary'  
    get '/location_pdf', to: 'invoice_lists#location_pdf'  
    get '/mentors', to: 'employees#mentors'
    post 'add_note', to: 'schedules#add_note'
  end
  get '*path', to: "fallback#index", constraints: ->(req) { !req.xhr? && req.format.html?}
end
