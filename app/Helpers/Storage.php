<?php

namespace App\Helpers;

abstract class Storage
{
    /**
     * Generate the upload path for this item.
     * Format: {tableName}/{year}/{month}/{day}/{modelID}
     *
     * @param $table
     * @param $id
     * @return string
     */
    public static function generateUploadPath($table, $id): string
    {
        return sprintf(
            '%s/%s/%s/%s/%s',
            $table,
            date('Y'),
            date('m'),
            date('d'),
            $id
        );
    }

}