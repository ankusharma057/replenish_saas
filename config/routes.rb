Rails.application.routes.draw do

  namespace :api do
    resources :clients
    resources :employees, only: %i(index show create destroy update) do
      member do
        patch :update_inventories
      end
    end
    resources :invoices do
      member do
        post :finalize
        post :send_reject_mail
        get :download_attachment
      end
    end
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

    resources :inventory_requests, only: :create do
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
