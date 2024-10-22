package main

import (
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
	"strings"
)

const (
	serverAddr = "http://localhost:3000/terminal"
)

func main() {
	var command string
	command = strings.Join(os.Args[1:], " ")

	// Send command to server
	resp, err := http.Post(serverAddr, "text/plain", strings.NewReader(command))
	if err != nil {
		fmt.Println("Error sending command:", err)
		return
	}
	defer resp.Body.Close()

	// Read response from server
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		fmt.Println("Error reading response:", err)
		return
	}

	// Print the response
	fmt.Println(string(body))
}
