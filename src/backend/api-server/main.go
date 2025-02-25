package main

import (
    "fmt"
    "backend/auth"
)
func main() {
    fmt.Println("Hello, world!")
    myMap := make(map[string]string)

    // Adding key-value pairs to the map
    myMap["name"] = "John Doe"
    myMap["age"] = "30"
    myMap["city"] = "New York"

    auth.Create_Account(myMap)
}