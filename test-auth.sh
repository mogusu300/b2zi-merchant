#!/bin/bash
# Authentication & Session Management Test Suite
# Run this after starting the dev server: npm run dev

API_URL="http://localhost:3000"
MERCHANT_EMAIL="test-merchant-$(date +%s)@test.com"
CUSTOMER_EMAIL="test-customer-$(date +%s)@test.com"
TEST_PASSWORD="TestPassword123!"

echo "=================================="
echo "B2Zi Auth & Session Management Tests"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper function to print results
test_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC}: $2"
    else
        echo -e "${RED}✗ FAIL${NC}: $2"
    fi
}

echo "Test 1: Check API Session Endpoint"
RESPONSE=$(curl -s -X GET "$API_URL/api/auth/session")
echo "Response: $RESPONSE"
echo ""

echo "Test 2: Register Merchant"
MERCHANT_RESPONSE=$(curl -s -X POST "$API_URL/api/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"businessName\": \"Test Store\",
    \"ownerName\": \"Test Owner\",
    \"email\": \"$MERCHANT_EMAIL\",
    \"phone\": \"+263771234567\",
    \"businessType\": \"retail\",
    \"businessAddress\": \"123 Test St\",
    \"password\": \"$TEST_PASSWORD\",
    \"idType\": \"nrc\"
  }")
echo "Response: $MERCHANT_RESPONSE"
if echo "$MERCHANT_RESPONSE" | grep -q "success"; then
    test_result 0 "Merchant registration"
else
    test_result 1 "Merchant registration"
fi
echo ""

echo "Test 3: Register Customer"
CUSTOMER_RESPONSE=$(curl -s -X POST "$API_URL/api/customers/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$CUSTOMER_EMAIL\",
    \"name\": \"Test Customer\",
    \"password\": \"$TEST_PASSWORD\",
    \"confirmPassword\": \"$TEST_PASSWORD\",
    \"phone\": \"+263771234567\"
  }")
echo "Response: $CUSTOMER_RESPONSE"
if echo "$CUSTOMER_RESPONSE" | grep -q "success"; then
    test_result 0 "Customer registration"
else
    test_result 1 "Customer registration"
fi
echo ""

echo "Test 4: Merchant Login"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/merchant/login" \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d "{
    \"email\": \"$MERCHANT_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }")
echo "Response: $LOGIN_RESPONSE"
if echo "$LOGIN_RESPONSE" | grep -q "success"; then
    test_result 0 "Merchant login"
    MERCHANT_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
else
    test_result 1 "Merchant login"
fi
echo ""

echo "Test 5: Customer Login"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/customers/login" \
  -H "Content-Type: application/json" \
  -c customer_cookies.txt \
  -d "{
    \"email\": \"$CUSTOMER_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }")
echo "Response: $LOGIN_RESPONSE"
if echo "$LOGIN_RESPONSE" | grep -q "success"; then
    test_result 0 "Customer login"
    CUSTOMER_TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
else
    test_result 1 "Customer login"
fi
echo ""

echo "Test 6: Check Session with Token"
if [ -n "$MERCHANT_TOKEN" ]; then
    SESSION_RESPONSE=$(curl -s -X GET "$API_URL/api/auth/session" \
      -H "Authorization: Bearer $MERCHANT_TOKEN")
    echo "Response: $SESSION_RESPONSE"
    if echo "$SESSION_RESPONSE" | grep -q "authenticated"; then
        test_result 0 "Session check with token"
    else
        test_result 1 "Session check with token"
    fi
fi
echo ""

echo "Test 7: Merchant Logout"
LOGOUT_RESPONSE=$(curl -s -X POST "$API_URL/api/merchant/logout" \
  -b cookies.txt)
echo "Response: $LOGOUT_RESPONSE"
if echo "$LOGOUT_RESPONSE" | grep -q "success"; then
    test_result 0 "Merchant logout"
else
    test_result 1 "Merchant logout"
fi
echo ""

echo "Test 8: Customer Logout"
LOGOUT_RESPONSE=$(curl -s -X POST "$API_URL/api/customers/logout" \
  -b customer_cookies.txt)
echo "Response: $LOGOUT_RESPONSE"
if echo "$LOGOUT_RESPONSE" | grep -q "success"; then
    test_result 0 "Customer logout"
else
    test_result 1 "Customer logout"
fi
echo ""

echo "Test 9: Failed Login Attempt"
FAILED_LOGIN=$(curl -s -X POST "$API_URL/api/merchant/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$MERCHANT_EMAIL\",
    \"password\": \"WrongPassword123!\"
  }")
echo "Response: $FAILED_LOGIN"
if echo "$FAILED_LOGIN" | grep -q "Invalid email or password"; then
    test_result 0 "Failed login rejection"
else
    test_result 1 "Failed login rejection"
fi
echo ""

echo "Test 10: Protected Route Access (without auth)"
PROTECTED=$(curl -s -X GET "$API_URL/sellers/dashboard")
if echo "$PROTECTED" | grep -q "Sign In\|login"; then
    test_result 0 "Protected route redirect without auth"
else
    test_result 1 "Protected route redirect without auth"
fi
echo ""

echo "=================================="
echo "Test Suite Complete"
echo "=================================="
echo ""
echo "Next steps:"
echo "1. Check test results above"
echo "2. Review any failures"
echo "3. Check browser console for JS errors"
echo "4. Verify database has new tables"
echo "5. Test manual flows in browser"
echo ""
