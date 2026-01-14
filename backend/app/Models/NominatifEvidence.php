<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class NominatifEvidence extends Model
{
    use HasFactory;

    protected $table = 'nominatif_evidence';

    protected $fillable = [
        'nominatif_id',
        'nominatif_detail_row_id',
        'evidence_link', // Evidence URL (any link)
        'evidence_name', // Display name for the evidence
        'keterangan',
        'user_id', // Track who uploaded
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    // Relationships
    public function nominatif()
    {
        return $this->belongsTo(NominatifNew::class, 'nominatif_id');
    }

    public function detailRow()
    {
        return $this->belongsTo(NominatifDetailRow::class, 'nominatif_detail_row_id');
    }

    
    // Accessors
    public function getGoogleDriveIdAttribute()
    {
        // Extract Google Drive ID from URL for preview display
        $url = $this->evidence_link;

        if (preg_match('/\/d\/([a-zA-Z0-9-_]+)/', $url, $matches)) {
            return $matches[1];
        }

        return null;
    }

    public function getPreviewUrlAttribute()
    {
        // Generate preview URL for Google Drive
        if ($this->google_drive_id) {
            return "https://drive.google.com/file/d/{$this->google_drive_id}/preview";
        }

        return $this->evidence_link;
    }

    public function getThumbnailUrlAttribute()
    {
        // Generate thumbnail URL for Google Drive (if available)
        if ($this->google_drive_id) {
            return "https://drive.google.com/thumbnail?id={$this->google_drive_id}&sz=w200";
        }

        return null;
    }

    public function getIsGoogleDriveLinkAttribute()
    {
        return strpos($this->evidence_link, 'drive.google.com') !== false;
    }

    public function getIsGoogleDocsLinkAttribute()
    {
        return strpos($this->evidence_link, 'docs.google.com') !== false;
    }

    public function getDocumentTypeAttribute()
    {
        if ($this->is_google_docs_link) {
            if (strpos($this->evidence_link, '/document/') !== false) {
                return 'Google Docs';
            } elseif (strpos($this->evidence_link, '/spreadsheets/') !== false) {
                return 'Google Sheets';
            } elseif (strpos($this->evidence_link, '/presentation/') !== false) {
                return 'Google Slides';
            } elseif (strpos($this->evidence_link, '/forms/') !== false) {
                return 'Google Forms';
            }
        } elseif ($this->is_google_drive_link) {
            return 'Google Drive File';
        }

        return 'Web Link';
    }

    // Scopes
    public function scopeGoogleDrive($query)
    {
        return $query->where('evidence_link', 'like', '%drive.google.com%');
    }

    public function scopeGoogleDocs($query)
    {
        return $query->where('evidence_link', 'like', '%docs.google.com%');
    }

    public function scopeByName($query, $name)
    {
        return $query->where('evidence_name', 'like', "%{$name}%");
    }

    // Validation rules
    public static function getValidationRules()
    {
        return [
            'evidence_link' => 'required|url|max:1000',
            'evidence_name' => 'required|string|max:255',
            'keterangan' => 'nullable|string|max:500',
        ];
    }

    public static function getGoogleDriveValidationRules()
    {
        return [
            'evidence_link' => 'required|url|regex:/^https:\/\/(drive|docs)\.google\.com\/.*/|max:1000',
            'evidence_name' => 'required|string|max:255',
            'keterangan' => 'nullable|string|max:500',
        ];
    }

    public static function getValidationMessages()
    {
        return [
            'evidence_link.required' => 'Link Google Drive wajib diisi',
            'evidence_link.url' => 'Format link tidak valid',
            'evidence_link.regex' => 'Link harus berupa Google Drive atau Google Docs',
            'evidence_link.max' => 'Link terlalu panjang (maks 1000 karakter)',
            'evidence_name.required' => 'Nama evidence wajib diisi',
            'evidence_name.max' => 'Nama evidence terlalu panjang (maks 255 karakter)',
        ];
    }
}