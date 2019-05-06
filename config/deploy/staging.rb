server "staging.digitalkasten.de", user: "deployer", roles: %w{app db web staging}
set :deploy_to, '/home/deployer/apps_staging/app_frontend'

# Default branch is :master
set :branch, 'staging'

set :default_env, {
    'NODE_ENV' => 'staging'
}
