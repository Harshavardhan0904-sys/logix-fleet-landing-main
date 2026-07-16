#!/usr/bin/env python3
"""
Create a synthetic test invoice image for OCR testing
"""
from PIL import Image, ImageDraw, ImageFont
from datetime import datetime, timedelta
import os

def create_invoice_image(filename='test_invoice.png'):
    """
    Create a realistic freight invoice image for OCR testing
    """
    # Create image
    width, height = 1200, 1600
    image = Image.new('RGB', (width, height), color='white')
    draw = ImageDraw.Draw(image)
    
    # Try to use a simple font, fallback to default
    try:
        title_font = ImageFont.truetype("arial.ttf", 36)
        header_font = ImageFont.truetype("arial.ttf", 24)
        text_font = ImageFont.truetype("arial.ttf", 18)
        small_font = ImageFont.truetype("arial.ttf", 14)
    except:
        title_font = ImageFont.load_default()
        header_font = ImageFont.load_default()
        text_font = ImageFont.load_default()
        small_font = ImageFont.load_default()
    
    # Colors
    black = (0, 0, 0)
    gray = (100, 100, 100)
    light_gray = (200, 200, 200)
    
    y_pos = 40
    
    # Header - Company Name
    company_name = "EXPRESS LOGISTICS PVT LTD"
    draw.text((60, y_pos), company_name, fill=black, font=title_font)
    y_pos += 50
    
    # Company details
    draw.text((60, y_pos), "Email: contact@expresslogistics.com | Phone: 9876543210", fill=gray, font=small_font)
    y_pos += 30
    draw.text((60, y_pos), "GST: 27AABCE1234F1ZX | Address: Mumbai, Maharashtra", fill=gray, font=small_font)
    y_pos += 50
    
    # Divider line
    draw.line([(40, y_pos), (width-40, y_pos)], fill=light_gray, width=2)
    y_pos += 30
    
    # Title
    draw.text((60, y_pos), "FREIGHT INVOICE", fill=black, font=header_font)
    y_pos += 50
    
    # Invoice details
    inv_date = datetime.now()
    inv_date_str = inv_date.strftime("%d-%m-%Y")
    due_date = inv_date + timedelta(days=30)
    due_date_str = due_date.strftime("%d-%m-%Y")
    
    details = [
        ("Invoice #:", "INV-2024-00125"),
        ("Date:", inv_date_str),
        ("Due Date:", due_date_str),
        ("Invoice Type:", "POL Invoice"),
    ]
    
    for label, value in details:
        draw.text((60, y_pos), f"{label:<20} {value}", fill=black, font=text_font)
        y_pos += 28
    
    y_pos += 20
    
    # Divider
    draw.line([(40, y_pos), (width-40, y_pos)], fill=light_gray, width=1)
    y_pos += 30
    
    # Shipment Details
    draw.text((60, y_pos), "SHIPMENT DETAILS", fill=black, font=header_font)
    y_pos += 40
    
    shipment_details = [
        ("Origin:", "Mumbai, Maharashtra"),
        ("Destination:", "Delhi, New Delhi"),
        ("Route:", "Mumbai → Pune → Aurangabad → Parbhani → Aurangabad → Nashik → Dhule → Nandurbar → Burhanpur → Indore → Ujjain → Bhopal → Sehore → Raisen → Bina → Gwalior → Morena → Datia → Jhansi → Kanpur → Lucknow → Sitapur → Hardoi → Shahjahanpur → Bareli → Meerut → Ghaziabad → Delhi"),
        ("Transport Mode:", "Road - Truck (HCV)"),
        ("Vehicle Reg:", "MH12AB1234"),
        ("Vehicle Type:", "HCV - Open Truck"),
    ]
    
    for label, value in shipment_details:
        # Wrap long values
        if len(value) > 80:
            words = value.split()
            current_line = ""
            for word in words:
                if len(current_line + word) > 80:
                    draw.text((60, y_pos), f"{label:<20} {current_line}", fill=black, font=text_font)
                    y_pos += 28
                    current_line = word
                    label = ""  # Only show label on first line
                else:
                    current_line += " " + word if current_line else word
            if current_line:
                draw.text((60, y_pos), f"{label:<20} {current_line}", fill=black, font=text_font)
                y_pos += 28
        else:
            draw.text((60, y_pos), f"{label:<20} {value}", fill=black, font=text_font)
            y_pos += 28
    
    y_pos += 20
    
    # Divider
    draw.line([(40, y_pos), (width-40, y_pos)], fill=light_gray, width=1)
    y_pos += 30
    
    # Cargo Details
    draw.text((60, y_pos), "CARGO DETAILS", fill=black, font=header_font)
    y_pos += 40
    
    cargo_details = [
        ("Commodity:", "Electronics & Machinery Parts"),
        ("Weight:", "2500 kg"),
        ("Volume:", "15 cubic meters"),
        ("HSN Code:", "8442"),
        ("Number of Packages:", "25 boxes/pallets"),
    ]
    
    for label, value in cargo_details:
        draw.text((60, y_pos), f"{label:<20} {value}", fill=black, font=text_font)
        y_pos += 28
    
    y_pos += 20
    
    # Divider
    draw.line([(40, y_pos), (width-40, y_pos)], fill=light_gray, width=1)
    y_pos += 30
    
    # Amount Details - Table
    draw.text((60, y_pos), "CHARGES", fill=black, font=header_font)
    y_pos += 40
    
    # Table header
    draw.text((60, y_pos), "Description", fill=black, font=header_font)
    draw.text((500, y_pos), "Amount (₹)", fill=black, font=header_font)
    y_pos += 35
    
    # Table rows
    charges = [
        ("Freight Charge", "45000"),
        ("Handling Charge", "2500"),
        ("Documentation Fee", "500"),
        ("Insurance @ 0.75%", "360"),
        ("Subtotal", "48360"),
        ("SGST @ 9%", "4352"),
        ("CGST @ 9%", "4352"),
    ]
    
    for description, amount in charges:
        if "TOTAL" in description or "Subtotal" in description or "SGST" in description or "CGST" in description:
            draw.text((60, y_pos), description, fill=black, font=text_font)
            draw.text((500, y_pos), amount, fill=black, font=text_font)
        else:
            draw.text((60, y_pos), description, fill=gray, font=text_font)
            draw.text((500, y_pos), amount, fill=gray, font=text_font)
        y_pos += 28
    
    # Grand total
    y_pos += 10
    draw.line([(500, y_pos), (700, y_pos)], fill=black, width=2)
    y_pos += 20
    draw.text((60, y_pos), "TOTAL INVOICE AMOUNT", fill=black, font=header_font)
    draw.text((500, y_pos), "₹ 57,064", fill=black, font=header_font)
    y_pos += 50
    
    # Footer
    draw.line([(40, y_pos), (width-40, y_pos)], fill=light_gray, width=1)
    y_pos += 30
    draw.text((60, y_pos), "Payment Terms: Net 30 days | Account: HDFC Bank | IFSC: HDFC0000001", fill=gray, font=small_font)
    y_pos += 25
    draw.text((60, y_pos), "Authorized by: Rajesh Kumar | Date: 23-04-2026", fill=gray, font=small_font)
    
    # Save image
    image.save(filename)
    print(f"✅ Test invoice created: {filename}")
    print(f"📊 Expected OCR extraction:")
    print(f"   - Vendor: EXPRESS LOGISTICS PVT LTD")
    print(f"   - Invoice #: INV-2024-00125")
    print(f"   - Date: 23-04-2026")
    print(f"   - Amount: ₹57,064")
    print(f"   - GST Amount: ₹8,704 (SGST + CGST)")
    print(f"   - HSN Code: 8442")
    print(f"   - Route: Mumbai → Delhi")
    print(f"   - Vehicle: MH12AB1234")
    print(f"   - Mode: Road/Truck")
    
    return filename

if __name__ == "__main__":
    # Create in the backend folder
    output_path = os.path.join(os.path.dirname(__file__), "test_invoice.png")
    create_invoice_image(output_path)
    print(f"\n💾 Saved to: {output_path}")
