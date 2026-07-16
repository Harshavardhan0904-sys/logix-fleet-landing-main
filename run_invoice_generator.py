#!/usr/bin/env python3

if __name__ == "__main__":
    generate_test_dataset()
    print("\n🎯 Test data ready for OCR testing!")
    print("Next steps:")
    print("  1. Start backend server: npm start")
    print("  2. Run OCR tests: node ocr_test_suite.js")
    print("  3. Upload invoices via OCR page: /pages/ocr-capture")
