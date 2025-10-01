# Orphaned Files Cleanup

This document describes the automated cleanup system for orphaned temporary files in MinIO.

## Overview

When users upload files on the Create page but abandon the form without saving, files are left in temporary storage. The cleanup system automatically removes these orphaned files.

## Temporary File Structure

**Temporary uploads:** `tmp/{yyyy}/{mm}/{dd}/{tableName}/filename.ext`
- Example: `tmp/2025/10/01/sample_items/document.pdf`

**Final location (after save):** `{tableName}/{yyyy}/{mm}/{dd}/{modelID}/filename.ext`
- Example: `sample_items/2025/10/01/abc-123-def/document.pdf`

## Automated Cleanup

### Schedule
The cleanup runs **daily at 2:00 AM** and removes temporary files older than **1 day**.

### Configuration
Located in `bootstrap/app.php`:
```php
$schedule->command('files:cleanup-orphaned --days=1')
    ->dailyAt('02:00')
    ->onSuccess(function () {
        \Log::info('Orphaned files cleanup completed successfully');
    })
    ->onFailure(function () {
        \Log::error('Orphaned files cleanup failed');
    });
```

## Manual Cleanup

### Command Usage

**Dry run (preview what would be deleted):**
```bash
php artisan files:cleanup-orphaned --dry-run
```

**Delete files older than 1 day (default):**
```bash
php artisan files:cleanup-orphaned
```

**Delete files older than 2 days:**
```bash
php artisan files:cleanup-orphaned --days=2
```

**Delete files older than 7 days:**
```bash
php artisan files:cleanup-orphaned --days=7
```

### Command Options

| Option | Description | Default |
|--------|-------------|---------|
| `--days` | Number of days to keep temporary files | 1 |
| `--dry-run` | Show what would be deleted without actually deleting | false |

## How It Works

1. **Scans** all directories under `tmp/`
2. **Parses** date from directory structure: `tmp/YYYY/MM/DD/`
3. **Compares** directory date with cutoff date (now - days)
4. **Deletes** files in directories older than cutoff
5. **Removes** empty directories after cleanup
6. **Logs** results to Laravel log

## Monitoring

### Check for orphaned files
```bash
# List all temporary files
php artisan files:cleanup-orphaned --dry-run

# Check MinIO directly
aws s3 ls s3://localhost/tmp/ --recursive --endpoint-url http://localhost:9000
```

### View cleanup logs
```bash
# Check Laravel logs for cleanup results
tail -f storage/logs/laravel.log | grep "Orphaned files cleanup"
```

## Example Output

```
Cleaning up temporary files older than 1 day(s)...
Deleted: tmp/2025/09/30/sample_items/document.pdf (1.2 MB)
Deleted: tmp/2025/09/30/sample_items/image.jpg (856.4 KB)
Deleted empty directory: tmp/2025/09/30/sample_items
Deleted empty directory: tmp/2025/09/30
Deleted 2 file(s) totaling 2.05 MB
```

## Security Benefits

1. **No orphaned folders** - Abandoned uploads don't create model-specific folders
2. **Easy monitoring** - All temporary files are in `tmp/` prefix
3. **Automatic cleanup** - Old files are removed automatically
4. **Storage efficiency** - Prevents accumulation of abandoned files
5. **Clear separation** - Temporary vs permanent files are clearly distinguished

## Troubleshooting

### Cleanup not running automatically
1. Ensure Laravel scheduler is running:
   ```bash
   php artisan schedule:work
   ```
   Or add to crontab:
   ```
   * * * * * cd /path/to/project && php artisan schedule:run >> /dev/null 2>&1
   ```

2. Check scheduler list:
   ```bash
   php artisan schedule:list
   ```

### Files not being deleted
1. Run with dry-run to see what would be deleted:
   ```bash
   php artisan files:cleanup-orphaned --dry-run
   ```

2. Check MinIO permissions:
   - Ensure Laravel has delete permissions on MinIO bucket

3. Check logs for errors:
   ```bash
   tail -f storage/logs/laravel.log
   ```

## Best Practices

1. **Keep default 1 day retention** - Gives users time to complete forms
2. **Monitor cleanup logs** - Ensure cleanup is running successfully
3. **Run manual cleanup** - If scheduler is not set up yet
4. **Adjust retention** - Increase days if users need more time
5. **Test in staging** - Verify cleanup works before production

## Related Files

- **Command:** `app/Console/Commands/CleanupOrphanedFiles.php`
- **Schedule:** `bootstrap/app.php`
- **Upload Controller:** `app/Http/Controllers/UploadController.php`
- **Item Controller:** `app/Http/Controllers/Sample/ItemController.php`
