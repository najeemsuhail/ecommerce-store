$files = Get-ChildItem -Path "src" -Include "*.tsx" -Recurse
$replacements = @{
    'text-blue-600' = 'text-primary'
    'text-blue-700' = 'text-primary-hover'
    'hover:text-blue-600' = 'hover:text-primary'
    'hover:text-blue-700' = 'hover:text-primary-hover'
    'bg-blue-600' = 'bg-primary'
    'hover:bg-blue-700' = 'hover:bg-primary-hover'
    'bg-blue-100' = 'bg-primary/20'
    'hover:bg-blue-100' = 'hover:bg-primary/20'
    'focus:ring-blue-500' = 'focus:ring-primary'
    'border-blue-600' = 'border-primary'
    'border-blue-500' = 'border-primary'
    'bg-red-500' = 'bg-danger'
    'text-red-500' = 'text-danger'
    'text-red-600' = 'text-danger'
    'text-gray-700' = 'text-text-light'
    'text-gray-900' = 'text-text-dark'
    'text-gray-600' = 'text-text-light'
    'text-gray-500' = 'text-text-lighter'
    'text-gray-400' = 'text-text-lighter'
    'text-gray-800' = 'text-text-dark'
    'bg-gray-50' = 'bg-bg-gray'
    'bg-gray-100' = 'bg-bg-gray'
    'bg-gray-200' = 'bg-bg-gray'
    'hover:bg-gray-100' = 'hover:bg-bg-gray'
    'border-gray-100' = 'border-border-color'
    'border-gray-300' = 'border-border-color'
    'border-gray-200' = 'border-border-color'
}

foreach ($file in $files) {
    Write-Host "Processing $($file.Name)..."
    $content = Get-Content $file.FullName -Raw
    
    foreach ($old in $replacements.Keys) {
        $new = $replacements[$old]
        $content = $content -replace [regex]::Escape($old), $new
    }
    
    Set-Content $file.FullName $content
}

Write-Host "Done! All color replacements completed."
