#!/usr/bin/env python3
"""Micro Council - assemble, save and reuse role-played advisory council prompts.

Standard library only. The council catalogue (members, settings) and the prompt
template live in ../assets/, so this script works from any working directory.
"""

from __future__ import annotations

import argparse
import json
import math
import os
import random
import re
import sys
import unicodedata
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, NoReturn

SKILL_DIR = Path(__file__).resolve().parent.parent
ASSETS_DIR = SKILL_DIR / "assets"

SCHEMA_VERSION = 1
USERNAME_FALLBACK = "l'utilisateur"
# BPE tokenisers split French around 3.6 characters per token - indicative only.
CHARS_PER_TOKEN = 3.6


# --------------------------------------------------------------------------- io


def die(message: str) -> NoReturn:
    print(f"microcouncil: {message}", file=sys.stderr)
    raise SystemExit(2)


def use_utf8() -> None:
    """French text and emoji must survive a legacy Windows console codepage.

    `newline` is pinned too: without it Windows turns every `\\n` into `\\r\\n`, and the
    prompt would no longer be byte-for-byte the one the web app produces.
    """
    for stream in (sys.stdout, sys.stderr):
        reconfigure = getattr(stream, "reconfigure", None)
        if reconfigure is not None:
            try:
                reconfigure(encoding="utf-8", newline="\n")
            except (ValueError, OSError):
                pass


def write_text(path: Path, content: str, label: str) -> None:
    """Write UTF-8 with LF endings, whatever the platform's default may be."""
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
        with open(path, "w", encoding="utf-8", newline="\n") as handle:
            handle.write(content)
    except OSError as error:
        die(f"cannot write {label} to {path}: {error}")


def read_text(path: Path, label: str) -> str:
    try:
        return path.read_text(encoding="utf-8")
    except FileNotFoundError:
        die(f"missing {label}: {path}")
    except OSError as error:
        die(f"cannot read {label} ({path}): {error}")


def read_json(path: Path, label: str) -> Any:
    try:
        return json.loads(read_text(path, label))
    except json.JSONDecodeError as error:
        die(f"invalid JSON in {label} ({path}): {error}")


# ------------------------------------------------------------------------ slugs


def slugify(value: str) -> str:
    """`Le salon de the` -> `le-salon-de-the`. Must match the repository builder."""
    decomposed = unicodedata.normalize("NFD", value)
    stripped = "".join(char for char in decomposed if not unicodedata.combining(char))
    return re.sub(r"[^a-z0-9]+", "-", stripped.lower()).strip("-")


def resolve(token: str, entries: list[dict], label: str, title_key: str) -> dict:
    """Accept a slug, a display name, or an unambiguous prefix of either."""
    wanted = slugify(token)
    if not wanted:
        die(f"empty {label} reference")
    for entry in entries:
        if entry["slug"] == wanted or slugify(entry[title_key]) == wanted:
            return entry
    matches = [entry for entry in entries if entry["slug"].startswith(wanted)]
    if len(matches) == 1:
        return matches[0]
    if len(matches) > 1:
        names = ", ".join(match["slug"] for match in matches)
        die(f"ambiguous {label} {token!r}: matches {names}")
    listing = "members" if label == "member" else "environments"
    die(f"unknown {label} {token!r} - run `{listing}` to see the valid slugs")


# ---------------------------------------------------------------------- catalog


def load_members() -> list[dict]:
    return read_json(ASSETS_DIR / "members.json", "member catalogue")


def load_environments() -> list[dict]:
    return read_json(ASSETS_DIR / "environments.json", "environment catalogue")


def load_template() -> str:
    return read_text(ASSETS_DIR / "prompt.md", "prompt template").strip()


# --------------------------------------------------------------------- storage


