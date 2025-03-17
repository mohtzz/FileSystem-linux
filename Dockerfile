FROM php:8.2-apache

# Установка расширений PHP
RUN docker-php-ext-install pdo pdo_mysql mysqli
RUN a2enmod rewrite

# Копируем конфигурации
COPY docker/apache/000-default.conf /etc/apache2/sites-available/000-default.conf
COPY docker/php/php.ini /usr/local/etc/php/conf.d/custom.ini

WORKDIR /var/www/html