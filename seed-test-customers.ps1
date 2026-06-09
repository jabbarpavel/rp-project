Add-Type -AssemblyName System.Net.Http -ErrorAction SilentlyContinue

$handler = New-Object System.Net.Http.HttpClientHandler
$client = New-Object System.Net.Http.HttpClient($handler)

function Post-Json($url, $body, $token) {
    $req = New-Object System.Net.Http.HttpRequestMessage([System.Net.Http.HttpMethod]::Post, $url)
    $req.Headers.Host = 'finaro.localhost'
    if ($token) {
        $req.Headers.Authorization = New-Object System.Net.Http.Headers.AuthenticationHeaderValue('Bearer', $token)
    }
    $json = $body | ConvertTo-Json -Depth 5
    $req.Content = New-Object System.Net.Http.StringContent($json, [System.Text.Encoding]::UTF8, 'application/json')
    $resp = $client.SendAsync($req).Result
    $text = $resp.Content.ReadAsStringAsync().Result
    if (-not $resp.IsSuccessStatusCode) {
        throw ("HTTP {0}: {1}" -f [int]$resp.StatusCode, $text)
    }
    return ($text | ConvertFrom-Json)
}

$base = 'http://127.0.0.1:5016'

$login = Post-Json "$base/api/user/login" @{ email = 'raco@test.ch'; password = '123456' } $null
$token = $login.token
Write-Host "Login OK (tenantId=$($login.tenantId), role=$($login.role))" -ForegroundColor Cyan

$customers = @(
    @{
        CustomerType = 0; FirstName = 'Test-Anna'; Name = 'Muster'
        Email = 'test.anna.muster@example.test'
        Salutation = 'Frau'; Gender = 'female'; Language = 'de'; CivilStatus = 'ledig'
        Street = 'Teststrasse 1'; PostalCode = '8001'; Locality = 'Zuerich'; Canton = 'ZH'
        BirthDate = '1990-04-12'; Profession = 'Testerin'
    },
    @{
        CustomerType = 0; FirstName = 'Test-Bruno'; Name = 'Beispiel'
        Email = 'test.bruno.beispiel@example.test'
        Salutation = 'Herr'; Gender = 'male'; Language = 'de'; CivilStatus = 'verheiratet'
        Street = 'Probeweg 12'; PostalCode = '3011'; Locality = 'Bern'; Canton = 'BE'
        BirthDate = '1985-09-30'; Profession = 'Demo-Berater'
    },
    @{
        CustomerType = 0; FirstName = 'Test-Clara'; Name = 'Demo'
        Email = 'test.clara.demo@example.test'
        Salutation = 'Frau'; Gender = 'female'; Language = 'fr'; CivilStatus = 'ledig'
        Street = 'Rue du Test 7'; PostalCode = '1003'; Locality = 'Lausanne'; Canton = 'VD'
        BirthDate = '1992-01-22'; Profession = 'QA Engineer'
    },
    @{
        CustomerType = 1; Name = 'Test AG Muster'; CompanyName = 'Test AG Muster'
        Email = 'kontakt@test-ag-muster.example.test'
        LegalForm = 'AG'; Industry = 'IT'; UidNumber = 'CHE-100.000.001'
        Homepage = 'https://test-ag.example'; FoundingDate = '2015-06-01'
        Street = 'Testallee 99'; PostalCode = '8400'; Locality = 'Winterthur'; Canton = 'ZH'
        ContactSalutation = 'Herr'; ContactFirstName = 'Test-David'; ContactName = 'Probst'
        ContactEmail = 'david.probst@test-ag-muster.example.test'
    },
    @{
        CustomerType = 1; Name = 'Test GmbH Demo'; CompanyName = 'Test GmbH Demo'
        Email = 'hello@test-gmbh-demo.example.test'
        LegalForm = 'GmbH'; Industry = 'Beratung'; UidNumber = 'CHE-100.000.002'
        Homepage = 'https://test-gmbh.example'; FoundingDate = '2018-03-15'
        Street = 'Demoplatz 4'; PostalCode = '6003'; Locality = 'Luzern'; Canton = 'LU'
        ContactSalutation = 'Frau'; ContactFirstName = 'Test-Eva'; ContactName = 'Probe'
        ContactEmail = 'eva.probe@test-gmbh-demo.example.test'
    }
)

foreach ($c in $customers) {
    try {
        $r = Post-Json "$base/api/customer" $c $token
        Write-Host ("OK   id={0,3}  {1} {2}" -f $r.id, $r.firstName, $r.name) -ForegroundColor Green
    }
    catch {
        Write-Host ("FAIL {0} -> {1}" -f $c.Name, $_.Exception.Message) -ForegroundColor Red
    }
}
