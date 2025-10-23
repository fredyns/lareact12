<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use ReflectionClass;
use ReflectionEnum;

class GenerateEnumTypes extends Command
{
    protected $signature = 'enums:generate';
    protected $description = 'Generate TypeScript definitions from PHP Enums';

    public function handle(): int
    {
        $this->info('🔄 Generating TypeScript enum definitions...');

        $enumsPath = app_path('Enums');
        $outputPath = resource_path('js/types/enums.generated.ts');

        if (!File::exists($enumsPath)) {
            $this->error("❌ Enums directory not found: {$enumsPath}");
            return self::FAILURE;
        }

        $enums = $this->scanEnums($enumsPath);
        
        if (empty($enums)) {
            $this->warn('⚠️  No enums found in ' . $enumsPath);
            return self::SUCCESS;
        }

        $typescript = $this->generateTypeScript($enums);

        // Ensure directory exists
        $outputDir = dirname($outputPath);
        if (!File::exists($outputDir)) {
            File::makeDirectory($outputDir, 0755, true);
        }

        File::put($outputPath, $typescript);

        $this->info("✅ Generated: {$outputPath}");
        $this->info("📦 Processed " . count($enums) . " enum(s)");
        
        foreach ($enums as $enum) {
            $this->line("   - {$enum['name']} (" . count($enum['cases']) . " cases)");
        }

        return self::SUCCESS;
    }

    protected function scanEnums(string $path): array
    {
        $enums = [];
        $files = File::allFiles($path);

        foreach ($files as $file) {
            $namespace = $this->getNamespaceFromFile($file->getPathname());
            $className = $namespace . '\\' . $file->getFilenameWithoutExtension();

            if (class_exists($className) && enum_exists($className)) {
                try {
                    $reflection = new ReflectionEnum($className);
                    $enums[] = $this->extractEnumData($reflection);
                } catch (\Exception $e) {
                    $this->warn("⚠️  Failed to process {$className}: " . $e->getMessage());
                }
            }
        }

        return $enums;
    }

    protected function getNamespaceFromFile(string $file): string
    {
        $content = File::get($file);
        
        if (preg_match('/namespace\s+([^;]+);/', $content, $matches)) {
            return $matches[1];
        }

        return 'App\\Enums';
    }

    protected function extractEnumData(ReflectionEnum $enum): array
    {
        $cases = [];
        $options = [];

        foreach ($enum->getCases() as $case) {
            $value = $case->getBackingValue();
            $label = $this->generateLabel($case->getName());

            $cases[$case->getName()] = $value;
            $options[] = [
                'value' => $value,
                'label' => $label,
            ];
        }

        // Extract namespace path after App\Enums\
        $fullName = $enum->getName();
        $namespace = '';
        if (preg_match('/App\\\\Enums\\\\(.+)\\\\([^\\\\]+)$/', $fullName, $matches)) {
            $namespace = str_replace('\\', '.', $matches[1]); // e.g., "Sample"
        }

        return [
            'name' => $enum->getShortName(),
            'fullName' => $fullName,
            'namespace' => $namespace,
            'cases' => $cases,
            'options' => $options,
        ];
    }

    protected function generateLabel(string $name): string
    {
        // Convert SCREAMING_SNAKE_CASE to Title Case
        return ucwords(str_replace('_', ' ', strtolower($name)));
    }

    protected function generateTypeScript(array $enums): string
    {
        $ts = "/**\n";
        $ts .= " * Auto-generated TypeScript enums from PHP\n";
        $ts .= " * DO NOT EDIT MANUALLY - Run 'php artisan enums:generate' to regenerate\n";
        $ts .= " * Generated at: " . now()->toDateTimeString() . "\n";
        $ts .= " */\n\n";

        $ts .= "export interface SelectOption {\n";
        $ts .= "  value: string;\n";
        $ts .= "  label: string;\n";
        $ts .= "}\n\n";

        // Group enums by namespace
        $grouped = [];
        foreach ($enums as $enum) {
            $namespace = $enum['namespace'] ?: '_root';
            $grouped[$namespace][] = $enum;
        }

        foreach ($grouped as $namespace => $namespaceEnums) {
            if ($namespace !== '_root') {
                // Add comment for namespace organization
                $ts .= "// ============================================\n";
                $ts .= "// Namespace: {$namespace}\n";
                $ts .= "// ============================================\n\n";
            }
            
            foreach ($namespaceEnums as $enum) {
                $prefix = $namespace !== '_root' ? $namespace : '';
                $ts .= $this->generateEnumCode($enum, $prefix);
            }
        }

        return $ts;
    }

    protected function generateEnumCode(array $enum, string $prefix): string
    {
        $ts = '';
        
        // Use prefix for namespaced enums (e.g., Sample_Color instead of namespace)
        $enumName = $prefix ? "{$prefix}_{$enum['name']}" : $enum['name'];
        $optionsName = "{$enumName}Options";
        $helperName = "{$enumName}Helper";
        
        // Generate TypeScript enum
        $ts .= "// {$enum['fullName']}\n";
        $ts .= "export enum {$enumName} {\n";
        foreach ($enum['cases'] as $caseName => $value) {
            $ts .= "  {$caseName} = '{$value}',\n";
        }
        $ts .= "}\n\n";

        // Generate select options constant
        $ts .= "export const {$optionsName}: SelectOption[] = [\n";
        foreach ($enum['options'] as $option) {
            $ts .= "  { value: '{$option['value']}', label: '{$option['label']}' },\n";
        }
        $ts .= "];\n\n";

        // Generate helper object
        $ts .= "export const {$helperName} = {\n";
        $ts .= "  getLabel: (value: string): string => {\n";
        $ts .= "    const option = {$optionsName}.find(o => o.value === value);\n";
        $ts .= "    return option?.label ?? value;\n";
        $ts .= "  },\n";
        $ts .= "  getOptions: (): SelectOption[] => {$optionsName},\n";
        $ts .= "  values: Object.values({$enumName}),\n";
        $ts .= "};\n\n";

        return $ts;
    }
}
