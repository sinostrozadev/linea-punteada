# Cómo se envía un pedido de carátula a GPT (skill `caratulas-con-gpt`)

Enviar = copiar el archivo PEDIDO-*.md a `contenido/urgente/` del repo sinostrozadev/entender-chile (main). Eso
despierta la tarea de ChatGPT de Santiago y gasta una imagen del generador, así que el primer envío lo autoriza él.

    F=salida/caratulas/pedidos/PEDIDO-linea-punteada-bushby-serie.md
    gh api -X PUT repos/sinostrozadev/entender-chile/contents/contenido/urgente/$(basename $F) \
      -f message="pedido imagen externo: linea-punteada bushby-serie" -f content="$(base64 -w0 $F)"

Luego (1–5 min, hasta 30):

    URL=https://raw.githubusercontent.com/sinostrozadev/entender-chile/main/contenido/caratulas/externos/linea-punteada/2026-11-06-bushby-serie.png
    curl -sfL -o salida/caratulas/bushby-serie.png "$URL" && tail -c 12 salida/caratulas/bushby-serie.png | xxd | grep -q IEND && echo PNG_OK
