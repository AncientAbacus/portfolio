"""Sync resume/index.html and index.html with resume/source/resume.tex.

Rewrites the Experience and Skills blocks between the
<!-- RESUME:*:START --> / <!-- RESUME:*:END --> markers. Each role keeps
its existing tag line (matched by company name), since the .tex has none.
"""
import html
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TEX = ROOT / "resume" / "source" / "resume.tex"
PAGE = ROOT / "resume" / "index.html"
HOME = ROOT / "index.html"


def braced(s, i):
    """Return (content, end) of the {...} group starting at s[i] == '{'."""
    assert s[i] == "{", s[i:i + 30]
    depth = 0
    for j in range(i, len(s)):
        if s[j] == "{":
            depth += 1
        elif s[j] == "}":
            depth -= 1
            if depth == 0:
                return s[i + 1:j], j + 1
    raise ValueError("unbalanced braces")


def args(s, i, n):
    out = []
    for _ in range(n):
        while s[i].isspace():
            i += 1
        a, i = braced(s, i)
        out.append(a)
    return out, i


def clean(t):
    t = re.sub(r"\\u\{(\w)\}", lambda m: {"g": "ğ", "G": "Ğ"}.get(m.group(1), m.group(1)), t)
    t = re.sub(r"\\(?:textbf|textit|emph|underline)\{([^{}]*)\}", r"\1", t)
    t = t.replace("\\&", "&").replace("\\%", "%").replace("\\$", "$")
    t = t.replace("\\ ", " ").replace("~", " ").replace("---", "—").replace("--", "–")
    t = t.replace("``", "“").replace("''", "”")
    t = re.sub(r"\s+", " ", t).strip()
    return html.escape(t, quote=False).replace("'", "’")


def section(tex, name):
    start = tex.index(r"\section{%s}" % name)
    nxt = tex.find(r"\section{", start + 1)
    return tex[start:nxt if nxt != -1 else len(tex)]


def parse_roles(tex):
    body = section(tex, "Experience")
    roles = []
    for m in re.finditer(r"\\resumeSubheading", body):
        (company, dates, position, location), end = args(body, m.end(), 4)
        stop = body.find(r"\resumeItemListEnd", end)
        items = []
        for im in re.finditer(r"\\resumeItem(?=\{)", body[end:stop]):
            text, _ = braced(body[end:stop], im.end())
            items.append(text)
        roles.append(dict(company=company, dates=dates, position=position,
                          location=location, items=items))
    return roles


def parse_skills(tex):
    body = section(tex, "Technical Skills")
    out = []
    for m in re.finditer(r"\\textbf\{([^{}]*)\}\{:\s*", body):
        val, _ = braced(body, m.end() - len(m.group(0)) + m.group(0).index("{:"))
        out.append((clean(m.group(1)), clean(val.lstrip(":"))))
    return out


def existing_tags(page):
    tags = {}
    for block in page.split('<div class="role">')[1:]:
        t = re.search(r'<h3 class="role__title">(.*?)</h3>', block)
        g = re.search(r'<p class="role__tags">(.*?)</p>', block)
        if not (t and g):
            continue
        tags[t.group(1).split(",")[-1].strip().lower()] = g.group(1)
        tags[t.group(1).strip().lower()] = g.group(1)
    return tags


def find_tags(tags, company, title):
    for key in (title.lower(), company.lower()):
        if key in tags:
            return tags[key]
    for k, v in tags.items():
        if company.lower().split(",")[0] in k:
            return v
    return None


def render_roles(roles, tags):
    out = []
    for r in roles:
        company = clean(r["company"])
        pos_main, _, pos_rest = clean(r["position"]).partition(", ")
        title = f"{pos_main}, {company}"
        badge = ""
        if any("1st place" in i.lower() and "\\textbf" in i for i in r["items"]):
            badge = ' <span class="role__badge">1st place</span>'
        sub = " · ".join(x for x in (pos_rest, clean(r["location"])) if x)
        text = " ".join(clean(i) for i in r["items"])
        tag = find_tags(tags, company, title)
        lines = [
            '                <div class="role">',
            '                    <div class="role__head">',
            f'                        <h3 class="role__title">{title}</h3>',
            f'                        <span class="role__meta">{clean(r["dates"])}{badge}</span>',
            '                    </div>',
            f'                    <p class="role__sub">{sub}</p>',
            f'                    <p>{text}</p>',
        ]
        if tag:
            lines.append(f'                    <p class="role__tags">{tag}</p>')
        lines.append('                </div>')
        out.append("\n".join(lines))
    return "\n".join(out)


def render_skills(skills):
    rows = []
    for label, val in skills:
        rows.append(f"                <div>\n                    <dt>{label}</dt>\n"
                    f"                    <dd>{val}</dd>\n                </div>")
    return "\n".join(rows)


def replace_block(page, name, content):
    pat = re.compile(r"(<!-- RESUME:%s:START -->\n).*?(\n\s*<!-- RESUME:%s:END -->)" % (name, name), re.S)
    if not pat.search(page):
        sys.exit(f"marker RESUME:{name} missing from {PAGE}")
    return pat.sub(lambda m: m.group(1) + content + m.group(2), page)


def main():
    tex = TEX.read_text()
    page = PAGE.read_text()
    page = replace_block(page, "EXPERIENCE", render_roles(parse_roles(tex), existing_tags(page)))
    page = replace_block(page, "SKILLS", render_skills(parse_skills(tex)))
    PAGE.write_text(page)
    home = HOME.read_text()
    home = replace_block(home, "EXPERIENCE", render_roles(parse_roles(tex), existing_tags(home)))
    HOME.write_text(home)
    print("resume/index.html and index.html synced from resume.tex")


if __name__ == "__main__":
    main()
