Rails.application.routes.draw do

  namespace :api do
    namespace :client do
      post '/sign_up', to: 'registrations#sign_up'
      post '/log_in', to: 'sessions#create'
      delete '/log_out', to: 'sessions#destroy'
      post '/password_update', to: 'sessions#password_update'
      get '/profile', to: 'clients#profile'

      resources :locations, only: [ :index, :create] do
        get :employees, on: :member
      end

      resources :employees, only: %i(index show)

      resources :schedules, only: %i(index create show)
      resources :products, only: %i(index)
    end

    resources :locations, only: [ :index, :create] do
      get :employees, on: :member
    end
    resources :schedules, only: [:index, :create]

    resources :clients do
      collection do
        post :sign_in
        delete :sign_out
        post :password_update
        get :profile
      end
    end

    resources :employees, only: %i(index show create destroy update) do
      member do
        patch :update_inventories
        get :locations
      end
    end

    resources :invoices, except: :create do
      collection do
        post :finalize_multiple
      end

      member do
        post :finalize
        post :send_reject_mail
        get :download_attachment
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
  
  end
  get '*path', to: "fallback#index", constraints: ->(req) { !req.xhr? && req.format.html?}
end
