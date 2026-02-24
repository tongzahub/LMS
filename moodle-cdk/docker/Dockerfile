# Moodle LMS Container Image
# PHP 8.2 with Apache, optimized for AWS ECS Fargate deployment
# No hardcoded credentials — all secrets injected via environment variables at runtime

FROM php:8.2-apache

# Install system dependencies required by Moodle and PHP extensions
RUN apt-get update && apt-get install -y --no-install-recommends \
    libfreetype6-dev \
    libjpeg62-turbo-dev \
    libpng-dev \
    libwebp-dev \
    libxml2-dev \
    libzip-dev \
    libicu-dev \
    libonig-dev \
    libcurl4-openssl-dev \
    libldap2-dev \
    libsodium-dev \
    libxslt1-dev \
    unzip \
    git \
    cron \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions required by Moodle
RUN docker-php-ext-configure gd --with-freetype --with-jpeg --with-webp \
    && docker-php-ext-install -j$(nproc) \
        mysqli \
        soap \
        intl \
        gd \
        zip \
        opcache \
        exif \
        mbstring \
        curl \
        ldap \
        sodium \
        xsl \
    && pecl install redis \
    && docker-php-ext-enable redis

# Enable Apache modules required by Moodle
RUN a2enmod rewrite headers remoteip

# Create Moodle filesystem layout
# /var/www/moodle/html  — Application code (baked into image)
# /var/www/moodle/local — Ephemeral local cache (task-level storage)
# /var/www/moodle/data  — EFS mount: user uploads, shared data
# /var/www/moodle/cache — EFS mount: Moodle file cache (shared)
# /var/www/moodle/temp  — EFS mount: temporary files (shared)
RUN mkdir -p \
    /var/www/moodle/html \
    /var/www/moodle/local \
    /var/www/moodle/data \
    /var/www/moodle/cache \
    /var/www/moodle/temp

# Download and install Moodle (latest stable)
# Using Git for reproducible builds; version pinned via MOODLE_VERSION build arg
ARG MOODLE_VERSION=MOODLE_404_STABLE
RUN git clone --depth 1 --branch ${MOODLE_VERSION} \
    https://github.com/moodle/moodle.git /var/www/moodle/html

# Set ownership to www-data (uid 33) for all Moodle directories
RUN chown -R www-data:www-data /var/www/moodle

# Copy PHP configuration
COPY config/php.ini /usr/local/etc/php/conf.d/moodle.ini

# Copy cron runner and entrypoint scripts
COPY config/moodle-cron.sh /usr/local/bin/moodle-cron.sh
COPY config/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/moodle-cron.sh /usr/local/bin/entrypoint.sh

# Configure Apache to serve Moodle from /var/www/moodle/html
RUN echo '<VirtualHost *:80>\n\
    DocumentRoot /var/www/moodle/html\n\
    <Directory /var/www/moodle/html>\n\
        AllowOverride All\n\
        Require all granted\n\
    </Directory>\n\
    RemoteIPHeader X-Forwarded-For\n\
    RemoteIPTrustedProxy 10.0.0.0/8\n\
    RemoteIPTrustedProxy 172.16.0.0/12\n\
    RemoteIPTrustedProxy 192.168.0.0/16\n\
</VirtualHost>' > /etc/apache2/sites-available/000-default.conf

# Create OPcache file cache directory
RUN mkdir -p /var/www/moodle/local/opcache \
    && chown -R www-data:www-data /var/www/moodle/local

# Health check: verify Moodle login page is accessible
HEALTHCHECK --interval=30s --timeout=10s --start-period=120s --retries=3 \
    CMD curl -f http://localhost/login/index.php || exit 1

EXPOSE 80

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
