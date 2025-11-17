<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class NominatifEvidence extends Model
{
    use HasFactory;

    protected $table = 'nominatif_evidence';

    protected $fillable = [
        'nominatif_detail_row_id',
        'evidence_foto_path',
        'evidence_foto_name',
        'evidence_foto_size',
        'evidence_foto_type',
        'keterangan',
    ];

    protected $casts = [
        'evidence_foto_size' => 'integer',
    ];

    // Relationships
    public function detailRow()
    {
        return $this->belongsTo(NominatifDetailRow::class, 'nominatif_detail_row_id');
    }

    // Accessors
    public function getFormattedFileSizeAttribute()
    {
        $bytes = $this->evidence_foto_size;
        $units = ['B', 'KB', 'MB', 'GB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, 2) . ' ' . $units[$i];
    }

    public function getFileExtensionAttribute()
    {
        return pathinfo($this->evidence_foto_name, PATHINFO_EXTENSION);
    }

    public function isImageAttribute()
    {
        return in_array(strtolower($this->file_extension), ['jpg', 'jpeg', 'png', 'gif', 'bmp']);
    }

    public function isPdfAttribute()
    {
        return strtolower($this->file_extension) === 'pdf';
    }

    // Scopes
    public function scopeImages($query)
    {
        return $query->whereIn('evidence_foto_type', ['image/jpeg', 'image/png', 'image/gif', 'image/bmp']);
    }

    public function scopePdfs($query)
    {
        return $query->where('evidence_foto_type', 'application/pdf');
    }

    // Validation rules
    public static function getValidationRules()
    {
        return [
            'evidence_foto' => 'required|file|mimes:jpg,jpeg,png,pdf,bmp,gif|max:5120', // Max 5MB
            'keterangan' => 'nullable|string|max:500',
        ];
    }

    public static function getAllowedMimeTypes()
    {
        return [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/bmp',
            'application/pdf',
        ];
    }
}