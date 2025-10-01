<?php

namespace App\Console\Commands;

use App\Services\MinioService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class CleanupOrphanedFiles extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'files:cleanup-orphaned 
                            {--days=1 : Number of days to keep temporary files}
                            {--dry-run : Show what would be deleted without actually deleting}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Clean up orphaned temporary files older than specified days';

    protected MinioService $minioService;

    /**
     * Create a new command instance.
     */
    public function __construct(MinioService $minioService)
    {
        parent::__construct();
        $this->minioService = $minioService;
    }

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $days = (int)$this->option('days');
        $dryRun = $this->option('dry-run');

        $this->info("Cleaning up temporary files older than {$days} day(s)...");

        if ($dryRun) {
            $this->warn('DRY RUN MODE - No files will be deleted');
        }

        $disk = Storage::disk('minio');
        $cutoffDate = now()->subDays($days);

        $deletedCount = 0;
        $totalSize = 0;

        // Get all directories in tmp/
        $tmpDirectories = $this->getTmpDirectories($disk);

        foreach ($tmpDirectories as $directory) {
            // Parse date from directory path: tmp/YYYY/MM/DD/
            if (preg_match('#tmp/(\d{4})/(\d{2})/(\d{2})/#', $directory, $matches)) {
                $year = $matches[1];
                $month = $matches[2];
                $day = $matches[3];

                try {
                    $dirDate = \Carbon\Carbon::createFromFormat('Y-m-d', "{$year}-{$month}-{$day}");

                    if ($dirDate->lt($cutoffDate)) {
                        // This directory is older than cutoff date
                        $files = $disk->allFiles($directory);

                        foreach ($files as $file) {
                            $size = $disk->size($file);
                            $totalSize += $size;

                            if ($dryRun) {
                                $this->line("Would delete: {$file} (" . $this->formatBytes($size) . ")");
                            } else {
                                $disk->delete($file);
                                $this->line("Deleted: {$file} (" . $this->formatBytes($size) . ")");
                            }

                            $deletedCount++;
                        }

                        // Try to delete empty directories
                        if (!$dryRun && empty($disk->allFiles($directory))) {
                            $this->deleteEmptyDirectories($disk, $directory);
                        }
                    }
                } catch (\Exception $e) {
                    $this->error("Error processing directory {$directory}: " . $e->getMessage());
                }
            }
        }

        if ($deletedCount > 0) {
            $action = $dryRun ? 'Would delete' : 'Deleted';
            $this->info("{$action} {$deletedCount} file(s) totaling " . $this->formatBytes($totalSize));
        } else {
            $this->info('No orphaned files found to clean up.');
        }

        return Command::SUCCESS;
    }

    /**
     * Get all tmp directories
     */
    protected function getTmpDirectories($disk): array
    {
        $directories = [];

        try {
            // Get all directories under tmp/
            $allDirectories = $disk->directories('tmp');

            foreach ($allDirectories as $dir) {
                // Recursively get subdirectories
                $subDirs = $disk->allDirectories($dir);
                $directories = array_merge($directories, [$dir], $subDirs);
            }
        } catch (\Exception $e) {
            $this->error("Error listing directories: " . $e->getMessage());
        }

        return $directories;
    }

    /**
     * Delete empty directories recursively
     */
    protected function deleteEmptyDirectories($disk, string $directory): void
    {
        try {
            // Check if directory is empty
            $files = $disk->allFiles($directory);
            $subdirs = $disk->directories($directory);

            if (empty($files) && empty($subdirs)) {
                $disk->deleteDirectory($directory);
                $this->line("Deleted empty directory: {$directory}");

                // Try to delete parent directory if it's also empty
                $parentDir = dirname($directory);
                if ($parentDir !== '.' && str_starts_with($parentDir, 'tmp/')) {
                    $this->deleteEmptyDirectories($disk, $parentDir);
                }
            }
        } catch (\Exception $e) {
            // Silently fail - directory might not be empty or might not exist
        }
    }

    /**
     * Format bytes to human readable format
     */
    protected function formatBytes(float|int $bytes, int $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, $precision, PHP_ROUND_HALF_UP) . ' ' . $units[$i];
    }
}
