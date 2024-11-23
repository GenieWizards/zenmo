.PHONY: clean build up down restart logs prune migrate test help

# Default target
.DEFAULT_GOAL := help

# Variables
DC := docker compose

# Colors for help message
YELLOW := \033[33m
RESET := \033[0m

help: ## Show this help message
	@echo 'Usage:'
	@echo '  make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*##"; printf "\n"} /^[a-zA-Z_-]+:.*?##/ { printf "  $(YELLOW)%-15s$(RESET) %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

clean: ## Stop containers, remove volumes, and prune system
	$(DC) down -v
	docker system prune -f

build: ## Rebuild the containers without using cache
	$(DC) build --no-cache

up: ## Start the application in the foreground
	$(DC) up

up-d: ## Start the application in the background
	$(DC) up -d

down: ## Stop the application
	$(DC) down

restart: down up ## Restart the application

logs: ## Show logs from all containers
	$(DC) logs -f

prune: ## Remove all unused containers, networks, images (both dangling and unreferenced), and volumes
	docker system prune -a --volumes -f

ps: ## List running containers
	$(DC) ps

migrate: ## Run database migrations
	$(DC) exec api bun run db:migrate

shell: ## Open a shell in the api container
	$(DC) exec api /bin/sh

test: ## Run tests
	$(DC) exec api bun run test

rebuild: clean build up ## Clean everything, rebuild, and start the application

# Development specific commands
dev-build: ## Build for development
	$(DC) -f docker-compose.dev.yml build

dev-up: ## Start the application in development mode
	$(DC) -f docker-compose.dev.yml up

dev-down: ## Stop the development environment
	$(DC) -f docker-compose.dev.yml down

