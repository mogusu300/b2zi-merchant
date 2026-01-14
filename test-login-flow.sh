#!/bin/bash

# Test login flow
echo "Testing merchant login..."
curl -X POST http://localhost:3000/api/merchant/login \
  -H "Content-Type: application/json" \
  -d '{"email":"Mogusuk@gmail.com","password":"gusu2003"}' \
  -v

echo ""
echo ""
echo "If login successful, you should see:"
echo "- ✅ 200 response"
echo "- ✅ success: true"
echo "- ✅ auth-token cookie set"
echo ""
echo "Now visit:"
echo "http://localhost:3000/sellers/login"
echo ""
echo "The redirect loop should be FIXED - you should redirect to dashboard once, not loop"
