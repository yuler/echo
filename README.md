# reads


## 终端工具

这个项目包含一个 Golang 编写的终端工具，可以通过 socket 与 Rails 应用程序通信。

### 使用方法

1. 确保 Rails 服务器正在运行。
2. 编译 Golang 终端客户端：
   ```
   go build -o terminal_client cmd/terminal_client/main.go
   ```
3. 运行终端客户端：
   ```
   ./terminal_client
   ```
4. 在终端中输入命令，例如：
   - `hello World`
   - `add 5 3`

命令将被发送到 Rails 应用程序，由 Thor 解析并执行，然后将结果返回给终端。
