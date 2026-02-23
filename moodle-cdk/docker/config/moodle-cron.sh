#!/bin/bash
# Moodle Cron Runner
# Executes Moodle cron every 1 minute as recommended by Moodle documentation
# Runs as www-data user (uid 33) — no hardcoded credentials
# Cron output goes to stdout/stderr for CloudWatch Logs collection

set -e

echo "[moodle-cron] Starting Moodle cron runner (every 60 seconds)"

while true; do
    echo "[moodle-cron] $(date -u '+%Y-%m-%d %H:%M:%S UTC') Running cron.php"
    su -s /bin/bash www-data -c "/usr/local/bin/php /var/www/moodle/html/admin/cli/cron.php" 2>&1 || \
        echo "[moodle-cron] WARNING: cron.php exited with non-zero status"
    sleep 60
done
