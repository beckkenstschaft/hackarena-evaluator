# Run this PowerShell script as Administrator to generate self-signed SSL certificates

$certPath = "D:\Evaluation_Scanner\scanner\backend\certificates"
if (!(Test-Path $certPath)) {
    New-Item -ItemType Directory -Path $certPath -Force | Out-Null
}

$cert = New-SelfSignedCertificate -DnsName "localhost" -CertStoreLocation "Cert:\CurrentUser\My" -NotAfter (Get-Date).AddYears(1)

Write-Host "Certificate created with thumbprint: $($cert.Thumbprint)"

$pw = ConvertTo-SecureString -String "changeit" -Force -AsPlainText
Export-PfxCertificate -Cert "Cert:\CurrentUser\My\$($cert.Thumbprint)" -FilePath "$certPath\server.pfx" -Password $pw | Out-Null

$pwd = $pw
$tp = $cert.Thumbprint
$certFile = "$certPath\server.crt"
$keyFile = "$certPath\server.key"

# Export the certificate
$der = Get-ChildItem "Cert:\CurrentUser\My\$tp"
[System.IO.File]::WriteAllBytes($certFile, $der.Export([System.Security.Cryptography.X509Certificates.X509ContentType]::Cert))

# For the key, we'll create a placeholder - in production use proper tools
$keyContent = @"
-----BEGIN RSA PRIVATE KEY-----
PLACEHOLDER - Key exported separately
-----END RSA PRIVATE KEY-----
"@

# Export to PKCS12
$pfxBytes = [System.IO.File]::ReadAllBytes("$certPath\server.pfx")
[System.IO.File]::WriteAllBytes("$certPath\server.p12", $pfxBytes)

Write-Host ""
Write-Host "Certificates generated at: $certPath"
Write-Host "Files created:"
Write-Host "  - server.crt (certificate)"
Write-Host "  - server.pfx (PFX bundle for some servers)"
Write-Host "  - server.p12 (PKCS12 format)"
Write-Host ""
Write-Host "IMPORTANT: The private key is bundled in the .pfx/.p12 files."
Write-Host "For Apache/Nginx, export the private key separately."
