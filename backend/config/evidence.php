<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Evidence File Configuration
    |--------------------------------------------------------------------------
    |
    | This file contains configuration settings for evidence file uploads,
    | including allowed file types, maximum file sizes, and storage settings.
    |
    */

    'max_file_size' => env('EVIDENCE_MAX_FILE_SIZE', 5120), // 5MB in KB

    'allowed_file_types' => [
        'images' => ['jpg', 'jpeg', 'png'], // Simple - images only
    ],

    'storage_disk' => env('EVIDENCE_STORAGE_DISK', 'public'),

    'upload_path' => env('EVIDENCE_UPLOAD_PATH', 'evidence'),

    'file_naming' => [
        'prefix' => 'evidence',
        'use_timestamp' => true,
        'use_user_id' => true,
    ],

    'validation_rules' => [
        'required' => 'required',
        'file' => 'file',
        'max' => 'max:' . env('EVIDENCE_MAX_FILE_SIZE', 5120),
        'mimes' => 'mimes:jpg,jpeg,png',
    ],

    'preview' => [
        'supported_image_types' => ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'],
        'max_preview_size' => env('EVIDENCE_MAX_PREVIEW_SIZE', 2048), // 2MB
    ],

    'cleanup' => [
        'auto_delete_orphaned' => env('EVIDENCE_AUTO_DELETE_ORPHANED', false),
        'cleanup_interval_days' => env('EVIDENCE_CLEANUP_INTERVAL_DAYS', 30),
    ],
];