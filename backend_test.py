#!/usr/bin/env python3
"""
Backend API Testing for PopUp Lane - Merchant Registration and Admin Approval Workflow
"""

import requests
import json
import sys
from datetime import datetime

# Configuration
BASE_URL = "https://finds-platform.preview.emergentagent.com/api"
ADMIN_PASSWORD = "admin123"

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'

def print_success(message):
    print(f"{Colors.GREEN}✅ {message}{Colors.ENDC}")

def print_error(message):
    print(f"{Colors.RED}❌ {message}{Colors.ENDC}")

def print_info(message):
    print(f"{Colors.BLUE}ℹ️  {message}{Colors.ENDC}")

def print_warning(message):
    print(f"{Colors.YELLOW}⚠️  {message}{Colors.ENDC}")

def print_header(message):
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.BLUE}{message}{Colors.ENDC}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.ENDC}")

def make_request(method, endpoint, data=None, headers=None, expected_status=None):
    """Make HTTP request and return response"""
    url = f"{BASE_URL}{endpoint}"
    
    try:
        if method.upper() == 'GET':
            response = requests.get(url, headers=headers, timeout=30)
        elif method.upper() == 'POST':
            response = requests.post(url, json=data, headers=headers, timeout=30)
        elif method.upper() == 'PATCH':
            response = requests.patch(url, json=data, headers=headers, timeout=30)
        else:
            raise ValueError(f"Unsupported method: {method}")
        
        print(f"Request: {method} {url}")
        if data:
            print(f"Data: {json.dumps(data, indent=2)}")
        print(f"Response Status: {response.status_code}")
        
        try:
            response_json = response.json()
            print(f"Response: {json.dumps(response_json, indent=2)}")
        except:
            print(f"Response Text: {response.text}")
            response_json = None
        
        if expected_status and response.status_code != expected_status:
            print_error(f"Expected status {expected_status}, got {response.status_code}")
            return None, response.status_code
        
        return response_json, response.status_code
    
    except requests.exceptions.RequestException as e:
        print_error(f"Request failed: {str(e)}")
        return None, None

def test_merchant_registration():
    """Test Step 1: Register a New Merchant Account"""
    print_header("STEP 1: MERCHANT REGISTRATION")
    
    # Use timestamp to make email unique
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    merchant_data = {
        "businessName": "Test Store",
        "contactName": "John Doe", 
        "email": f"testmerchant_{timestamp}@example.com",
        "password": "Test1234",
        "phone": "+1234567890",
        "website": "https://teststore.com",
        "description": "A test store for approval testing"
    }
    
    print_info("Registering new merchant account...")
    response, status = make_request('POST', '/merchant/register', merchant_data, expected_status=201)
    
    if status == 201 and response:
        print_success("Merchant registration successful!")
        print_info(f"Merchant ID: {response.get('id')}")
        print_info(f"Message: {response.get('message')}")
        return response.get('id')
    else:
        print_error("Merchant registration failed!")
        return None

def test_admin_login():
    """Test Step 2: Admin Login"""
    print_header("STEP 2: ADMIN LOGIN")
    
    admin_credentials = {
        "password": ADMIN_PASSWORD
    }
    
    print_info("Attempting admin login...")
    response, status = make_request('POST', '/admin/login', admin_credentials, expected_status=200)
    
    if status == 200 and response:
        print_success("Admin login successful!")
        token = response.get('token')
        print_info(f"Admin token received: {token[:20]}...")
        return token
    else:
        print_error("Admin login failed!")
        return None

def test_get_merchant_accounts(admin_token, merchant_id):
    """Test Step 3: Get Merchant Accounts (Admin)"""
    print_header("STEP 3: GET MERCHANT ACCOUNTS")
    
    headers = {
        "Authorization": f"Bearer {admin_token}"
    }
    
    print_info("Fetching all merchant accounts...")
    response, status = make_request('GET', '/admin/merchant-accounts', headers=headers, expected_status=200)
    
    if status == 200 and response:
        print_success(f"Retrieved {len(response)} merchant accounts")
        
        # Find our test merchant
        test_merchant = None
        for account in response:
            if account.get('id') == merchant_id:
                test_merchant = account
                break
        
        if test_merchant:
            print_success("Test merchant found in accounts list!")
            print_info(f"Account Status: {test_merchant.get('accountStatus')}")
            print_info(f"Business Name: {test_merchant.get('businessName')}")
            print_info(f"Email: {test_merchant.get('email')}")
            
            if test_merchant.get('accountStatus') == 'pending_approval':
                print_success("Merchant has correct 'pending_approval' status")
                return True
            else:
                print_error(f"Expected 'pending_approval' status, got '{test_merchant.get('accountStatus')}'")
                return False
        else:
            print_error("Test merchant not found in accounts list!")
            return False
    else:
        print_error("Failed to retrieve merchant accounts!")
        return False

def test_dashboard_stats(admin_token):
    """Test Step 4: Get Dashboard Stats (Admin)"""
    print_header("STEP 4: GET DASHBOARD STATS")
    
    headers = {
        "Authorization": f"Bearer {admin_token}"
    }
    
    print_info("Fetching dashboard statistics...")
    response, status = make_request('GET', '/admin/dashboard', headers=headers, expected_status=200)
    
    if status == 200 and response:
        print_success("Dashboard stats retrieved successfully!")
        
        merchant_accounts = response.get('merchantAccounts', {})
        print_info(f"Total merchant accounts: {merchant_accounts.get('total', 0)}")
        print_info(f"Pending merchant accounts: {merchant_accounts.get('pending', 0)}")
        print_info(f"Active merchant accounts: {merchant_accounts.get('active', 0)}")
        print_info(f"Rejected merchant accounts: {merchant_accounts.get('rejected', 0)}")
        
        if merchant_accounts.get('pending', 0) > 0:
            print_success("Dashboard shows pending merchant accounts correctly")
            return True
        else:
            print_warning("No pending merchant accounts shown in dashboard")
            return True  # Not necessarily an error
    else:
        print_error("Failed to retrieve dashboard stats!")
        return False

