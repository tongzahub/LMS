#!/bin/bash
# Moodle Container Entrypoint
# Starts the cron runner in the background and Apache in the foreground
# All credentials are injected via environment variables at runtime — never hardcoded
# Environment variables expected (set by ECS task definition from Secrets Manager):
#   MOODLE_DB_HOST, MOODLE_DB_NAME, MOODLE_DB_USER, MOODLE_DB_PASS
#   MOODLE_SESSION_CACHE_ENDPOINT, MOODLE_MUC_CACHE_ENDPOINT
#   MOODLE_WWWROOT, MOODLE_DATAROOT

set -e

echo "[entrypoint] Starting Moodle container"

# Ensure EFS-mounted directories have correct ownership
# These may be freshly mounted and need www-data ownership
for dir in /var/www/moodle/data /var/www/moodle/cache /var/www/moodle/temp; do
    if [ -d "$dir" ]; then
        chown -R www-data:www-data "$dir" 2>/dev/null || true
    fi
done

# Ensure local ephemeral directories exist and are writable
mkdir -p /var/www/moodle/local/opcache
chown -R www-data:www-data /var/www/moodle/local

# Set OPcache memory from environment variable (default: 512 MB)
OPCACHE_MEMORY_CONSUMPTION="${OPCACHE_MEMORY_CONSUMPTION:-512}"
export OPCACHE_MEMORY_CONSUMPTION
echo "[entrypoint] OPcache memory: ${OPCACHE_MEMORY_CONSUMPTION}M"

# Start the Moodle cron runner in the background
/usr/local/bin/moodle-cron.sh &
CRON_PID=$!
echo "[entrypoint] Cron runner started (PID: ${CRON_PID})"

# Trap signals for graceful shutdown
cleanup() {
    echo "[entrypoint] Shutting down..."
    kill "${CRON_PID}" 2>/dev/null || true
    apachectl graceful-stop 2>/dev/null || true
    exit 0
}
trap cleanup SIGTERM SIGINT SIGQUIT

echo "[entrypoint] Starting Apache"
# Start Apache in the foreground
exec apache2-foreground
