#!/usr/bin/env python3
"""Apply Starter Story UI updates to HTML files."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

NEW_HEAD_LINKS = """<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/site.css">
  <link rel="stylesheet" href="css/popup.css">"""

INDEX_HERO = """<!-- Site header -->
    <header class="site-header">
        <motion.div class="container site-header-inner">
            <a href="index.html" class="brand">
                <img src="https://pub-e15e2775d3f24830848d85fb53d029c8.r2.dev/ducking_gravity_new_logo.png" alt="Ducking Gravity" class="logo-mark">
            </a>
            <nav class="site-nav" aria-label="Main navigation">
                <ul class="nav-menu">
                            <li><a href="#about">About</a></li>
                            <li><a href="#services">Programs</a></li>
                            <li class="nav-dropdown">
                                <a href="#">Classes</a>
                                <ul class="nav-dropdown-menu">
                                    <li><a href="silks.html">Silks</a></li>
                                    <li><a href="lyra.html">Lyra (Aerial Hoop)</a></li>
                                    <li><a href="mixed-apparatus.html">Mixed Apparatus</a></li>
                                    <li><a href="homeschool.html">Homeschool</a></li>
                                    <li><a href="juniors.html">Junior Aerials</a></li>
                                    <li><a href="yoga.html">Yoga</a></li>
                                </ul>
                            </li>
                            <li class="nav-mobile-item"><a href="silks.html">Silks</a></li>
                            <li class="nav-mobile-item"><a href="lyra.html">Lyra (Aerial Hoop)</a></li>
                            <li class="nav-mobile-item"><a href="mixed-apparatus.html">Mixed Apparatus</a></li>
                            <li class="nav-mobile-item"><a href="homeschool.html">Homeschool</a></li>
                            <li class="nav-mobile-item"><a href="juniors.html">Junior Aerials</a></li>
                            <li class="nav-mobile-item"><a href="yoga.html">Yoga</a></li>
                            <li class="nav-dropdown">
                                <a href="#">Schedule</a>
                                <ul class="nav-dropdown-menu">
                            <li><a href="events.html">Camps &amp; Events</a></li>
                                    <li><a href="summercamps.html">Summer Camps</a></li>
                                    <li><a href="https://smartastro.app/calendar" target="_blank">Calendar</a></li>
                                </ul>
                            </li>
                            <li class="nav-mobile-item"><a href="events.html">Camps &amp; Events</a></li>
                            <li class="nav-mobile-item"><a href="summercamps.html">Summer Camps</a></li>
                            <li class="nav-mobile-item"><a href="https://smartastro.app/calendar" target="_blank">Calendar</a></li>
                            <li><a href="birthday.html">Birthday Parties</a></li>
                            <li><a href="memberships.html">Memberships</a></li>
                            <li><a href="https://buy.stripe.com/4gwdR52l0gGa1UsdQR" target="_blank" rel="noopener">Pay</a></li>
                        </ul>
            </nav>
            <a href="https://smartastro.app/calendar" target="_blank" class="cta-button nav-cta">Book a class</a>
        </div>
    </header>

    <section class="trust-strip">
        <div class="container trust-strip-inner">
            <span><strong>Culpeper, VA</strong> aerial arts studio</span>
            <span>Ages 3+ welcome</span>
            <span>Silks · Lyra · Yoga · Camps</span>
        </div>
    </section>

    <!-- Hero -->
    <section class="hero">
        <div class="container hero-inner">
            <div class="hero-copy">
                <p class="hero-eyebrow">Inclusive aerial community</p>
                <h1>Take flight with confidence</h1>
                <p class="hero-lead">Whether you are brand new to aerials or refining advanced skills, Ducking Gravity meets you where you are—with expert coaching and a supportive studio in Culpeper.</p>
                <div class="hero-actions">
                    <a href="https://smartastro.app/calendar" target="_blank" class="cta-button">View calendar</a>
                    <a href="#services" class="btn-secondary">Explore programs</a>
                </div>
            </div>
            <div class="hero-media">
                <img src="https://pub-e15e2775d3f24830848d85fb53d029c8.r2.dev/silks_outside_view.jpg" alt="Ducking Gravity aerial studio exterior">
            </div>
        </div>
    </section>""".replace("<motion.div", "<div")

PAGE_HEADER = """<header class="page-header">
        <div class="container page-header-inner">
            <a href="index.html" class="brand"><img src="https://pub-e15e2775d3f24830848d85fb53d029c8.r2.dev/ducking_gravity_new_logo.png" alt="Ducking Gravity" class="logo-mark"></a>
            <a href="index.html" class="back-link">&larr; Back to Main Site</a>
        </div>
    </header>"""


def strip_inline_styles(html: str) -> str:
    return re.sub(
        r'<link href="https://fonts\.googleapis\.com/css2\?family=Inter[^"]+" rel="stylesheet">\s*<style>.*?</style>',
        '<link rel="stylesheet" href="css/pages.css">',
        html,
        count=1,
        flags=re.DOTALL,
    )


def update_index():
    path = ROOT / "index.html"
    text = path.read_text(encoding="utf-8")
    text = re.sub(
        r'<link href="https://fonts\.googleapis\.com/css2\?family=Inter[^"]+" rel="stylesheet">\s*<style>.*?</style>',
        NEW_HEAD_LINKS,
        text,
        count=1,
        flags=re.DOTALL,
    )
    text = re.sub(
        r"<!-- Hero Section -->.*?</section>",
        INDEX_HERO,
        text,
        count=1,
        flags=re.DOTALL,
    )
    replacements = [
        (
            '<section id="about" class="section">\n                <h2 class="section-title">Ready to Take Flight?</h2>',
            '<section id="about" class="section">\n                <motion.div class="section-header">\n                    <p class="section-eyebrow">About us</p>\n                    <h2 class="section-title">Ready to take flight?</h2>\n                    <p class="section-desc">An inclusive aerial community in Culpeper, built for every body and every level.</p>\n                </div>',
        ),
        (
            '<section id="services" class="section">\n                <h2 class="section-title">What We Offer</h2>',
            '<section id="services" class="section">\n                <div class="section-header">\n                    <p class="section-eyebrow">Programs</p>\n                    <h2 class="section-title">What we offer</h2>\n                    <p class="section-desc">Classes, camps, parties, and more—all in one welcoming studio.</p>\n                </div>',
        ),
        (
            '<section id="pricing" class="section">\n                <h2 class="section-title">Pricing & Membership</h2>',
            '<section id="pricing" class="section">\n                <div class="section-header">\n                    <p class="section-eyebrow">Pricing</p>\n                    <h2 class="section-title">Membership &amp; drop-ins</h2>\n                    <p class="section-desc">Flexible options for regular flyers and occasional visitors.</p>\n                </div>',
        ),
        (
            '<section id="contact" class="contact-section">\n                <div class="container">\n                    <h2 class="section-title">Get In Touch</h2>',
            '<section id="contact" class="contact-section">\n                <div class="container">\n                    <div class="section-header">\n                        <p class="section-eyebrow">Contact</p>\n                        <h2 class="section-title">Get in touch</h2>\n                    </div>',
        ),
    ]
    for old, new in replacements:
        new = new.replace("<motion.div", "<div")
        text = text.replace(old, new)

    text = text.replace(
        "const header = document.querySelector('header');",
        "const header = document.querySelector('.site-header');",
    )
    text = text.replace(
        "const dropdown = document.querySelector('.nav-dropdown');",
        "document.querySelectorAll('.nav-dropdown').forEach(function(dropdown) {",
    )
    old_dropdown_block = """        if (dropdown) {
            const dropdownLink = dropdown.querySelector('a');
            
            // Handle click/tap on all screen sizes
            dropdownLink.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                dropdown.classList.toggle('active');
            });
            
            // Close dropdown when clicking outside on all screen sizes
            document.addEventListener('click', function(e) {
                if (dropdown.classList.contains('active') && !dropdown.contains(e.target)) {
                    dropdown.classList.remove('active');
                }
            });
            
            // Also handle clicks on dropdown menu items to close after selection
            const dropdownItems = dropdown.querySelectorAll('.nav-dropdown-menu a');
            dropdownItems.forEach(item => {
                item.addEventListener('click', function() {
                    setTimeout(() => {
                        dropdown.classList.remove('active');
                    }, 100);
                });
            });
        }"""
    new_dropdown_block = """        const dropdownLink = dropdown.querySelector(':scope > a');
            if (!dropdownLink) return;
            dropdownLink.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                dropdown.classList.toggle('active');
            });
            document.addEventListener('click', function(e) {
                if (dropdown.classList.contains('active') && !dropdown.contains(e.target)) {
                    dropdown.classList.remove('active');
                }
            });
            dropdown.querySelectorAll('.nav-dropdown-menu a').forEach(item => {
                item.addEventListener('click', function() {
                    setTimeout(() => dropdown.classList.remove('active'), 100);
                });
            });
        });"""
    text = text.replace(old_dropdown_block, new_dropdown_block)

    path.write_text(text, encoding="utf-8")
    print("Updated index.html")


def update_subpage(path: Path):
    text = path.read_text(encoding="utf-8")
    if "<style>" not in text:
        return
    text = strip_inline_styles(text)
    text = re.sub(
        r"<header>\s*<a href=\"index\.html\"><img[^>]+class=\"logo\"[^>]*></a>\s*<div>\s*<a href=\"index\.html\" class=\"back-link\">[^<]+</a>\s*</motion.div>\s*</header>",
        PAGE_HEADER,
        text,
        count=1,
        flags=re.DOTALL,
    )
    text = re.sub(
        r"<header>\s*<a href=\"index\.html\"><img[^>]+class=\"logo\"[^>]*></a>\s*<div>\s*<a href=\"index\.html\" class=\"back-link\">[^<]+</a>\s*</div>\s*</header>",
        PAGE_HEADER,
        text,
        count=1,
        flags=re.DOTALL,
    )
    text = re.sub(
        r'<div class="container">\s*<h1>([^<]+)</h1>\s*</div>',
        r'<div class="page-hero"><div class="container"><h1>\1</h1></div></div>',
        text,
        count=1,
    )
    path.write_text(text, encoding="utf-8")
    print(f"Updated {path.name}")


def main():
    update_index()
    for name in [
        "silks.html",
        "lyra.html",
        "mixed-apparatus.html",
        "homeschool.html",
        "juniors.html",
        "yoga.html",
        "events.html",
        "summercamps.html",
        "summer-camps.html",
        "birthday.html",
        "birthday-parties.html",
        "memberships.html",
        "404.html",
    ]:
        p = ROOT / name
        if p.exists():
            update_subpage(p)


if __name__ == "__main__":
    main()