def data_home() -> Path:
    """Per-user data directory, following each platform's own convention."""
    override = os.environ.get("MICROCOUNCIL_HOME")
    if override:
        return Path(override).expanduser()
    if sys.platform == "win32":
        base = os.environ.get("APPDATA")
        root = Path(base) if base else Path.home() / "AppData" / "Roaming"
        return root / "microcouncil"
    if sys.platform == "darwin":
        return Path.home() / "Library" / "Application Support" / "microcouncil"
    base = os.environ.get("XDG_DATA_HOME")
    root = Path(base) if base else Path.home() / ".local" / "share"
    return root / "microcouncil"


def councils_dir() -> Path:
    return data_home() / "councils"


def council_path(slug: str) -> Path:
    return councils_dir() / f"{slug}.json"


def stored_councils() -> list[dict]:
    directory = councils_dir()
    if not directory.is_dir():
        return []
    councils = []
    for path in sorted(directory.glob("*.json")):
        try:
            council = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            continue
        if isinstance(council, dict):
            council.setdefault("slug", path.stem)
            councils.append(council)
    return councils


def load_council(reference: str) -> dict:
    slug = slugify(reference)
    path = council_path(slug)
    if not path.is_file():
        stored = [entry["slug"] for entry in stored_councils()]
        matches = [candidate for candidate in stored if candidate.startswith(slug)]
        if len(matches) == 1:
            slug = matches[0]
            path = council_path(slug)
        elif len(matches) > 1:
            die(f"ambiguous council {reference!r}: matches {', '.join(matches)}")
        else:
            die(f"unknown council {reference!r} - run `councils` to see saved ones")
    council = read_json(path, "council configuration")
    if not isinstance(council, dict):
        die(f"council configuration is not an object: {path}")
    council.setdefault("slug", slug)
    return council


def now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")


# ------------------------------------------------------------------ prompt build


def render_member(member: dict) -> str:
    lines = [
        f"### {member['icon']} {member['name']}",
        f"{member['job']}. {member['description']}",
    ]
    traits = member.get("traits") or []
    if traits:
        lines.append("Personnalité : " + ", ".join(traits))
    return "\n".join(lines)


def render_environment(environment: dict) -> str:
    return f"### {environment['icon']} {environment['title']}\n{environment['description']}"


def fill(template: str, placeholder: str, value: str) -> str:
    """Literal substitution, so a value containing `$1` is never interpreted."""
    return value.join(template.split("{{" + placeholder + "}}"))


def drop_section(template: str, placeholder: str) -> str:
    """Remove the `##` section whose whole body is this placeholder.

    Runs before substitution, so user text can never be mistaken for a heading.
    """
    lines = template.split("\n")
    token = "{{" + placeholder + "}}"
    index = next((i for i, line in enumerate(lines) if line.strip() == token), -1)
    if index == -1:
        return template

    start = index
    while start > 0 and not lines[start].startswith("## "):
        start -= 1
    if not lines[start].startswith("## "):
        return template

    end = index + 1
    while end < len(lines) and lines[end].strip() == "":
        end += 1

    del lines[start:end]
    return "\n".join(lines)


def build_prompt(
    *,
    members: list[dict],
    environment: dict | None,
    username: str,
    custom_instructions: str,
    subject: str,
) -> str:
    resolved_username = username.strip() or USERNAME_FALLBACK
    custom = custom_instructions.strip()
    topic = subject.strip()

    rendered_members = (
        "\n\n".join(render_member(member) for member in members)
        if members
        else "_Aucun membre sélectionné._"
    )
    rendered_environment = (
        "_Aucun environnement sélectionné._"
        if environment is None
        else render_environment(environment)
    )

    output = load_template()
    if custom == "":
        output = drop_section(output, "custom")
    if topic == "":
        output = drop_section(output, "subject")

    output = fill(output, "membres", rendered_members)
    output = fill(output, "environment", rendered_environment)
    output = fill(output, "custom", custom)
    output = fill(output, "subject", topic)
    # Last: the name also appears inside member cards and the setting.
    output = fill(output, "username", resolved_username)

    return output.rstrip() + "\n"


