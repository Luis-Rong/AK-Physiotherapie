#!/bin/sh
# Nächtliches Backup: pg_dump + Uploads, symmetrisch mit GPG verschlüsselt (Passphrase
# aus BACKUP_PASSPHRASE). Die verschlüsselten Dateien liegen im Volume "backups";
# ein Host-Cronjob synchronisiert sie per rclone/restic auf die Hetzner Storage Box.
# Aufbewahrung lokal: 14 Tage. Restore-Test siehe docs/betrieb.md.
set -eu
STAMP=$(date +%Y%m%d-%H%M)
OUT=/backups
mkdir -p "$OUT"

pg_dump -h db -U postgres -d reha --no-owner --format=custom \
  | gpg --batch --yes --symmetric --cipher-algo AES256 --passphrase "$BACKUP_PASSPHRASE" \
  > "$OUT/reha-db-$STAMP.dump.gpg"

tar -C /data -cf - uploads \
  | gpg --batch --yes --symmetric --cipher-algo AES256 --passphrase "$BACKUP_PASSPHRASE" \
  > "$OUT/reha-uploads-$STAMP.tar.gpg"

find "$OUT" -name 'reha-*.gpg' -mtime +14 -delete
echo "Backup $STAMP fertig"
