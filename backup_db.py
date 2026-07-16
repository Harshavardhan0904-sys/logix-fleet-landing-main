#!/usr/bin/env python3
"""
Database Backup Script
Backs up PostgreSQL database to SQL file
Usage: python backup_db.py
"""

import subprocess
import datetime
from pathlib import Path
import sys

# Database connection details
DB_URL = "postgresql://freightflow_db_vifw_user:XpknoGGIeDZmpQS4hKhhbVcw9joJ4bRB@dpg-d847j19kh4rs73d093pg-a/freightflow_db_vifw"

# Generate backup filename with date
backup_file = f"backup-{datetime.date.today().strftime('%Y%m%d')}.sql"
backup_path = Path(__file__).parent / backup_file

print(f"🔄 Starting database backup...")
print(f"📁 Output file: {backup_path}")
print(f"📊 Database: freightflow_db_vifw")

try:
    # Run pg_dump
    with open(backup_path, 'w') as f:
        result = subprocess.run(
            ["pg_dump", DB_URL],
            stdout=f,
            stderr=subprocess.PIPE,
            text=True
        )
    
    if result.returncode == 0:
        file_size_mb = backup_path.stat().st_size / (1024 * 1024)
        print(f"✅ Backup successful!")
        print(f"📦 File size: {file_size_mb:.2f} MB")
        print(f"💾 Location: {backup_path}")
        print(f"\n📌 Next steps:")
        print(f"   1. Upload {backup_file} to Google Drive or cloud storage")
        print(f"   2. Run this script weekly to keep backups fresh")
        sys.exit(0)
    else:
        print(f"❌ Backup failed!")
        print(f"Error: {result.stderr}")
        if "pg_dump" in result.stderr and "not found" in result.stderr:
            print(f"\n⚠️  pg_dump not installed. Download from:")
            print(f"   https://www.postgresql.org/download/windows/")
        sys.exit(1)

except FileNotFoundError:
    print(f"❌ pg_dump command not found")
    print(f"\nPlease install PostgreSQL:")
    print(f"   Option 1: https://www.postgresql.org/download/windows/")
    print(f"   Option 2: Microsoft Store → PostgreSQL")
    sys.exit(1)

except Exception as e:
    print(f"❌ Error: {e}")
    sys.exit(1)