# ------------------------------------------------------------------ arg helpers


def split_list(values: list[str]) -> list[str]:
    items: list[str] = []
    for value in values:
        for part in re.split(r"[,\n]", value):
            part = part.strip()
            if part:
                items.append(part)
    return items


def custom_text(args: argparse.Namespace) -> str | None:
    if args.custom is not None and args.custom_file is not None:
        die("use either --custom or --custom-file, not both")
    if args.custom_file is not None:
        return read_text(Path(args.custom_file).expanduser(), "custom instructions file")
    return args.custom


def subject_text(args: argparse.Namespace) -> str:
    if args.subject is not None and args.subject_file is not None:
        die("use either --subject or --subject-file, not both")
    if args.subject_file is not None:
        return read_text(Path(args.subject_file).expanduser(), "subject file")
    return args.subject or ""


def selected_members(tokens: list[str], catalog: list[dict]) -> list[dict]:
    chosen: list[dict] = []
    for token in tokens:
        member = resolve(token, catalog, "member", "name")
        if member not in chosen:
            chosen.append(member)
    return chosen


def council_members(council: dict, catalog: list[dict]) -> list[dict]:
    """Saved slugs that no longer exist are reported and skipped, not fatal."""
    by_slug = {member["slug"]: member for member in catalog}
    members: list[dict] = []
    for slug in council.get("members") or []:
        member = by_slug.get(slugify(str(slug)))
        if member is None:
            print(
                f"microcouncil: warning: member {slug!r} left the catalogue, skipped",
                file=sys.stderr,
            )
            continue
        if member not in members:
            members.append(member)
    return members


def council_environment(council: dict, catalog: list[dict]) -> dict | None:
    slug = council.get("environment")
    if not slug:
        return None
    for environment in catalog:
        if environment["slug"] == slugify(str(slug)):
            return environment
    print(
        f"microcouncil: warning: environment {slug!r} left the catalogue, ignored",
        file=sys.stderr,
    )
    return None


def emit(text: str, out: str | None, label: str) -> None:
    if out is None:
        sys.stdout.write(text)
        return
    path = Path(out).expanduser()
    write_text(path, text, label)
    print(f"{label} written to {path}")


def report_stats(text: str) -> None:
    tokens = math.ceil(len(text) / CHARS_PER_TOKEN)
    print(
        f"microcouncil: {len(text)} characters, ~{tokens} tokens (approximate)",
        file=sys.stderr,
    )


# --------------------------------------------------------------------- commands


def cmd_members(args: argparse.Namespace) -> None:
    members = load_members()
    if args.json:
        compact = [
            {"slug": m["slug"], "name": m["name"], "job": m["job"]} for m in members
        ]
        print(json.dumps(compact, ensure_ascii=False, indent=2))
        return
    print("slug | name | job")
    for member in members:
        print(f"{member['slug']} | {member['name']} | {member['job']}")


def cmd_environments(args: argparse.Namespace) -> None:
    environments = load_environments()
    if args.json:
        compact = [
            {"slug": e["slug"], "title": e["title"], "summary": e["summary"]}
            for e in environments
        ]
        print(json.dumps(compact, ensure_ascii=False, indent=2))
        return
    print("slug | title | summary")
    for environment in environments:
        print(f"{environment['slug']} | {environment['title']} | {environment['summary']}")


def cmd_random(args: argparse.Namespace) -> None:
    members = load_members()
    count = max(1, min(args.members, len(members)))
    generator = random.Random(args.seed)
    picked = generator.sample(members, count)
    picked.sort(key=members.index)
    print("members: " + ",".join(member["slug"] for member in picked))
    if args.environment:
        print("environment: " + generator.choice(load_environments())["slug"])


