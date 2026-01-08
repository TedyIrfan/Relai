<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class SbmDetailResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     */
    public function toArray($request): array
    {
        // Get data
        $jsonData = $this->data ?? [];

        // Jika data null atau kosong, return basic data
        if (empty($jsonData)) {
            return [
                'id' => $this->id,
                'category' => $this->category,
                'sub_category' => $this->sub_category,
                'parent_section' => $this->parent_section,
                'grouping_label' => $this->grouping_label,
                'currency' => $this->currency,
                'source_file' => $this->source_file,
            ];
        }

        // Flatten data ke level atas
        $data = $jsonData;

        // Tambahkan metadata dari tabel utama
        $data['id'] = $this->id;
        $data['category'] = $this->category;
        $data['sub_category'] = $this->sub_category;
        $data['parent_section'] = $this->parent_section;
        $data['grouping_label'] = $this->grouping_label;
        $data['currency'] = $this->currency;
        $data['source_file'] = $this->source_file;

        // Format besaran ke currency (jika ada)
        if (isset($data['besaran']) && is_numeric($data['besaran'])) {
            $data['besaran_formatted'] = 'Rp ' . number_format($data['besaran'], 0, ',', '.');
        }

        return $data;
    }
}
