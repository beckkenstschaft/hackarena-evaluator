$tp = 'A78768BEE3692FBCF981D12F96CB9EF46AFA6EFE'
$cert = Get-ChildItem "Cert:\CurrentUser\My\$tp"

# Export as PEM format
$certBytes = $cert.Export([System.Security.Cryptography.X509Certificates.X509ContentType]::Pfx, 'changeit')
$pfx = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2($certBytes, 'changeit')

# Write certificate in PEM format
$pemContent = "-----BEGIN CERTIFICATE-----`n"
$base64 = [Convert]::ToBase64String($cert.RawData, [Base64FormattingOptions]::InsertLineBreaks)
$pemContent += $base64
$pemContent += "`n-----END CERTIFICATE-----"
[System.IO.File]::WriteAllText('D:\Evaluation_Scanner\scanner\backend\certificates\server.crt', $pemContent)

Write-Host 'Certificate exported as PEM format successfully!'
