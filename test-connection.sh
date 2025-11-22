#!/bin/bash
# test-connection.sh - Automated test for connection configuration fix

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 Testing Connection Configuration Fix"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

TESTS_PASSED=0
TESTS_FAILED=0

# Helper function to print test results
test_result() {
    if [ $1 -eq 0 ]; then
        echo "✅ $2"
        ((TESTS_PASSED++))
    else
        echo "❌ $2"
        ((TESTS_FAILED++))
    fi
}

# Test 1: Check if ConfigService exists
echo "📝 Test 1: ConfigService existence"
if [ -f "src/frontend/src/app/core/services/config.service.ts" ]; then
    test_result 0 "ConfigService file exists"
else
    test_result 1 "ConfigService file not found"
fi

# Test 2: Check if AuthService imports ConfigService
echo ""
echo "📝 Test 2: AuthService imports ConfigService"
if grep -q "ConfigService" "src/frontend/src/app/core/services/auth.service.ts"; then
    test_result 0 "AuthService imports ConfigService"
else
    test_result 1 "AuthService doesn't import ConfigService"
fi

# Test 3: Check if ApiService imports ConfigService
echo ""
echo "📝 Test 3: ApiService imports ConfigService"
if grep -q "ConfigService" "src/frontend/src/app/core/services/api.service.ts"; then
    test_result 0 "ApiService imports ConfigService"
else
    test_result 1 "ApiService doesn't import ConfigService"
fi

# Test 4: Check if static tenants.json import is removed from AuthService
echo ""
echo "📝 Test 4: Static import removed from AuthService"
if grep -q "import tenants from.*tenants.json" "src/frontend/src/app/core/services/auth.service.ts"; then
    test_result 1 "AuthService still has static tenants.json import"
else
    test_result 0 "Static tenants.json import removed from AuthService"
fi

# Test 5: Check if static tenants.json import is removed from ApiService
echo ""
echo "📝 Test 5: Static import removed from ApiService"
if grep -q "import.*tenants.*from.*tenants.json" "src/frontend/src/app/core/services/api.service.ts"; then
    test_result 1 "ApiService still has static tenants.json import"
else
    test_result 0 "Static tenants.json import removed from ApiService"
fi

# Test 6: Check if ConfigService has getBaseUrl method
echo ""
echo "📝 Test 6: ConfigService has getBaseUrl method"
if grep -q "getBaseUrl()" "src/frontend/src/app/core/services/config.service.ts"; then
    test_result 0 "ConfigService has getBaseUrl method"
else
    test_result 1 "ConfigService doesn't have getBaseUrl method"
fi

# Test 7: Check if ConfigService has getEnvironment method
echo ""
echo "📝 Test 7: ConfigService has getEnvironment method"
if grep -q "getEnvironment()" "src/frontend/src/app/core/services/config.service.ts"; then
    test_result 0 "ConfigService has getEnvironment method"
else
    test_result 1 "ConfigService doesn't have getEnvironment method"
fi

# Test 8: Check if AuthService uses configService.getBaseUrl()
echo ""
echo "📝 Test 8: AuthService uses configService.getBaseUrl()"
if grep -q "configService.getBaseUrl()" "src/frontend/src/app/core/services/auth.service.ts"; then
    test_result 0 "AuthService uses configService.getBaseUrl()"
else
    test_result 1 "AuthService doesn't use configService.getBaseUrl()"
fi

# Test 9: Check if ApiService uses configService.getBaseUrl()
echo ""
echo "📝 Test 9: ApiService uses configService.getBaseUrl()"
if grep -q "configService.getBaseUrl()" "src/frontend/src/app/core/services/api.service.ts"; then
    test_result 0 "ApiService uses configService.getBaseUrl()"
else
    test_result 1 "ApiService doesn't use configService.getBaseUrl()"
fi

# Test 10: Check if AuthService no longer has initializeApiUrl method
echo ""
echo "📝 Test 10: AuthService doesn't have duplicate initialization"
if grep -q "private initializeApiUrl" "src/frontend/src/app/core/services/auth.service.ts"; then
    test_result 1 "AuthService still has initializeApiUrl method"
else
    test_result 0 "AuthService doesn't have duplicate initialization"
fi

# Test 11: Check if ApiService no longer has initializeApiUrl method
echo ""
echo "📝 Test 11: ApiService doesn't have duplicate initialization"
if grep -q "private initializeApiUrl" "src/frontend/src/app/core/services/api.service.ts"; then
    test_result 1 "ApiService still has initializeApiUrl method"
else
    test_result 0 "ApiService doesn't have duplicate initialization"
fi

# Test 12: Check tenant.json files exist
echo ""
echo "📝 Test 12: Tenant configuration files"
if [ -f "src/frontend/src/environments/tenants.Development.json" ] && 
   [ -f "src/frontend/src/environments/tenants.Test.json" ] && 
   [ -f "src/frontend/src/environments/tenants.Production.json" ]; then
    test_result 0 "All tenant.json files exist"
else
    test_result 1 "Some tenant.json files are missing"
fi

# Test 13: Check if frontend can build
echo ""
echo "📝 Test 13: Frontend build test"
cd src/frontend
if npm run build:dev > /dev/null 2>&1; then
    test_result 0 "Frontend builds successfully (Development)"
else
    test_result 1 "Frontend build failed (Development)"
fi
cd ../..

# Test 14: Check if backend can build
echo ""
echo "📝 Test 14: Backend build test"
cd src/backend/RP.CRM.Api
if dotnet build --no-restore > /dev/null 2>&1; then
    test_result 0 "Backend builds successfully"
else
    test_result 1 "Backend build failed"
fi
cd ../../..

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Test Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Tests passed: $TESTS_PASSED"
echo "❌ Tests failed: $TESTS_FAILED"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo "🎉 All tests passed! Connection configuration fix is working correctly."
    echo ""
    echo "Next steps:"
    echo "  1. Start backend: cd src/backend/RP.CRM.Api && dotnet run"
    echo "  2. Start frontend: cd src/frontend && npm start"
    echo "  3. Open browser: http://localhost:4200"
    echo "  4. Check DevTools console for correct baseURL"
    exit 0
else
    echo "⚠️  Some tests failed. Please review the failed tests above."
    exit 1
fi
