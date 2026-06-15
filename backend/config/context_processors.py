from __future__ import annotations

import json


def seo_defaults(request):
    """
    Conservative defaults to preserve current SEO metadata behavior without
    modifying the React build.
    """
    canonical_url = request.build_absolute_uri(request.path)
    meta_title = "Bigendra Shrestha (potatoka) | Python, Django & Data Science Engineer"
    meta_description = (
        "Portfolio of Bigendra Shrestha (potatoka), an IT Professional specializing in Python backend engineering, "
        "Django web systems, and Predictive Data Science analytics."
    )

    structured_data = {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "Bigendra Shrestha",
        "additionalName": "potatoka",
        "jobTitle": "Data Scientist & Django Developer",
        "url": request.build_absolute_uri("/"),
        "sameAs": [
            "https://github.com",
            "https://linkedin.com",
        ],
        "knowsAbout": ["Python", "Django", "Data Science", "PostgreSQL", "Machine Learning"],
    }

    return {
        "CANONICAL_URL": canonical_url,
        "META_TITLE": meta_title,
        "META_DESCRIPTION": meta_description,
        # Use an actually-present asset to avoid broken social previews.
        "OG_IMAGE_URL": request.build_absolute_uri("/static/images/potatoka_profile.png"),
        "STRUCTURED_DATA_JSON": json.dumps(structured_data),
    }
