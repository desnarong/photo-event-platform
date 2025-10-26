#!/bin/bash

# Quick logs viewer script

SERVICE=$1

if [ -z "$SERVICE" ]; then
    echo "Usage: ./scripts/logs.sh [service-name|all]"
    echo ""
    echo "Available services:"
    docker compose ps --services
    echo ""
    echo "Examples:"
    echo "  ./scripts/logs.sh api          # View API logs"
    echo "  ./scripts/logs.sh ai-service   # View AI service logs"
    echo "  ./scripts/logs.sh all          # View all logs"
    exit 1
fi

if [ "$SERVICE" = "all" ]; then
    docker compose logs -f --tail=100
else
    docker compose logs -f --tail=100 $SERVICE
fi
