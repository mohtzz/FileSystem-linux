FROM php:8.2-apache

# Установка Node.js и npm
RUN curl -sL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Установка Go
RUN wget https://go.dev/dl/go1.21.1.linux-amd64.tar.gz \
    && tar -C /usr/local -xzf go1.21.1.linux-amd64.tar.gz \
    && rm go1.21.1.linux-amd64.tar.gz
ENV PATH="/usr/local/go/bin:${PATH}"

# Установка TypeScript
RUN npm install -g typescript

# PHP расширения и настройки Apache
RUN docker-php-ext-install pdo pdo_mysql mysqli \
    && a2enmod rewrite

# Копирование конфигураций
COPY docker/apache/000-default.conf /etc/apache2/sites-available/000-default.conf
# COPY docker/php/php.ini /usr/local/etc/php/conf.d/custom.ini

# Скрипт для запуска Go-приложения
COPY entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/entrypoint.sh

WORKDIR /var/www/html