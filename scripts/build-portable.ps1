$ErrorActionPreference = "Stop"
Set-Location (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location ..

Write-Host "1. Building Vite production bundle..."
npm run build

$distDir = Join-Path (Get-Location) "dist"
$portableDir = Join-Path (Get-Location) "portable"
New-Item -ItemType Directory -Force -Path $portableDir | Out-Null

# Pack dist/ files into a compact JSON map { "/index.html": { "mime": "...", "b64": "..." }, ... }
$assets = @{}
Get-ChildItem -Path $distDir -Recurse -File | ForEach-Object {
    $rel = $_.FullName.Substring($distDir.Length).Replace('\', '/')
    if (-not $rel.StartsWith('/')) { $rel = '/' + $rel }
    $ext = $_.Extension.ToLowerInvariant()
    $mime = switch ($ext) {
        ".html" { "text/html; charset=utf-8" }
        ".js"   { "application/javascript; charset=utf-8" }
        ".css"  { "text/css; charset=utf-8" }
        ".svg"  { "image/svg+xml" }
        ".png"  { "image/png" }
        ".jpg"  { "image/jpeg" }
        ".json" { "application/json" }
        default { "application/octet-stream" }
    }
    $bytes = [System.IO.File]::ReadAllBytes($_.FullName)
    $assets[$rel] = @{
        mime = $mime
        b64  = [Convert]::ToBase64String($bytes)
    }
}

# Compress the asset table with GZip so the single-file EXE stays ~200 KB
$jsonBytes = [System.Text.Encoding]::UTF8.GetBytes(($assets | ConvertTo-Json -Compress -Depth 5))
$ms = New-Object System.IO.MemoryStream
$gz = New-Object System.IO.Compression.GZipStream($ms, [System.IO.Compression.CompressionLevel]::Optimal)
$gz.Write($jsonBytes, 0, $jsonBytes.Length)
$gz.Close()
$payloadB64 = [Convert]::ToBase64String($ms.ToArray())

$csSource = @"
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.IO.Compression;
using System.Net;
using System.Net.Sockets;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
using System.Web.Script.Serialization;

namespace StoryForgePortable
{
    class Program
    {
        static Dictionary<string, Dictionary<string, object>> Assets;
        static int Port = 3001;

        static void Main(string[] args)
        {
            Console.Title = "StoryForge — Iterative Animation & Storytelling Studio (Portable)";
            ServicePointManager.SecurityProtocol = SecurityProtocolType.Tls12;
            LoadEmbeddedAssets();

            TcpListener listener = null;
            for (int p = 3001; p <= 3020; p++)
            {
                try
                {
                    listener = new TcpListener(IPAddress.Loopback, p);
                    listener.Start();
                    Port = p;
                    break;
                }
                catch { }
            }

            string url = "http://127.0.0.1:" + Port + "/";
            Console.ForegroundColor = ConsoleColor.Cyan;
            Console.WriteLine("==================================================================");
            Console.WriteLine("  StoryForge — Iterative Animation & Storytelling Studio");
            Console.WriteLine("  Portable Standalone Edition (Zero Dependencies)");
            Console.WriteLine("==================================================================");
            Console.ResetColor();
            Console.WriteLine("  Local Studio URL : " + url);
            Console.WriteLine("  Blender Bridge   : localhost:9876 (Live MCP socket + CLI Launch)");
            Console.WriteLine("  Press Ctrl+C or close this window to stop the studio.");
            Console.WriteLine();

            if (Array.IndexOf(args, "--no-browser") < 0)
            {
                try { Process.Start(new ProcessStartInfo(url) { UseShellExecute = true }); } catch { }
            }

            while (true)
            {
                try
                {
                    var client = listener.AcceptTcpClient();
                    ThreadPool.QueueUserWorkItem(HandleClient, client);
                }
                catch { break; }
            }
        }

        static void LoadEmbeddedAssets()
        {
            string b64 = "$payloadB64";
            byte[] compressed = Convert.FromBase64String(b64);
            using (var ms = new MemoryStream(compressed))
            using (var gz = new GZipStream(ms, CompressionMode.Decompress))
            using (var sr = new StreamReader(gz, Encoding.UTF8))
            {
                string json = sr.ReadToEnd();
                var ser = new JavaScriptSerializer { MaxJsonLength = int.MaxValue };
                Assets = ser.Deserialize<Dictionary<string, Dictionary<string, object>>>(json);
            }
        }

        static void HandleClient(object obj)
        {
            using (var client = (TcpClient)obj)
            using (var stream = client.GetStream())
            {
                client.ReceiveTimeout = 10000;
                client.SendTimeout = 10000;
                try
                {
                    var req = ReadHttpRequest(stream);
                    if (req == null) return;
                    RouteRequest(stream, req.Item1, req.Item2, req.Item3);
                }
                catch { }
            }
        }

        static Tuple<string, string, string> ReadHttpRequest(NetworkStream stream)
        {
            var headerBytes = new List<byte>();
            int b;
            while ((b = stream.ReadByte()) != -1)
            {
                headerBytes.Add((byte)b);
                int n = headerBytes.Count;
                if (n >= 4 && headerBytes[n - 4] == 13 && headerBytes[n - 3] == 10 && headerBytes[n - 2] == 13 && headerBytes[n - 1] == 10)
                    break;
            }
            if (headerBytes.Count == 0) return null;
            string headerText = Encoding.ASCII.GetString(headerBytes.ToArray());
            string[] lines = headerText.Split(new[] { "\r\n" }, StringSplitOptions.None);
            string[] first = lines[0].Split(' ');
            if (first.Length < 2) return null;
            string method = first[0];
            string fullPath = first[1];

            int contentLength = 0;
            foreach (var line in lines)
            {
                if (line.StartsWith("Content-Length:", StringComparison.OrdinalIgnoreCase))
                    int.TryParse(line.Substring(15).Trim(), out contentLength);
            }

            string body = "";
            if (contentLength > 0)
            {
                byte[] buf = new byte[contentLength];
                int read = 0;
                while (read < contentLength)
                {
                    int r = stream.Read(buf, read, contentLength - read);
                    if (r <= 0) break;
                    read += r;
                }
                body = Encoding.UTF8.GetString(buf, 0, read);
            }
            return Tuple.Create(method, fullPath, body);
        }

        static string FindBlenderExe()
        {
            string baseDir = @"C:\Program Files\Blender Foundation";
            if (!Directory.Exists(baseDir)) return null;
            var dirs = Directory.GetDirectories(baseDir, "Blender*");
            Array.Sort(dirs);
            Array.Reverse(dirs);
            foreach (var d in dirs)
            {
                string exe = Path.Combine(d, "blender.exe");
                if (File.Exists(exe)) return exe;
            }
            return null;
        }

        static string TalkToBlenderSocket(string payloadJson, int port, int timeoutMs)
        {
            using (var tcp = new TcpClient())
            {
                var ar = tcp.BeginConnect("127.0.0.1", port, null, null);
                if (!ar.AsyncWaitHandle.WaitOne(timeoutMs))
                    throw new Exception("Timed out connecting to Blender on port " + port);
                tcp.EndConnect(ar);
                var s = tcp.GetStream();
                s.ReadTimeout = timeoutMs;
                byte[] outBytes = Encoding.UTF8.GetBytes(payloadJson);
                s.Write(outBytes, 0, outBytes.Length);
                byte[] inBuf = new byte[65536];
                int r = s.Read(inBuf, 0, inBuf.Length);
                return r > 0 ? Encoding.UTF8.GetString(inBuf, 0, r) : "{}";
            }
        }

        static void RouteRequest(NetworkStream stream, string method, string fullPath, string body)
        {
            var ser = new JavaScriptSerializer { MaxJsonLength = int.MaxValue };
            string pathOnly = fullPath.Split('?')[0];

            if (pathOnly == "/api/blender/status")
            {
                string exe = FindBlenderExe();
                try
                {
                    TalkToBlenderSocket("{\"type\":\"get_scene_info\",\"params\":{}}", 9876, 1800);
                    WriteJson(stream, 200, ser.Serialize(new { connected = true, port = 9876, blenderExe = exe, message = "Connected to live Blender session on localhost:9876" }));
                }
                catch
                {
                    WriteJson(stream, 200, ser.Serialize(new { connected = false, port = 9876, blenderExe = exe, message = "Blender MCP socket not listening on localhost:9876. Use Launch Blender or Download .py." }));
                }
                return;
            }

            if (pathOnly == "/api/blender/push" && method == "POST")
            {
                var payload = ser.Deserialize<Dictionary<string, object>>(body);
                string code = payload.ContainsKey("code") ? Convert.ToString(payload["code"]) : "";
                int port = payload.ContainsKey("port") ? Convert.ToInt32(payload["port"]) : 9876;
                try
                {
                    string cmd = ser.Serialize(new { type = "execute_code", @params = new { code = code } });
                    TalkToBlenderSocket(cmd, port, 8000);
                    WriteJson(stream, 200, ser.Serialize(new { ok = true, message = "Previz pushed directly to open Blender scene!" }));
                }
                catch (Exception ex)
                {
                    string outPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "storyforge_previz.py");
                    File.WriteAllText(outPath, code, Encoding.UTF8);
                    WriteJson(stream, 200, ser.Serialize(new { ok = false, savedScriptPath = outPath, message = "Saved script to " + outPath + " (" + ex.Message + ")" }));
                }
                return;
            }

            if (pathOnly == "/api/blender/launch" && method == "POST")
            {
                var payload = ser.Deserialize<Dictionary<string, object>>(body);
                string code = payload.ContainsKey("code") ? Convert.ToString(payload["code"]) : "";
                string outPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "storyforge_previz.py");
                File.WriteAllText(outPath, code, Encoding.UTF8);
                string exe = FindBlenderExe();
                if (exe == null)
                {
                    WriteJson(stream, 200, ser.Serialize(new { ok = false, savedScriptPath = outPath, message = "Saved script to " + outPath + ". Open Blender and run it from Scripting." }));
                    return;
                }
                Process.Start(new ProcessStartInfo(exe, "--python \"" + outPath + "\"") { UseShellExecute = false });
                WriteJson(stream, 200, ser.Serialize(new { ok = true, savedScriptPath = outPath, message = "Launched Blender with StoryForge Previz scene!" }));
                return;
            }

            if (pathOnly == "/api/ref/resolve")
            {
                string q = fullPath.Contains("?") ? fullPath.Substring(fullPath.IndexOf('?') + 1) : "";
                string targetUrl = "";
                foreach (var part in q.Split('&'))
                {
                    if (part.StartsWith("url=")) targetUrl = Uri.UnescapeDataString(part.Substring(4));
                }
                try
                {
                    var req = (HttpWebRequest)WebRequest.Create(targetUrl);
                    req.UserAgent = "Mozilla/5.0 StoryForgePortable/2.0";
                    using (var resp = (HttpWebResponse)req.GetResponse())
                    using (var rs = resp.GetResponseStream())
                    using (var ms = new MemoryStream())
                    {
                        rs.CopyTo(ms);
                        string ct = (resp.ContentType ?? "").Split(';')[0].Trim();
                        if (ct.StartsWith("image/"))
                        {
                            string dUrl = "data:" + ct + ";base64," + Convert.ToBase64String(ms.ToArray());
                            WriteJson(stream, 200, ser.Serialize(new { ok = true, kind = "image", title = Path.GetFileName(new Uri(targetUrl).LocalPath), dataUrl = dUrl, sourceUrl = targetUrl }));
                            return;
                        }
                    }
                    WriteJson(stream, 200, ser.Serialize(new { ok = true, kind = "link", title = new Uri(targetUrl).Host, sourceUrl = targetUrl }));
                }
                catch (Exception ex)
                {
                    WriteJson(stream, 200, ser.Serialize(new { ok = false, error = ex.Message }));
                }
                return;
            }

            // Serve embedded dist/ assets
            if (pathOnly == "/" || !Assets.ContainsKey(pathOnly)) pathOnly = "/index.html";
            var asset = Assets[pathOnly];
            string mime = Convert.ToString(asset["mime"]);
            byte[] data = Convert.FromBase64String(Convert.ToString(asset["b64"]));
            WriteResponse(stream, "200 OK", mime, data);
        }

        static void WriteJson(NetworkStream stream, int code, string json)
        {
            WriteResponse(stream, code == 200 ? "200 OK" : "400 Bad Request", "application/json; charset=utf-8", Encoding.UTF8.GetBytes(json));
        }

        static void WriteResponse(NetworkStream stream, string status, string contentType, byte[] body)
        {
            string hdr = "HTTP/1.1 " + status + "\r\nContent-Type: " + contentType + "\r\nContent-Length: " + body.Length + "\r\nAccess-Control-Allow-Origin: *\r\nConnection: close\r\n\r\n";
            byte[] hBytes = Encoding.ASCII.GetBytes(hdr);
            stream.Write(hBytes, 0, hBytes.Length);
            stream.Write(body, 0, body.Length);
        }
    }
}
"@

$outExe = Join-Path $portableDir "StoryForge-Portable.exe"
$csc = "C:\Windows\Microsoft.NET\Framework64\v4.0.30319\csc.exe"
$tempCs = Join-Path $portableDir "StoryForgePortable.cs"
Set-Content -Path $tempCs -Value $csSource -Encoding UTF8

Write-Host "2. Compiling standalone single-file portable executable..."
& $csc /nologo /target:exe /optimize+ /out:$outExe /reference:System.Web.Extensions.dll /reference:System.IO.Compression.dll $tempCs
Remove-Item $tempCs -Force

$exeInfo = Get-Item $outExe
Write-Host ("Built Portable EXE: {0} ({1:N1} KB)" -f $exeInfo.FullName, ($exeInfo.Length / 1KB))
