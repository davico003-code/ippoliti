#!/usr/bin/env bash
# Chequeo de salud de indexación (SEO + GEO) contra producción.
# Sale con código 1 si algún chequeo falla. Si REPORT_FILE está definido,
# escribe ahí un resumen en markdown (lo usa el workflow para abrir el issue).
set -uo pipefail

BASE="${BASE_URL:-https://siinmobiliaria.com}"
WWW="${WWW_URL:-https://www.siinmobiliaria.com}"
MIN_SITEMAP_URLS="${MIN_SITEMAP_URLS:-400}"
TTFB_WARN_SECONDS="${TTFB_WARN_SECONDS:-3}"
UA="SI-indexacion-check/1.0 (+https://github.com/davico003-code/ippoliti)"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

RESULTS=()
FAILS=0

ok()   { RESULTS+=("✓ $1"); echo "✓ $1"; }
fail() { RESULTS+=("✗ $1"); echo "✗ $1" >&2; FAILS=$((FAILS + 1)); }
note() { RESULTS+=("• $1"); echo "• $1"; }

# fetch URL OUTFILE → imprime "CODE TTFB". Reintenta una vez ante fallo de red.
fetch() {
  local url="$1" out="$2" res
  for _ in 1 2; do
    res="$(curl -sS -A "$UA" --max-time 30 -o "$out" -w '%{http_code} %{time_starttransfer}' "$url" 2>/dev/null)" && [[ "${res%% *}" != "000" ]] && { echo "$res"; return 0; }
    sleep 2
  done
  echo "000 0"
}

code_of() { fetch "$1" "${2:-/dev/null}" | cut -d' ' -f1; }

# 1. HOME
res="$(fetch "$BASE/" "$TMP/home.html")"
code="${res%% *}"; ttfb="${res##* }"
if [[ "$code" == "200" ]]; then
  ok "HOME: 200 (TTFB ${ttfb}s)"
  if awk -v t="$ttfb" -v w="$TTFB_WARN_SECONDS" 'BEGIN{exit !(t > w)}'; then
    note "TTFB del home ${ttfb}s supera ${TTFB_WARN_SECONDS}s (no es fallo, pero mirarlo)"
  fi
else
  fail "HOME: esperaba 200, recibí $code — el sitio no responde o está caído"
fi

# 2. WWW → apex
for _ in 1 2; do
  res="$(curl -sS -A "$UA" --max-time 30 -o /dev/null -D "$TMP/www.h" -w '%{http_code}' "$WWW/" 2>/dev/null || true)"
  [[ "$res" != "000" ]] && break
  sleep 2
done
loc="$(tr -d '\r' < "$TMP/www.h" 2>/dev/null | awk 'tolower($1)=="location:"{print $2}' | head -1)"
if [[ ("$res" == "308" || "$res" == "301") && "$loc" == "$BASE/"* ]]; then
  ok "WWW: $res → $loc"
else
  fail "WWW: esperaba 301/308 hacia $BASE/, recibí $res (Location: ${loc:-sin header}) — www y apex compiten en el índice"
fi

# 3. ROBOTS
code="$(code_of "$BASE/robots.txt" "$TMP/robots.txt")"
if [[ "$code" != "200" ]]; then
  fail "ROBOTS: esperaba 200, recibí $code"
else
  tr -d '\r' < "$TMP/robots.txt" > "$TMP/robots.clean"
  robots_ok=1
  grep -qx "Sitemap: $BASE/sitemap.xml" "$TMP/robots.clean" || { fail "ROBOTS: falta la línea 'Sitemap: $BASE/sitemap.xml'"; robots_ok=0; }
  grep -qx 'Disallow: /api/' "$TMP/robots.clean" || { fail "ROBOTS: falta 'Disallow: /api/'"; robots_ok=0; }
  if grep -qx 'Disallow: /' "$TMP/robots.clean"; then
    fail "ROBOTS: CRÍTICO — hay una línea 'Disallow: /' que bloquea TODO el sitio a los buscadores"; robots_ok=0
  fi
  for bot in GPTBot ClaudeBot PerplexityBot Google-Extended; do
    if ! awk -v bot="$(tr '[:upper:]' '[:lower:]' <<< "$bot")" '
      tolower($0) ~ "^user-agent: *" bot "$" { inblock=1; next }
      tolower($0) ~ /^user-agent:/ { inblock=0 }
      inblock && $0 ~ /^Allow: \/$/ { found=1 }
      END { exit found ? 0 : 1 }' "$TMP/robots.clean"; then
      fail "ROBOTS: el bot de IA $bot no tiene su bloque con 'Allow: /' (base del posicionamiento GEO)"; robots_ok=0
    fi
  done
  [[ $robots_ok -eq 1 ]] && ok "ROBOTS: 200, sitemap declarado, /api/ bloqueado, sin 'Disallow: /', bots de IA con Allow"
fi

# 4. SITEMAP
code="$(code_of "$BASE/sitemap.xml" "$TMP/sitemap.xml")"
LOCS="$TMP/locs.txt"; : > "$LOCS"
if [[ "$code" != "200" ]]; then
  fail "SITEMAP: esperaba 200, recibí $code"
