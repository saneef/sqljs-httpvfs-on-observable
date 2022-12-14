#!/usr/bin/env bash

set -eu

indb="$1"
outdir="$2"
urlPrefix="db-sqlite3-"

# for chunked mode, we need to know the database size in bytes beforehand
bytes="$(stat -f "%z" "$indb")"
# set chunk size to 10MiB (needs to be a multiple of the `pragma page_size`!)
serverChunkSize=$((10 * 1024 * 1024))
suffixLength=3
rm -f "$outdir/*"
split -d -b $serverChunkSize -a $suffixLength "$indb" "$outdir/$urlPrefix"

# set request chunk size to match page size
requestChunkSize="$(sqlite3 "$indb" 'pragma page_size')"

# write a json config
echo '
{
    "serverMode": "chunked",
    "requestChunkSize": '$requestChunkSize',
    "databaseLengthBytes": '$bytes',
    "serverChunkSize": '$serverChunkSize',
    "urlPrefix": "'$urlPrefix'",
    "suffixLength": '$suffixLength'
}
' > "$outdir/config.json"
