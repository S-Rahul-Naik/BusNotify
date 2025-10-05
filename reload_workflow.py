#!/usr/bin/env python3
"""
Reload n8n workflow with updated backend endpoints
"""

import requests
import json
import time

def reload_n8n_workflow():
    """Reload the workflow to apply changes"""
    try:
        # First deactivate the workflow
        print("🔄 Deactivating workflow...")
        response = requests.patch(
            "http://localhost:5678/api/v1/workflows/readdy-agent-workflow/active",
            json={"active": False},
            timeout=10
        )
        
        if response.status_code == 200:
            print("✅ Workflow deactivated")
        else:
            print(f"⚠️  Deactivate returned: {response.status_code}")
        
        # Wait a moment
        time.sleep(2)
        
        # Reactivate the workflow
        print("🔄 Reactivating workflow...")
        response = requests.patch(
            "http://localhost:5678/api/v1/workflows/readdy-agent-workflow/active", 
            json={"active": True},
            timeout=10
        )
        
        if response.status_code == 200:
            print("✅ Workflow reactivated")
            print("🎉 Backend URLs updated successfully!")
            return True
        else:
            print(f"❌ Reactivate failed: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Error reloading workflow: {e}")
        return False

if __name__ == "__main__":
    print("🔧 Reloading n8n workflow with updated backend URLs...")
    print("=" * 50)
    
    success = reload_n8n_workflow()
    
    if success:
        print("\n🎯 Next steps:")
        print("   • Test the updated workflow")
        print("   • Backend is running on http://localhost:8001")
        print("   • n8n webhook: http://localhost:5678/webhook/readdy")
    else:
        print("\n❌ Workflow reload failed")
        print("   • Check if n8n is running")
        print("   • Manually reactivate in n8n interface")