namespace :deploy do
  desc 'install all the assets'
  task :build_assets do
    on roles(:production) do
      within "#{release_path}" do
        execute :npm, 'install'
        execute :npm, 'run', 'ionic:build --prod'
      end
    end
    on roles(:staging) do
      within "#{release_path}" do
        execute :npm, 'install'
        execute :npm, 'run', 'ionic:build'
      end
    end
  end
  before 'deploy:updated', 'deploy:build_assets'
end
