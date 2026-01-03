#!/bin/bash
cp /root/cfgames-open/backend/database.db /root/backups/database-backup-`date +%F-%T`.db

# =============================================================================
# CRONTAB SETUP FOR DAILY BACKUPS
# =============================================================================
# To run this backup script daily, add the following line to your crontab:
# 
# 1. Open crontab for editing:
#    crontab -e
# 
# 2. Add one of the following lines depending on when you want backups to run:
# 
#    # Run daily at 2:00 AM
#    0 2 * * * /path/to/this/script/backup-db.sh
# 
#    # Run daily at midnight
#    0 0 * * * /path/to/this/script/backup-db.sh
# 
#    # Run daily at 3:30 AM
#    30 3 * * * /path/to/this/script/backup-db.sh
# 
# 3. Replace "/path/to/this/script/" with the actual path to this script
# 
# Example for this project (assuming script is in /root/deccan-throwdown/scripts/):
#    0 2 * * * /root/deccan-throwdown/scripts/backup-db.sh
# 
# TIMEZONE CONSIDERATIONS (IMPORTANT FOR DIGITALOCEAN DROPLETS):
# - Cron times are based on the server's local timezone, not GMT/UTC
# - Check your server's timezone with: timedatectl or date
# - Most DigitalOcean droplets default to UTC timezone
# - To change timezone: sudo timedatectl set-timezone America/New_York
# - Available timezones: timedatectl list-timezones
# 
# Note: Make sure the script has execute permissions:
#    chmod +x /root/deccan-throwdown/scripts/backup-db.sh
# 
# To view current crontab entries:
#    crontab -l
# =============================================================================
