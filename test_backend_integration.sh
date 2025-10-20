#!/bin/bash

# Test API Endpoints Script
# This script tests all the API endpoints to ensure they're working correctly

BASE_URL="http://localhost:3000"

echo "🚀 Testing API Rate Limiter Backend Integration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test 1: Homepage
echo "📋 Test 1: Homepage"
echo "GET ${BASE_URL}/"
curl -s -w "\nStatus: %{http_code}\n" "${BASE_URL}/" | head -5
echo ""

# Test 2: Login Page
echo "📋 Test 2: Login Page"
echo "GET ${BASE_URL}/auth/login"
curl -s -w "\nStatus: %{http_code}\n" "${BASE_URL}/auth/login" | head -5
echo ""

# Test 3: Register Page
echo "📋 Test 3: Register Page"
echo "GET ${BASE_URL}/auth/register"
curl -s -w "\nStatus: %{http_code}\n" "${BASE_URL}/auth/register" | head -5
echo ""

# Test 4: User Registration
echo "📋 Test 4: User Registration API"
echo "POST ${BASE_URL}/auth/register"
REGISTER_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com", 
    "password": "SecurePass123!",
    "organization": "Test Org"
  }')

REGISTER_BODY=$(echo "$REGISTER_RESPONSE" | head -n -1)
REGISTER_STATUS=$(echo "$REGISTER_RESPONSE" | tail -n 1)

echo "$REGISTER_BODY"
echo "Status: $REGISTER_STATUS"
echo ""

# Test 5: User Login
echo "📋 Test 5: User Login API"
echo "POST ${BASE_URL}/auth/login"
LOGIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }')

LOGIN_BODY=$(echo "$LOGIN_RESPONSE" | head -n -1)
LOGIN_STATUS=$(echo "$LOGIN_RESPONSE" | tail -n 1)

echo "$LOGIN_BODY"
echo "Status: $LOGIN_STATUS"

# Extract token for authenticated requests
TOKEN=$(echo "$LOGIN_BODY" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo "Token extracted: ${TOKEN:0:20}..."
echo ""

# Test 6: Protected Dashboard (should work with token)
echo "📋 Test 6: Protected Dashboard"
echo "GET ${BASE_URL}/dashboard (with token)"
if [ ! -z "$TOKEN" ]; then
    curl -s -w "\nStatus: %{http_code}\n" "${BASE_URL}/dashboard" \
      -H "Authorization: Bearer $TOKEN" | head -5
else
    echo "❌ No token available, skipping authenticated tests"
fi
echo ""

# Test 7: Profile API
echo "📋 Test 7: Profile API"
echo "GET ${BASE_URL}/auth/profile (with token)"
if [ ! -z "$TOKEN" ]; then
    curl -s -w "\nStatus: %{http_code}\n" "${BASE_URL}/auth/profile" \
      -H "Authorization: Bearer $TOKEN"
else
    echo "❌ No token available, skipping"
fi
echo ""

# Test 8: API Keys Generation
echo "📋 Test 8: API Key Generation"
echo "POST ${BASE_URL}/api-keys/generate (with token)"
if [ ! -z "$TOKEN" ]; then
    API_KEY_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/api-keys/generate" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json")
    
    API_KEY_BODY=$(echo "$API_KEY_RESPONSE" | head -n -1)
    API_KEY_STATUS=$(echo "$API_KEY_RESPONSE" | tail -n 1)
    
    echo "$API_KEY_BODY"
    echo "Status: $API_KEY_STATUS"
    
    # Extract API key for rate limiting test
    GENERATED_API_KEY=$(echo "$API_KEY_BODY" | grep -o '"apiKey":"[^"]*"' | cut -d'"' -f4)
    if [ ! -z "$GENERATED_API_KEY" ]; then
        echo "Generated API Key: ${GENERATED_API_KEY:0:20}..."
    fi
else
    echo "❌ No token available, skipping"
fi
echo ""

# Test 9: List API Keys
echo "📋 Test 9: List API Keys"
echo "GET ${BASE_URL}/api-keys (with token)"
if [ ! -z "$TOKEN" ]; then
    curl -s -w "\nStatus: %{http_code}\n" "${BASE_URL}/api-keys" \
      -H "Authorization: Bearer $TOKEN"
else
    echo "❌ No token available, skipping"
fi
echo ""

# Test 10: Analytics Summary
echo "📋 Test 10: Analytics Summary"
echo "GET ${BASE_URL}/analytics/summary (with token)"
if [ ! -z "$TOKEN" ]; then
    curl -s -w "\nStatus: %{http_code}\n" "${BASE_URL}/analytics/summary" \
      -H "Authorization: Bearer $TOKEN"
else
    echo "❌ No token available, skipping"
fi
echo ""

# Test 11: Rate Limited Endpoint
echo "📋 Test 11: Rate Limited Endpoint"
echo "GET ${BASE_URL}/featured (with API key)"
if [ ! -z "$GENERATED_API_KEY" ]; then
    curl -s -w "\nStatus: %{http_code}\n" "${BASE_URL}/featured" \
      -H "x-api-key: $GENERATED_API_KEY"
else
    echo "❌ No API key available, skipping"
fi
echo ""

# Test 12: Unauthenticated Access (should fail)
echo "📋 Test 12: Unauthenticated Access Test"
echo "GET ${BASE_URL}/dashboard (no token - should fail)"
curl -s -w "\nStatus: %{http_code}\n" "${BASE_URL}/dashboard" | head -3
echo ""

echo "🏁 Backend Integration Tests Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ If you see status codes:"
echo "   • 200 for successful requests"
echo "   • 401 for unauthorized requests (expected)"
echo "   • HTML content for view pages"
echo "   • JSON responses for API endpoints"
echo "Then the backend integration is working correctly!"
