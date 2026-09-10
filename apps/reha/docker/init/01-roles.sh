#!/bin/sh
# Legt die beiden Anwendungsrollen und die Datenbank an, bevor Migration 0001 läuft.
# Postgres führt Dateien in /docker-entrypoint-initdb.d beim ersten Start des leeren
# Datenverzeichnisses aus (danach nie wieder). Als Shell-Skript statt .sql, weil die
# Passwörter aus der Umgebung kommen (compose.*.yml reicht REHA_OWNER_PASSWORD und
# REHA_APP_PASSWORD an den db-Container).
#
# Muss deckungsgleich bleiben mit scripts/lib/embedded.ts (lokale Entwicklung/Tests).
set -eu

if [ -z "${REHA_OWNER_PASSWORD:-}" ] || [ -z "${REHA_APP_PASSWORD:-}" ]; then
	echo "01-roles.sh: REHA_OWNER_PASSWORD und REHA_APP_PASSWORD müssen gesetzt sein" >&2
	exit 1
fi

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres \
	--set owner_pw="$REHA_OWNER_PASSWORD" --set app_pw="$REHA_APP_PASSWORD" <<-'EOSQL'
	CREATE ROLE reha_owner LOGIN PASSWORD :'owner_pw';
	CREATE ROLE reha_app   LOGIN PASSWORD :'app_pw' NOSUPERUSER NOCREATEDB NOCREATEROLE;
	CREATE DATABASE reha OWNER reha_owner;
EOSQL

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname reha <<-'EOSQL'
	ALTER SCHEMA public OWNER TO reha_owner;
	REVOKE ALL ON SCHEMA public FROM PUBLIC;
	GRANT USAGE ON SCHEMA public TO reha_app;
EOSQL
