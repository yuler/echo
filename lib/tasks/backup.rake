require "sshkit"
require "sshkit/dsl"
require "net/scp"
include SSHKit::DSL

namespace :backup do
  host = "8.140.255.169"
  user = "root"

  desc "Download the backup from server"
  task download: :environment do
    server_backup_path = "/data/backups"
    local_output_path = "./backups"

    ssh_host = SSHKit::Host.new("#{user}@#{host}")

    on ssh_host do
      dirs = capture(:ls, "-t", server_backup_path).split("\n")

      if dirs.empty?
        puts "No backup dirs found"
        next
      end

      puts "\nAvailable backup dirs:"
      dirs.each_with_index do |dir, index|
        dir_size = capture(:du, "-sh", "#{server_backup_path}/#{dir}").split("\t").first
        puts "#{index + 1}. #{dir} (#{dir_size})"
      end

      print "\nPlease select a backup directory (1-#{dirs.size}): "
      choice = STDIN.gets.chomp.to_i

      if choice.between?(1, dirs.size)
        selected_dir = dirs[choice - 1]
        local_path = File.join(local_output_path, selected_dir)

        FileUtils.mkdir_p(local_output_path)

        puts "\nStarting download #{selected_dir} ..."

        # 获取文件总大小
        total_size = capture(:du, "-sb", "#{server_backup_path}/#{selected_dir}").split("\t").first.to_i * 1024
        downloaded_size = 0
        last_percent = 0

        # Download w/ progress
        Net::SCP.start(host, user) do |scp|
          scp.download!("#{server_backup_path}/#{selected_dir}", local_output_path, recursive: true, preserve: true) do |ch, name, sent, total|
            # Update total progress
            downloaded_size += sent
            percent = (downloaded_size.to_f / total_size * 100).round(2)
            # Update display only when progress increases by 1%
            if percent != last_percent
              print "\rProgress: #{percent}% (#{downloaded_size} / #{total_size} bytes)"
              last_percent = percent
            end
          end
        end

        puts "\nDownload completed! Saved to: #{local_output_path}"
      else
        puts "Invalid selection"
      end
    end
  end

  desc "Import the backup to database & storage"
  task import: :environment do
    puts "Clean storage"
    FileUtils.rm_rf(Dir[Rails.root.join("storage/*")] - [ Rails.root.join("storage/.keep") ], secure: true)

    files = Dir[Rails.root.join("backups/*")]

    puts "\nAvailable backup files:"
    files.each_with_index do |file, index|
      puts "#{index + 1}. #{file.split("/").last}"
    end

    print "\nPlease select a backup file (1-#{files.size}): "
    choice = STDIN.gets.chomp.to_i

    if choice.between?(1, files.size)
      selected_file = files[choice - 1]
    else
      puts "Invalid selection"
      return
    end

    puts "Extract the backup"
    system("tar -xzf #{selected_file} --strip-components=1 -C ./backups")
    system("tar -xzf ./backups/archive.tar --strip-components=3 -C ./storage")

    puts "rails db:setup"
    system("rails db:setup")

    puts "rails db < backups/sqlite/reads_production/production.sql"
    system("rails db < backups/sqlite/reads_production/production.sql")

    # Clean up extracted files
    system("rm -rf ./backups/sqlite")
    system("rm -rf ./backups/archive.tar")
  end
end
