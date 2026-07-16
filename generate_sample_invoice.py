#!/usr/bin/env python3
"""
Generate sample invoice images for OCR testing
Creates diverse invoices covering multiple scenarios and edge cases
"""

from PIL import Image, ImageDraw, ImageFont
import os
from datetime import datetime, timedelta
import json

FONT_CACHE = {}

def get_fonts(size_map=None):
    """Get fonts with fallback to default"""
    if size_map is None:
        size_map = {'title': 32, 'header': 18, 'body': 14, 'small': 12}
    
    fonts = {}
    for key, size in size_map.items():
        if key in FONT_CACHE:
            fonts[key] = FONT_CACHE[key]
        else:
            try:
                fonts[key] = ImageFont.truetype("arial.ttf", size)
                FONT_CACHE[key] = fonts[key]
            except:
                fonts[key] = ImageFont.load_default()
                FONT_CACHE[key] = fonts[key]
    return fonts

def create_sample_invoice(filename="sample_invoice.png", variant="standard"):
    """Create invoice images for OCR testing - multiple variants"""
    
    # Create image
    width, height = 800, 1000
    image = Image.new('RGB', (width, height), color='white')
    draw = ImageDraw.Draw(image)
    
    fonts = get_fonts()
    
    y_pos = 20
    title_font = fonts['title']
    header_font = fonts['header']
    body_font = fonts['body']
    small_font = fonts['small']
    
    # ─── VARIANT: STANDARD FTL INVOICE ───────────────────────
    if variant == "standard":
        draw.text((50, y_pos), "FREIGHTFLOW LOGISTICS", font=title_font, fill='black')
        y_pos += 50
        draw.text((50, y_pos), "TCI EXPRESS LIMITED", font=header_font, fill='black')
        y_pos += 30
        draw.text((50, y_pos), "Head Office: Delhi | Phone: 011-XXXX-XXXX", font=body_font, fill='black')
        y_pos += 25
        draw.text((50, y_pos), "Email: invoices@tciexpress.in | GSTIN: 07AABCT1234H1Z0", font=body_font, fill='black')
        y_pos += 40
        
        draw.line([(50, y_pos), (750, y_pos)], fill='black', width=2)
        y_pos += 20
        
        draw.text((50, y_pos), "INVOICE", font=header_font, fill='black')
        draw.text((550, y_pos), f"Date: {datetime.now().strftime('%d-%m-%Y')}", font=body_font, fill='black')
        y_pos += 30
        
        draw.text((50, y_pos), f"Invoice No: INV-2026-00145", font=body_font, fill='black')
        draw.text((550, y_pos), f"Due Date: {(datetime.now() + timedelta(days=30)).strftime('%d-%m-%Y')}", font=body_font, fill='black')
        y_pos += 30
        
        draw.text((50, y_pos), f"Bill No: FFL-20260504-001", font=body_font, fill='black')
        y_pos += 40
        
        draw.text((50, y_pos), "BILL TO:", font=header_font, fill='black')
        draw.text((400, y_pos), "SHIP TO:", font=header_font, fill='black')
        y_pos += 25
        
        draw.text((50, y_pos), "Reliance Industries Ltd", font=body_font, fill='black')
        draw.text((400, y_pos), "Reliance Industries Ltd", font=body_font, fill='black')
        y_pos += 20
        
        draw.text((50, y_pos), "JAMNAGAR REFINERY", font=body_font, fill='black')
        draw.text((400, y_pos), "VADODARA WAREHOUSE", font=body_font, fill='black')
        y_pos += 20
        
        draw.text((50, y_pos), "Jamnagar, Gujarat 361004", font=body_font, fill='black')
        draw.text((400, y_pos), "Vadodara, Gujarat 390023", font=body_font, fill='black')
        y_pos += 40
        
        draw.line([(50, y_pos), (750, y_pos)], fill='black', width=1)
        y_pos += 5
        draw.text((50, y_pos), "Description", font=header_font, fill='black')
        draw.text((350, y_pos), "HSN Code", font=header_font, fill='black')
        draw.text((480, y_pos), "Qty", font=header_font, fill='black')
        draw.text((550, y_pos), "Rate", font=header_font, fill='black')
        draw.text((650, y_pos), "Amount", font=header_font, fill='black')
        y_pos += 25
        draw.line([(50, y_pos), (750, y_pos)], fill='black', width=1)
        y_pos += 15
        
        items = [
            ("Full Truck Load (FTL) - JAMNAGAR to VADODARA", "9971", "1", "45000", "45000"),
            ("GST (18%)", "9971", "", "", "8100"),
            ("Service Tax", "9971", "", "", "1200"),
        ]
        
        for item, hsn, qty, rate, amount in items:
            draw.text((50, y_pos), item, font=body_font, fill='black')
            draw.text((350, y_pos), hsn, font=body_font, fill='black')
            draw.text((480, y_pos), qty, font=body_font, fill='black')
            draw.text((550, y_pos), rate, font=body_font, fill='black')
            draw.text((650, y_pos), amount, font=body_font, fill='black')
            y_pos += 25
        
        y_pos += 10
        draw.line([(50, y_pos), (750, y_pos)], fill='black', width=2)
        y_pos += 15
        
        draw.text((550, y_pos), "TOTAL AMOUNT:", font=header_font, fill='black')
        draw.text((650, y_pos), "₹54,300", font=header_font, fill='black')
        y_pos += 40
        
        draw.text((50, y_pos), "Vehicle Number: DL-01-AB-1234", font=body_font, fill='black')
        y_pos += 25
        draw.text((50, y_pos), "Route: Delhi → Vadodara (1200 KM)", font=body_font, fill='black')
        y_pos += 25
        draw.text((50, y_pos), "Transport Mode: Full Truck Load (FTL)", font=body_font, fill='black')
        y_pos += 25
        draw.text((50, y_pos), "Delivery Time: 3 Days", font=body_font, fill='black')
        
    # ─── VARIANT: LTL INVOICE ──────────────────────────────
    elif variant == "ltl":
        draw.text((50, y_pos), "BLUE DART EXPRESS LTD", font=title_font, fill='black')
        y_pos += 50
        draw.text((50, y_pos), "Blue Dart Logistics", font=header_font, fill='black')
        y_pos += 30
        draw.text((50, y_pos), "Mumbai Hub | Ph: 022-XXXX-XXXX", font=body_font, fill='black')
        y_pos += 25
        draw.text((50, y_pos), "GSTIN: 27AABCT1234H1Z0", font=body_font, fill='black')
        y_pos += 40
        
        draw.line([(50, y_pos), (750, y_pos)], fill='black', width=2)
        y_pos += 20
        
        draw.text((50, y_pos), "BILL No: BD-2026-00289", font=header_font, fill='black')
        draw.text((550, y_pos), f"Date: 06-05-2026", font=body_font, fill='black')
        y_pos += 30
        
        draw.text((50, y_pos), f"Invoice No: BD/INV/2026/0289", font=body_font, fill='black')
        y_pos += 40
        
        draw.text((50, y_pos), "CONSIGNOR:", font=header_font, fill='black')
        draw.text((400, y_pos), "CONSIGNEE:", font=header_font, fill='black')
        y_pos += 25
        
        draw.text((50, y_pos), "Mahindra & Mahindra Ltd", font=body_font, fill='black')
        draw.text((400, y_pos), "Daimler India Private Ltd", font=body_font, fill='black')
        y_pos += 20
        
        draw.text((50, y_pos), "Nashik, Maharashtra", font=body_font, fill='black')
        draw.text((400, y_pos), "Pune, Maharashtra", font=body_font, fill='black')
        y_pos += 40
        
        draw.line([(50, y_pos), (750, y_pos)], fill='black', width=1)
        y_pos += 10
        draw.text((50, y_pos), "Service: LTL - Less Than Truck Load", font=header_font, fill='black')
        draw.text((350, y_pos), "HSN", font=header_font, fill='black')
        draw.text((480, y_pos), "Qty", font=header_font, fill='black')
        draw.text((550, y_pos), "Rate", font=header_font, fill='black')
        draw.text((650, y_pos), "Amount", font=header_font, fill='black')
        y_pos += 25
        draw.line([(50, y_pos), (750, y_pos)], fill='black', width=1)
        y_pos += 15
        
        items = [
            ("LTL Shipment - Nashik to Pune", "9971", "8", "3500", "28000"),
            ("Handling Charges", "9971", "1", "1500", "1500"),
            ("GST (18%)", "", "", "", "5310"),
        ]
        
        for item, hsn, qty, rate, amount in items:
            draw.text((50, y_pos), item, font=body_font, fill='black')
            if hsn:
                draw.text((350, y_pos), hsn, font=body_font, fill='black')
            draw.text((480, y_pos), qty, font=body_font, fill='black')
            draw.text((550, y_pos), rate, font=body_font, fill='black')
            draw.text((650, y_pos), amount, font=body_font, fill='black')
            y_pos += 25
        
        y_pos += 10
        draw.line([(50, y_pos), (750, y_pos)], fill='black', width=2)
        y_pos += 15
        draw.text((550, y_pos), "TOTAL: ₹34,810", font=header_font, fill='black')
        
    # ─── VARIANT: HANDWRITTEN NOTES (TEST EDGE CASES) ────────────
    elif variant == "handwritten":
        draw.text((50, y_pos), "ALLCARGO GATI LIMITED", font=title_font, fill='black')
        y_pos += 50
        draw.text((50, y_pos), "Bangalore Logistics", font=header_font, fill='black')
        y_pos += 40
        
        # Simulate handwritten notes overlaid on invoice
        draw.text((50, y_pos), "Manual Notes: Amount ₹78,500 UPDATED", font=body_font, fill='red')
        y_pos += 30
        draw.text((50, y_pos), "Vehicle: KA-01-AB-5678", font=body_font, fill='black')
        y_pos += 25
        draw.text((50, y_pos), "Route: Bangalore -> Chennai (350 KM)", font=body_font, fill='black')
        y_pos += 25
        draw.text((50, y_pos), "Mode: Road Transport", font=body_font, fill='black')
        y_pos += 30
        
        draw.line([(50, y_pos), (750, y_pos)], fill='black', width=2)
        y_pos += 20
        
        draw.text((50, y_pos), "Item Details:", font=header_font, fill='black')
        y_pos += 25
        draw.text((50, y_pos), "Service Charge (FTL): ₹65,000", font=body_font, fill='black')
        y_pos += 25
        draw.text((50, y_pos), "Documentation: ₹2,500", font=body_font, fill='black')
        y_pos += 25
        draw.text((50, y_pos), "Insurance (2%): ₹1,300", font=body_font, fill='black')
        y_pos += 25
        draw.text((50, y_pos), "GST (18%): ₹11,700", font=body_font, fill='black')
        
    # ─── VARIANT: SCANNED PDF (LOW QUALITY) ───────────────
    elif variant == "lowquality":
        # Simulate low quality scan with reduced contrast
        draw.text((50, y_pos), "LOCUS LOGISTICS", font=title_font, fill='#333333')
        y_pos += 50
        draw.text((50, y_pos), "Invoice #LOC-2026-0401", font=header_font, fill='#333333')
        y_pos += 40
        
        draw.line([(50, y_pos), (750, y_pos)], fill='#666666', width=1)
        y_pos += 20
        
        draw.text((50, y_pos), "From: Locus Logistics Hub, Kolkata", font=body_font, fill='#333333')
        y_pos += 25
        draw.text((50, y_pos), "To: ITC Limited, Hyderabad", font=body_font, fill='#333333')
        y_pos += 25
        draw.text((50, y_pos), "Date: 04-05-2026  |  Amount: ₹42,100  |  HSN: 4911", font=body_font, fill='#333333')
        y_pos += 40
        
        draw.text((50, y_pos), "Shipment Details:", font=header_font, fill='#333333')
        y_pos += 25
        draw.text((50, y_pos), "Vehicle: TS-07-EF-9876 (Truck)", font=body_font, fill='#333333')
        y_pos += 25
        draw.text((50, y_pos), "Distance: 1500 KM | Mode: Road", font=body_font, fill='#333333')
    
    # ─── VARIANT: MULTIPLE ITEMS ───────────────────────────
    elif variant == "multiitem":
        draw.text((50, y_pos), "FREIGHTFLOW ANALYTICS", font=title_font, fill='black')
        y_pos += 50
        draw.text((50, y_pos), "Multi-Item Shipment Invoice", font=header_font, fill='black')
        y_pos += 40
        
        draw.text((50, y_pos), "Invoice: FFA-2026-0512 | Date: 08-05-2026", font=body_font, fill='black')
        y_pos += 30
        
        draw.line([(50, y_pos), (750, y_pos)], fill='black', width=1)
        y_pos += 15
        
        items = [
            ("Shipment 1: Delhi-Gurgaon", "9971", "5", "2000", "10000"),
            ("Shipment 2: Mumbai-Pune", "9971", "3", "4500", "13500"),
            ("Shipment 3: Bangalore-Chennai", "9971", "2", "6000", "12000"),
            ("Documentation Charges", "9971", "", "", "1500"),
            ("GST (18%)", "", "", "", "6318"),
        ]
        
        for item, hsn, qty, rate, amount in items:
            draw.text((50, y_pos), item, font=body_font, fill='black')
            y_pos += 20
        
        y_pos += 10
        draw.line([(50, y_pos), (750, y_pos)], fill='black', width=2)
        y_pos += 15
        draw.text((50, y_pos), "GRAND TOTAL: ₹43,318", font=header_font, fill='black')
    
    # Footer for all variants
    y_pos += 40
    draw.line([(50, y_pos), (750, y_pos)], fill='black', width=1)
    y_pos += 10
    draw.text((50, y_pos), "Bank: HDFC Bank | Account: 1234567890 | IFSC: HDFC0001234", font=small_font, fill='black')
    y_pos += 20
    draw.text((50, y_pos), "Terms: Net 30 Days | Liability: Limited to invoice amount", font=small_font, fill='black')
    
    # Save
    output_path = f"backend/{filename}"
    image.save(output_path)
    print(f"✅ Invoice created: {output_path}")
    return output_path

