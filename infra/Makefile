.DEFAULT_GOAL := help
.NOTPARALLEL:
.PHONY: help setup build up down ps logs check db-shell db-reset
export SERVICE
export CONFIRM

INFRA := $(realpath $(dir $(lastword $(MAKEFILE_LIST))))
ROOT := $(realpath $(INFRA)/..)
COMPOSE := docker compose --project-directory "$(INFRA)" --env-file "$(INFRA)/.env"

help:
	@printf '%s\n' 'make -C infra up     Build and start the admin stack with hot reload' \
	  'make -C infra down   Stop the stack and preserve database data' \
	  'Other commands: setup build ps logs check db-shell db-reset' \
	  'build, up, ps and logs accept SERVICE=backend (or frontend/postgres).' \
	  'db-reset requires CONFIRM=admin and permanently deletes database data.'

setup:
	@set -eu; env_file="$(INFRA)/.env"; \
	if [ -e "$$env_file" ] || [ -L "$$env_file" ]; then exit 0; fi; \
	docker info >/dev/null; \
	if docker volume inspect simple-products-admin_postgres_data >/dev/null 2>&1; then \
	  echo 'Database exists; recover its original .env instead of generating credentials.' >&2; exit 1; fi; \
	umask 077; set -C; \
	generated_password="$$(openssl rand -hex 32)"; \
	INFRA_PASSWORD="$$generated_password" awk \
	  '/^POSTGRES_PASSWORD=/ { print "POSTGRES_PASSWORD=" ENVIRON["INFRA_PASSWORD"]; next } { print }' \
	  "$(INFRA)/.env.example" > "$$env_file"; \
	echo 'Created private infra/.env with a generated database password.'

build: setup
	@$(COMPOSE) build -- $${SERVICE:+"$$SERVICE"}

up: setup
	@$(COMPOSE) up --build --detach --wait --wait-timeout 90 -- $${SERVICE:+"$$SERVICE"}

down:
	@$(COMPOSE) down

ps:
	@$(COMPOSE) ps -- $${SERVICE:+"$$SERVICE"}

logs:
	@$(COMPOSE) logs --follow --tail=100 -- $${SERVICE:+"$$SERVICE"}

db-shell:
	@$(COMPOSE) exec postgres sh -c 'exec psql -U "$$POSTGRES_USER" -d "$$POSTGRES_DB"'

check:
	@cd "$(ROOT)" && pnpm check

db-reset:
	@set -eu; \
	[ "$$CONFIRM" = admin ] || { echo 'Deletion requires CONFIRM=admin' >&2; exit 1; }; \
	owner="$$(docker volume inspect --format '{{ index .Labels "com.docker.compose.project" }}|{{ index .Labels "com.docker.compose.volume" }}' simple-products-admin_postgres_data)"; \
	[ "$$owner" = 'simple-products-admin|postgres_data' ] || { echo 'Volume ownership mismatch' >&2; exit 1; }; \
	$(COMPOSE) stop; $(COMPOSE) rm --force postgres; docker volume rm simple-products-admin_postgres_data
