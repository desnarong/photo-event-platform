#!/bin/bash

# Quick restart script

SERVICE=$1

if [ -z "$SERVICE" ]; then
    echo "Usage: ./scripts/restart.sh [service-name|all]"
    echo ""
    echo "Available services:"
    docker compose ps --services
    echo ""
    echo "Examples:"
    echo "  ./scripts/restart.sh api        # Restart API only"
    echo "  ./scripts/restart.sh all        # Restart everything"
    exit 1
fi

echo "🔄 Restarting $SERVICE..."

if [ "$SERVICE" = "all" ]; then
    docker compose restart
else
    docker compose restart $SERVICE
fi

echo "✅ Done!"
echo ""
echo "Check status: docker compose ps"
echo "View logs: ./scripts/logs.sh $SERVICE"