def generate_test_dataset():
    """Generate a complete test dataset with expected OCR results"""
    
    invoices = {
        "sample_invoice_standard.png": {
            "variant": "standard",
            "expected": {
                "invoice_number": "INV-2026-00145",
                "vendor_name": "FREIGHTFLOW LOGISTICS",
                "amount": 54300,
                "gst_amount": 8100,
                "hsn_code": "9971",
                "vehicle_number": "DL-01-AB-1234",
                "route": "Delhi → Vadodara",
                "transport_mode": "FTL"
            }
        },
        "sample_invoice_ltl.png": {
            "variant": "ltl",
            "expected": {
                "invoice_number": "BD-2026-00289",
                "vendor_name": "BLUE DART EXPRESS",
                "amount": 34810,
                "gst_amount": 5310,
                "hsn_code": "9971",
                "transport_mode": "LTL"
            }
        },
        "sample_invoice_handwritten.png": {
            "variant": "handwritten",
            "expected": {
                "vendor_name": "ALLCARGO GATI",
                "amount": 78500,
                "vehicle_number": "KA-01-AB-5678",
                "route": "Bangalore -> Chennai",
                "transport_mode": "Road"
            }
        },
        "sample_invoice_lowquality.png": {
            "variant": "lowquality",
            "expected": {
                "invoice_number": "LOC-2026-0401",
                "vendor_name": "LOCUS LOGISTICS",
                "amount": 42100,
                "hsn_code": "4911"
            }
        },
        "sample_invoice_multiitem.png": {
            "variant": "multiitem",
            "expected": {
                "invoice_number": "FFA-2026-0512",
                "vendor_name": "FREIGHTFLOW ANALYTICS",
                "amount": 43318,
                "gst_amount": 6318
            }
        }
    }
    
    # Create all invoices
    print("\n🎯 Generating Complete Test Dataset for OCR...\n")
    for filename, config in invoices.items():
        print(f"  📄 {filename.ljust(35)} ({config['variant'].upper()})")
        create_sample_invoice(filename, config['variant'])
    
    # Save test expectations to JSON
    test_expectations_path = "backend/ocr_test_expectations.json"
    with open(test_expectations_path, 'w') as f:
        json.dump(invoices, f, indent=2)
    
    print(f"\n✅ Test dataset generated!")
    print(f"📁 Location: backend/")
    print(f"📊 Test expectations: {test_expectations_path}")
    print(f"📈 Total invoices: {len(invoices)}")
    
    return invoices
