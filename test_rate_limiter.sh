#!/bin/bash

# Configuration
API_KEY="sk-4abae6f232f6b19547a34e876c37d9a044ec26604588ddad"
ENDPOINT="/documentation/featured"
MAX_REQUESTS=15

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE} Starting Rate Limiter Test${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "API Key: ${YELLOW}${API_KEY}${NC}"
echo -e "Endpoint: ${YELLOW}${BASE_URL}${ENDPOINT}${NC}"
echo -e "Bucket Capacity: ${YELLOW}10 tokens${NC}"
echo -e "Fill Rate: ${YELLOW}1 token/second${NC}"
echo ""

# Function to make API request
make_request() {
    local request_num=$1
    local response=$(curl -s -w "\n%{http_code}" -X POST -H "x-api-key: ${API_KEY}" -H "Content-Type: application/json" -d '{"testMode": true}' "${BASE_URL}${ENDPOINT}")
    local body=$(echo "$response" | head -n -1)
    local status_code=$(echo "$response" | tail -n 1)
    
    if [ "$status_code" -eq 200 ] || [ "$status_code" -eq 201 ]; then
        echo -e "${GREEN}✅ Request ${request_num}: SUCCESS${NC} (Status: ${status_code})"
        echo -e "   Response: ${body}"
    elif [ "$status_code" -eq 429 ] || [ "$status_code" -eq 401 ]; then
        echo -e "${RED}❌ Request ${request_num}: RATE LIMITED${NC} (Status: ${status_code})"
        echo -e "   Response: ${body}"
    else
        echo -e "${YELLOW}⚠️  Request ${request_num}: UNEXPECTED${NC} (Status: ${status_code})"
        echo -e "   Response: ${body}"
    fi
    echo ""
}

# Test 1: Rapid fire requests to exhaust bucket
echo -e "${BLUE}Test 1: Rapid Fire Requests (should exhaust bucket)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

for i in $(seq 1 $MAX_REQUESTS); do
    make_request $i
    sleep 0.1
done

# Test 2: Wait for bucket refill and try again
echo -e "${BLUE}Test 2: Wait for Token Refill (3 seconds)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}⏳ Waiting 3 seconds for tokens to refill...${NC}"
sleep 3

echo -e "${YELLOW}🔄 Making requests after refill:${NC}"
for i in $(seq 1 5); do
    make_request "After-Refill-$i"
    sleep 0.1
done

# Test 3: Test with invalid API key
echo -e "${BLUE} Test 3: Invalid API Key${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}🔑 Testing with invalid API key...${NC}"

invalid_response=$(curl -s -w "\n%{http_code}" -X POST -H "x-api-key: invalid-key" -H "Content-Type: application/json" -d '{"testMode": true}' "${BASE_URL}${ENDPOINT}")
invalid_body=$(echo "$invalid_response" | head -n -1)
invalid_status=$(echo "$invalid_response" | tail -n 1)

if [ "$invalid_status" -eq 401 ]; then
    echo -e "${GREEN}✅ Invalid API Key Test: SUCCESS${NC} (Correctly rejected)"
    echo -e "   Response: ${invalid_body}"
else
    echo -e "${RED}❌ Invalid API Key Test: FAILED${NC} (Should be rejected)"
    echo -e "   Status: ${invalid_status}, Response: ${invalid_body}"
fi
echo ""

# Test 4: Test without API key
echo -e "${BLUE}📋 Test 4: Missing API Key${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}🚫 Testing without API key...${NC}"

no_key_response=$(curl -s -w "\n%{http_code}" -X POST -H "Content-Type: application/json" -d '{"testMode": true}' "${BASE_URL}${ENDPOINT}")
no_key_body=$(echo "$no_key_response" | head -n -1)
no_key_status=$(echo "$no_key_response" | tail -n 1)

if [ "$no_key_status" -eq 401 ]; then
    echo -e "${GREEN}✅ Missing API Key Test: SUCCESS${NC} (Correctly rejected)"
    echo -e "   Response: ${no_key_body}"
else
    echo -e "${RED}❌ Missing API Key Test: FAILED${NC} (Should be rejected)"
    echo -e "   Status: ${no_key_status}, Response: ${no_key_body}"
fi
echo ""

echo -e "${BLUE}🏁 Rate Limiter Test Complete!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}Expected Behavior:${NC}"
echo -e "• First ~10 requests should succeed (200/201)"
echo -e "• Remaining requests should be rate limited (429/401)"
echo -e "• After waiting, new requests should succeed"
echo -e "• Invalid/missing API keys should be rejected (401)"