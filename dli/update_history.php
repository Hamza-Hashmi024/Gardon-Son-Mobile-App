<?php
declare(strict_types=1);

header('Content-Type: application/json');

$dataDir = __DIR__ . DIRECTORY_SEPARATOR . 'data';
$historyDir = __DIR__ . DIRECTORY_SEPARATOR . 'history';

$summary = [
    'processed' => 0,
    'created' => 0,
    'updated' => 0,
    'skipped' => 0,
    'errors' => [],
];

function add_error(array &$summary, string $file, string $message): void
{
    $summary['errors'][] = [
        'file' => $file,
        'message' => $message,
    ];
}

function read_json_file(string $path, array &$summary): ?array
{
    if (!is_file($path)) {
        add_error($summary, basename($path), 'File does not exist.');
        return null;
    }

    $raw = file_get_contents($path);

    if ($raw === false || trim($raw) === '') {
        add_error($summary, basename($path), 'File is empty or unreadable.');
        return null;
    }

    $decoded = json_decode($raw, true);

    if (json_last_error() !== JSON_ERROR_NONE || !is_array($decoded)) {
        add_error($summary, basename($path), 'Invalid JSON: ' . json_last_error_msg());
        return null;
    }

    return $decoded;
}

function get_readings(array $data): array
{
    return isset($data['dli_history']) && is_array($data['dli_history'])
        ? array_values(array_filter($data['dli_history'], 'is_array'))
        : [];
}

function normalize_key_value($value): string
{
    if (is_float($value) || is_int($value)) {
        return rtrim(rtrim(sprintf('%.12F', (float) $value), '0'), '.');
    }

    if (is_bool($value)) {
        return $value ? 'true' : 'false';
    }

    if ($value === null) {
        return 'null';
    }

    return trim((string) $value);
}

