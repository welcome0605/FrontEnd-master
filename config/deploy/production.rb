server "app.digitalkasten.de", user: "deployer", roles: %w{app db web production}
set :deploy_to, '/home/deployer/apps_production/app_frontend'

# Default branch is :master
set :branch, 'master'

set :default_env, {
    'NODE_ENV' => 'production'
}