def cmd_save(args: argparse.Namespace) -> None:
    catalog = load_members()
    environments = load_environments()

    tokens = split_list(args.members)
    if not tokens:
        die("a council needs at least one --members entry")
    members = selected_members(tokens, catalog)

    environment = None
    if args.environment:
        environment = resolve(args.environment, environments, "environment", "title")

    slug = slugify(args.slug or args.name)
    if not slug:
        die(f"council name {args.name!r} does not produce a usable file name")

    path = council_path(slug)
    created = now()
    if path.is_file():
        if not args.force:
            die(f"council {slug!r} already exists - pass --force to overwrite it")
        previous = read_json(path, "council configuration")
        if isinstance(previous, dict):
            created = previous.get("createdAt") or created

    custom = custom_text(args) or ""
    council = {
        "schemaVersion": SCHEMA_VERSION,
        "slug": slug,
        "name": args.name,
        "username": (args.username or "").strip(),
        "members": [member["slug"] for member in members],
        "environment": environment["slug"] if environment else None,
        "customInstructions": custom.strip(),
        "createdAt": created,
        "updatedAt": now(),
    }

    write_text(path, json.dumps(council, ensure_ascii=False, indent=2) + "\n", "council")

    print(f"saved council {slug!r} to {path}")

    subject = subject_text(args)
    if subject or args.print_prompt:
        prompt = build_prompt(
            members=members,
            environment=environment,
            username=council["username"],
            custom_instructions=council["customInstructions"],
            subject=subject,
        )
        if args.out is None:
            print()
        emit(prompt, args.out, "prompt")
        if args.stats:
            report_stats(prompt)


def cmd_councils(args: argparse.Namespace) -> None:
    councils = stored_councils()
    if args.json:
        print(json.dumps(councils, ensure_ascii=False, indent=2))
        return
    if not councils:
        print(f"no council saved yet (directory: {councils_dir()})")
        return
    print("slug | name | members | environment")
    for council in councils:
        members = ",".join(str(slug) for slug in council.get("members") or [])
        name = council.get("name") or council["slug"]
        print(f"{council['slug']} | {name} | {members or '-'} | {council.get('environment') or '-'}")


def cmd_show(args: argparse.Namespace) -> None:
    print(json.dumps(load_council(args.council), ensure_ascii=False, indent=2))


def cmd_delete(args: argparse.Namespace) -> None:
    council = load_council(args.council)
    path = council_path(council["slug"])
    if not args.yes:
        die(f"refusing to delete {path} without --yes")
    try:
        path.unlink()
    except OSError as error:
        die(f"cannot delete {path}: {error}")
    print(f"deleted council {council['slug']!r} ({path})")


def cmd_build(args: argparse.Namespace) -> None:
    catalog = load_members()
    environments = load_environments()

    tokens = split_list(args.members)
    override_custom = custom_text(args)

    if args.council:
        council = load_council(args.council)
        members = (
            selected_members(tokens, catalog) if tokens else council_members(council, catalog)
        )
        environment = (
            resolve(args.environment, environments, "environment", "title")
            if args.environment
            else council_environment(council, environments)
        )
        username = args.username if args.username is not None else council.get("username", "")
        custom = (
            override_custom
            if override_custom is not None
            else council.get("customInstructions", "")
        )
    else:
        if not tokens:
            die("pass --council <slug>, or --members to build a one-off council")
        members = selected_members(tokens, catalog)
        environment = (
            resolve(args.environment, environments, "environment", "title")
            if args.environment
            else None
        )
        username = args.username or ""
        custom = override_custom or ""

    prompt = build_prompt(
        members=members,
        environment=environment,
        username=username or "",
        custom_instructions=custom or "",
        subject=subject_text(args),
    )
    emit(prompt, args.out, "prompt")
    if args.stats:
        report_stats(prompt)


def cmd_custom_example(args: argparse.Namespace) -> None:
    print(read_text(ASSETS_DIR / "custom-example.md", "custom instructions example").strip())


