# Multi-stage Dockerfile for TinderApp Mobile Simulator & Web Client
FROM nginx:alpine

# Remove default nginx configurations
RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/default.conf

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy application and simulator files
COPY demo.html /usr/share/nginx/html/demo.html
COPY demo.html /usr/share/nginx/html/index.html
COPY src /usr/share/nginx/html/src

EXPOSE 3002 80

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3002/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
