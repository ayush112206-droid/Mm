FROM php:8.2-apache

# Enable required Apache modules
RUN a2enmod rewrite headers deflate expires

# Copy project files
WORKDIR /var/www/html
COPY . .

# Allow .htaccess overrides
RUN echo '<Directory /var/www/html>\n\
    Options -Indexes +FollowSymLinks\n\
    AllowOverride All\n\
    Require all granted\n\
</Directory>' > /etc/apache2/conf-available/app.conf && a2enconf app

# Startup script: reads Render's $PORT automatically, no manual env needed
RUN echo '#!/bin/bash\n\
export APACHE_PORT=${PORT:-80}\n\
sed -i "s/Listen 80/Listen $APACHE_PORT/" /etc/apache2/ports.conf\n\
sed -i "s/:80/:$APACHE_PORT/" /etc/apache2/sites-enabled/000-default.conf\n\
apache2-foreground' > /start.sh && chmod +x /start.sh

# Permissions
RUN chown -R www-data:www-data /var/www/html && chmod -R 755 /var/www/html

CMD ["/start.sh"]
