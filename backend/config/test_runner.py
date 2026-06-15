from __future__ import annotations

import unittest

from django.conf import settings
from django.test.runner import DiscoverRunner


class PortfolioDiscoverRunner(DiscoverRunner):
    """
    Ensure `python backend/manage.py test` discovers tests even when executed
    from the repository root (where `os.getcwd()` would otherwise exclude the
    `backend/` package tree from discovery).
    """

    def build_suite(self, test_labels=None, extra_tests=None, **kwargs):
        if test_labels:
            return super().build_suite(test_labels=test_labels, extra_tests=extra_tests, **kwargs)

        start_dir = str(settings.BASE_DIR)
        top_level = str(settings.BASE_DIR)
        suite = unittest.defaultTestLoader.discover(start_dir=start_dir, pattern="test*.py", top_level_dir=top_level)
        if extra_tests:
            for test in extra_tests:
                suite.addTests(test)
        return suite

