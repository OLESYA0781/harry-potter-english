#!/usr/bin/env python3
"""Read-only public network diagnostics. Never sends keys, cookies or student data.
Run on the affected device/network; --label is a user label, not geolocation proof.
Uses the system proxy and TLS trust configuration without bypasses.
"""
import argparse
import datetime
import hashlib
import http.client
import json
import socket
import ssl
import time
import urllib.error
import urllib.parse
import urllib.request
from html.parser import HTMLParser

LIMIT = 16 * 1024 * 1024


def public_url(value):
    url = urllib.parse.urlsplit(value)
    if url.scheme not in ('https', 'http') or not url.hostname or url.username or url.password or url.query or url.fragment:
        raise argparse.ArgumentTypeError('Use a public http(s) URL without credentials, query or fragment.')
    return value.rstrip('/')


def safe_url(value):
    return urllib.parse.urlunsplit(urllib.parse.urlsplit(value)._replace(query='', fragment=''))


class Entries(HTMLParser):
    def __init__(self):
        super().__init__()
        self.urls = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'script' and attrs.get('src'):
            self.urls.append(attrs['src'])
        if tag == 'link' and 'stylesheet' in attrs.get('rel', '').split() and attrs.get('href'):
            self.urls.append(attrs['href'])


class Redirects(urllib.request.HTTPRedirectHandler):
    def __init__(self):
        self.chain = []

    def redirect_request(self, request, fp, code, message, headers, newurl):
        self.chain.append({'status': code, 'from': safe_url(request.full_url), 'to': safe_url(newurl)})
        return super().redirect_request(request, fp, code, message, headers, newurl)


def get(url, timeout):
    redirects = Redirects()
    opener = urllib.request.build_opener(redirects)
    result = {'url': safe_url(url), 'method': 'GET'}
    start = time.monotonic()
    body = b''
    try:
        request = urllib.request.Request(url, headers={'User-Agent': 'Vika-English-Availability/1.0', 'Accept-Encoding': 'identity'})
        try:
            response = opener.open(request, timeout=timeout)
        except urllib.error.HTTPError as error:
            response = error
        with response:
            result.update(status=response.status, final_url=safe_url(response.geturl()),
                          headers={key: response.headers[key] for key in ('Content-Type', 'Content-Length', 'Server', 'CF-Ray') if key in response.headers})
            body = response.read(LIMIT + 1)
            result['bytes'] = len(body)
            result['read_capped'] = len(body) > LIMIT
            result['sha256'] = hashlib.sha256(body).hexdigest()
            declared = response.headers.get('Content-Length')
            result['complete_body'] = not result['read_capped'] and (not declared or not declared.isdecimal() or int(declared) == len(body))
            result['https_transport_succeeded'] = response.geturl().startswith('https://')
    except http.client.IncompleteRead as error:
        result.update(error='IncompleteRead', bytes=len(error.partial), complete_body=False)
    except Exception as error:
        # No request headers or response bodies are logged.
        result.update(error=f'{type(error).__name__}: {error}', complete_body=False)
    result['redirects'] = redirects.chain
    result['seconds'] = round(time.monotonic() - start, 3)
    return result, body


def dns(host):
    try:
        addresses = socket.getaddrinfo(host, 443, type=socket.SOCK_STREAM)
        return {'A': sorted({item[4][0] for item in addresses if item[0] == socket.AF_INET}),
                'AAAA': sorted({item[4][0] for item in addresses if item[0] == socket.AF_INET6}),
                'note': 'OS resolver results from this machine; not an authoritative DNS-zone inspection.'}
    except Exception as error:
        return {'error': f'{type(error).__name__}: {error}'}


def tls(host, port, timeout, proxied):
    if proxied:
        return {'inspected': False, 'reason': 'An environment proxy is configured. Direct TLS probing is skipped; HTTPS GET uses the configured proxy and TLS trust.'}
    try:
        with socket.create_connection((host, port or 443), timeout=timeout) as connection:
            with ssl.create_default_context().wrap_socket(connection, server_hostname=host) as secure:
                cert = secure.getpeercert()
                return {'inspected': True, 'verified': True, 'protocol': secure.version(), 'not_after': cert.get('notAfter')}
    except Exception as error:
        return {'inspected': True, 'verified': False, 'error': f'{type(error).__name__}: {error}'}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--url', type=public_url, default='https://vika-english.pages.dev')
    parser.add_argument('--supabase-url', type=public_url, help='Public project URL only; never supply an API key.')
    parser.add_argument('--label', default='unspecified network')
    parser.add_argument('--timeout', type=int, default=15)
    parser.add_argument('--output', help='Optional JSON report file.')
    args = parser.parse_args()
    if not 1 <= args.timeout <= 30:
        parser.error('--timeout must be between 1 and 30 seconds')
    proxies = urllib.request.getproxies()
    site = urllib.parse.urlsplit(args.url)
    proxied = bool(proxies.get(site.scheme)) and not urllib.request.proxy_bypass(site.hostname)
    report = {'utc': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'network_label': args.label,
              'location_verified': False, 'proxy_in_use': proxied,
              'scope': 'Public DNS/HTTPS/static bytes only. No login, student data or synchronization writes.',
              'dns': dns(site.hostname), 'tls': tls(site.hostname, site.port, args.timeout, proxied) if site.scheme == 'https' else {'inspected': False, 'reason': 'The requested origin uses HTTP.'}}
    home, body = get(args.url + '/', args.timeout)
    report['home'] = home
    report['assets'] = []
    report['external_entry_assets'] = []
    if home.get('status') == 200 and home.get('complete_body'):
        entries = Entries()
        entries.feed(body.decode('utf-8', errors='replace'))
        base = home.get('final_url', args.url)
        report['entry_asset_count'] = len(entries.urls)
        for entry in dict.fromkeys(entries.urls):
            url = urllib.parse.urljoin(base, entry)
            if urllib.parse.urlsplit(url).netloc != urllib.parse.urlsplit(base).netloc:
                report['external_entry_assets'].append(safe_url(url))
                continue
            result, _ = get(url, args.timeout)
            report['assets'].append(result)
        # A large real illustration is important: a tiny HTML response can pass a ~16 KB cap.
        result, _ = get(urllib.parse.urljoin(base, '/art/common-room.webp'), args.timeout)
        report['assets'].append(result)
    if args.supabase_url:
        endpoint = urllib.parse.urlsplit(args.supabase_url)
        report['supabase_dns'] = dns(endpoint.hostname)
        report['supabase_health'], _ = get(args.supabase_url + '/auth/v1/health', args.timeout)
        report['supabase_note'] = 'HTTP response/health only. A 401/403 is not a successful login or proof of working synchronization.'
    report['static_download_check_passed'] = (home.get('status') == 200 and home.get('complete_body') is True and
        report.get('entry_asset_count', 0) > 0 and not report['external_entry_assets'] and
        all(asset.get('status') == 200 and asset.get('complete_body') is True for asset in report['assets']))
    report['warning'] = 'A passing byte-download check does not prove Russian access, browser execution or authenticated cross-device synchronization.'
    output = json.dumps(report, ensure_ascii=False, indent=2)
    if args.output:
        with open(args.output, 'w', encoding='utf-8') as file:
            file.write(output + '\n')
    print(output)
    return 0 if report['static_download_check_passed'] else 1


if __name__ == '__main__':
    raise SystemExit(main())
