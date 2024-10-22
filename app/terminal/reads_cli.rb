require "thor"
# require_relative "../terminalwire/thor"

class ReadsCLI < Thor
  # include Terminalwire::Thor

  package_name "reads"

  class_option :context, type: :hash

  no_commands do
    def stdout
      options[:context]&.stdout || $stdout
    end

    def stderr
      options[:context]&.stderr || $stderr
    end
  end

  desc "version", "Show version"
  def version
    stdout.puts "Terminal version 0.0.1"
  end

  desc "hello NAME", "Say hello to NAME"
  def hello(name)
    stdout.puts "Hello, #{name}!"
  end

  desc "add X Y", "Add two numbers X and Y"
  def add(x, y)
    result = x.to_i + y.to_i
    stdout.puts "The sum of #{x} and #{y} is #{result}"
  end

  def self.execute(command = "", *args)
    output = StringIO.new
    $stdout = output
    begin
      # 执行 Thor 命令
      self.start([ command ] + args)
    rescue => e
      output.puts "Error: #{e.message}"
    ensure
      # 还原标准输出
      $stdout = STDOUT
    end
    # 返回捕获的输出
    output.string
  end
end