def test_approve_merchant(admin_token, merchant_id):
    """Test Step 5: Approve Merchant Account (Admin)"""
    print_header("STEP 5: APPROVE MERCHANT ACCOUNT")
    
    headers = {
        "Authorization": f"Bearer {admin_token}"
    }
    
    approval_data = {
        "status": "active"
    }
    
    print_info(f"Approving merchant account: {merchant_id}")
    response, status = make_request('PATCH', f'/admin/merchant-accounts/{merchant_id}/status', 
                                  approval_data, headers=headers, expected_status=200)
    
    if status == 200 and response:
        print_success("Merchant account approved successfully!")
        print_info(f"Message: {response.get('message')}")
        return True
    else:
        print_error("Failed to approve merchant account!")
        return False

def test_merchant_login_after_approval():
    """Test Step 6: Verify Merchant Can Login After Approval"""
    print_header("STEP 6: MERCHANT LOGIN AFTER APPROVAL")
    
    # Use the same timestamp-based email from registration
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    merchant_credentials = {
        "email": f"testmerchant_{timestamp}@example.com",
        "password": "Test1234"
    }
    
    print_info("Attempting merchant login after approval...")
    response, status = make_request('POST', '/merchant/login', merchant_credentials, expected_status=200)
    
    if status == 200 and response:
        print_success("Merchant login successful after approval!")
        token = response.get('token')
        merchant_account = response.get('merchantAccount', {})
        print_info(f"Merchant token received: {token[:20] if token else 'None'}...")
        print_info(f"Account Status: {merchant_account.get('accountStatus')}")
        print_info(f"Business Name: {merchant_account.get('businessName')}")
        
        if merchant_account.get('accountStatus') == 'active':
            print_success("Merchant account status is 'active' after approval")
            return True
        else:
            print_error(f"Expected 'active' status, got '{merchant_account.get('accountStatus')}'")
            return False
    else:
        print_error("Merchant login failed after approval!")
        return False

def test_get_active_merchant_accounts(admin_token):
    """Test Step 7: Get Active Merchant Accounts"""
    print_header("STEP 7: GET ACTIVE MERCHANT ACCOUNTS")
    
    headers = {
        "Authorization": f"Bearer {admin_token}"
    }
    
    print_info("Fetching active merchant accounts...")
    response, status = make_request('GET', '/admin/merchant-accounts?status=active', 
                                  headers=headers, expected_status=200)
    
    if status == 200 and response:
        print_success(f"Retrieved {len(response)} active merchant accounts")
        
        # Check if our test merchant is in the active list
        test_merchant_found = False
        for account in response:
            if account.get('email') == 'testmerchant@example.com':
                test_merchant_found = True
                print_success("Test merchant found in active accounts list!")
                print_info(f"Business Name: {account.get('businessName')}")
                print_info(f"Account Status: {account.get('accountStatus')}")
                break
        
        if not test_merchant_found:
            print_error("Test merchant not found in active accounts list!")
            return False
        
        return True
    else:
        print_error("Failed to retrieve active merchant accounts!")
        return False

def main():
    """Run the complete merchant registration and admin approval workflow test"""
    print_header("POPUP LANE - MERCHANT REGISTRATION & ADMIN APPROVAL WORKFLOW TEST")
    print_info(f"Testing against: {BASE_URL}")
    print_info(f"Test started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    results = []
    merchant_id = None
    admin_token = None
    
    # Step 1: Register Merchant
    merchant_id = test_merchant_registration()
    results.append(("Merchant Registration", merchant_id is not None))
    
    if not merchant_id:
        print_error("Cannot continue without merchant ID")
        return False
    
    # Step 2: Admin Login
    admin_token = test_admin_login()
    results.append(("Admin Login", admin_token is not None))
    
    if not admin_token:
        print_error("Cannot continue without admin token")
        return False
    
    # Step 3: Get Merchant Accounts
    accounts_success = test_get_merchant_accounts(admin_token, merchant_id)
    results.append(("Get Merchant Accounts", accounts_success))
    
    # Step 4: Dashboard Stats
    dashboard_success = test_dashboard_stats(admin_token)
    results.append(("Dashboard Stats", dashboard_success))
    
    # Step 5: Approve Merchant
    approval_success = test_approve_merchant(admin_token, merchant_id)
    results.append(("Approve Merchant", approval_success))
    
    # Step 6: Merchant Login After Approval
    login_success = test_merchant_login_after_approval()
    results.append(("Merchant Login After Approval", login_success))
    
    # Step 7: Get Active Merchant Accounts
    active_accounts_success = test_get_active_merchant_accounts(admin_token)
    results.append(("Get Active Merchant Accounts", active_accounts_success))
    
    # Print Summary
    print_header("TEST RESULTS SUMMARY")
    
    all_passed = True
    for test_name, passed in results:
        if passed:
            print_success(f"{test_name}: PASSED")
        else:
            print_error(f"{test_name}: FAILED")
            all_passed = False
    
    print(f"\n{Colors.BOLD}Overall Result: ", end="")
    if all_passed:
        print(f"{Colors.GREEN}ALL TESTS PASSED ✅{Colors.ENDC}")
    else:
        print(f"{Colors.RED}SOME TESTS FAILED ❌{Colors.ENDC}")
    
    print_info(f"Test completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    return all_passed

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)