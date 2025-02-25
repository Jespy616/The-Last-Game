package auth

import (
    "github.com/golang-jwt/jwt/v5"
)

func Create_Account(user map[string]string) {
    jwt.GetSigningMethod(user["hey"])
}