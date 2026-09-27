import re
from pathlib import Path

from mitmproxy import ctx, http


RULES = [
    (
        re.compile(
            r"^/webpack-artifacts/assets/figma_app(?:_beta|__react_profile)?"
            r"(?:__rspack)?-[a-f0-9]+\.min\.en\.json(?:\.br)?$"
        ),
        "https://kailous.github.io/figma-zh-CN-localized/lang/zh.json",
    ),
    (
        re.compile(
            r"^/webpack-artifacts/assets/auth_iframe(?:__rspack)?-"
            r"[a-f0-9]+\.min\.en\.json(?:\.br)?$"
        ),
        "https://kailous.github.io/figma-zh-CN-localized/lang/auth_iframe-zh.json",
    ),
    (
        re.compile(
            r"^/webpack-artifacts/assets/community(?:__rspack)?-"
            r"[a-f0-9]+\.min\.en\.json(?:\.br)?$"
        ),
        "https://kailous.github.io/figma-zh-CN-localized/lang/community-zh.json",
    ),
]
HIT_LOG = Path(__file__).with_name("figcn-hits.log")


def request(flow: http.HTTPFlow) -> None:
    if (flow.request.host or "").lower() != "www.figma.com":
        return
    for pattern, replacement in RULES:
        if pattern.match(flow.request.path or ""):
            original = flow.request.url
            flow.request.url = replacement
            with HIT_LOG.open("a", encoding="utf-8") as log:
                print(f"{original} -> {replacement}", file=log, flush=True)
            ctx.log.info(f"[FigCN] redirect: {original} -> {replacement}")
            return
