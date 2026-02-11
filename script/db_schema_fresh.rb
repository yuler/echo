require_relative "../config/environment"

# Drop database, run migrate, to fresh the database schema for mysql and postgres
puts "Dumping database schema for sqlite"
system("bin/rails db:drop")
system("rm db/schema.rb") if File.exist?("db/schema.rb")
system("bin/rails db:migrate")
system("bin/rails db:setup")

puts "Dumping database schema for mysql"
system("DB_ADAPTER=mysql bin/rails db:drop")
system("rm db/schema.mysql.rb") if File.exist?("db/schema.mysql.rb")
system("DB_ADAPTER=mysql bin/rails db:migrate")
system("DB_ADAPTER=mysql bin/rails db:setup")

puts "Dumping database schema for postgres"
system("DB_ADAPTER=postgres bin/rails db:drop")
system("rm db/schema.postgres.rb") if File.exist?("db/schema.postgres.rb")
system("DB_ADAPTER=postgres bin/rails db:migrate")
system("DB_ADAPTER=postgres bin/rails db:setup")

puts "All done"
