var extractedFirmwareDirs = Directory.GetDirectories(tempExtractPath);

foreach (var dir in extractedFirmwareDirs)
{
    // Validate firmware structure, parse metadata, etc.
    LoadFirmware(dir);
}
