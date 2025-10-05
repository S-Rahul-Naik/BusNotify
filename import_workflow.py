#!/usr/bin/env python3
"""
Import/update n8n workflow with corrected backend endpoints
"""

import requests
import json

def import_workflow():
    """Import the updated workflow"""
    try:
        # Load the workflow file
        with open('n8n-chatbot-workflow.json', 'r', encoding='utf-8') as f:
            workflow_data = json.load(f)
        
        print("📄 Loaded workflow file")
        
        # Import the workflow
        print("🔄 Importing workflow to n8n...")
        response = requests.post(
            "http://localhost:5678/api/v1/workflows/import",
            json=workflow_data,
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Workflow imported successfully!")
            print(f"   ID: {result.get('id', 'Unknown')}")
            print(f"   Name: {result.get('name', 'Unknown')}")
            
            # Activate the workflow
            workflow_id = result.get('id')
            if workflow_id:
                print("🔄 Activating workflow...")
                activate_response = requests.patch(
                    f"http://localhost:5678/api/v1/workflows/{workflow_id}/active",
                    json={"active": True},
                    timeout=10
                )
                
                if activate_response.status_code == 200:
                    print("✅ Workflow activated!")
                    return True
                else:
                    print(f"⚠️  Activation returned: {activate_response.status_code}")
                    return True  # Import was successful
            
        else:
            print(f"❌ Import failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Error importing workflow: {e}")
        return False

if __name__ == "__main__":
    print("🔧 Importing updated n8n workflow...")
    print("=" * 50)
    
    success = import_workflow()
    
    if success:
        print("\n🎉 Workflow import completed!")
        print("🎯 Next steps:")
        print("   • Test the Readdy agent")
        print("   • Backend: http://localhost:8001")
        print("   • Webhook: http://localhost:5678/webhook/readdy")
    else:
        print("\n❌ Workflow import failed")
        print("   • Check if n8n is running")
        print("   • Check workflow file format")