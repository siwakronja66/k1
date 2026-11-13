# Stage 1: build vendored assets (three.js, fonts, Font Awesome, QR lib) + Tailwind CSS
FROM node:22-alpine AS assets
WORKDIR /build
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY tools/ tools/
COPY src-css/ src-css/
COPY tailwind.config.cjs ./
COPY public/ public/
RUN npm run build

# Stage 2: runtime
FROM php:8.3-apache

RUN docker-php-ext-install pdo_mysql \
 && a2enmod rewrite headers \
 && sed -ri 's#/var/www/html#/var/www/app/public#g' /etc/apache2/sites-available/000-default.conf /etc/apache2/apache2.conf \
 && mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini" \
 && printf 'expose_php=Off\ndate.timezone=Asia/Bangkok\nsession.cookie_httponly=1\nsession.use_strict_mode=1\n' > "$PHP_INI_DIR/conf.d/zz-app.ini" \
 && printf 'ServerTokens Prod\nServerSignature Off\n<Directory /var/www/app/public>\n  AllowOverride All\n  Options -Indexes\n</Directory>\n' > /etc/apache2/conf-enabled/zz-app.conf

WORKDIR /var/www/app
COPY src/ src/
COPY bin/ bin/
COPY db/migrations/ db/migrations/
COPY public/ public/
COPY --from=assets /build/public/vendor/ public/vendor/

# Apply pending DB migrations, then serve
CMD ["sh", "-c", "php bin/migrate.php && exec apache2-foreground"]