def cmd_where(args: argparse.Namespace) -> None:
    """Handshake command: proves the caller resolved the skill directory correctly."""
    print(f"skill: {SKILL_DIR}")
    print(f"assets: {ASSETS_DIR}")
    print(f"councils: {councils_dir()}")
    # Touch the catalogue too, so a path that exists but is not this skill still fails.
    print(f"catalogue: {len(load_members())} members, {len(load_environments())} environments")
    saved = len(stored_councils())
    print(f"saved: {saved} council{'' if saved == 1 else 's'}")


# ------------------------------------------------------------------------- cli


def add_shape_flags(parser: argparse.ArgumentParser) -> None:
    parser.add_argument(
        "--members",
        action="append",
        default=[],
        metavar="SLUGS",
        help="comma separated member slugs; repeatable",
    )
    parser.add_argument("--environment", metavar="SLUG", help="setting slug")
    parser.add_argument("--username", metavar="NAME", help="how the council addresses the user")
    parser.add_argument("--custom", metavar="TEXT", help="extra standing instructions")
    parser.add_argument("--custom-file", metavar="PATH", help="read --custom from a file")


def add_subject_flags(parser: argparse.ArgumentParser) -> None:
    parser.add_argument("--subject", metavar="TEXT", help="the topic to discuss (never stored)")
    parser.add_argument("--subject-file", metavar="PATH", help="read --subject from a file")
    parser.add_argument("--out", metavar="PATH", help="write the prompt to a file instead of stdout")
    parser.add_argument("--stats", action="store_true", help="print a size estimate on stderr")


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="microcouncil",
        description="Assemble, save and reuse role-played advisory council prompts.",
    )
    sub = parser.add_subparsers(dest="command", required=True)

    members = sub.add_parser("members", help="list member slugs, names and jobs")
    members.add_argument("--json", action="store_true")
    members.set_defaults(handler=cmd_members)

    environments = sub.add_parser("environments", help="list setting slugs, titles and summaries")
    environments.add_argument("--json", action="store_true")
    environments.set_defaults(handler=cmd_environments)

    draw = sub.add_parser("random", help="draw a random roster")
    draw.add_argument("--members", type=int, default=4, metavar="N", help="how many members")
    draw.add_argument("--environment", action="store_true", help="also draw a setting")
    draw.add_argument("--seed", type=int, help="make the draw reproducible")
    draw.set_defaults(handler=cmd_random)

    save = sub.add_parser("save", help="create or update a council configuration")
    save.add_argument("--name", required=True, metavar="TEXT", help="human readable council name")
    save.add_argument("--slug", metavar="SLUG", help="override the derived file name")
    save.add_argument("--force", action="store_true", help="overwrite an existing council")
    save.add_argument("--print-prompt", action="store_true", help="also print the prompt")
    add_shape_flags(save)
    add_subject_flags(save)
    save.set_defaults(handler=cmd_save)

    councils = sub.add_parser("councils", help="list saved council configurations")
    councils.add_argument("--json", action="store_true")
    councils.set_defaults(handler=cmd_councils)

    show = sub.add_parser("show", help="print one saved council configuration")
    show.add_argument("council", metavar="SLUG")
    show.set_defaults(handler=cmd_show)

    delete = sub.add_parser("delete", help="delete a saved council configuration")
    delete.add_argument("council", metavar="SLUG")
    delete.add_argument("--yes", action="store_true", help="required confirmation")
    delete.set_defaults(handler=cmd_delete)

    build = sub.add_parser("build", help="print the council prompt")
    build.add_argument("--council", metavar="SLUG", help="saved council to load")
    add_shape_flags(build)
    add_subject_flags(build)
    build.set_defaults(handler=cmd_build)

    example = sub.add_parser("custom-example", help="print an example of extra instructions")
    example.set_defaults(handler=cmd_custom_example)

    where = sub.add_parser("where", help="print the skill and storage directories")
    where.set_defaults(handler=cmd_where)

    return parser


def main(argv: list[str] | None = None) -> int:
    use_utf8()
    args = build_parser().parse_args(argv)
    args.handler(args)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except KeyboardInterrupt:
        raise SystemExit(130)
