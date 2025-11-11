<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RutePerjalananTambahanOrang extends Model
{
    use HasFactory;

    protected $fillable = [
        'tambahan_orang_nominatif_id',
        'total_hari',
        'tanggal_mulai',
        'tanggal_selesai',
        'dari',
        'pulang',
        'tujuan_list',
    ];

    protected $casts = [
        'total_hari' => 'integer',
        'tanggal_mulai' => 'date',
        'tanggal_selesai' => 'date',
        'tujuan_list' => 'array', // Cast JSON to array
    ];

    /**
     * Get the tambahan orang that owns this route.
     */
    public function tambahanOrang(): BelongsTo
    {
        return $this->belongsTo(TambahanOrangNominatif::class);
    }

    /**
     * Generate complete route string
     */
    public function getCompleteRouteAttribute(): string
    {
        $destinations = $this->tujuan_list ?? [];

        if (empty($destinations)) {
            return "{$this->dari} → {$this->pulang}";
        }

        $route = [$this->dari];
        $route = array_merge($route, $destinations);
        $route[] = $this->pulang;

        return implode(' → ', $route);
    }

    /**
     * Get destination count
     */
    public function getDestinationCountAttribute(): int
    {
        return count($this->tujuan_list ?? []);
    }

    /**
     * Check if this is a single day trip
     */
    public function isSingleDay(): bool
    {
        return $this->total_hari === 1;
    }

    /**
     * Get formatted route description
     */
    public function getRouteDescriptionAttribute(): string
    {
        $count = $this->destination_count;

        if ($this->is_single_day()) {
            return "Pergi-Pulang (1 hari)";
        } elseif ($count === 1) {
            return "{$this->dari} → {$this->tujuan_list[0]} → {$this->pulang} ({$this->total_hari} hari)";
        } else {
            return "{$this->dari} → [{$count} Destinations] → {$this->pulang} ({$this->total_hari} hari)";
        }
    }

    /**
     * Validate route data
     */
    public static function validateRouteData(array $data): array
    {
        $errors = [];

        if (!isset($data['total_hari']) || $data['total_hari'] < 1) {
            $errors['total_hari'] = 'Total hari harus minimal 1';
        }

        if (!isset($data['tanggal_mulai'])) {
            $errors['tanggal_mulai'] = 'Tanggal mulai harus diisi';
        }

        if (!isset($data['tanggal_selesai'])) {
            $errors['tanggal_selesai'] = 'Tanggal selesai harus diisi';
        }

        if (isset($data['tanggal_mulai'], $data['tanggal_selesai'])) {
            $start = new \DateTime($data['tanggal_mulai']);
            $end = new \DateTime($data['tanggal_selesai']);

            if ($end < $start) {
                $errors['tanggal_selesai'] = 'Tanggal selesai tidak boleh sebelum tanggal mulai';
            }

            if (isset($data['total_hari'])) {
                $expectedEnd = (clone $start)->modify('+' . ($data['total_hari'] - 1) . ' days');
                if ($end->format('Y-m-d') !== $expectedEnd->format('Y-m-d')) {
                    $errors['total_hari'] = 'Total hari tidak sesuai dengan rentang tanggal';
                }
            }
        }

        if (isset($data['tujuan_list'])) {
            $expectedDestinations = ($data['total_hari'] ?? 1) - 1;
            $actualDestinations = count($data['tujuan_list']);

            if ($actualDestinations !== $expectedDestinations) {
                $errors['tujuan_list'] = "Jumlah tujuan harus {$expectedDestinations} untuk {$data['total_hari']} hari";
            }

            // Check for duplicate destinations
            if (count($data['tujuan_list']) !== count(array_unique($data['tujuan_list']))) {
                $errors['tujuan_list'] = 'Tujuan tidak boleh duplikat';
            }
        }

        return $errors;
    }

    /**
     * Check if this is a single day trip
     */
    public function is_single_day(): bool
    {
        return $this->total_hari === 1;
    }
}