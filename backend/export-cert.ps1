$tp = 'A78768BEE3692FBCF981D12F96CB9EF46AFA6EFE'
$cert = Get-ChildItem "Cert:\CurrentUser\My\$tp"
$pfx = 'D:\Evaluation_Scanner\scanner\backend\certificates\server.pfx'
$pw = ConvertTo-SecureString -String 'changeit' -Force -AsPlainText
Export-PfxCertificate -Cert $cert -FilePath $pfx -Password $pw
[System.IO.File]::WriteAllBytes('D:\Evaluation_Scanner\scanner\backend\certificates\server.crt', $cert.Export([System.Security.Cryptography.X509Certificates.X509ContentType]::Cert))
Write-Host 'Certificates exported successfully to D:\Evaluation_Scanner\scanner\backend\certificates'
