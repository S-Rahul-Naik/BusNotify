#!/usr/bin/env python3
"""
Complete Readdy Agent Startup Guide
"""

def print_startup_guide():
    print("🚀 READDY AGENT - COMPLETE STARTUP GUIDE")
    print("=" * 50)
    
    print("\n📋 REQUIRED: 3 TERMINALS")
    print("-" * 30)
    
    print("\n🔹 TERMINAL 1 - Backend API")
    print("   Commands:")
    print("   cd backend")
    print("   python simple_backend.py")
    print("   ")
    print("   Status: API server on http://localhost:8001")
    print("   Purpose: Bus data, routes, real-time info")
    
    print("\n🔹 TERMINAL 2 - n8n Automation")
    print("   Commands:")
    print("   n8n start")
    print("   ")
    print("   Status: Automation platform on http://localhost:5678")
    print("   Purpose: AI processing, workflows, webhooks")
    
    print("\n🔹 TERMINAL 3 - Frontend Interface")
    print("   Commands:")
    print("   npm run dev")
    print("   ")
    print("   Status: Voice-enabled UI on http://localhost:3000")
    print("   Purpose: Voice + text chat interface")
    
    print("\n🎯 STARTUP ORDER:")
    print("-" * 20)
    print("1️⃣  Start Backend first (Terminal 1)")
    print("2️⃣  Start n8n second (Terminal 2)")
    print("3️⃣  Start Frontend last (Terminal 3)")
    
    print("\n🌐 ACCESS YOUR READDY AGENT:")
    print("-" * 35)
    print("🎤 Voice + Text Interface:  http://localhost:3000")
    print("📊 Backend API Docs:        http://localhost:8001/docs")
    print("⚙️  n8n Automation:         http://localhost:5678")
    print("🔗 Direct Webhook:          http://localhost:5678/webhook/readdy")
    
    print("\n✅ WHAT YOU'LL HAVE:")
    print("-" * 25)
    print("• Voice-to-voice conversations")
    print("• Text chat interface")
    print("• Real-time bus information")
    print("• Appointment scheduling")
    print("• BusTracker business logic")
    print("• Professional UI/UX")
    
    print("\n🎉 ENJOY YOUR REBUILT READDY AGENT!")
    print("=" * 40)

if __name__ == "__main__":
    print_startup_guide()