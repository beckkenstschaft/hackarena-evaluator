# Generate matched certificate and key from PFX
$tp = 'A78768BEE3692FBCF981D12F96CB9EF46AFA6EFE'
$pfxPath = 'D:\Evaluation_Scanner\scanner\backend\certificates\server.pfx'
$pfxPassword = 'changeit'

# Load PFX
$pfx = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2($pfxPath, $pfxPassword, [System.Security.Cryptography.X509Certificates.X509KeyStorageFlags]::Exportable)

# Export private key
$rsaKey = [System.Security.Cryptography.X509Certificates.RSACertificateExtensions]::GetRSAPrivateKey($pfx)
$privateKeyPem = $rsaKey.ExportRSAPrivateKeyPem()
[System.IO.File]::WriteAllText('D:\Evaluation_Scanner\scanner\backend\certificates\server.key', $privateKeyPem)

# Export certificate in PEM format
$certPem = "-----BEGIN CERTIFICATE-----`n"
$base64 = [Convert]::ToBase64String($pfx.RawData, [Base64FormattingOptions]::InsertLineBreaks)
$certPem += $base64
$certPem += "`n-----END CERTIFICATE-----"
[System.IO.File]::WriteAllText('D:\Evaluation_Scanner\scanner\backend\certificates\server.crt', $certPem)

Write-Host 'Matched certificate and key exported successfully!'
