from django.apps import AppConfig


class CoreConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.core"

    def ready(self) -> None:
        from django.contrib import admin

        admin.site.site_header = "Potatoka Portfolio CMS"
        admin.site.site_title = "Dota Portfolio Admin"
        admin.site.index_title = "Portfolio Dashboard"