else
  grep -oE '<loc>[^<]+</loc>' "$TMP/sitemap.xml" | sed -E 's#</?loc>##g; s#&amp;#\&#g' > "$LOCS"
  count="$(wc -l < "$LOCS" | tr -d ' ')"
  if (( count < MIN_SITEMAP_URLS )); then
    fail "SITEMAP: solo $count URLs (mínimo $MIN_SITEMAP_URLS) — probablemente el feed de propiedades falló en silencio y se publicó sin las fichas"
  else
    ok "SITEMAP: 200 con $count URLs"
  fi
  for frag in /propiedades/ /blog/ /emprendimientos /barrios-privados; do
    grep -q "$BASE$frag" "$LOCS" || fail "SITEMAP: no hay ninguna URL con '$frag'"
  done
fi

# 5. MUESTRA DE URLS
sample=()
mapfile -t -O "${#sample[@]}" sample < <(grep "$BASE/propiedades/" "$LOCS" | head -4)
mapfile -t -O "${#sample[@]}" sample < <(grep "$BASE/blog/" "$LOCS" | head -3)
mapfile -t -O "${#sample[@]}" sample < <(grep "$BASE/emprendimientos/" "$LOCS" | head -2)
sample+=("$BASE/guia" "$BASE/informes" "$BASE/barrios-privados")
sample_fail=0
for u in "${sample[@]}"; do
  c="$(code_of "$u")"
  [[ "$c" == "200" ]] || { fail "MUESTRA: $u → $c"; sample_fail=1; }
done
[[ $sample_fail -eq 0 ]] && ok "MUESTRA: ${#sample[@]} URLs del sitemap responden 200"

# 6. NOINDEX en páginas públicas (crítico)
blog_post="$(grep "$BASE/blog/" "$LOCS" | head -1)"
public=("$BASE/" "$BASE/propiedades" "$BASE/blog" "$BASE/casas-en-venta-funes")
[[ -n "$blog_post" ]] && public+=("$blog_post")
noindex_fail=0
for u in "${public[@]}"; do
  f="$TMP/$(echo "$u" | md5sum | cut -c1-12).html"
  c="$(code_of "$u" "$f")"
  if [[ "$c" != "200" ]]; then
    fail "NOINDEX: no pude leer $u ($c)"; noindex_fail=1
  elif grep -qi '<meta name="robots" content="noindex' "$f"; then
    fail "NOINDEX: CRÍTICO — $u es pública y tiene meta robots noindex (desaparece del índice)"; noindex_fail=1
  fi
done
[[ $noindex_fail -eq 0 ]] && ok "NOINDEX público: ninguna de ${#public[@]} páginas públicas tiene noindex"

# 7. NOINDEX en zona privada
c="$(code_of "$BASE/agentes/login" "$TMP/login.html")"
if [[ "$c" == "200" ]] && grep -qi '<meta name="robots" content="noindex' "$TMP/login.html"; then
  ok "NOINDEX privado: /agentes/login tiene noindex"
else
  fail "NOINDEX privado: /agentes/login ($c) no tiene meta robots noindex — el login podría indexarse"
fi

# 8. CANONICAL
canon_fail=0
for u in "$BASE/" ${blog_post:+"$blog_post"}; do
  f="$TMP/$(echo "$u" | md5sum | cut -c1-12).html"
  [[ -s "$f" ]] || code_of "$u" "$f" > /dev/null
  grep -q '<link rel="canonical"' "$f" || { fail "CANONICAL: $u no tiene <link rel=\"canonical\">"; canon_fail=1; }
done
[[ $canon_fail -eq 0 ]] && ok "CANONICAL: home y post del blog tienen canonical"

# 9. LLMS.TXT (GEO)
code="$(code_of "$BASE/llms.txt" "$TMP/llms.txt")"
if [[ "$code" != "200" ]]; then
  fail "LLMS.TXT: esperaba 200, recibí $code — las IA pierden el índice del sitio"
else
  llms_fail=0; n=0
  while IFS= read -r u; do
    n=$((n + 1))
    c="$(code_of "$u")"
    [[ "$c" == "200" ]] || { fail "LLMS.TXT: link muerto $u → $c (las IA que lo usan como índice ven contenido roto)"; llms_fail=1; }
  done < <(grep -oE '\]\(https?://[^)]+\)' "$TMP/llms.txt" | sed -E 's/^\]\((.*)\)$/\1/' | sort -u)
  [[ $llms_fail -eq 0 ]] && ok "LLMS.TXT: 200, los $n links responden 200"
fi

# Reporte
if [[ -n "${REPORT_FILE:-}" ]]; then
  {
    if (( FAILS > 0 )); then
      echo "**$FAILS chequeo(s) fallaron** contra $BASE el $(date -u +'%Y-%m-%d %H:%M UTC')."
    else
      echo "Todos los chequeos pasaron contra $BASE el $(date -u +'%Y-%m-%d %H:%M UTC')."
    fi
    echo
    printf -- '- %s\n' "${RESULTS[@]}"
  } > "$REPORT_FILE"
fi

echo
if (( FAILS > 0 )); then
  echo "RESULTADO: $FAILS fallo(s)" >&2
  exit 1
fi
echo "RESULTADO: todo OK"