function stable_json_encode($value): string
{
    if (is_array($value)) {
        $isList = count($value) === 0 || array_keys($value) === range(0, count($value) - 1);

        if (!$isList) {
            ksort($value);
        }

        foreach ($value as $key => $child) {
            $value[$key] = is_array($child) ? json_decode(stable_json_encode($child), true) : $child;
        }
    }

    return json_encode($value, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
}

function reading_duplicate_key(array $reading): string
{
    $hasDate = array_key_exists('date', $reading);
    $hasTime = array_key_exists('time', $reading);
    $hasValue = array_key_exists('value', $reading);

    if ($hasDate && $hasTime && $hasValue) {
        return 'date_time_value|' .
            normalize_key_value($reading['date']) . '|' .
            normalize_key_value($reading['time']) . '|' .
            normalize_key_value($reading['value']);
    }

    foreach (['timestamp', 'datetime', 'created_at', 'createdAt'] as $field) {
        if (array_key_exists($field, $reading) && $hasValue) {
            return $field . '_value|' .
                normalize_key_value($reading[$field]) . '|' .
                normalize_key_value($reading['value']);
        }
    }

    if ($hasDate && $hasValue) {
        return 'date_value|' .
            normalize_key_value($reading['date']) . '|' .
            normalize_key_value($reading['value']);
    }

    if ($hasTime && $hasValue) {
        return 'time_value|' .
            normalize_key_value($reading['time']) . '|' .
            normalize_key_value($reading['value']);
    }

    return 'full_reading|' . stable_json_encode($reading);
}

function reading_sort_value(array $reading): ?int
{
    $date = isset($reading['date']) ? trim((string) $reading['date']) : '';
    $time = isset($reading['time']) ? trim((string) $reading['time']) : '';

    if ($date === '') {
        foreach (['timestamp', 'datetime', 'created_at', 'createdAt'] as $field) {
            if (!empty($reading[$field])) {
                $parsed = strtotime((string) $reading[$field]);
                return $parsed === false ? null : $parsed;
            }
        }

        return null;
    }

    $parsed = strtotime(trim($date . ' ' . ($time !== '' ? $time : '00:00:00')));

    return $parsed === false ? null : $parsed;
}

function merge_readings(array $historyReadings, array $liveReadings): array
{
    $existingCounts = [];

    foreach ($historyReadings as $reading) {
        $key = reading_duplicate_key($reading);
        $existingCounts[$key] = ($existingCounts[$key] ?? 0) + 1;
    }

    $merged = $historyReadings;

    foreach ($liveReadings as $reading) {
        $key = reading_duplicate_key($reading);

        if (($existingCounts[$key] ?? 0) > 0) {
            $existingCounts[$key]--;
            continue;
        }

        $merged[] = $reading;
    }

    return $merged;
}

function sort_readings(array $readings): array
{
    $indexed = [];

    foreach ($readings as $index => $reading) {
        $indexed[] = [
            'index' => $index,
            'sort' => reading_sort_value($reading),
            'reading' => $reading,
        ];
    }

    usort($indexed, static function (array $a, array $b): int {
        if ($a['sort'] === null && $b['sort'] === null) {
            return $a['index'] <=> $b['index'];
        }

        if ($a['sort'] === null) {
            return 1;
        }

        if ($b['sort'] === null) {
            return -1;
        }

        return $a['sort'] <=> $b['sort'] ?: $a['index'] <=> $b['index'];
    });

    return array_map(static function (array $item): array {
        return $item['reading'];
    }, $indexed);
}

function write_history_file(string $path, array $payload): bool
{
    $json = json_encode(
        $payload,
        JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
    );

    if ($json === false) {
        return false;
    }

    return file_put_contents($path, $json . PHP_EOL, LOCK_EX) !== false;
}

// Stop early if the live data folder is missing; this keeps cron output safe.
if (!is_dir($dataDir)) {
    $summary['skipped']++;
    add_error($summary, 'data', 'Live data folder was not found.');
    echo json_encode($summary, JSON_PRETTY_PRINT);
    exit;
}

// Create the history folder once before processing devices.
if (!is_dir($historyDir) && !mkdir($historyDir, 0755, true) && !is_dir($historyDir)) {
    $summary['skipped']++;
    add_error($summary, 'history', 'Could not create history folder.');
    echo json_encode($summary, JSON_PRETTY_PRINT);
    exit;
}

// Read every live device JSON file, using the filename as the MAC address.
foreach (glob($dataDir . DIRECTORY_SEPARATOR . '*.json') ?: [] as $livePath) {
    $filename = basename($livePath);
    $mac = strtoupper(pathinfo($filename, PATHINFO_FILENAME));

    if (!preg_match('/^[A-F0-9]{12}$/', $mac)) {
        $summary['skipped']++;
        add_error($summary, $filename, 'Filename is not a valid 12-character MAC JSON file.');
        continue;
    }

    // Read current live readings. Invalid JSON is skipped without stopping the batch.
    $liveData = read_json_file($livePath, $summary);

    if ($liveData === null) {
        $summary['skipped']++;
        continue;
    }

    $historyPath = $historyDir . DIRECTORY_SEPARATOR . $mac . '.json';
    $historyData = is_file($historyPath) ? read_json_file($historyPath, $summary) : null;
    $historyExists = is_array($historyData);

    // Missing or invalid history starts from an empty valid payload, preserving live import.
    $oldReadings = $historyExists ? get_readings($historyData) : [];
    $liveReadings = get_readings($liveData);

    // Merge current live data into old history without deleting existing history entries.
    $mergedReadings = sort_readings(merge_readings($oldReadings, $liveReadings));

    $payload = [
        'mac' => $mac,
        'last_updated' => gmdate('c'),
        'dli_history' => $mergedReadings,
    ];

    if (isset($liveData['firmware_version'])) {
        $payload['firmware_version'] = $liveData['firmware_version'];
    }

    if (isset($liveData['mac_address'])) {
        $payload['mac_address'] = $liveData['mac_address'];
    }

    // Save a valid history JSON file even when the live file has no readings yet.
    if (!write_history_file($historyPath, $payload)) {
        $summary['skipped']++;
        add_error($summary, $filename, 'Could not write history JSON file.');
        continue;
    }

    $summary['processed']++;

    if ($historyExists) {
        $summary['updated']++;
    } else {
        $summary['created']++;
    }
}

echo json_encode($summary, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
